-- ===========================================
-- MIGRATION 030: Corrigir View de Inadimplência
-- ===========================================
-- Atualiza view vw_inadimplencia_pacientes para usar as tabelas corretas
-- do schema atual (transacoes e parcelas) em vez de contas_receber

-- ===========================================
-- 1. REMOVER VIEW ANTIGA
-- ===========================================
DROP VIEW IF EXISTS vw_inadimplencia_pacientes;

-- ===========================================
-- 2. CRIAR VIEW ATUALIZADA
-- ===========================================
-- View para inadimplência por paciente usando transacoes e parcelas
CREATE VIEW vw_inadimplencia_pacientes AS
SELECT 
  p.id as paciente_id,
  p.nome as paciente_nome,
  p.telefone,
  p.email,
  
  -- Totais calculados das parcelas vencidas
  COALESCE(SUM(par.valor), 0) as total_devido,
  COUNT(par.id) as parcelas_vencidas,
  
  -- Dias em atraso (da parcela mais antiga vencida)
  (CURRENT_DATE - MIN(par.data_vencimento))::INTEGER as dias_atraso,
  
  -- Último pagamento (parcela mais recentemente paga)
  MAX(par.data_pagamento) as ultimo_pagamento,
  
  -- Faixa de atraso
  CASE 
    WHEN (CURRENT_DATE - MIN(par.data_vencimento))::INTEGER <= 30 THEN '1-30'
    WHEN (CURRENT_DATE - MIN(par.data_vencimento))::INTEGER <= 60 THEN '31-60'
    WHEN (CURRENT_DATE - MIN(par.data_vencimento))::INTEGER <= 90 THEN '61-90'
    ELSE '90+'
  END as faixa_atraso,
  
  t.clinica_id
  
FROM pacientes p
INNER JOIN transacoes t ON p.id = t.paciente_id
INNER JOIN parcelas par ON t.id = par.transacao_id
WHERE 
  t.tipo = 'receita'
  AND par.status IN ('pendente', 'vencido')
  AND par.data_vencimento < CURRENT_DATE
  AND par.data_pagamento IS NULL
GROUP BY p.id, p.nome, p.telefone, p.email, t.clinica_id;

-- ===========================================
-- 3. CRIAR VIEW PARA ESTATÍSTICAS DE INADIMPLÊNCIA
-- ===========================================
CREATE VIEW vw_estatisticas_inadimplencia AS
SELECT 
  clinica_id,
  
  -- Totais gerais
  COALESCE(SUM(total_devido), 0) as total_inadimplente,
  COUNT(*) as total_pacientes,
  COALESCE(SUM(parcelas_vencidas), 0) as total_parcelas,
  
  -- Pacientes críticos (90+ dias)
  COUNT(*) FILTER (WHERE faixa_atraso = '90+') as pacientes_criticos,
  
  -- Distribuição por faixa
  COALESCE(SUM(total_devido) FILTER (WHERE faixa_atraso = '1-30'), 0) as valor_1_30,
  COALESCE(SUM(total_devido) FILTER (WHERE faixa_atraso = '31-60'), 0) as valor_31_60,
  COALESCE(SUM(total_devido) FILTER (WHERE faixa_atraso = '61-90'), 0) as valor_61_90,
  COALESCE(SUM(total_devido) FILTER (WHERE faixa_atraso = '90+'), 0) as valor_90_plus,
  
  -- Contagem por faixa
  COUNT(*) FILTER (WHERE faixa_atraso = '1-30') as count_1_30,
  COUNT(*) FILTER (WHERE faixa_atraso = '31-60') as count_31_60,
  COUNT(*) FILTER (WHERE faixa_atraso = '61-90') as count_61_90,
  COUNT(*) FILTER (WHERE faixa_atraso = '90+') as count_90_plus
  
FROM vw_inadimplencia_pacientes
GROUP BY clinica_id;

-- ===========================================
-- 4. ÍNDICES PARA PERFORMANCE
-- ===========================================
-- Índices simples para melhorar performance das queries
CREATE INDEX IF NOT EXISTS idx_parcelas_inadimplencia_status 
ON parcelas(status, data_vencimento, data_pagamento);

CREATE INDEX IF NOT EXISTS idx_transacoes_receitas_paciente 
ON transacoes(paciente_id, clinica_id, tipo);

-- ===========================================
-- 5. COMENTÁRIOS
-- ===========================================
COMMENT ON VIEW vw_inadimplencia_pacientes IS 'View atualizada para inadimplência por paciente usando transacoes e parcelas';
COMMENT ON VIEW vw_estatisticas_inadimplencia IS 'View para estatísticas consolidadas de inadimplência por clínica';
