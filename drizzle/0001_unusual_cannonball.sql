CREATE TABLE "taxas_pagamento_gateway" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" uuid NOT NULL,
	"gateway" text NOT NULL,
	"modalidade" text NOT NULL,
	"percentual" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_gateway_modalidade" ON "taxas_pagamento_gateway" USING btree ("evento_id","gateway","modalidade");