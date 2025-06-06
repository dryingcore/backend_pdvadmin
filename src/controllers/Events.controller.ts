import type { FastifyRequest, FastifyReply } from 'fastify';
import { EventsService } from '../services/EventsService';

export default class EventsController {
  private readonly service = new EventsService();

  async listarTodos(_: FastifyRequest, reply: FastifyReply) {
    try {
      const eventos = await this.service.listarTodos();
      return reply.send(eventos);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Erro ao listar eventos' });
    }
  }

  async criar(req: FastifyRequest, reply: FastifyReply) {
    try {
      const body = req.body as {
        nome: string;
        data_inicio: string;
        data_fim: string;
        status: string; // ✅ obrigatório agora
      };

      const evento = await this.service.criarEvento({
        nome: body.nome,
        data_inicio: new Date(body.data_inicio),
        data_fim: new Date(body.data_fim),
        status: body.status,
      });

      return reply.code(201).send(evento);
    } catch (err) {
      console.error(err);
      return reply.status(400).send({
        error: err instanceof Error ? err.message : 'Erro ao criar evento',
      });
    }
  }

  async buscarPorId(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const evento = await this.service.buscarPorId(id);
      return reply.send(evento);
    } catch (err) {
      console.error(err);
      return reply.status(404).send({
        error: err instanceof Error ? err.message : 'Evento não encontrado',
      });
    }
  }

  async atualizar(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const body = req.body as {
        nome: string;
        data_inicio: string;
        data_fim: string;
        status: string;
      };

      const eventoAtualizado = await this.service.atualizarEvento(id, {
        nome: body.nome,
        data_inicio: new Date(body.data_inicio),
        data_fim: new Date(body.data_fim),
        status: body.status,
      });

      return reply.send(eventoAtualizado);
    } catch (err) {
      console.error(err);
      return reply.status(400).send({
        error: err instanceof Error ? err.message : 'Erro ao atualizar evento',
      });
    }
  }

  async deletar(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const result = await this.service.deletarEvento(id);
      return reply.send(result);
    } catch (err) {
      console.error(err);
      return reply.status(400).send({
        error: err instanceof Error ? err.message : 'Erro ao deletar evento',
      });
    }
  }
}
