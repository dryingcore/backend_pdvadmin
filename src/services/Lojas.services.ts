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
      numeroDocumento: data.numero_documento,
      tipoDocumento: data.tipo_documento,
      whatsapp: data.whatsapp ?? '',
      cep: data.cep ?? '',
      endereco: data.endereco ?? '',
      razaoSocial: data.razao_social ?? '',
      nomeResponsavel: data.nome_responsavel ?? '',
      chavePix: data.chave_pix ?? '',
      infoBancaria: data.info_bancaria ?? '',
      usaTaxasPersonalizadas: data.usa_taxas_personalizadas ?? false,
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

      const novaTaxa: typeof taxasPersonalizadasLoja.$inferInsert = {
        lojaId: lojaCriada.id,
        dinheiro: data.taxas.dinheiro,
        debito: data.taxas.debito,
        credito: data.taxas.credito,
        pix: data.taxas.pix,
        antecipacao: data.taxas.antecipacao,
      };

      await db.insert(taxasPersonalizadasLoja).values(novaTaxa);
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
    const valoresAtualizados: typeof lojas.$inferInsert = {
      ...(data.nome !== undefined && { nome: data.nome }),
      ...(data.numero_documento !== undefined && { numeroDocumento: data.numero_documento }),
      ...(data.tipo_documento !== undefined && { tipoDocumento: data.tipo_documento }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
      ...(data.cep !== undefined && { cep: data.cep }),
      ...(data.endereco !== undefined && { endereco: data.endereco }),
      ...(data.razao_social !== undefined && { razaoSocial: data.razao_social }),
      ...(data.nome_responsavel !== undefined && { nomeResponsavel: data.nome_responsavel }),
      ...(data.chave_pix !== undefined && { chavePix: data.chave_pix }),
      ...(data.info_bancaria !== undefined && { infoBancaria: data.info_bancaria }),
      ...(data.usa_taxas_personalizadas !== undefined && { usaTaxasPersonalizadas: data.usa_taxas_personalizadas }),
      atualizadoEm: new Date(),
    } as any;

    await db.update(lojas).set(valoresAtualizados).where(eq(lojas.id, id));

    return this.buscarPorId(id);
  }

  async deletarLoja(id: string) {
    await db.delete(lojas).where(eq(lojas.id, id));
    return { success: true };
  }
}
