import { db } from '../database/db';
import { eventos, taxasEvento } from '../database/schema';
import { eq } from 'drizzle-orm';
import { validarData, validarValorMonetario, dataEhMenorOuIgual } from '../helpers/Validacao.helpers';

interface CriarEventoInput {
  nome: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  taxas: {
    dinheiro: string;
    debito: string;
    credito: string;
    pix: string;
    antecipacao: string;
  };
}

export class EventsService {
  async listarTodos() {
    return db.select().from(eventos);
  }

  async listarTodosComTaxas() {
    return db
      .select({
        id: eventos.id,
        nome: eventos.nome,
        data_inicio: eventos.data_inicio,
        data_fim: eventos.data_fim,
        status: eventos.status,
        criado_em: eventos.criado_em,
        atualizado_em: eventos.atualizado_em,
        taxa_credito: taxasEvento.credito,
        taxa_debito: taxasEvento.debito,
        taxa_pix: taxasEvento.pix,
        taxa_antecipacao: taxasEvento.antecipacao,
      })
      .from(eventos)
      .leftJoin(taxasEvento, eq(eventos.id, taxasEvento.evento_id));
  }

  async criarEvento(input: CriarEventoInput) {
    if (!input || typeof input !== 'object') throw new Error('Dados do evento ausentes ou inválidos.');

    const { nome, data_inicio, data_fim, status, taxas } = input;

    if (typeof nome !== 'string' || !nome.trim()) throw new Error('Nome do evento é obrigatório.');
    if (typeof data_inicio !== 'string' || !validarData(data_inicio)) throw new Error('Data de início inválida.');
    if (typeof data_fim !== 'string' || !validarData(data_fim)) throw new Error('Data de fim inválida.');
    if (!dataEhMenorOuIgual(data_inicio, data_fim)) {
      throw new Error('A data de início não pode ser posterior à data de fim.');
    }

    if (!status || typeof status !== 'string' || !status.trim()) {
      throw new Error('Status do evento é obrigatório.');
    }

    if (!taxas || typeof taxas !== 'object') throw new Error('Taxas do evento são obrigatórias.');

    const chaves = ['dinheiro', 'debito', 'credito', 'pix', 'antecipacao'] as const;
    for (const chave of chaves) {
      const valor = taxas[chave];
      if (typeof valor !== 'string' || !validarValorMonetario(valor)) {
        throw new Error(`Taxa '${chave}' inválida: "${valor}"`);
      }
    }

    const novoEvento: typeof eventos.$inferInsert = {
      nome: nome.trim(),
      data_inicio,
      data_fim,
      status: status.trim(),
    };

    const resultado = await db.insert(eventos).values(novoEvento).returning({ id: eventos.id });

    const eventoCriado = resultado[0];
    if (!eventoCriado || !eventoCriado.id) {
      throw new Error('Erro ao criar evento: retorno inesperado do banco.');
    }

    await db.insert(taxasEvento).values({
      evento_id: eventoCriado.id,
      dinheiro: taxas.dinheiro,
      debito: taxas.debito,
      credito: taxas.credito,
      pix: taxas.pix,
      antecipacao: taxas.antecipacao,
    });

    return eventoCriado;
  }

  async buscarPorId(id: string) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('ID é obrigatório.');

    const [evento] = await db.select().from(eventos).where(eq(eventos.id, id));
    if (!evento) throw new Error('Evento não encontrado.');

    return evento;
  }

  async atualizarEvento(id: string, input: CriarEventoInput) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('ID é obrigatório.');
    if (!input || typeof input !== 'object') throw new Error('Dados do evento ausentes ou inválidos.');

    const { nome, data_inicio, data_fim, status, taxas } = input;

    if (typeof nome !== 'string' || !nome.trim()) throw new Error('Nome do evento é obrigatório.');
    if (typeof data_inicio !== 'string' || !validarData(data_inicio)) throw new Error('Data de início inválida.');
    if (typeof data_fim !== 'string' || !validarData(data_fim)) throw new Error('Data de fim inválida.');
    if (!dataEhMenorOuIgual(data_inicio, data_fim)) {
      throw new Error('A data de início não pode ser posterior à data de fim.');
    }

    if (!status || typeof status !== 'string' || !status.trim()) {
      throw new Error('Status do evento é obrigatório.');
    }

    if (!taxas || typeof taxas !== 'object') throw new Error('Taxas do evento são obrigatórias.');

    const chaves = ['dinheiro', 'debito', 'credito', 'pix', 'antecipacao'] as const;
    for (const chave of chaves) {
      const valor = taxas[chave];
      if (typeof valor !== 'string' || !validarValorMonetario(valor)) {
        throw new Error(`Taxa '${chave}' inválida: "${valor}"`);
      }
    }

    const dadosAtualizados: typeof eventos.$inferInsert = {
      nome: nome.trim(),
      data_inicio,
      data_fim,
      status: status.trim(),
    };

    const resultado = await db
      .update(eventos)
      .set(dadosAtualizados)
      .where(eq(eventos.id, id))
      .returning({ id: eventos.id });

    const eventoAtualizado = resultado[0];
    if (!eventoAtualizado || !eventoAtualizado.id) {
      throw new Error('Erro ao atualizar evento: retorno inesperado do banco.');
    }

    await db.delete(taxasEvento).where(eq(taxasEvento.evento_id, id));

    await db.insert(taxasEvento).values({
      evento_id: id,
      dinheiro: taxas.dinheiro,
      debito: taxas.debito,
      credito: taxas.credito,
      pix: taxas.pix,
      antecipacao: taxas.antecipacao,
    });

    return eventoAtualizado;
  }

  async deletarEvento(id: string) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('ID é obrigatório.');
    await db.delete(eventos).where(eq(eventos.id, id));
    return { message: 'Evento deletado com sucesso' };
  }
}
