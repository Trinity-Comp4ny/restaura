-- ===========================================
-- RESTAURA - Database Schema Completo em Português
-- Sistema de Gestão Odontológica - Versão Final
-- ===========================================
-- Data: 2024-02-09
-- Descrição: Schema completo unificado com todas as funcionalidades

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ENUMS
-- ===========================================

CREATE TYPE user_role AS ENUM ('admin', 'dentista', 'assistente', 'recepcionista');
CREATE TYPE appointment_status AS ENUM ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu');
CREATE TYPE record_type AS ENUM ('anamnesia', 'evolução', 'prescrição', 'certificado', 'referência');
CREATE TYPE genero AS ENUM ('masculino', 'feminino', 'outro');

-- Enums financeiros
CREATE TYPE transaction_type AS ENUM ('receita', 'despesa', 'transferencia');
CREATE TYPE transaction_status AS ENUM ('pendente', 'pago', 'cancelado', 'estornado');
CREATE TYPE tipo_cartao AS ENUM ('credito', 'debito');

-- ===========================================
-- TABLES PRINCIPAIS
-- ===========================================

-- Clinicas
CREATE TABLE clinicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  documento TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  url_logo TEXT,
  configuracoes JSONB DEFAULT '{}',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Usuarios (staff members)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_usuario_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  papel user_role DEFAULT 'recepcionista',
  telefone TEXT,
  cro TEXT,
  especialidade TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  data_nascimento DATE,
  genero genero,
  cpf TEXT,
  rg TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  convenio_principal TEXT,
  alergias TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Procedimentos
CREATE TABLE procedimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  duracao_minutos INTEGER DEFAULT 30,
  valor_padrao DECIMAL(10,2),
  cor TEXT DEFAULT '#3b82f6',
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Consultas
CREATE TABLE consultas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  procedimento_id UUID REFERENCES procedimentos(id) ON DELETE SET NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao_minutos INTEGER DEFAULT 30,
  status appointment_status DEFAULT 'agendado',
  observacoes TEXT,
  valor DECIMAL(10,2),
  pago BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Prontuarios
CREATE TABLE prontuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES consultas(id) ON DELETE CASCADE,
  tipo record_type NOT NULL,
  conteudo JSONB NOT NULL,
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- FINANCEIRO - Schema Completo
-- ===========================================

-- Métodos de pagamento configurados
CREATE TABLE metodos_pagamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'transferencia', 'boleto'
  taxas_percentual DECIMAL(5,2) DEFAULT 0,
  taxas_fixa DECIMAL(10,2) DEFAULT 0,
  prazo_deposito INTEGER DEFAULT 0, -- dias para crédito
  adquirente TEXT,
  -- conta_vinculada_id será adicionada depois com ALTER TABLE
  is_padrao BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Contas bancárias
CREATE TABLE contas_bancarias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  tipo TEXT NOT NULL, -- 'conta_corrente', 'poupanca', 'caixa_fisico'
  saldo DECIMAL(15,2) DEFAULT 0,
  is_padrao BOOLEAN DEFAULT FALSE,
  ativa BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Cartões de crédito e débito
CREATE TABLE cartoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  banco TEXT NOT NULL,
  ultimos_digitos TEXT NOT NULL,
  tipo_cartao tipo_cartao NOT NULL DEFAULT 'credito',
  limite DECIMAL(10,2) DEFAULT 0, -- Apenas para crédito
  dia_vencimento INTEGER, -- Apenas para crédito
  dia_fechamento INTEGER, -- Apenas para crédito
  is_corporativo BOOLEAN DEFAULT FALSE, -- Apenas para crédito
  conta_fatura_id UUID REFERENCES contas_bancarias(id) ON DELETE SET NULL,
  is_padrao BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias de Receitas (normalização)
CREATE TABLE categorias_receita (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#3b82f6',
  is_padrao BOOLEAN DEFAULT FALSE,
  ativa BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinica_id, nome)
);

