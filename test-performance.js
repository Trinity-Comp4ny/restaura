const http = require('http');

const testRoutes = [
  { path: '/home', name: 'Home' },
  { path: '/financeiro', name: 'Financeiro' },
  { path: '/configuracoes', name: 'Configurações' },
  { path: '/configuracoes/perfil', name: 'Perfil' },
  { path: '/configuracoes/financeiro/cartoes', name: 'Cartões' },
  { path: '/configuracoes/financeiro/categorias', name: 'Categorias' },
  { path: '/configuracoes/financeiro/contas', name: 'Contas' },
  { path: '/pacientes', name: 'Pacientes' },
];

function testRoute(path) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        resolve({
          path,
          status: res.statusCode,
          duration,
          size: Buffer.byteLength(data, 'utf8')
        });
      });
    });
    
    req.on('error', (err) => {
      const endTime = Date.now();
      resolve({
        path,
        status: 'ERROR',
        duration: endTime - startTime,
        error: err.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        path,
        status: 'TIMEOUT',
        duration: 10000
      });
    });
  });
}

async function runTests() {
  console.log('🚀 Iniciando testes de performance em produção...\n');
  console.log('═'.repeat(80));
  
  const results = [];
  
  // Teste 1: Primeira carga (cold start)
  console.log('\n📊 TESTE 1: PRIMEIRA CARGA (Cold Start)');
  console.log('─'.repeat(80));
  
  for (const route of testRoutes) {
    const result = await testRoute(route.path);
    results.push({ ...result, name: route.name, type: 'cold' });
    
    const statusIcon = result.status === 200 ? '✅' : '❌';
    const sizeKB = result.size ? `${(result.size / 1024).toFixed(2)} KB` : 'N/A';
    
    console.log(`${statusIcon} ${route.name.padEnd(25)} ${result.duration}ms  [${sizeKB}]`);
    
    // Pequeno delay entre requisições
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Teste 2: Segunda carga (warm cache)
  console.log('\n📊 TESTE 2: SEGUNDA CARGA (Warm Cache)');
  console.log('─'.repeat(80));
  
  for (const route of testRoutes) {
    const result = await testRoute(route.path);
    results.push({ ...result, name: route.name, type: 'warm' });
    
    const statusIcon = result.status === 200 ? '✅' : '❌';
    const sizeKB = result.size ? `${(result.size / 1024).toFixed(2)} KB` : 'N/A';
    
    console.log(`${statusIcon} ${route.name.padEnd(25)} ${result.duration}ms  [${sizeKB}]`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Análise de resultados
  console.log('\n📈 ANÁLISE DE RESULTADOS');
  console.log('═'.repeat(80));
  
  const coldResults = results.filter(r => r.type === 'cold');
  const warmResults = results.filter(r => r.type === 'warm');
  
  const coldAvg = coldResults.reduce((sum, r) => sum + r.duration, 0) / coldResults.length;
  const warmAvg = warmResults.reduce((sum, r) => sum + r.duration, 0) / warmResults.length;
  
  console.log(`\n🔵 Cold Start (primeira carga):`);
  console.log(`   Média: ${coldAvg.toFixed(2)}ms`);
  console.log(`   Mínimo: ${Math.min(...coldResults.map(r => r.duration))}ms`);
  console.log(`   Máximo: ${Math.max(...coldResults.map(r => r.duration))}ms`);
  
  console.log(`\n🟢 Warm Cache (segunda carga):`);
  console.log(`   Média: ${warmAvg.toFixed(2)}ms`);
  console.log(`   Mínimo: ${Math.min(...warmResults.map(r => r.duration))}ms`);
  console.log(`   Máximo: ${Math.max(...warmResults.map(r => r.duration))}ms`);
  
  console.log(`\n⚡ Melhoria com cache: ${((coldAvg - warmAvg) / coldAvg * 100).toFixed(1)}%`);
  
  // Rotas mais lentas
  console.log(`\n🐌 TOP 3 ROTAS MAIS LENTAS (Cold Start):`);
  const slowest = [...coldResults].sort((a, b) => b.duration - a.duration).slice(0, 3);
  slowest.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.name}: ${r.duration}ms`);
  });
  
  // Rotas mais rápidas
  console.log(`\n🚀 TOP 3 ROTAS MAIS RÁPIDAS (Warm Cache):`);
  const fastest = [...warmResults].sort((a, b) => a.duration - b.duration).slice(0, 3);
  fastest.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.name}: ${r.duration}ms`);
  });
  
  console.log('\n═'.repeat(80));
  console.log('✅ Testes concluídos!\n');
}

runTests().catch(console.error);
