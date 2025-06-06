import type { FastifyRequest, FastifyReply } from 'fastify';
import { EventsService } from '../services/Eventos.services';
import { formatarDataBR } from '../utils/FormatarData.utils';

export default class EventsController {
  private readonly service = new EventsService();

  async listarTodos(request: FastifyRequest<{ Querystring: { taxas?: string } }>, reply: FastifyReply) {
    try {
      const incluirTaxas = request.query?.taxas?.toLowerCase() === 'true';
      const eventos = incluirTaxas ? await this.service.listarTodosComTaxas() : await this.service.listarTodos();

      const eventosComDataFormatada = eventos.map(evento => ({
        ...evento,
        dataInicio: formatarDataBR(evento.dataInicio),
        dataFim: formatarDataBR(evento.dataFim),
        criadoEm: evento.criadoEm ? formatarDataBR(evento.criadoEm) : null,
        atualizadoEm: evento.atualizadoEm ? formatarDataBR(evento.atualizadoEm) : null,
      }));

      return reply.send(eventosComDataFormatada);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Erro ao listar eventos' });
    }
  }

  async criar(req: FastifyRequest, reply: FastifyReply) {
    try {
      const body = req.body as {
        nome?: string;
        data_inicio?: string;
        data_fim?: string;
        status?: string;
        taxas?: {
          dinheiro?: string;
          debito?: string;
          credito?: string;
          pix?: string;
          antecipacao?: string;
        };
      };

      if (!body) {
        return reply.status(400).send({ error: 'Corpo da requisição ausente.' });
      }

      const evento = await this.service.criarEvento({
        nome: body.nome ?? '',
        data_inicio: body.data_inicio ?? '',
        data_fim: body.data_fim ?? '',
        status: body.status ?? '',
        taxas: {
          dinheiro: body.taxas?.dinheiro ?? '',
          debito: body.taxas?.debito ?? '',
          credito: body.taxas?.credito ?? '',
          pix: body.taxas?.pix ?? '',
          antecipacao: body.taxas?.antecipacao ?? '',
        },
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
        nome?: string;
        data_inicio?: string;
        data_fim?: string;
        status?: string;
        taxas?: {
          dinheiro?: string;
          debito?: string;
          credito?: string;
          pix?: string;
          antecipacao?: string;
        };
      };

      if (!body) {
        return reply.status(400).send({ error: 'Corpo da requisição ausente.' });
      }

      const eventoAtualizado = await this.service.atualizarEvento(id, {
        nome: body.nome ?? '',
        data_inicio: body.data_inicio ?? '',
        data_fim: body.data_fim ?? '',
        status: body.status ?? '',
        taxas: {
          dinheiro: body.taxas?.dinheiro ?? '',
          debito: body.taxas?.debito ?? '',
          credito: body.taxas?.credito ?? '',
          pix: body.taxas?.pix ?? '',
          antecipacao: body.taxas?.antecipacao ?? '',
        },
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
