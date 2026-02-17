import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const sql = `
      CREATE OR REPLACE FUNCTION aceitar_convite_fundador(
        p_token UUID,
        p_auth_usuario_id UUID,
        p_clinica_nome TEXT
      )
      RETURNS UUID AS $$
      DECLARE
        v_invite RECORD;
        v_clinica_id UUID;
        v_user_name TEXT;
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
        
        -- Usar nome padrão baseado no email
        v_user_name := split_part(v_invite.email, '@', 1);
        
        -- Criar clínica
        INSERT INTO clinicas (nome, slug, documento, telefone, email)
        VALUES (
          p_clinica_nome,
          lower(regexp_replace(p_clinica_nome, '[^a-zA-Z0-9\\s]', '', 'g')),
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
          v_user_name,
          'admin' -- Fundador vira admin
        );
        
        RETURN v_clinica_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_string: sql })

    if (error) {
      console.error('Erro ao executar SQL:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Função atualizada com sucesso' })

  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
