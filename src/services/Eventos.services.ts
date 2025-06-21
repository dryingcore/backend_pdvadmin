import { db } from '../database/db';
import {
  eventos,
  taxasEvento,
  eventoLojas,
  eventoComissionados,
  taxasPersonalizadasLoja,
  comissionados,
  lojas,
  taxasGatewayEvento,
  eventoLojaComissionado,
  taxasGateway,
  transacoesDiarias,
} from '../database/schema';
import { eq, inArray } from 'drizzle-orm';
import { validarData, validarValorMonetario, dataEhMenorOuIgual } from '../helpers/Validacao.helpers';
import { gerarIntervaloDeDatas } from '../helpers/GerarIntervaloDeDias';

interface LojaEventoInput {
  id: string;
  havera_antecipacao?: boolean;
}

interface ComissionadoEventoInput {
  id: string;
  percentual: string;
  porLoja?: Record<string, string>; // <- em vez de number
}

interface TaxasPorGatewayInput {
  id: string;
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
  lojas: { id: string; havera_antecipacao?: boolean }[];
  comissionados: ComissionadoEventoInput[];
  taxas_por_gateway?: { id: string };
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

  async getEventoCompleto(id: string) {
    if (!id) throw new Error('ID do evento é obrigatório');

    const [eventoBase] = await db
      .select({
        id: eventos.id,
        nome: eventos.nome,
        data_inicio: eventos.dataInicio,
        data_fim: eventos.dataFim,
        status: eventos.status,
        taxas_evento: {
          dinheiro: taxasEvento.dinheiro,
          debito: taxasEvento.debito,
          credito: taxasEvento.credito,
          pix: taxasEvento.pix,
          antecipacao: taxasEvento.antecipacao,
        },
      })
      .from(eventos)
      .leftJoin(taxasEvento, eq(eventos.id, taxasEvento.eventoId))
      .where(eq(eventos.id, id));

    if (!eventoBase) throw new Error('Evento não encontrado');

    const lojasRelacionadas = await db
      .select({
        id: eventoLojas.lojaId,
        nome: lojas.nome,
        havera_antecipacao: eventoLojas.haveraAntecipacao,
        usa_taxas_personalizadas: lojas.usaTaxasPersonalizadas,
      })
      .from(eventoLojas)
      .innerJoin(lojas, eq(eventoLojas.lojaId, lojas.id))
      .where(eq(eventoLojas.eventoId, id));

    const lojasIds = lojasRelacionadas.map(loja => loja.id);

    const taxasDasLojas = await db
      .select({
        lojaId: taxasPersonalizadasLoja.lojaId,
        dinheiro: taxasPersonalizadasLoja.dinheiro,
        debito: taxasPersonalizadasLoja.debito,
        credito: taxasPersonalizadasLoja.credito,
        pix: taxasPersonalizadasLoja.pix,
        antecipacao: taxasPersonalizadasLoja.antecipacao,
      })
      .from(taxasPersonalizadasLoja)
      .where(inArray(taxasPersonalizadasLoja.lojaId, lojasIds));

    const taxasMapeadas = new Map(
      taxasDasLojas.map(taxa => [
        taxa.lojaId,
        {
          dinheiro: taxa.dinheiro,
          debito: taxa.debito,
          credito: taxa.credito,
          pix: taxa.pix,
          antecipacao: taxa.antecipacao,
        },
      ]),
    );

    const comissionadosDoEvento = await db
      .select({
        id: comissionados.id,
        nome: comissionados.nome,
        percentual: eventoComissionados.percentual,
      })
      .from(eventoComissionados)
      .innerJoin(comissionados, eq(eventoComissionados.comissionadoId, comissionados.id))
      .where(eq(eventoComissionados.eventoId, id));

    const comissoesPersonalizadas = await db
      .select({
        lojaId: eventoLojaComissionado.lojaId,
        comissionadoId: eventoLojaComissionado.comissionadoId,
        percentual_customizado: eventoLojaComissionado.percentualCustomizado,
      })
      .from(eventoLojaComissionado)
      .where(eq(eventoLojaComissionado.eventoId, id));

    const [taxaPorGateway] = await db
      .select({
        id: taxasGateway.id,
        gateway: taxasGateway.gateway,
        dinheiro: taxasGateway.dinheiro,
        debito: taxasGateway.debito,
        credito: taxasGateway.credito,
        pix: taxasGateway.pix,
        antecipacao: taxasGateway.antecipacao,
      })
      .from(taxasGatewayEvento)
      .innerJoin(taxasGateway, eq(taxasGatewayEvento.taxaId, taxasGateway.id))
      .where(eq(taxasGatewayEvento.eventoId, id));

    return {
      id: eventoBase.id,
      nome: eventoBase.nome,
      data_inicio: eventoBase.data_inicio,
      data_fim: eventoBase.data_fim,
      status: eventoBase.status,
      taxas_evento: eventoBase.taxas_evento,
      taxa_por_gateway: taxaPorGateway ?? null,
      lojas: lojasRelacionadas.map(loja => ({
        id: loja.id,
        nome: loja.nome,
        havera_antecipacao: loja.havera_antecipacao,
        taxas_personalizadas: loja.usa_taxas_personalizadas ? taxasMapeadas.get(loja.id) : undefined,
      })),
      comissionados: comissionadosDoEvento,
      loja_comissionados: comissoesPersonalizadas, // ✅ novo campo incluído
    };
  }

