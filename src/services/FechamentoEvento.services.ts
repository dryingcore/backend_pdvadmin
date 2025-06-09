import { db } from '../database/db';
import {
  transacoesDiarias,
  eventoComissionados,
  taxasEvento,
  taxasGatewayEvento,
  taxasGateway,
} from '../database/schema';
import { eq } from 'drizzle-orm';

export class FechamentoEventoService {
  async gerarResumo(eventoId: string) {
    const transacoes = await db.select().from(transacoesDiarias).where(eq(transacoesDiarias.eventoId, eventoId));

    const comissionados = await db.select().from(eventoComissionados).where(eq(eventoComissionados.eventoId, eventoId));

    const [taxasPdvs] = await db.select().from(taxasEvento).where(eq(taxasEvento.eventoId, eventoId));

    const [taxasStone] = await db
      .select({
        dinheiro: taxasGateway.dinheiro,
        debito: taxasGateway.debito,
        credito: taxasGateway.credito,
        pix: taxasGateway.pix,
      })
      .from(taxasGatewayEvento)
      .innerJoin(taxasGateway, eq(taxasGatewayEvento.taxaId, taxasGateway.id))
      .where(eq(taxasGatewayEvento.eventoId, eventoId));

    const porLoja: Record<string, any> = {};
    let totalGeral = 0;

    for (const t of transacoes) {
      const loja = (porLoja[t.lojaId] ??= { dinheiro: 0, debito: 0, credito: 0, pix: 0 });
      loja.dinheiro += Number(t.dinheiro);
      loja.debito += Number(t.debito);
      loja.credito += Number(t.credito);
      loja.pix += Number(t.pix);
      totalGeral += Number(t.dinheiro) + Number(t.debito) + Number(t.credito) + Number(t.pix);
    }

    // Comissionamento
    const totalComissoes = comissionados.reduce((total, c) => total + totalGeral * (Number(c.percentual) / 100), 0);

    const repassePdvsBruto = totalGeral - totalComissoes;

    const totalTaxasPdvs = calcularTaxasTotais(porLoja, taxasPdvs);
    const repassePdvsLiquido = repassePdvsBruto - totalTaxasPdvs;

    const totalTaxasStone = calcularTaxasTotais(porLoja, taxasStone);

    const lucroPdvs = repassePdvsLiquido - totalTaxasStone;

    return {
      total_geral: totalGeral,
      total_comissoes: totalComissoes,
      repasse_pdvs_bruto: repassePdvsBruto,
      total_taxas_pdvs: totalTaxasPdvs,
      repasse_pdvs_liquido: repassePdvsLiquido,
      total_taxas_stone: totalTaxasStone,
      lucro_pdvs: lucroPdvs,
      por_loja: porLoja,
    };
  }
}

// Soma o total das taxas por modalidade
function calcularTaxasTotais(lojas: Record<string, any>, taxas: any) {
  return Object.values(lojas).reduce((acc, loja) => {
    return (
      acc +
      loja.dinheiro * (Number(taxas?.dinheiro ?? 0) / 100) +
      loja.debito * (Number(taxas?.debito ?? 0) / 100) +
      loja.credito * (Number(taxas?.credito ?? 0) / 100) +
      loja.pix * (Number(taxas?.pix ?? 0) / 100)
    );
  }, 0);
}
