-- Migration: Corrigir valor original do Teste 20
-- Descrição: Corrige o valor da parcela do Teste 20 para usar valor líquido

-- Verificar situação atual do Teste 20
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  t.total_parcelas,
  p.numero_parcela,
  p.valor as valor_original_atual,
  p.valor_corrigido,
  p.data_pagamento,
  p.status,
  (t.valor_liquido / t.total_parcelas) as valor_esperado
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.descricao = 'Teste 20';

-- Corrigir valor da parcela para ser o valor líquido dividido pelo total de parcelas
UPDATE parcelas 
SET valor = (SELECT valor_liquido / total_parcelas FROM transacoes WHERE id = transacao_id),
    valor_corrigido = (SELECT valor_liquido / total_parcelas FROM transacoes WHERE id = transacao_id)
WHERE transacao_id = (SELECT id FROM transacoes WHERE descricao = 'Teste 20');

-- Verificar resultado final
SELECT 
  t.descricao,
  t.valor_bruto,
  t.valor_liquido,
  t.total_parcelas,
  p.numero_parcela,
  p.valor as valor_original_corrigido,
  p.valor_corrigido,
  p.data_pagamento,
  p.status,
  CASE 
    WHEN p.valor = (t.valor_liquido / t.total_parcelas) THEN 'VALOR CORRETO'
    ELSE 'VALOR INCORRETO'
  END as status_final
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.descricao = 'Teste 20';
