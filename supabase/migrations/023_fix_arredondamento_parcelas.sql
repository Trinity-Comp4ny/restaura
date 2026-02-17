-- Migration: Corrigir arredondamento na criação de parcelas
-- Descrição: Melhora a distribuição de centavos para evitar perdas por arredondamento

-- Substituir função gerar_parcelas_transacao com melhor distribuição de centavos
CREATE OR REPLACE FUNCTION gerar_parcelas_transacao()
RETURNS TRIGGER AS $$
DECLARE
  v_num_parcelas INTEGER;
  v_valor_parcela NUMERIC;
  v_valor_restante NUMERIC;
  v_data_base DATE;
  v_data_vencimento DATE;
  v_cartao_id UUID;
  v_metodo_tipo TEXT;
  v_prazo_deposito INTEGER;
  v_fatura_id UUID;
  v_soma_parcelas NUMERIC;
  i INTEGER;
BEGIN
  v_num_parcelas := COALESCE(NEW.total_parcelas, 1);
  
  -- CORREÇÃO: Usar valor_parcela já calculado no frontend
  v_valor_parcela := NEW.valor_parcela;
  
  -- Calcular valor restante para ajuste de arredondamento
  -- A última parcela recebe o valor exato para compensar arredondamento
  v_valor_restante := NEW.valor_liquido - (v_valor_parcela * (v_num_parcelas - 1));
  
  -- Data base para vencimentos (usar data_vencimento da transação como base)
  v_data_base := COALESCE(NEW.data_vencimento, CURRENT_DATE);
  
  -- Verificar se é cartão de crédito (para vincular faturas)
  v_cartao_id := NEW.cartao_id;
  
  -- Buscar tipo do método e prazo de depósito
  IF NEW.metodo_cobranca_id IS NOT NULL THEN
    BEGIN
      SELECT tipo, prazo_deposito INTO v_metodo_tipo, v_prazo_deposito
      FROM metodos_cobranca 
      WHERE id = NEW.metodo_cobranca_id;
    EXCEPTION WHEN NO_DATA_FOUND THEN
      v_metodo_tipo := NULL;
      v_prazo_deposito := 0;
    END;
  ELSE
    v_metodo_tipo := NULL;
    v_prazo_deposito := 0;
  END IF;
  
  -- Gerar parcelas
  FOR i IN 1..v_num_parcelas LOOP
    -- Calcular data de vencimento para cada parcela
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
      -- Última parcela recebe o valor ajustado para compensar arredondamento
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
  
  -- Verificar se a soma das parcelas bate com o valor líquido
  SELECT COALESCE(SUM(valor), 0) INTO v_soma_parcelas
  FROM parcelas 
  WHERE transacao_id = NEW.id;
  
  -- Se houver diferença por arredondamento, ajustar a última parcela
  IF v_soma_parcelas != NEW.valor_liquido THEN
    UPDATE parcelas 
    SET valor = valor + (NEW.valor_liquido - v_soma_parcelas)
    WHERE transacao_id = NEW.id 
      AND numero_parcela = v_num_parcelas;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar se o trigger existe
SELECT 
  tgname,
  tgrelid::regclass as tabela,
  tgfoid::regproc as funcao
FROM pg_trigger 
WHERE tgname = 'trigger_gerar_parcelas';
