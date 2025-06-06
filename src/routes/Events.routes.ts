import type { FastifyInstance } from 'fastify';
import EventsController from '../controllers/Events.controller';

export async function eventsRoutes(app: FastifyInstance) {
  const controller = new EventsController();

  app.get('/eventos', controller.listarTodos.bind(controller)); // Listar todos
  app.get('/eventos/:id', controller.buscarPorId.bind(controller)); // Buscar por ID
  app.post('/eventos', controller.criar.bind(controller)); // Criar evento
  app.put('/eventos/:id', controller.atualizar.bind(controller)); // Atualizar evento
  app.delete('/eventos/:id', controller.deletar.bind(controller)); // Deletar evento
}
