'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, CheckCircle } from 'lucide-react'

interface ConvertToPatientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  leadName?: string
  leadEmail?: string
  leadPhone?: string
  leadValue?: number
}

export default function ConvertToPatientModal({
  open,
  onOpenChange,
  onConfirm,
  leadName,
  leadEmail,
  leadPhone,
  leadValue
}: ConvertToPatientModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Transformar Lead em Paciente
          </DialogTitle>
          <DialogDescription>
            Parabéns! O lead foi convertido com sucesso. Deseja transformá-lo em paciente permanente?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações do Lead */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">Dados do Lead</span>
            </div>
            
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nome:</span>
                <span className="font-medium">{leadName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">E-mail:</span>
                <span className="font-medium">{leadEmail || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telefone:</span>
                <span className="font-medium">{leadPhone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-medium text-green-600">
                  {leadValue ? `R$ ${leadValue.toLocaleString('pt-BR')}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Benefícios da Transformação */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Benefícios:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Histórico completo de tratamentos</li>
              <li>• Agendamentos recorrentes</li>
              <li>• Prontuário digital completo</li>
              <li>• Acompanhamento odontológico</li>
            </ul>
          </div>

          {/* Status da Transformação */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Pronto para transformar
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Agora Não
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={onConfirm}>
            <User className="mr-2 h-4 w-4" />
            Transformar em Paciente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
