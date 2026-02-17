'use client'

import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building,
  MapPin,
  Phone,
  Mail,
  Users,
  Settings,
  ArrowLeft,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useEstatisticasRede,
  useConfiguracoesRede,
  useClinicasDetalhes,
  useUpdateClinica,
} from '@/hooks/use-multi-clinic'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from 'sonner'

export default function MultiClinicasPage() {
  const { data: estatisticas, isLoading: loadingEstatisticas } = useEstatisticasRede()
  const { data: clinicas, isLoading: loadingClinicas } = useClinicasDetalhes()
  const { data: configuracoes, isLoading: loadingConfiguracoes } = useConfiguracoesRede()
  const { mutateAsync: updateClinica, isPending: isDeleting } = useUpdateClinica()
  const router = useRouter()

  const isLoading = loadingEstatisticas || loadingClinicas || loadingConfiguracoes

  const goToClinica = (id?: string) => {
    if (!id) return
    router.push(`/configuracoes/clinica?clinicaId=${id}`)
  }

  const goToEquipe = (id?: string) => {
    if (!id) return
    router.push(`/configuracoes/equipe?clinicaId=${id}`)
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    const confirm = window.confirm('Deseja inativar esta clínica?')
    if (!confirm) return

    try {
      await updateClinica({ id, status: 'inativo' } as any)
      toast.success('Clínica inativada com sucesso')
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao inativar clínica')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/configuracoes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">Configurações</p>
            <h1 className="text-3xl font-semibold tracking-tight">Múltiplas Clínicas</h1>
            <p className="text-muted-foreground">Gerencie todas as clínicas da sua rede.</p>
          </div>
        </div>
        <Button onClick={() => router.push('/configuracoes/clinica')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Clínica
        </Button>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clínicas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{estatisticas?.total_clinicas || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-20 mt-1" />
              ) : (
                `${estatisticas?.clinicas_ativas || 0} ativas`
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{estatisticas?.total_usuarios || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Todas as clínicas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clínicas Ativas</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{estatisticas?.clinicas_ativas || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Operando</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas este Mês</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{estatisticas?.novas_este_mes || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Em planejamento</p>
          </CardContent>
        </Card>
      </div> */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Clínicas</CardTitle>
              <CardDescription>
                Gerencie todas as unidades da sua rede.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" placeholder="Buscar clínica..." className="pl-9" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div>Clínica</div>
              <div>Localização</div>
              <div>Usuários</div>
              <div>Status</div>
              <div>Criação</div>
              <div className="w-10"></div>
            </div>
            <div className="divide-y">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 px-4 py-3"
                  >
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24 mb-1" />
                      <Skeleton className="h-3 w-40 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))
              ) : clinicas && clinicas.length > 0 ? (
                clinicas.map((clinica: any) => (
                  <div
                    key={clinica.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{clinica.nome || 'Nome não informado'}</div>
                      <div className="text-sm text-muted-foreground">{clinica.slug || 'sem-slug'}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {clinica.email || 'E-mail não informado'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {clinica.telefone || 'Telefone não informado'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm">{clinica.cidade || 'Cidade não informada'}</div>
                      <div className="text-xs text-muted-foreground">{clinica.estado || 'UF'}</div>
                    </div>
                    <div className="text-sm">{clinica.total_usuarios || 0} usuários</div>
                    <div>
                      <Badge
                        variant={clinica.status === 'ativo' ? 'success' : 'secondary'}
                      >
                        {clinica.status === 'ativo' ? 'Ativa' : clinica.status === 'inativo' ? 'Inativa' : 'Planejamento'}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      {clinica.criado_em ? new Date(clinica.criado_em).toLocaleDateString('pt-BR') : 'Data desconhecida'}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => goToClinica(clinica.id)}>
                          <Building className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => goToEquipe(clinica.id)}>
                          <Users className="mr-2 h-4 w-4" />
                          Gerenciar Usuários
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => goToClinica(clinica.id)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Configurar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => goToClinica(clinica.id)}>
                          <MapPin className="mr-2 h-4 w-4" />
                          Editar Endereço
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(clinica.id)}
                          disabled={isDeleting}
                        >
                          Excluir Clínica
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              ) : (
                <EmptyState
                  type="multi-clinicas"
                  description="Você ainda não possui clínicas cadastradas na sua rede. Adicione sua primeira clínica para começar."
                  buttonText="Adicionar Primeira Clínica"
                  onAction={() => router.push('/configuracoes/clinica')}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* <Card>
          <CardHeader>
            <CardTitle>Configurações Globais</CardTitle>
            <CardDescription>
              Aplicar a todas as clínicas da rede.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              // Loading skeletons for global settings
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Sincronização Automática</h4>
                    <p className="text-sm text-muted-foreground">
                      Sincronizar dados entre clínicas
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    defaultChecked={configuracoes?.sincronizacao_automatica} 
                    className="rounded" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Relatórios Consolidados</h4>
                    <p className="text-sm text-muted-foreground">
                      Gerar relatórios de todas as clínicas
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    defaultChecked={configuracoes?.relatorios_consolidados} 
                    className="rounded" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Backup Centralizado</h4>
                    <p className="text-sm text-muted-foreground">
                      Backup unificado para todas as unidades
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    defaultChecked={configuracoes?.backup_centralizado} 
                    className="rounded" 
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader>
            <CardTitle>Performance da Rede</CardTitle>
            <CardDescription>
              Métricas de todas as clínicas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              // Loading skeletons for network performance
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pacientes Totais</span>
                  <span className="font-medium">
                    {estatisticas?.total_pacientes?.toLocaleString('pt-BR') || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Consultas Mês</span>
                  <span className="font-medium">
                    {estatisticas?.consultas_mes?.toLocaleString('pt-BR') || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Faturamento Total</span>
                  <span className="font-medium">
                    {estatisticas?.faturamento_mes
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(estatisticas.faturamento_mes))
                      : 'R$ 0,00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa Ocupação</span>
                  <span className="font-medium">
                    {estatisticas?.taxa_ocupacao ? `${estatisticas.taxa_ocupacao}%` : '0%'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
