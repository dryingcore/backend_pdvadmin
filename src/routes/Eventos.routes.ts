import type { FastifyInstance } from 'fastify';
import EventsController from '../controllers/Eventos.controllers';

export async function eventsRoutes(app: FastifyInstance) {
  const controller = new EventsController();

  app.get('/eventos', controller.listarTodos.bind(controller));
  app.get('/eventos/:id', controller.buscarPorId.bind(controller));
  app.post('/eventos', controller.criar.bind(controller));
  app.put('/eventos/:id', controller.atualizar.bind(controller));
  app.delete('/eventos/:id', controller.deletar.bind(controller));
}
