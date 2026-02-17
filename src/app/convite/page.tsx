'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Mail, Building, User } from 'lucide-react'

function ConvitePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [convite, setConvite] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Token de convite inválido')
      setLoading(false)
      return
    }

    validarConvite()
  }, [token])

  const validarConvite = async () => {
    try {
      const supabase = createClient()
      
      // Buscar convite pelo token
      const { data: conviteRaw, error: conviteError } = await supabase
        .from('convites')
        .select(`
          *,
          clinicas(nome, logo_url),
          usuarios!convidado_por_id(nome as convidado_por_nome)
        `)
        .eq('token', token!)
        .eq('status', 'pendente')
        .single()

      const conviteData = conviteRaw as any
      if (conviteError || !conviteData) {
        setError('Convite não encontrado ou já utilizado')
        return
      }

      // Verificar se não expirou
      if (new Date(conviteData.data_expiracao) < new Date()) {
        setError('Convite expirado')
        return
      }

      setConvite(conviteData)
      setNome(conviteData.email.split('@')[0]) // Sugestão de nome baseada no email
      
    } catch (err) {
      console.error('Erro ao validar convite:', err)
      setError('Erro ao validar convite')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setValidating(true)

    try {
      // Validações básicas
      if (!nome.trim()) {
        setFormError('Nome é obrigatório')
        return
      }

      if (senha.length < 6) {
        setFormError('Senha deve ter pelo menos 6 caracteres')
        return
      }

      if (senha !== confirmarSenha) {
        setFormError('Senhas não conferem')
        return
      }

      const supabase = createClient()

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: convite.email,
        password: senha,
        options: {
          data: {
            nome: nome.trim(),
            invite_token: token
          }
        }
      })

      if (authError) {
        // Se usuário já existe, fazer login
        if (authError.message.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: convite.email,
            password: senha
          })
          
          if (signInError) {
            setFormError('Email já cadastrado. Verifique sua senha.')
            return
          }
        } else {
          setFormError('Erro ao criar conta: ' + authError.message)
          return
        }
      }

      // 2. Aceitar convite e criar usuário na tabela usuarios
      const userId = authData.user?.id || (await supabase.auth.getUser()).data.user?.id
      
      if (!userId) {
        setFormError('Erro ao obter ID do usuário')
        return
      }

      // Chamar função para aceitar convite
      const { error: acceptError } = await supabase.rpc('aceitar_convite', {
        p_token: token,
        p_auth_usuario_id: userId
      } as any)

      if (acceptError) {
        console.error('Erro ao aceitar convite:', acceptError)
        setFormError('Erro ao processar convite')
        return
      }

      // 3. Atualizar nome do usuário no auth
      await supabase.auth.updateUser({
        data: { nome: nome.trim() }
      })

      setSuccess(true)
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/painel')
      }, 3000)

    } catch (err) {
      console.error('Erro no processo:', err)
      setFormError('Erro inesperado. Tente novamente.')
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-slate-300">Validando convite...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">Convite Inválido</h2>
              <p className="text-slate-300 mb-4">{error}</p>
              <Button onClick={() => router.push('/')} variant="outline" className="border-white/20 text-slate-300 hover:text-white hover:bg-white/10">
                Voltar para página inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">Bem-vindo!</h2>
              <p className="text-slate-300 mb-4">
                Sua conta foi criada com sucesso e você já faz parte da equipe <span className="font-semibold text-blue-400">{convite.clinicas.nome}</span>.
              </p>
              <p className="text-sm text-slate-400">Redirecionando em 3 segundos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4">
      <Card className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center border-b border-white/10 bg-slate-900/40">
          {convite.clinicas.logo_url && (
            <img 
              src={convite.clinicas.logo_url} 
              alt={convite.clinicas.nome}
              className="h-12 w-12 mx-auto mb-4 rounded-lg"
            />
          )}
          <CardTitle className="text-2xl font-semibold tracking-tight text-white">Você foi convidado!</CardTitle>
          <CardDescription className="text-slate-300">
            {convite.usuarios.convidado_por_nome} convidou você para joiningar à equipe{' '}
            <span className="font-semibold text-blue-400">{convite.clinicas.nome}</span> como{' '}
            <span className="font-semibold text-blue-400">{convite.papel}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <Mail className="h-4 w-4" />
              <span>{convite.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <Building className="h-4 w-4" />
              <span>{convite.clinicas.nome}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <User className="h-4 w-4" />
              <span className="capitalize">{convite.papel}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500/20 text-red-200">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="nome" className="text-slate-200">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-slate-200">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-slate-200">Confirmar senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Digite a senha novamente"
                required
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-full bg-blue-500 hover:bg-blue-600 border-none text-white shadow-lg shadow-blue-500/20 font-medium" 
              disabled={validating}
            >
              {validating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Aceitar Convite e Criar Conta'
              )}
            </Button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Ao criar sua conta, você aceita fazer parte da equipe <span className="text-blue-400">{convite.clinicas.nome}</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConvitePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ConvitePageInner />
    </Suspense>
  )
}
