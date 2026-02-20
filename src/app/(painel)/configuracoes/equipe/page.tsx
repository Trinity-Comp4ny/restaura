'use client'

import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  UserCog,
  Shield,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  ArrowLeft,
  Loader2,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEquipe } from '@/hooks/use-equipe'
import { getInitials, formatPhone } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

const PAPEL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  dentista: 'Dentista',
  assistente: 'Assistente',
  recepcionista: 'Recepcionista',
}

const PAPEL_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  dentista: 'bg-blue-100 text-blue-800',
  assistente: 'bg-green-100 text-green-800',
  recepcionista: 'bg-amber-100 text-amber-800',
}

type Papel = Database['public']['Tables']['usuarios']['Row']['papel']
type Convite = {
  id: string
  email: string
  papel: string
  status: string
  criado_em: string
  data_expiracao: string
  aceito_em: string | null
  usuarios: {
    nome: string
  }
}

export default function EquipePage() {
  const [search, setSearch] = useState('')
  const router = useRouter()
  const { data: membros, isLoading, refetch } = useEquipe({ search })
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [convites, setConvites] = useState<Convite[]>([])
  const [loadingConvites, setLoadingConvites] = useState(true)
  const [conviteError, setConviteError] = useState('')
  const [conviteSuccess, setConviteSuccess] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [papel, setPapel] = useState<Papel>('recepcionista')
  const [sending, setSending] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ nome: '', email: '', telefone: '', papel: 'recepcionista' as Papel })

  function handleConvidar() {
    setDialogOpen(true)
  }

  useEffect(() => {
    fetchConvites()
  }, [])

  async function fetchConvites() {
    try {
      setLoadingConvites(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('convites')
        .select('*, usuarios!convidado_por_id(nome)')
        .order('criado_em', { ascending: false })

      if (error) throw error
      setConvites((data ?? []) as Convite[])
    } catch (err) {
      console.error('Erro ao buscar convites:', err)
      setConviteError('Erro ao carregar convites')
    } finally {
      setLoadingConvites(false)
    }
  }

  async function updateUsuario(
    id: string,
    payload: Partial<Database['public']['Tables']['usuarios']['Update']>,
    successMessage: string,
  ) {
    try {
      setLoadingAction(id)
      const supabase = createClient()

      const { error } = await (supabase as any)
        .from('usuarios')
        .update(payload as any)
        .eq('id', id)
      if (error) throw error

      toast.success(successMessage)
      await refetch()
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível atualizar o usuário')
    } finally {
      setLoadingAction(null)
    }
  }

  function handleAlterarPermissao(id: string, role: Papel) {
    updateUsuario(id, { papel: role }, 'Permissão atualizada')
  }

  function handleDesativar(id: string, ativo: boolean) {
    updateUsuario(id, { ativo: !ativo }, ativo ? 'Usuário desativado' : 'Usuário reativado')
  }

  function handleEditar(membro: any) {
    setEditingUserId(membro.id)
    setEditForm({
      nome: membro.nome ?? '',
      email: membro.email ?? '',
      telefone: membro.telefone ?? '',
      papel: membro.papel ?? 'recepcionista',
    })
    setEditDialogOpen(true)
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUserId) return
    await updateUsuario(editingUserId, editForm, 'Usuário atualizado')
    setEditDialogOpen(false)
    setEditingUserId(null)
  }

  const filteredConvites = {
    pendentes: convites.filter((c) => c.status === 'pendente'),
    aceitos: convites.filter((c) => c.status === 'aceito'),
    expirados: convites.filter((c) => c.status === 'expirado'),
    todos: convites,
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pendente':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" /> Pendente
          </Badge>
        )
      case 'aceito':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Aceito
          </Badge>
        )
      case 'expirado':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" /> Expirado
          </Badge>
        )
      case 'cancelado':
        return (
          <Badge variant="outline">
            <XCircle className="w-3 h-3 mr-1" /> Cancelado
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  function getRoleBadge(role: string) {
    return (
      <Badge className={PAPEL_COLORS[role] ?? 'bg-gray-100 text-gray-800'}>{PAPEL_LABELS[role] ?? role}</Badge>
    )
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setConviteError('')
    setConviteSuccess('')

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/convites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ email: email.toLowerCase(), papel }),
      })

      const data = await res.json()

      if (!res.ok) {
        setConviteError(data.error || 'Erro ao enviar convite')
        return
      }

      toast.success(`Convite enviado para ${email}`)
      setEmail('')
      setDialogOpen(false)
      await fetchConvites()
    } catch (err) {
      console.error('Erro ao enviar convite:', err)
      setConviteError('Erro ao enviar convite')
    } finally {
      setSending(false)
    }
  }

  async function handleReenviarConvite(conviteId: string) {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/convites', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ conviteId }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erro ao reenviar convite')
        return
      }

      toast.success('Convite reenviado com sucesso')
    } catch (err) {
      console.error('Erro ao reenviar convite:', err)
      toast.error('Erro ao reenviar convite')
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
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
              <h1 className="text-3xl font-semibold tracking-tight">Equipe</h1>
              <p className="text-muted-foreground">Gerencie usuários e permissões da sua clínica.</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleConvidar}>
                <Plus className="mr-2 h-4 w-4" />
                Convidar membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar novo membro</DialogTitle>
                <DialogDescription>Envie um convite para alguém se juntar à sua equipe.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="papel">Função</Label>
                  <Select value={papel} onValueChange={(v) => setPapel(v as Papel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recepcionista">Recepcionista</SelectItem>
                      <SelectItem value="assistente">Assistente</SelectItem>
                      <SelectItem value="dentista">Dentista</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={sending} className="flex-1">
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar Convite
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-3">
                <UserCog className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de membros</p>
                <p className="text-2xl font-bold">{membros?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">
                  {membros?.filter((m) => m.ativo).length ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-3">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">
                  {membros?.filter((m) => m.papel === 'admin').length ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Membros da equipe</CardTitle>
                <CardDescription>
                  Lista de usuários com acesso ao sistema da clínica.
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome ou e-mail..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : membros && membros.length > 0 ? (
              <div className="divide-y">
                {membros.map((membro) => (
                  <div
                    key={membro.id}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar>
                        <AvatarImage src={membro.url_avatar ?? ''} alt={membro.nome} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(membro.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{membro.nome}</p>
                          {!membro.ativo && (
                            <Badge variant="secondary" className="text-xs">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{membro.email}</span>
                        </div>
                        {membro.telefone && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {formatPhone(membro.telefone)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="secondary"
                        className={PAPEL_COLORS[membro.papel] ?? 'bg-gray-100 text-gray-800'}
                      >
                        {PAPEL_LABELS[membro.papel] ?? membro.papel}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditar(membro)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDesativar(membro.id, membro.ativo)}
                            disabled={loadingAction === membro.id}
                            className="text-destructive focus:text-destructive"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            {membro.ativo ? 'Desativar' : 'Reativar'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <UserCog className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Nenhum membro encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  {search
                    ? 'Tente ajustar os termos da busca.'
                    : 'Convide membros para fazer parte da equipe da sua clínica.'}
                </p>
                {!search && (
                  <Button onClick={handleConvidar}>
                    <Plus className="mr-2 h-4 w-4" />
                    Convidar membro
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Convites</CardTitle>
                <CardDescription>Convites pendentes, aceitos e expirados da equipe.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {conviteError && (
              <Alert variant="destructive">
                <AlertDescription>{conviteError}</AlertDescription>
              </Alert>
            )}
            {conviteSuccess && (
              <Alert>
                <AlertDescription>{conviteSuccess}</AlertDescription>
              </Alert>
            )}

            {loadingConvites ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Tabs defaultValue="pendentes" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="pendentes">Pendentes ({filteredConvites.pendentes.length})</TabsTrigger>
                  <TabsTrigger value="aceitos">Aceitos ({filteredConvites.aceitos.length})</TabsTrigger>
                  <TabsTrigger value="expirados">Expirados ({filteredConvites.expirados.length})</TabsTrigger>
                  <TabsTrigger value="todos">Todos ({filteredConvites.todos.length})</TabsTrigger>
                </TabsList>

                {Object.entries(filteredConvites).map(([status, convitesList]) => (
                  <TabsContent key={status} value={status}>
                    <div className="space-y-4">
                      {convitesList.length === 0 ? (
                        <Card>
                          <CardContent className="flex items-center justify-center h-32">
                            <div className="text-center text-muted-foreground">
                              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>
                                Nenhum convite {status === 'todos' ? 'encontrado' : status}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        convitesList.map((convite) => (
                          <Card key={convite.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-3">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{convite.email}</span>
                                    {getStatusBadge(convite.status)}
                                    {getRoleBadge(convite.papel)}
                                  </div>

                                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        Enviado em {new Date(convite.criado_em).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>Expira em {new Date(convite.data_expiracao).toLocaleDateString('pt-BR')}</span>
                                    </div>

                                    {convite.aceito_em && (
                                      <div className="flex items-center space-x-1">
                                        <CheckCircle className="w-3 h-3" />
                                        <span>Aceito em {new Date(convite.aceito_em).toLocaleDateString('pt-BR')}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="text-sm text-muted-foreground">Convidado por {convite.usuarios.nome}</div>
                                </div>

                                <div className="flex space-x-2">
                                  {convite.status === 'pendente' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleReenviarConvite(convite.id)}
                                    >
                                      <RefreshCw className="w-3 h-3 mr-1" />
                                      Reenviar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar membro</DialogTitle>
          <DialogDescription>Atualize as informações do usuário.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={editForm.nome}
              onChange={(e) => setEditForm((prev) => ({ ...prev, nome: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-edit">Email</Label>
            <Input
              id="email-edit"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={editForm.telefone}
              onChange={(e) => setEditForm((prev) => ({ ...prev, telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="papel-edit">Função</Label>
            <Select
              value={editForm.papel}
              onValueChange={(v) => setEditForm((prev) => ({ ...prev, papel: v as Papel }))}
            >
              <SelectTrigger id="papel-edit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recepcionista">Recepcionista</SelectItem>
                <SelectItem value="assistente">Assistente</SelectItem>
                <SelectItem value="dentista">Dentista</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!editingUserId || loadingAction === editingUserId}>
              {loadingAction === editingUserId ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
