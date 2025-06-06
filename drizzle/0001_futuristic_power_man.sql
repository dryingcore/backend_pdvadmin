DROP INDEX "unique_loja_id";--> statement-breakpoint
DROP INDEX "unique_evento_id";--> statement-breakpoint
DROP INDEX "unique_evento_loja";--> statement-breakpoint
DROP INDEX "unique_evento_loja_data";--> statement-breakpoint
DROP INDEX "unique_evento_id_fechamento";--> statement-breakpoint
DROP INDEX "unique_evento_comissionado";--> statement-breakpoint
ALTER TABLE "eventos" ALTER COLUMN "data_inicio" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "eventos" ALTER COLUMN "data_fim" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "eventos" ALTER COLUMN "lucro" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "taxas_evento" ALTER COLUMN "antecipacao" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "transacoes_diarias" ALTER COLUMN "data_transacao" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "transacoes_diarias" ALTER COLUMN "dinheiro" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "transacoes_diarias" ALTER COLUMN "dinheiro" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "transacoes_diarias" ALTER COLUMN "debito" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "transacoes_diarias" ALTER COLUMN "debito" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "transacoes_diarias" ALTER COLUMN "credito" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "transacoes_diarias" ALTER COLUMN "credito" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "transacoes_diarias" ALTER COLUMN "pix" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "transacoes_diarias" ALTER COLUMN "pix" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "fechamentos_evento" ALTER COLUMN "valor_total_evento" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "fechamentos_evento" ALTER COLUMN "valor_total_comissionados" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "fechamentos_evento" ALTER COLUMN "valor_total_pdvs" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "fechamentos_evento" ALTER COLUMN "valor_total_lojas" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "fechamentos_evento" ALTER COLUMN "valor_stone_sobre_pdvs" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "fechamentos_evento" ALTER COLUMN "lucro_final_empresa" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_loja_id" ON "taxas_personalizadas_loja" USING btree ("loja_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_id" ON "taxas_evento" USING btree ("evento_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_loja" ON "evento_lojas" USING btree ("evento_id","loja_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_loja_data" ON "transacoes_diarias" USING btree ("evento_id","loja_id","data_transacao");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_id_fechamento" ON "fechamentos_evento" USING btree ("evento_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_comissionado" ON "evento_comissionados" USING btree ("evento_id","comissionado_id");