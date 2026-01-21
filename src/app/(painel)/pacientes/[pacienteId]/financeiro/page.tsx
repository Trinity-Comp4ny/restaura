import { PacienteTabsNav } from '@/components/pacientes/paciente-tabs-nav'

export default async function PacienteFinanceiroPage({ params }: { params: Promise<{ pacienteId: string }> }) {
  const resolvedParams = await params
  return <PacienteTabsNav pacienteId={resolvedParams.pacienteId} ativoTabId="financeiro" />
}
