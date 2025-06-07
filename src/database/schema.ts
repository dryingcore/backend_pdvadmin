import { pgTable, uuid, text, boolean, timestamp, uniqueIndex, numeric } from 'drizzle-orm/pg-core';

// Comissionados
export const comissionados = pgTable('comissionados', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  responsavel: text('responsavel'),
  chavePix: text('chave_pix'),
  usaContaBancaria: boolean('usa_conta_bancaria').notNull().default(false),
  banco: text('banco'),
  agencia: text('agencia'),
  conta: text('conta'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em'),
});

// taxas por gateway
export const taxasPorGateway = pgTable(
  'taxas_pagamento_gateway',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventoId: uuid('evento_id').notNull(),
    gateway: text('gateway').notNull(), // "Stone", "PagSeguro", etc.
    modalidade: text('modalidade').notNull(), // "credito", "debito", "pix" etc.
    percentual: numeric('percentual', { precision: 5, scale: 2 }).notNull(),
  },
  table => ({
    uniquePorEvento: uniqueIndex('unique_evento_gateway_modalidade').on(
      table.eventoId,
      table.gateway,
      table.modalidade,
    ),
  }),
);

// Eventos
export const eventos = pgTable('eventos', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  dataInicio: text('data_inicio').notNull(),
  dataFim: text('data_fim').notNull(),
  lucro: numeric('lucro', { precision: 12, scale: 2 }),
  status: text('status'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em'),
});

// Lojas
export const lojas = pgTable('lojas', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  numeroDocumento: text('numero_documento').notNull(),
  tipoDocumento: text('tipo_documento').notNull(),
  whatsapp: text('whatsapp'),
  cep: text('cep'),
  endereco: text('endereco'),
  razaoSocial: text('razao_social'),
  nomeResponsavel: text('nome_responsavel'),
  chavePix: text('chave_pix'),
  infoBancaria: text('info_bancaria'),
  usaTaxasPersonalizadas: boolean('usa_taxas_personalizadas').notNull().default(false),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em'),
});

// Taxas personalizadas por loja
export const taxasPersonalizadasLoja = pgTable(
  'taxas_personalizadas_loja',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lojaId: uuid('loja_id').notNull(),
    dinheiro: numeric('dinheiro', { precision: 5, scale: 2 }),
    credito: numeric('credito', { precision: 5, scale: 2 }),
    debito: numeric('debito', { precision: 5, scale: 2 }),
    pix: numeric('pix', { precision: 5, scale: 2 }),
    antecipacao: numeric('antecipacao', { precision: 5, scale: 2 }),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em'),
  },
  table => ({
    lojaIndex: uniqueIndex('unique_loja_id').on(table.lojaId),
  }),
);

// Taxas por evento
export const taxasEvento = pgTable(
  'taxas_evento',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventoId: uuid('evento_id').notNull(),
    dinheiro: numeric('dinheiro', { precision: 5, scale: 2 }).notNull(),
    credito: numeric('credito', { precision: 5, scale: 2 }).notNull(),
    debito: numeric('debito', { precision: 5, scale: 2 }).notNull(),
    pix: numeric('pix', { precision: 5, scale: 2 }).notNull(),
    antecipacao: numeric('antecipacao', { precision: 5, scale: 2 }).notNull(),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
  },
  table => ({
    eventoIndex: uniqueIndex('unique_evento_id').on(table.eventoId),
  }),
);

// Evento-lojas
export const eventoLojas = pgTable(
  'evento_lojas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventoId: uuid('evento_id').notNull(),
    lojaId: uuid('loja_id').notNull(),
    haveraAntecipacao: boolean('havera_antecipacao').notNull().default(false),
  },
  table => ({
    uniqueEventoLoja: uniqueIndex('unique_evento_loja').on(table.eventoId, table.lojaId),
  }),
);

// Evento-comissionados
export const eventoComissionados = pgTable(
  'evento_comissionados',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventoId: uuid('evento_id').notNull(),
    comissionadoId: uuid('comissionado_id').notNull(),
    percentual: numeric('percentual', { precision: 5, scale: 2 }).notNull(),
  },
  table => ({
    uniqueEventoComissionado: uniqueIndex('unique_evento_comissionado').on(table.eventoId, table.comissionadoId),
  }),
);

// Transações diárias
export const transacoesDiarias = pgTable(
  'transacoes_diarias',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventoId: uuid('evento_id').notNull(),
    lojaId: uuid('loja_id').notNull(),
    dataTransacao: text('data_transacao').notNull(),
    dinheiro: numeric('dinheiro', { precision: 12, scale: 2 }).notNull().default('0'),
    debito: numeric('debito', { precision: 12, scale: 2 }).notNull().default('0'),
    credito: numeric('credito', { precision: 12, scale: 2 }).notNull().default('0'),
    pix: numeric('pix', { precision: 12, scale: 2 }).notNull().default('0'),
    status: text('status'),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em'),
  },
  table => ({
    uniqueEventoLojaData: uniqueIndex('unique_evento_loja_data').on(table.eventoId, table.lojaId, table.dataTransacao),
  }),
);

// Fechamentos do evento
export const fechamentosEvento = pgTable(
  'fechamentos_evento',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventoId: uuid('evento_id').notNull(),
    valorTotalEvento: numeric('valor_total_evento', { precision: 14, scale: 2 }).notNull(),
    valorTotalComissionados: numeric('valor_total_comissionados', { precision: 14, scale: 2 }).notNull(),
    valorTotalPdvs: numeric('valor_total_pdvs', { precision: 14, scale: 2 }).notNull(),
    valorTotalLojas: numeric('valor_total_lojas', { precision: 14, scale: 2 }).notNull(),
    percentualStone: numeric('percentual_stone', { precision: 5, scale: 2 }).notNull().default('0.0'),
    valorStoneSobrePdvs: numeric('valor_stone_sobre_pdvs', { precision: 14, scale: 2 }).notNull(),
    lucroFinalEmpresa: numeric('lucro_final_empresa', { precision: 14, scale: 2 }).notNull(),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em'),
  },
  table => ({
    uniqueEventoFechamento: uniqueIndex('unique_evento_id_fechamento').on(table.eventoId),
  }),
);
