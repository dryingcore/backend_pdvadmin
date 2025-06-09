import type { FastifyInstance } from 'fastify';
import FechamentoEventoController from '../controllers/FechamentoEvento.controllers';

export async function fechamentoEventoRoutes(app: FastifyInstance) {
  const controller = new FechamentoEventoController();

  app.get('/fechamento-evento', controller.gerarResumo.bind(controller));
}
