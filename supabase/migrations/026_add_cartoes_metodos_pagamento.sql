-- Adicionar cartão de crédito e débito como métodos de pagamento
-- Isso permite que despesas sejam pagas com cartões (corporativos)

-- Atualizar o CHECK constraint para incluir os novos tipos
ALTER TABLE metodos_pagamento 
DROP CONSTRAINT IF EXISTS metodos_pagamento_tipo_check;

ALTER TABLE metodos_pagamento 
ADD CONSTRAINT metodos_pagamento_tipo_check 
CHECK (tipo IN ('pix', 'transferencia', 'boleto', 'debito_automatico', 'dinheiro', 'cartao_credito', 'cartao_debito'));

-- Adicionar comentários para documentação
COMMENT ON COLUMN metodos_pagamento.tipo IS 'Tipo de método de pagamento para despesas (incluindo cartões corporativos)';

-- Inserir exemplos de métodos de pagamento com cartão se a clínica já tiver cartões cadastrados
INSERT INTO metodos_pagamento (clinica_id, nome, tipo, is_padrao, ativo)
SELECT 
    c.id,
    CASE 
        WHEN c.tipo_cartao = 'credito' THEN 'Cartão de Crédito - ' || c.banco
        ELSE 'Cartão de Débito - ' || c.banco
    END,
    CASE 
        WHEN c.tipo_cartao = 'credito' THEN 'cartao_credito'
        ELSE 'cartao_debito'
    END,
    false,
    true
FROM clinicas cl
JOIN cartoes c ON c.clinica_id = cl.id AND c.ativo = true
WHERE NOT EXISTS (
    SELECT 1 FROM metodos_pagamento mp 
    WHERE mp.clinica_id = cl.id 
    AND mp.tipo = CASE 
        WHEN c.tipo_cartao = 'credito' THEN 'cartao_credito'
        ELSE 'cartao_debito'
    END
)
ON CONFLICT DO NOTHING;
