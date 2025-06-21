import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  TaxasPorGatewayService,
  type CriarTaxaGatewayInput,
  type AtualizarTaxaGatewayInput,
} from '../services/TaxasPorGateway.services';

export default class TaxasPorGatewayController {
  private readonly service = new TaxasPorGatewayService();

  async listarTodos(_: FastifyRequest, reply: FastifyReply) {
    try {
      const taxas = await this.service.listarTodos();
      return reply.send(taxas);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Erro ao buscar taxas por gateway.' });
    }
  }

  async buscarPorGateway(request: FastifyRequest<{ Params: { gateway: string } }>, reply: FastifyReply) {
    try {
      const taxas = await this.service.buscarPorGateway(request.params.gateway);
      if (!taxas) {
        return reply.status(404).send({ error: 'Gateway não encontrado.' });
      }
      return reply.send(taxas);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Erro ao buscar gateway.' });
    }
  }

  async criarTaxa(request: FastifyRequest<{ Body: CriarTaxaGatewayInput }>, reply: FastifyReply) {
    try {
      const taxa = await this.service.criarTaxa(request.body);
      return reply.status(201).send(taxa);
    } catch (err: any) {
      console.error(err);
      return reply.status(400).send({ error: err.message });
    }
  }

  async atualizarTaxa(
    request: FastifyRequest<{ Params: { id: string }; Body: AtualizarTaxaGatewayInput }>,
    reply: FastifyReply,
  ) {
    try {
      const _id = request.params.id;

      const taxa = await this.service.atualizarTaxa(_id, request.body);

      return reply.status(200).send({
        message: 'Taxa atualizada com sucesso.',
        data: taxa,
      });
    } catch (err: any) {
      console.error(err);
      return reply.status(400).send({ error: err.message });
    }
  }
}
