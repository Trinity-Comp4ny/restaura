'use client'

import { useState, useEffect } from 'react'

export default function TestClinicasPublicPage() {
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
      console.log('✅ Clínicas recebidas:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('❌ Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Buscar automaticamente ao carregar a página
    fetchClinicas()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Teste Público - Clínicas</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Status da API</h2>
            <button
              onClick={fetchClinicas}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Atualizar'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Erro:</strong> {error}
            </div>
          )}

          {clinicas.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-600">
                ✅ Clínicas encontradas ({clinicas.length}):
              </h3>
              {clinicas.map((clinica, index) => (
                <div key={clinica.id || index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg">{clinica.nome || 'Nome não informado'}</h4>
                      <p><strong>ID:</strong> <code className="text-xs bg-gray-200 px-1 rounded">{clinica.id}</code></p>
                      <p><strong>Slug:</strong> {clinica.slug || 'N/A'}</p>
                      <p><strong>Email:</strong> {clinica.email || 'N/A'}</p>
                      <p><strong>Telefone:</strong> {clinica.telefone || 'N/A'}</p>
                    </div>
                    <div>
                      <p><strong>Cidade:</strong> {clinica.cidade || 'N/A'}</p>
                      <p><strong>Estado:</strong> {clinica.estado || 'N/A'}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          clinica.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {clinica.status || 'ativo'}
                        </span>
                      </p>
                      <p><strong>Total Usuários:</strong> {clinica.total_usuarios || 0}</p>
                      <p><strong>Administradores:</strong> {clinica.administradores || 0}</p>
                      <p><strong>Criado em:</strong> {clinica.criado_em ? new Date(clinica.criado_em).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {clinicas.length === 0 && !loading && !error && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">🏥</div>
              <h3 className="text-lg font-medium mb-2">Nenhuma clínica encontrada</h3>
              <p>Clique em "Atualizar" para tentar novamente.</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Buscando clínicas...</p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Informações de Debug</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>URL da API:</strong> <code>/api/test-clinicas</code></p>
            <p><strong>Método:</strong> Service Role (bypass RLS)</p>
            <p><strong>Status:</strong> {loading ? 'Carregando...' : error ? 'Erro' : clinicas.length > 0 ? 'Sucesso' : 'Sem dados'}</p>
            <p><strong>Timestamp:</strong> {new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
