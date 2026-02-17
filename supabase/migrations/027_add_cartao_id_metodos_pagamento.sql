-- Migration: Adicionar coluna cartao_id na tabela metodos_pagamento
-- Permite vincular um método de pagamento diretamente a um cartão cadastrado

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'metodos_pagamento' AND column_name = 'cartao_id'
    ) THEN
        ALTER TABLE metodos_pagamento 
        ADD COLUMN cartao_id UUID REFERENCES cartoes(id) ON DELETE SET NULL;
        
        CREATE INDEX idx_metodos_pagamento_cartao ON metodos_pagamento(cartao_id);
        
        COMMENT ON COLUMN metodos_pagamento.cartao_id IS 'Cartão vinculado ao método de pagamento (para tipos cartao_credito e cartao_debito)';
    END IF;
END $$;
