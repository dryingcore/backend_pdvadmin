import type { FastifyRequest, FastifyReply } from 'fastify';
import { ComissionadosService, type ComissionadoInput } from '../services/Comissionados.services';

export default class ComissionadosController {
  private readonly service = new ComissionadosService();

  async listarTodos(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const lista = await this.service.listarTodos();
      return reply.send(lista);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Erro ao listar comissionados.' });
    }
  }

  async buscarPorId(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const comissionado = await this.service.buscarPorId(request.params.id);
      if (!comissionado) {
        return reply.status(404).send({ error: 'Comissionado não encontrado.' });
      }
      return reply.send(comissionado);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar comissionado.' });
    }
  }

  async criar(request: FastifyRequest<{ Body: ComissionadoInput }>, reply: FastifyReply) {
    try {
      const comissionado = await this.service.criar(request.body);
      return reply.status(201).send(comissionado);
    } catch (error) {
      console.error(error);
      return reply.status(400).send({ error: 'Erro ao criar comissionado.' });
    }
  }

  async atualizar(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Partial<ComissionadoInput>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const atualizado = await this.service.atualizar(request.params.id, request.body);
      return reply.send(atualizado);
    } catch (error) {
      console.error(error);
      return reply.status(400).send({ error: 'Erro ao atualizar comissionado.' });
    }
  }

  async deletar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await this.service.deletar(request.params.id);
      return reply.status(204).send();
    } catch (error) {
      console.error(error);
      return reply.status(400).send({ error: 'Erro ao deletar comissionado.' });
    }
  }
}
