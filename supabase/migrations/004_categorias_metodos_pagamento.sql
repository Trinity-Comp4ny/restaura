-- Migration: Criar tabelas de categorias financeiras e métodos de pagamento
-- Descrição: Adiciona tabelas para gerenciar categorias de receitas/despesas e métodos de pagamento

-- Tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7) DEFAULT '#3b82f6', -- Hex color
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  is_padrao BOOLEAN DEFAULT false,
  ativa BOOLEAN DEFAULT true,
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para garantir nomes únicos por clínica e tipo
  UNIQUE(clinica_id, nome, tipo)
);

-- Tabela de métodos de pagamento
CREATE TABLE IF NOT EXISTS metodos_pagamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(30) NOT NULL CHECK (
    tipo IN (
      'pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 
      'transferencia', 'boleto', 'debito_automatico'
    )
  ),
  taxas_percentual DECIMAL(5,2) DEFAULT 0.00, -- Taxa percentual (ex: 2.99)
  taxas_fixa DECIMAL(10,2) DEFAULT 0.00, -- Taxa fixa (ex: 0.30)
  prazo_deposito INTEGER DEFAULT 0, -- Dias para depósito
  adquirente VARCHAR(100), -- Ex: 'Stripe', 'Mercado Pago'
  conta_vinculada VARCHAR(100), -- Referência a conta bancária
  is_padrao BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para garantir nomes únicos por clínica
  UNIQUE(clinica_id, nome)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_clinica_tipo ON categorias_financeiras(clinica_id, tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_ativas ON categorias_financeiras(clinica_id, ativa);
CREATE INDEX IF NOT EXISTS idx_metodos_pagamento_clinica ON metodos_pagamento(clinica_id);
CREATE INDEX IF NOT EXISTS idx_metodos_pagamento_ativos ON metodos_pagamento(clinica_id, ativo);

-- Triggers para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_financeiras_updated_at 
    BEFORE UPDATE ON categorias_financeiras 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metodos_pagamento_updated_at 
    BEFORE UPDATE ON metodos_pagamento 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE metodos_pagamento ENABLE ROW LEVEL SECURITY;

-- Policies para categorias financeiras
CREATE POLICY "Usuarios verem categorias da própria clínica" ON categorias_financeiras
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM usuarios WHERE clinica_id = categorias_financeiras.clinica_id
    ));

CREATE POLICY "Usuarios inserirem categorias na própria clínica" ON categorias_financeiras
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT id FROM usuarios WHERE clinica_id = categorias_financeiras.clinica_id
    ));

CREATE POLICY "Usuarios atualizarem categorias da própria clínica" ON categorias_financeiras
    FOR UPDATE USING (auth.uid() IN (
        SELECT id FROM usuarios WHERE clinica_id = categorias_financeiras.clinica_id
    ));

CREATE POLICY "Usuarios deletarem categorias da própria clínica" ON categorias_financeiras
    FOR DELETE USING (auth.uid() IN (
        SELECT id FROM usuarios WHERE clinica_id = categorias_financeiras.clinica_id
    ));

-- Policies para métodos de pagamento
CREATE POLICY "Usuarios verem métodos da própria clínica" ON metodos_pagamento
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM usuarios WHERE clinica_id = metodos_pagamento.clinica_id
    ));

CREATE POLICY "Usuarios inserirem métodos na própria clínica" ON metodos_pagamento
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT id FROM usuarios WHERE clinica_id = metodos_pagamento.clinica_id
    ));

CREATE POLICY "Usuarios atualizarem métodos da própria clínica" ON metodos_pagamento
    FOR UPDATE USING (auth.uid() IN (
        SELECT id FROM usuarios WHERE clinica_id = metodos_pagamento.clinica_id
    ));

CREATE POLICY "Usuarios deletarem métodos da própria clínica" ON metodos_pagamento
    FOR DELETE USING (auth.uid() IN (
        SELECT id FROM usuarios WHERE clinica_id = metodos_pagamento.clinica_id
    ));

-- Inserir dados padrão (para clínicas existentes)
-- Categorias de receita padrão
INSERT INTO categorias_financeiras (nome, descricao, cor, tipo, is_padrao, clinica_id) 
SELECT 
    'Procedimentos Gerais', 
    'Consultas e procedimentos básicos', 
    '#3b82f6', 
    'receita', 
    true, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_financeiras 
    WHERE nome = 'Procedimentos Gerais' AND tipo = 'receita' AND clinica_id = clinicas.id
);

