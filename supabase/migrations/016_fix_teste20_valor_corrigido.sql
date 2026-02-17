-- Migration: Corrigir valor corrigido do Teste 20
-- Descrição: Corrige o valor_corrigido da parcela do Teste 20 que está incorreto

-- Verificar dados atuais do Teste 20
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  t.total_parcelas,
  p.numero_parcela,
  p.valor as valor_original,
  p.valor_corrigido,
  p.data_pagamento,
  p.status
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.descricao = 'Teste 20';

-- Corrigir valor_corrigido para ser igual ao valor_original (sem multas/juros)
UPDATE parcelas 
SET valor_corrigido = valor
WHERE transacao_id = (SELECT id FROM transacoes WHERE descricao = 'Teste 20')
AND valor_corrigido != valor;

-- Verificar resultado após correção
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  p.numero_parcela,
  p.valor as valor_original,
  p.valor_corrigido,
  p.data_pagamento,
  p.status,
  CASE 
    WHEN p.valor_corrigido = p.valor THEN 'CORRIGIDO'
    ELSE 'AINHA INCORRETO'
  END as status_correcao
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.descricao = 'Teste 20';
