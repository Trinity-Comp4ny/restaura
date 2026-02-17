-- ===========================================
-- RESTAURA - Fluxo de Caixa e Inadimplência
-- Extensão do schema para suporte a parcelas e contas a pagar/receber
-- ===========================================

-- ===========================================
-- PLANOS DE PARCELAMENTO (para tratamentos e vendas)
-- ===========================================

CREATE TABLE planos_parcelamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,
  
  -- Dados do plano
  descricao TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  valor_entrada DECIMAL(10,2) DEFAULT 0,
  quantidade_parcelas INTEGER NOT NULL DEFAULT 1,
  valor_parcela DECIMAL(10,2) NOT NULL,
  
  -- Datas
  data_inicio DATE NOT NULL,
  data_primeira_parcela DATE NOT NULL,
  intervalo_dias INTEGER DEFAULT 30, -- intervalo entre parcelas
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'quitado', 'suspenso', 'cancelado')),
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- PARCELAS (individual de cada plano)
-- ===========================================

CREATE TABLE parcelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plano_id UUID NOT NULL REFERENCES planos_parcelamento(id) ON DELETE CASCADE,
  
  -- Dados da parcela
  numero INTEGER NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  
  -- Datas
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'a_vencer', 'cancelado')),
  
  -- Pagamento
  metodo_pagamento TEXT,
  forma_pagamento TEXT, -- 'dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'boleto', 'transferencia'
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CONTAS A PAGAR (despesas fixas e variáveis)
-- ===========================================

CREATE TABLE contas_pagar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  
  -- Dados da conta
  descricao TEXT NOT NULL,
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  fornecedor_nome TEXT, -- para casos sem fornecedor cadastrado
  
  -- Valores
  valor_total DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  
  -- Categoria e centro de custo
  categoria TEXT NOT NULL,
  centro_custo_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,
  
  -- Datas
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  
  -- Parcelamento
  quantidade_parcelas INTEGER DEFAULT 1,
  parcela_atual INTEGER DEFAULT 1,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'a_vencer', 'cancelado', 'renegociado')),
  
  -- Documentos
  tipo_documento TEXT, -- 'nf', 'recibo', 'boleto', 'contrato'
  numero_documento TEXT,
  anexo_url TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CONTAS A RECEBER (receitas parceladas)
-- ===========================================

CREATE TABLE contas_receber (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  
  -- Relacionamento
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,
  plano_parcelamento_id UUID REFERENCES planos_parcelamento(id) ON DELETE SET NULL,
  parcela_id UUID REFERENCES parcelas(id) ON DELETE SET NULL,
  
  -- Dados da conta
  descricao TEXT NOT NULL,
  
  -- Valores
  valor_total DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  
  -- Origem
  origem TEXT NOT NULL, -- 'consulta', 'tratamento', 'procedimento', 'produto', 'servico'
  
  -- Datas
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  
  -- Pagamento
  metodo_pagamento TEXT,
  forma_pagamento TEXT,
  convenio_id UUID REFERENCES planos_convenio(id) ON DELETE SET NULL,
  autorizacao_convenio TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'a_vencer', 'cancelado', 'renegociado')),
  
  -- Documentos
  numero_documento TEXT,
  anexo_url TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- HISTÓRICO DE CONTATO COM INADIMPLENTES
-- ===========================================

CREATE TABLE contatos_inadimplencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  
  -- Relacionamento
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  conta_receber_id UUID REFERENCES contas_receber(id) ON DELETE SET NULL,
  
  -- Contato
  tipo_contato TEXT NOT NULL CHECK (tipo_contato IN ('telefone', 'whatsapp', 'email', 'sms')),
  contato_realizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responsavel_contato_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  
  -- Resultado
  status_contato TEXT NOT NULL CHECK (status_contato IN ('contato_realizado', 'nao_atendeu', 'mensagem_deixada', 'promessa_pagamento', 'negociacao', 'recusa')),
  observacoes TEXT,
  
  -- Próxima ação
  proximo_contato_em DATE,
  proxima_acao TEXT,
  
  -- Auditoria
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ÍNDICES
-- ===========================================

-- Índices para planos de parcelamento
CREATE INDEX idx_planos_parcelamento_clinica ON planos_parcelamento(clinica_id);
CREATE INDEX idx_planos_parcelamento_paciente ON planos_parcelamento(paciente_id);
CREATE INDEX idx_planos_parcelamento_status ON planos_parcelamento(status);

-- Índices para parcelas
CREATE INDEX idx_parcelas_plano ON parcelas(plano_id);
CREATE INDEX idx_parcelas_vencimento ON parcelas(data_vencimento);
CREATE INDEX idx_parcelas_status ON parcelas(status);

-- Índices para contas a pagar
CREATE INDEX idx_contas_pagar_clinica ON contas_pagar(clinica_id);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX idx_contas_pagar_categoria ON contas_pagar(categoria);

-- Índices para contas a receber
CREATE INDEX idx_contas_receber_clinica ON contas_receber(clinica_id);
CREATE INDEX idx_contas_receber_paciente ON contas_receber(paciente_id);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX idx_contas_receber_status ON contas_receber(status);

