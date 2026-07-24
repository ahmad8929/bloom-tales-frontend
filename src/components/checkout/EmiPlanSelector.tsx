'use client';

import { Badge } from '@/components/ui/badge';
import type { EmiPlanQuote } from '@/lib/api/emi';

interface SelectedEmiPlan {
  provider: string;
  tenureMonths: number;
}

interface EmiPlanSelectorProps {
  plans: EmiPlanQuote[];
  selected: SelectedEmiPlan | null;
  onSelect: (plan: SelectedEmiPlan | null) => void;
}

function isSamePlan(a: SelectedEmiPlan | null, b: EmiPlanQuote) {
  return !!a && a.provider === b.provider && a.tenureMonths === b.tenureMonths;
}

export function EmiPlanSelector({ plans, selected, onSelect }: EmiPlanSelectorProps) {
  if (plans.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <p className="text-xs font-medium uppercase tracking-luxe text-text-muted">Pay via EMI (optional)</p>

      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-sm transition-colors ${
          selected === null ? 'border-gold bg-gold-soft/40' : 'border-border hover:bg-muted/50'
        }`}
      >
        <span className="font-medium">Pay in full</span>
        <span className="text-text-muted">No EMI</span>
      </button>

      {plans.map((plan) => {
        const active = isSamePlan(selected, plan);
        return (
          <button
            type="button"
            key={`${plan.provider}-${plan.tenureMonths}`}
            onClick={() => onSelect({ provider: plan.provider, tenureMonths: plan.tenureMonths })}
            className={`flex w-full items-center justify-between gap-3 rounded-lg border p-2.5 text-left text-sm transition-colors ${
              active ? 'border-gold bg-gold-soft/40' : 'border-border hover:bg-muted/50'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{plan.tenureMonths} months</span>
                {plan.bankName && <span className="text-xs text-text-muted">· {plan.bankName}</span>}
                {plan.interestRate === 0 ? (
                  <Badge variant="outline" className="border-sage/40 bg-sage/15 text-[10px] text-sage-deep">
                    No-cost EMI
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    {plan.interestRate}% p.a.
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-text-muted">
                Total payable ₹{plan.totalPayable.toLocaleString('en-IN')}
              </p>
            </div>
            <p className="flex-shrink-0 font-semibold">
              ₹{plan.monthlyInstallment.toLocaleString('en-IN')}/mo
            </p>
          </button>
        );
      })}
    </div>
  );
}
