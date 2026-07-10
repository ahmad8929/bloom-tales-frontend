import { Shield, Package } from 'lucide-react';

export function ProductTrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
      <div className="flex items-center gap-3 font-sans text-sm text-text-muted">
        <Shield className="h-5 w-5 text-gold" strokeWidth={1.25} />
        <span>Secure Payment</span>
      </div>
      <div className="flex items-center gap-3 font-sans text-sm text-text-muted">
        <Package className="h-5 w-5 text-gold" strokeWidth={1.25} />
        <span>Quality Assured</span>
      </div>
    </div>
  );
}
