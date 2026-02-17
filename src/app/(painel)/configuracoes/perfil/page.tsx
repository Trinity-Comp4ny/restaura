'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Save, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/hooks/use-user'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import { toast } from 'sonner'

export default function PerfilPage() {
  const { data: user, isLoading } = useUser()
  const router = useRouter()
  const queryClient = useQueryClient()
  const supabase = createClient()
  const handleBack = () => router.push('/configuracoes')
  
  // Função para formatar telefone
  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '')
    
    // Aplica a formatação baseada no comprimento
    if (cleaned.length <= 2) {
      return cleaned
    } else if (cleaned.length <= 7) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    } else if (cleaned.length <= 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    } else {
      // Limita em 11 dígitos (com o 9)
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
    }
  }

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '',
    cro: '',
  })

  // Atualiza o formData quando o usuário carrega
  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: formatPhone(user.telefone || ''),
        especialidade: user.especialidade || '',
        cro: user.cro || '',
      })
    }
  }, [user])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value)
    setFormData({ ...formData, telefone: formattedPhone })
  }

  const { mutate: salvarPerfil, isPending: isSaving } = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!user) throw new Error('Usuário não encontrado')

      const payload: Database['public']['Tables']['usuarios']['Update'] = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        especialidade: formData.especialidade,
        cro: formData.cro,
      }

      const { error } = await (supabase as any)
        .from('usuarios')
        .update(payload)
        .eq('auth_usuario_id', user.auth_usuario_id)

      if (error) throw error
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
    },
    onError: (err: any) => {
      toast.error('Não foi possível salvar o perfil. Tente novamente.', {
        description: err?.message,
      })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-6">
            {/* <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="h-24 w-24 rounded-full bg-muted animate-pulse"></div>
                <Button variant="outline" size="sm" disabled>
                  <Camera className="mr-2 h-4 w-4" />
                  Alterar Foto
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize seus dados pessoais e profissionais.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                      <div className="h-10 bg-muted rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.url_avatar || ''} alt={user?.nome} />
                <AvatarFallback className="text-lg">
                  {user?.nome?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Alterar Foto
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou GIF. Máximo 2MB.
              </p>
            </CardContent>
          </Card> */}

          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize seus dados pessoais e profissionais.
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    disabled={!isEditing}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="especialidade">Especialidade</Label>
                  <Input
                    id="especialidade"
                    value={formData.especialidade}
                    onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Ex: Ortodontia"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cro">CRO</Label>
                  <Input
                    id="cro"
                    value={formData.cro}
                    onChange={(e) => setFormData({ ...formData, cro: e.target.value })}
                    disabled={!isEditing}
                    placeholder="12345-SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="papel">Função</Label>
                  <Input
                    id="papel"
                    value={user?.papel === 'admin' ? 'Administrador' : 
                          user?.papel === 'dentista' ? 'Dentista' :
                          user?.papel === 'assistente' ? 'Assistente' : 'Recepcionista'}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => salvarPerfil()} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && user && (
        <>
          {/* <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>
                Detalhes sobre sua conta no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ID do Usuário</Label>
                  <Input value={user?.id || ''} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Data de Cadastro</Label>
                  <Input 
                    value={user?.criado_em ? new Date(user.criado_em).toLocaleDateString('pt-BR') : ''} 
                    disabled 
                    className="bg-muted" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Última Atualização</Label>
                  <Input 
                    value={user?.atualizado_em ? new Date(user.atualizado_em).toLocaleDateString('pt-BR') : ''} 
                    disabled 
                    className="bg-muted" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input 
                    value={user?.ativo ? 'Ativo' : 'Inativo'} 
                    disabled 
                    className="bg-muted" 
                  />
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alterar Senha</Label>
                  <p className="text-sm text-muted-foreground">
                    Altere sua senha de acesso ao sistema.
                  </p>
                </div>
                <Button variant="outline">Alterar Senha</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Autenticação em Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma camada extra de segurança.
                  </p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>
            </CardContent>
          </Card> */}
        </>
      )}
    </div>
  )
}
