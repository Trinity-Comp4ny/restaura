import { PacienteTabsNav } from '@/components/pacientes/paciente-tabs-nav'

export default async function PacienteGeralPage({ params }: { params: Promise<{ pacienteId: string }> }) {
  const resolvedParams = await params
  return <PacienteTabsNav pacienteId={resolvedParams.pacienteId} ativoTabId="geral" />
}
