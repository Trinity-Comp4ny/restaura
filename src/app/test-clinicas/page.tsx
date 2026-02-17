'use client'

import { useState } from 'react'

// Componente de teste para verificar se as clínicas estão sendo carregadas
export default function TestClinicasPage() {
  const [clinicas, setClinicas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClinicas = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/test-clinicas')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar clínicas')
      }
      
      setClinicas(data.clinicas || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste - Clínicas</h1>
      
      <button
        onClick={fetchClinicas}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Buscando...' : 'Buscar Clínicas'}
      </button>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {clinicas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Clínicas encontradas ({clinicas.length}):</h2>
          {clinicas.map((clinica, index) => (
            <div key={clinica.id || index} className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium">{clinica.nome || 'Nome não informado'}</h3>
              <p><strong>ID:</strong> {clinica.id}</p>
              <p><strong>Slug:</strong> {clinica.slug || 'N/A'}</p>
              <p><strong>Email:</strong> {clinica.email || 'N/A'}</p>
              <p><strong>Telefone:</strong> {clinica.telefone || 'N/A'}</p>
              <p><strong>Cidade:</strong> {clinica.cidade || 'N/A'}</p>
              <p><strong>Estado:</strong> {clinica.estado || 'N/A'}</p>
              <p><strong>Status:</strong> {clinica.status || 'ativo'}</p>
              <p><strong>Criado em:</strong> {clinica.criado_em ? new Date(clinica.criado_em).toLocaleDateString('pt-BR') : 'N/A'}</p>
            </div>
          ))}
        </div>
      )}

      {clinicas.length === 0 && !loading && !error && (
        <div className="text-gray-500">
          Nenhuma clínica encontrada. Clique em "Buscar Clínicas" para tentar novamente.
        </div>
      )}
    </div>
  )
}
