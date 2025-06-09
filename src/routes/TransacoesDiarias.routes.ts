// src/routes/transacoesDiariasRoutes.ts
import type { FastifyInstance } from 'fastify';
import TransacoesDiariasController from '../controllers/TransacoesDiarias.controllers';

export async function transacoesDiariasRoutes(app: FastifyInstance) {
  const controller = new TransacoesDiariasController();

  app.get('/transacoes-diarias', controller.listarPorEventoEDia.bind(controller));
  app.put('/transacoes-diarias', controller.atualizarValores.bind(controller));
  app.get('/transacoes-diarias/datas', controller.listarPorEvento.bind(controller)); // <-- corrigido aqui
}
