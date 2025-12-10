import { z } from 'zod';

/**
 * Valida CPF brasileiro
 * @param cpf - CPF com ou sem formatação
 * @returns true se válido, false caso contrário
 */
export const validateCPF = (cpf: string): boolean => {
  // Remove formatação
  const cleaned = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;

  return true;
};

/**
 * Schema de validação para formulário PIX
 */
export const pixFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome deve conter apenas letras')
    .transform(val => val.trim()),

  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
    .transform(val => val.trim()),

  document: z
    .string()
    .min(1, 'CPF é obrigatório')
    .transform(val => val.replace(/\D/g, '')) // Remove formatação
    .refine(validateCPF, 'CPF inválido'),

  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .transform(val => val.replace(/\D/g, '')) // Remove formatação
    .refine(
      val => val.length === 11 && val.startsWith('11') || val.length === 11,
      'Telefone deve ter 11 dígitos (DDD + 9 dígitos)'
    )
    .refine(
      val => /^[1-9]{2}9?[0-9]{8}$/.test(val),
      'Formato de telefone inválido'
    ),
});

export type PixFormData = z.infer<typeof pixFormSchema>;
