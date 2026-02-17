-- ===========================================
-- RESTAURA - Sistema de Convites Completo
-- Unificado: Convites de Clínica + Convites de Fundador
-- ===========================================
-- Data: 2024-02-09
-- Descrição: Schema completo para sistema de convites SaaS

-- Enable UUID extension (se não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- CONVITES PARA CLÍNICAS EXISTENTES
-- ===========================================

-- Tabela de convites para clínicas já existentes
CREATE TABLE convites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  papel user_role DEFAULT 'recepcionista',
  token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'expirado', 'cancelado')),
  convidado_por_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  aceito_por_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data_expiracao TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  aceito_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinica_id, email, status) -- Evita convites duplicados pendentes
);

-- ===========================================
-- CONVITES PARA FUNDADORES (Criação de Clínicas)
-- ===========================================

-- Tabela de convites para fundadores (sem clínica vinculada)
CREATE TABLE convites_fundador (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'expirado', 'cancelado')),
  convidado_por_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin do sistema
  aceito_por_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinica_criada_id UUID REFERENCES clinicas(id) ON DELETE SET NULL,
  data_expiracao TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'), -- Mais tempo para fundadores
  aceito_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ÍNDICES
-- ===========================================

-- Índices para convites de clínica
CREATE INDEX idx_convites_clinica ON convites(clinica_id);
CREATE INDEX idx_convites_email ON convites(email);
CREATE INDEX idx_convites_token ON convites(token);
CREATE INDEX idx_convites_status ON convites(status);

-- Índices para convites de fundador
CREATE INDEX idx_convites_fundador_email ON convites_fundador(email);
CREATE INDEX idx_convites_fundador_token ON convites_fundador(token);
CREATE INDEX idx_convites_fundador_status ON convites_fundador(status);

-- ===========================================
-- TRIGGERS E FUNÇÕES
-- ===========================================

-- Função para expirar convites de clínica automaticamente
CREATE OR REPLACE FUNCTION expirar_convites()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE convites 
  SET status = 'expirado', atualizado_em = NOW()
  WHERE status = 'pendente' AND data_expiracao < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para expirar convites de clínica
CREATE TRIGGER trigger_expirar_convites
  AFTER INSERT OR UPDATE ON convites
  FOR EACH ROW
  EXECUTE FUNCTION expirar_convites();

-- Função para expirar convites de fundador automaticamente
CREATE OR REPLACE FUNCTION expirar_convites_fundador()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE convites_fundador 
  SET status = 'expirado', atualizado_em = NOW()
  WHERE status = 'pendente' AND data_expiracao < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para expirar convites de fundador
CREATE TRIGGER trigger_expirar_convites_fundador
  AFTER INSERT OR UPDATE ON convites_fundador
  FOR EACH ROW
  EXECUTE FUNCTION expirar_convites_fundador();

-- Função para atualizar data de aceite (convites de clínica)
CREATE OR REPLACE FUNCTION atualizar_data_aceite()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'aceito' AND OLD.status != 'aceito' THEN
    NEW.aceito_em = NOW();
  END IF;
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para convites de clínica
CREATE TRIGGER trigger_convites_atualizado_em
  BEFORE UPDATE ON convites
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_data_aceite();

-- Função para atualizar convite de fundador
CREATE OR REPLACE FUNCTION atualizar_convite_fundador()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'aceito' AND OLD.status != 'aceito' THEN
    NEW.aceito_em = NOW();
  END IF;
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para convites de fundador
CREATE TRIGGER trigger_convites_fundador_atualizado_em
  BEFORE UPDATE ON convites_fundador
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_convite_fundador();

-- ===========================================
-- FUNÇÕES DE NEGÓCIO
-- ===========================================

-- Função para criar convite de clínica
CREATE OR REPLACE FUNCTION criar_convite(
  p_clinica_id UUID,
  p_email TEXT,
  p_convidado_por_id UUID,
  p_papel user_role DEFAULT 'recepcionista'
)
RETURNS UUID AS $$
DECLARE
  v_invite_id UUID;
BEGIN
  -- Verificar se já existe convite pendente
  SELECT id INTO v_invite_id
  FROM convites 
  WHERE clinica_id = p_clinica_id 
    AND email = p_email 
    AND status = 'pendente';
  
  IF v_invite_id IS NOT NULL THEN
    RETURN v_invite_id; -- Retorna convite existente
  END IF;
  
  -- Criar novo convite
  INSERT INTO convites (clinica_id, email, papel, convidado_por_id)
  VALUES (p_clinica_id, p_email, p_papel, p_convidado_por_id)
  RETURNING id INTO v_invite_id;
  
  RETURN v_invite_id;
END;
$$ LANGUAGE plpgsql;

