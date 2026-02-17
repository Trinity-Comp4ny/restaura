-- Migration: Verificar inconsistências nos valores das parcelas
-- Descrição: Analisa todas as parcelas para identificar inconsistências entre valores

-- Verificar inconsistências gerais
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  t.total_parcelas,
  COUNT(p.id) as quantidade_parcelas,
  COALESCE(SUM(p.valor), 0) as soma_parcelas,
  t.valor_liquido - COALESCE(SUM(p.valor), 0) as diferenca,
  CASE 
    WHEN ABS(t.valor_liquido - COALESCE(SUM(p.valor), 0)) > 0.10 THEN 'INCONSISTENTE'
    ELSE 'OK'
  END as status
FROM transacoes t
LEFT JOIN parcelas p ON t.id = p.transacao_id
WHERE t.tipo = 'receita'
GROUP BY t.id, t.descricao, t.valor_bruto, t.valor_liquido, t.total_parcelas
ORDER BY status DESC, t.descricao;

-- Verificar valores corrigidos vs originais
SELECT 
  t.descricao,
  p.numero_parcela,
  p.valor as valor_original,
  p.valor_corrigido,
  p.data_pagamento,
  p.valor_multa,
  p.valor_juros,
  p.valor_desconto,
  CASE 
    WHEN p.valor_corrigido IS NOT NULL AND p.valor_corrigido != p.valor THEN 'COM CORRECAO'
    ELSE 'NORMAL'
  END as tipo_valor
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.tipo = 'receita'
  AND p.data_pagamento IS NOT NULL
ORDER BY t.descricao, p.numero_parcela;

-- Verificar casos específicos mencionados
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  t.total_parcelas,
  p.numero_parcela,
  p.valor,
  p.valor_corrigido,
  p.data_pagamento,
  (p.valor_corrigido OR p.valor) as valor_exibido
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.descricao IN ('Teste 16', 'Teste 19', 'Teste 15', 'Teste 17')
ORDER BY t.descricao, p.numero_parcela;
