#!/bin/bash

API_URL="http://localhost:3000/eventos"

echo "Escolha uma opção:"
echo "1 - Listar todos os eventos"
echo "2 - Buscar evento por ID"
echo "3 - Criar novo evento"
echo "4 - Atualizar evento existente"
echo "5 - Deletar evento"
read -p "Opção: " opcao

case $opcao in
  1)
    echo ">>> Listando eventos..."
    curl -X GET "$API_URL"
    ;;

  2)
    read -p "Digite o ID do evento: " id
    echo ">>> Buscando evento por ID..."
    curl -X GET "$API_URL/$id"
    ;;

  3)
    read -p "Nome do evento: " nome
    read -p "Data de início (YYYY-MM-DD): " data_inicio
    read -p "Data de fim (YYYY-MM-DD): " data_fim
    read -p "Status (ativo/encerrado): " status

    echo ">>> Criando evento..."
    curl -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"nome\": \"$nome\",
        \"data_inicio\": \"$data_inicio\",
        \"data_fim\": \"$data_fim\",
        \"status\": \"$status\"
      }"
    ;;

  4)
    read -p "ID do evento a atualizar: " id
    read -p "Novo nome do evento: " nome
    read -p "Nova data de início (YYYY-MM-DD): " data_inicio
    read -p "Nova data de fim (YYYY-MM-DD): " data_fim
    read -p "Novo status (ativo/encerrado): " status

    echo ">>> Atualizando evento..."
    curl -X PUT "$API_URL/$id" \
      -H "Content-Type: application/json" \
      -d "{
        \"nome\": \"$nome\",
        \"data_inicio\": \"$data_inicio\",
        \"data_fim\": \"$data_fim\",
        \"status\": \"$status\"
      }"
    ;;

  5)
    read -p "ID do evento a deletar: " id
    echo ">>> Deletando evento..."
    curl -X DELETE "$API_URL/$id"
    ;;

  *)
    echo "Opção inválida."
    ;;
esac

echo -e "\n\n[✔] Finalizado."
