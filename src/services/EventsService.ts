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
  status?: string;
}

export class EventsService {
  async listarTodos() {
    return db.select().from(eventos);
  }

  async criarEvento(input: EventoInput) {
    const { nome, data_inicio, data_fim, status } = input;

    // Validação de nome
    if (!nome?.trim()) {
      throw new Error('Nome do evento é obrigatório.');
    }

    // Validação de datas
    if (!(data_inicio instanceof Date) || isNaN(data_inicio.getTime())) {
      throw new Error('Data de início inválida.');
    }

    if (!(data_fim instanceof Date) || isNaN(data_fim.getTime())) {
      throw new Error('Data de fim inválida.');
    }

    if (data_inicio > data_fim) {
      throw new Error('A data de início não pode ser posterior à data de fim.');
    }

    // Monta objeto de inserção compatível com o schema do Drizzle
    const novoEvento: typeof eventos.$inferInsert = {
      nome: nome.trim(),
      data_inicio: data_inicio.toISOString().split('T')[0] as string, // YYYY-MM-DD
      data_fim: data_fim.toISOString().split('T')[0] as string, // YYYY-MM-DD
      status: (status?.trim() || 'ativo') as string,
    };

    // Insere no banco
    const [eventoCriado] = await db.insert(eventos).values(novoEvento).returning();

    return eventoCriado;
  }

  async buscarPorId(id: string) {
    if (!id?.trim()) {
      throw new Error('ID é obrigatório.');
    }

    const [evento] = await db.select().from(eventos).where(eq(eventos.id, id));

    return evento ?? null;
  }
}
