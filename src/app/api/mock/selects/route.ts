import { NextRequest, NextResponse } from 'next/server'

// Mock de pacientes para selects (leve)
const mockPacientesSelect = [
  { id: '1', nome: 'João Pedro Silva' },
  { id: '2', nome: 'Ana Maria Santos' },
  { id: '3', nome: 'Carlos Oliveira' },
  { id: '4', nome: 'Mariana Costa' },
  { id: '5', nome: 'Pedro Henrique' },
]

// Mock de dentistas para selects
const mockDentistas = [
  { id: '1', nome: 'Dr. João Silva' },
  { id: '2', nome: 'Dra. Maria Santos' },
  { id: '3', nome: 'Dr. Carlos Oliveira' },
]

// Mock de procedimentos para selects
const mockProcedimentosSelect = [
  { id: '1', nome: 'Restauração Dentária' },
  { id: '2', nome: 'Limpeza' },
  { id: '3', nome: 'Clareamento' },
  { id: '4', nome: 'Extração' },
  { id: '5', nome: 'Profilaxia' },
]

// Mock de setores
const setores = [
  'Consultório 1',
  'Consultório 2',
  'Laboratório',
  'Estoque',
  'Outros',
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  switch (type) {
    case 'pacientes':
      return NextResponse.json(mockPacientesSelect)
    case 'dentistas':
      return NextResponse.json(mockDentistas)
    case 'procedimentos':
      return NextResponse.json(mockProcedimentosSelect)
    case 'setores':
      return NextResponse.json(setores)
    default:
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }
}
