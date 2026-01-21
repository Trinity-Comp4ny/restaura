'use client'

import { useState } from 'react'
import { Camera, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'

export default function PerfilPage() {
  const { data: user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    especialidade: user?.especialidade || '',
    cro: user?.cro || '',
  })

  function handleSave() {
    // Implementar atualização do perfil
    toast.success('Perfil atualizado com sucesso!')
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
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
        </Card>

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
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="(11) 99999-9999"
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
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
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
      </Card>

      <Card>
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
      </Card>
    </div>
  )
}
