'use client'

import { useState } from 'react'
import { Plus, Upload, Download, Eye, Trash2, FileText, Image, File, Camera, X, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'

interface DocumentsTabProps {
  pacienteId: string
}

export function DocumentsTab({ pacienteId }: DocumentsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('todos')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  // Mock de documentos e imagens
  const [documents, setDocuments] = useState([
    {
      id: '1',
      nome: 'Radiografia Panorâmica',
      type: 'image',
      category: 'radiografia',
      file_url: '/documents/radio_panoramica_20240115.jpg',
      upload_date: '2024-01-15',
      file_size: 2.5,
      description: 'Radiografia panorâmica inicial para avaliação',
      dentist: 'Dr. Carlos Silva',
      tags: ['inicial', 'panorâmica', 'avaliação']
    },
    {
      id: '2',
      nome: 'Termo de Consentimento',
      type: 'document',
      category: 'consentimento',
      file_url: '/documents/termo_consentimento_20240115.pdf',
      upload_date: '2024-01-15',
      file_size: 0.5,
      description: 'Termo de consentimento para tratamento de clareamento',
      dentist: 'Dra. Maria Santos',
      tags: ['consentimento', 'clareamento', 'legal']
    },
    {
      'id': '3',
      nome: 'Fotos Intra-orais',
      type: 'image',
      category: 'foto_clinica',
      file_url: '/documents/fotos_intra_orais_20240220.zip',
      upload_date: '2024-02-20',
      file_size: 15.2,
      description: 'Registro fotográfico antes do tratamento',
      dentist: 'Dra. Maria Santos',
      tags: ['fotos', 'intra-oral', 'antes']
    },
    {
      id: '4',
      nome: 'Laudo Histopatológico',
      type: 'document',
      category: 'laudo',
      file_url: '/documents/laudo_histopatologico_20230310.pdf',
      upload_date: '2023-03-10',
      file_size: 1.2,
      description: 'Laudo de biópsia realizada',
      dentist: 'Dr. Carlos Silva',
      tags: ['laudo', 'biópsia', 'histopatológico']
    },
    {
      id: '5',
      nome: 'Modelo de Estudo Digital',
      type: 'file',
      category: 'modelo_3d',
      file_url: '/documents/modelo_digital_20240115.stl',
      upload_date: '2024-01-15',
      file_size: 8.7,
      description: 'Scan 3D para planejamento de prótese',
      dentist: 'Dr. Carlos Silva',
      tags: ['modelo', '3d', 'prótese', 'digital']
    }
  ])

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const matchSearch = doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchType = typeFilter === 'todos' || doc.type === typeFilter
    
    return matchSearch && matchType
  })

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'image':
        return { label: 'Imagem', color: 'bg-green-500', icon: Image }
      case 'document':
        return { label: 'Documento', color: 'bg-blue-500', icon: FileText }
      case 'file':
        return { label: 'Arquivo', color: 'bg-purple-500', icon: File }
      default:
        return { label: 'Desconhecido', color: 'bg-gray-500', icon: File }
    }
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'radiografia':
        return 'Radiografia'
      case 'consentimento':
        return 'Termo de Consentimento'
      case 'foto_clinica':
        return 'Foto Clínica'
      case 'laudo':
        return 'Laudo'
      case 'modelo_3d':
        return 'Modelo 3D'
      default:
        return 'Outros'
    }
  }

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`
    }
    return `${sizeInMB.toFixed(1)} MB`
  }

  const handleUploadDocument = (data: any) => {
    // Aqui viria a lógica para upload de documento
    console.log('Upload documento:', data)
    setShowUploadDialog(false)
  }

  const handleDeleteDocument = (documentId: string) => {
    // Aqui viria a lógica para excluir documento
    console.log('Excluir documento:', documentId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documentos e Imagens</h1>
          <p className="text-muted-foreground">Gerenciamento de arquivos clínicos e documentos do paciente</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Tudo
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Novo Documento
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {documents.filter(d => d.type === 'document').length}
                </div>
                <div className="text-sm text-muted-foreground">Documentos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Image className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {documents.filter(d => d.type === 'image').length}
                </div>
                <div className="text-sm text-muted-foreground">Imagens</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <File className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {documents.filter(d => d.type === 'file').length}
                </div>
                <div className="text-sm text-muted-foreground">Arquivos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">MB</span>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {documents.reduce((sum, d) => sum + d.file_size, 0).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Total Armazenado</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="image">Imagens</SelectItem>
                <SelectItem value="document">Documentos</SelectItem>
                <SelectItem value="file">Arquivos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Documentos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((document) => {
          const typeInfo = getTypeInfo(document.type)
          const TypeIcon = typeInfo.icon

          return (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Preview do documento */}
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    {document.type === 'image' ? (
                      <div className="text-center">
                        <Image className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Imagem</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <TypeIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{typeInfo.label}</p>
                      </div>
                    )}
                  </div>

                  {/* Informações do documento */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{document.nome}</h3>
                      <Badge variant="outline" className={`text-xs ${typeInfo.color} text-white`}>
                        {typeInfo.label}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {document.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>{formatDate(document.upload_date)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {document.dentist}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryInfo(document.category)}
                      </Badge>
                    </div>
                  </div>

                  {/* Tags */}
                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {document.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{document.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Card de Upload */}
        <Card className="border-dashed border-2 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 h-full flex items-center justify-center min-h-[280px]">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Novo Documento</h3>
                <p className="text-sm text-muted-foreground">
                  Clique para adicionar documentos, imagens ou arquivos
                </p>
              </div>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Arquivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'todos' 
                ? 'Tente ajustar os filtros para ver mais resultados' 
                : 'Este paciente ainda não possui documentos registrados'}
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Fazer Primeiro Upload
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Upload */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload de Documento</DialogTitle>
            <DialogDescription>
              Adicione novos documentos, imagens ou arquivos clínicos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Arquivo</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste e solte o arquivo aqui ou clique para selecionar
                </p>
                <Button variant="outline">
                  <Camera className="mr-2 h-4 w-4" />
                  Selecionar Arquivo
                </Button>
              </div>
            </div>
            <div>
              <Label>Nome do Documento</Label>
              <Input placeholder="Ex: Radiografia Panorâmica" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="radiografia">Radiografia</SelectItem>
                    <SelectItem value="consentimento">Termo de Consentimento</SelectItem>
                    <SelectItem value="foto_clinica">Foto Clínica</SelectItem>
                    <SelectItem value="laudo">Laudo</SelectItem>
                    <SelectItem value="modelo_3d">Modelo 3D</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Profissional Responsável</Label>
                <Input placeholder="Dr. Carlos Silva" />
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea 
                placeholder="Descreva o conteúdo e importância deste documento..."
                rows={3}
              />
            </div>
            <div>
              <Label>Tags (separadas por vírgula)</Label>
              <Input placeholder="Ex: inicial, panorâmica, avaliação" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => handleUploadDocument({})}>
              Fazer Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
