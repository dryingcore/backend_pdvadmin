import { db } from '../database/db';
import {
  transacoesDiarias,
  eventoComissionados,
  taxasEvento,
  taxasGatewayEvento,
  taxasGateway as taxasGatewaySchema,
} from '../database/schema';
import { eq } from 'drizzle-orm';

type Modalidade = 'dinheiro' | 'debito' | 'credito' | 'pix';

export class FechamentoEventoService {
  async gerarResumo(eventoId: string) {
    // Coleta dados do banco
    const transacoes = await db.select().from(transacoesDiarias).where(eq(transacoesDiarias.eventoId, eventoId));
    const comissionados = await db.select().from(eventoComissionados).where(eq(eventoComissionados.eventoId, eventoId));
    const [taxasDoEvento] = await db.select().from(taxasEvento).where(eq(taxasEvento.eventoId, eventoId));
    const [taxasGateway] = await db
      .select({
        dinheiro: taxasGatewaySchema.dinheiro,
        debito: taxasGatewaySchema.debito,
        credito: taxasGatewaySchema.credito,
        pix: taxasGatewaySchema.pix,
      })
      .from(taxasGatewayEvento)
      .innerJoin(taxasGatewaySchema, eq(taxasGatewayEvento.taxaId, taxasGatewaySchema.id))
      .where(eq(taxasGatewayEvento.eventoId, eventoId));

    // Agrupa transações por loja
    const porLoja: Record<string, Record<Modalidade, number>> = {};
    for (const t of transacoes) {
      const loja = (porLoja[t.lojaId] ??= { dinheiro: 0, debito: 0, credito: 0, pix: 0 });
      loja.dinheiro += Number(t.dinheiro);
      loja.debito += Number(t.debito);
      loja.credito += Number(t.credito);
      loja.pix += Number(t.pix);
    }

    const percentualComissao = comissionados.reduce((acc, c) => acc + Number(c.percentual), 0) / 100;

    const resultadoFinal: Record<
      string,
      Record<
        Modalidade,
        {
          valor_bruto: number;
          comissao: number;
          apos_comissao: number;
          taxa_evento: number;
          taxa_gateway: number;
          repasse_loja: number;
          lucro_pdvs: number;
        }
      >
    > = {};

    for (const [lojaId, modalidades] of Object.entries(porLoja)) {
      const resultadoPorModalidade = {} as (typeof resultadoFinal)[string];

      for (const mod of ['dinheiro', 'debito', 'credito', 'pix'] as Modalidade[]) {
        const bruto = modalidades[mod];
        if (bruto === 0) {
          resultadoPorModalidade[mod] = {
            valor_bruto: 0,
            comissao: 0,
            apos_comissao: 0,
            taxa_evento: 0,
            taxa_gateway: 0,
            repasse_loja: 0,
            lucro_pdvs: 0,
          };
          continue;
        }

        const comissao = Number((bruto * percentualComissao).toFixed(4));
        const aposComissao = Number((bruto - comissao).toFixed(4));

        const taxaEventoPercent = Number(taxasDoEvento?.[mod] ?? 0) / 100;
        const taxaEvento = Number((aposComissao * taxaEventoPercent).toFixed(4));

        const taxaGatewayPercent = Number(taxasGateway?.[mod] ?? 0) / 100;
        const taxaGateway = Number((taxaEvento * taxaGatewayPercent).toFixed(4));

        const repasseLoja = Number((aposComissao - taxaEvento).toFixed(4));
        const lucroPdvs = Number((taxaEvento - taxaGateway).toFixed(4));

        resultadoPorModalidade[mod] = {
          valor_bruto: bruto,
          comissao,
          apos_comissao: aposComissao,
          taxa_evento: taxaEvento,
          taxa_gateway: taxaGateway,
          repasse_loja: repasseLoja,
          lucro_pdvs: lucroPdvs,
        };
      }

      resultadoFinal[lojaId] = resultadoPorModalidade;
    }

    return resultadoFinal;
  }
}
