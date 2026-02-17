-- ===========================================
-- MIGRATION 005: Tabela de Parcelas
-- ===========================================
-- Cria tabela dedicada para parcelas, com trigger para auto-geração
-- e integração com faturas de cartão de crédito.

-- ===========================================
-- 1. TABELA DE PARCELAS
-- ===========================================
CREATE TABLE IF NOT EXISTS parcelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  transacao_id UUID NOT NULL REFERENCES transacoes(id) ON DELETE CASCADE,
  
  -- Dados da parcela
  numero_parcela INTEGER NOT NULL,        -- 1, 2, 3...
  total_parcelas INTEGER NOT NULL,        -- Total de parcelas do parcelamento
  valor NUMERIC(10,2) NOT NULL,           -- Valor desta parcela
  
  -- Datas
  data_vencimento DATE NOT NULL,          -- Quando vence esta parcela
  data_pagamento DATE,                    -- Quando foi paga (NULL = não paga)
  data_credito_prevista DATE,             -- Quando o dinheiro entra na conta
  
  -- Status individual da parcela
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  
  -- Integração com cartão de crédito
  fatura_cartao_id UUID REFERENCES faturas_cartao(id) ON DELETE SET NULL,
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 2. ÍNDICES
-- ===========================================
CREATE INDEX idx_parcelas_transacao ON parcelas(transacao_id);
CREATE INDEX idx_parcelas_clinica ON parcelas(clinica_id);
CREATE INDEX idx_parcelas_status ON parcelas(status);
CREATE INDEX idx_parcelas_vencimento ON parcelas(data_vencimento);
CREATE INDEX idx_parcelas_fatura ON parcelas(fatura_cartao_id) WHERE fatura_cartao_id IS NOT NULL;
CREATE INDEX idx_parcelas_transacao_numero ON parcelas(transacao_id, numero_parcela);

-- ===========================================
-- 4. TRIGGER: Atualizar atualizado_em
-- ===========================================
CREATE TRIGGER trigger_parcelas_atualizado_em
  BEFORE UPDATE ON parcelas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_atualizado_em();

-- ===========================================
-- 5. FUNÇÃO: Encontrar ou criar fatura do cartão
-- ===========================================
CREATE OR REPLACE FUNCTION encontrar_ou_criar_fatura(
  p_cartao_id UUID,
  p_data_compra DATE
)
RETURNS UUID AS $$
DECLARE
  v_fatura_id UUID;
  v_dia_fechamento INTEGER;
  v_dia_vencimento INTEGER;
  v_conta_fatura_id UUID;
  v_mes_referencia DATE;
  v_data_fechamento DATE;
  v_data_vencimento DATE;
BEGIN
  -- Buscar dados do cartão
  SELECT dia_fechamento, dia_vencimento, conta_fatura_id
  INTO v_dia_fechamento, v_dia_vencimento, v_conta_fatura_id
  FROM cartoes WHERE id = p_cartao_id;
  
  -- Se não tem dados de fechamento, retorna NULL
  IF v_dia_fechamento IS NULL OR v_dia_vencimento IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calcular mês de referência da fatura
  -- Se a compra é antes do fechamento, cai na fatura do mês atual
  -- Se é depois do fechamento, cai na fatura do próximo mês
  IF EXTRACT(DAY FROM p_data_compra) <= v_dia_fechamento THEN
    v_mes_referencia := DATE_TRUNC('month', p_data_compra);
  ELSE
    v_mes_referencia := DATE_TRUNC('month', p_data_compra) + INTERVAL '1 month';
  END IF;
  
  v_data_fechamento := v_mes_referencia + (v_dia_fechamento - 1) * INTERVAL '1 day';
  v_data_vencimento := v_mes_referencia + (v_dia_vencimento - 1) * INTERVAL '1 day';
  
  -- Buscar fatura existente
  SELECT id INTO v_fatura_id
  FROM faturas_cartao
  WHERE cartao_id = p_cartao_id
    AND mes_referencia = v_mes_referencia;
  
  -- Se não existe, criar
  IF v_fatura_id IS NULL THEN
    INSERT INTO faturas_cartao (
      cartao_id, conta_bancaria_id, mes_referencia,
      data_vencimento, data_fechamento, status
    ) VALUES (
      p_cartao_id,
      COALESCE(v_conta_fatura_id, (
        SELECT id FROM contas_bancarias 
        WHERE clinica_id = (SELECT clinica_id FROM cartoes WHERE id = p_cartao_id)
        AND is_padrao = true LIMIT 1
      )),
      v_mes_referencia,
      v_data_vencimento,
      v_data_fechamento,
      'aberta'
    )
    RETURNING id INTO v_fatura_id;
  END IF;
  
  RETURN v_fatura_id;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 6. FUNÇÃO: Gerar parcelas automaticamente
