import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

export function useDocumentos(pacienteId?: string, type?: string, category?: string) {
  return useQuery({
    queryKey: ['documentos', pacienteId, type, category],
    queryFn: async () => {
      let query = supabase
        .from('documentos' as any)
        .select(`
          *,
          pacientes (id, nome),
          usuarios (id, nome)
        `)
        .order('upload_date', { ascending: false })

      if (pacienteId) {
        query = query.eq('paciente_id', pacienteId)
      }
      if (type) {
        query = query.eq('type', type)
      }
      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        // Log warning para debugging em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.warn('Erro ao buscar documentos:', error)
        }
        return []
      }

      return data
    },
    enabled: true,
  })
}

export function useDocumento(id: string) {
  return useQuery({
    queryKey: ['documento', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos' as any)
        .select(`
          *,
          pacientes (id, nome),
          usuarios (id, nome)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateDocumento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documento: any) => {
      const { data, error } = await supabase
        .from('documentos' as any)
        .insert(documento)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      toast.success('Documento adicionado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao adicionar documento:', error)
      toast.error('Erro ao adicionar documento')
    },
  })
}

export function useUpdateDocumento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...documento }: any) => {
      const { data, error } = await (supabase
        .from('documentos') as any)
        .update(documento)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      queryClient.invalidateQueries({ queryKey: ['documento', variables.id] })
      toast.success('Documento atualizado com sucesso!')
    },
    onError: (error) => {
      // Log error para debugging em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao atualizar documento:', error)
      }
      toast.error('Erro ao atualizar documento')
    },
  })
}

export function useDeleteDocumento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('documentos') as any)
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      toast.success('Documento removido com sucesso!')
    },
    onError: (error) => {
      // Log error para debugging em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao remover documento:', error)
      }
      toast.error('Erro ao remover documento')
    },
  })
}

// Hook para upload de arquivos
export function useUploadFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, pacienteId, nome, tipo, categoria, descricao, tags, dentistaId }: {
      file: File
      pacienteId: string
      nome: string
      tipo: string
      categoria?: string
      descricao?: string
      tags?: string[]
      dentistaId?: string
    }) => {
      // Fazer upload do arquivo para o Supabase Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName)

      // Salvar metadados no banco
      const { data, error } = await (supabase
        .from('documentos') as any)
        .insert({
          paciente_id: pacienteId,
          nome: nome,
          type: tipo,
          category: categoria,
          file_url: urlData.publicUrl,
          file_size: file.size / (1024 * 1024), // Converter para MB
          description: descricao,
          tags: tags || [],
          dentista_id: dentistaId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      toast.success('Arquivo enviado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao enviar arquivo:', error)
      toast.error('Erro ao enviar arquivo')
    },
  })
}
