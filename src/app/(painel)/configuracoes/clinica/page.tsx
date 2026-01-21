'use client'

import { useState } from 'react'
import { Building, Save, Camera } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useClinica } from '@/hooks/use-user'
import { toast } from 'sonner'
import { BRAZILIAN_STATES } from '@/constants'

export default function ClinicaPage() {
  const { data: clinica } = useClinica()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nome: clinica?.nome || '',
    documento: clinica?.documento || '',
    telefone: clinica?.telefone || '',
    email: clinica?.email || '',
    endereco: clinica?.endereco || '',
    cidade: clinica?.cidade || '',
    estado: clinica?.estado || '',
    cep: clinica?.cep || '',
  })

  function handleSave() {
    // Implementar atualização da clínica
    toast.success('Dados da clínica atualizados com sucesso!')
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dados da Clínica</h1>
        <p className="text-muted-foreground">
          Gerencie as informações da sua clínica.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Logo da Clínica</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 rounded-lg">
              <AvatarImage src={clinica?.url_logo || ''} alt={clinica?.nome} />
              <AvatarFallback className="text-lg rounded-lg">
                <Building className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Camera className="mr-2 h-4 w-4" />
              Alterar Logo
            </Button>
            <p className="text-xs text-muted-foreground">
              PNG ou JPG. Recomendado 200x200px.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Informações da Clínica</CardTitle>
                <CardDescription>
                  Atualize os dados cadastrais da clínica.
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
                <Label htmlFor="nome">Nome da Clínica</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documento">CNPJ</Label>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  disabled={!isEditing}
                  placeholder="00.000.000/0001-00"
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
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Endereço</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Rua, número, complemento"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    disabled={!isEditing}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacidade-50"
                  >
                    <option value="">Selecione...</option>
                    {BRAZILIAN_STATES.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Input
                    placeholder="CEP"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
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
          <CardTitle>Configurações Adicionais</CardTitle>
          <CardDescription>
            Personalize o funcionomento da clínica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Horário de Funcionomento</Label>
              <p className="text-sm text-muted-foreground">
                Defina os horários de atendimento.
              </p>
            </div>
            <Button variant="outline">Configurar</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Convênios Aceitos</Label>
              <p className="text-sm text-muted-foreground">
                Gerencie os planos de saúde aceitos.
              </p>
            </div>
            <Button variant="outline">Gerenciar</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Formas de Pagamento</Label>
              <p className="text-sm text-muted-foreground">
                Configure os métodos de pagamento.
              </p>
            </div>
            <Button variant="outline">Configurar</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Notificações</Label>
              <p className="text-sm text-muted-foreground">
                Configure alertas e lembretes.
              </p>
            </div>
            <Button variant="outline">Configurar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Detalhes técnicos da sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>ID da Clínica</Label>
              <Input value={clinica?.id || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={clinica?.slug || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Data de Cadastro</Label>
              <Input 
                value={clinica?.criado_em ? new Date(clinica.criado_em).toLocaleDateString('pt-BR') : ''} 
                disabled 
                className="bg-muted" 
              />
            </div>
            <div className="space-y-2">
              <Label>Última Atualização</Label>
              <Input 
                value={clinica?.atualizado_em ? new Date(clinica.atualizado_em).toLocaleDateString('pt-BR') : ''} 
                disabled 
                className="bg-muted" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
