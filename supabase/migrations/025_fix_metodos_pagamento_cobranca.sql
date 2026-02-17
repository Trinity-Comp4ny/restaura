-- Migration para organizar métodos de pagamento e cobrança
-- Garante separação clara entre métodos para receitas (cobrança) e despesas (pagamento)

-- Verificar se as tabelas existem e estão corretas
DO $$
BEGIN
    -- Tabela para métodos de cobrança (receitas - clientes pagam à clínica)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metodos_cobranca') THEN
        CREATE TABLE metodos_cobranca (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            clinica_id uuid NOT NULL REFERENCES clinicas(id),
            nome text NOT NULL,
            tipo text NOT NULL CHECK (tipo IN ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'transferencia', 'boleto')),
            taxas_percentual numeric DEFAULT 0 CHECK (taxas_percentual >= 0),
            taxas_fixa numeric DEFAULT 0 CHECK (taxas_fixa >= 0),
            prazo_deposito integer DEFAULT 0 CHECK (prazo_deposito >= 0),
            adquirente text,
            conta_vinculada_id uuid REFERENCES contas_bancarias(id),
            is_padrao boolean DEFAULT false,
            ativo boolean DEFAULT true,
            criado_em timestamp with time zone DEFAULT now(),
            atualizado_em timestamp with time zone DEFAULT now()
        );
        
        CREATE INDEX idx_metodos_cobranca_clinica ON metodos_cobranca(clinica_id);
        CREATE INDEX idx_metodos_cobranca_ativos ON metodos_cobranca(clinica_id, ativo);
    END IF;
    
    -- Tabela para métodos de pagamento (despesas - clínica paga fornecedores)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metodos_pagamento') THEN
        CREATE TABLE metodos_pagamento (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            clinica_id uuid NOT NULL REFERENCES clinicas(id),
            nome text NOT NULL,
            tipo text NOT NULL CHECK (tipo IN ('pix', 'transferencia', 'boleto', 'debito_automatico', 'dinheiro')),
            taxas_percentual numeric DEFAULT 0 CHECK (taxas_percentual >= 0),
            taxas_fixa numeric DEFAULT 0 CHECK (taxas_fixa >= 0),
            prazo_deposito integer DEFAULT 0 CHECK (prazo_deposito >= 0),
            adquirente text,
            conta_vinculada_id uuid REFERENCES contas_bancarias(id),
            is_padrao boolean DEFAULT false,
            ativo boolean DEFAULT true,
            criado_em timestamp with time zone DEFAULT now(),
            atualizado_em timestamp with time zone DEFAULT now()
        );
        
        CREATE INDEX idx_metodos_pagamento_clinica ON metodos_pagamento(clinica_id);
        CREATE INDEX idx_metodos_pagamento_ativos ON metodos_pagamento(clinica_id, ativo);
    END IF;
    
    -- Verificar se a tabela transacoes tem os campos corretos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transacoes' AND column_name = 'metodo_pagamento_id') THEN
        ALTER TABLE transacoes ADD COLUMN metodo_pagamento_id uuid REFERENCES metodos_pagamento(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transacoes' AND column_name = 'metodo_cobranca_id') THEN
        ALTER TABLE transacoes ADD COLUMN metodo_cobranca_id uuid REFERENCES metodos_cobranca(id);
    END IF;
    
    -- Adicionar commentários para documentação
    COMMENT ON TABLE metodos_cobranca IS 'Métodos para receber dos clientes (receitas)';
    COMMENT ON TABLE metodos_pagamento IS 'Métodos para pagar fornecedores (despesas)';
    COMMENT ON COLUMN transacoes.metodo_cobranca_id IS 'Usado em transações do tipo receita';
    COMMENT ON COLUMN transacoes.metodo_pagamento_id IS 'Usado em transações do tipo despesa';
    
END $$;

-- Inserir dados padrão se as tabelas estiverem vazias
INSERT INTO metodos_cobranca (clinica_id, nome, tipo, is_padrao, ativo)
SELECT 
    id,
    'PIX Padrão',
    'pix',
    true,
    true
FROM clinicas
WHERE NOT EXISTS (SELECT 1 FROM metodos_cobranca WHERE clinica_id = clinicas.id)
ON CONFLICT DO NOTHING;

INSERT INTO metodos_pagamento (clinica_id, nome, tipo, is_padrao, ativo)
SELECT 
    id,
    'Transferência Bancária',
    'transferencia',
    true,
    true
FROM clinicas
WHERE NOT EXISTS (SELECT 1 FROM metodos_pagamento WHERE clinica_id = clinicas.id)
ON CONFLICT DO NOTHING;
