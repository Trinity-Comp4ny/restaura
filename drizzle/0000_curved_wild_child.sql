-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."appointment_status" AS ENUM('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu');--> statement-breakpoint
CREATE TYPE "public"."genero" AS ENUM('masculino', 'feminino', 'outro');--> statement-breakpoint
CREATE TYPE "public"."record_type" AS ENUM('anamnesia', 'evolução', 'prescrição', 'certificado', 'referência');--> statement-breakpoint
CREATE TYPE "public"."tipo_cartao" AS ENUM('credito', 'debito');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pendente', 'pago', 'cancelado', 'estornado');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('receita', 'despesa', 'transferencia');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'dentista', 'assistente', 'recepcionista');--> statement-breakpoint
CREATE TABLE "contas_pagar" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"descricao" text NOT NULL,
	"fornecedor_id" uuid,
	"fornecedor_nome" text,
	"valor_total" numeric(10, 2) NOT NULL,
	"valor_pago" numeric(10, 2) DEFAULT '0',
	"categoria" text NOT NULL,
	"centro_custo_id" uuid,
	"data_emissao" date NOT NULL,
	"data_vencimento" date NOT NULL,
	"data_pagamento" date,
	"quantidade_parcelas" integer DEFAULT 1,
	"parcela_atual" integer DEFAULT 1,
	"status" text DEFAULT 'pendente' NOT NULL,
	"tipo_documento" text,
	"numero_documento" text,
	"anexo_url" text,
	"observacoes" text,
	"criado_por_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "contas_pagar_status_check" CHECK (status = ANY (ARRAY['pendente'::text, 'pago'::text, 'vencido'::text, 'a_vencer'::text, 'cancelado'::text, 'renegociado'::text]))
);
--> statement-breakpoint
CREATE TABLE "contas_receber" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"paciente_id" uuid NOT NULL,
	"consulta_id" uuid,
	"plano_parcelamento_id" uuid,
	"parcela_id" uuid,
	"descricao" text NOT NULL,
	"valor_total" numeric(10, 2) NOT NULL,
	"valor_pago" numeric(10, 2) DEFAULT '0',
	"origem" text NOT NULL,
	"data_emissao" date NOT NULL,
	"data_vencimento" date NOT NULL,
	"data_pagamento" date,
	"metodo_pagamento" text,
	"forma_pagamento" text,
	"convenio_id" uuid,
	"autorizacao_convenio" text,
	"status" text DEFAULT 'pendente' NOT NULL,
	"numero_documento" text,
	"anexo_url" text,
	"observacoes" text,
	"criado_por_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "contas_receber_status_check" CHECK (status = ANY (ARRAY['pendente'::text, 'pago'::text, 'vencido'::text, 'a_vencer'::text, 'cancelado'::text, 'renegociado'::text]))
);
--> statement-breakpoint
CREATE TABLE "contatos_inadimplencia" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"paciente_id" uuid NOT NULL,
	"conta_receber_id" uuid,
	"tipo_contato" text NOT NULL,
	"contato_realizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"responsavel_contato_id" uuid,
	"status_contato" text NOT NULL,
	"observacoes" text,
	"proximo_contato_em" date,
	"proxima_acao" text,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "contatos_inadimplencia_status_contato_check" CHECK (status_contato = ANY (ARRAY['contato_realizado'::text, 'nao_atendeu'::text, 'mensagem_deixada'::text, 'promessa_pagamento'::text, 'negociacao'::text, 'recusa'::text])),
	CONSTRAINT "contatos_inadimplencia_tipo_contato_check" CHECK (tipo_contato = ANY (ARRAY['telefone'::text, 'whatsapp'::text, 'email'::text, 'sms'::text]))
);
--> statement-breakpoint
CREATE TABLE "faturas_cartao" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"cartao_id" uuid NOT NULL,
	"conta_bancaria_id" uuid NOT NULL,
	"mes_referencia" date NOT NULL,
	"data_vencimento" date NOT NULL,
	"data_fechamento" date NOT NULL,
	"valor_aberto" numeric DEFAULT '0',
	"valor_pago" numeric DEFAULT '0',
	"status" text DEFAULT 'aberta',
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "faturas_cartao_status_check" CHECK (status = ANY (ARRAY['aberta'::text, 'fechada'::text, 'paga'::text]))
);
--> statement-breakpoint
CREATE TABLE "convites" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"email" text NOT NULL,
	"papel" "user_role" DEFAULT 'recepcionista',
	"token" uuid DEFAULT uuid_generate_v4() NOT NULL,
	"status" text DEFAULT 'pendente',
	"convidado_por_id" uuid NOT NULL,
	"aceito_por_id" uuid,
	"data_expiracao" timestamp with time zone DEFAULT (now() + '7 days'::interval),
	"aceito_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "convites_clinica_id_email_status_key" UNIQUE("clinica_id","email","status"),
	CONSTRAINT "convites_token_key" UNIQUE("token"),
	CONSTRAINT "convites_status_check" CHECK (status = ANY (ARRAY['pendente'::text, 'aceito'::text, 'expirado'::text, 'cancelado'::text]))
);
--> statement-breakpoint
ALTER TABLE "convites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "convites_fundador" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"email" text NOT NULL,
	"token" uuid DEFAULT uuid_generate_v4() NOT NULL,
	"status" text DEFAULT 'pendente',
	"convidado_por_id" uuid,
	"aceito_por_id" uuid,
	"clinica_criada_id" uuid,
	"data_expiracao" timestamp with time zone DEFAULT (now() + '14 days'::interval),
	"aceito_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "convites_fundador_email_key" UNIQUE("email"),
	CONSTRAINT "convites_fundador_token_key" UNIQUE("token"),
	CONSTRAINT "convites_fundador_status_check" CHECK (status = ANY (ARRAY['pendente'::text, 'aceito'::text, 'expirado'::text, 'cancelado'::text]))
);
--> statement-breakpoint
ALTER TABLE "convites_fundador" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "procedimentos" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"categoria" text,
	"duracao_minutos" integer DEFAULT 30,
	"valor_padrao" numeric(10, 2),
	"cor" text DEFAULT '#3b82f6',
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parcelas" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"transacao_id" uuid NOT NULL,
	"numero_parcela" integer NOT NULL,
	"total_parcelas" integer NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"data_vencimento" date NOT NULL,
	"data_pagamento" date,
	"data_credito_prevista" date,
	"status" text DEFAULT 'pendente' NOT NULL,
	"fatura_cartao_id" uuid,
	"observacoes" text,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now(),
	"valor_multa" numeric(10, 2) DEFAULT '0',
	"valor_juros" numeric(10, 2) DEFAULT '0',
	"valor_desconto" numeric(10, 2) DEFAULT '0',
	"valor_corrigido" numeric(10, 2) DEFAULT '0',
	"dias_atraso" integer DEFAULT 0,
	"status_calculado" text DEFAULT 'pendente',
	CONSTRAINT "parcelas_status_check" CHECK (status = ANY (ARRAY['pendente'::text, 'pago'::text, 'vencido'::text, 'cancelado'::text]))
);
--> statement-breakpoint
CREATE TABLE "centros_custo" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"tipo" text NOT NULL,
	"cor" text DEFAULT '#8b5cf6',
	"is_padrao" boolean DEFAULT false,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "centros_custo_clinica_id_nome_key" UNIQUE("clinica_id","nome")
);
--> statement-breakpoint
ALTER TABLE "centros_custo" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "planos_convenio" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"operadora" text NOT NULL,
	"codigo" text,
	"descricao" text,
	"taxa_desconto" numeric(5, 2) DEFAULT '0',
	"prazo_pagamento" integer DEFAULT 30,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "planos_convenio_clinica_id_nome_operadora_key" UNIQUE("clinica_id","nome","operadora")
);
--> statement-breakpoint
CREATE TABLE "contas_bancarias" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"banco" text,
	"agencia" text,
	"conta" text,
	"tipo" text NOT NULL,
	"saldo" numeric(15, 2) DEFAULT '0',
	"is_padrao" boolean DEFAULT false,
	"ativa" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cartoes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"banco" text NOT NULL,
	"ultimos_digitos" text NOT NULL,
	"tipo_cartao" "tipo_cartao" DEFAULT 'credito' NOT NULL,
	"limite" numeric(10, 2) DEFAULT '0',
	"dia_vencimento" integer,
	"dia_fechamento" integer,
	"is_corporativo" boolean DEFAULT false,
	"conta_fatura_id" uuid,
	"is_padrao" boolean DEFAULT false,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cartoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "produtos" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"categoria" text,
	"marca" text,
	"modelo" text,
	"cor_tamanho" text,
	"unidade" text DEFAULT 'Unidade',
	"quantidade" numeric(10, 2) DEFAULT '0',
	"quantidade_minima" numeric(10, 2) DEFAULT '0',
	"preco" numeric(10, 2) DEFAULT '0',
	"fornecedor" text,
	"localizacao" text,
	"observacoes" text,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "produto_lotes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"produto_id" uuid NOT NULL,
	"lote" text,
	"data_validade" date,
	"quantidade" numeric(10, 2) DEFAULT '0',
	"quantidade_disponivel" numeric(10, 2) DEFAULT '0',
	"fornecedor" text,
	"criado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "movimentacoes_estoque" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"produto_id" uuid NOT NULL,
	"lote_id" uuid,
	"tipo" text NOT NULL,
	"quantidade" numeric(10, 2) NOT NULL,
	"motivo" text,
	"criado_por_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fornecedores" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome_fantasia" text NOT NULL,
	"razao_social" text,
	"cnpj" text,
	"telefone" text,
	"email" text,
	"endereco" text,
	"categoria_fornecedor" text,
	"condicoes_pagamento" text,
	"is_padrao" boolean DEFAULT false,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fornecedores_clinica_id_nome_fantasia_key" UNIQUE("clinica_id","nome_fantasia")
);
--> statement-breakpoint
ALTER TABLE "fornecedores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tipos_documento" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"modelo" text,
	"exige_numero" boolean DEFAULT true,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tipos_documento_clinica_id_nome_key" UNIQUE("clinica_id","nome")
);
--> statement-breakpoint
CREATE TABLE "clinicas" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	"documento" text,
	"telefone" text,
	"email" text,
	"endereco" text,
	"cidade" text,
	"estado" text,
	"cep" text,
	"url_logo" text,
	"configuracoes" jsonb DEFAULT '{}'::jsonb,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "clinicas_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"auth_usuario_id" uuid NOT NULL,
	"clinica_id" uuid NOT NULL,
	"email" text NOT NULL,
	"nome" text NOT NULL,
	"papel" "user_role" DEFAULT 'recepcionista',
	"telefone" text,
	"cro" text,
	"especialidade" text,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "usuarios_auth_usuario_id_key" UNIQUE("auth_usuario_id")
);
--> statement-breakpoint
CREATE TABLE "pacientes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"email" text,
	"telefone" text,
	"data_nascimento" date,
	"genero" "genero",
	"cpf" text,
	"rg" text,
	"endereco" text,
	"cidade" text,
	"estado" text,
	"cep" text,
	"convenio_principal" text,
	"alergias" text,
	"observacoes" text,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultas" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"paciente_id" uuid NOT NULL,
	"dentista_id" uuid NOT NULL,
	"procedimento_id" uuid,
	"data_hora" timestamp with time zone NOT NULL,
	"duracao_minutos" integer DEFAULT 30,
	"status" "appointment_status" DEFAULT 'agendado',
	"observacoes" text,
	"valor" numeric(10, 2),
	"pago" boolean DEFAULT false,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prontuarios" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"paciente_id" uuid NOT NULL,
	"consulta_id" uuid,
	"tipo" "record_type" NOT NULL,
	"conteudo" jsonb NOT NULL,
	"criado_por_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categorias_receita" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"cor" text DEFAULT '#3b82f6',
	"is_padrao" boolean DEFAULT false,
	"ativa" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "categorias_receita_clinica_id_nome_key" UNIQUE("clinica_id","nome")
);
--> statement-breakpoint
ALTER TABLE "categorias_receita" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categorias_despesa" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"cor" text DEFAULT '#ef4444',
	"is_padrao" boolean DEFAULT false,
	"ativa" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "categorias_despesa_clinica_id_nome_key" UNIQUE("clinica_id","nome")
);
--> statement-breakpoint
CREATE TABLE "metodos_pagamento" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"tipo" text NOT NULL,
	"taxas_percentual" numeric(5, 2) DEFAULT '0',
	"taxas_fixa" numeric(10, 2) DEFAULT '0',
	"prazo_deposito" integer DEFAULT 0,
	"adquirente" text,
	"is_padrao" boolean DEFAULT false,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	"conta_vinculada_id" uuid
);
--> statement-breakpoint
CREATE TABLE "metodos_cobranca" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"tipo" text NOT NULL,
	"taxas_percentual" numeric(5, 2) DEFAULT '0',
	"taxas_fixa" numeric(10, 2) DEFAULT '0',
	"prazo_deposito" integer DEFAULT 0,
	"adquirente" text,
	"conta_vinculada_id" uuid,
	"is_padrao" boolean DEFAULT false,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transacoes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clinica_id" uuid NOT NULL,
	"tipo" "transaction_type" NOT NULL,
	"descricao" text NOT NULL,
	"valor_bruto" numeric(10, 2) NOT NULL,
	"valor_liquido" numeric(10, 2) NOT NULL,
	"valor_taxas" numeric(10, 2) DEFAULT '0',
	"paciente_id" uuid,
	"consulta_id" uuid,
	"fornecedor" text,
	"plano_id" text,
	"autorizacao_id" text,
	"categoria" text NOT NULL,
	"metodo_pagamento_id" uuid,
	"conta_origem_id" uuid,
	"conta_destino_id" uuid,
	"cartao_id" uuid,
	"data_compra" date,
	"data_emissao" date,
	"data_vencimento" date,
	"data_pagamento" date,
	"data_credito_prevista" date,
	"total_parcelas" integer DEFAULT 1,
	"parcela_atual" integer DEFAULT 1,
	"valor_parcela" numeric(10, 2),
	"data_primeira_parcela" date,
	"status" "transaction_status" DEFAULT 'pendente',
	"origem_receita" text,
	"centro_custo" text,
	"tipo_documento" text,
	"numero_documento" text,
	"dados_convenio" jsonb DEFAULT '{}'::jsonb,
	"observacoes" text,
	"anexos" text[],
	"criado_por_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now(),
	"atualizado_por_id" uuid,
	"metodo_cobranca_id" uuid,
	"conta_bancaria_id" uuid,
	"fatura_cartao_id" uuid
);
--> statement-breakpoint
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_centro_custo_id_fkey" FOREIGN KEY ("centro_custo_id") REFERENCES "public"."centros_custo"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "public"."fornecedores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_consulta_id_fkey" FOREIGN KEY ("consulta_id") REFERENCES "public"."consultas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_convenio_id_fkey" FOREIGN KEY ("convenio_id") REFERENCES "public"."planos_convenio"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contatos_inadimplencia" ADD CONSTRAINT "contatos_inadimplencia_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contatos_inadimplencia" ADD CONSTRAINT "contatos_inadimplencia_conta_receber_id_fkey" FOREIGN KEY ("conta_receber_id") REFERENCES "public"."contas_receber"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contatos_inadimplencia" ADD CONSTRAINT "contatos_inadimplencia_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contatos_inadimplencia" ADD CONSTRAINT "contatos_inadimplencia_responsavel_contato_id_fkey" FOREIGN KEY ("responsavel_contato_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faturas_cartao" ADD CONSTRAINT "faturas_cartao_cartao_id_fkey" FOREIGN KEY ("cartao_id") REFERENCES "public"."cartoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faturas_cartao" ADD CONSTRAINT "faturas_cartao_conta_bancaria_id_fkey" FOREIGN KEY ("conta_bancaria_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convites" ADD CONSTRAINT "convites_aceito_por_id_fkey" FOREIGN KEY ("aceito_por_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convites" ADD CONSTRAINT "convites_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convites" ADD CONSTRAINT "convites_convidado_por_id_fkey" FOREIGN KEY ("convidado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convites_fundador" ADD CONSTRAINT "convites_fundador_aceito_por_id_fkey" FOREIGN KEY ("aceito_por_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convites_fundador" ADD CONSTRAINT "convites_fundador_clinica_criada_id_fkey" FOREIGN KEY ("clinica_criada_id") REFERENCES "public"."clinicas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convites_fundador" ADD CONSTRAINT "convites_fundador_convidado_por_id_fkey" FOREIGN KEY ("convidado_por_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedimentos" ADD CONSTRAINT "procedimentos_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_fatura_cartao_id_fkey" FOREIGN KEY ("fatura_cartao_id") REFERENCES "public"."faturas_cartao"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_transacao_id_fkey" FOREIGN KEY ("transacao_id") REFERENCES "public"."transacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "centros_custo" ADD CONSTRAINT "centros_custo_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planos_convenio" ADD CONSTRAINT "planos_convenio_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_bancarias" ADD CONSTRAINT "contas_bancarias_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_credito_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_credito_conta_fatura_id_fkey" FOREIGN KEY ("conta_fatura_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produto_lotes" ADD CONSTRAINT "produto_lotes_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "public"."produto_lotes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tipos_documento" ADD CONSTRAINT "tipos_documento_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_auth_usuario_id_fkey" FOREIGN KEY ("auth_usuario_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_dentista_id_fkey" FOREIGN KEY ("dentista_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_procedimento_id_fkey" FOREIGN KEY ("procedimento_id") REFERENCES "public"."procedimentos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prontuarios" ADD CONSTRAINT "prontuarios_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prontuarios" ADD CONSTRAINT "prontuarios_consulta_id_fkey" FOREIGN KEY ("consulta_id") REFERENCES "public"."consultas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prontuarios" ADD CONSTRAINT "prontuarios_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prontuarios" ADD CONSTRAINT "prontuarios_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categorias_receita" ADD CONSTRAINT "categorias_receita_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categorias_despesa" ADD CONSTRAINT "categorias_despesa_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metodos_pagamento" ADD CONSTRAINT "metodos_pagamento_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metodos_pagamento" ADD CONSTRAINT "metodos_pagamento_conta_vinculada_id_fkey" FOREIGN KEY ("conta_vinculada_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metodos_cobranca" ADD CONSTRAINT "metodos_cobranca_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metodos_cobranca" ADD CONSTRAINT "metodos_cobranca_conta_vinculada_id_fkey" FOREIGN KEY ("conta_vinculada_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_cartao_id_fkey" FOREIGN KEY ("cartao_id") REFERENCES "public"."cartoes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."clinicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_consulta_id_fkey" FOREIGN KEY ("consulta_id") REFERENCES "public"."consultas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_conta_bancaria_id_fkey" FOREIGN KEY ("conta_bancaria_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_conta_destino_id_fkey" FOREIGN KEY ("conta_destino_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_conta_origem_id_fkey" FOREIGN KEY ("conta_origem_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_fatura_cartao_id_fkey" FOREIGN KEY ("fatura_cartao_id") REFERENCES "public"."faturas_cartao"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_metodo_cobranca_id_fkey" FOREIGN KEY ("metodo_cobranca_id") REFERENCES "public"."metodos_cobranca"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_metodo_pagamento_id_fkey" FOREIGN KEY ("metodo_pagamento_id") REFERENCES "public"."metodos_pagamento"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_contas_pagar_categoria" ON "contas_pagar" USING btree ("categoria" text_ops);--> statement-breakpoint
CREATE INDEX "idx_contas_pagar_clinica" ON "contas_pagar" USING btree ("clinica_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_contas_pagar_status" ON "contas_pagar" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_contas_pagar_vencimento" ON "contas_pagar" USING btree ("data_vencimento" date_ops);--> statement-breakpoint
CREATE INDEX "idx_contas_receber_clinica" ON "contas_receber" USING btree ("clinica_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_contas_receber_paciente" ON "contas_receber" USING btree ("paciente_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_contas_receber_status" ON "contas_receber" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_contas_receber_vencimento" ON "contas_receber" USING btree ("data_vencimento" date_ops);--> statement-breakpoint
CREATE INDEX "idx_contatos_inadimplencia_data" ON "contatos_inadimplencia" USING btree ("contato_realizado_em" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_contatos_inadimplencia_paciente" ON "contatos_inadimplencia" USING btree ("paciente_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_faturas_cartao_cartao_id" ON "faturas_cartao" USING btree ("cartao_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_faturas_cartao_conta_id" ON "faturas_cartao" USING btree ("conta_bancaria_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_faturas_cartao_mes" ON "faturas_cartao" USING btree ("mes_referencia" date_ops);--> statement-breakpoint
CREATE INDEX "idx_faturas_cartao_status" ON "faturas_cartao" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_convites_clinica" ON "convites" USING btree ("clinica_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_convites_email" ON "convites" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_convites_status" ON "convites" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_convites_token" ON "convites" USING btree ("token" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_convites_fundador_email" ON "convites_fundador" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_convites_fundador_status" ON "convites_fundador" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_convites_fundador_token" ON "convites_fundador" USING btree ("token" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_parcelas_clinica" ON "parcelas" USING btree ("clinica_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_parcelas_fatura" ON "parcelas" USING btree ("fatura_cartao_id" uuid_ops) WHERE (fatura_cartao_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_parcelas_status" ON "parcelas" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_parcelas_transacao" ON "parcelas" USING btree ("transacao_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_parcelas_transacao_numero" ON "parcelas" USING btree ("transacao_id" int4_ops,"numero_parcela" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_parcelas_vencimento" ON "parcelas" USING btree ("data_vencimento" date_ops);--> statement-breakpoint
CREATE INDEX "idx_cartoes_tipo" ON "cartoes" USING btree ("tipo_cartao" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_produtos_clinica" ON "produtos" USING btree ("clinica_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_movimentacoes_estoque_clinica" ON "movimentacoes_estoque" USING btree ("clinica_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_movimentacoes_estoque_produto" ON "movimentacoes_estoque" USING btree ("produto_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_usuarios_clinica" ON "usuarios" USING btree ("clinica_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_pacientes_clinica" ON "pacientes" USING btree ("clinica_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_consultas_clinica" ON "consultas" USING btree ("clinica_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_consultas_data_hora" ON "consultas" USING btree ("data_hora" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_consultas_dentista" ON "consultas" USING btree ("dentista_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_consultas_paciente" ON "consultas" USING btree ("paciente_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_consultas_status" ON "consultas" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_metodos_cobranca_ativos" ON "metodos_cobranca" USING btree ("clinica_id" uuid_ops,"ativo" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_metodos_cobranca_clinica" ON "metodos_cobranca" USING btree ("clinica_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_metodos_cobranca_padrao" ON "metodos_cobranca" USING btree ("clinica_id" bool_ops,"is_padrao" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_transacoes_cartao" ON "transacoes" USING btree ("cartao_id" uuid_ops) WHERE (cartao_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_transacoes_clinica_tipo" ON "transacoes" USING btree ("clinica_id" uuid_ops,"tipo" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_transacoes_data_pagamento" ON "transacoes" USING btree ("data_pagamento" date_ops) WHERE (data_pagamento IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_transacoes_data_vencimento" ON "transacoes" USING btree ("data_vencimento" date_ops) WHERE (data_vencimento IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_transacoes_metodo" ON "transacoes" USING btree ("metodo_pagamento_id" uuid_ops) WHERE (metodo_pagamento_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_transacoes_paciente" ON "transacoes" USING btree ("paciente_id" uuid_ops) WHERE (paciente_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_transacoes_parcelas" ON "transacoes" USING btree ("total_parcelas" int4_ops) WHERE (total_parcelas > 1);--> statement-breakpoint
CREATE INDEX "idx_transacoes_status" ON "transacoes" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE VIEW "public"."vw_fluxo_caixa_clinicas" AS (SELECT id, nome AS clinica_nome, ( SELECT COALESCE(sum(cr.valor_pago), 0::numeric) AS "coalesce" FROM contas_receber cr WHERE cr.clinica_id = c.id AND cr.status = 'pago'::text AND cr.data_pagamento IS NOT NULL) AS entradas_periodo, ( SELECT COALESCE(sum(cp.valor_pago), 0::numeric) AS "coalesce" FROM contas_pagar cp WHERE cp.clinica_id = c.id AND cp.status = 'pago'::text AND cp.data_pagamento IS NOT NULL) AS saidas_periodo, 0 AS saldo_atual, ( SELECT COALESCE(sum(cr.valor_total - cr.valor_pago), 0::numeric) AS "coalesce" FROM contas_receber cr WHERE cr.clinica_id = c.id AND (cr.status = ANY (ARRAY['pendente'::text, 'a_vencer'::text, 'vencido'::text]))) AS total_a_receber, ( SELECT COALESCE(sum(cp.valor_total - cp.valor_pago), 0::numeric) AS "coalesce" FROM contas_pagar cp WHERE cp.clinica_id = c.id AND (cp.status = ANY (ARRAY['pendente'::text, 'a_vencer'::text, 'vencido'::text]))) AS total_a_pagar, ( SELECT COALESCE(sum(cr.valor_total - cr.valor_pago), 0::numeric) AS "coalesce" FROM contas_receber cr WHERE cr.clinica_id = c.id AND cr.status = 'vencido'::text) AS total_inadimplencia FROM clinicas c);--> statement-breakpoint
CREATE VIEW "public"."vw_inadimplencia_pacientes" AS (SELECT p.id AS paciente_id, p.nome AS paciente_nome, p.telefone, p.email, COALESCE(sum(cr.valor_total - cr.valor_pago), 0::numeric) AS total_devido, count(cr.id) AS parcelas_vencidas, CURRENT_DATE - min(cr.data_vencimento) AS dias_atraso, max(cr.data_pagamento) AS ultimo_pagamento, CASE WHEN (CURRENT_DATE - min(cr.data_vencimento)) <= 30 THEN '1-30'::text WHEN (CURRENT_DATE - min(cr.data_vencimento)) <= 60 THEN '31-60'::text WHEN (CURRENT_DATE - min(cr.data_vencimento)) <= 90 THEN '61-90'::text ELSE '90+'::text END AS faixa_atraso, cr.clinica_id FROM pacientes p JOIN contas_receber cr ON p.id = cr.paciente_id WHERE cr.status = 'vencido'::text AND cr.valor_total > cr.valor_pago GROUP BY p.id, p.nome, p.telefone, p.email, cr.clinica_id);--> statement-breakpoint
CREATE VIEW "public"."vw_parcelas_resumo" AS (SELECT t.id AS transacao_id, t.clinica_id, t.descricao, t.valor_bruto, t.tipo, t.total_parcelas, count(p.id) AS parcelas_geradas, count(p.id) FILTER (WHERE p.status = 'pago'::text) AS parcelas_pagas, count(p.id) FILTER (WHERE p.status = 'pendente'::text) AS parcelas_pendentes, count(p.id) FILTER (WHERE p.status = 'vencido'::text) AS parcelas_vencidas, COALESCE(sum(p.valor) FILTER (WHERE p.status = 'pago'::text), 0::numeric) AS valor_pago, COALESCE(sum(p.valor) FILTER (WHERE p.status = ANY (ARRAY['pendente'::text, 'vencido'::text])), 0::numeric) AS valor_pendente, min(p.data_vencimento) FILTER (WHERE p.status = ANY (ARRAY['pendente'::text, 'vencido'::text])) AS proxima_data_vencimento FROM transacoes t LEFT JOIN parcelas p ON p.transacao_id = t.id GROUP BY t.id, t.clinica_id, t.descricao, t.valor_bruto, t.tipo, t.total_parcelas);--> statement-breakpoint
CREATE VIEW "public"."vw_receitas" AS (SELECT t.id, t.clinica_id, t.tipo, t.descricao, t.valor_bruto, t.valor_liquido, t.valor_taxas, t.paciente_id, t.consulta_id, t.fornecedor, t.plano_id, t.autorizacao_id, t.categoria, t.metodo_pagamento_id, t.conta_origem_id, t.conta_destino_id, t.cartao_id, t.data_compra, t.data_emissao, t.data_vencimento, t.data_pagamento, t.data_credito_prevista, t.total_parcelas, t.parcela_atual, t.valor_parcela, t.data_primeira_parcela, t.status, t.origem_receita, t.centro_custo, t.tipo_documento, t.numero_documento, t.dados_convenio, t.observacoes, t.anexos, t.criado_por_id, t.criado_em, t.atualizado_em, t.atualizado_por_id, cr.nome AS categoria_nome, cr.cor AS categoria_cor, pc.nome AS plano_convenio_nome FROM transacoes t LEFT JOIN categorias_receita cr ON t.categoria = cr.nome AND cr.clinica_id = t.clinica_id LEFT JOIN planos_convenio pc ON t.plano_id = pc.nome AND pc.clinica_id = t.clinica_id WHERE t.tipo = 'receita'::transaction_type ORDER BY t.data_emissao DESC, t.criado_em DESC);--> statement-breakpoint
CREATE VIEW "public"."vw_despesas" AS (SELECT t.id, t.clinica_id, t.tipo, t.descricao, t.valor_bruto, t.valor_liquido, t.valor_taxas, t.paciente_id, t.consulta_id, t.fornecedor, t.plano_id, t.autorizacao_id, t.categoria, t.metodo_pagamento_id, t.conta_origem_id, t.conta_destino_id, t.cartao_id, t.data_compra, t.data_emissao, t.data_vencimento, t.data_pagamento, t.data_credito_prevista, t.total_parcelas, t.parcela_atual, t.valor_parcela, t.data_primeira_parcela, t.status, t.origem_receita, t.centro_custo, t.tipo_documento, t.numero_documento, t.dados_convenio, t.observacoes, t.anexos, t.criado_por_id, t.criado_em, t.atualizado_em, t.atualizado_por_id, cd.nome AS categoria_nome, cd.cor AS categoria_cor, cc.nome AS centro_custo_nome, cc.tipo AS centro_custo_tipo, f.nome_fantasia AS fornecedor_nome, td.nome AS tipo_documento_nome FROM transacoes t LEFT JOIN categorias_despesa cd ON t.categoria = cd.nome AND cd.clinica_id = t.clinica_id LEFT JOIN centros_custo cc ON t.centro_custo = cc.nome AND cc.clinica_id = t.clinica_id LEFT JOIN fornecedores f ON t.fornecedor = f.nome_fantasia AND f.clinica_id = t.clinica_id LEFT JOIN tipos_documento td ON t.tipo_documento = td.nome AND td.clinica_id = t.clinica_id WHERE t.tipo = 'despesa'::transaction_type ORDER BY t.data_emissao DESC, t.criado_em DESC);--> statement-breakpoint
CREATE VIEW "public"."vw_fluxo_caixa" AS (SELECT tipo, CASE WHEN tipo = 'receita'::transaction_type THEN valor_liquido ELSE - valor_liquido END AS fluxo, data_pagamento, categoria, metodo_pagamento_id, status, descricao FROM transacoes WHERE data_pagamento IS NOT NULL ORDER BY data_pagamento DESC);--> statement-breakpoint
CREATE POLICY "Admins verem todos os convites da clínica" ON "convites" AS PERMISSIVE FOR ALL TO public USING ((clinica_id IN ( SELECT usuarios.clinica_id
   FROM usuarios
  WHERE ((usuarios.auth_usuario_id = auth.uid()) AND (usuarios.papel = 'admin'::user_role)))));--> statement-breakpoint
CREATE POLICY "Usuários verem próprios convites" ON "convites" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins sistema gerenciam convites fundador" ON "convites_fundador" AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text = ANY (ARRAY['admin@restaura.com'::text, 'suporte@restaura.com'::text]))))));--> statement-breakpoint
CREATE POLICY "Usuários verem próprios convites fundador" ON "convites_fundador" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Ver centros_custo da própria clínica" ON "centros_custo" AS PERMISSIVE FOR ALL TO public USING ((clinica_id IN ( SELECT clinicas.id
   FROM clinicas
  WHERE (clinicas.id IN ( SELECT usuarios.clinica_id
           FROM usuarios
          WHERE (usuarios.auth_usuario_id = auth.uid()))))));--> statement-breakpoint
CREATE POLICY "Gerenciar cartoes da própria clínica" ON "cartoes" AS PERMISSIVE FOR ALL TO public USING ((clinica_id IN ( SELECT clinicas.id
   FROM clinicas
  WHERE (clinicas.id IN ( SELECT usuarios.clinica_id
           FROM usuarios
          WHERE (usuarios.auth_usuario_id = auth.uid()))))));--> statement-breakpoint
CREATE POLICY "Ver cartoes da própria clínica" ON "cartoes" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "Ver fornecedores da própria clínica" ON "fornecedores" AS PERMISSIVE FOR ALL TO public USING ((clinica_id IN ( SELECT clinicas.id
   FROM clinicas
  WHERE (clinicas.id IN ( SELECT usuarios.clinica_id
           FROM usuarios
          WHERE (usuarios.auth_usuario_id = auth.uid()))))));--> statement-breakpoint
CREATE POLICY "Ver categorias da própria clínica" ON "categorias_receita" AS PERMISSIVE FOR ALL TO public USING ((clinica_id IN ( SELECT clinicas.id
   FROM clinicas
  WHERE (clinicas.id IN ( SELECT usuarios.clinica_id
           FROM usuarios
          WHERE (usuarios.auth_usuario_id = auth.uid()))))));
*/