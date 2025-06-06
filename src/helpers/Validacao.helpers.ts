/**
 * Verifica se uma string está no formato de data válida YYYY-MM-DD
 */
export function validarData(data: string): boolean {
  const regex: RegExp = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(data)) return false;

  const partes: string[] = data.split('-');
  const [anoStr, mesStr, diaStr] = partes;

  // Validação defensiva antes de usar as variáveis
  if (
    partes.length !== 3 ||
    !anoStr ||
    !mesStr ||
    !diaStr ||
    anoStr.length !== 4 ||
    mesStr.length !== 2 ||
    diaStr.length !== 2
  ) {
    return false;
  }

  const ano: number = Number(anoStr);
  const mes: number = Number(mesStr);
  const dia: number = Number(diaStr);

  if (isNaN(ano) || isNaN(mes) || isNaN(dia)) return false;

  const dataObj: Date = new Date(ano, mes - 1, dia);

  return dataObj.getFullYear() === ano && dataObj.getMonth() === mes - 1 && dataObj.getDate() === dia;
}

/**
 * Verifica se a data A é anterior ou igual à data B
 */
export function dataEhMenorOuIgual(dataA: string, dataB: string): boolean {
  const data1: Date = new Date(dataA);
  const data2: Date = new Date(dataB);
  return data1 <= data2;
}

/**
 * Verifica se uma string representa um valor monetário válido (com até 2 casas decimais)
 * Ex: '123.45', '0', '9999.99'
 */
export function validarValorMonetario(valor: string): boolean {
  const regex: RegExp = /^\d+(\.\d{1,2})?$/;
  return regex.test(valor);
}

/**
 * Converte um valor string monetário para centavos (ex: '12.34' => 1234)
 */
export function paraCentavos(valor: string): number {
  if (!validarValorMonetario(valor)) {
    throw new Error('Valor inválido');
  }
  const valorNumerico: number = parseFloat(valor);
  return Math.round(valorNumerico * 100);
}

/**
 * Verifica se um percentual é válido (0 a 100, com até 2 casas decimais)
 */
export function validarPercentual(valor: string): boolean {
  if (!validarValorMonetario(valor)) return false;
  const percentual: number = parseFloat(valor);
  return percentual >= 0 && percentual <= 100;
}
