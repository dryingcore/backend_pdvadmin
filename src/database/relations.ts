import { relations } from 'drizzle-orm';
import {
  comissionados,
  eventos,
  lojas,
  eventoComissionados,
  eventoLojas,
  transacoesDiarias,
  taxasEvento,
  taxasPersonalizadasLoja,
  fechamentosEvento,
} from './schema';

// Evento → Comissionados
export const eventoComissionadosRelations = relations(eventoComissionados, ({ one }) => ({
  evento: one(eventos, {
    fields: [eventoComissionados.evento_id],
    references: [eventos.id],
  }),
  comissionado: one(comissionados, {
    fields: [eventoComissionados.comissionado_id],
    references: [comissionados.id],
  }),
}));

// Evento → Lojas
export const eventoLojasRelations = relations(eventoLojas, ({ one }) => ({
  evento: one(eventos, {
    fields: [eventoLojas.evento_id],
    references: [eventos.id],
  }),
  loja: one(lojas, {
    fields: [eventoLojas.loja_id],
    references: [lojas.id],
  }),
}));

// Loja → Taxas Personalizadas
export const taxasPersonalizadasRelations = relations(taxasPersonalizadasLoja, ({ one }) => ({
  loja: one(lojas, {
    fields: [taxasPersonalizadasLoja.loja_id],
    references: [lojas.id],
  }),
}));

// Evento → Taxas
export const taxasEventoRelations = relations(taxasEvento, ({ one }) => ({
  evento: one(eventos, {
    fields: [taxasEvento.evento_id],
    references: [eventos.id],
  }),
}));

// Transações Diárias → Evento / Loja
export const transacoesDiariasRelations = relations(transacoesDiarias, ({ one }) => ({
  evento: one(eventos, {
    fields: [transacoesDiarias.evento_id],
    references: [eventos.id],
  }),
  loja: one(lojas, {
    fields: [transacoesDiarias.loja_id],
    references: [lojas.id],
  }),
}));

// Fechamento → Evento
export const fechamentoEventoRelations = relations(fechamentosEvento, ({ one }) => ({
  evento: one(eventos, {
    fields: [fechamentosEvento.evento_id],
    references: [eventos.id],
  }),
}));
