# Plano de Ação – Performance do Sistema Odontológico

## Diagnóstico Resumido
- **Maior impacto**: Mocks JSON sendo importados em componentes client aumentam drasticamente o bundle e hidratação.
- **Runtime**: QueryKeys instáveis causam re-fetch em loop (`useUltimasVisitas` com `pacienteIds` novo a cada render).
- **Componentes gigantes**: Páginas com >700 linhas e muito estado (`estoque/page.tsx`, tabs de paciente) tornam hot reload e interações lentas.
- **Dev-only**: Lentidão concentrada em desenvolvimento (build/parse de JSONs e re-renders).

## Ações Imediatas (já implementadas)

### 1. Mover mocks para API routes (server-side)
- Criadas rotas `/api/mock/*` para: pacientes, consultas, tratamentos, estoque, selects, últimas visitas.
- Novo client `src/lib/api-mock-client.ts` com hooks otimizados e cache (`staleTime`).
- Benefício: JSONs não vão mais para o bundle do client; fetch via rede é mais rápido que parse de JSON gigante no browser.

### 2. Corrigir queryKeys instáveis
- `useUltimasVisitas` agora ordena e memoiza `pacienteIds` para evitar novas chaves a cada render.
- QueryKeys agora usam strings estáveis (ex: `['mock-ultimas-visitas', sortedIds.join(',')]`).

### 3. Refatorar componentes gigantes
- `estoque/page-optimized.tsx`: quebrado em subcomponentes (`ProductCard`, `StatsCards`, `ProductStatusBadge`).
- Removidos arrays mock inline; estado mínimo; busca via API route.
- `estoque/[produtoId]/page-optimized.tsx`: mesmo padrão, selects via API route, mocks leves apenas onde necessário.

## Próximos Passos (ordem de impacto)

### Prioridade ALTA (faça hoje)
1. **Trocar páginas ativas pelas versões otimizadas**
   - Renomear `page.tsx` → `page-old.tsx`
   - Renomear `page-optimized.tsx` → `page.tsx`
   - Testar navegação e interações.

2. **Ajustar tabs de paciente para usar API routes**
   - Substituir imports diretos de `mockPacientes`, `mockTratamentos` por hooks do `api-mock-client`.
   - Remover arrays mock dos componentes de tabs.

3. **Remover imports de mocks em outros arquivos**
   - Buscar `mock-data` imports em componentes client e substituir por hooks.
   - Deixar `mock-data.ts` apenas para uso server-side (API routes).

### Prioridade MÉDIA (esta semana)
4. **Paginação e busca no client**
   - Adicionar controles de paginação nas listas (pacientes, estoque, consultas).
   - Busca local instantânea + debounce para evitar requests desnecessários.

5. **Memoização de componentes pesados**
   - `React.memo` em cards de listas.
   - `useMemo` para cálculos de status (validade, estoque baixo).

6. **Otimizações Next.js**
   - `next.config.ts`: habilitar `swcMinify: true` (se não estiver).
   - Considerar `output: 'standalone'` para builds menores.

### Prioridade BAIXA (próxima sprint)
7. **Análise de bundle**
   - `npm run build && npx @next/bundle-analyzer`
   - Identificar outros módulos pesados e mover para server se possível.

8. **Cache avançado**
   - Implementar cache local (IndexedDB) para selects e dados pouco mutáveis.
   - `staleTime` mais longo para dados de referência (procedimentos, convênios).

## Como Medir Ganhho

### Antes/Depois (dev)
- **Tempo de hot reload**: cronometrar mudança em um componente de estoque.
- **Network requests**: contar requisições repetidas ao abrir `/pacientes`.
- **Tamanho do bundle**: `analyze -verbose` antes e depois de remover mocks.

### Métricas de runtime
- **React DevTools Profiler**: medir tempo de render das páginas.
- **Chrome Performance**: gravar interação típica (abrir modal, filtrar lista).

### SLAs sugeridos
- Hot reload < 2s para componentes pequenos.
- Primeira render de página < 1.5s.
- Abertura de modal < 300ms.
- Nenhuma requisição duplicada em 5s de inatividade.

## Riscos e Mitigações
- **Risco**: API routes podem ser mais lentas que JSON local em dev.
  - **Mitigação**: `staleTime` de 30s; cache do browser; fallback para loading skeletons.
- **Risco**: Mudar muitos arquivos pode gerar bugs.
  - **Mitigação**: Fazer por página; testar fluxos críticos; manter arquivos antigos como backup.
- **Risco**: Tipos fracos (`any`) podem mascarar erros.
  - **Mitigação**: Criar tipos simples para payloads das API routes futuramente.

## Conclusão
A maior parte da lentidão vem de **arquitetura de mocks no client**. Ao mover para server-side e estabilizar chaves de query, esperamos:
- Redução de 40-60% no tempo de hot reload.
- Eliminação de requisições duplicadas.
- Experiência de dev próxima da de produção.

O próximo passo é **ativar as páginas otimizadas** e validar que a experiência melhorou visivelmente.
