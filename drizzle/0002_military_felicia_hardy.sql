CREATE TABLE "evento_loja_comissionado" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" uuid NOT NULL,
	"loja_id" uuid NOT NULL,
	"comissionado_id" uuid NOT NULL,
	"percentual_customizado" numeric(5, 2),
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp
);
--> statement-breakpoint
CREATE TABLE "taxas_gateway_evento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" uuid NOT NULL,
	"taxa_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "taxas_pagamento_gateway" RENAME TO "taxas_gateway";--> statement-breakpoint
DROP INDEX "unique_evento_gateway_modalidade";--> statement-breakpoint
ALTER TABLE "comissionados" ADD COLUMN "documento" text;--> statement-breakpoint
ALTER TABLE "comissionados" ADD COLUMN "whatsapp" text;--> statement-breakpoint
ALTER TABLE "taxas_gateway" ADD COLUMN "debito" numeric(5, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "taxas_gateway" ADD COLUMN "credito" numeric(5, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "taxas_gateway" ADD COLUMN "pix" numeric(5, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "taxas_gateway" ADD COLUMN "dinheiro" numeric(5, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "taxas_gateway" ADD COLUMN "antecipacao" numeric(5, 2) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_loja_comissionado" ON "evento_loja_comissionado" USING btree ("evento_id","loja_id","comissionado_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_gateway" ON "taxas_gateway_evento" USING btree ("evento_id");--> statement-breakpoint
ALTER TABLE "taxas_gateway" DROP COLUMN "evento_id";--> statement-breakpoint
ALTER TABLE "taxas_gateway" DROP COLUMN "modalidade";--> statement-breakpoint
ALTER TABLE "taxas_gateway" DROP COLUMN "percentual";