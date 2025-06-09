import type { FastifyRequest, FastifyReply } from 'fastify';
import { FechamentoEventoService } from '../services/FechamentoEvento.services';

export default class FechamentoEventoController {
  private readonly service = new FechamentoEventoService();

  async gerarResumo(request: FastifyRequest<{ Querystring: { evento_id: string } }>, reply: FastifyReply) {
    const { evento_id } = request.query;

    if (!evento_id) {
      return reply.status(400).send({ erro: 'Parâmetro evento_id é obrigatório.' });
    }

    try {
      const resumo = await this.service.gerarResumo(evento_id);
      return reply.send(resumo);
    } catch (erro) {
      console.error('Erro ao gerar resumo do evento:', erro);
      return reply.status(500).send({ erro: 'Erro ao gerar fechamento do evento.' });
    }
  }
}
