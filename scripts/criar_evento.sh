curl -X POST http://localhost:3000/eventos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Feira de Inverno",
    "data_inicio": "2025-07-01",
    "data_fim": "2025-07-03",
    "status": "ativo",
    "taxas": {
      "dinheiro": "2.00",
      "debito": "1.50",
      "credito": "3.20",
      "pix": "0.50",
      "antecipacao": "4.00"
    },
    "lojas": [
      {
        "id": "c0649d27-397e-477b-97e0-e241c06083ec",
        "havera_antecipacao": true
      }
    ],
    "comissionados": [
      {
        "id": "16e887ff-3a90-48f9-ac5d-23a5fa2a7b6a",
        "percentual": "10.00"
      }
    ]
  }'
