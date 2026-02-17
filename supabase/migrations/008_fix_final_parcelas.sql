-- Migration: Correção final das datas das parcelas
-- Descrição: Garante que todas as parcelas usem data_vencimento da transação como base

-- Verificar estado atual das parcelas
SELECT 
  t.descricao,
  t.data_vencimento as data_vencimento_transacao,
  p.numero_parcela,
  p.data_vencimento as data_vencimento_parcela,
  CASE 
    WHEN p.numero_parcela = 1 THEN t.data_vencimento
    ELSE (t.data_vencimento + ((p.numero_parcela - 1) * INTERVAL '1 month'))
  END as data_esperada,
  (t.data_vencimento + ((p.numero_parcela - 1) * INTERVAL '1 month')) - p.data_vencimento as diferenca_dias
FROM transacoes t
JOIN parcelas p ON p.transacao_id = t.id
WHERE t.total_parcelas > 1
ORDER BY t.descricao, p.numero_parcela;

-- Corrigir TODAS as parcelas existentes
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
  ), 30) * INTERVAL '1 day'
FROM parcelas p
JOIN transacoes t ON t.id = p.transacao_id
WHERE t.total_parcelas > 1;

-- Atualizar status calculado para refletir as novas datas
UPDATE parcelas 
SET status_calculado = CASE 
  WHEN data_pagamento IS NOT NULL THEN 'pago'
  WHEN data_vencimento < CURRENT_DATE THEN 'vencido'
  WHEN data_vencimento = CURRENT_DATE THEN 'vence_hoje'
  ELSE 'pendente'
END;

-- Verificar resultado após correção
SELECT 
  t.descricao,
  t.data_vencimento as data_vencimento_transacao,
  p.numero_parcela,
  p.data_vencimento as data_vencimento_parcela,
  p.status_calculado,
  CASE 
    WHEN p.numero_parcela = 1 THEN t.data_vencimento
    ELSE (t.data_vencimento + ((p.numero_parcela - 1) * INTERVAL '1 month'))
  END as data_esperada
FROM transacoes t
JOIN parcelas p ON p.transacao_id = t.id
WHERE t.total_parcelas > 1
ORDER BY t.descricao, p.numero_parcela;

-- Adicionar comentário sobre a correção final
COMMENT ON TABLE parcelas IS 'Parcelas de transações financeiras. Datas corrigidas para usar data_vencimento da transação como base.';
