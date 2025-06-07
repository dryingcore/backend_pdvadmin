import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { eventsRoutes } from './src/routes/Eventos.routes';
import { lojasRoutes } from './src/routes/Lojas.routes';

const app = Fastify({
  logger: true,
});

app.register(fastifyCors, {
  origin: '*', // ou especifique: ['http://localhost:8080']
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

app.register(eventsRoutes);
app.register(lojasRoutes);

app.listen({ port: 3000 }, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});
