-- Migration: Corrigir função EXTRACT e remover cálculos de multa/juros
-- Descrição: Corrige o erro na função calcular_multas_juros e remove cálculos financeiros complexos

-- Remover a função calcular_multas_juros (não será mais usada)
DROP FUNCTION IF EXISTS calcular_multas_juros;

-- Simplificar a função atualizar_campos_parcela para apenas calcular status e dias de atraso
CREATE OR REPLACE FUNCTION atualizar_campos_parcela()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular dias de atraso (corrigido: usar diferença direta)
  IF NEW.data_pagamento IS NOT NULL AND NEW.data_vencimento IS NOT NULL THEN
    NEW.dias_atraso := GREATEST((NEW.data_pagamento::date - NEW.data_vencimento::date), 0);
  ELSE
    NEW.dias_atraso := 0;
  END IF;
  
  -- Calcular status inteligente (apenas status básico, sem multas/juros)
  IF NEW.status = 'pago' THEN
    NEW.status_calculado := 'pago';
  ELSIF NEW.data_vencimento < CURRENT_DATE AND NEW.status != 'pago' THEN
    NEW.status_calculado := 'vencido';
  ELSIF NEW.data_vencimento = CURRENT_DATE AND NEW.status != 'pago' THEN
    NEW.status_calculado := 'vence_hoje';
  ELSE
    NEW.status_calculado := 'pendente';
  END IF;
  
  -- Removidos cálculos de multa, juros e valor corrigido
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
