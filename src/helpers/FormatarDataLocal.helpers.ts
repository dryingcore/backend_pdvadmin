export function parseDataLocal(data: string): Date | null {
  const [ano, mes, dia] = data.split('-').map(Number);
  if (!ano || !mes || !dia) return null;

  const d = new Date(ano, mes - 1, dia); // Mês é zero-based
  return isNaN(d.getTime()) ? null : d;
}

export function formatarDataLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
