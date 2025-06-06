import { db } from '../database/db';
import { eventos } from '../database/schema';
import { eq } from 'drizzle-orm';

/**
 * Tipagem explícita do input aceito
 */
interface EventoInput {
  nome: string;
  data_inicio: Date;
  data_fim: Date;
  status: string;
}

export class EventsService {
  async listarTodos() {
    return db.select().from(eventos);
  }

  async criarEvento(input: EventoInput) {
    const { nome, data_inicio, data_fim, status } = input;

    if (!nome.trim()) {
      throw new Error('Nome do evento é obrigatório.');
    }

    if (!(data_inicio instanceof Date) || isNaN(data_inicio.getTime())) {
      throw new Error('Data de início inválida.');
    }

    if (!(data_fim instanceof Date) || isNaN(data_fim.getTime())) {
      throw new Error('Data de fim inválida.');
    }

    if (data_inicio > data_fim) {
      throw new Error('A data de início não pode ser posterior à data de fim.');
    }

    const novoEvento: typeof eventos.$inferInsert = {
      nome: nome.trim(),
      data_inicio: data_inicio.toISOString().substring(0, 10), // YYYY-MM-DD
      data_fim: data_fim.toISOString().substring(0, 10),
      status: status.trim(),
    };

    const [eventoCriado] = await db.insert(eventos).values(novoEvento).returning();
    return eventoCriado;
  }

  async buscarPorId(id: string) {
    if (!id.trim()) {
      throw new Error('ID é obrigatório.');
    }

    const [evento] = await db.select().from(eventos).where(eq(eventos.id, id));

    if (!evento) {
      throw new Error('Evento não encontrado.');
    }

    return evento;
  }

  async atualizarEvento(id: string, input: EventoInput) {
    const { nome, data_inicio, data_fim, status } = input;

    if (!id.trim()) throw new Error('ID é obrigatório.');
    if (!nome.trim()) throw new Error('Nome do evento é obrigatório.');
    if (!(data_inicio instanceof Date) || isNaN(data_inicio.getTime())) throw new Error('Data de início inválida.');
    if (!(data_fim instanceof Date) || isNaN(data_fim.getTime())) throw new Error('Data de fim inválida.');
    if (data_inicio > data_fim) throw new Error('A data de início não pode ser posterior à data de fim.');

    const dadosAtualizados: typeof eventos.$inferInsert = {
      nome: nome.trim(),
      data_inicio: data_inicio.toISOString().substring(0, 10),
      data_fim: data_fim.toISOString().substring(0, 10),
      status: status.trim(),
    };

    const [eventoAtualizado] = await db.update(eventos).set(dadosAtualizados).where(eq(eventos.id, id)).returning();

    return eventoAtualizado;
  }

  async deletarEvento(id: string) {
    if (!id.trim()) throw new Error('ID é obrigatório.');
    await db.delete(eventos).where(eq(eventos.id, id));
    return { message: 'Evento deletado com sucesso' };
  }
}
