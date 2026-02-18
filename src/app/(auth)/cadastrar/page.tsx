'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { edgeFunctions, callEdgeFunction } from '@/lib/edge-functions'

const registerSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    clinicName: z.string().min(3, 'Nome da clínica deve ter no mínimo 3 caracteres'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true)
    try {
      const res = await callEdgeFunction(edgeFunctions.authRegister, {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          clinicName: data.clinicName,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Erro ao criar conta')
        return
      }

      toast.success('Conta criada com sucesso! Faça login para continuar.')
      router.push('/login')
    } catch {
      toast.error('Erro ao criar conta. Tente novamente.')
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
            <CardTitle className="text-2xl font-semibold tracking-tight text-white">Criar conta</CardTitle>
            <CardDescription className="text-slate-300">
              Comece agora. Leva menos de 1 minuto.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">Seu nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                autoComplete="name"
                disabled={isLoading}
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-rose-400">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                disabled={isLoading}
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-rose-400">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicName" className="text-slate-200">Nome da clínica</Label>
              <Input
                id="clinicName"
                type="text"
                placeholder="Clínica Odontológica Sorriso"
                disabled={isLoading}
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                {...register('clinicName')}
              />
              {errors.clinicName && (
                <p className="text-sm text-rose-400">{errors.clinicName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 pr-10"
                  {...register('password')}
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
              {errors.password && (
                <p className="text-sm text-rose-400">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-rose-400">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-full bg-blue-500 hover:bg-blue-600 border-none text-white shadow-lg shadow-blue-500/20 font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : 'Criar conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6 border-t border-white/10">
          <p className="text-sm text-slate-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
