import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Session Replay (apenas produção)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Ambiente
  environment: process.env.NODE_ENV,

  // Filtrar erros irrelevantes
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    /Loading chunk \d+ failed/,
    /ChunkLoadError/,
  ],

  // Desabilitar em desenvolvimento se não tiver DSN
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
})
