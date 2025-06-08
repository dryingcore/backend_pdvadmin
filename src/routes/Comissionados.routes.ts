import type { FastifyInstance } from 'fastify';
import ComissionadosController from '../controllers/Comissionados.controllers';

export async function comissionadosRoutes(app: FastifyInstance) {
  const controller = new ComissionadosController();

  app.get('/comissionados', controller.listarTodos.bind(controller));

  app.get('/comissionados/:id', controller.buscarPorId.bind(controller));

  app.post('/comissionados', controller.criar.bind(controller));

  app.put('/comissionados/:id', controller.atualizar.bind(controller));

  app.delete('/comissionados/:id', controller.deletar.bind(controller));
}
