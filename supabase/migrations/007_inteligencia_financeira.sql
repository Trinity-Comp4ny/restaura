-- Migration: Implementar inteligência financeira avançada
-- Descrição: Adiciona lógica para status inteligente, multas, juros e tratamento de pagamentos atrasados

-- 1. Adicionar campos financeiros avançados na tabela parcelas
ALTER TABLE parcelas 
ADD COLUMN IF NOT EXISTS valor_multa NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_juros NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_desconto NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_corrigido NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS dias_atraso INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status_calculado TEXT DEFAULT 'pendente';

-- 2. Função para calcular multas e juros
CREATE OR REPLACE FUNCTION calcular_multas_juros(
  p_valor_original NUMERIC,
  p_data_vencimento DATE,
  p_data_pagamento DATE,
  p_taxa_multa_diaria NUMERIC DEFAULT 0.02, -- 2% ao dia
  p_taxa_juros_mensal NUMERIC DEFAULT 0.05 -- 5% ao mês
) RETURNS NUMERIC AS $$
DECLARE
  v_dias_atraso INTEGER;
  v_multa NUMERIC := 0;
  v_juros NUMERIC := 0;
BEGIN
  -- Se não houve pagamento ou foi em dia, não há multa/juros
  IF p_data_pagamento IS NULL OR p_data_pagamento <= p_data_vencimento THEN
    RETURN 0;
  END IF;
  
  -- Calcular dias de atraso
  v_dias_atraso := EXTRACT(DAY FROM (p_data_pagamento::date - p_data_vencimento::date));
  
  IF v_dias_atraso > 0 THEN
    -- Multa: 2% por dia de atraso (máximo 20%)
    v_multa := LEAST(p_valor_original * (p_taxa_multa_diaria * v_dias_atraso), p_valor_original * 0.20);
    
    -- Juros: 5% ao mês proporcional aos dias
    v_juros := p_valor_original * (p_taxa_juros_mensal * (v_dias_atraso / 30.0));
  END IF;
  
  RETURN v_multa + v_juros;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para atualizar campos dinâmicos da parcela
CREATE OR REPLACE FUNCTION atualizar_campos_parcela()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular dias de atraso
  IF NEW.status = 'pago' AND NEW.data_pagamento IS NOT NULL AND NEW.data_vencimento IS NOT NULL THEN
    NEW.dias_atraso := GREATEST((NEW.data_pagamento::date - NEW.data_vencimento::date), 0);
  ELSE
    NEW.dias_atraso := 0;
  END IF;
  
  -- Calcular status inteligente
  IF NEW.status = 'pago' THEN
    NEW.status_calculado := 'pago';
  ELSIF NEW.data_vencimento < CURRENT_DATE AND NEW.status != 'pago' THEN
    NEW.status_calculado := 'vencido';
  ELSIF NEW.data_vencimento = CURRENT_DATE AND NEW.status != 'pago' THEN
    NEW.status_calculado := 'vence_hoje';
  ELSE
    NEW.status_calculado := 'pendente';
  END IF;
  
  -- Calcular multas e juros quando parcela é paga
  IF NEW.status = 'pago' AND OLD.status != 'pago' AND NEW.data_pagamento IS NOT NULL THEN
    DECLARE
      v_multa_juros NUMERIC;
    BEGIN
      v_multa_juros := calcular_multas_juros(
        NEW.valor,
        NEW.data_vencimento,
        NEW.data_pagamento
      );
      
      NEW.valor_multa := GREATEST(v_multa_juros * 0.6, 0); -- 60% multa
      NEW.valor_juros := GREATEST(v_multa_juros * 0.4, 0); -- 40% juros
      NEW.valor_corrigido := NEW.valor + NEW.valor_multa + NEW.valor_juros - NEW.valor_desconto;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger
DROP TRIGGER IF EXISTS trigger_atualizar_financeiro_parcela ON parcelas;
CREATE TRIGGER trigger_atualizar_financeiro_parcela
  BEFORE UPDATE ON parcelas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_campos_parcela();

-- 5. Função para status inteligente da transação
CREATE OR REPLACE FUNCTION atualizar_status_transacao()
RETURNS TRIGGER AS $$
DECLARE
  v_total_parcelas INTEGER;
  v_parcelas_pagas INTEGER;
  v_parcelas_vencidas INTEGER;
  v_valor_total NUMERIC;
  v_valor_pago NUMERIC;
