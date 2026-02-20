-- Corrigir função aceitar_convite para receber nome como parâmetro
-- em vez de tentar ler da tabela auth.users

DROP FUNCTION IF EXISTS aceitar_convite;

CREATE OR REPLACE FUNCTION aceitar_convite(
  p_token UUID,
  p_auth_usuario_id UUID,
  p_nome TEXT
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
      aceito_por_id = p_auth_usuario_id,
      aceito_em = NOW()
  WHERE id = v_invite.id;
  
  -- Criar usuário na tabela usuarios com o nome fornecido
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
    p_nome,
    v_invite.papel
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
