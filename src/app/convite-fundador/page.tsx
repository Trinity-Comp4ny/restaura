'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2, CheckCircle, XCircle, Mail, Building, User, Stethoscope, MapPin, Phone, FileText, Eye, EyeOff, ArrowLeft } from 'lucide-react'

function ConviteFundadorPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [convite, setConvite] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Form state - User
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  
  // Form state - Clinic
  const [clinicaNome, setClinicaNome] = useState('')
  const [clinicaDocumento, setClinicaDocumento] = useState('')
  const [clinicaTelefone, setClinicaTelefone] = useState('')
  const [clinicaEmail, setClinicaEmail] = useState('')
  
  const [formError, setFormError] = useState('')
  const [step, setStep] = useState(1) // 1: User data, 2: Clinic data
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token de convite inválido')
      setLoading(false)
      return
    }

    validarConvite()
  }, [token])

  // Formatação de CNPJ
  const formatarCNPJ = (value: string) => {
    const cnpj = value.replace(/\D/g, '')
    const cnpjLimitado = cnpj.slice(0, 14)
    
    if (cnpjLimitado.length <= 2) {
      return cnpjLimitado
    } else if (cnpjLimitado.length <= 5) {
      return `${cnpjLimitado.slice(0, 2)}.${cnpjLimitado.slice(2)}`
    } else if (cnpjLimitado.length <= 8) {
      return `${cnpjLimitado.slice(0, 2)}.${cnpjLimitado.slice(2, 5)}.${cnpjLimitado.slice(5)}`
    } else if (cnpjLimitado.length <= 12) {
      return `${cnpjLimitado.slice(0, 2)}.${cnpjLimitado.slice(2, 5)}.${cnpjLimitado.slice(5, 8)}/${cnpjLimitado.slice(8)}`
    } else {
      return `${cnpjLimitado.slice(0, 2)}.${cnpjLimitado.slice(2, 5)}.${cnpjLimitado.slice(5, 8)}/${cnpjLimitado.slice(8, 12)}-${cnpjLimitado.slice(12, 14)}`
    }
  }

  // Formatação de Telefone
  const formatarTelefone = (value: string) => {
    if (!value) return ''
    
    const telefone = value.replace(/\D/g, '')
    const telefoneLimitado = telefone.slice(0, 11)
    
    if (telefoneLimitado.length <= 2) {
      return `(${telefoneLimitado}`
    } else if (telefoneLimitado.length <= 7) {
      return `(${telefoneLimitado.slice(0, 2)}) ${telefoneLimitado.slice(2)}`
    } else {
      return `(${telefoneLimitado.slice(0, 2)}) ${telefoneLimitado.slice(2, 7)}-${telefoneLimitado.slice(7)}`
    }
  }

  const validarConvite = async () => {
    console.log('🔍 Iniciando validação do convite...')
    try {
      // Usar endpoint público que bypass RLS
      console.log('📡 Fazendo requisição para:', `/api/public/convite-fundador?token=${token}`)
      const response = await fetch(`/api/public/convite-fundador?token=${token}`)
      console.log('📡 Resposta recebida:', response.status)
      const data = await response.json()
      console.log('📦 Dados recebidos:', data)

      if (!response.ok) {
        console.log('❌ Erro na resposta:', data.error)
        setError(data.error || 'Convite não encontrado ou já utilizado')
        setLoading(false)
        return
      }

      console.log('✅ Convite válido, atualizando estado...')
      setConvite(data.convite)
      setNome(data.convite.email.split('@')[0]) // Sugestão de nome baseada no email
      
    } catch (err) {
      console.error('❌ Erro ao validar convite:', err)
      setError('Erro ao validar convite')
    } finally {
      console.log('🏁 Finalizando validação, loading=false')
      setLoading(false)
    }
  }

  const validateUserStep = () => {
    if (!nome.trim()) {
      setFormError('Nome é obrigatório')
      return false
    }

    if (senha.length < 6) {
      setFormError('Senha deve ter pelo menos 6 caracteres')
      return false
    }

    if (senha !== confirmarSenha) {
      setFormError('Senhas não conferem')
      return false
    }

    return true
  }

  const validateClinicStep = () => {
    if (!clinicaNome.trim()) {
      setFormError('Nome da clínica é obrigatório')
      return false
    }

    if (!clinicaTelefone.trim()) {
      setFormError('Telefone da clínica é obrigatório')
      return false
    }

    // Validação básica de telefone
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$|^(\d{2})\s\d{4}-\d{4}$/
    if (!phoneRegex.test(clinicaTelefone)) {
      setFormError('Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX')
      return false
    }

    return true
  }

  const handleNextStep = () => {
    if (step === 1 && validateUserStep()) {
      setStep(2)
      setFormError('')
    }
  }

  const handlePreviousStep = () => {
    setStep(1)
    setFormError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      if (!validateClinicStep()) {
        setSubmitting(false)
        return
      }

      const supabase = createSupabaseClient()

      // 1. Criar usuário usando endpoint especial que contorna rate limit
      const response = await fetch('/api/auth/create-founder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: convite.email,
          password: senha,
          nome: nome.trim(),
          token: token
        })
      })

      const authResult = await response.json()

      if (!response.ok) {
        setFormError(authResult.error || 'Erro ao criar conta')
        setSubmitting(false)
        return
      }

      // 2. Fazer login do usuário
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: convite.email,
        password: senha
      })
      
      if (signInError) {
        setFormError('Erro ao fazer login: ' + signInError.message)
        setSubmitting(false)
        return
      }

      // 3. Obter ID do usuário
      const userId = authResult.userId
      
      if (!userId) {
        setFormError('Erro ao obter ID do usuário')
        setSubmitting(false)
        return
      }

      // 4. Aceitar convite e criar clínica via API
      const acceptResponse = await fetch('/api/auth/accept-founder-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          clinicaNome,
          userId,
          userName: nome
        })
      })

      const acceptData = await acceptResponse.json()

      if (!acceptResponse.ok) {
        setFormError('Erro ao criar clínica: ' + acceptData.error)
        setSubmitting(false)
        return
      }

      console.log('✅ Clínica criada com sucesso:', acceptData)
      await supabase.auth.updateUser({
        data: { nome: nome.trim() }
      })

      setSuccess(true)
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/home')
      }, 3000)

    } catch (err) {
      console.error('Erro no processo:', err)
      setFormError('Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-slate-300">Validando convite de fundador...</p>
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
              <h2 className="text-lg font-semibold text-white mb-2">Clínica Criada!</h2>
              <p className="text-slate-300 mb-4">
                Sua clínica <span className="font-semibold text-blue-400">{clinicaNome}</span> foi criada com sucesso.
                Você agora é o administrador e pode começar a usar o sistema.
              </p>
              <p className="text-sm text-slate-400">Redirecionando para o painel em 3 segundos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
      {/* Background patterns - igual à landing */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Glows - igual à landing */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-[440px] w-[440px] rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[440px] w-[440px] rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-800/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center bg-slate-900/40">
          {/* Botão voltar */}
          <div className="absolute left-6 top-6">
            <button 
              type="button" 
              onClick={handlePreviousStep}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logos/logo.svg" 
              alt="Restaura" 
              className="h-8 w-8"
            />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-white">Crie sua Clínica no Restaura</CardTitle>
          <CardDescription className="text-slate-300">
            Você foi convidado para ser um fundador! Vamos configurar sua conta e clínica.
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                1
              </div>
              <span className="text-sm font-medium">Sua Conta</span>
            </div>
            <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                2
              </div>
              <span className="text-sm font-medium">Sua Clínica</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <Mail className="h-4 w-4" />
              <span>{convite.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <User className="h-4 w-4" />
              <span>Fundador & Administrador</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {formError && (
              <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/20 text-red-200">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: User Data */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-slate-200">Seu nome completo</Label>
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
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="pr-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha" className="text-slate-200">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Digite a senha novamente"
                      required
                      className="pr-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="button" 
                  onClick={handleNextStep}
                  className="w-full h-12 rounded-full bg-blue-500 hover:bg-blue-600 border-none text-white shadow-lg shadow-blue-500/20 font-medium"
                >
                  Próximo: Dados da Clínica
                </Button>
              </div>
            )}

            {/* Step 2: Clinic Data */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicaNome" className="text-slate-200">
                    <Building className="w-4 h-4 inline mr-2" />
                    Nome da Clínica
                  </Label>
                  <Input
                    id="clinicaNome"
                    type="text"
                    value={clinicaNome}
                    onChange={(e) => setClinicaNome(e.target.value)}
                    placeholder="Clínica Sorriso Feliz"
                    required
                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicaDocumento" className="text-slate-200">
                    <FileText className="w-4 h-4 inline mr-2" />
                    CNPJ (opcional)
                  </Label>
                  <Input
                    id="clinicaDocumento"
                    type="text"
                    value={formatarCNPJ(clinicaDocumento)}
                    onChange={(e) => setClinicaDocumento(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    maxLength={18}
                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicaTelefone" className="text-slate-200">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Telefone da Clínica
                  </Label>
                  <Input
                    id="clinicaTelefone"
                    type="tel"
                    value={formatarTelefone(clinicaTelefone)}
                    onChange={(e) => setClinicaTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                    maxLength={15}
                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicaEmail" className="text-slate-200">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email da Clínica (opcional)
                  </Label>
                  <Input
                    id="clinicaEmail"
                    type="email"
                    value={clinicaEmail}
                    onChange={(e) => setClinicaEmail(e.target.value)}
                    placeholder="contato@clinica.com"
                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                  />
                </div>

                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    className="w-full max-w-xs h-12 rounded-full bg-blue-500 hover:bg-blue-600 border-none text-white shadow-lg shadow-blue-500/20 font-medium" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Criando Clínica...
                      </>
                    ) : (
                      'Criar Minha Clínica'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="text-xs text-slate-400 text-center mt-6 pt-6 border-t border-white/10">
            Ao criar sua clínica, você aceita os termos de uso do Restaura e se torna o administrador principal.
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

export default function ConviteFundadorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ConviteFundadorPageInner />
    </Suspense>
  )
}
