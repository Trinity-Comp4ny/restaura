-- Função para debitar saldo da conta bancária

CREATE OR REPLACE FUNCTION debitar_saldo(p_conta_id UUID, p_valor NUMERIC)
RETURNS VOID AS $$
BEGIN
  -- Verificar se conta existe
  IF NOT EXISTS (SELECT 1 FROM contas_bancarias WHERE id = p_conta_id) THEN
    RAISE EXCEPTION 'Conta bancária não encontrada';
  END IF;
  
  -- Verificar se há saldo suficiente
  IF (SELECT saldo FROM contas_bancarias WHERE id = p_conta_id) < p_valor THEN
    RAISE EXCEPTION 'Saldo insuficiente na conta bancária';
  END IF;
  
  -- Debitar o saldo
  UPDATE contas_bancarias 
  SET saldo = saldo - p_valor,
      atualizado_em = NOW()
  WHERE id = p_conta_id;
  
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar valor_aberto da fatura quando adiciona transações
CREATE OR REPLACE FUNCTION atualizar_fatura_aberta()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma transação é inserida/alterada com fatura_cartao_id
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE faturas_cartao 
    SET valor_aberto = (
      SELECT COALESCE(SUM(valor_bruto), 0)
      FROM transacoes 
      WHERE fatura_cartao_id = NEW.fatura_cartao_id
      AND status != 'cancelado'
    ),
    atualizado_em = NOW()
    WHERE id = NEW.fatura_cartao_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER trigger_atualizar_fatura_aberta
  AFTER INSERT OR UPDATE ON transacoes
  FOR EACH ROW
  WHEN (NEW.fatura_cartao_id IS NOT NULL)
  EXECUTE FUNCTION atualizar_fatura_aberta();
