-- Migration: Corrigir valores_corrigidos inconsistentes em geral
-- Descrição: Corrige todos os casos onde valor_corrigido é diferente do valor_original sem multas/juros

-- Identificar parcelas com valor_corrigido incorreto
SELECT 
  t.descricao,
  p.numero_parcela,
  p.valor as valor_original,
  p.valor_corrigido,
  p.valor_multa,
  p.valor_juros,
  p.valor_desconto,
  p.data_pagamento,
  CASE 
    WHEN p.valor_corrigido IS NULL THEN 'SEM CORRECAO'
    WHEN p.valor_multa = 0 AND p.valor_juros = 0 AND p.valor_desconto = 0 AND p.valor_corrigido != p.valor THEN 'INCORRETO - SEM MULTAS'
    WHEN p.valor_multa > 0 OR p.valor_juros > 0 OR p.valor_desconto > 0 THEN 'COM MULTAS/JUROS'
    ELSE 'OK'
  END as status_verificacao
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.tipo = 'receita'
  AND p.valor_corrigido IS NOT NULL
ORDER BY status_verificacao, t.descricao, p.numero_parcela;

-- Corrigir casos onde não há multas/juros mas valor_corrigido é diferente
UPDATE parcelas 
SET valor_corrigido = valor
WHERE valor_corrigido IS NOT NULL
  AND valor_multa = 0 
  AND valor_juros = 0 
  AND valor_desconto = 0
  AND valor_corrigido != valor
  AND transacao_id IN (
    SELECT id FROM transacoes WHERE tipo = 'receita'
  );

-- Verificar quantos registros foram corrigidos
SELECT 
  COUNT(*) as total_corrigidos,
  'Valores corrigidos ajustados para igualar valor original' as acao
FROM parcelas 
WHERE valor_corrigido IS NOT NULL
  AND valor_multa = 0 
  AND valor_juros = 0 
  AND valor_desconto = 0
  AND valor_corrigido = valor
  AND transacao_id IN (
    SELECT id FROM transacoes WHERE tipo = 'receita'
  );
