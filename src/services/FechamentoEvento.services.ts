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

    const percentualComissaoTotal = comissionados.reduce((soma, c) => soma + Number(c.percentual), 0);
    const fatorComissao = 1 - percentualComissaoTotal / 100;

    const porLoja: Record<string, any> = {};
    let totalGeral = 0;
    let totalComissoes = 0;
    let totalTaxasPdvs = 0;
    let totalTaxasStone = 0;
    let lucroPdvs = 0;

    const repassePorLoja: Record<string, number> = {};

    for (const t of transacoes) {
      const loja = (porLoja[t.lojaId] ??= { dinheiro: 0, debito: 0, credito: 0, pix: 0 });

      // Valores brutos
      const bruto = {
        dinheiro: Number(t.dinheiro),
        debito: Number(t.debito),
        credito: Number(t.credito),
        pix: Number(t.pix),
      };

      // Soma total geral
      const totalLoja = bruto.dinheiro + bruto.debito + bruto.credito + bruto.pix;
      totalGeral += totalLoja;

      // Valor com comissão aplicada
      const aposComissao = {
        dinheiro: bruto.dinheiro * fatorComissao,
        debito: bruto.debito * fatorComissao,
        credito: bruto.credito * fatorComissao,
        pix: bruto.pix * fatorComissao,
      };

      totalComissoes += totalLoja * (percentualComissaoTotal / 100);

      // Taxas PDV por modalidade
      const taxasPdvsLoja =
        (aposComissao.dinheiro * (Number(taxasPdvs?.dinheiro) || 0)) / 100 +
        (aposComissao.debito * (Number(taxasPdvs?.debito) || 0)) / 100 +
        (aposComissao.credito * (Number(taxasPdvs?.credito) || 0)) / 100 +
        (aposComissao.pix * (Number(taxasPdvs?.pix) || 0)) / 100;

      totalTaxasPdvs += taxasPdvsLoja;

      const valorPosTaxasPdvs =
        aposComissao.dinheiro + aposComissao.debito + aposComissao.credito + aposComissao.pix - taxasPdvsLoja;

      repassePorLoja[t.lojaId] = valorPosTaxasPdvs;

      // Taxas Stone
      const taxasStoneLoja =
        (aposComissao.dinheiro * (Number(taxasStone?.dinheiro) || 0)) / 100 +
        (aposComissao.debito * (Number(taxasStone?.debito) || 0)) / 100 +
        (aposComissao.credito * (Number(taxasStone?.credito) || 0)) / 100 +
        (aposComissao.pix * (Number(taxasStone?.pix) || 0)) / 100;

      totalTaxasStone += taxasStoneLoja;

      // Lucro PDV: valor PDV (antes Stone) - taxas Stone
      lucroPdvs += valorPosTaxasPdvs - taxasStoneLoja;

      // Atualiza o acumulado por loja (bruto)
      loja.dinheiro += bruto.dinheiro;
      loja.debito += bruto.debito;
      loja.credito += bruto.credito;
      loja.pix += bruto.pix;
    }

    const repassePdvsBruto = totalGeral - totalComissoes;
    const repassePdvsLiquido = repassePdvsBruto - totalTaxasPdvs;

    return {
      total_geral: totalGeral,
      total_comissionados: totalComissoes,
      repasse_pdvs_bruto: repassePdvsBruto,
      total_taxas_pdvs: totalTaxasPdvs,
      repasse_pdvs_liquido: repassePdvsLiquido,
      total_taxas_stone: totalTaxasStone,
      lucro_pdvs: lucroPdvs,
      repasse_loja: repassePorLoja,
      por_loja: porLoja,
    };
  }
}
