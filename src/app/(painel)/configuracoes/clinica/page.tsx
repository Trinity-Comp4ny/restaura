'use client'

import { useEffect, useState } from 'react'
import { Building, Save, Camera, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useClinica } from '@/hooks/use-user'
import { useUpdateClinica } from '@/hooks/use-multi-clinic'
import { toast } from 'sonner'
import { BRAZILIAN_STATES } from '@/constants'

export default function ClinicaPage() {
  const { data: clinica } = useClinica()
  const router = useRouter()
  const { mutateAsync: updateClinica, isPending: saving } = useUpdateClinica()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  })

  useEffect(() => {
    if (!clinica) return

    setFormData({
      nome: clinica.nome || '',
      documento: clinica.documento || '',
      telefone: clinica.telefone || '',
      email: clinica.email || '',
      endereco: clinica.endereco || '',
      cidade: clinica.cidade || '',
      estado: clinica.estado || '',
      cep: clinica.cep || '',
    })
  }, [clinica])

  async function handleSave() {
    if (!clinica?.id) {
      toast.error('Clínica não encontrada para salvar')
      return
    }

    try {
      await updateClinica({
        id: clinica.id,
        nome: formData.nome,
        documento: formData.documento,
        telefone: formData.telefone,
        email: formData.email,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
      } as any)
      toast.success('Dados da clínica atualizados com sucesso!')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao salvar dados da clínica')
    }
  }

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
  }

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    return digits.replace(/(\d{5})(\d)/, '$1-$2')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/configuracoes')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dados da Clínica</h1>
        </div>
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
            <Button variant="outline" size="sm" disabled>
              <Camera className="mr-2 h-4 w-4" />
              Em breve
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
                  onChange={(e) => setFormData({ ...formData, documento: formatCnpj(e.target.value) })}
                  disabled={!isEditing}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
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
                    onChange={(e) => setFormData({ ...formData, cep: formatCep(e.target.value) })}
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
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* <Card>
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
              <Label>Métodos de Cobrança</Label>
              <p className="text-sm text-muted-foreground">
                Configure os métodos de cobrança.
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
      </Card> */}
    </div>
  )
}
