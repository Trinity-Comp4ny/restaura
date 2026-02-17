-- Migration: Corrigir trigger de parcelas para funcionar com despesas
-- Descrição: Atualiza o trigger gerar_parcelas_transacao para suportar tanto metodos_cobranca_id (receitas) quanto metodo_pagamento_id (despesas)

-- 1. Remover trigger existente
DROP TRIGGER IF EXISTS trigger_gerar_parcelas ON transacoes;

-- 2. Recriar função com suporte para ambos os métodos
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
  -- Suporta tanto metodos_cobranca (receitas) quanto metodos_pagamento (despesas)
  IF NEW.metodo_cobranca_id IS NOT NULL THEN
    SELECT tipo, prazo_deposito INTO v_metodo_tipo, v_prazo_deposito
    FROM metodos_cobranca WHERE id = NEW.metodo_cobranca_id;
  ELSIF NEW.metodo_pagamento_id IS NOT NULL THEN
    SELECT tipo, prazo_deposito INTO v_metodo_tipo, v_prazo_deposito
    FROM metodos_pagamento WHERE id = NEW.metodo_pagamento_id;
  ELSE
    v_metodo_tipo := NULL;
    v_prazo_deposito := 0;
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

-- 3. Recriar trigger
CREATE TRIGGER trigger_gerar_parcelas
  AFTER INSERT ON transacoes
  FOR EACH ROW
  EXECUTE FUNCTION gerar_parcelas_transacao();

-- 4. Comentário sobre a correção
COMMENT ON FUNCTION gerar_parcelas_transacao() IS 'Gera parcelas automaticamente para transações de receitas (metodos_cobranca_id) e despesas (metodo_pagamento_id)';
