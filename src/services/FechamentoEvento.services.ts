import { db } from '../database/db';
import {
  transacoesDiarias,
  eventoComissionados,
  taxasEvento,
  taxasGatewayEvento,
  taxasGateway as taxasGatewaySchema,
  taxasPersonalizadasLoja,
  eventoLojas,
  lojas,
} from '../database/schema';
import { eq, inArray } from 'drizzle-orm';

type Modalidade = 'dinheiro' | 'debito' | 'credito' | 'pix';
type Taxas = Partial<Record<Modalidade, number>>;

export class FechamentoEventoService {
  async gerarResumo(eventoId: string) {
    const transacoes = await db.select().from(transacoesDiarias).where(eq(transacoesDiarias.eventoId, eventoId));

    const comissionados = await db.select().from(eventoComissionados).where(eq(eventoComissionados.eventoId, eventoId));

    const [taxasDoEventoRow] = await db.select().from(taxasEvento).where(eq(taxasEvento.eventoId, eventoId));

    const taxasDoEvento: Taxas = {
      dinheiro: Number(taxasDoEventoRow?.dinheiro ?? 0),
      debito: Number(taxasDoEventoRow?.debito ?? 0),
      credito: Number(taxasDoEventoRow?.credito ?? 0),
      pix: Number(taxasDoEventoRow?.pix ?? 0),
    };

    const taxaAntecipacaoEvento = Number(taxasDoEventoRow?.antecipacao ?? 0);

    const [taxasGateway] = await db
      .select({
        dinheiro: taxasGatewaySchema.dinheiro,
        debito: taxasGatewaySchema.debito,
        credito: taxasGatewaySchema.credito,
        pix: taxasGatewaySchema.pix,
        antecipacao: taxasGatewaySchema.antecipacao,
      })
      .from(taxasGatewayEvento)
      .innerJoin(taxasGatewaySchema, eq(taxasGatewayEvento.taxaId, taxasGatewaySchema.id))
      .where(eq(taxasGatewayEvento.eventoId, eventoId));

    const porLoja: Record<string, Record<Modalidade, number>> = {};
    for (const t of transacoes) {
      const loja = (porLoja[t.lojaId] ??= { dinheiro: 0, debito: 0, credito: 0, pix: 0 });
      loja.dinheiro += Number(t.dinheiro);
      loja.debito += Number(t.debito);
      loja.credito += Number(t.credito);
      loja.pix += Number(t.pix);
    }

    const lojaIds = Object.keys(porLoja);

    const lojasInfo = await db
      .select({
        id: lojas.id,
        nome: lojas.nome,
        usaTaxasPersonalizadas: lojas.usaTaxasPersonalizadas,
      })
      .from(lojas)
      .where(inArray(lojas.id, lojaIds));

    const taxasPersonalizadas = await db
      .select()
      .from(taxasPersonalizadasLoja)
      .where(inArray(taxasPersonalizadasLoja.lojaId, lojaIds));

    const taxasPorLoja: Record<string, Taxas & { antecipacao?: number }> = {};
    for (const taxa of taxasPersonalizadas) {
      taxasPorLoja[taxa.lojaId] = {
        dinheiro: Number(taxa.dinheiro),
        debito: Number(taxa.debito),
        credito: Number(taxa.credito),
        pix: Number(taxa.pix),
        antecipacao: Number(taxa.antecipacao ?? 0),
      };
    }

    const antecipacoes = await db
      .select({
        lojaId: eventoLojas.lojaId,
        haveraAntecipacao: eventoLojas.haveraAntecipacao,
      })
      .from(eventoLojas)
      .where(eq(eventoLojas.eventoId, eventoId));

    const antecipacaoPorLoja: Record<string, boolean> = {};
    for (const a of antecipacoes) {
      antecipacaoPorLoja[a.lojaId] = a.haveraAntecipacao;
    }

    const lojaConfigs: Record<string, { nome: string; usaTaxasPersonalizadas: boolean }> = {};
    for (const loja of lojasInfo) {
      lojaConfigs[loja.id] = {
        nome: loja.nome,
        usaTaxasPersonalizadas: loja.usaTaxasPersonalizadas,
      };
    }

    const percentualComissao = comissionados.reduce((acc, c) => acc + Number(c.percentual), 0) / 100;

    const resultadoFinal: Record<
      string,
      {
        nome: string;
        modalidades: Record<
          Modalidade,
          {
            valor_bruto: number;
            comissao: number;
            taxa_evento: number;
            taxa_gateway: number;
            repasse_loja: number;
            lucro_pdvs: number;
          }
        >;
      }
    > = {};

    for (const [lojaId, modalidades] of Object.entries(porLoja)) {
      const resultadoPorModalidade = {} as Record<
        Modalidade,
        {
          valor_bruto: number;
          comissao: number;
          taxa_evento: number;
          taxa_gateway: number;
          repasse_loja: number;
          lucro_pdvs: number;
        }
      >;

      const lojaCfg = lojaConfigs[lojaId];
      const usaTaxasPersonalizadas = lojaCfg?.usaTaxasPersonalizadas ?? false;
      const antecipar = antecipacaoPorLoja[lojaId] ?? false;
      const taxasLoja = taxasPorLoja[lojaId] ?? {};

      for (const mod of ['dinheiro', 'debito', 'credito', 'pix'] as Modalidade[]) {
        const bruto = modalidades[mod];
        if (bruto === 0) {
          resultadoPorModalidade[mod] = {
            valor_bruto: 0,
            comissao: 0,
            taxa_evento: 0,
            taxa_gateway: 0,
            repasse_loja: 0,
            lucro_pdvs: 0,
          };
          continue;
        }

        // Comissão sobre o bruto
        const comissao = Number((bruto * percentualComissao).toFixed(4));

        // Taxa do evento sobre o bruto
        let taxaEventoPercent = 0;
        if (mod === 'credito') {
          if (antecipar) {
            taxaEventoPercent = usaTaxasPersonalizadas
              ? ((taxasLoja.credito ?? 0) + (taxasLoja.antecipacao ?? 0)) / 100
              : ((taxasDoEvento.credito ?? 0) + (taxaAntecipacaoEvento ?? 0)) / 100;
          } else {
            taxaEventoPercent = usaTaxasPersonalizadas
              ? (taxasLoja.credito ?? 0) / 100
              : (taxasDoEvento.credito ?? 0) / 100;
          }
        } else {
          taxaEventoPercent = usaTaxasPersonalizadas ? (taxasLoja[mod] ?? 0) / 100 : (taxasDoEvento[mod] ?? 0) / 100;
        }

        const taxaEvento = Number((bruto * taxaEventoPercent).toFixed(4));

        // Taxa gateway sobre a taxa do evento
        let taxaGatewayPercent = 0;
        if (mod === 'credito' && antecipar) {
          const taxaCredito = Number(taxasGateway?.credito ?? 0);
          const taxaAntecipacao = Number(taxasGateway?.antecipacao ?? 0);
          taxaGatewayPercent = (taxaCredito + taxaAntecipacao) / 100;
        } else {
          taxaGatewayPercent = Number(taxasGateway?.[mod] ?? 0) / 100;
        }

        const taxaGateway = Number((taxaEvento * taxaGatewayPercent).toFixed(4));

        // Repasse final = bruto - comissão - taxa evento
        const repasseLoja = Number((bruto - comissao - taxaEvento).toFixed(4));
        const lucroPdvs = Number((taxaEvento - taxaGateway).toFixed(4));

        resultadoPorModalidade[mod] = {
          valor_bruto: bruto,
          comissao,
          taxa_evento: taxaEvento,
          taxa_gateway: taxaGateway,
          repasse_loja: repasseLoja,
          lucro_pdvs: lucroPdvs,
        };
      }

      resultadoFinal[lojaId] = {
        nome: lojaCfg?.nome ?? 'Loja desconhecida',
        modalidades: resultadoPorModalidade,
      };
    }

    return resultadoFinal;
  }
}
