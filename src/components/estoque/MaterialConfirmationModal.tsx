'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Package, CheckCircle, XCircle, Info, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

// Tipos
type Produto = {
  id: string
  nome: string
  unit: string
  quantity: number
  min_quantity: number
  price: number
}

type Lote = {
  id: string
  batch_number: string
  quantity: number
  expiry_date: string | null
}

type MaterialParaConsumo = {
  product_id: string
  produto: Produto
  lotes_disponiveis: Lote[]
  is_required: boolean
  is_variable: boolean
  quantity_default: number
  quantity_min: number
  quantity_max: number
  estoque_suficiente: boolean
  alertas: string[]
}

type MaterialSelecionado = {
  product_id: string
  batch_id: string | null
  quantity: number
  incluir: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  procedimentoNome: string
  pacienteNome: string
  materiais: MaterialParaConsumo[]
  isLoading?: boolean
  onConfirm: (materiaisSelecionados: MaterialSelecionado[]) => void
  onSkip?: () => void
}

export function MaterialConfirmationModal({
  open,
  onOpenChange,
  procedimentoNome,
  pacienteNome,
  materiais,
  isLoading = false,
  onConfirm,
  onSkip,
}: Props) {
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<MaterialSelecionado[]>([])

  // Inicializar materiais selecionados quando modal abre
  useEffect(() => {
    if (open && materiais.length > 0) {
      const inicial = materiais.map(mat => ({
        product_id: mat.product_id,
        batch_id: mat.lotes_disponiveis[0]?.id || null, // FIFO - primeiro lote
        quantity: mat.quantity_default,
        incluir: mat.is_required || mat.estoque_suficiente,
      }))
      setMateriaisSelecionados(inicial)
    }
  }, [open, materiais])

  // Verificar se pode confirmar
  const podeConfirmar = materiais.every(mat => {
    if (!mat.is_required) return true
    const selecionado = materiaisSelecionados.find(s => s.product_id === mat.product_id)
    return selecionado?.incluir && mat.estoque_suficiente
  })

  // Contar alertas
  const totalAlertas = materiais.reduce((total, mat) => total + mat.alertas.length, 0)
  const materiaisComProblema = materiais.filter(mat => !mat.estoque_suficiente && mat.is_required)

  // Handlers
  const handleQuantityChange = (productId: string, quantity: number) => {
    setMateriaisSelecionados(prev =>
      prev.map(mat =>
        mat.product_id === productId ? { ...mat, quantity } : mat
      )
    )
  }

  const handleBatchChange = (productId: string, batchId: string) => {
    setMateriaisSelecionados(prev =>
      prev.map(mat =>
        mat.product_id === productId ? { ...mat, batch_id: batchId } : mat
      )
    )
  }

  const handleIncluirChange = (productId: string, incluir: boolean) => {
    setMateriaisSelecionados(prev =>
      prev.map(mat =>
        mat.product_id === productId ? { ...mat, incluir } : mat
      )
    )
  }

  const handleConfirm = () => {
    const materiaisParaConsumo = materiaisSelecionados.filter(mat => mat.incluir)
    onConfirm(materiaisParaConsumo)
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Sem validade'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getDiasParaVencer = (date: string | null) => {
    if (!date) return null
    const hoje = new Date()
    const validade = new Date(date)
    return Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Confirmar Materiais do Procedimento
          </DialogTitle>
          <DialogDescription>
            <strong>{procedimentoNome}</strong> para <strong>{pacienteNome}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Alertas Gerais */}
        {materiaisComProblema.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atenção - Estoque Insuficiente</AlertTitle>
            <AlertDescription>
              {materiaisComProblema.map(mat => mat.produto.nome).join(', ')} 
              {materiaisComProblema.length === 1 ? ' não possui' : ' não possuem'} estoque suficiente.
            </AlertDescription>
          </Alert>
        )}

        {totalAlertas > 0 && materiaisComProblema.length === 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Avisos</AlertTitle>
            <AlertDescription>
              {totalAlertas} {totalAlertas === 1 ? 'aviso' : 'avisos'} sobre os materiais abaixo.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de Materiais */}
        <div className="space-y-4 py-4">
          {materiais.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum material configurado para este procedimento.</p>
              <p className="text-sm">Você pode prosseguir sem registrar consumo de materiais.</p>
            </div>
          ) : (
            materiais.map((mat, index) => {
              const selecionado = materiaisSelecionados.find(s => s.product_id === mat.product_id)
              const isIncluido = selecionado?.incluir ?? false
              
              return (
                <div
                  key={mat.product_id}
                  className={`border rounded-lg p-4 transition-all ${
                    !mat.estoque_suficiente && mat.is_required
                      ? 'border-red-300 bg-red-50'
                      : isIncluido
                      ? 'border-green-300 bg-green-50/50'
                      : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Checkbox + Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        id={`mat-${index}`}
                        checked={isIncluido}
                        onCheckedChange={(checked: boolean) => 
                          handleIncluirChange(mat.product_id, checked)
                        }
                        disabled={mat.is_required && !mat.estoque_suficiente}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label 
                            htmlFor={`mat-${index}`}
                            className="font-medium cursor-pointer"
                          >
                            {mat.produto.nome}
                          </Label>
                          {mat.is_required && (
                            <Badge variant="secondary" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                          {mat.is_variable && (
                            <Badge variant="outline" className="text-xs">
                              Variável
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Estoque: {mat.produto.quantity} {mat.produto.unit}
                          {mat.produto.quantity <= mat.produto.min_quantity && (
                            <span className="text-orange-600 ml-2">(Estoque baixo)</span>
                          )}
                        </p>
                        
                        {/* Alertas do material */}
                        {mat.alertas.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {mat.alertas.map((alerta, i) => (
                              <p key={i} className="text-xs text-orange-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {alerta}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contpapels */}
                    {isIncluido && mat.estoque_suficiente && (
                      <div className="flex items-center gap-3">
                        {/* Quantidade */}
                        <div className="w-24">
                          <Label className="text-xs text-muted-foreground">Qtd</Label>
                          <Input
                            type="number"
                            value={selecionado?.quantity || mat.quantity_default}
                            onChange={(e) => handleQuantityChange(mat.product_id, parseFloat(e.target.value) || 0)}
                            min={mat.quantity_min}
                            max={Math.min(mat.quantity_max, mat.produto.quantity)}
                            step={0.5}
                            className="h-8"
                          />
                        </div>

                        {/* Seleção de Lote */}
                        {mat.lotes_disponiveis.length > 0 && (
                          <div className="w-48">
                            <Label className="text-xs text-muted-foreground">Lote</Label>
                            <Select
                              value={selecionado?.batch_id || ''}
                              onValueChange={(value) => handleBatchChange(mat.product_id, value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Selecionar lote" />
                              </SelectTrigger>
                              <SelectContent>
                                {mat.lotes_disponiveis.map((lote) => {
                                  const dias = getDiasParaVencer(lote.expiry_date)
                                  const isVencido = dias !== null && dias < 0
                                  const isVencendo = dias !== null && dias <= 30 && dias >= 0
                                  
                                  return (
                                    <SelectItem 
                                      key={lote.id} 
                                      value={lote.id}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>{lote.batch_number}</span>
                                        <span className="text-xs text-muted-foreground">
                                          ({lote.quantity} un)
                                        </span>
                                        {isVencido && (
                                          <Badge variant="destructive" className="text-xs">
                                            Vencido
                                          </Badge>
                                        )}
                                        {isVencendo && (
                                          <Badge variant="secondary" className="text-xs text-orange-600">
                                            {dias}d
                                          </Badge>
                                        )}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status Icons */}
                    <div className="flex items-center">
                      {mat.estoque_suficiente ? (
                        isIncluido ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Resumo */}
        {materiaisSelecionados.filter(m => m.incluir).length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              <strong>{materiaisSelecionados.filter(m => m.incluir).length}</strong> 
              {' '}material(is) será(ão) registrado(s) como consumido(s).
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {onSkip && (
            <Button variant="ghost" onClick={onSkip}>
              Pular (Sem materiais)
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!podeConfirmar || isLoading}
          >
            {isLoading ? 'Registrando...' : 'Confirmar e Iniciar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
