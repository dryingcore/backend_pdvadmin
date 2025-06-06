-- Ativa extensão necessária para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela: comissionados
CREATE TABLE public.comissionados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  responsavel TEXT,
  chave_pix TEXT,
  usa_conta_bancaria BOOLEAN NOT NULL DEFAULT FALSE,
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP
);

-- Tabela: eventos
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  lucro NUMERIC(10,2),
  status TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP
);

-- Tabela: lojas
CREATE TABLE public.lojas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  numero_documento TEXT NOT NULL,
  tipo_documento TEXT NOT NULL,
  whatsapp TEXT,
  cep TEXT,
  endereco TEXT,
  razao_social TEXT,
  nome_responsavel TEXT,
  chave_pix TEXT,
  info_bancaria TEXT,
  usa_taxas_personalizadas BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP
);

-- Tabela: taxas personalizadas por loja
CREATE TABLE public.taxas_personalizadas_loja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id UUID NOT NULL UNIQUE REFERENCES public.lojas(id) ON DELETE CASCADE,
  dinheiro NUMERIC(5,2),
  credito NUMERIC(5,2),
  debito NUMERIC(5,2),
  pix NUMERIC(5,2),
  antecipacao NUMERIC(5,2),
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP
);

-- Tabela: taxas por evento
CREATE TABLE public.taxas_evento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL UNIQUE REFERENCES public.eventos(id) ON DELETE CASCADE,
  dinheiro NUMERIC(5,2) NOT NULL,
  credito NUMERIC(5,2) NOT NULL,
  debito NUMERIC(5,2) NOT NULL,
  pix NUMERIC(5,2) NOT NULL,
  antecipacao NUMERIC(5,2) NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Relacionamento evento-loja
CREATE TABLE public.evento_lojas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  havera_antecipacao BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (evento_id, loja_id)
);

-- Comissionados por evento
CREATE TABLE public.evento_comissionados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  comissionado_id UUID NOT NULL REFERENCES public.comissionados(id) ON DELETE CASCADE,
  percentual NUMERIC(5,2) NOT NULL CHECK (percentual >= 0 AND percentual <= 100),
  UNIQUE (evento_id, comissionado_id)
);

-- Transações diárias por loja/evento
CREATE TABLE public.transacoes_diarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  data_transacao DATE NOT NULL,
  dinheiro NUMERIC(10,2) NOT NULL DEFAULT 0,
  debito NUMERIC(10,2) NOT NULL DEFAULT 0,
  credito NUMERIC(10,2) NOT NULL DEFAULT 0,
  pix NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP,
  UNIQUE (evento_id, loja_id, data_transacao)
);

-- Resumo do evento (view cacheável)
CREATE TABLE public.calculos_evento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL UNIQUE REFERENCES public.eventos(id) ON DELETE CASCADE,

  -- Totais por origem
  dinheiro_pdvs NUMERIC(10,2),
  debito_pdvs NUMERIC(10,2),
  credito_pdvs NUMERIC(10,2),
  pix_pdvs NUMERIC(10,2),
  total_pdvs NUMERIC(10,2),

  dinheiro_stone NUMERIC(10,2),
  debito_stone NUMERIC(10,2),
  credito_stone NUMERIC(10,2),
  pix_stone NUMERIC(10,2),

  -- Totais finais
  dinheiro_total NUMERIC(10,2),
  debito_total NUMERIC(10,2),
  credito_total NUMERIC(10,2),
  pix_total NUMERIC(10,2),
  total_movimentado NUMERIC(10,2),

  -- Lucros e antecipações
  total_comissionados NUMERIC(10,2),
  lucro_bruto NUMERIC(10,2),
  lucro_liquido NUMERIC(10,2),
  total_antecipado NUMERIC(10,2),
  lucro_antecipacao NUMERIC(10,2),

  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP
);

-- Fechamento final do evento
CREATE TABLE public.fechamentos_evento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL UNIQUE REFERENCES public.eventos(id) ON DELETE CASCADE,

  valor_total_evento NUMERIC(12,2) NOT NULL,
  valor_total_comissionados NUMERIC(12,2) NOT NULL,
  valor_total_pdvs NUMERIC(12,2) NOT NULL,
  valor_total_lojas NUMERIC(12,2) NOT NULL,

  percentual_stone NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  valor_stone_sobre_pdvs NUMERIC(12,2) NOT NULL,

  lucro_final_empresa NUMERIC(12,2) NOT NULL,

  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP
);

-- Histórico de alíquotas
CREATE TABLE public.aliquotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  data_vigencia DATE NOT NULL,
  dinheiro NUMERIC(5,2) NOT NULL,
  credito NUMERIC(5,2) NOT NULL,
  debito NUMERIC(5,2) NOT NULL,
  pix NUMERIC(5,2) NOT NULL,
  antecipacao NUMERIC(5,2) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
