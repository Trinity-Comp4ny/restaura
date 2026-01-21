'use client'

import { useState } from 'react'
import { Plus, CreditCard, DollarSign, Calendar, Download, Filter, Search, Eye, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, formatCurrency } from '@/lib/utils'

interface FinancialTabProps {
  pacienteId: string
}

export function FinancialTab({ pacienteId }: FinancialTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [showNewPaymentDialog, setShowNewPaymentDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

  // Mock de dados financeiros
  const [payments, setPayments] = useState([
    {
      id: '1',
      date: '2024-01-15',
      description: 'Consulta de Avaliação',
      amount: 150.00,
      status: 'pago',
      payment_method: 'Cartão de crédito',
      installment_number: null,
      due_date: '2024-01-15',
      payment_date: '2024-01-15',
      treatment_id: '1',
      treatment_nome: 'Reabilitação Oral Superior',
      receipt_url: null,
      observacoes: 'Pagamento realizado no ato da consulta'
    },
    {
      id: '2',
      date: '2024-02-20',
      description: 'Tratamento Periodontal - 1ª parcela',
      amount: 400.00,
      status: 'pago',
      payment_method: 'Convênio',
      installment_number: 1,
      due_date: '2024-02-20',
      payment_date: '2024-02-20',
      treatment_id: '1',
      treatment_nome: 'Reabilitação Oral Superior',
      receipt_url: '/receipts/20240220_001.pdf',
      observacoes: 'Autorização convênio: AUT-2024-0456'
    },
    {
      id: '3',
      date: '2024-03-15',
      description: 'Tratamento Periodontal - 2ª parcela',
      amount: 400.00,
      status: 'pendente',
      payment_method: 'Convênio',
      installment_number: 2,
      due_date: '2024-03-15',
      payment_date: null,
      treatment_id: '1',
      treatment_nome: 'Reabilitação Oral Superior',
      receipt_url: null,
      observacoes: 'Aguardando autorização do convênio'
    },
    {
      id: '4',
      date: '2024-04-10',
      description: 'Clareamento Dental',
      amount: 450.00,
      status: 'vencido',
      payment_method: 'Cartão de débito',
      installment_number: null,
      due_date: '2024-04-10',
      payment_date: null,
      treatment_id: '1',
      treatment_nome: 'Reabilitação Oral Superior',
      receipt_url: null,
      observacoes: 'Vencido há 5 dias'
    }
  ])

  // Mock de convênio e informações financeiras do paciente
  const patientFinancialInfo = {
    convenio: 'Unimed',
    insurance_number: '123456789',
    coverage_percentage: 80,
    monthly_limit: 500.00,
    used_limit: 320.00,
    available_limit: 180.00,
    payment_methods: ['Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Convênio']
  }

  // Filtrar pagamentos
  const filteredPayments = payments.filter(payment => {
    const matchSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       payment.treatment_nome.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchStatus = statusFilter === 'todos' || payment.status === statusFilter
    
    return matchSearch && matchStatus
  })

  // Calcular estatísticas
  const totalPaid = payments.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'pendente').reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = payments.filter(p => p.status === 'vencido').reduce((sum, p) => sum + p.amount, 0)

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pago':
        return { label: 'Pago', color: 'bg-green-500', icon: CheckCircle }
      case 'pendente':
        return { label: 'Pendente', color: 'bg-yellow-500', icon: Calendar }
      case 'vencido':
        return { label: 'Vencido', color: 'bg-red-500', icon: AlertCircle }
      default:
        return { label: 'Desconhecido', color: 'bg-gray-500', icon: Calendar }
    }
  }

  const handleAddPayment = (data: any) => {
    // Aqui viria a lógica para adicionar pagamento
    console.log('Adicionar pagamento:', data)
    setShowNewPaymentDialog(false)
  }

  const handleMarkAsPaid = (paymentId: string) => {
    // Aqui viria a lógica para marcar como pago
    console.log('Marcar como pago:', paymentId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Contpapel de pagamentos e convênio do paciente</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Extrato
          </Button>
          <Button onClick={() => setShowNewPaymentDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      {/* Informações do Convênio */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <CreditCard className="h-5 w-5" />
            Informações do Convênio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-sm text-muted-foreground">Convênio</Label>
              <div className="font-medium">{patientFinancialInfo.convenio}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Número da Carteira</Label>
              <div className="font-medium">{patientFinancialInfo.insurance_number}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Cobertura</Label>
              <div className="font-medium">{patientFinancialInfo.coverage_percentage}%</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Limite Mensal</Label>
              <div className="font-medium">
                {formatCurrency(patientFinancialInfo.available_limit)} / {formatCurrency(patientFinancialInfo.monthly_limit)}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Limite Utilizado</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(patientFinancialInfo.used_limit)} de {formatCurrency(patientFinancialInfo.monthly_limit)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(patientFinancialInfo.used_limit / patientFinancialInfo.monthly_limit) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Financeiras */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
                <div className="text-sm text-muted-foreground">Total Pago</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
                <div className="text-sm text-muted-foreground">A Pagar</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(totalOverdue)}</div>
                <div className="text-sm text-muted-foreground">Vencidos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalPaid + totalPending + totalOverdue)}
                </div>
                <div className="text-sm text-muted-foreground">Total Geral</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar pagamentos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pago">Pagos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pagamentos */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => {
          const statusInfo = getStatusInfo(payment.status)
          const StatusIcon = statusInfo.icon

          return (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">{formatDate(payment.date)}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.installment_number ? `Parcela ${payment.installment_number}` : 'À vista'}
                        </div>
                      </div>
                      <div className="h-12 w-px bg-border"></div>
                      <div className="flex-1">
                        <div className="font-medium text-lg">{payment.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.treatment_nome}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.payment_method}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatCurrency(payment.amount)}</div>
                        <Badge className={statusInfo.color + ' text-white'}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Detalhes do pagamento */}
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Vencimento: </span>
                        <span>{formatDate(payment.due_date)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pagamento: </span>
                        <span>
                          {payment.payment_date ? formatDate(payment.payment_date) : 'Não realizado'}
                        </span>
                      </div>
                    </div>

                    {/* Observações */}
                    {payment.observacoes && (
                      <div className="mt-3 p-3 bg-muted/30 rounded border">
                        <p className="text-sm text-muted-foreground">{payment.observacoes}</p>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Detalhes do Pagamento</DialogTitle>
                          <DialogDescription>
                            Informações completas do pagamento
                          </DialogDescription>
                        </DialogHeader>
                        {selectedPayment && (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label>Descrição</Label>
                                <p className="font-medium">{selectedPayment.description}</p>
                              </div>
                              <div>
                                <Label>Valor</Label>
                                <p className="font-medium">{formatCurrency(selectedPayment.amount)}</p>
                              </div>
                              <div>
                                <Label>Forma de Pagamento</Label>
                                <p className="font-medium">{selectedPayment.payment_method}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <Badge className={statusInfo.color + ' text-white'}>
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              <div>
                                <Label>Data de Vencimento</Label>
                                <p className="font-medium">{formatDate(selectedPayment.due_date)}</p>
                              </div>
                              <div>
                                <Label>Data de Pagamento</Label>
                                <p className="font-medium">
                                  {selectedPayment.payment_date ? formatDate(selectedPayment.payment_date) : 'Não realizado'}
                                </p>
                              </div>
                            </div>
                            {selectedPayment.observacoes && (
                              <div>
                                <Label>Observações</Label>
                                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                                  {selectedPayment.observacoes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {payment.status !== 'pago' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarkAsPaid(payment.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredPayments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum pagamento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'todos' 
                  ? 'Tente ajustar os filtros para ver mais resultados' 
                  : 'Este paciente ainda não possui pagamentos registrados'}
              </p>
              <Button onClick={() => setShowNewPaymentDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Primeiro Pagamento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Novo Pagamento */}
      <Dialog open={showNewPaymentDialog} onOpenChange={setShowNewPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Novo Pagamento</DialogTitle>
            <DialogDescription>
              Adicione um novo pagamento ou parcela para o paciente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Descrição</Label>
                <Input placeholder="Ex: Consulta de avaliação" />
              </div>
              <div>
                <Label>Valor</Label>
                <Input type="number" placeholder="0,00" step="0.01" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Forma de Pagamento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Cartão de crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de débito</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="insurance">Convênio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data de Vencimento</Label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <Label>Tratamento Relacionado</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tratamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Reabilitação Oral Superior</SelectItem>
                  <SelectItem value="2">Manutenção Ortodôntica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea 
                placeholder="Observações sobre o pagamento..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPaymentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => handleAddPayment({})}>
              Registrar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
