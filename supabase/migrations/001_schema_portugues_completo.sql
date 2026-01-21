-- ===========================================
-- RESTAURA - Database Schema Completo em Português
-- Sistema de Gestão Odontológica
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ENUMS
-- ===========================================

CREATE TYPE user_role AS ENUM ('admin', 'dentista', 'assistente', 'recepcionista');
CREATE TYPE appointment_status AS ENUM ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu');
CREATE TYPE record_type AS ENUM ('anamnesia', 'evolução', 'prescrição', 'certificado', 'referência');
CREATE TYPE transaction_type AS ENUM ('receita', 'despesa');
CREATE TYPE transaction_status AS ENUM ('pendente', 'pago', 'cancelado', 'estornado');
CREATE TYPE genero AS ENUM ('masculino', 'feminino', 'outro');

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
  url_avatar TEXT,
  especialidade TEXT,
  cro TEXT,
  ativo BOOLEAN DEFAULT true,
  configuracoes JSONB DEFAULT '{}',
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
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  profissao TEXT,
  tipo_sanguineo TEXT,
  fator_rh TEXT,
  contato_emergencia TEXT,
  telefone_emergencia TEXT,
  convenio TEXT,
  carteira_convenio TEXT,
  -- Histórico Médico
  alergias TEXT,
  doencas_sistemicas TEXT,
  medicamentos TEXT,
  condicoes_especiais TEXT,
  -- Histórico Odontológico
  ultima_consulta_odonto DATE,
  tratamentos_anteriores TEXT,
  habitos TEXT,
  higiene_bucal TEXT,
  observacoes TEXT,
  url_avatar TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Procedimentos (services offered)
CREATE TABLE procedimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_minutos INTEGER DEFAULT 30,
  preco DECIMAL(10,2) DEFAULT 0,
  categoria TEXT,
  cor TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Consultas (appointments)
CREATE TABLE consultas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  procedimento_id UUID REFERENCES procedimentos(id) ON DELETE SET NULL,
  horario_inicio TIMESTAMPTZ NOT NULL,
  horario_fim TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'agendado',
  observacoes TEXT,
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Prontuarios (medical records)
CREATE TABLE prontuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,
  tipo record_type NOT NULL,
  titulo TEXT NOT NULL,
  conteudo JSONB NOT NULL DEFAULT '{}',
  anexos TEXT[],
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Transacoes (financial transactions)
CREATE TABLE transacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,
  tipo transaction_type NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  metodo_pagamento TEXT,
  status transaction_status DEFAULT 'pendente',
  data_vencimento DATE,
  pago_em TIMESTAMPTZ,
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
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
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  numero_lote TEXT NOT NULL,
  quantidade DECIMAL(10,2) DEFAULT 0,
  data_fabricacao DATE,
  data_validade DATE,
  data_compra DATE,
  preco_compra DECIMAL(10,2),
  fornecedor TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Procedimento Materiais
CREATE TABLE procedimento_materiais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  procedimento_id UUID NOT NULL REFERENCES procedimentos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade_default DECIMAL(10,2) NOT NULL DEFAULT 1,
  quantidade_min DECIMAL(10,2) DEFAULT 1,
  quantidade_max DECIMAL(10,2) DEFAULT 10,
  obrigatorio BOOLEAN DEFAULT true,
  variavel BOOLEAN DEFAULT false,
  produto_substituto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  notas_clinicas TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(clinica_id, procedimento_id, produto_id)
);

-- Consumo Materiais
CREATE TABLE consumo_materiais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  consulta_id UUID NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  lote_id UUID REFERENCES produto_lotes(id) ON DELETE SET NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  preco_unitario DECIMAL(10,2),
  preco_total DECIMAL(10,2),
  consumido_por_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Movimentacoes Estoque
