curl -X POST http://localhost:3000/eventos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Feira de Julho",
    "data_inicio": "2025-07-10",
    "data_fim": "2025-07-12",
    "status": "ativo"
  }'
