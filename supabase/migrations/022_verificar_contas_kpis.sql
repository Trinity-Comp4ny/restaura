-- Migration: Verificar contas dos KPIs de receitas
-- Descrição: Validação matemática dos valores exibidos nos KPIs

-- Verificar soma dos valores líquidos (Total Líquido esperado)
SELECT 
  'TOTAL LÍQUIDO' as tipo,
  COUNT(*) as quantidade,
  COALESCE(SUM(valor_liquido), 0) as soma_valor_liquido,
  COALESCE(SUM(valor_bruto), 0) as soma_valor_bruto,
  COALESCE(SUM(valor_bruto), 0) - COALESCE(SUM(valor_liquido), 0) as total_taxas_esperado
FROM transacoes 
WHERE tipo = 'receita';

-- Verificar soma das parcelas (valor que realmente aparece na tabela)
SELECT 
  'TOTAL PARCELAS' as tipo,
  COUNT(p.id) as quantidade_parcelas,
  COALESCE(SUM(p.valor), 0) as soma_parcelas,
  COALESCE(SUM(t.valor_bruto), 0) as soma_bruto_transacoes,
  COALESCE(SUM(t.valor_liquido), 0) as soma_liquido_transacoes
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.tipo = 'receita';

-- Verificar taxas pagas (parcelas já pagas)
SELECT 
  'TAXAS PAGAS' as tipo,
  COUNT(p.id) as parcelas_pagas,
  COALESCE(SUM(p.valor), 0) as valor_pago,
  COALESCE(SUM(t.valor_bruto), 0) as bruto_transacoes_pagas,
  COALESCE(SUM(t.valor_liquido), 0) as liquido_transacoes_pagas,
  COALESCE(SUM(t.valor_bruto), 0) - COALESCE(SUM(t.valor_liquido), 0) as taxas_totais
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.tipo = 'receita'
  AND p.data_pagamento IS NOT NULL;

-- Verificar valores pendentes (parcelas não pagas)
SELECT 
  'VALORES PENDENTES' as tipo,
  COUNT(p.id) as parcelas_pendentes,
  COALESCE(SUM(p.valor), 0) as valor_pendente,
  p.status_calculado
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.tipo = 'receita'
  AND p.data_pagamento IS NULL
  AND p.status_calculado IN ('pendente', 'vencido', 'vence_hoje')
GROUP BY p.status_calculado;

-- Detalhamento individual para verificação
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  t.valor_bruto - t.valor_liquido as taxas_transacao,
  COUNT(p.id) as total_parcelas,
  COALESCE(SUM(p.valor), 0) as soma_parcelas,
  COALESCE(SUM(CASE WHEN p.data_pagamento IS NOT NULL THEN p.valor ELSE 0 END), 0) as valor_pago,
  COALESCE(SUM(CASE WHEN p.data_pagamento IS NULL THEN p.valor ELSE 0 END), 0) as valor_pendente,
  CASE 
    WHEN COALESCE(SUM(p.valor), 0) = t.valor_liquido THEN 'OK'
    ELSE 'DIVERGENTE'
  END as status
FROM transacoes t
LEFT JOIN parcelas p ON t.id = p.transacao_id
WHERE t.tipo = 'receita'
GROUP BY t.id, t.descricao, t.valor_bruto, t.valor_liquido
ORDER BY t.descricao;
