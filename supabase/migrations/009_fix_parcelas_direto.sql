-- Migration: Correção direta das parcelas
-- Descrição: Força a atualização das datas das parcelas usando UPDATE direto

-- Corrigir cada parcela individualmente para garantir que funcione
UPDATE parcelas 
SET data_vencimento = t.data_vencimento + ((parcelas.numero_parcela - 1) * INTERVAL '1 month'),
    data_credito_prevista = t.data_vencimento + ((parcelas.numero_parcela - 1) * INTERVAL '1 month') + COALESCE(mc.prazo_deposito, 30) * INTERVAL '1 day'
FROM transacoes t
LEFT JOIN metodos_cobranca mc ON mc.id = t.metodo_cobranca_id
WHERE parcelas.transacao_id = t.id 
AND t.total_parcelas > 1;

-- Verificar a correção
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

-- Atualizar status calculado
UPDATE parcelas 
SET status_calculado = CASE 
  WHEN data_pagamento IS NOT NULL THEN 'pago'
  WHEN data_vencimento < CURRENT_DATE THEN 'vencido'
  WHEN data_vencimento = CURRENT_DATE THEN 'vence_hoje'
  ELSE 'pendente'
END
WHERE transacao_id IN (
  SELECT id FROM transacoes WHERE total_parcelas > 1
);

-- Mostrar resultado final
SELECT 
  t.descricao,
  t.data_vencimento as data_vencimento_transacao,
  p.numero_parcela,
  p.data_vencimento as data_vencimento_parcela,
  p.status_calculado,
  CASE 
    WHEN p.numero_parcela = 1 THEN t.data_vencimento
    ELSE (t.data_vencimento + ((p.numero_parcela - 1) * INTERVAL '1 month'))
  END as data_esperada,
  p.data_vencimento = CASE 
    WHEN p.numero_parcela = 1 THEN t.data_vencimento
    ELSE (t.data_vencimento + ((p.numero_parcela - 1) * INTERVAL '1 month'))
  END as correcao_aplicada
FROM transacoes t
JOIN parcelas p ON p.transacao_id = t.id
WHERE t.total_parcelas > 1
ORDER BY t.descricao, p.numero_parcela;
