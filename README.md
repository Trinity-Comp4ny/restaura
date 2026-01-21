# Restaura - Sistema de Gestão Odontológica

Sistema profissional de gestão para clínicas odontológicas, desenvolvido com Next.js 14, TypeScript, TailwindCSS e Supabase.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilização**: TailwindCSS, shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Formulários**: React Hook Form, Zod
- **Estado**: TanStack Query (React Query)
- **Notificações**: Sonner
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js 20+
- pnpm, npm ou yarn
- Conta no Supabase

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/restaura.git
cd restaura
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Preencha as variáveis no `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

5. Execute as migrations no Supabase:
```bash
npm run db:push
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (páginas e layouts)
│   ├── (dashboard)/        # Grupo de rotas autenticadas
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── patients/       # Gestão de pacientes
│   │   ├── appointments/   # Agenda de consultas
│   │   └── financial/      # Controle financeiro
│   ├── auth/               # Autenticação (login, registro)
│   └── layout.tsx          # Layout raiz
├── components/
│   ├── layout/             # Componentes de layout (Sidebar, Header)
│   ├── providers/          # Context providers
│   └── ui/                 # Componentes UI reutilizáveis
├── lib/
│   ├── supabase/           # Cliente e helpers do Supabase
│   └── utils.ts            # Funções utilitárias
├── types/                  # Definições de tipos TypeScript
├── constants/              # Constantes da aplicação
└── styles/                 # Estilos globais
```

## 🔐 Autenticação

O sistema utiliza Supabase Auth com:
- Login por e-mail/senha
- Registro com criação automática de clínica
- Middleware para proteção de rotas
- Row Level Security (RLS) no banco

## 📊 Funcionalidades

### Implementadas
- [x] Landing page
- [x] Autenticação (login/registro)
- [x] Dashboard com métricas
- [x] Listagem de pacientes
- [x] Agenda de consultas
- [x] Visão financeira básica
- [x] Sidebar com navegação
- [x] Tema claro/escuro
- [x] Schema do banco de dados

### Planejadas
- [ ] CRUD completo de pacientes
- [ ] Agendamento de consultas
- [ ] Prontuário eletrônico
- [ ] Odontograma interativo
- [ ] Relatórios financeiros
- [ ] Notificações por WhatsApp
- [ ] Integração com IA

## 🗃️ Banco de Dados

O schema inclui as seguintes tabelas:
- `clinics` - Clínicas cadastradas
- `users` - Usuários do sistema (staff)
- `patients` - Pacientes
- `procedures` - Procedimentos/serviços
- `appointments` - Agendamentos
- `medical_records` - Prontuários
- `transactions` - Movimentações financeiras

## 📜 Scripts

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia build de produção
npm run lint         # Verifica linting
npm run db:generate  # Gera tipos do Supabase
npm run db:push      # Aplica migrations
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.