import Fastify from 'fastify';
import { eventsRoutes } from './src/routes/Events.routes';

const app = Fastify();

app.register(eventsRoutes);

app.listen({ port: 3000 }, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});
