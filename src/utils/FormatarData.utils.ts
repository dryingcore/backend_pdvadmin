/**
 * Formata uma data para o padrão brasileiro (dd/mm/yyyy), sem alterar fuso.
 * Aceita string ou Date.
 */
export function formatarDataBR(data: any): string {
  const date = typeof data === 'string' ? new Date(data + 'T00:00:00') : data;

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error(`Data inválida: ${data}`);
  }

  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();

  return `${dia}/${mes}/${ano}`;
}
