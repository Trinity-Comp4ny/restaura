-- Remove qualquer trigger que tenta inserir dados padrão ao criar clínica
-- e que referencia centros_custo (tabela removida)

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE event_object_table = 'clinicas'
      AND trigger_schema = 'public'
  LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON clinicas';
    RAISE NOTICE 'Dropped trigger: %', r.trigger_name;
  END LOOP;
END;
$$;

-- Remove funções relacionadas a dados padrão de clínica que referenciam centros_custo
DROP FUNCTION IF EXISTS criar_dados_padrao_clinica() CASCADE;
DROP FUNCTION IF EXISTS setup_clinica_padrao() CASCADE;
DROP FUNCTION IF EXISTS inicializar_clinica() CASCADE;
DROP FUNCTION IF EXISTS criar_categorias_padrao() CASCADE;