-- ===========================================
CREATE OR REPLACE FUNCTION gerar_parcelas_transacao()
RETURNS TRIGGER AS $$
DECLARE
  v_num_parcelas INTEGER;
  v_valor_parcela NUMERIC(10,2);
  v_valor_restante NUMERIC(10,2);
  v_data_vencimento DATE;
  v_data_base DATE;
  v_fatura_id UUID;
  v_cartao_id UUID;
  v_metodo_tipo TEXT;
  v_prazo_deposito INTEGER;
  i INTEGER;
BEGIN
  v_num_parcelas := COALESCE(NEW.total_parcelas, 1);
  
  -- Calcular valor de cada parcela (distribuir centavos na última)
  v_valor_parcela := TRUNC(NEW.valor_bruto / v_num_parcelas, 2);
  v_valor_restante := NEW.valor_bruto - (v_valor_parcela * (v_num_parcelas - 1));
  
  -- Data base para vencimentos (usar data_vencimento da transação como base)
  v_data_base := COALESCE(NEW.data_vencimento, CURRENT_DATE);
  
  -- Verificar se é cartão de crédito (para vincular faturas)
  v_cartao_id := NEW.cartao_id;
  
  -- Buscar tipo do método e prazo de depósito
  -- Tenta metodos_cobranca primeiro, depois metodos_pagamento como fallback
  IF NEW.metodo_cobranca_id IS NOT NULL THEN
    BEGIN
      SELECT tipo, prazo_deposito INTO v_metodo_tipo, v_prazo_deposito
      FROM metodos_cobranca WHERE id = NEW.metodo_cobranca_id;
    EXCEPTION WHEN undefined_table THEN
      -- Fallback: tenta metodos_pagamento
      BEGIN
        SELECT tipo, prazo_deposito INTO v_metodo_tipo, v_prazo_deposito
        FROM metodos_pagamento WHERE id = NEW.metodo_cobranca_id;
      EXCEPTION WHEN undefined_table THEN
        v_metodo_tipo := NULL;
        v_prazo_deposito := 0;
      END;
    END;
  END IF;
  
  v_prazo_deposito := COALESCE(v_prazo_deposito, 0);
  
  -- Gerar cada parcela
  FOR i IN 1..v_num_parcelas LOOP
    -- Calcular data de vencimento (mensal a partir da data base)
    v_data_vencimento := v_data_base + ((i - 1) * INTERVAL '1 month');
    
    -- Para cartão de crédito, vincular à fatura correta
    v_fatura_id := NULL;
    IF v_cartao_id IS NOT NULL AND v_metodo_tipo = 'cartao_credito' THEN
      v_fatura_id := encontrar_ou_criar_fatura(v_cartao_id, v_data_vencimento);
    END IF;
    
    INSERT INTO parcelas (
      clinica_id,
      transacao_id,
      numero_parcela,
      total_parcelas,
      valor,
      data_vencimento,
      data_pagamento,
      data_credito_prevista,
      status,
      fatura_cartao_id
    ) VALUES (
      NEW.clinica_id,
      NEW.id,
      i,
      v_num_parcelas,
      CASE WHEN i = v_num_parcelas THEN v_valor_restante ELSE v_valor_parcela END,
      v_data_vencimento,
      -- Se a transação já está paga e é parcela única, marcar como paga
      CASE WHEN NEW.status = 'pago' AND v_num_parcelas = 1 THEN COALESCE(NEW.data_pagamento, CURRENT_DATE) ELSE NULL END,
      -- Previsão de crédito = vencimento + prazo do método
      v_data_vencimento + (v_prazo_deposito * INTERVAL '1 day'),
      -- Status: se transação paga e parcela única, marcar paga
      CASE WHEN NEW.status = 'pago' AND v_num_parcelas = 1 THEN 'pago' ELSE 'pendente' END,
      v_fatura_id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: gerar parcelas após inserir transação
CREATE TRIGGER trigger_gerar_parcelas
  AFTER INSERT ON transacoes
  FOR EACH ROW
  EXECUTE FUNCTION gerar_parcelas_transacao();

-- ===========================================
-- 7. FUNÇÃO: Atualizar status da transação baseado nas parcelas
-- ===========================================
CREATE OR REPLACE FUNCTION atualizar_status_transacao()
RETURNS TRIGGER AS $$
DECLARE
  v_total INTEGER;
  v_pagas INTEGER;
  v_canceladas INTEGER;
BEGIN
  -- Contar parcelas
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'pago'),
    COUNT(*) FILTER (WHERE status = 'cancelado')
  INTO v_total, v_pagas, v_canceladas
  FROM parcelas
  WHERE transacao_id = NEW.transacao_id;
  
  -- Atualizar status da transação pai
  IF v_pagas = v_total THEN
    -- Todas pagas
    UPDATE transacoes SET status = 'pago', data_pagamento = NEW.data_pagamento
    WHERE id = NEW.transacao_id AND status != 'pago';
  ELSIF v_canceladas = v_total THEN
    -- Todas canceladas
    UPDATE transacoes SET status = 'cancelado'
    WHERE id = NEW.transacao_id;
  ELSIF v_pagas > 0 THEN
    -- Parcialmente pago - manter como pendente
    UPDATE transacoes SET status = 'pendente'
    WHERE id = NEW.transacao_id AND status NOT IN ('pendente');
  END IF;
  
  -- Atualizar valor_aberto da fatura se vinculada
  IF NEW.fatura_cartao_id IS NOT NULL THEN
    UPDATE faturas_cartao 
    SET valor_aberto = (
      SELECT COALESCE(SUM(valor), 0)
      FROM parcelas 
      WHERE fatura_cartao_id = NEW.fatura_cartao_id
      AND status NOT IN ('pago', 'cancelado')
    ),
    valor_pago = (
      SELECT COALESCE(SUM(valor), 0)
      FROM parcelas 
      WHERE fatura_cartao_id = NEW.fatura_cartao_id
      AND status = 'pago'
    ),
    atualizado_em = NOW()
    WHERE id = NEW.fatura_cartao_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: atualizar transação quando parcela muda
