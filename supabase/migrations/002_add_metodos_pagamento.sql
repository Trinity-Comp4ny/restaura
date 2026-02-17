-- 1. Adicionar coluna metodo_cobranca_id para receitas
ALTER TABLE transacoes 
ADD COLUMN metodo_cobranca_id UUID REFERENCES metodos_cobranca(id);

-- 3. Adicionar coluna conta_bancaria_id para despesas (PIX, boleto, etc.)
ALTER TABLE transacoes 
ADD COLUMN conta_bancaria_id UUID REFERENCES contas_bancarias(id);

-- 4. Criar tabela de faturas de cartão
CREATE TABLE faturas_cartao (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cartao_id UUID NOT NULL REFERENCES cartoes(id),
  conta_bancaria_id UUID NOT NULL REFERENCES contas_bancarias(id), -- Link para conta bancária
  mes_referencia DATE NOT NULL, -- '2026-02-01'
  data_vencimento DATE NOT NULL, -- '2026-02-10'
  data_fechamento DATE NOT NULL, -- '2026-02-25'
  valor_aberto NUMERIC DEFAULT 0,
  valor_pago NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada', 'paga')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices
CREATE INDEX idx_faturas_cartao_cartao_id ON faturas_cartao(cartao_id);
CREATE INDEX idx_faturas_cartao_conta_id ON faturas_cartao(conta_bancaria_id);
CREATE INDEX idx_faturas_cartao_status ON faturas_cartao(status);
CREATE INDEX idx_faturas_cartao_mes ON faturas_cartao(mes_referencia);

-- 5. Adicionar coluna fatura_cartao_id em transacoes (para linkar compras à fatura)
ALTER TABLE transacoes 
ADD COLUMN fatura_cartao_id UUID REFERENCES faturas_cartao(id);