-- Índices para contatos de inadimplência
CREATE INDEX idx_contatos_inadimplencia_paciente ON contatos_inadimplencia(paciente_id);
CREATE INDEX idx_contatos_inadimplencia_data ON contatos_inadimplencia(contato_realizado_em);

-- ===========================================
-- VIEWS ÚTEIS
-- ===========================================

-- View para fluxo de caixa consolidado por clínica
CREATE VIEW vw_fluxo_caixa_clinicas AS
SELECT 
  c.id,
  c.nome as clinica_nome,
  
  -- Entradas do período
  (SELECT COALESCE(SUM(valor_pago), 0) 
   FROM contas_receber cr 
   WHERE cr.clinica_id = c.id 
   AND cr.status = 'pago'
   AND cr.data_pagamento IS NOT NULL) as entradas_periodo,
   
  -- Saídas do período
  (SELECT COALESCE(SUM(valor_pago), 0) 
   FROM contas_pagar cp 
   WHERE cp.clinica_id = c.id 
   AND cp.status = 'pago'
   AND cp.data_pagamento IS NOT NULL) as saidas_periodo,
   
  -- Saldo atual (simulado - poderia vir de contas bancárias)
  0 as saldo_atual,
  
  -- Total a receber
  (SELECT COALESCE(SUM(valor_total - valor_pago), 0) 
   FROM contas_receber cr 
   WHERE cr.clinica_id = c.id 
   AND cr.status IN ('pendente', 'a_vencer', 'vencido')) as total_a_receber,
   
  -- Total a pagar
  (SELECT COALESCE(SUM(valor_total - valor_pago), 0) 
   FROM contas_pagar cp 
   WHERE cp.clinica_id = c.id 
   AND cp.status IN ('pendente', 'a_vencer', 'vencido')) as total_a_pagar,
   
  -- Total inadimplência
  (SELECT COALESCE(SUM(valor_total - valor_pago), 0) 
   FROM contas_receber cr 
   WHERE cr.clinica_id = c.id 
   AND cr.status = 'vencido') as total_inadimplencia
   
FROM clinicas c;

-- View para inadimplência por paciente
CREATE VIEW vw_inadimplencia_pacientes AS
SELECT 
  p.id as paciente_id,
  p.nome as paciente_nome,
  p.telefone,
  p.email,
  
  -- Totais
  COALESCE(SUM(cr.valor_total - cr.valor_pago), 0) as total_devido,
  COUNT(cr.id) as parcelas_vencidas,
  
  -- Dias em atraso (da parcela mais antiga vencida)
  (CURRENT_DATE - MIN(cr.data_vencimento))::INTEGER as dias_atraso,
  
  -- Último pagamento
  MAX(cr.data_pagamento) as ultimo_pagamento,
  
  -- Faixa de atraso
  CASE 
    WHEN (CURRENT_DATE - MIN(cr.data_vencimento))::INTEGER <= 30 THEN '1-30'
    WHEN (CURRENT_DATE - MIN(cr.data_vencimento))::INTEGER <= 60 THEN '31-60'
    WHEN (CURRENT_DATE - MIN(cr.data_vencimento))::INTEGER <= 90 THEN '61-90'
    ELSE '90+'
  END as faixa_atraso,
  
  cr.clinica_id
  
FROM pacientes p
INNER JOIN contas_receber cr ON p.id = cr.paciente_id
WHERE cr.status = 'vencido'
  AND cr.valor_total > cr.valor_pago
GROUP BY p.id, p.nome, p.telefone, p.email, cr.clinica_id;

-- ===========================================
-- TRIGGERS (opcional, para automatizações)
-- ===========================================

-- Trigger para atualizar status de parcelas automaticamente
CREATE OR REPLACE FUNCTION atualizar_status_parcelas()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a parcela foi paga, atualiza o valor_pago
  IF NEW.status = 'pago' AND OLD.status != 'pago' THEN
    NEW.valor_pago = NEW.valor;
    NEW.data_pagamento = CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_status_parcelas
  BEFORE UPDATE ON parcelas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_parcelas();

-- Trigger para atualizar status de contas quando todas as parcelas são pagas
CREATE OR REPLACE FUNCTION atualizar_status_plano()
RETURNS TRIGGER AS $$
DECLARE
  total_pagas INTEGER;
  total_parcelas INTEGER;
BEGIN
  -- Contar parcelas pagas
  SELECT COUNT(*) INTO total_pagas
  FROM parcelas 
  WHERE plano_id = NEW.plano_id AND status = 'pago';
  
  -- Contar total de parcelas
  SELECT quantidade_parcelas INTO total_parcelas
  FROM planos_parcelamento 
  WHERE id = NEW.plano_id;
  
  -- Se todas as parcelas foram pagas, marca plano como quitado
  IF total_pagas = total_parcelas THEN
    UPDATE planos_parcelamento 
    SET status = 'quitado', atualizado_em = NOW()
    WHERE id = NEW.plano_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_status_plano
  AFTER UPDATE ON parcelas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_plano();
