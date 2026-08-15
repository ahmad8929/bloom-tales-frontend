import { api } from './client';

export interface AdminChargeSettings {
  deliveryRule: { type: string; defaultCharge: number; freeAboveAmount: number | null; waivedForGateways: string[] };
  platformFee: { enabled: boolean; type: string; value: number };
  packagingFee: { enabled: boolean; type: string; value: number };
  convenienceFee: { enabled: boolean; type: string; value: number };
  tax: { type: string; value: number; appliesTo: string; inclusive: boolean };
  codAdvanceAmount: number;
}

export const settingsApi = {
  // Public — used to display the COD advance-payment amount before checkout.
  getCharges: () =>
    api.get<{ status: string; data: { settings: AdminChargeSettings } }>('/settings/charges'),
};
