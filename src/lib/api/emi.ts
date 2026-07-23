import { api } from './client';

export interface EmiPlanQuote {
  provider: string;
  bankName: string | null;
  tenureMonths: number;
  interestRate: number;
  processingFee: number;
  monthlyInstallment: number;
  totalPayable: number;
  totalInterest: number;
}

interface EmiQuoteEnvelope {
  status: string;
  data: { emiSupported: boolean; plans: EmiPlanQuote[] };
}

export const emiApi = {
  getQuote: (amount: number, gateway: string = 'cashfree') =>
    api.get<EmiQuoteEnvelope>(`/emi-plans/quote?amount=${Math.round(amount)}&gateway=${gateway}`),
};
