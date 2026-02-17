-- Migration para corrigir schema de métodos de pagamento
-- Adicionar coluna metodo_cobranca_id para receitas (se não existir)
-- Manter metodo_pagamento_id para despesas

DO $$
BEGIN
    -- Verificar se a coluna metodo_cobranca_id já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transacoes' 
        AND column_name = 'metodo_cobranca_id'
    ) THEN
        -- Adicionar coluna metodo_cobranca_id
        ALTER TABLE transacoes 
        ADD COLUMN metodo_cobranca_id UUID REFERENCES metodos_cobranca(id);
        
        -- Criar tabela metodos_cobranca baseada em metodos_pagamento (se não existir)
        CREATE TABLE IF NOT EXISTS metodos_cobranca (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
            nome VARCHAR(100) NOT NULL,
            tipo VARCHAR(30) NOT NULL CHECK (
                tipo IN (
                    'pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 
                    'transferencia', 'boleto', 'debito_automatico'
                )
            ),
            taxas_percentual DECIMAL(5,2) DEFAULT 0.00,
            taxas_fixa DECIMAL(10,2) DEFAULT 0.00,
            prazo_deposito INTEGER DEFAULT 0,
            adquirente VARCHAR(100),
            conta_vinculada VARCHAR(100),
            is_padrao BOOLEAN DEFAULT false,
            ativo BOOLEAN DEFAULT true,
            cartao_id UUID REFERENCES cartoes(id) ON DELETE SET NULL,
            criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Constraint para garantir nomes únicos por clínica
            UNIQUE(clinica_id, nome)
        );
        
        -- Criar índices
        CREATE INDEX IF NOT EXISTS idx_metodos_cobranca_clinica ON metodos_cobranca(clinica_id);
        CREATE INDEX IF NOT EXISTS idx_metodos_cobranca_ativos ON metodos_cobranca(clinica_id, ativo);
        
        -- Habilitar RLS
        ALTER TABLE metodos_cobranca ENABLE ROW LEVEL SECURITY;
        
        -- Copiar dados de metodos_pagamento para metodos_cobranca
        INSERT INTO metodos_cobranca (clinica_id, nome, tipo, taxas_percentual, taxas_fixa, prazo_deposito, is_padrao, ativo, criado_em, atualizado_em)
        SELECT clinica_id, nome, tipo, taxas_percentual, taxas_fixa, prazo_deposito, is_padrao, ativo, criado_em, atualizado_em
        FROM metodos_pagamento
        ON CONFLICT (clinica_id, nome) DO NOTHING;
        
        -- Migrar receitas existentes para usar metodo_cobranca_id
        UPDATE transacoes 
        SET metodo_cobranca_id = metodo_pagamento_id 
        WHERE tipo = 'receita' AND metodo_pagamento_id IS NOT NULL;
        
        RAISE NOTICE 'Coluna metodo_cobranca_id adicionada e dados migrados com sucesso';
    ELSE
        RAISE NOTICE 'Coluna metodo_cobranca_id já existe';
    END IF;
END $$;

-- Criar trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_metodos_cobranca_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_metodos_cobranca_updated_at_trigger
    BEFORE UPDATE ON metodos_cobranca 
    FOR EACH ROW EXECUTE FUNCTION update_metodos_cobranca_updated_at();
