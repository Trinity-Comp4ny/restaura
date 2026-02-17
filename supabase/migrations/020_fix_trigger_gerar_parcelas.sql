-- Migration: Corrigir trigger gerar_parcelas para usar valor_parcela
-- Descrição: Corrige o trigger que cria parcelas para usar valor_parcela em vez de valor_bruto

-- Verificar função atual
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname = 'gerar_parcelas_transacao';

-- Substituir a função para usar valor_parcela
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
  i INTEGER;
BEGIN
  v_num_parcelas := COALESCE(NEW.total_parcelas, 1);
  
  -- CORREÇÃO: Usar valor_parcela já calculado no frontend em vez de valor_bruto
  v_valor_parcela := NEW.valor_parcela;
  v_valor_restante := NEW.valor_parcela;  -- Para parcela única, é o mesmo valor
  
  -- Data base para vencimentos (usar data_vencimento da transação como base)
  v_data_base := COALESCE(NEW.data_vencimento, CURRENT_DATE);
  
  -- Verificar se é cartão de crédito (para vincular faturas)
  v_cartao_id := NEW.cartao_id;
  
  -- Buscar tipo do método e prazo de depósito
  -- Tenta metodos_cobranca primeiro, depois metodos_pagamento como fallback
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

-- Verificar se o trigger existe
SELECT 
  tgname,
  tgrelid::regclass as tabela,
  tgfoid::regproc as funcao
FROM pg_trigger 
WHERE tgname = 'trigger_gerar_parcelas';