BEGIN
  -- Contar parcelas
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'pago' THEN 1 END) as pagas,
    COUNT(CASE WHEN status = 'vencido' THEN 1 END) as vencidas,
    SUM(valor) as valor_total,
    SUM(valor_corrigido) as valor_pago
  INTO v_total_parcelas, v_parcelas_pagas, v_parcelas_vencidas, v_valor_total, v_valor_pago
  FROM parcelas 
  WHERE transacao_id = NEW.id;
  
  -- Atualizar status da transação
  IF v_parcelas_pagas = v_total_parcelas THEN
    NEW.status = 'pago';
  ELSIF v_parcelas_vencidas > 0 THEN
    NEW.status = 'vencido';
  ELSIF v_parcelas_pagas > 0 THEN
    NEW.status = 'em_andamento';
  ELSE
    NEW.status = 'pendente';
  END IF;
  
  -- Valores corrigidos são gerenciados nas parcelas individualmente
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para transações
DROP TRIGGER IF EXISTS trigger_atualizar_status_transacao ON transacoes;
CREATE TRIGGER trigger_atualizar_status_transacao
  AFTER UPDATE ON transacoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_transacao();

-- 7. Corrigir datas das parcelas existentes (versão melhorada)
UPDATE parcelas 
SET 
  data_vencimento = (
    SELECT 
      CASE 
        WHEN p.numero_parcela = 1 THEN t.data_vencimento
        ELSE (t.data_vencimento + ((p.numero_parcela - 1) * INTERVAL '1 month'))
      END
    FROM transacoes t
    WHERE t.id = p.transacao_id
  ),
  data_credito_prevista = (
    SELECT 
      CASE 
        WHEN p.numero_parcela = 1 THEN t.data_vencimento
        ELSE (t.data_vencimento + ((p.numero_parcela - 1) * INTERVAL '1 month'))
      END
    FROM transacoes t
    WHERE t.id = p.transacao_id
  ) + COALESCE((
    SELECT prazo_deposito 
    FROM metodos_cobranca mc 
    WHERE mc.id = t.metodo_cobranca_id
  ), 0) * INTERVAL '1 day'
FROM parcelas p
JOIN transacoes t ON t.id = p.transacao_id
WHERE p.data_vencimento IS NOT NULL;

-- 8. Atualizar status calculado das parcelas existentes
UPDATE parcelas 
SET status_calculado = CASE 
  WHEN data_pagamento IS NOT NULL THEN 'pago'
  WHEN data_vencimento < CURRENT_DATE THEN 'vencido'
  WHEN data_vencimento = CURRENT_DATE THEN 'vence_hoje'
  ELSE 'pendente'
END,
dias_atraso = CASE 
  WHEN data_pagamento IS NOT NULL AND data_vencimento IS NOT NULL 
  THEN GREATEST((data_pagamento::date - data_vencimento::date), 0)
  ELSE 0
END;

-- 9. Recalcular multas/juros para parcelas pagas
UPDATE parcelas 
SET 
  valor_multa = GREATEST(calcular_multas_juros(valor, data_vencimento, data_pagamento) * 0.6, 0),
  valor_juros = GREATEST(calcular_multas_juros(valor, data_vencimento, data_pagamento) * 0.4, 0),
  valor_corrigido = valor + (GREATEST(calcular_multas_juros(valor, data_vencimento, data_pagamento) * 0.6, 0)) + (GREATEST(calcular_multas_juros(valor, data_vencimento, data_pagamento) * 0.4, 0)) - valor_desconto
WHERE status = 'pago' AND data_pagamento > data_vencimento;

-- 10. Adicionar comentários
COMMENT ON COLUMN parcelas.valor_multa IS 'Valor de multa por pagamento atrasado (calculado automaticamente)';
COMMENT ON COLUMN parcelas.valor_juros IS 'Valor de juros por pagamento atrasado (calculado automaticamente)';
COMMENT ON COLUMN parcelas.valor_desconto IS 'Valor de desconto concedido (manual)';
COMMENT ON COLUMN parcelas.valor_corrigido IS 'Valor final com multas, juros e descontos';
COMMENT ON COLUMN parcelas.dias_atraso IS 'Número de dias de atraso no pagamento';
COMMENT ON COLUMN parcelas.status_calculado IS 'Status inteligente baseado em regras financeiras';