CREATE TRIGGER trigger_atualizar_status_transacao
  AFTER UPDATE ON parcelas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_transacao();

-- ===========================================
-- 8. FUNÇÃO: Marcar parcelas vencidas automaticamente
-- ===========================================
CREATE OR REPLACE FUNCTION marcar_parcelas_vencidas()
RETURNS void AS $$
BEGIN
  UPDATE parcelas
  SET status = 'vencido', atualizado_em = NOW()
  WHERE status = 'pendente'
    AND data_vencimento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 9. VIEW: Resumo de parcelas por transação
-- ===========================================
CREATE OR REPLACE VIEW vw_parcelas_resumo AS
SELECT 
  t.id as transacao_id,
  t.clinica_id,
  t.descricao,
  t.valor_bruto,
  t.tipo,
  t.total_parcelas,
  COUNT(p.id) as parcelas_geradas,
  COUNT(p.id) FILTER (WHERE p.status = 'pago') as parcelas_pagas,
  COUNT(p.id) FILTER (WHERE p.status = 'pendente') as parcelas_pendentes,
  COUNT(p.id) FILTER (WHERE p.status = 'vencido') as parcelas_vencidas,
  COALESCE(SUM(p.valor) FILTER (WHERE p.status = 'pago'), 0) as valor_pago,
  COALESCE(SUM(p.valor) FILTER (WHERE p.status IN ('pendente', 'vencido')), 0) as valor_pendente,
  MIN(p.data_vencimento) FILTER (WHERE p.status IN ('pendente', 'vencido')) as proxima_data_vencimento
FROM transacoes t
LEFT JOIN parcelas p ON p.transacao_id = t.id
GROUP BY t.id, t.clinica_id, t.descricao, t.valor_bruto, t.tipo, t.total_parcelas;

-- ===========================================
-- 10. COMENTÁRIOS
-- ===========================================
COMMENT ON TABLE parcelas IS 'Parcelas individuais de transações parceladas';
COMMENT ON COLUMN parcelas.numero_parcela IS 'Número sequencial da parcela (1, 2, 3...)';
COMMENT ON COLUMN parcelas.valor IS 'Valor desta parcela individual';
COMMENT ON COLUMN parcelas.data_credito_prevista IS 'Data prevista para o crédito baseada no prazo do método';
COMMENT ON COLUMN parcelas.fatura_cartao_id IS 'Fatura do cartão de crédito onde esta parcela será cobrada';
