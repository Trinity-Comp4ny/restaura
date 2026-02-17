-- Migration para remover centros de custo do sistema
-- Data: 2026-02-11

-- Remover referências em outras tabelas
ALTER TABLE transacoes DROP COLUMN IF EXISTS centro_custo;
ALTER TABLE contas_pagar DROP COLUMN IF EXISTS centro_custo_id;

-- Remover a tabela de centros de custo
DROP TABLE IF EXISTS centros_custo;

-- Remover funções relacionadas
DROP FUNCTION IF EXISTS get_centros_custo(p_clinica_id UUID);

-- Atualizar views que não existem mais
DROP VIEW IF EXISTS vw_fluxo_caixa;
DROP VIEW IF EXISTS vw_inadimplencia_pacientes;
