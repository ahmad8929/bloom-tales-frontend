// Shared Cashfree SDK loader/redirect — extracted from the old single-page
// checkout's handleCashfreePayment so both a full online payment and a COD
// advance-confirmation payment (a different session, same redirect
// mechanism) can trigger the identical Cashfree checkout UI.
export function openCashfreeCheckout(paymentSessionId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => {
      if (!window.Cashfree) {
        reject(new Error('Cashfree SDK failed to load'));
        return;
      }
      const cashfree = window.Cashfree({ mode: 'production' });
      cashfree.checkout({ paymentSessionId, redirectTarget: '_self' });
      // Successful checkout() call navigates the tab away to Cashfree —
      // resolve() is mostly nominal (callers await this for error handling).
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.body.appendChild(script);
  });
}
