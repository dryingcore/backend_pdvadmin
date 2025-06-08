import { db } from '../database/db';
import { taxasGateway } from '../database/schema';
import { eq } from 'drizzle-orm';

export interface CriarTaxaGatewayInput {
  gateway: string;
  debito: string;
  credito: string;
  pix: string;
  dinheiro: string;
  antecipacao: string;
}

export class TaxasPorGatewayService {
  async listarTodos() {
    return db.select().from(taxasGateway);
  }

  async buscarPorGateway(gateway: string) {
    const [resultado] = await db.select().from(taxasGateway).where(eq(taxasGateway.gateway, gateway));
    return resultado;
  }

  async criarTaxa(data: CriarTaxaGatewayInput) {
    const [existe] = await db.select().from(taxasGateway).where(eq(taxasGateway.gateway, data.gateway));

    if (existe) {
      throw new Error(`Já existe uma taxa para o gateway "${data.gateway}".`);
    }

    const [inserido] = await db
      .insert(taxasGateway)
      .values({
        gateway: data.gateway,
        debito: data.debito,
        credito: data.credito,
        pix: data.pix,
        dinheiro: data.dinheiro,
        antecipacao: data.antecipacao,
      })
      .returning();

    return inserido;
  }
}
