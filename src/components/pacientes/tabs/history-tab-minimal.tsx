'use client'

export default function HistoryTab({ pacienteId }: { pacienteId: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Histórico de Consultas</h1>
          <p className="text-muted-foreground">Registro completo de todos os atendimentos</p>
        </div>
      </div>
      
      <div className="text-center py-8">
        <p>Histórico de consultas do paciente {pacienteId}</p>
        <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
      </div>
    </div>
  )
}
