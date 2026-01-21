export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      clinicas: {
        Row: {
          id: string
          nome: string
          slug: string
          documento: string | null
          telefone: string | null
          email: string | null
          endereco: string | null
          cidade: string | null
          estado: string | null
          cep: string | null
          url_logo: string | null
          configuracoes: Json | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
          documento?: string | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          url_logo?: string | null
          configuracoes?: Json | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
          documento?: string | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          url_logo?: string | null
          configuracoes?: Json | null
          atualizado_em?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          auth_usuario_id: string
          clinica_id: string
          email: string
          nome: string
          papel: 'admin' | 'dentista' | 'assistente' | 'recepcionista'
          telefone: string | null
          url_avatar: string | null
          especialidade: string | null
          cro: string | null
          ativo: boolean
          configuracoes: Json | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          auth_usuario_id: string
          clinica_id: string
          email: string
          nome: string
          papel?: 'admin' | 'dentista' | 'assistente' | 'recepcionista'
          telefone?: string | null
          url_avatar?: string | null
          especialidade?: string | null
          cro?: string | null
          ativo?: boolean
          configuracoes?: Json | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          auth_usuario_id?: string
          clinica_id?: string
          email?: string
          nome?: string
          papel?: 'admin' | 'dentista' | 'assistente' | 'recepcionista'
          telefone?: string | null
          url_avatar?: string | null
          especialidade?: string | null
          cro?: string | null
          ativo?: boolean
          configuracoes?: Json | null
          atualizado_em?: string
        }
      }
      pacientes: {
        Row: {
          id: string
          clinica_id: string
          nome: string
          email: string | null
          telefone: string | null
          data_nascimento: string | null
          genero: 'masculino' | 'feminino' | 'outro' | null
          cpf: string | null
          endereco: string | null
          cidade: string | null
          estado: string | null
          cep: string | null
          profissao: string | null
          tipo_sanguineo: string | null
          fator_rh: string | null
          contato_emergencia: string | null
          telefone_emergencia: string | null
          convenio: string | null
          carteira_convenio: string | null
          alergias: string | null
          doencas_sistemicas: string | null
          medicamentos: string | null
          condicoes_especiais: string | null
          ultima_consulta_odonto: string | null
          tratamentos_anteriores: string | null
          habitos: string | null
          higiene_bucal: string | null
          observacoes: string | null
          url_avatar: string | null
          ativo: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          nome: string
          email?: string | null
          telefone?: string | null
          data_nascimento?: string | null
          genero?: 'masculino' | 'feminino' | 'outro' | null
          cpf?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          profissao?: string | null
          tipo_sanguineo?: string | null
          fator_rh?: string | null
          contato_emergencia?: string | null
          telefone_emergencia?: string | null
          convenio?: string | null
          carteira_convenio?: string | null
          alergias?: string | null
          doencas_sistemicas?: string | null
          medicamentos?: string | null
          condicoes_especiais?: string | null
          ultima_consulta_odonto?: string | null
          tratamentos_anteriores?: string | null
          habitos?: string | null
          higiene_bucal?: string | null
          observacoes?: string | null
          url_avatar?: string | null
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          nome?: string
          email?: string | null
          telefone?: string | null
          data_nascimento?: string | null
          genero?: 'masculino' | 'feminino' | 'outro' | null
          cpf?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          profissao?: string | null
          tipo_sanguineo?: string | null
          fator_rh?: string | null
          contato_emergencia?: string | null
          telefone_emergencia?: string | null
          convenio?: string | null
          carteira_convenio?: string | null
          alergias?: string | null
          doencas_sistemicas?: string | null
          medicamentos?: string | null
          condicoes_especiais?: string | null
          ultima_consulta_odonto?: string | null
          tratamentos_anteriores?: string | null
          habitos?: string | null
          higiene_bucal?: string | null
          observacoes?: string | null
          url_avatar?: string | null
          ativo?: boolean
          atualizado_em?: string
        }
      }
      procedimentos: {
        Row: {
          id: string
          clinica_id: string
          nome: string
          descricao: string | null
          duracao_minutos: number
          preco: number
          categoria: string | null
          cor: string | null
          ativo: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          nome: string
          descricao?: string | null
          duracao_minutos?: number
          preco?: number
          categoria?: string | null
          cor?: string | null
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          nome?: string
          descricao?: string | null
          duracao_minutos?: number
          preco?: number
          categoria?: string | null
          cor?: string | null
          ativo?: boolean
          atualizado_em?: string
        }
      }
      consultas: {
        Row: {
          id: string
          clinica_id: string
          paciente_id: string
          dentista_id: string
          procedimento_id: string | null
          horario_inicio: string
          horario_fim: string
          status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'nao_compareceu'
          observacoes: string | null
          criado_por_id: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          paciente_id: string
          dentista_id: string
          procedimento_id?: string | null
          horario_inicio: string
          horario_fim: string
          status?: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'nao_compareceu'
          observacoes?: string | null
          criado_por_id?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          paciente_id?: string
          dentista_id?: string
          procedimento_id?: string | null
          horario_inicio?: string
          horario_fim?: string
          status?: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'nao_compareceu'
          observacoes?: string | null
          criado_por_id?: string | null
          atualizado_em?: string
        }
      }
      prontuarios: {
        Row: {
          id: string
          clinica_id: string
          paciente_id: string
          dentista_id: string
          consulta_id: string | null
          tipo: 'anamnesia' | 'evolução' | 'prescrição' | 'certificado' | 'referência'
          titulo: string
          conteudo: Json
          anexos: string[] | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          paciente_id: string
          dentista_id: string
          consulta_id?: string | null
          tipo: 'anamnesia' | 'evolução' | 'prescrição' | 'certificado' | 'referência'
          titulo: string
          conteudo: Json
          anexos?: string[] | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          paciente_id?: string
          dentista_id?: string
          consulta_id?: string | null
          tipo?: 'anamnesia' | 'evolução' | 'prescrição' | 'certificado' | 'referência'
          titulo?: string
          conteudo?: Json
          anexos?: string[] | null
          atualizado_em?: string
        }
      }
      transacoes: {
        Row: {
          id: string
          clinica_id: string
          paciente_id: string | null
          consulta_id: string | null
          tipo: 'receita' | 'despesa'
          categoria: string
          descricao: string
          valor: number
          metodo_pagamento: string | null
          status: 'pendente' | 'pago' | 'cancelado' | 'estornado'
          data_vencimento: string | null
          pago_em: string | null
          criado_por_id: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          paciente_id?: string | null
          consulta_id?: string | null
          tipo: 'receita' | 'despesa'
          categoria: string
          descricao: string
          valor: number
          metodo_pagamento?: string | null
          status?: 'pendente' | 'pago' | 'cancelado' | 'estornado'
          data_vencimento?: string | null
          pago_em?: string | null
          criado_por_id?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          paciente_id?: string | null
          consulta_id?: string | null
          tipo?: 'receita' | 'despesa'
          categoria?: string
          descricao?: string
          valor?: number
          metodo_pagamento?: string | null
          status?: 'pendente' | 'pago' | 'cancelado' | 'estornado'
          data_vencimento?: string | null
          pago_em?: string | null
          criado_por_id?: string | null
          atualizado_em?: string
        }
      }
      produtos: {
        Row: {
          id: string
          clinica_id: string
          nome: string
          descricao: string | null
          categoria: string | null
          marca: string | null
          modelo: string | null
          cor_tamanho: string | null
          unidade: string
          quantidade: number
          quantidade_minima: number
          preco: number
          fornecedor: string | null
          localizacao: string | null
          observacoes: string | null
          ativo: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          nome: string
          descricao?: string | null
          categoria?: string | null
          marca?: string | null
          modelo?: string | null
          cor_tamanho?: string | null
          unidade?: string
          quantidade?: number
          quantidade_minima?: number
          preco?: number
          fornecedor?: string | null
          localizacao?: string | null
          observacoes?: string | null
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          nome?: string
          descricao?: string | null
          categoria?: string | null
          marca?: string | null
          modelo?: string | null
          cor_tamanho?: string | null
          unidade?: string
          quantidade?: number
          quantidade_minima?: number
          preco?: number
          fornecedor?: string | null
          localizacao?: string | null
          observacoes?: string | null
          ativo?: boolean
          atualizado_em?: string
        }
      }
      produto_lotes: {
        Row: {
          id: string
          clinica_id: string
          produto_id: string
          numero_lote: string
          quantidade: number
          data_fabricacao: string | null
          data_validade: string | null
          data_compra: string | null
          preco_compra: number | null
          fornecedor: string | null
          observacoes: string | null
          ativo: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          produto_id: string
          numero_lote: string
          quantidade?: number
          data_fabricacao?: string | null
          data_validade?: string | null
          data_compra?: string | null
          preco_compra?: number | null
          fornecedor?: string | null
          observacoes?: string | null
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          produto_id?: string
          numero_lote?: string
          quantidade?: number
          data_fabricacao?: string | null
          data_validade?: string | null
          data_compra?: string | null
          preco_compra?: number | null
          fornecedor?: string | null
          observacoes?: string | null
          ativo?: boolean
          atualizado_em?: string
        }
      }
      procedimento_materiais: {
        Row: {
          id: string
          clinica_id: string
          procedimento_id: string
          produto_id: string
          quantidade_default: number
          quantidade_min: number
          quantidade_max: number
          obrigatorio: boolean
          variavel: boolean
          produto_substituto_id: string | null
          notas_clinicas: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          procedimento_id: string
          produto_id: string
          quantidade_default: number
          quantidade_min?: number
          quantidade_max?: number
          obrigatorio?: boolean
          variavel?: boolean
          produto_substituto_id?: string | null
          notas_clinicas?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          procedimento_id?: string
          produto_id?: string
          quantidade_default?: number
          quantidade_min?: number
          quantidade_max?: number
          obrigatorio?: boolean
          variavel?: boolean
          produto_substituto_id?: string | null
          notas_clinicas?: string | null
          atualizado_em?: string
        }
      }
      consumo_materiais: {
        Row: {
          id: string
          clinica_id: string
          consulta_id: string
          paciente_id: string
          produto_id: string
          lote_id: string | null
          quantidade: number
          preco_unitario: number | null
          preco_total: number | null
          consumido_por_id: string
          observacoes: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          consulta_id: string
          paciente_id: string
          produto_id: string
          lote_id?: string | null
          quantidade: number
          preco_unitario?: number | null
          preco_total?: number | null
          consumido_por_id: string
          observacoes?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          consulta_id?: string
          paciente_id?: string
          produto_id?: string
          lote_id?: string | null
          quantidade?: number
          preco_unitario?: number | null
          preco_total?: number | null
          consumido_por_id?: string
          observacoes?: string | null
        }
      }
      movimentacoes_estoque: {
        Row: {
          id: string
          clinica_id: string
          produto_id: string
          lote_id: string | null
          tipo: string
          quantidade: number
          quantidade_anterior: number | null
          nova_quantidade: number | null
          motivo: string | null
          tipo_referencia: string | null
          id_referencia: string | null
          paciente_id: string | null
          consulta_id: string | null
          realizado_por_id: string
          observacoes: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          produto_id: string
          lote_id?: string | null
          tipo: string
          quantidade: number
          quantidade_anterior?: number | null
          nova_quantidade?: number | null
          motivo?: string | null
          tipo_referencia?: string | null
          id_referencia?: string | null
          paciente_id?: string | null
          consulta_id?: string | null
          realizado_por_id: string
          observacoes?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          produto_id?: string
          lote_id?: string | null
          tipo?: string
          quantidade?: number
          quantidade_anterior?: number | null
          nova_quantidade?: number | null
          motivo?: string | null
          tipo_referencia?: string | null
          id_referencia?: string | null
          paciente_id?: string | null
          consulta_id?: string | null
          realizado_por_id?: string
          observacoes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'dentista' | 'assistente' | 'recepcionista'
      appointment_status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'nao_compareceu'
      record_type: 'anamnesia' | 'evolução' | 'prescrição' | 'certificado' | 'referência'
      transaction_type: 'receita' | 'despesa'
      transaction_status: 'pendente' | 'pago' | 'cancelado' | 'estornado'
      genero: 'masculino' | 'feminino' | 'outro'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}