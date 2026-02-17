-- Migration: Forçar atualização do status_calculado das parcelas
-- Descrição: Corrige o status_calculado de todas as parcelas para garantir
-- que as contas a pagar/receber apareçam corretamente no fluxo de caixa

-- 1. Atualizar status_calculado de todas as parcelas existentes
UPDATE parcelas 
SET status_calculado = CASE 
  WHEN data_pagamento IS NOT NULL THEN 'pago'
  WHEN data_vencimento < CURRENT_DATE THEN 'vencido'
  WHEN data_vencimento = CURRENT_DATE THEN 'vence_hoje'
  ELSE 'pendente'
END,
atualizado_em = NOW()
WHERE status_calculado IS NULL 
   OR (status_calculado = 'pendente' AND data_vencimento < CURRENT_DATE)
   OR (status_calculado = 'pendente' AND data_vencimento = CURRENT_DATE);

-- 2. Verificar resultados
SELECT 
  id,
  data_vencimento,
  data_pagamento,
  status,
  status_calculado,
  CASE 
    WHEN data_pagamento IS NOT NULL THEN 'PAGO'
    WHEN data_vencimento < CURRENT_DATE THEN 'VENCIDO'
    WHEN data_vencimento = CURRENT_DATE THEN 'VENCE HOJE'
    ELSE 'PENDENTE'
  END as status_esperado,
  CASE 
    WHEN status_calculado != CASE 
      WHEN data_pagamento IS NOT NULL THEN 'pago'
      WHEN data_vencimento < CURRENT_DATE THEN 'vencido'
      WHEN data_vencimento = CURRENT_DATE THEN 'vence_hoje'
      ELSE 'pendente'
    END THEN 'INCORRETO'
    ELSE 'CORRETO'
  END as validacao
FROM parcelas 
ORDER BY data_vencimento DESC
LIMIT 10;

-- 3. Contar parcelas por status_calculado
SELECT 
  status_calculado,
  COUNT(*) as quantidade,
  SUM(valor) as valor_total
FROM parcelas 
GROUP BY status_calculado
ORDER BY status_calculado;

-- 4. Mostrar próximas parcelas (para validação do fluxo de caixa)
SELECT 
  p.id,
  p.valor,
  p.data_vencimento,
  p.status_calculado,
  t.descricao,
  t.tipo,
  t.categoria,
  CASE 
    WHEN t.tipo = 'receita' THEN pa.nome ELSE NULL
  END as paciente
FROM parcelas p
JOIN transacoes t ON p.transacao_id = t.id
LEFT JOIN pacientes pa ON t.paciente_id = pa.id
WHERE p.data_pagamento IS NULL
  AND p.status_calculado IN ('pendente', 'vencido', 'vence_hoje')
  AND p.data_vencimento <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY p.data_vencimento
LIMIT 10;
