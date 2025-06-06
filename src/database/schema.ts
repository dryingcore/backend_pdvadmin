import { pgTable, uuid, text, boolean, numeric, date, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// Comissionados
export const comissionados = pgTable('comissionados', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  responsavel: text('responsavel'),
  chave_pix: text('chave_pix'),
  usa_conta_bancaria: boolean('usa_conta_bancaria').notNull().default(false),
  banco: text('banco'),
  agencia: text('agencia'),
  conta: text('conta'),
  criado_em: timestamp('criado_em').notNull().defaultNow(),
  atualizado_em: timestamp('atualizado_em'),
});

// Eventos
export const eventos = pgTable('eventos', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  data_inicio: date('data_inicio').notNull(),
  data_fim: date('data_fim').notNull(),
  lucro: numeric('lucro', { precision: 10, scale: 2 }),
  status: text('status'),
  criado_em: timestamp('criado_em').notNull().defaultNow(),
  atualizado_em: timestamp('atualizado_em'),
});

// Lojas
export const lojas = pgTable('lojas', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  numero_documento: text('numero_documento').notNull(),
  tipo_documento: text('tipo_documento').notNull(),
  whatsapp: text('whatsapp'),
  cep: text('cep'),
  endereco: text('endereco'),
  razao_social: text('razao_social'),
  nome_responsavel: text('nome_responsavel'),
  chave_pix: text('chave_pix'),
  info_bancaria: text('info_bancaria'),
  usa_taxas_personalizadas: boolean('usa_taxas_personalizadas').notNull().default(false),
  criado_em: timestamp('criado_em').notNull().defaultNow(),
  atualizado_em: timestamp('atualizado_em'),
});

// Taxas personalizadas por loja
export const taxasPersonalizadasLoja = pgTable(
  'taxas_personalizadas_loja',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    loja_id: uuid('loja_id').notNull(),
    dinheiro: numeric('dinheiro', { precision: 5, scale: 2 }),
    credito: numeric('credito', { precision: 5, scale: 2 }),
    debito: numeric('debito', { precision: 5, scale: 2 }),
    pix: numeric('pix', { precision: 5, scale: 2 }),
    antecipacao: numeric('antecipacao', { precision: 5, scale: 2 }),
    criado_em: timestamp('criado_em').notNull().defaultNow(),
    atualizado_em: timestamp('atualizado_em'),
  },
  table => ({
    lojaIndex: uniqueIndex('unique_loja_id').on(table.loja_id),
  }),
);

// Taxas por evento
export const taxasEvento = pgTable(
  'taxas_evento',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    evento_id: uuid('evento_id').notNull(),
    dinheiro: numeric('dinheiro', { precision: 5, scale: 2 }).notNull(),
    credito: numeric('credito', { precision: 5, scale: 2 }).notNull(),
    debito: numeric('debito', { precision: 5, scale: 2 }).notNull(),
    pix: numeric('pix', { precision: 5, scale: 2 }).notNull(),
    antecipacao: numeric('antecipacao', { precision: 5, scale: 2 }).notNull().default('0'),
    criado_em: timestamp('criado_em').notNull().defaultNow(),
  },
  table => ({
    eventoIndex: uniqueIndex('unique_evento_id').on(table.evento_id),
  }),
);

// Evento-lojas
export const eventoLojas = pgTable(
  'evento_lojas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    evento_id: uuid('evento_id').notNull(),
    loja_id: uuid('loja_id').notNull(),
    havera_antecipacao: boolean('havera_antecipacao').notNull().default(false),
  },
  table => ({
    uniqueEventoLoja: uniqueIndex('unique_evento_loja').on(table.evento_id, table.loja_id),
  }),
);

// Evento-comissionados
export const eventoComissionados = pgTable(
  'evento_comissionados',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    evento_id: uuid('evento_id').notNull(),
    comissionado_id: uuid('comissionado_id').notNull(),
    percentual: numeric('percentual', { precision: 5, scale: 2 }).notNull(),
  },
  table => ({
    uniqueEventoComissionado: uniqueIndex('unique_evento_comissionado').on(table.evento_id, table.comissionado_id),
  }),
);

// Transações diárias
export const transacoesDiarias = pgTable(
  'transacoes_diarias',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    evento_id: uuid('evento_id').notNull(),
    loja_id: uuid('loja_id').notNull(),
    data_transacao: date('data_transacao').notNull(),
    dinheiro: numeric('dinheiro', { precision: 10, scale: 2 }).notNull().default('0'),
    debito: numeric('debito', { precision: 10, scale: 2 }).notNull().default('0'),
    credito: numeric('credito', { precision: 10, scale: 2 }).notNull().default('0'),
    pix: numeric('pix', { precision: 10, scale: 2 }).notNull().default('0'),
    status: text('status'),
    criado_em: timestamp('criado_em').notNull().defaultNow(),
    atualizado_em: timestamp('atualizado_em'),
  },
  table => ({
    uniqueEventoLojaData: uniqueIndex('unique_evento_loja_data').on(
      table.evento_id,
      table.loja_id,
      table.data_transacao,
    ),
  }),
);

// Fechamentos do evento
export const fechamentosEvento = pgTable(
  'fechamentos_evento',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    evento_id: uuid('evento_id').notNull(),
    valor_total_evento: numeric('valor_total_evento', { precision: 12, scale: 2 }).notNull(),
    valor_total_comissionados: numeric('valor_total_comissionados', { precision: 12, scale: 2 }).notNull(),
    valor_total_pdvs: numeric('valor_total_pdvs', { precision: 12, scale: 2 }).notNull(),
    valor_total_lojas: numeric('valor_total_lojas', { precision: 12, scale: 2 }).notNull(),
    percentual_stone: numeric('percentual_stone', { precision: 5, scale: 2 }).notNull().default('0.0'),
    valor_stone_sobre_pdvs: numeric('valor_stone_sobre_pdvs', { precision: 12, scale: 2 }).notNull(),
    lucro_final_empresa: numeric('lucro_final_empresa', { precision: 12, scale: 2 }).notNull(),
    criado_em: timestamp('criado_em').notNull().defaultNow(),
    atualizado_em: timestamp('atualizado_em'),
  },
  table => ({
    uniqueEventoFechamento: uniqueIndex('unique_evento_id_fechamento').on(table.evento_id),
  }),
);
