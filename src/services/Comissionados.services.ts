import { db } from '../database/db';
import { comissionados } from '../database/schema';
import { eq } from 'drizzle-orm';

export interface ComissionadoInput {
  nome: string;
  responsavel?: string;
  chave_pix?: string;
  usa_conta_bancaria: boolean;
  banco?: string;
  agencia?: string;
  conta?: string;
}

export class ComissionadosService {
  async listarTodos() {
    return db.select().from(comissionados);
  }

  async buscarPorId(id: string) {
    const [comissionado] = await db.select().from(comissionados).where(eq(comissionados.id, id));

    return comissionado || null;
  }

  async criar(data: ComissionadoInput) {
    const [inserido] = await db.insert(comissionados).values(data).returning();

    return inserido;
  }

  async atualizar(id: string, data: Partial<ComissionadoInput>) {
    const [atualizado] = await db
      .update(comissionados)
      .set({ ...data, atualizadoEm: new Date() })
      .where(eq(comissionados.id, id))
      .returning();

    return atualizado;
  }

  async deletar(id: string) {
    await db.delete(comissionados).where(eq(comissionados.id, id));
  }
}
