import { perfLogger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'

// Middleware para monitoramento de performance
export function performanceMiddleware(request: NextRequest) {
  const start = Date.now()
  const url = request.url
  
  // Log inicial da requisição
  perfLogger.debug({
    type: 'request_start',
    url,
    method: request.method,
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  })

  // Interceptador de resposta
  const originalResponse = NextResponse.next
  
  return {
    ...originalResponse(request),
    async json<T>(data: T, init?: ResponseInit) {
      const duration = Date.now() - start
      
      perfLogger.info({
        type: 'request_complete',
        url,
        method: request.method,
        duration: `${duration}ms`,
        status: init?.status || 200,
        timestamp: new Date().toISOString()
      })

      // Alerta se a requisição for muito lenta
      if (duration > 3000) {
        perfLogger.warn({
          type: 'slow_request',
          url,
          method: request.method,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        })
      }

      return Response.json(data, init)
    }
  }
}

// Hook para medir performance de componentes
export function usePerformanceMonitor(componentName: string) {
  const startTime = Date.now()
  
  return {
    end: () => {
      const duration = Date.now() - startTime
      perfLogger.debug({
        type: 'component_render',
        component: componentName,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      })
      
      if (duration > 100) {
        perfLogger.warn({
          type: 'slow_component',
          component: componentName,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        })
      }
    }
  }
}

// Utilitário para medir performance de funções assíncronas
export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  operationName: string
): Promise<T> {
  const start = Date.now()
  
  try {
    perfLogger.debug({
      type: 'operation_start',
      operation: operationName,
      timestamp: new Date().toISOString()
    })
    
    const result = await fn()
    const duration = Date.now() - start
    
    perfLogger.info({
      type: 'operation_complete',
      operation: operationName,
      duration: `${duration}ms`,
      success: true,
      timestamp: new Date().toISOString()
    })
    
    if (duration > 2000) {
      perfLogger.warn({
        type: 'slow_operation',
        operation: operationName,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      })
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - start
    
    perfLogger.error({
      type: 'operation_error',
      operation: operationName,
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
    
    throw error
  }
}
