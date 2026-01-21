'use client'

import { Plus, Search, Filter, MoreHorizontal, Building, MapPin, Phone, Mail, Users, Settings } from 'lucide-react'

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

export default function MultiClinicasPage() {
  const clinicas = [
    {
      id: '1',
      nome: 'Clínica Central',
      slug: 'clinica-central',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      telefone: '(11) 99999-9999',
      email: 'central@restaura.com',
      users: 8,
      status: 'ativo',
      criado_em: '2023-01-15',
    },
    {
      id: '2',
      nome: 'Clínica Jardins',
      slug: 'clinica-jardins',
      address: 'Av. Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      telefone: '(11) 88888-8888',
      email: 'jardins@restaura.com',
      users: 5,
      status: 'ativo',
      criado_em: '2023-06-20',
    },
    {
      id: '3',
      nome: 'Clínica Campinas',
      slug: 'clinica-campinas',
      address: 'Rua das Palmeiras, 789',
      city: 'Campinas',
      state: 'SP',
      telefone: '(19) 77777-7777',
      email: 'campinas@restaura.com',
      users: 3,
      status: 'inativo',
      criado_em: '2023-09-10',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Múltiplas Clínicas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as clínicas da sua rede.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Clínica
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clínicas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">Todas as clínicas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clínicas Ativas</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2</div>
            <p className="text-xs text-muted-foreground">Operando</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas este Mês</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Em planejamento</p>
          </CardContent>
        </Card>
      </div>

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
              {clinicas.map((clinica) => (
                <div
                  key={clinica.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <div className="font-medium">{clinica.nome}</div>
                    <div className="text-sm text-muted-foreground">{clinica.slug}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {clinica.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {clinica.telefone}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm">{clinica.city}</div>
                    <div className="text-xs text-muted-foreground">{clinica.state}</div>
                  </div>
                  <div className="text-sm">{clinica.users} usuários</div>
                  <div>
                    <Badge
                      variant={clinica.status === 'ativo' ? 'success' : 'secondary'}
                    >
                      {clinica.status === 'ativo' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <div className="text-sm">{clinica.criado_em}</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Building className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        Gerenciar Usuários
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MapPin className="mr-2 h-4 w-4" />
                        Editar Endereço
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Excluir Clínica
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Globais</CardTitle>
            <CardDescription>
              Aplicar a todas as clínicas da rede.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sincronização Automática</h4>
                <p className="text-sm text-muted-foreground">
                  Sincronizar dados entre clínicas
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Relatórios Consolidados</h4>
                <p className="text-sm text-muted-foreground">
                  Gerar relatórios de todas as clínicas
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Backup Centralizado</h4>
                <p className="text-sm text-muted-foreground">
                  Backup unificado para todas as unidades
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance da Rede</CardTitle>
            <CardDescription>
              Métricas de todas as clínicas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pacientes Totais</span>
                <span className="font-medium">1,284</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Consultas Mês</span>
                <span className="font-medium">342</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Faturamento Total</span>
                <span className="font-medium">R$ 45.680</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxa Ocupação</span>
                <span className="font-medium">87%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
