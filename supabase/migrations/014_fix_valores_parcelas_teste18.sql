-- Migration: Corrigir valores das parcelas do Teste 18
-- Descrição: Corrige os valores incorretos das parcelas da transação "Teste 18"
-- Valores corretos: 3 parcelas de R$ 16,17 (total R$ 48,50)

-- Identificar a transação "Teste 18"
SELECT id, descricao, valor_bruto, valor_liquido, total_parcelas 
FROM transacoes 
WHERE descricao = 'Teste 18';

-- Corrigir valores das parcelas do Teste 18
-- Valor correto da parcela = 48,50 ÷ 3 = 16,166666... ≈ 16,17
UPDATE parcelas 
SET valor = 16.17
WHERE transacao_id = (SELECT id FROM transacoes WHERE descricao = 'Teste 18')
AND numero_parcela = 1;

UPDATE parcelas 
SET valor = 16.17
WHERE transacao_id = (SELECT id FROM transacoes WHERE descricao = 'Teste 18')
AND numero_parcela = 2;

UPDATE parcelas 
SET valor = 16.16
WHERE transacao_id = (SELECT id FROM transacoes WHERE descricao = 'Teste 18')
AND numero_parcela = 3;

-- Verificar resultados
SELECT 
  t.descricao,
  t.valor_liquido,
  t.total_parcelas,
  p.numero_parcela,
  p.valor,
  p.data_vencimento,
  p.status
FROM transacoes t
JOIN parcelas p ON t.id = p.transacao_id
WHERE t.descricao = 'Teste 18'
ORDER BY p.numero_parcela;
