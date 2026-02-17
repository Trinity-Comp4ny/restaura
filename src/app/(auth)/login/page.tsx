'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          toast.error('E-mail ou senha incorretos')
        } else {
          toast.error(error.message)
        }
        return
      }

      toast.success('Login realizado com sucesso!')
      router.push('/home')
      router.refresh()
    } catch {
      toast.error('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
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
            <CardTitle className="text-2xl font-semibold tracking-tight text-white">
              Acessar painel
            </CardTitle>
            <CardDescription className="text-slate-300">
              Entre com seu e-mail e senha para continuar.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-200">Senha</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-full bg-blue-500 hover:bg-blue-600 border-none text-white shadow-lg shadow-blue-500/20 font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6 border-t border-white/10">
          <p className="text-sm text-slate-400">
            Acesso disponível apenas por convite.{' '}
            <span className="font-medium text-blue-400">
              Contate nossa equipe
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
