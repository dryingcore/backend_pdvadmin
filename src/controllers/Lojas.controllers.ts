import type { FastifyRequest, FastifyReply } from 'fastify';
import { LojasService } from '../services/Lojas.services';

export default class LojasController {
  private readonly service = new LojasService();

  async listarTodas(request: FastifyRequest<{ Querystring: { taxas?: string } }>, reply: FastifyReply) {
    try {
      const incluirTaxas = request.query?.taxas?.toLowerCase() === 'true';
      const lojas = incluirTaxas ? await this.service.listarTodosComTaxas() : await this.service.listarTodas();
      return reply.send(lojas);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Erro ao listar lojas' });
    }
  }

  async buscarPorId(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const loja = await this.service.buscarPorId(id);
      return reply.send(loja);
    } catch (err) {
      console.error(err);
      return reply.status(404).send({ error: 'Loja não encontrada' });
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        nome: string;
        numero_documento: string;
        tipo_documento: string;
        whatsapp?: string;
        cep?: string;
        endereco?: string;
        razao_social?: string;
        nome_responsavel?: string;
        chave_pix?: string;
        info_bancaria?: string;
        usa_taxas_personalizadas?: boolean;
      };

      const loja = await this.service.criarLoja(body);
      return reply.code(201).send(loja);
    } catch (err) {
      console.error(err);
      return reply.status(400).send({ error: 'Erro ao criar loja' });
    }
  }

  async atualizar(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const body = req.body as Partial<{
        nome: string;
        numero_documento?: string;
        tipo_documento?: string;
        whatsapp?: string;
        cep?: string;
        endereco?: string;
        info_bancaria?: string;
        chave_pix?: string;
        usa_taxas_personalizadas?: boolean;
        taxas?: {
          dinheiro?: string;
          debito?: string;
          credito?: string;
          pix?: string;
          antecipacao?: string;
        };
      }>;

      const loja = await this.service.atualizarLoja(id, body);
      return reply.send(loja);
    } catch (err) {
      console.error(err);
      return reply.status(400).send({ error: 'Erro ao atualizar loja' });
    }
  }

  async deletar(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      await this.service.deletarLoja(id);
      return reply.send({ success: true });
    } catch (err) {
      console.error(err);
      return reply.status(400).send({ error: 'Erro ao deletar loja' });
    }
  }
}
