-- Migration: Corrigir valores das parcelas para usar valor_parcela da transação
-- Descrição: Corrige todos os casos onde valor da parcela não bate com valor_parcela da transação

-- Identificar todas as inconsistências
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  t.valor_parcela as valor_parcela_transacao,
  p.numero_parcela,
  p.valor as valor_parcela_banco,
  p.valor_corrigido,
  p.data_pagamento,
  p.status,
  CASE 
    WHEN p.valor != t.valor_parcela THEN 'INCONSISTENTE'
    ELSE 'OK'
  END as status_consistencia,
  ABS(p.valor - t.valor_parcela) as diferenca
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.tipo = 'receita'
  AND t.valor_parcela IS NOT NULL
  AND p.valor != t.valor_parcela
ORDER BY t.descricao, p.numero_parcela;

-- Corrigir todos os valores das parcelas para usar valor_parcela da transação
UPDATE parcelas p
SET valor = t.valor_parcela,
    valor_corrigido = CASE 
      WHEN p.valor_multa = 0 AND p.valor_juros = 0 AND p.valor_desconto = 0 
      THEN t.valor_parcela 
      ELSE p.valor_corrigido 
    END
FROM transacoes t
WHERE p.transacao_id = t.id
  AND t.tipo = 'receita'
  AND t.valor_parcela IS NOT NULL
  AND p.valor != t.valor_parcela;

-- Verificar quantos registros foram corrigidos
SELECT 
  COUNT(*) as total_corrigidos,
  'Valores das parcelas corrigidos para igualar valor_parcela da transação' as acao
FROM parcelas p
JOIN transacoes t ON p.transacao_id = t.id
WHERE t.tipo = 'receita'
  AND t.valor_parcela IS NOT NULL
  AND p.valor = t.valor_parcela
  AND p.data_pagamento IS NOT NULL;

-- Verificar resultado específico do Teste 21
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  t.valor_parcela,
  p.numero_parcela,
  p.valor as valor_corrigido_final,
  p.valor_corrigido,
  p.data_pagamento,
  p.status,
  CASE 
    WHEN p.valor = t.valor_parcela THEN 'CORRIGIDO'
    ELSE 'AINHA INCORRETO'
  END as status_final
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.descricao = 'Teste 21';
