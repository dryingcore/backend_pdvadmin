import { db } from '../database/db';
import { eventos, taxasEvento, eventoLojas } from '../database/schema';
import { eq } from 'drizzle-orm';
import { validarData, validarValorMonetario, dataEhMenorOuIgual } from '../helpers/Validacao.helpers';

interface LojaEventoInput {
  id: string;
  havera_antecipacao?: boolean;
}

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
  lojas: LojaEventoInput[];
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
        dataInicio: eventos.dataInicio,
        dataFim: eventos.dataFim,
        status: eventos.status,
        criadoEm: eventos.criadoEm,
        atualizadoEm: eventos.atualizadoEm,
        taxaCredito: taxasEvento.credito,
        taxaDebito: taxasEvento.debito,
        taxaPix: taxasEvento.pix,
        taxaAntecipacao: taxasEvento.antecipacao,
      })
      .from(eventos)
      .leftJoin(taxasEvento, eq(eventos.id, taxasEvento.eventoId));
  }

  async listarComTaxasPorId(id: string) {
    const resultado = await db
      .select({
        id: eventos.id,
        nome: eventos.nome,
        data_inicio: eventos.dataInicio,
        data_fim: eventos.dataFim,
        status: eventos.status,
        criado_em: eventos.criadoEm,
        atualizado_em: eventos.atualizadoEm,
        taxas: {
          credito: taxasEvento.credito,
          debito: taxasEvento.debito,
          pix: taxasEvento.pix,
          antecipacao: taxasEvento.antecipacao,
          dinheiro: taxasEvento.dinheiro,
        },
      })
      .from(eventos)
      .leftJoin(taxasEvento, eq(eventos.id, taxasEvento.eventoId))
      .where(eq(eventos.id, id));

    return resultado[0];
  }

  async criarEvento(input: CriarEventoInput) {
    if (!input || typeof input !== 'object') throw new Error('Dados do evento ausentes ou inválidos.');

    const { nome, data_inicio, data_fim, status, taxas, lojas } = input;

    // Validações
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
    if (!Array.isArray(lojas) || lojas.length === 0) {
      throw new Error('Pelo menos uma loja deve ser vinculada ao evento.');
    }

    const chaves = ['dinheiro', 'debito', 'credito', 'pix', 'antecipacao'] as const;
    for (const chave of chaves) {
      const valor = taxas[chave];
      if (typeof valor !== 'string' || !validarValorMonetario(valor)) {
        throw new Error(`Taxa '${chave}' inválida: "${valor}"`);
      }
    }

    // Transação completa
    return await db.transaction(async trx => {
      // 1. Criar evento
      const [evento] = await trx
        .insert(eventos)
        .values({
          nome: nome.trim(),
          dataInicio: data_inicio,
          dataFim: data_fim,
          status: status.trim(),
        })
        .returning({ id: eventos.id });

      if (!evento?.id) throw new Error('Erro ao criar evento.');

      // 2. Inserir taxas
      await trx.insert(taxasEvento).values({
        eventoId: evento.id,
        dinheiro: taxas.dinheiro,
        debito: taxas.debito,
        credito: taxas.credito,
        pix: taxas.pix,
        antecipacao: taxas.antecipacao,
      });

      // 3. Inserir lojas no evento
      const lojasEvento = lojas.map(loja => ({
        eventoId: evento.id,
        lojaId: loja.id,
        haveraAntecipacao: Boolean(loja.havera_antecipacao),
      }));

      await trx.insert(eventoLojas).values(lojasEvento);

      return evento;
    });
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

    const { nome, data_inicio, data_fim, status, taxas, lojas } = input;

    // Validações
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
    if (!Array.isArray(lojas) || lojas.length === 0) {
      throw new Error('Pelo menos uma loja deve ser vinculada ao evento.');
    }

    const chaves = ['dinheiro', 'debito', 'credito', 'pix', 'antecipacao'] as const;
    for (const chave of chaves) {
      const valor = taxas[chave];
      if (typeof valor !== 'string' || !validarValorMonetario(valor)) {
        throw new Error(`Taxa '${chave}' inválida: "${valor}"`);
      }
    }

    // Transação completa
    return await db.transaction(async trx => {
      // Atualizar evento
      const [evento] = await trx
        .update(eventos)
        .set({
          nome: nome.trim(),
          dataInicio: data_inicio,
          dataFim: data_fim,
          status: status.trim(),
        })
        .where(eq(eventos.id, id))
        .returning({ id: eventos.id });

      if (!evento?.id) throw new Error('Erro ao atualizar evento.');

      // Atualizar taxas
      await trx.delete(taxasEvento).where(eq(taxasEvento.eventoId, id));
      await trx.insert(taxasEvento).values({
        eventoId: id,
        dinheiro: taxas.dinheiro,
        debito: taxas.debito,
        credito: taxas.credito,
        pix: taxas.pix,
        antecipacao: taxas.antecipacao,
      });

      // Atualizar lojas vinculadas
      await trx.delete(eventoLojas).where(eq(eventoLojas.eventoId, id));

      const lojasEvento = lojas.map(loja => ({
        eventoId: id,
        lojaId: loja.id,
        haveraAntecipacao: Boolean(loja.havera_antecipacao),
      }));

      await trx.insert(eventoLojas).values(lojasEvento);

      return evento;
    });
  }

  async deletarEvento(id: string) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('ID é obrigatório.');
    await db.delete(eventos).where(eq(eventos.id, id));
    return { message: 'Evento deletado com sucesso' };
  }
}
