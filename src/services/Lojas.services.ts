import { db } from '../database/db';
import { lojas, taxasPersonalizadasLoja } from '../database/schema';
import { eq } from 'drizzle-orm';

export class LojasService {
  async listarTodas() {
    return db.select().from(lojas);
  }

  async buscarPorId(id: string) {
    const [loja] = await db.select().from(lojas).where(eq(lojas.id, id));
    if (!loja) throw new Error('Loja não encontrada');

    if (!loja.usaTaxasPersonalizadas) return loja;

    const [taxas] = await db.select().from(taxasPersonalizadasLoja).where(eq(taxasPersonalizadasLoja.lojaId, id));

    return {
      ...loja,
      taxas_personalizadas: taxas ?? null,
    };
  }

  async criarLoja(data: {
    nome: string;
    numero_documento: string;
    tipo_documento: string;
    whatsapp?: string;
    cep?: string;
    endereco?: string;
    razao_social?: string;
    nome_responsavel?: string;
    chave_pix?: string;
    info_bancaria?: string;
    usa_taxas_personalizadas?: boolean;
    taxas?: {
      dinheiro: string;
      debito: string;
      credito: string;
      pix: string;
      antecipacao: string;
    };
  }) {
    const novaLoja = {
      nome: data.nome,
      numero_documento: data.numero_documento,
      tipo_documento: data.tipo_documento,
      whatsapp: data.whatsapp ?? '',
      cep: data.cep ?? '',
      endereco: data.endereco ?? '',
      razao_social: data.razao_social ?? '',
      nome_responsavel: data.nome_responsavel ?? '',
      chave_pix: data.chave_pix ?? '',
      info_bancaria: data.info_bancaria ?? '',
      usa_taxas_personalizadas: data.usa_taxas_personalizadas ?? false,
    };

    const resultado = await db.insert(lojas).values(novaLoja).returning();
    const lojaCriada = resultado[0];

    if (!lojaCriada || !lojaCriada.id) {
      throw new Error('Erro ao criar loja: retorno inesperado do banco.');
    }

    if (lojaCriada.usaTaxasPersonalizadas) {
      if (!data.taxas) {
        throw new Error('Taxas personalizadas devem ser fornecidas quando usa_taxas_personalizadas é true.');
      }

      await db.insert(taxasPersonalizadasLoja).values({
        lojaId: lojaCriada.id,
        dinheiro: Number(data.taxas.dinheiro),
        debito: Number(data.taxas.debito),
        credito: Number(data.taxas.credito),
        pix: Number(data.taxas.pix),
        antecipacao: Number(data.taxas.antecipacao),
      });
    }

    return lojaCriada;
  }

  async atualizarLoja(
    id: string,
    data: Partial<{
      nome: string;
      numero_documento: string;
      tipo_documento: string;
      whatsapp?: string;
      cep?: string;
      endereco?: string;
      razao_social?: string;
      nome_responsavel?: string;
      chave_pix?: string;
      info_bancaria?: string;
      usa_taxas_personalizadas?: boolean;
    }>,
  ) {
    await db
      .update(lojas)
      .set({ ...data, atualizado_em: new Date() })
      .where(eq(lojas.id, id));

    return this.buscarPorId(id);
  }

  async deletarLoja(id: string) {
    await db.delete(lojas).where(eq(lojas.id, id));
    return { success: true };
  }
}
