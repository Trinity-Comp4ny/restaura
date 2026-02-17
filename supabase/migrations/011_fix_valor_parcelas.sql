-- Corrigir valores das parcelas para usar valor líquido da transação
-- Descrição: Atualiza valores das parcelas que foram criadas com valor bruto em vez de valor líquido

-- Atualizar parcelas da transação "Teste 15" (e2b3eb21-c281-49ce-8ad3-5763e9a4a93b)
UPDATE parcelas 
SET valor = 65.17
WHERE transacao_id = 'e2b3eb21-c281-49ce-8ad3-5763e9a4a93b';

-- Atualizar parcelas da transação "Teste 16" (f7e82012-b765-4392-9501-6282ff4e4934)
UPDATE parcelas 
SET valor = 9.70
WHERE transacao_id = 'f7e82012-b765-4392-9501-6282ff4e4934';

-- Correção genérica para todas as parcelas
-- Atualiza valor da parcela para ser (valor_liquido da transação / total_parcelas)
UPDATE parcelas p
SET valor = (
  SELECT ROUND(t.valor_liquido / t.total_parcelas, 2)
  FROM transacoes t
  WHERE t.id = p.transacao_id
)
WHERE EXISTS (
  SELECT 1 FROM transacoes t
  WHERE t.id = p.transacao_id
  AND t.valor_liquido IS NOT NULL
  AND t.total_parcelas > 0
);

-- Recalcular valor_corrigido se necessário
UPDATE parcelas p
SET valor_corrigido = p.valor
WHERE p.data_pagamento IS NOT NULL
AND p.valor_corrigido IS NULL;