  async criarEvento(input: CriarEventoInput) {
    if (!input || typeof input !== 'object') throw new Error('Dados do evento ausentes ou inválidos.');

    const { nome, data_inicio, data_fim, status, taxas, lojas, comissionados, taxas_por_gateway } = input;

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

    if (!Array.isArray(comissionados)) throw new Error('Lista de comissionados inválida.');
    for (const com of comissionados) {
      if (typeof com.id !== 'string' || !com.id.trim() || typeof com.percentual !== 'string') {
        throw new Error(`Comissionado inválido: ${JSON.stringify(com)}`);
      }
    }

    if (
      taxas_por_gateway &&
      (typeof taxas_por_gateway !== 'object' ||
        typeof taxas_por_gateway.id !== 'string' ||
        !taxas_por_gateway.id.trim())
    ) {
      throw new Error('Taxa por gateway inválida.');
    }

    return await db.transaction(async trx => {
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

      await trx.insert(taxasEvento).values({
        eventoId: evento.id,
        dinheiro: taxas.dinheiro,
        debito: taxas.debito,
        credito: taxas.credito,
        pix: taxas.pix,
        antecipacao: taxas.antecipacao,
      });

      const lojasEvento = lojas.map(loja => ({
        eventoId: evento.id,
        lojaId: loja.id,
        haveraAntecipacao: Boolean(loja.havera_antecipacao),
      }));
      await trx.insert(eventoLojas).values(lojasEvento);

      const comissionadosEvento = comissionados.map(com => ({
        eventoId: evento.id,
        comissionadoId: com.id,
        percentual: com.percentual.toString(),
      }));
      await trx.insert(eventoComissionados).values(comissionadosEvento);

      for (const com of comissionados) {
        const porLoja = com.porLoja ?? {};
        const personalizados = Object.entries(porLoja).map(([lojaId, percentual]) => ({
          eventoId: evento.id,
          lojaId,
          comissionadoId: com.id,
          percentualCustomizado: percentual,
        }));

        if (personalizados.length > 0) {
          await trx.insert(eventoLojaComissionado).values(personalizados);
        }
      }

      if (taxas_por_gateway) {
        await trx.insert(taxasGatewayEvento).values({
          eventoId: evento.id,
          taxaId: taxas_por_gateway.id,
        });
      }

      const dias = gerarIntervaloDeDatas(data_inicio, data_fim);
      const transacoesZeradas = dias.flatMap(data =>
        lojas.map(loja => ({
          eventoId: evento.id,
          lojaId: loja.id,
          dataTransacao: data,
          dinheiro: '0.00',
          debito: '0.00',
          credito: '0.00',
          pix: '0.00',
          status: 'pendente',
        })),
      );
      await trx.insert(transacoesDiarias).values(transacoesZeradas);

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

    const { nome, data_inicio, data_fim, status, taxas, lojas, comissionados } = input;

    if (typeof nome !== 'string' || !nome.trim()) throw new Error('Nome do evento é obrigatório.');
    if (typeof data_inicio !== 'string' || !validarData(data_inicio)) throw new Error('Data de início inválida.');
    if (typeof data_fim !== 'string' || !validarData(data_fim)) throw new Error('Data de fim inválida.');
    if (!dataEhMenorOuIgual(data_inicio, data_fim)) {
      throw new Error('A data de início não pode ser posterior à data de fim.');
    }

    if (!status || typeof status !== 'string' || !status.trim()) {
      throw new Error('Status do evento é obrigatório.');
    }

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

    if (!Array.isArray(comissionados)) throw new Error('Lista de comissionados inválida.');

    const comissionadosValidados = comissionados.map(com => {
      const percentual = Number(com.percentual);

      if (typeof com.id !== 'string' || !com.id.trim() || isNaN(percentual) || percentual < 0 || percentual > 100) {
        throw new Error(`Comissionado inválido: ${JSON.stringify(com)}`);
      }

      if (com.porLoja && Object.keys(com.porLoja).length === 0) {
        delete com.porLoja;
      }

      return {
        eventoId: id,
        comissionadoId: com.id,
        percentual: percentual.toString(),
      };
    });

    return await db.transaction(async trx => {
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

      await trx.delete(taxasEvento).where(eq(taxasEvento.eventoId, id));
      await trx.insert(taxasEvento).values({
        eventoId: id,
        dinheiro: taxas.dinheiro,
        debito: taxas.debito,
        credito: taxas.credito,
        pix: taxas.pix,
        antecipacao: taxas.antecipacao,
      });

      await trx.delete(eventoLojas).where(eq(eventoLojas.eventoId, id));
      const lojasEvento = lojas.map(loja => ({
        eventoId: id,
        lojaId: loja.id,
        haveraAntecipacao: Boolean(loja.havera_antecipacao),
      }));
      await trx.insert(eventoLojas).values(lojasEvento);

      await trx.delete(eventoComissionados).where(eq(eventoComissionados.eventoId, id));
      await trx.insert(eventoComissionados).values(comissionadosValidados);

      // ✅ INSERIR TRANSAÇÕES DIÁRIAS ZERADAS PARA NOVAS LOJAS
      const dias = gerarIntervaloDeDatas(data_inicio, data_fim);

      const transacoesExistentes = await trx
        .selectDistinct({ lojaId: transacoesDiarias.lojaId })
        .from(transacoesDiarias)
        .where(eq(transacoesDiarias.eventoId, id));

      const lojasComTransacao = new Set(transacoesExistentes.map(t => t.lojaId));

      const novasTransacoes = dias.flatMap(data =>
        lojas
          .filter(loja => !lojasComTransacao.has(loja.id))
          .map(loja => ({
            eventoId: id,
            lojaId: loja.id,
            dataTransacao: data,
            dinheiro: '0.00',
            debito: '0.00',
            credito: '0.00',
            pix: '0.00',
            status: 'pendente',
          })),
      );

      if (novasTransacoes.length > 0) {
        await trx.insert(transacoesDiarias).values(novasTransacoes);
      }

      return evento;
    });
  }

  async deletarEvento(id: string) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('ID é obrigatório.');
    await db.delete(eventos).where(eq(eventos.id, id));
    return { message: 'Evento deletado com sucesso' };
  }
}
