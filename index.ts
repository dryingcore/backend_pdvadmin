import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { eventsRoutes } from './src/routes/Events.routes';

const app = Fastify();

app.register(eventsRoutes);
app.register(fastifyCors);

app.listen({ port: 3000 }, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});
