import type { FastifyRequest, FastifyReply } from 'fastify';
import { EventsService } from '../services/Eventos.services';
import { formatarDataBR } from '../utils/FormatarData.utils';

export default class EventosController {
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

  async buscarEventosDetalhados(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const evento = await this.service.getEventoCompleto(id);
      return reply.send(evento);
    } catch (err) {
      console.error(err);
      return reply.status(400).send({ error: (err as Error).message });
    }
  }

  async buscarComTaxasPorId(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };

      const evento = await this.service.listarComTaxasPorId(id);

      if (!evento) {
        return reply.status(404).send({ error: 'Evento não encontrado' });
      }

      const eventoComDataFormatada = {
        ...evento,
        data_inicio: formatarDataBR(evento.data_inicio),
        data_fim: formatarDataBR(evento.data_fim),
        criado_em: evento.criado_em ? formatarDataBR(evento.criado_em) : null,
        atualizado_em: evento.atualizado_em ? formatarDataBR(evento.atualizado_em) : null,
      };

      return reply.send(eventoComDataFormatada);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({
        error: err instanceof Error ? err.message : 'Erro ao buscar evento com taxas',
      });
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
        lojas?: { id: string; havera_antecipacao?: boolean }[];
        comissionados?: { id: string; percentual: string }[];
        taxas_por_gateway?: { id: string }; // <- CORRIGIDO AQUI
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
        lojas: body.lojas ?? [],
        comissionados: body.comissionados ?? [],
        taxas_por_gateway: body.taxas_por_gateway ?? undefined, // <- CORRIGIDO AQUI
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
        lojas?: { id: string; havera_antecipacao?: boolean }[];
        comissionados?: { id: string; percentual: string }[];
        taxas_por_gateway?: { id: string }; // <- CORRIGIDO PARA OBJETO ÚNICO
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
        lojas: body.lojas ?? [],
        comissionados: body.comissionados ?? [],
        taxas_por_gateway: body.taxas_por_gateway ?? undefined, // <- CORRIGIDO AQUI
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