INSERT INTO categorias_financeiras (nome, descricao, cor, tipo, is_padrao, clinica_id) 
SELECT 
    'Ortodontia', 
    'Tratamentos ortodônticos', 
    '#10b981', 
    'receita', 
    true, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_financeiras 
    WHERE nome = 'Ortodontia' AND tipo = 'receita' AND clinica_id = clinicas.id
);

INSERT INTO categorias_financeiras (nome, descricao, cor, tipo, is_padrao, clinica_id) 
SELECT 
    'Implantes', 
    'Procedimentos de implantação', 
    '#f59e0b', 
    'receita', 
    true, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_financeiras 
    WHERE nome = 'Implantes' AND tipo = 'receita' AND clinica_id = clinicas.id
);

-- Categorias de despesa padrão
INSERT INTO categorias_financeiras (nome, descricao, cor, tipo, is_padrao, clinica_id) 
SELECT 
    'Materiais', 
    'Materiais odontológicos e insumos', 
    '#ef4444', 
    'despesa', 
    true, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_financeiras 
    WHERE nome = 'Materiais' AND tipo = 'despesa' AND clinica_id = clinicas.id
);

INSERT INTO categorias_financeiras (nome, descricao, cor, tipo, is_padrao, clinica_id) 
SELECT 
    'Pessoal', 
    'Salários e benefícios', 
    '#8b5cf6', 
    'despesa', 
    true, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_financeiras 
    WHERE nome = 'Pessoal' AND tipo = 'despesa' AND clinica_id = clinicas.id
);

INSERT INTO categorias_financeiras (nome, descricao, cor, tipo, is_padrao, clinica_id) 
SELECT 
    'Aluguel', 
    'Aluguel do consultório', 
    '#ec4899', 
    'despesa', 
    false, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_financeiras 
    WHERE nome = 'Aluguel' AND tipo = 'despesa' AND clinica_id = clinicas.id
);

-- Métodos de pagamento padrão
INSERT INTO metodos_pagamento (nome, tipo, taxas_percentual, taxas_fixa, prazo_deposito, is_padrao, clinica_id) 
SELECT 
    'PIX', 
    'pix', 
    0.00, 
    0.00, 
    0, 
    true, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM metodos_pagamento 
    WHERE nome = 'PIX' AND clinica_id = clinicas.id
);

INSERT INTO metodos_pagamento (nome, tipo, taxas_percentual, taxas_fixa, prazo_deposito, is_padrao, clinica_id) 
SELECT 
    'Cartão de crédito', 
    'cartao_credito', 
    2.99, 
    0.30, 
    30, 
    false, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM metodos_pagamento 
    WHERE nome = 'Cartão de crédito' AND clinica_id = clinicas.id
);

INSERT INTO metodos_pagamento (nome, tipo, taxas_percentual, taxas_fixa, prazo_deposito, is_padrao, clinica_id) 
SELECT 
    'Cartão de débito', 
    'cartao_debito', 
    1.99, 
    0.00, 
    1, 
    false, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM metodos_pagamento 
    WHERE nome = 'Cartão de débito' AND clinica_id = clinicas.id
);

INSERT INTO metodos_pagamento (nome, tipo, taxas_percentual, taxas_fixa, prazo_deposito, is_padrao, clinica_id) 
SELECT 
    'Dinheiro', 
    'dinheiro', 
    0.00, 
    0.00, 
    0, 
    false, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM metodos_pagamento 
    WHERE nome = 'Dinheiro' AND clinica_id = clinicas.id
);

INSERT INTO metodos_pagamento (nome, tipo, taxas_percentual, taxas_fixa, prazo_deposito, is_padrao, clinica_id) 
SELECT 
    'Transferência', 
    'transferencia', 
    0.00, 
    0.00, 
    1, 
    false, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM metodos_pagamento 
    WHERE nome = 'Transferência' AND clinica_id = clinicas.id
);

INSERT INTO metodos_pagamento (nome, tipo, taxas_percentual, taxas_fixa, prazo_deposito, is_padrao, clinica_id) 
SELECT 
    'Boleto', 
    'boleto', 
    1.50, 
    0.00, 
    3, 
    false, 
    id 
FROM clinicas 
WHERE NOT EXISTS (
    SELECT 1 FROM metodos_pagamento 
    WHERE nome = 'Boleto' AND clinica_id = clinicas.id
);
