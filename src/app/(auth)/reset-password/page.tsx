'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

const schema = z
  .object({
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!supabase) return

    let cancelled = false

    supabase.auth.getSession().then(({ data, error }) => {
      if (cancelled) return
      if (error) return

      if (!data.session) {
        toast.error('Link inválido ou expirado. Solicite um novo link de recuperação.')
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      if (!supabase) {
        toast.error('Supabase não configurado.')
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Senha atualizada com sucesso!')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Erro ao atualizar senha. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
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
          <CardTitle className="text-2xl font-semibold tracking-tight text-white">Definir nova senha</CardTitle>
          <CardDescription className="text-slate-300">
            Crie uma senha nova para entrar no seu painel.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">Nova senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                error={!!errors.password}
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
            {errors.password && <p className="text-sm text-rose-400">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              error={!!errors.confirmPassword}
              className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-rose-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-12 rounded-full bg-blue-500 hover:bg-blue-600 border-none text-white shadow-lg shadow-blue-500/20 font-medium" isLoading={isLoading}>
            Salvar nova senha
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-6 border-t border-white/10">
        <p className="text-sm text-slate-400">
          <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
            Voltar para login
          </Link>
        </p>
      </CardFooter>
    </Card>
    </div>
  )
}
