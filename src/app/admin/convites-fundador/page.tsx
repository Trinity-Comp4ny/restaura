'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminConvitesFundador() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [convites, setConvites] = useState<any[]>([])
  const [loadingConvites, setLoadingConvites] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TEMPORÁRIO: Removendo necessidade de autenticação para testes
      const response = await fetch('/api/convites-fundador', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${session?.access_token}`, // TEMPORÁRIO: Removido
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      console.log('Response status:', response.status)
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar convite')
      }

      toast.success('Convite de fundador criado com sucesso!')
      setEmail('')
      await loadConvites()
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar convite')
    } finally {
      setLoading(false)
    }
  }

  const loadConvites = async () => {
    setLoadingConvites(true)
    try {
      // TEMPORÁRIO: Removendo necessidade de autenticação para testes
      const response = await fetch('/api/convites-fundador', {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${session?.access_token}`, // TEMPORÁRIO: Removido
        },
      })
      const data = await response.json()

      if (response.ok) {
        setConvites(data.convites || [])
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error)
    } finally {
      setLoadingConvites(false)
    }
  }

  // Carregar convites ao montar o componente
  useState(() => {
    loadConvites()
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administrar Convites de Fundador</h1>
          <p className="text-gray-600 mt-2">Crie convites para novos fundadores criarem suas clínicas no Restaura</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Formulário de criação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Novo Convite de Fundador
              </CardTitle>
              <CardDescription>
                Convide um usuário para ser fundador e criar sua própria clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email do Fundador</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fundador@exemplo.com"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando Convite...
                    </>
                  ) : (
                    'Criar Convite de Fundador'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de convites */}
          <Card>
            <CardHeader>
              <CardTitle>Convites Criados</CardTitle>
              <CardDescription>
                Histórico de convites de fundador enviados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingConvites ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : convites.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum convite criado ainda</p>
              ) : (
                <div className="space-y-3">
                  {convites.map((convite) => (
                    <div key={convite.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{convite.email}</p>
                        <p className="text-sm text-gray-500">
                          Status: <span className={`inline-flex items-center gap-1 ${
                            convite.status === 'aceito' ? 'text-green-600' :
                            convite.status === 'expirado' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {convite.status === 'aceito' && <CheckCircle className="h-3 w-3" />}
                            {convite.status === 'expirado' && <AlertCircle className="h-3 w-3" />}
                            {convite.status}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Criado em: {new Date(convite.criado_em).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações importantes */}
        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Ao criar um convite de fundador, o usuário receberá um email 
            com um link para criar sua conta, definir senha e configurar sua clínica. O convite expira em 14 dias.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
