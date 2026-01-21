export * from './database.types'

export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
  badge?: string | number
  children?: NavItem[]
}

export interface BreadcrumbItem {
  title: string
  href?: string
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface PaginationParams {
  page: number
  pageSize: number
  total: number
}

export interface SortParams {
  column: string
  direction: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: string | undefined
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  count?: number
}

export interface DashboardStats {
  totalPatients: number
  totalAppointments: number
  todayAppointments: number
  monthlyRevenue: number
  pendingPayments: number
  noShowRate: number
}

export interface AppointmentWithRelations {
  id: string
  horario_inicio: string
  horario_fim: string
  status: string
  observacoes: string | null
  patient: {
    id: string
    name: string
    phone: string | null
    url_avatar: string | null
  }
  dentist: {
    id: string
    name: string
    url_avatar: string | null
  }
  procedure: {
    id: string
    name: string
    color: string | null
    price: number
  } | null
}

export interface PatientWithStats {
  id: string
  name: string
  email: string | null
  phone: string | null
  url_avatar: string | null
  ultima_consulta: string | null
  total_consultas: number
  total_gasto: number
}
