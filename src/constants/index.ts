export const APPOINTMENT_STATUS_LABELS = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  em_andamento: 'Em Andamento',
  concluído: 'Concluído',
  cancelado: 'Cancelado',
  nao_compareceu: 'Não Compareceu',
} as const

export const APPOINTMENT_STATUS_COLORS = {
  agendado: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  confirmado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  em_andamento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  concluído: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  nao_compareceu: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
} as const

export const TRANSACTION_STATUS_LABELS = {
  pendente: 'Pendente',
  pago: 'Pago',
  cancelado: 'Cancelado',
  estornado: 'Estornado',
} as const

export const TRANSACTION_STATUS_COLORS = {
  pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  pago: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  estornado: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
} as const

export const GENDER_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
] as const

export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
] as const