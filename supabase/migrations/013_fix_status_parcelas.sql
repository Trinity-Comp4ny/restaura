-- Migration: Atualizar status_calculado das parcelas existentes
-- Descrição: Força a atualização do status_calculado para todas as parcelas
-- para corrigir parcelas com vencimento antes da data atual que ainda estão como 'pendente'

-- Atualizar status_calculado de todas as parcelas
UPDATE parcelas 
SET status_calculado = CASE 
  WHEN status = 'pago' THEN 'pago'
  WHEN data_vencimento < CURRENT_DATE AND status != 'pago' THEN 'vencido'
  WHEN data_vencimento = CURRENT_DATE AND status != 'pago' THEN 'vence_hoje'
  ELSE 'pendente'
END;

-- Forçar o trigger para recalcular (alternativa mais segura)
-- 1. Marcar todas as parcelas como pendente temporariamente
UPDATE parcelas SET status = 'pendente' WHERE status != 'pago';

-- 2. Deixar o trigger atualizar o status_calculado automaticamente
UPDATE parcelas SET status = status WHERE status = 'pago';

-- Verificar os resultados
SELECT 
  id,
  data_vencimento,
  status,
  status_calculado,
  CASE 
    WHEN data_vencimento < CURRENT_DATE AND status != 'pago' THEN 'DEVERIA SER VENCIDO'
    WHEN data_vencimento = CURRENT_DATE AND status != 'pago' THEN 'DEVERIA SER VENCE_HOJE'
    WHEN data_vencimento > CURRENT_DATE AND status != 'pago' THEN 'DEVERIA SER PENDENTE'
    ELSE 'OK'
  END as verificado
FROM parcelas 
ORDER BY data_vencimento;
