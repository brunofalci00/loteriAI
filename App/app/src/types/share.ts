export type ShareContext =
  | 'score'
  | 'variations'
  | 'high-rate'
  | 'first-gen'
  | 'milestone'
  | 'detailed';

export interface ShareNumbersPayload {
  lotteryType?: string;
  lotteryName?: string;
  contestNumber?: number;
  numbers?: number[];
  hotCount?: number;
  coldCount?: number;
  balancedCount?: number;
  strategyLabel?: string;
  source?: 'manual' | 'ai';
}

export interface ShareEventData extends ShareNumbersPayload {
  score?: number;
  accuracyRate?: number;
  milestone?: number;
  messageLength?: number;
}
