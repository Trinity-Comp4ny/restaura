'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Mail, Users, Calendar, CheckCircle, XCircle, Clock, Plus, RefreshCw } from 'lucide-react'

interface Convite {
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

export default function ConvitesPage() {
  const [loading, setLoading] = useState(true)
  const [convites, setConvites] = useState<Convite[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [email, setEmail] = useState('')
  const [papel, setPapel] = useState('recepcionista')
  const [sending, setSending] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchConvites()
  }, [])

  const fetchConvites = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('convites')
        .select(`
          *,
          usuarios!convidado_por_id(nome)
        `)
        .order('criado_em', { ascending: false })

      if (error) throw error
      
      setConvites(data || [])
      
    } catch (err) {
      console.error('Erro ao buscar convites:', err)
      setError('Erro ao carregar convites')
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('convites')
        .insert({
          email: email.toLowerCase(),
          papel,
          status: 'pendente'
        } as any)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          setError('Já existe um convite pendente para este email')
        } else {
          throw error
        }
        return
      }

      // Enviar email (implementar com seu serviço)
      console.log('Convite criado:', data)
      
      setSuccess(`Convite enviado para ${email}`)
      setEmail('')
      setDialogOpen(false)
      
      // Atualizar lista
      await fetchConvites()
      
    } catch (err) {
      console.error('Erro ao enviar convite:', err)
      setError('Erro ao enviar convite')
    } finally {
      setSending(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>
      case 'aceito':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Aceito</Badge>
      case 'expirado':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Expirado</Badge>
      case 'cancelado':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" /> Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      dentista: 'bg-blue-100 text-blue-800',
      assistente: 'bg-green-100 text-green-800',
      recepcionista: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {role}
      </Badge>
    )
  }

  const filteredConvites = {
    pendentes: convites.filter(c => c.status === 'pendente'),
    aceitos: convites.filter(c => c.status === 'aceito'),
    expirados: convites.filter(c => c.status === 'expirado'),
    todos: convites
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Convites</h1>
          <p className="text-gray-600">Gerencie os convites para sua equipe</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Convite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar novo membro</DialogTitle>
              <DialogDescription>
                Envie um convite para alguém se juntar à sua equipe
              </DialogDescription>
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
                <Select value={papel} onValueChange={setPapel}>
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pendentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendentes">
            Pendentes ({filteredConvites.pendentes.length})
          </TabsTrigger>
          <TabsTrigger value="aceitos">
            Aceitos ({filteredConvites.aceitos.length})
          </TabsTrigger>
          <TabsTrigger value="expirados">
            Expirados ({filteredConvites.expirados.length})
          </TabsTrigger>
          <TabsTrigger value="todos">
            Todos ({filteredConvites.todos.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(filteredConvites).map(([status, convitesList]) => (
          <TabsContent key={status} value={status}>
            <div className="space-y-4">
              {convitesList.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum convite {status === 'todos' ? 'encontrado' : status}</p>
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
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{convite.email}</span>
                            {getStatusBadge(convite.status)}
                            {getRoleBadge(convite.papel)}
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Enviado em {new Date(convite.criado_em).toLocaleDateString('pt-BR')}</span>
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
                          
                          <div className="text-sm text-gray-500">
                            Convidado por {convite.usuarios.nome}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {convite.status === 'pendente' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Implementar reenvio de convite
                                console.log('Reenviar convite:', convite.id)
                              }}
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
    </div>
  )
}
