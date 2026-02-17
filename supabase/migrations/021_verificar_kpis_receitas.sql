-- Migration: Verificar consistência dos KPIs de receitas
-- Descrição: Analisa os dados para identificar problemas nos cálculos dos KPIs

-- Verificar valores totais por transação
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  COUNT(p.id) as total_parcelas,
  COALESCE(SUM(p.valor), 0) as soma_parcelas,
  t.valor_liquido - COALESCE(SUM(p.valor), 0) as diferenca,
  CASE 
    WHEN ABS(t.valor_liquido - COALESCE(SUM(p.valor), 0)) > 0.01 THEN 'INCONSISTENTE'
    ELSE 'OK'
  END as status
FROM transacoes t
LEFT JOIN parcelas p ON t.id = p.transacao_id
WHERE t.tipo = 'receita'
GROUP BY t.id, t.descricao, t.valor_bruto, t.valor_liquido
ORDER BY status DESC, t.descricao;

-- Verificar valores pagos vs pendentes
SELECT 
  'RESUMO GERAL' as tipo,
  COUNT(*) as total_transacoes,
  COALESCE(SUM(t.valor_liquido), 0) as valor_total_transacoes,
  COALESCE(SUM(p.valor), 0) as valor_total_parcelas,
  COALESCE(SUM(CASE WHEN p.data_pagamento IS NOT NULL THEN p.valor ELSE 0 END), 0) as valor_pago,
  COALESCE(SUM(CASE WHEN p.data_pagamento IS NULL THEN p.valor ELSE 0 END), 0) as valor_pendente,
  COALESCE(SUM(CASE WHEN p.status_calculado IN ('pendente', 'vencido', 'vence_hoje') AND p.data_pagamento IS NULL THEN p.valor ELSE 0 END), 0) as valor_pendente_status
FROM transacoes t
LEFT JOIN parcelas p ON t.id = p.transacao_id
WHERE t.tipo = 'receita'

UNION ALL

-- Verificar transações sem parcelas
SELECT 
  'SEM PARCELAS' as tipo,
  COUNT(*) as total_transacoes,
  COALESCE(SUM(t.valor_liquido), 0) as valor_total_transacoes,
  0 as valor_total_parcelas,
  0 as valor_pago,
  COALESCE(SUM(t.valor_liquido), 0) as valor_pendente,
  COALESCE(SUM(t.valor_liquido), 0) as valor_pendente_status
FROM transacoes t
WHERE t.tipo = 'receita'
  AND NOT EXISTS (SELECT 1 FROM parcelas p WHERE p.transacao_id = t.id);

-- Verificar casos específicos que podem estar causando diferenças
SELECT 
  t.descricao,
  t.valor_liquido,
  p.numero_parcela,
  p.valor,
  p.data_pagamento,
  p.status_calculado,
  CASE 
    WHEN p.data_pagamento IS NOT NULL THEN 'PAGO'
    WHEN p.status_calculado IN ('pendente', 'vencido', 'vence_hoje') THEN 'PENDENTE'
    ELSE 'OUTRO'
  END as situacao
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.tipo = 'receita'
  AND (p.data_pagamento IS NOT NULL OR p.status_calculado IN ('pendente', 'vencido', 'vence_hoje'))
ORDER BY t.descricao, p.numero_parcela;
