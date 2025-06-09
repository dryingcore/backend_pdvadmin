// src/services/TransacoesDiariasService.ts
import { db } from '../database/db';
import { transacoesDiarias, lojas } from '../database/schema';
import { eq, and } from 'drizzle-orm';

export class TransacoesDiariasService {
  async listarDiasDoEvento(eventoId: string) {
    return db
      .selectDistinct({ dia: transacoesDiarias.dataTransacao })
      .from(transacoesDiarias)
      .where(eq(transacoesDiarias.eventoId, eventoId));
  }

  async listarTransacoesPorDia(eventoId: string, data: string) {
    return db
      .select({
        id: transacoesDiarias.id,
        lojaId: transacoesDiarias.lojaId,
        nomeLoja: lojas.nome,
        dinheiro: transacoesDiarias.dinheiro,
        debito: transacoesDiarias.debito,
        credito: transacoesDiarias.credito,
        pix: transacoesDiarias.pix,
        status: transacoesDiarias.status,
      })
      .from(transacoesDiarias)
      .leftJoin(lojas, eq(transacoesDiarias.lojaId, lojas.id))
      .where(and(eq(transacoesDiarias.eventoId, eventoId), eq(transacoesDiarias.dataTransacao, data)));
  }

  async atualizarTransacao(id: string, campo: string, valor: number) {
    if (!['dinheiro', 'debito', 'credito', 'pix'].includes(campo)) {
      throw new Error('Campo inválido para atualização');
    }

    return db
      .update(transacoesDiarias)
      .set({ [campo]: valor, atualizadoEm: new Date() })
      .where(eq(transacoesDiarias.id, id));
  }

  async atualizarStatus(id: string, novoStatus: string) {
    return db
      .update(transacoesDiarias)
      .set({ status: novoStatus, atualizadoEm: new Date() })
      .where(eq(transacoesDiarias.id, id));
  }
}
