CREATE TABLE "comissionados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"responsavel" text,
	"chave_pix" text,
	"usa_conta_bancaria" boolean DEFAULT false NOT NULL,
	"banco" text,
	"agencia" text,
	"conta" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp
);
--> statement-breakpoint
CREATE TABLE "evento_comissionados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" uuid NOT NULL,
	"comissionado_id" uuid NOT NULL,
	"percentual" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evento_lojas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" uuid NOT NULL,
	"loja_id" uuid NOT NULL,
	"havera_antecipacao" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"data_inicio" text NOT NULL,
	"data_fim" text NOT NULL,
	"lucro" numeric(12, 2),
	"status" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp
);
--> statement-breakpoint
CREATE TABLE "fechamentos_evento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" uuid NOT NULL,
	"valor_total_evento" numeric(14, 2) NOT NULL,
	"valor_total_comissionados" numeric(14, 2) NOT NULL,
	"valor_total_pdvs" numeric(14, 2) NOT NULL,
	"valor_total_lojas" numeric(14, 2) NOT NULL,
	"percentual_stone" numeric(5, 2) DEFAULT '0.0' NOT NULL,
	"valor_stone_sobre_pdvs" numeric(14, 2) NOT NULL,
	"lucro_final_empresa" numeric(14, 2) NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp
);
--> statement-breakpoint
CREATE TABLE "lojas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"numero_documento" text NOT NULL,
	"tipo_documento" text NOT NULL,
	"whatsapp" text,
	"cep" text,
	"endereco" text,
	"razao_social" text,
	"nome_responsavel" text,
	"chave_pix" text,
	"info_bancaria" text,
	"usa_taxas_personalizadas" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp
);
--> statement-breakpoint
CREATE TABLE "taxas_evento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" uuid NOT NULL,
	"dinheiro" numeric(5, 2) NOT NULL,
	"credito" numeric(5, 2) NOT NULL,
	"debito" numeric(5, 2) NOT NULL,
	"pix" numeric(5, 2) NOT NULL,
	"antecipacao" numeric(5, 2) NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxas_personalizadas_loja" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"dinheiro" numeric(5, 2),
	"credito" numeric(5, 2),
	"debito" numeric(5, 2),
	"pix" numeric(5, 2),
	"antecipacao" numeric(5, 2),
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp
);
--> statement-breakpoint
CREATE TABLE "transacoes_diarias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" uuid NOT NULL,
	"loja_id" uuid NOT NULL,
	"data_transacao" text NOT NULL,
	"dinheiro" numeric(12, 2) DEFAULT '0' NOT NULL,
	"debito" numeric(12, 2) DEFAULT '0' NOT NULL,
	"credito" numeric(12, 2) DEFAULT '0' NOT NULL,
	"pix" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_comissionado" ON "evento_comissionados" USING btree ("evento_id","comissionado_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_loja" ON "evento_lojas" USING btree ("evento_id","loja_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_id_fechamento" ON "fechamentos_evento" USING btree ("evento_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_id" ON "taxas_evento" USING btree ("evento_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_loja_id" ON "taxas_personalizadas_loja" USING btree ("loja_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_evento_loja_data" ON "transacoes_diarias" USING btree ("evento_id","loja_id","data_transacao");