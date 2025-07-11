// src/app/utils/cnpj.utils.ts

export function isValidCnpj(cnpj: string): boolean {
  if (!cnpj) {
    return false; // Não é um CNPJ válido se estiver vazio/nulo
  }

  // Remove caracteres não numéricos
  const cleanedCnpj = String(cnpj).replace(/[^\d]+/g, '');

  // Verifica se tem 14 dígitos
  if (cleanedCnpj.length !== 14) {
    return false;
  }

  // Evita CNPJs com todos os dígitos iguais (considerados inválidos)
  if (/^(\d)\1{13}$/.test(cleanedCnpj)) {
    return false;
  }

  // Funções auxiliares para cálculo de dígito verificador
  function calculateDigit(base: string, weights: number[]): number {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base.charAt(i), 10) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  // Pesos para o primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  // Pesos para o segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // Valida o primeiro dígito verificador
  const base1 = cleanedCnpj.substring(0, 12);
  const digit1 = parseInt(cleanedCnpj.charAt(12), 10);
  const calculatedDigit1 = calculateDigit(base1, weights1);

  if (calculatedDigit1 !== digit1) {
    return false;
  }

  // Valida o segundo dígito verificador
  const base2 = cleanedCnpj.substring(0, 13);
  const digit2 = parseInt(cleanedCnpj.charAt(13), 10);
  const calculatedDigit2 = calculateDigit(base2, weights2);

  if (calculatedDigit2 !== digit2) {
    return false;
  }

  return true; // CNPJ é válido
}