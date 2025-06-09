// src/controllers/TransacoesDiariasController.ts

import type { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../database/db';
import { transacoesDiarias, lojas } from '../database/schema';
import { eq, and } from 'drizzle-orm';

export default class TransacoesDiariasController {
  // Listar transações por evento e data
  async listarPorEventoEDia(
    request: FastifyRequest<{ Querystring: { evento_id: string; data: string } }>,
    reply: FastifyReply,
  ) {
    const { evento_id, data } = request.query;

    if (!evento_id || !data) {
      return reply.status(400).send({ erro: 'Parâmetros evento_id e data são obrigatórios.' });
    }

    try {
      const transacoes = await db
        .select({
          id: transacoesDiarias.id,
          loja_id: transacoesDiarias.lojaId,
          loja_nome: lojas.nome,
          data: transacoesDiarias.dataTransacao,
          dinheiro: transacoesDiarias.dinheiro,
          debito: transacoesDiarias.debito,
          credito: transacoesDiarias.credito,
          pix: transacoesDiarias.pix,
          status: transacoesDiarias.status,
        })
        .from(transacoesDiarias)
        .leftJoin(lojas, eq(transacoesDiarias.lojaId, lojas.id))
        .where(and(eq(transacoesDiarias.eventoId, evento_id), eq(transacoesDiarias.dataTransacao, data)));

      return reply.send(transacoes);
    } catch (erro) {
      console.error('Erro ao listar transações:', erro);
      return reply.status(500).send({ erro: 'Erro ao buscar transações do dia.' });
    }
  }

  // Atualizar os valores financeiros de uma transação do dia
  async atualizarValores(
    request: FastifyRequest<{
      Body: {
        id: string;
        dinheiro: string;
        debito: string;
        credito: string;
        pix: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { id, dinheiro, debito, credito, pix } = request.body;

    if (!id) {
      return reply.status(400).send({ erro: 'ID da transação é obrigatório.' });
    }

    try {
      await db
        .update(transacoesDiarias)
        .set({
          dinheiro,
          debito,
          credito,
          pix,
          atualizadoEm: new Date(),
        })
        .where(eq(transacoesDiarias.id, id));

      return reply.send({ sucesso: true });
    } catch (erro) {
      console.error('Erro ao atualizar valores da transação:', erro);
      return reply.status(500).send({ erro: 'Erro ao atualizar valores da transação.' });
    }
  }

  // Listar todas as datas e transações do evento
  async listarPorEvento(request: FastifyRequest<{ Querystring: { evento_id: string } }>, reply: FastifyReply) {
    const { evento_id } = request.query;

    if (!evento_id) {
      return reply.status(400).send({ erro: 'Parâmetro evento_id é obrigatório.' });
    }

    try {
      const transacoes = await db
        .select({
          id: transacoesDiarias.id,
          loja_id: transacoesDiarias.lojaId,
          loja_nome: lojas.nome,
          data: transacoesDiarias.dataTransacao,
          dinheiro: transacoesDiarias.dinheiro,
          debito: transacoesDiarias.debito,
          credito: transacoesDiarias.credito,
          pix: transacoesDiarias.pix,
          status: transacoesDiarias.status,
        })
        .from(transacoesDiarias)
        .leftJoin(lojas, eq(transacoesDiarias.lojaId, lojas.id))
        .where(eq(transacoesDiarias.eventoId, evento_id));

      // Agrupar por data
      const agrupadoPorData: Record<string, typeof transacoes> = {};
      for (const t of transacoes) {
        if (!agrupadoPorData[t.data]) agrupadoPorData[t.data] = [];
        agrupadoPorData[t.data]!.push(t);
      }

      return reply.send(agrupadoPorData);
    } catch (erro) {
      console.error(erro);
      return reply.status(500).send({ erro: 'Erro ao listar transações por data.' });
    }
  }

  // Atualizar o status da transação
  async atualizarStatus(request: FastifyRequest<{ Body: { id: string; status: string } }>, reply: FastifyReply) {
    const { id, status } = request.body;

    if (!id || !status) {
      return reply.status(400).send({ erro: 'ID e novo status são obrigatórios.' });
    }

    try {
      await db.update(transacoesDiarias).set({ status, atualizadoEm: new Date() }).where(eq(transacoesDiarias.id, id));

      return reply.send({ sucesso: true });
    } catch (erro) {
      console.error('Erro ao atualizar status da transação:', erro);
      return reply.status(500).send({ erro: 'Erro ao atualizar status da transação.' });
    }
  }
}
