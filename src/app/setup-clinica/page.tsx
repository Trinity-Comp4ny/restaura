'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SetupClinica() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Usuário não autenticado')
        return
      }

      // Criar clínica
      const { data: clinica, error: clinicaError } = await supabase
        .from('clinicas')
        .insert({
          nome: formData.nome,
          documento: formData.documento,
          telefone: formData.telefone,
          email: formData.email,
          endereco: formData.endereco,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep,
          slug: formData.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        } as any)
        .select()
        .single()

      if (clinicaError) throw clinicaError

      // Associar usuário à clínica como admin
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          auth_usuario_id: user.id,
          clinica_id: (clinica as any).id,
          email: user.email || '',
          nome: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
          papel: 'admin',
          ativo: true
        } as any)

      if (usuarioError) throw usuarioError

      toast.success('Clínica configurada com sucesso!')
      router.push('/painel')
      
    } catch (error) {
      console.error('Erro ao criar clínica:', error)
      toast.error('Erro ao configurar clínica')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
      {/* Background patterns - igual à landing e auth */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Glows - igual à landing e auth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-[440px] w-[440px] rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[440px] w-[440px] rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Logo no topo */}
        <Link href="/" className="absolute left-6 top-6 flex items-center gap-2 group sm:left-10 sm:top-10">
          <div className="relative h-9 w-9 overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
            <Image src="/logos/logo.svg" alt="Restaura" className="h-7 w-7" width={28} height={28} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Restaura</span>
        </Link>

        {/* Conteúdo centralizado */}
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl space-y-6">
            {/* Botão voltar */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>

            <Card className="rounded-2xl border border-white/10 bg-slate-800/40 backdrop-blur-xl shadow-2xl overflow-hidden">
              <CardHeader className="space-y-2 border-b border-white/10 bg-slate-900/40">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-semibold tracking-tight text-white">Configurar Clínica</CardTitle>
                  <CardDescription className="text-slate-300">
                    Preencha os dados da sua clínica para começar a usar o Restaura
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-slate-200">Nome da Clínica *</Label>
                      <Input
                        id="nome"
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => handleChange('nome', e.target.value)}
                        placeholder="Clínica Sorriso Feliz"
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="documento" className="text-slate-200">CNPJ</Label>
                      <Input
                        id="documento"
                        type="text"
                        value={formData.documento}
                        onChange={(e) => handleChange('documento', e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-slate-200">Telefone *</Label>
                      <Input
                        id="telefone"
                        type="tel"
                        required
                        value={formData.telefone}
                        onChange={(e) => handleChange('telefone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-200">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="contato@clinica.com"
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="endereco" className="text-slate-200">Endereço</Label>
                      <Input
                        id="endereco"
                        type="text"
                        value={formData.endereco}
                        onChange={(e) => handleChange('endereco', e.target.value)}
                        placeholder="Rua das Flores, 123"
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cidade" className="text-slate-200">Cidade</Label>
                      <Input
                        id="cidade"
                        type="text"
                        value={formData.cidade}
                        onChange={(e) => handleChange('cidade', e.target.value)}
                        placeholder="São Paulo"
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-slate-200">Estado</Label>
                      <Input
                        id="estado"
                        type="text"
                        value={formData.estado}
                        onChange={(e) => handleChange('estado', e.target.value)}
                        placeholder="SP"
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cep" className="text-slate-200">CEP</Label>
                      <Input
                        id="cep"
                        type="text"
                        value={formData.cep}
                        onChange={(e) => handleChange('cep', e.target.value)}
                        placeholder="00000-000"
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="bg-slate-800/50 border-white/10 text-white hover:bg-slate-700/50"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-full bg-blue-500 hover:bg-blue-600 border-none text-white shadow-lg shadow-blue-500/20 font-medium"
                    >
                      {loading ? 'Configurando...' : 'Configurar Clínica'}
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-6 border-t border-white/10">
                <p className="text-sm text-slate-400">
                  Precisa de ajuda?{' '}
                  <span className="font-medium text-blue-400">
                    Contate nossa equipe
                  </span>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
