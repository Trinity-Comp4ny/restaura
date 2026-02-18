# 🚀 Guia de Deploy - Restaura

## Vercel Deploy

### 1. Variáveis de Ambiente

Adicione estas variáveis no painel da Vercel (`Settings > Environment Variables`):

```bash
# Supabase (OBRIGATÓRIAS)
NEXT_PUBLIC_SUPABASE_URL=https://gyffziviaubyqsrhiysu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZmZ6aXZpYXVieXFzcmhpeXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjA5NDcsImV4cCI6MjA4NDIzNjk0N30.R5L7rFRDKnbNVSkI3OxrzLFhaqyv_MJfwAxTmTiZPRU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZmZ6aXZpYXVieXFzcmhpeXN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY2MDk0NywiZXhwIjoyMDg0MjM2OTQ3fQ.1M6dFdlIqILUzqWi3fDbzR5m2Zni5DrPN-GwPgRkfQo

# Database (OBRIGATÓRIA)
DATABASE_URL=postgresql://postgres:Restaura@Trinity123@db.gyffziviaubyqsrhiysu.supabase.co:5432/postgres

# App (OBRIGATÓRIAS - ATUALIZAR APÓS DEPLOY)
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
NEXT_PUBLIC_APP_NAME=Restaura

# Email (OBRIGATÓRIA)
RESEND_API_KEY=re_EmowcsfS_FaqQCzfzByjeBRt4VTKnimud
RESEND_FROM_EMAIL=no-reply@restaurasoft.com.br
RESEND_FROM_NAME=Restaura

# Sentry (OPCIONAIS)
NEXT_PUBLIC_SENTRY_DSN=https://abe9e4006e76f18a153ddb8e55ec251f@o4510867969212416.ingest.us.sentry.io/4510867985137664
SENTRY_ORG=trinity-company
SENTRY_PROJECT=restaura
SENTRY_AUTH_TOKEN=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
```

### 2. Configurações do Projeto

- **Framework**: Next.js (auto-detectado)
- **Root Directory**: `.` (raiz)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 18.x ou superior

### 3. Pós-Deploy (IMPORTANTE!)

Após o primeiro deploy, você receberá a URL de produção (ex: `restaura-xyz.vercel.app`).

#### 3.1 Atualizar Vercel
1. Vá em `Settings > Environment Variables`
2. Edite `NEXT_PUBLIC_APP_URL` para `https://restaura-xyz.vercel.app`
3. Faça um **Redeploy** para aplicar a mudança

#### 3.2 Atualizar Supabase
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em `Authentication > URL Configuration`
3. Adicione nas **Redirect URLs**:
   - `https://restaura-xyz.vercel.app/auth/callback`
   - `https://restaura-xyz.vercel.app`
4. Adicione na **Site URL**: `https://restaura-xyz.vercel.app`
5. Salve as alterações

### 4. Domínio Customizado (Opcional)

Se quiser usar um domínio próprio:

1. Na Vercel: `Settings > Domains` → Adicione seu domínio
2. Configure os DNS conforme instruções da Vercel
3. Atualize `NEXT_PUBLIC_APP_URL` com seu domínio
4. Atualize as URLs no Supabase também

### 5. Verificação

Após o deploy, teste:
- ✅ Login/Logout funciona
- ✅ Dados do Supabase carregam
- ✅ Rotas dinâmicas funcionam (`/pacientes/[id]`, etc.)
- ✅ Emails são enviados (Resend)
- ✅ Erros são reportados (Sentry)

## 🔧 Troubleshooting

### Erro de Autenticação
- Verifique se as URLs estão corretas no Supabase
- Confirme que `NEXT_PUBLIC_APP_URL` está atualizada

### Build Falha
- Verifique os logs de build na Vercel
- Confirme que todas as variáveis obrigatórias estão configuradas

### Dados não Carregam
- Verifique as credenciais do Supabase
- Confirme que RLS está configurado corretamente

## 📚 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Sentry Dashboard](https://sentry.io)
- [Resend Dashboard](https://resend.com)

## 🔄 CI/CD

O deploy é automático:
- **Push para `main`** → Deploy em produção
- **Pull Request** → Preview deploy automático
- **Push para outras branches** → Preview deploy (opcional)

---

**Última atualização**: 18/02/2026
