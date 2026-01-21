import { PacienteTabsNav } from '@/components/pacientes/paciente-tabs-nav'

export default async function PacienteTratamentosPage({ params }: { params: Promise<{ pacienteId: string }> }) {
  const resolvedParams = await params
  return <PacienteTabsNav pacienteId={resolvedParams.pacienteId} ativoTabId="tratamentos" />
}
