import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { eventsRoutes } from './src/routes/Eventos.routes';
import { lojasRoutes } from './src/routes/Lojas.routes';
import { comissionadosRoutes } from './src/routes/Comissionados.routes';
import { taxasPorGatewayRoutes } from './src/routes/TaxasPorGateway.routes';
import { transacoesDiariasRoutes } from './src/routes/TransacoesDiarias.routes';
import { fechamentoEventoRoutes } from './src/routes/FechamentoEvento.routes';

const app = Fastify({
  logger: true,
});

app.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

app.register(eventsRoutes);
app.register(lojasRoutes);
app.register(comissionadosRoutes);
app.register(taxasPorGatewayRoutes);
app.register(transacoesDiariasRoutes);
app.register(fechamentoEventoRoutes);

app.get('/health', () => {
  return 200;
});

app.listen({ port: 3000 }, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});
