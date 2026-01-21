import { NextRequest, NextResponse } from 'next/server'

// Mock de estoque (produtos)
const mockProdutos = [
  {
    id: '1',
    nome: 'Resina Composta 3M',
    category: 'Material Restaurador',
    quantity: 15,
    minQuantity: 5,
    unit: 'Tubo',
    price: 89.9,
    supplier: 'Dental Supply',
    status: 'ativo',
    batchNumber: 'LOT2024001',
    manufactureDate: '2024-01-01',
    expiryDate: '2025-12-31',
    lastPurchaseDate: '2024-01-15',
  },
  {
    id: '2',
    nome: 'Anestésico Lidocaína 2%',
    category: 'Anestésico',
    quantity: 8,
    minQuantity: 15,
    unit: 'Tubo',
    price: 12.5,
    supplier: 'PharmaDent',
    brand: 'Novocol',
    model: 'Lidocaína 2%',
    batchNumber: 'LOT2024002',
    manufactureDate: '2023-12-01',
    expiryDate: '2024-06-30',
    lastPurchaseDate: '2024-01-14',
  },
  {
    id: '3',
    nome: 'Luvas Cirúrgicas Tamanho M',
    category: 'Descartável',
    quantity: 200,
    minQuantity: 100,
    unit: 'Caixa',
    price: 45.0,
    supplier: 'MedSupply',
    brand: 'MedSupply',
    model: 'Lite',
    batchNumber: 'LOT2024003',
    manufactureDate: '2024-01-10',
    expiryDate: '2026-01-10',
    lastPurchaseDate: '2024-01-12',
  },
  {
    id: '4',
    nome: 'Clareador Dental',
    category: 'Estética',
    quantity: 5,
    minQuantity: 10,
    unit: 'Kit',
    price: 120.0,
    supplier: 'Dental Supply',
    brand: 'Opalescence',
    model: 'PF 15%',
    batchNumber: 'LOT2024004',
    manufactureDate: '2023-11-15',
    expiryDate: '2024-08-15',
    lastPurchaseDate: '2024-01-10',
  },
  {
    id: '5',
    nome: 'Broca Diamantada',
    category: 'Instrumental',
    quantity: 25,
    minQuantity: 20,
    unit: 'Unidade',
    price: 35.5,
    supplier: 'Dental Supply',
    brand: 'KG Sorensen',
    model: '3215',
    batchNumber: 'LOT2024005',
    manufactureDate: '2023-10-20',
    expiryDate: null,
    lastPurchaseDate: '2024-01-08',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')

  let filtered = [...mockProdutos]

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.supplier?.toLowerCase().includes(q)
    )
  }
  if (category) {
    filtered = filtered.filter((p) => p.category === category)
  }
  if (status) {
    filtered = filtered.filter((p) => p.status === status)
  }

  const total = filtered.length

  if (offset) {
    const off = parseInt(offset, 10)
    filtered = filtered.slice(off)
  }

  if (limit) {
    const lim = parseInt(limit, 10)
    filtered = filtered.slice(0, lim)
  }

  return NextResponse.json({
    data: filtered,
    total,
    hasMore: limit && offset ? total > parseInt(offset, 10) + parseInt(limit, 10) : false,
  })
}