-- Função para aceitar convite de clínica
CREATE OR REPLACE FUNCTION aceitar_convite(
  p_token UUID,
  p_auth_usuario_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_invite RECORD;
BEGIN
  -- Buscar convite válido
  SELECT * INTO v_invite
  FROM convites 
  WHERE token = p_token 
    AND status = 'pendente' 
    AND data_expiracao > NOW();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar convite
  UPDATE convites 
  SET status = 'aceito', 
      aceito_por_id = p_auth_usuario_id
  WHERE id = v_invite.id;
  
  -- Criar usuário na tabela usuarios
  INSERT INTO usuarios (
    auth_usuario_id,
    clinica_id,
    email,
    nome,
    papel
  ) VALUES (
    p_auth_usuario_id,
    v_invite.clinica_id,
    v_invite.email,
    COALESCE(
      (SELECT name FROM auth.users WHERE id = p_auth_usuario_id),
      split_part(v_invite.email, '@', 1)
    ),
    v_invite.papel
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para criar convite de fundador
CREATE OR REPLACE FUNCTION criar_convite_fundador(
  p_email TEXT,
  p_convidado_por_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_invite_id UUID;
BEGIN
  -- Verificar se já existe convite pendente
  SELECT id INTO v_invite_id
  FROM convites_fundador 
  WHERE email = p_email 
    AND status = 'pendente';
  
  IF v_invite_id IS NOT NULL THEN
    RETURN v_invite_id; -- Retorna convite existente
  END IF;
  
  -- Criar novo convite
  INSERT INTO convites_fundador (email, convidado_por_id)
  VALUES (p_email, p_convidado_por_id)
  RETURNING id INTO v_invite_id;
  
  RETURN v_invite_id;
END;
$$ LANGUAGE plpgsql;

-- Função para aceitar convite e criar clínica
CREATE OR REPLACE FUNCTION aceitar_convite_fundador(
  p_token UUID,
  p_auth_usuario_id UUID,
  p_clinica_nome TEXT
)
RETURNS UUID AS $$
DECLARE
  v_invite RECORD;
  v_clinica_id UUID;
BEGIN
  -- Buscar convite válido
  SELECT * INTO v_invite
  FROM convites_fundador 
  WHERE token = p_token 
    AND status = 'pendente' 
    AND data_expiracao > NOW();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite inválido ou expirado';
  END IF;
  
  -- Criar clínica
  INSERT INTO clinicas (nome, slug, documento, telefone, email)
  VALUES (
    p_clinica_nome,
    lower(regexp_replace(p_clinica_nome, '[^a-zA-Z0-9\s]', '', 'g')),
    NULL,
    NULL,
    NULL
  )
  RETURNING id INTO v_clinica_id;
  
  -- Atualizar convite
  UPDATE convites_fundador 
  SET status = 'aceito', 
      aceito_por_id = p_auth_usuario_id,
      clinica_criada_id = v_clinica_id
  WHERE id = v_invite.id;
  
  -- Criar usuário como admin da clínica
  INSERT INTO usuarios (
    auth_usuario_id,
    clinica_id,
    email,
    nome,
    papel
  ) VALUES (
    p_auth_usuario_id,
    v_clinica_id,
    v_invite.email,
    COALESCE(
      (SELECT name FROM auth.users WHERE id = p_auth_usuario_id),
      split_part(v_invite.email, '@', 1)
    ),
    'admin' -- Fundador vira admin
  );
  
  RETURN v_clinica_id;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se usuário é fundador
CREATE OR REPLACE FUNCTION is_fundador(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_invite_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_invite_count
  FROM convites_fundador 
  WHERE aceito_por_id = p_user_id 
    AND status = 'aceito';
  
  RETURN v_invite_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Habilitar RLS nas tabelas de convites
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites_fundador ENABLE ROW LEVEL SECURITY;

-- Políticas para convites de clínica
CREATE POLICY "Admins verem todos os convites da clínica" ON convites
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios 
      WHERE auth_usuario_id = auth.uid() AND papel = 'admin'
    )
  );

CREATE POLICY "Usuários verem próprios convites" ON convites
  FOR SELECT USING (
    email = auth.email() OR 
    aceito_por_id = auth.uid()
  );

-- Políticas para convites de fundador
CREATE POLICY "Admins sistema gerenciam convites fundador" ON convites_fundador
  FOR ALL USING (
    -- Apenas super_admins ou admin do sistema podem ver
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = ANY(ARRAY['admin@restaura.com', 'suporte@restaura.com']) -- Emails admin
    )
  );

CREATE POLICY "Usuários verem próprios convites fundador" ON convites_fundador
  FOR SELECT USING (
    email = auth.email() OR 
    aceito_por_id = auth.uid()
  );