-- Categorias de Despesas (normalização)
CREATE TABLE categorias_despesa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#ef4444',
  is_padrao BOOLEAN DEFAULT FALSE,
  ativa BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinica_id, nome)
);

-- Centros de Custo (para despesas)
CREATE TABLE centros_custo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL, -- 'fixo', 'variavel', 'investimento'
  cor TEXT DEFAULT '#8b5cf6',
  is_padrao BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinica_id, nome)
);

-- Planos de Convênio
CREATE TABLE planos_convenio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  operadora TEXT NOT NULL,
  codigo TEXT,
  descricao TEXT,
  taxa_desconto DECIMAL(5,2) DEFAULT 0,
  prazo_pagamento INTEGER DEFAULT 30,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinica_id, nome, operadora)
);

-- Fornecedores
CREATE TABLE fornecedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome_fantasia TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  categoria_fornecedor TEXT, -- 'material', 'servico', 'equipamento', 'aluguel', etc
  condicoes_pagamento TEXT,
  is_padrao BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinica_id, nome_fantasia)
);

-- Tipos de Documento
CREATE TABLE tipos_documento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  modelo TEXT, -- 'NF-e', 'recibo', 'contrato', 'boleto', 'cupom'
  exige_numero BOOLEAN DEFAULT TRUE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinica_id, nome)
);

