import type { FastifyInstance } from 'fastify';
import EventosController from '../controllers/Eventos.controllers';

export async function eventsRoutes(app: FastifyInstance) {
  const controller = new EventosController();

  app.get('/eventos', controller.listarTodos.bind(controller));
  app.get('/eventos/detalhados/:id', controller.buscarEventosDetalhados.bind(controller));
  app.get('/eventos/:id/com-taxas', controller.buscarComTaxasPorId.bind(controller));
  app.get('/eventos/:id', controller.buscarPorId.bind(controller));
  app.post('/eventos', controller.criar.bind(controller));
  app.put('/eventos/:id', controller.atualizar.bind(controller));
  app.delete('/eventos/:id', controller.deletar.bind(controller));
}
