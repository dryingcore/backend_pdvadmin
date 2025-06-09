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
    const transacoes = await db
      .select()
      .from(transacoesDiarias)
      .where(eq(transacoesDiarias.eventoId, eventoId));

    const comissionados = await db
      .select()
      .from(eventoComissionados)
      .where(eq(eventoComissionados.eventoId, eventoId));

    const [taxasPdvs] = await db
      .select()
      .from(taxasEvento)
      .where(eq(taxasEvento.eventoId, eventoId));

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

    const porLoja: Record<string, { dinheiro: number; debito: number; credito: number; pix: number }> = {};
    let totalGeral = 0;

    for (const t of transacoes) {
      const loja = (porLoja[t.lojaId] ??= {
        dinheiro: 0,
        debito: 0,
        credito: 0,
        pix: 0,
      });

      loja.dinheiro += Number(t.dinheiro);
      loja.debito += Number(t.debito);
      loja.credito += Number(t.credito);
      loja.pix += Number(t.pix);

      totalGeral +=
        Number(t.dinheiro) + Number(t.debito) + Number(t.credito) + Number(t.pix);
    }

    const percentualComissaoTotal = comissionados.reduce(
      (total, c) => total + Number(c.percentual),
      0,
    );
    const fatorComissao = 1 - percentualComissaoTotal / 100;
    const totalComissoes = totalGeral * (percentualComissaoTotal / 100);

    const repassePorLoja: Record<
      string,
      { dinheiro: number; debito: number; credito: number; pix: number; total: number }
    > = {};

    const totalTaxasPdvsPorModalidade = { dinheiro: 0, debito: 0, credito: 0, pix: 0 };
    const totalTaxasStonePorModalidade = { dinheiro: 0, debito: 0, credito: 0, pix: 0 };

    for (const [lojaId, loja] of Object.entries(porLoja)) {
      const aposComissao = {
        dinheiro: loja.dinheiro * fatorComissao,
        debito: loja.debito * fatorComissao,
        credito: loja.credito * fatorComissao,
        pix: loja.pix * fatorComissao,
      };

      const taxasPdvsLoja = {
        dinheiro: aposComissao.dinheiro * (Number(taxasPdvs?.dinheiro ?? 0) / 100),
        debito: aposComissao.debito * (Number(taxasPdvs?.debito ?? 0) / 100),
        credito: aposComissao.credito * (Number(taxasPdvs?.credito ?? 0) / 100),
        pix: aposComissao.pix * (Number(taxasPdvs?.pix ?? 0) / 100),
      };

      totalTaxasPdvsPorModalidade.dinheiro += taxasPdvsLoja.dinheiro;
      totalTaxasPdvsPorModalidade.debito += taxasPdvsLoja.debito;
      totalTaxasPdvsPorModalidade.credito += taxasPdvsLoja.credito;
      totalTaxasPdvsPorModalidade.pix += taxasPdvsLoja.pix;

      const repasse = {
        dinheiro: aposComissao.dinheiro - taxasPdvsLoja.dinheiro,
        debito: aposComissao.debito - taxasPdvsLoja.debito,
        credito: aposComissao.credito - taxasPdvsLoja.credito,
        pix: aposComissao.pix - taxasPdvsLoja.pix,
      };

      repassePorLoja[lojaId] = {
        ...repasse,
        total: repasse.dinheiro + repasse.debito + repasse.credito + repasse.pix,
      };

      const taxasStoneLoja = {
        dinheiro: aposComissao.dinheiro * (Number(taxasStone?.dinheiro ?? 0) / 100),
        debito: aposComissao.debito * (Number(taxasStone?.debito ?? 0) / 100),
        credito: aposComissao.credito * (Number(taxasStone?.credito ?? 0) / 100),
        pix: aposComissao.pix * (Number(taxasStone?.pix ?? 0) / 100),
      };

      totalTaxasStonePorModalidade.dinheiro += taxasStoneLoja.dinheiro;
      totalTaxasStonePorModalidade.debito += taxasStoneLoja.debito;
      totalTaxasStonePorModalidade.credito += taxasStoneLoja.credito;
      totalTaxasStonePorModalidade.pix += taxasStoneLoja.pix;
    }

    const repassePdvsBruto = totalGeral - totalComissoes;

    const totalTaxasPdvs =
      totalTaxasPdvsPorModalidade.dinheiro +
      totalTaxasPdvsPorModalidade.debito +
      totalTaxasPdvsPorModalidade.credito +
      totalTaxasPdvsPorModalidade.pix;

    const repassePdvsLiquido = repassePdvsBruto - totalTaxasPdvs;

    const totalTaxasStone =
      totalTaxasStonePorModalidade.dinheiro +
      totalTaxasStonePorModalidade.debito +
      totalTaxasStonePorModalidade.credito +
      totalTaxasStonePorModalidade.pix;

    const lucroPdvs = totalTaxasPdvs - totalTaxasStone;

    return {
      total_geral: totalGeral,
      total_comissoes: totalComissoes,
      repasse_pdvs_bruto: repassePdvsBruto,
      total_taxas_pdvs: totalTaxasPdvs,
      repasse_pdvs_liquido: repassePdvsLiquido,
      descricao_repasse_pdvs: 'Repasse às lojas = Total Geral - Total de Comissões - Taxas do PDV',
      formula_repasse_pdvs: '(total_geral - total_comissoes) - total_taxas_pdvs',
      total_taxas_stone: totalTaxasStone,
      lucro_pdvs: lucroPdvs,
      repasse_loja: repassePorLoja,
      por_loja: porLoja,
    };
  }
}
