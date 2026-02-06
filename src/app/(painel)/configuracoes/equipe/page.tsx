'use client'

import { useState } from 'react'
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
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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

export default function EquipePage() {
  const [search, setSearch] = useState('')
  const { data: membros, isLoading } = useEquipe({ search })

  function handleConvidar() {
    toast.info('Funcionalidade de convite em desenvolvimento')
  }

  function handleEditar(id: string) {
    toast.info(`Editar usuário ${id} - em desenvolvimento`)
  }

  function handleAlterarPermissao(id: string) {
    toast.info(`Alterar permissão ${id} - em desenvolvimento`)
  }

  function handleDesativar(id: string) {
    toast.info(`Desativar usuário ${id} - em desenvolvimento`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e permissões da sua clínica.
          </p>
        </div>
        <Button onClick={handleConvidar}>
          <Plus className="mr-2 h-4 w-4" />
          Convidar membro
        </Button>
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
                        <DropdownMenuItem onClick={() => handleEditar(membro.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAlterarPermissao(membro.id)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Alterar permissão
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDesativar(membro.id)}
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
    </div>
  )
}
