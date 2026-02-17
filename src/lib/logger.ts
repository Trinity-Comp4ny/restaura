import pino from 'pino'

const isServer = typeof window === 'undefined'
const isDev = process.env.NODE_ENV === 'development'

function createLogger() {
  if (!isServer) {
    // Browser: use console-based logger
    return pino({
      browser: {
        asObject: true,
      },
      level: isDev ? 'debug' : 'info',
    })
  }

  // Server: structured JSON logging
  return pino({
    level: isDev ? 'debug' : 'info',
    ...(isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname',
            },
          },
        }
      : {}),
    formatters: {
      level(label) {
        return { level: label }
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'token',
        'secret',
        'apiKey',
      ],
      censor: '[REDACTED]',
    },
  })
}

export const logger = createLogger()

// Child loggers pré-configurados por domínio
export const authLogger = logger.child({ module: 'auth' })
export const dbLogger = logger.child({ module: 'database' })
export const apiLogger = logger.child({ module: 'api' })
export const financeiroLogger = logger.child({ module: 'financeiro' })
export const estoqueLogger = logger.child({ module: 'estoque' })
export const agendaLogger = logger.child({ module: 'agenda' })
export const perfLogger = logger.child({ module: 'performance' })
export const errorLogger = logger.child({ module: 'error' })
