import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { eventsRoutes } from './src/routes/Eventos.routes';
import { lojasRoutes } from './src/routes/Lojas.routes';

const app = Fastify({
  logger: true,
});

app.register(eventsRoutes);
app.register(lojasRoutes);
app.register(fastifyCors);

app.listen({ port: 3000 }, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});
