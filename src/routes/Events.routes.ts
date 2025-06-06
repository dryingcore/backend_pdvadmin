import type { FastifyInstance } from 'fastify';
import EventsController from '../controllers/Events.controller';

export async function eventsRoutes(app: FastifyInstance) {
  const controller = new EventsController();

  app.get('/eventos', controller.listarTodos.bind(controller));
  app.post('/eventos', controller.criar.bind(controller));
  app.get('/eventos/:id', controller.buscarPorId.bind(controller));
}