-- Tabela principal de transações (agora com FKs válidas)
CREATE TABLE transacoes (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  
  -- Dados básicos
  tipo transaction_type NOT NULL,
  descricao TEXT NOT NULL,
  
  -- Valores (essenciais para controle financeiro)
  valor_bruto DECIMAL(10,2) NOT NULL,
  valor_liquido DECIMAL(10,2) NOT NULL,
  valor_taxas DECIMAL(10,2) DEFAULT 0,
  
  -- Relacionamentos (opcionais por tipo)
  paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,
  fornecedor TEXT,
  plano_id TEXT,
  autorizacao_id TEXT,
  
  -- Financeiro
  categoria TEXT NOT NULL,
  metodo_pagamento_id UUID REFERENCES metodos_pagamento(id) ON DELETE SET NULL,
  conta_origem_id UUID REFERENCES contas_bancarias(id) ON DELETE SET NULL,
  conta_destino_id UUID REFERENCES contas_bancarias(id) ON DELETE SET NULL,
  cartao_id UUID REFERENCES cartoes(id) ON DELETE SET NULL,
  
  -- Datas importantes
  data_compra DATE,
  data_emissao DATE,
  data_vencimento DATE,
  data_pagamento DATE,
  data_credito_prevista DATE,
  
  -- Parcelamento
  total_parcelas INTEGER DEFAULT 1,
  parcela_atual INTEGER DEFAULT 1,
  valor_parcela DECIMAL(10,2),
  data_primeira_parcela DATE,
  
  -- Status e controle
  status transaction_status DEFAULT 'pendente',
  origem_receita TEXT, -- 'particular', 'convenio', 'reembolso', 'parceria'
  centro_custo TEXT,
  tipo_documento TEXT, -- 'NF-e', 'recibo', 'contrato', 'boleto'
  numero_documento TEXT,
  
  -- Campos específicos para convênios
  dados_convenio JSONB DEFAULT '{}', -- {plano: "", autorizacao: "", tipo_atendimento: ""}
  
  -- Observações e anexos
  observacoes TEXT,
  anexos TEXT[], -- Array de URLs para documentos
  
  -- Auditoria
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ===========================================
-- ESTOQUE
-- ===========================================

-- Produtos
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  marca TEXT,
  modelo TEXT,
  cor_tamanho TEXT,
  unidade TEXT DEFAULT 'Unidade',
  quantidade DECIMAL(10,2) DEFAULT 0,
  quantidade_minima DECIMAL(10,2) DEFAULT 0,
  preco DECIMAL(10,2) DEFAULT 0,
  fornecedor TEXT,
  localizacao TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Produto Lotes
CREATE TABLE produto_lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  lote TEXT,
  data_validade DATE,
  quantidade DECIMAL(10,2) DEFAULT 0,
  quantidade_disponivel DECIMAL(10,2) DEFAULT 0,
  fornecedor TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Movimentações de Estoque
CREATE TABLE movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  lote_id UUID REFERENCES produto_lotes(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL, -- 'entrada', 'saida', 'ajuste', 'perda'
  quantidade DECIMAL(10,2) NOT NULL,
  motivo TEXT,
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ÍNDICES
-- ===========================================

-- Índices para performance
CREATE INDEX idx_usuarios_clinica ON usuarios(clinica_id);
CREATE INDEX idx_pacientes_clinica ON pacientes(clinica_id);
CREATE INDEX idx_consultas_clinica ON consultas(clinica_id);
CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX idx_consultas_dentista ON consultas(dentista_id);
CREATE INDEX idx_consultas_data_hora ON consultas(data_hora);
CREATE INDEX idx_consultas_status ON consultas(status);

-- Índices financeiros
CREATE INDEX idx_transacoes_clinica_tipo ON transacoes(clinica_id, tipo);
CREATE INDEX idx_transacoes_status ON transacoes(status);
CREATE INDEX idx_transacoes_data_pagamento ON transacoes(data_pagamento) WHERE data_pagamento IS NOT NULL;
CREATE INDEX idx_transacoes_data_vencimento ON transacoes(data_vencimento) WHERE data_vencimento IS NOT NULL;
CREATE INDEX idx_transacoes_paciente ON transacoes(paciente_id) WHERE paciente_id IS NOT NULL;
CREATE INDEX idx_transacoes_cartao ON transacoes(cartao_id) WHERE cartao_id IS NOT NULL;
CREATE INDEX idx_transacoes_metodo ON transacoes(metodo_pagamento_id) WHERE metodo_pagamento_id IS NOT NULL;
CREATE INDEX idx_transacoes_parcelas ON transacoes(total_parcelas) WHERE total_parcelas > 1;

-- Índices para cartoes
CREATE INDEX idx_cartoes_tipo ON cartoes(tipo_cartao);

-- Índices de estoque
CREATE INDEX idx_produtos_clinica ON produtos(clinica_id);
CREATE INDEX idx_movimentacoes_estoque_clinica ON movimentacoes_estoque(clinica_id);
CREATE INDEX idx_movimentacoes_estoque_produto ON movimentacoes_estoque(produto_id);

-- ===========================================
-- TRIGGERS E FUNÇÕES
-- ===========================================

-- Função para criar dados padrão automaticamente
CREATE OR REPLACE FUNCTION criar_dados_padrao()
RETURNS TRIGGER AS $$
BEGIN
  -- Categorias de receita padrão
  INSERT INTO categorias_receita (clinica_id, nome, is_padrao) VALUES
    (NEW.id, 'Procedimentos Gerais', true),
    (NEW.id, 'Ortodontia', true),
    (NEW.id, 'Implantes', true),
    (NEW.id, 'Estética', true),
    (NEW.id, 'Consultas', true),
    (NEW.id, 'Exames', true),
    (NEW.id, 'Outros', true);
  
  -- Categorias de despesa padrão
  INSERT INTO categorias_despesa (clinica_id, nome, is_padrao) VALUES
    (NEW.id, 'Materiais', true),
    (NEW.id, 'Infraestrutura', true),
    (NEW.id, 'Pessoal', true),
    (NEW.id, 'Marketing', true),
    (NEW.id, 'Equipamentos', true),
    (NEW.id, 'Tecnologia', true),
    (NEW.id, 'Serviços', true),
    (NEW.id, 'Outros', true);
  
  -- Centros de custo padrão
  INSERT INTO centros_custo (clinica_id, nome, tipo, is_padrao) VALUES
    (NEW.id, 'Insumos', 'variavel', true),
    (NEW.id, 'Fixo', 'fixo', true),
    (NEW.id, 'Pessoal', 'fixo', true),
    (NEW.id, 'Marketing', 'variavel', true),
    (NEW.id, 'Equipamentos', 'fixo', true),
    (NEW.id, 'Tecnologia', 'fixo', true),
    (NEW.id, 'Administrativo', 'fixo', true);
  
  -- Tipos de documento padrão
  INSERT INTO tipos_documento (clinica_id, nome, modelo, exige_numero) VALUES
    (NEW.id, 'NF-e', 'NF-e', true),
    (NEW.id, 'Recibo', 'recibo', true),
    (NEW.id, 'Contrato', 'contrato', false),
    (NEW.id, 'Boleto', 'boleto', true),
    (NEW.id, 'Cupom Fiscal', 'cupom', true),
    (NEW.id, 'Outro', 'outro', false);
  
  -- Método de pagamento padrão
  INSERT INTO metodos_pagamento (clinica_id, nome, tipo, is_padrao) VALUES
    (NEW.id, 'Dinheiro', 'dinheiro', true),
    (NEW.id, 'PIX', 'pix', false),
    (NEW.id, 'Transferência Bancária', 'transferencia', false);
  
  -- Conta bancária padrão
  INSERT INTO contas_bancarias (clinica_id, nome, tipo, is_padrao) VALUES
    (NEW.id, 'Caixa Físico', 'caixa_fisico', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar dados padrão quando nova clínica é criada
CREATE TRIGGER trigger_criar_dados_padrao
  AFTER INSERT ON clinicas
  FOR EACH ROW
  EXECUTE FUNCTION criar_dados_padrao();

-- Trigger para validar dados do cartão baseado no tipo
CREATE OR REPLACE FUNCTION validar_dados_cartao()
RETURNS TRIGGER AS $$
BEGIN
  -- Cartões de débito não devem ter dados de crédito
  IF NEW.tipo_cartao = 'debito' THEN
    NEW.limite = 0;
    NEW.dia_vencimento = NULL;
    NEW.dia_fechamento = NULL;
    NEW.is_corporativo = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
CREATE TRIGGER trigger_validar_dados_cartao
  BEFORE INSERT OR UPDATE ON cartoes
  FOR EACH ROW
  EXECUTE FUNCTION validar_dados_cartao();

-- Trigger para atualizar campos de auditoria
CREATE OR REPLACE FUNCTION atualizar_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Aplicar a tabelas que precisam
CREATE TRIGGER trigger_transacoes_atualizado_em
    BEFORE UPDATE ON transacoes
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_atualizado_em();

CREATE TRIGGER trigger_usuarios_atualizado_em
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_atualizado_em();

CREATE TRIGGER trigger_pacientes_atualizado_em
    BEFORE UPDATE ON pacientes
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_atualizado_em();

-- ===========================================
-- VIEWS
-- ===========================================

-- Views para facilitar consultas financeiras
CREATE VIEW vw_receitas AS
SELECT 
  t.*,
  cr.nome as categoria_nome,
  cr.cor as categoria_cor,
  pc.nome as plano_convenio_nome
FROM transacoes t
LEFT JOIN categorias_receita cr ON t.categoria = cr.nome AND cr.clinica_id = t.clinica_id
LEFT JOIN planos_convenio pc ON t.plano_id = pc.nome AND pc.clinica_id = t.clinica_id
WHERE t.tipo = 'receita'
ORDER BY t.data_emissao DESC, t.criado_em DESC;

CREATE VIEW vw_despesas AS
SELECT 
  t.*,
  cd.nome as categoria_nome,
  cd.cor as categoria_cor,
  cc.nome as centro_custo_nome,
  cc.tipo as centro_custo_tipo,
  f.nome_fantasia as fornecedor_nome,
  td.nome as tipo_documento_nome
FROM transacoes t
LEFT JOIN categorias_despesa cd ON t.categoria = cd.nome AND cd.clinica_id = t.clinica_id
LEFT JOIN centros_custo cc ON t.centro_custo = cc.nome AND cc.clinica_id = t.clinica_id
LEFT JOIN fornecedores f ON t.fornecedor = f.nome_fantasia AND f.clinica_id = t.clinica_id
LEFT JOIN tipos_documento td ON t.tipo_documento = td.nome AND td.clinica_id = t.clinica_id
WHERE t.tipo = 'despesa'
ORDER BY t.data_emissao DESC, t.criado_em DESC;

CREATE VIEW vw_fluxo_caixa AS
SELECT 
    tipo,
    CASE WHEN tipo = 'receita' THEN valor_liquido ELSE -valor_liquido END as fluxo,
    data_pagamento,
    categoria,
    metodo_pagamento_id,
    status,
    descricao
FROM transacoes 
WHERE data_pagamento IS NOT NULL
ORDER BY data_pagamento DESC;

-- ===========================================
-- FUNÇÕES ÚTEIS
-- ===========================================

-- Função para obter categorias dinamicamente
CREATE OR REPLACE FUNCTION get_categorias_receita(p_clinica_id UUID)
RETURNS TABLE(id UUID, nome TEXT, cor TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT id, nome, cor
  FROM categorias_receita
  WHERE clinica_id = p_clinica_id AND ativa = true
  ORDER BY is_padrao DESC, nome;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_categorias_despesa(p_clinica_id UUID)
RETURNS TABLE(id UUID, nome TEXT, cor TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT id, nome, cor
  FROM categorias_despesa
  WHERE clinica_id = p_clinica_id AND ativa = true
  ORDER BY is_padrao DESC, nome;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_centros_custo(p_clinica_id UUID)
RETURNS TABLE(id UUID, nome TEXT, tipo TEXT, cor TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT id, nome, tipo, cor
  FROM centros_custo
  WHERE clinica_id = p_clinica_id AND ativa = true
  ORDER BY is_padrao DESC, nome;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular saldo de conta
CREATE OR REPLACE FUNCTION calcular_saldo_conta(conta_id UUID, data_limite DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    saldo_result DECIMAL(15,2);
BEGIN
    SELECT COALESCE(SUM(
        CASE 
            WHEN tipo = 'receita' AND conta_destino_id = conta_id THEN valor_liquido
            WHEN tipo = 'despesa' AND conta_origem_id = conta_id THEN -valor_liquido
            ELSE 0
        END
    ), 0) INTO saldo_result
    FROM transacoes 
    WHERE data_pagamento <= data_limite 
    AND status = 'pago'
    AND (conta_destino_id = conta_id OR conta_origem_id = conta_id);
    
    RETURN saldo_result;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- POLÍTICAS RLS (Row Level Security)
-- ===========================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS nas tabelas financeiras
ALTER TABLE metodos_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_receita ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_despesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_convenio ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_documento ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessidade de RLS)
CREATE POLICY "Usuários verem dados da própria clínica" ON clinicas
  FOR ALL USING (id = auth.uid() OR id IN (SELECT clinica_id FROM usuarios WHERE auth_usuario_id = auth.uid()));

CREATE POLICY "Usuários verem usuários da própria clínica" ON usuarios
  FOR ALL USING (clinica_id IN (SELECT id FROM clinicas WHERE id IN (SELECT clinica_id FROM usuarios WHERE auth_usuario_id = auth.uid())));

CREATE POLICY "Usuários verem pacientes da própria clínica" ON pacientes
  FOR ALL USING (clinica_id IN (SELECT id FROM clinicas WHERE id IN (SELECT clinica_id FROM usuarios WHERE auth_usuario_id = auth.uid())));

CREATE POLICY "Usuários verem transações da própria clínica" ON transacoes
  FOR ALL USING (clinica_id IN (SELECT id FROM clinicas WHERE id IN (SELECT clinica_id FROM usuarios WHERE auth_usuario_id = auth.uid())));

-- Replicar para outras tabelas financeiras...
CREATE POLICY "Ver categorias da própria clínica" ON categorias_receita
  FOR ALL USING (clinica_id IN (SELECT id FROM clinicas WHERE id IN (SELECT clinica_id FROM usuarios WHERE auth_usuario_id = auth.uid())));

CREATE POLICY "Ver centros_custo da própria clínica" ON centros_custo
  FOR ALL USING (clinica_id IN (SELECT id FROM clinicas WHERE id IN (SELECT clinica_id FROM usuarios WHERE auth_usuario_id = auth.uid())));

CREATE POLICY "Ver fornecedores da própria clínica" ON fornecedores
  FOR ALL USING (clinica_id IN (SELECT id FROM clinicas WHERE id IN (SELECT clinica_id FROM usuarios WHERE auth_usuario_id = auth.uid())));

-- ===========================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- ===========================================

COMMENT ON TABLE transacoes IS 'Tabela unificada para controle de receitas e despesas da clínica';
COMMENT ON COLUMN transacoes.valor_bruto IS 'Valor total antes de taxas e descontos';
COMMENT ON COLUMN transacoes.valor_liquido IS 'Valor líquido após taxas (valor que efetivamente entra/sai)';
COMMENT ON COLUMN transacoes.valor_taxas IS 'Valor das taxas/descontos (diferença entre bruto e líquido)';
COMMENT ON COLUMN transacoes.data_credito_prevista IS 'Data prevista para crédito baseada no método de pagamento';
COMMENT ON COLUMN transacoes.origem_receita IS 'Origem da receita: particular, convênio, reembolso, etc';
COMMENT ON COLUMN transacoes.centro_custo IS 'Centro de custo para despesas: insumos, fixo, pessoal, etc';
COMMENT ON COLUMN transacoes.tipo_documento IS 'Tipo de documento fiscal: NF-e, recibo, contrato, boleto';

COMMENT ON TABLE cartoes IS 'Cartões de crédito e débito cadastrados da clínica';
COMMENT ON COLUMN cartoes.tipo_cartao IS 'Tipo do cartão: crédito ou débito';
COMMENT ON COLUMN cartoes.limite IS 'Limite disponível (apenas para cartões de crédito)';
COMMENT ON COLUMN cartoes.dia_vencimento IS 'Dia de vencimento da fatura (apenas para crédito)';
COMMENT ON COLUMN cartoes.dia_fechamento IS 'Dia de fechamento da fatura (apenas para crédito)';

COMMENT ON TABLE categorias_receita IS 'Categorias personalizáveis para receitas da clínica';
COMMENT ON TABLE categorias_despesa IS 'Categorias personalizáveis para despesas da clínica';
COMMENT ON TABLE centros_custo IS 'Centros de custo para controle de despesas';
COMMENT ON TABLE planos_convenio IS 'Planos de convênio aceitos pela clínica';
COMMENT ON TABLE fornecedores IS 'Cadastro de fornecedores para despesas';
COMMENT ON TABLE tipos_documento IS 'Tipos de documentos fiscais aceitos';

-- ===========================================
-- ALTER TABLES PARA FKs CIRCULARES
-- ===========================================

-- Adicionar FK para conta_vinculada_id em metodos_pagamento
ALTER TABLE metodos_pagamento 
ADD COLUMN conta_vinculada_id UUID REFERENCES contas_bancarias(id) ON DELETE SET NULL;

-- ===========================================
-- FINALIZAÇÃO
-- ===========================================

-- Schema completo criado com sucesso!
-- Pronto para uso com todas as funcionalidades financeiras e operacionais
