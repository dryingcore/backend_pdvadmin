-- Comissionados
INSERT INTO public.comissionados (nome, responsavel, chave_pix, usa_conta_bancaria, banco, agencia, conta)
VALUES 
('Agência MKT Alpha', 'João Silva', 'joao@pix.com', TRUE, 'Banco do Brasil', '1234', '56789-0'),
('Mídia Beta', 'Maria Lima', 'maria@pix.com', FALSE, NULL, NULL, NULL);

-- Lojas
INSERT INTO public.lojas (nome, numero_documento, tipo_documento, whatsapp, cep, endereco, razao_social, nome_responsavel, chave_pix, info_bancaria)
VALUES 
('Lanchonete do Zé', '12345678000199', 'CNPJ', '48999999999', '88000000', 'Rua das Flores, 123', 'Zé Lanches ME', 'José Pereira', 'ze@pix.com', 'Banco XPTO, ag. 001, cc. 12345-6'),
('Sabor Caseiro', '98765432100', 'CPF', '48988888888', '88001000', 'Av. Central, 456', 'Maria Caseira LTDA', 'Maria Souza', 'maria@pix.com', 'Banco XPTO, ag. 002, cc. 65432-1');

-- Evento
INSERT INTO public.eventos (nome, data_inicio, data_fim, lucro, status)
VALUES 
('Feira de Abril', '2025-04-02', '2025-04-04', 0, 'ativo');

-- Vincular lojas ao evento
INSERT INTO public.evento_lojas (evento_id, loja_id, havera_antecipacao)
SELECT e.id, l.id, TRUE
FROM eventos e, lojas l
WHERE e.nome = 'Feira de Abril';

-- Vincular comissionados ao evento
INSERT INTO public.evento_comissionados (evento_id, comissionado_id, percentual)
SELECT e.id, c.id, 10.0
FROM eventos e, comissionados c
WHERE e.nome = 'Feira de Abril';

-- Taxas do evento
INSERT INTO public.taxas_evento (evento_id, dinheiro, credito, debito, pix, antecipacao)
SELECT id, 0.0, 3.5, 2.5, 1.5, 4.0 FROM eventos WHERE nome = 'Feira de Abril';

-- Taxas personalizadas para uma loja
INSERT INTO public.taxas_personalizadas_loja (loja_id, dinheiro, credito, debito, pix, antecipacao)
SELECT id, 0.0, 2.8, 2.0, 1.2, 3.5 FROM lojas WHERE nome = 'Sabor Caseiro';

-- Transações diárias do evento
INSERT INTO public.transacoes_diarias (
  evento_id, loja_id, data_transacao, dinheiro, debito, credito, pix, status
)
SELECT 
  e.id, l.id, d::DATE,
  (RANDOM() * 100)::NUMERIC,
  (RANDOM() * 50)::NUMERIC,
  (RANDOM() * 70)::NUMERIC,
  (RANDOM() * 80)::NUMERIC,
  'pendente'
FROM eventos e, lojas l, generate_series('2025-04-02', '2025-04-04', interval '1 day') d
WHERE e.nome = 'Feira de Abril';

-- Alíquotas históricas
INSERT INTO public.aliquotas (nome, data_vigencia, dinheiro, credito, debito, pix, antecipacao)
VALUES 
('Padrão Março 2025', '2025-03-01', 0.0, 3.5, 2.5, 1.5, 4.0),
('Padrão Abril 2025', '2025-04-01', 0.0, 3.6, 2.6, 1.6, 4.1);

INSERT INTO public.fechamentos_evento (
  evento_id,
  valor_total_evento,
  valor_total_comissionados,
  valor_total_pdvs,
  valor_total_lojas,
  percentual_stone,
  valor_stone_sobre_pdvs,
  lucro_final_empresa
)
SELECT
  e.id AS evento_id,

  -- 1. Total do evento
  SUM(t.dinheiro + t.debito + t.credito + t.pix) AS valor_total_evento,

  -- 2. Comissionados (ex: 10%)
  SUM(t.dinheiro + t.debito + t.credito + t.pix) * (
    COALESCE((
      SELECT SUM(ec.percentual) / 100.0
      FROM public.evento_comissionados ec
      WHERE ec.evento_id = e.id
    ), 0.0)
  ) AS valor_total_comissionados,

  -- 3. Lucro bruto da PDVS = total - comissionados
  (
    SUM(t.dinheiro + t.debito + t.credito + t.pix) -
    SUM(t.dinheiro + t.debito + t.credito + t.pix) * (
      COALESCE((
        SELECT SUM(ec.percentual) / 100.0
        FROM public.evento_comissionados ec
        WHERE ec.evento_id = e.id
      ), 0.0)
    )
  ) AS valor_total_pdvs,

  -- 4. Valor para lojas (restante)
  0.0, -- ← será ajustado depois, se quiser calcular por loja

  -- 5. Percentual fixo da Stone (exemplo: 2.0%)
  2.0 AS percentual_stone,

  -- 6. Valor da Stone (sobre lucro PDVS)
  (
    (
      SUM(t.dinheiro + t.debito + t.credito + t.pix) -
      SUM(t.dinheiro + t.debito + t.credito + t.pix) * (
        COALESCE((
          SELECT SUM(ec.percentual) / 100.0
          FROM public.evento_comissionados ec
          WHERE ec.evento_id = e.id
        ), 0.0)
      )
    ) * 0.02
  ) AS valor_stone_sobre_pdvs,

  -- 7. Lucro final da PDVS (bruto - Stone)
  (
    (
      SUM(t.dinheiro + t.debito + t.credito + t.pix) -
      SUM(t.dinheiro + t.debito + t.credito + t.pix) * (
        COALESCE((
          SELECT SUM(ec.percentual) / 100.0
          FROM public.evento_comissionados ec
          WHERE ec.evento_id = e.id
        ), 0.0)
      )
    ) - (
      (
        SUM(t.dinheiro + t.debito + t.credito + t.pix) -
        SUM(t.dinheiro + t.debito + t.credito + t.pix) * (
          COALESCE((
            SELECT SUM(ec.percentual) / 100.0
            FROM public.evento_comissionados ec
            WHERE ec.evento_id = e.id
          ), 0.0)
        )
      ) * 0.02
    )
  ) AS lucro_final_empresa

FROM public.eventos e
JOIN public.transacoes_diarias t ON t.evento_id = e.id
WHERE e.nome = 'Feira de Abril'
GROUP BY e.id;