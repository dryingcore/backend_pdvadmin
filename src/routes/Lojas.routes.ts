import type { FastifyInstance } from 'fastify';
import LojasController from '../controllers/Lojas.controllers';

export async function lojasRoutes(app: FastifyInstance) {
  const controller = new LojasController();

  app.get('/lojas', controller.listarTodas.bind(controller));
  app.get('/lojas/:id', controller.buscarPorId.bind(controller));
  app.post('/lojas', controller.criar.bind(controller));
  app.put('/lojas/:id', controller.atualizar.bind(controller));
  app.delete('/lojas/:id', controller.deletar.bind(controller));
}
