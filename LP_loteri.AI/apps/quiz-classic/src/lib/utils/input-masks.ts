/**
 * Aplica máscara de CPF (000.000.000-00)
 * @param value - Valor do input
 * @returns Valor formatado
 */
export const formatCPF = (value: string): string => {
  // Remove tudo que não é número
  const cleaned = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  const limited = cleaned.substring(0, 11);

  // Aplica máscara progressiva
  const match = limited.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);

  if (!match) return value;

  const parts = [match[1], match[2], match[3], match[4]].filter(Boolean);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]}.${parts[1]}`;
  if (parts.length === 3) return `${parts[0]}.${parts[1]}.${parts[2]}`;
  return `${parts[0]}.${parts[1]}.${parts[2]}-${parts[3]}`;
};

/**
 * Aplica máscara de telefone (00) 00000-0000
 * @param value - Valor do input
 * @returns Valor formatado
 */
export const formatPhone = (value: string): string => {
  // Remove tudo que não é número
  const cleaned = value.replace(/\D/g, '');

  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limited = cleaned.substring(0, 11);

  // Aplica máscara progressiva
  const match = limited.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);

  if (!match) return value;

  const parts = [match[1], match[2], match[3]].filter(Boolean);

  if (parts.length === 0) return '';
  if (parts.length === 1) return `(${parts[0]}`;
  if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`;
  return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
};

/**
 * Remove toda a formatação de um valor
 * @param value - Valor formatado
 * @returns Apenas números
 */
export const unformatValue = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Formata valor em centavos para reais (R$ 0,00)
 * @param cents - Valor em centavos
 * @returns Valor formatado
 */
export const formatCurrency = (cents: number): string => {
  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reais);
};
