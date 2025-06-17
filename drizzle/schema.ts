import { pgTable, uuid, text, boolean, timestamp, uniqueIndex, numeric } from "drizzle-orm/pg-core"



export const comissionados = pgTable("comissionados", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	nome: text().notNull(),
	responsavel: text(),
	chavePix: text("chave_pix"),
	usaContaBancaria: boolean("usa_conta_bancaria").default(false).notNull(),
	banco: text(),
	agencia: text(),
	conta: text(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }),
});

export const eventoComissionados = pgTable("evento_comissionados", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventoId: uuid("evento_id").notNull(),
	comissionadoId: uuid("comissionado_id").notNull(),
	percentual: numeric({ precision: 5, scale:  2 }).notNull(),
}, (table) => [
	uniqueIndex("unique_evento_comissionado").using("btree", table.eventoId.asc().nullsLast().op("uuid_ops"), table.comissionadoId.asc().nullsLast().op("uuid_ops")),
]);

export const eventoLojas = pgTable("evento_lojas", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventoId: uuid("evento_id").notNull(),
	lojaId: uuid("loja_id").notNull(),
	haveraAntecipacao: boolean("havera_antecipacao").default(false).notNull(),
}, (table) => [
	uniqueIndex("unique_evento_loja").using("btree", table.eventoId.asc().nullsLast().op("uuid_ops"), table.lojaId.asc().nullsLast().op("uuid_ops")),
]);

export const eventos = pgTable("eventos", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	nome: text().notNull(),
	dataInicio: text("data_inicio").notNull(),
	dataFim: text("data_fim").notNull(),
	lucro: numeric({ precision: 12, scale:  2 }),
	status: text(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }),
});

export const fechamentosEvento = pgTable("fechamentos_evento", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventoId: uuid("evento_id").notNull(),
	valorTotalEvento: numeric("valor_total_evento", { precision: 14, scale:  2 }).notNull(),
	valorTotalComissionados: numeric("valor_total_comissionados", { precision: 14, scale:  2 }).notNull(),
	valorTotalPdvs: numeric("valor_total_pdvs", { precision: 14, scale:  2 }).notNull(),
	valorTotalLojas: numeric("valor_total_lojas", { precision: 14, scale:  2 }).notNull(),
	percentualStone: numeric("percentual_stone", { precision: 5, scale:  2 }).default('0.0').notNull(),
	valorStoneSobrePdvs: numeric("valor_stone_sobre_pdvs", { precision: 14, scale:  2 }).notNull(),
	lucroFinalEmpresa: numeric("lucro_final_empresa", { precision: 14, scale:  2 }).notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }),
}, (table) => [
	uniqueIndex("unique_evento_id_fechamento").using("btree", table.eventoId.asc().nullsLast().op("uuid_ops")),
]);

export const lojas = pgTable("lojas", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	nome: text().notNull(),
	numeroDocumento: text("numero_documento").notNull(),
	tipoDocumento: text("tipo_documento").notNull(),
	whatsapp: text(),
	cep: text(),
	endereco: text(),
	razaoSocial: text("razao_social"),
	nomeResponsavel: text("nome_responsavel"),
	chavePix: text("chave_pix"),
	infoBancaria: text("info_bancaria"),
	usaTaxasPersonalizadas: boolean("usa_taxas_personalizadas").default(false).notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }),
});

export const taxasEvento = pgTable("taxas_evento", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventoId: uuid("evento_id").notNull(),
	dinheiro: numeric({ precision: 5, scale:  2 }).notNull(),
	credito: numeric({ precision: 5, scale:  2 }).notNull(),
	debito: numeric({ precision: 5, scale:  2 }).notNull(),
	pix: numeric({ precision: 5, scale:  2 }).notNull(),
	antecipacao: numeric({ precision: 5, scale:  2 }).notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_evento_id").using("btree", table.eventoId.asc().nullsLast().op("uuid_ops")),
]);

export const taxasPersonalizadasLoja = pgTable("taxas_personalizadas_loja", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	lojaId: uuid("loja_id").notNull(),
	dinheiro: numeric({ precision: 5, scale:  2 }),
	credito: numeric({ precision: 5, scale:  2 }),
	debito: numeric({ precision: 5, scale:  2 }),
	pix: numeric({ precision: 5, scale:  2 }),
	antecipacao: numeric({ precision: 5, scale:  2 }),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }),
}, (table) => [
	uniqueIndex("unique_loja_id").using("btree", table.lojaId.asc().nullsLast().op("uuid_ops")),
]);

export const transacoesDiarias = pgTable("transacoes_diarias", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventoId: uuid("evento_id").notNull(),
	lojaId: uuid("loja_id").notNull(),
	dataTransacao: text("data_transacao").notNull(),
	dinheiro: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	debito: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	credito: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	pix: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	status: text(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }),
}, (table) => [
	uniqueIndex("unique_evento_loja_data").using("btree", table.eventoId.asc().nullsLast().op("text_ops"), table.lojaId.asc().nullsLast().op("uuid_ops"), table.dataTransacao.asc().nullsLast().op("text_ops")),
]);

export const taxasPagamentoGateway = pgTable("taxas_pagamento_gateway", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventoId: uuid("evento_id").notNull(),
	gateway: text().notNull(),
	modalidade: text().notNull(),
	percentual: numeric({ precision: 5, scale:  2 }).notNull(),
}, (table) => [
	uniqueIndex("unique_evento_gateway_modalidade").using("btree", table.eventoId.asc().nullsLast().op("text_ops"), table.gateway.asc().nullsLast().op("uuid_ops"), table.modalidade.asc().nullsLast().op("text_ops")),
]);
