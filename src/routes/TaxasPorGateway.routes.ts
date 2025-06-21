import type { FastifyInstance } from 'fastify';
import TaxasPorGatewayController from '../controllers/TaxasPorGateway.controllers';

export async function taxasPorGatewayRoutes(app: FastifyInstance) {
  const controller = new TaxasPorGatewayController();

  app.get('/taxas-gateway', controller.listarTodos.bind(controller));
  app.get('/taxas-gateway/:gateway', controller.buscarPorGateway.bind(controller));
  app.put('/taxas-gateway/:id', controller.atualizarTaxa.bind(controller));
  app.post('/taxas-gateway', controller.criarTaxa.bind(controller));
}
