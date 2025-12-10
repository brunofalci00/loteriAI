// Types for checkout flow

export type CheckoutMethod = 'pix' | 'card';

export interface PixFormData {
  name: string;
  email: string;
  document: string; // CPF com ou sem formatação
  phone: string; // Telefone com ou sem formatação
}

export interface PixDisplayData {
  externalId: string;
  transactionId: string;
  qrCodeBase64: string;
  pixCode: string;
  expiresAt: Date;
  totalAmount: number; // em centavos
}

export type CheckoutState =
  | { type: 'method-selection' }
  | { type: 'pix-form' }
  | { type: 'pix-loading' }
  | { type: 'pix-display'; data: PixDisplayData }
  | { type: 'pix-polling'; data: PixDisplayData }
  | { type: 'pix-success'; transactionId: string; email: string }
  | { type: 'pix-expired' }
  | { type: 'pix-error'; error: string; canRetry: boolean };

export interface CheckoutConfig {
  amount: number; // em centavos
  productName: string;
  offerName: string;
  pixExpirationMinutes?: number; // Padrão: 15
  pollingIntervalMs?: number; // Padrão: 5000 (5s)
}
