// Types for Buck API integration

export interface BuckBuyer {
  name: string;
  email: string;
  document: string; // CPF sem formatação
  phone: string; // Telefone com DDD, sem formatação
}

export interface BuckProduct {
  id?: string | null;
  name: string;
  quantity?: number;
}

export interface BuckOffer {
  id?: string | null;
  name: string;
  discount_price: number; // em centavos
  quantity?: number | null;
}

export interface BuckTracking {
  ref?: string | null;
  src?: string | null;
  sck?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_id?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
}

export interface BuckPixData {
  code: string; // Código PIX copia e cola
  qrcode_base64: string; // QR Code em base64
}

export interface BuckCreateTransactionRequest {
  external_id: string; // ID único da transação
  payment_method: 'pix' | 'credit_card' | 'boleto';
  amount: number; // Valor em centavos
  buyer: BuckBuyer;
  product: BuckProduct;
  offer?: BuckOffer;
  tracking?: BuckTracking;
}

export interface BuckTransactionData {
  id: string; // ID interno da Buck
  external_id: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  payment_method: string;
  total_amount: number; // em centavos
  net_amount: number; // em centavos (após taxas)
  pix?: BuckPixData;
  buyer?: BuckBuyer;
  product?: BuckProduct;
  offer?: BuckOffer;
  tracking?: BuckTracking;
  created_at: string; // ISO 8601
  updated_at?: string; // ISO 8601
}

export interface BuckTransactionResponse {
  data: BuckTransactionData;
}

export interface BuckErrorDetail {
  [field: string]: string[];
}

export interface BuckErrorResponse {
  error: {
    message: string;
    detail?: BuckErrorDetail | string;
  };
}

export interface BuckWebhookEvent {
  event: 'transaction.created' | 'transaction.processed';
  data: BuckTransactionData;
}

export type BuckPaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';
