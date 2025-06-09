import { formatarDataLocal, parseDataLocal } from './FormatarDataLocal.helpers';

export function gerarIntervaloDeDatas(inicio: string, fim: string): string[] {
  const atual = parseDataLocal(inicio);
  const dataFinal = parseDataLocal(fim);

  if (!atual || !dataFinal) {
    throw new Error('Uma ou ambas as datas são inválidas.');
  }

  const datas: string[] = [];

  while (atual <= dataFinal) {
    datas.push(formatarDataLocal(atual));
    atual.setDate(atual.getDate() + 1);
  }

  return datas;
}
