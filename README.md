# backend_pdvadmin

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.10. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Fechamento de Evento

A rota `/fechamento-evento` retorna um resumo dos valores apurados em um evento.
Além dos totais de comissões e taxas, o campo `repasse_pdvs_liquido` indica o
valor final destinado às lojas (PDVs). O cálculo é descrito nos campos abaixo:

```json
{
  "repasse_pdvs_bruto": "total_geral - total_comissoes",
  "repasse_pdvs_liquido": "repasse_pdvs_bruto - total_taxas_pdvs",
  "descricao_repasse_pdvs": "Repasse às lojas = Total Geral - Total de Comissões - Taxas do PDV",
  "formula_repasse_pdvs": "(total_geral - total_comissoes) - total_taxas_pdvs"
}
```

Cada loja também possui um repasse individual disponível no campo `repasse_loja`,
onde cada chave corresponde ao `id` da loja e o valor detalha o montante
repassado por modalidade (dinheiro, débito, crédito e pix) e o total final.

Exemplo:

```json
{
  "repasse_loja": {
    "loja-123": {
      "dinheiro": 100.0,
      "debito": 50.0,
      "credito": 30.0,
      "pix": 20.0,
      "total": 200.0
    }
  }
}
```
