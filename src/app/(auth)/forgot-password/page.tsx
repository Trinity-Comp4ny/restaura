'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      if (!supabase) {
        toast.error('Supabase não configurado.')
        return
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL
      const redirectTo = appUrl ? `${appUrl}/reset-password` : undefined

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Enviamos um link de recuperação para o seu e-mail.')
    } catch {
      toast.error('Não foi possível enviar o link. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="glass-premium border-white/30 shadow-premium-xl">
      <CardHeader className="space-y-2">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">Recuperar acesso</CardTitle>
          <CardDescription>
            Informe seu e-mail. Você vai receber um link para definir uma nova senha.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={isLoading}
              error={!!errors.email}
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full btn-premium" isLoading={isLoading}>
            Enviar link
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div className="h-px w-full bg-border/60" />
        <p className="text-sm text-muted-foreground">
          Lembrou da senha?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Voltar para login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
