-- Migration: Corrigir arredondamento do Teste 24
-- Descrição: Ajusta as parcelas do Teste 24 para somar exatamente R$ 1.000,00

-- Verificar dados atuais do Teste 24
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  t.total_parcelas,
  p.numero_parcela,
  p.valor as valor_atual,
  p.data_pagamento,
  p.status
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.descricao = 'Teste 24'
ORDER BY p.numero_parcela;

-- Corrigir valores das parcelas do Teste 24
-- Valor correto: R$ 1.000,00 ÷ 3 = R$ 333,333333...
-- Distribuição: 333,33 + 333,33 + 333,34 = 1.000,00

UPDATE parcelas 
SET valor = 333.33
WHERE transacao_id = (SELECT id FROM transacoes WHERE descricao = 'Teste 24')
AND numero_parcela = 1;

UPDATE parcelas 
SET valor = 333.33
WHERE transacao_id = (SELECT id FROM transacoes WHERE descricao = 'Teste 24')
AND numero_parcela = 2;

UPDATE parcelas 
SET valor = 333.34
WHERE transacao_id = (SELECT id FROM transacoes WHERE descricao = 'Teste 24')
AND numero_parcela = 3;

-- Verificar resultado após correção
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  t.total_parcelas,
  p.numero_parcela,
  p.valor as valor_corrigido,
  p.data_pagamento,
  p.status,
  (SELECT SUM(valor) FROM parcelas WHERE transacao_id = t.id) as soma_parcelas,
  CASE 
    WHEN (SELECT SUM(valor) FROM parcelas WHERE transacao_id = t.id) = t.valor_liquido THEN 'CORRETO'
    ELSE 'INCORRETO'
  END as status_soma
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.descricao = 'Teste 24'
ORDER BY p.numero_parcela;