CREATE TABLE movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  lote_id UUID REFERENCES produto_lotes(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste', 'transferencia')),
  quantidade DECIMAL(10,2) NOT NULL,
  quantidade_anterior DECIMAL(10,2),
  nova_quantidade DECIMAL(10,2),
  motivo TEXT,
  tipo_referencia TEXT, -- 'consulta', 'compra', 'ajuste_manual', 'vencimento'
  id_referencia UUID, -- ID da consulta, compra, etc
  paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,
  realizado_por_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Índices principais
CREATE INDEX idx_usuarios_clinica ON usuarios(clinica_id);
CREATE INDEX idx_usuarios_auth_usuario ON usuarios(auth_usuario_id);
CREATE INDEX idx_pacientes_clinica ON pacientes(clinica_id);
CREATE INDEX idx_pacientes_nome ON pacientes(clinica_id, nome);
CREATE INDEX idx_consultas_clinica ON consultas(clinica_id);
CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX idx_consultas_dentista ON consultas(dentista_id);
CREATE INDEX idx_consultas_data ON consultas(clinica_id, horario_inicio);
CREATE INDEX idx_prontuarios_paciente ON prontuarios(paciente_id);
CREATE INDEX idx_transacoes_clinica ON transacoes(clinica_id);
CREATE INDEX idx_transacoes_paciente ON transacoes(paciente_id);
CREATE INDEX idx_transacoes_data ON transacoes(clinica_id, criado_em);

-- Índices estoque
CREATE INDEX idx_produtos_clinica ON produtos(clinica_id);
CREATE INDEX idx_produtos_categoria ON produtos(clinica_id, categoria);
CREATE INDEX idx_produtos_ativo ON produtos(clinica_id, ativo);
CREATE INDEX idx_produto_lotes_produto ON produto_lotes(produto_id);
CREATE INDEX idx_produto_lotes_expiry ON produto_lotes(data_validade);
CREATE INDEX idx_produto_lotes_ativo ON produto_lotes(ativo);
CREATE INDEX idx_procedimento_materiais_procedimento ON procedimento_materiais(procedimento_id);
CREATE INDEX idx_procedimento_materiais_produto ON procedimento_materiais(produto_id);
CREATE INDEX idx_consumo_materiais_consulta ON consumo_materiais(consulta_id);
CREATE INDEX idx_consumo_materiais_paciente ON consumo_materiais(paciente_id);
CREATE INDEX idx_consumo_materiais_produto ON consumo_materiais(produto_id);
CREATE INDEX idx_consumo_materiais_date ON consumo_materiais(criado_em);
CREATE INDEX idx_movimentacoes_produto ON movimentacoes_estoque(produto_id);
CREATE INDEX idx_movimentacoes_date ON movimentacoes_estoque(criado_em);
CREATE INDEX idx_movimentacoes_type ON movimentacoes_estoque(tipo);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Atualizar coluna atualizado_em automaticamente
CREATE OR REPLACE FUNCTION atualizar_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_clinicas_updated_at BEFORE UPDATE ON clinicas
  FOR EACH ROW EXECUTE FUNCTION atualizar_atualizado_em();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION atualizar_atualizado_em();

CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION atualizar_atualizado_em();

CREATE TRIGGER update_procedimentos_updated_at BEFORE UPDATE ON procedimentos
  FOR EACH ROW EXECUTE FUNCTION atualizar_atualizado_em();

CREATE TRIGGER update_consultas_updated_at BEFORE UPDATE ON consultas
  FOR EACH ROW EXECUTE FUNCTION atualizar_atualizado_em();

CREATE TRIGGER update_prontuarios_updated_at BEFORE UPDATE ON prontuarios
  FOR EACH ROW EXECUTE FUNCTION atualizar_atualizado_em();

CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes
  FOR EACH ROW EXECUTE FUNCTION atualizar_atualizado_em();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION atualizar_atualizado_em();

CREATE TRIGGER update_produto_lotes_updated_at BEFORE UPDATE ON produto_lotes
  FOR EACH ROW EXECUTE FUNCTION atualizar_atualizado_em();

CREATE TRIGGER update_procedimento_materiais_updated_at BEFORE UPDATE ON procedimento_materiais
  FOR EACH ROW EXECUTE FUNCTION atualizar_atualizado_em();

-- Trigger para atualizar estoque após consumo
CREATE OR REPLACE FUNCTION fn_atualizar_estoque_apos_consumo()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar quantidade do produto
  UPDATE produtos 
  SET quantidade = quantidade - NEW.quantidade
  WHERE id = NEW.produto_id;
  
  -- Atualizar quantidade do lote se especificado
  IF NEW.lote_id IS NOT NULL THEN
    UPDATE produto_lotes 
    SET quantidade = quantidade - NEW.quantidade
    WHERE id = NEW.lote_id;
  END IF;
  
  -- Registrar movimentação
  INSERT INTO movimentacoes_estoque (
    clinica_id, produto_id, lote_id, tipo, quantidade,
    quantidade_anterior, nova_quantidade, motivo,
    tipo_referencia, id_referencia, paciente_id, consulta_id, realizado_por_id
  )
  SELECT 
    NEW.clinica_id,
    NEW.produto_id,
    NEW.lote_id,
    'saida',
    NEW.quantidade,
    p.quantidade + NEW.quantidade,
    p.quantidade,
    'Consumo em procedimento',
    'consulta',
    NEW.consulta_id,
    NEW.paciente_id,
    NEW.consulta_id,
    NEW.consumido_por_id
  FROM produtos p WHERE p.id = NEW.produto_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_consumo_atualiza_estoque
  AFTER INSERT ON consumo_materiais
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_estoque_apos_consumo();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimento_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumo_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- Get user's clinic ID
CREATE OR REPLACE FUNCTION get_user_clinica_id()
RETURNS UUID AS $$
  SELECT clinica_id FROM usuarios WHERE auth_usuario_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Policies para clinicas
CREATE POLICY "Usuarios podem visualizar sua própria clínica" ON clinicas
  FOR SELECT USING (id = get_user_clinica_id());

CREATE POLICY "Admins podem atualizar sua clínica" ON clinicas
  FOR UPDATE USING (
    id = get_user_clinica_id() AND
    EXISTS (SELECT 1 FROM usuarios WHERE auth_usuario_id = auth.uid() AND papel = 'admin')
  );

-- Policies para usuarios
CREATE POLICY "Usuarios podem visualizar colegas da clínica" ON usuarios
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Admins podem gerenciar usuarios" ON usuarios
  FOR ALL USING (
    clinica_id = get_user_clinica_id() AND
    EXISTS (SELECT 1 FROM usuarios WHERE auth_usuario_id = auth.uid() AND papel = 'admin')
  );

-- Policies para pacientes
CREATE POLICY "Staff pode visualizar pacientes da clínica" ON pacientes
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Staff pode gerenciar pacientes da clínica" ON pacientes
  FOR ALL USING (clinica_id = get_user_clinica_id());

-- Policies para procedimentos
CREATE POLICY "Staff pode visualizar procedimentos da clínica" ON procedimentos
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Admins podem gerenciar procedimentos" ON procedimentos
  FOR ALL USING (
    clinica_id = get_user_clinica_id() AND
    EXISTS (SELECT 1 FROM usuarios WHERE auth_usuario_id = auth.uid() AND papel = 'admin')
  );

-- Policies para consultas
CREATE POLICY "Staff pode visualizar consultas da clínica" ON consultas
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Staff pode gerenciar consultas da clínica" ON consultas
  FOR ALL USING (clinica_id = get_user_clinica_id())
  WITH CHECK (clinica_id = get_user_clinica_id());

-- Policies para prontuarios
CREATE POLICY "Dentistas podem visualizar prontuarios da clínica" ON prontuarios
  FOR SELECT USING (
    clinica_id = get_user_clinica_id() AND
    EXISTS (SELECT 1 FROM usuarios WHERE auth_usuario_id = auth.uid() AND papel IN ('admin', 'dentista'))
  );

CREATE POLICY "Dentistas podem criar prontuarios" ON prontuarios
  FOR INSERT WITH CHECK (
    clinica_id = get_user_clinica_id() AND
    EXISTS (SELECT 1 FROM usuarios WHERE auth_usuario_id = auth.uid() AND papel IN ('admin', 'dentista'))
  );

-- Policies para transacoes
CREATE POLICY "Staff pode visualizar transacoes da clínica" ON transacoes
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Admins podem gerenciar transacoes" ON transacoes
  FOR ALL USING (
    clinica_id = get_user_clinica_id() AND
    EXISTS (SELECT 1 FROM usuarios WHERE auth_usuario_id = auth.uid() AND papel = 'admin')
  );

-- Policies para produtos
CREATE POLICY "Staff pode visualizar produtos da clínica" ON produtos
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Staff pode gerenciar produtos da clínica" ON produtos
  FOR ALL USING (clinica_id = get_user_clinica_id());

-- Policies para lotes
CREATE POLICY "Staff pode visualizar lotes da clínica" ON produto_lotes
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Staff pode gerenciar lotes da clínica" ON produto_lotes
  FOR ALL USING (clinica_id = get_user_clinica_id());

-- Policies para procedimento_materiais
CREATE POLICY "Staff pode visualizar materiais de procedimentos" ON procedimento_materiais
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Admins podem gerenciar materiais de procedimentos" ON procedimento_materiais
  FOR ALL USING (
    clinica_id = get_user_clinica_id() AND
    EXISTS (SELECT 1 FROM usuarios WHERE auth_usuario_id = auth.uid() AND papel IN ('admin', 'dentista'))
  );

-- Policies para consumo_materiais
CREATE POLICY "Staff pode visualizar consumo da clínica" ON consumo_materiais
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Dentistas podem registrar consumo" ON consumo_materiais
  FOR INSERT WITH CHECK (
    clinica_id = get_user_clinica_id() AND
    EXISTS (SELECT 1 FROM usuarios WHERE auth_usuario_id = auth.uid() AND papel IN ('admin', 'dentista', 'assistente'))
  );

-- Policies para movimentacoes
CREATE POLICY "Staff pode visualizar movimentações da clínica" ON movimentacoes_estoque
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Staff pode registrar movimentações" ON movimentacoes_estoque
  FOR INSERT WITH CHECK (clinica_id = get_user_clinica_id());

-- ===========================================
-- COMENTÁRIOS EM PORTUGUÊS
-- ===========================================

COMMENT ON TABLE clinicas IS 'Clínicas odontológicas cadastradas no sistema';
COMMENT ON TABLE usuarios IS 'Usuários (staff) das clínicas';
COMMENT ON TABLE pacientes IS 'Pacientes das clínicas';
COMMENT ON TABLE procedimentos IS 'Procedimentos odontológicos oferecidos';
COMMENT ON TABLE consultas IS 'Consultas e agendamentos dos pacientes';
COMMENT ON TABLE prontuarios IS 'Prontuários médicos dos pacientes';
COMMENT ON TABLE transacoes IS 'Transações financeiras';
COMMENT ON TABLE produtos IS 'Produtos do estoque';
COMMENT ON TABLE produto_lotes IS 'Lotes de produtos com validade';
COMMENT ON TABLE procedimento_materiais IS 'Materiais necessários por procedimento';
COMMENT ON TABLE consumo_materiais IS 'Registro de consumo de materiais em consultas';
COMMENT ON TABLE movimentacoes_estoque IS 'Histórico de movimentações do estoque';

-- Comentários de colunas importantes
COMMENT ON COLUMN pacientes.tipo_sanguineo IS 'Tipo sanguíneo do paciente (A, B, AB, O)';
COMMENT ON COLUMN pacientes.fator_rh IS 'Fator RH (+ ou -)';
COMMENT ON COLUMN pacientes.alergias IS 'Alergias a medicamentos, materiais dentários, alimentos, etc.';
COMMENT ON COLUMN pacientes.doencas_sistemicas IS 'Doenças sistêmicas relevantes (diabetes, hipertensão, etc.)';
COMMENT ON COLUMN pacientes.medicamentos IS 'Medicamentos de uso contínuo';
COMMENT ON COLUMN pacientes.condicoes_especiais IS 'Condições especiais (gravidez, lactação, deficiências)';
COMMENT ON COLUMN pacientes.ultima_consulta_odonto IS 'Data da última consulta odontológica';
COMMENT ON COLUMN pacientes.tratamentos_anteriores IS 'Tratamentos odontológicos anteriores';
COMMENT ON COLUMN pacientes.higiene_bucal IS 'Avaliação da higiene bucal (Excelente, Boa, Regular, Ruim)';
COMMENT ON COLUMN procedimentos.duracao_minutos IS 'Duração estimada em minutos';
COMMENT ON COLUMN procedimentos.preco IS 'Preço padrão do procedimento';
COMMENT ON COLUMN consultas.horario_inicio IS 'Horário de início da consulta';
COMMENT ON COLUMN consultas.horario_fim IS 'Horário de término da consulta';
COMMENT ON COLUMN consultas.observacoes IS 'Observações sobre a consulta';
COMMENT ON COLUMN produtos.quantidade_minima IS 'Quantidade mínima para alerta de estoque baixo';
COMMENT ON COLUMN produto_lotes.numero_lote IS 'Número do lote do produto';
COMMENT ON COLUMN produto_lotes.data_validade IS 'Data de validade do lote';
COMMENT ON COLUMN consumo_materiais.quantidade IS 'Quantidade consumida do material';
