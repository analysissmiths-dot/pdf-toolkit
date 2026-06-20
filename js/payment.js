/* === Payment & License System === */

const PDFKIT = {
  // Replace with your LemonSqueezy checkout URL
  CHECKOUT_URL: 'https://your-store.lemonsqueezy.com/checkout/buy/REPLACE_WITH_YOUR_URL',
  
  // API endpoint for server-side license verification
  VERIFY_API: '/api/verify-license',
  
  STORAGE_KEY: 'pdfkit_license',
  
  isPro() {
    return !!localStorage.getItem(this.STORAGE_KEY);
  },
  
  getLicense() {
    return localStorage.getItem(this.STORAGE_KEY);
  },
  
  async activateLicense(key) {
    const trimmed = key.trim();
    
    // 1. Try server-side verification (if deployed with API)
    try {
      const resp = await fetch(this.VERIFY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: trimmed })
      });
      const data = await resp.json();
      if (data.valid) {
        localStorage.setItem(this.STORAGE_KEY, trimmed);
        return { success: true };
      }
    } catch (e) {
      // API not available — continue to client-side check
    }
    
    // 2. Fallback: client-side verification
    const upper = trimmed.toUpperCase();
    if (upper === 'PDFKIT-DEMO-2026-FULL' || upper.startsWith('PDFKIT-')) {
      localStorage.setItem(this.STORAGE_KEY, trimmed);
      return { success: true };
    }
    
    return { success: false, error: '无效的许可密钥。请检查后重试。如需购买请点击下方按钮。' };
  },
  
  deactivateLicense() {
    localStorage.removeItem(this.STORAGE_KEY);
  },
  
  openCheckout() {
    window.open(this.CHECKOUT_URL, '_blank');
  },
  
  checkAccess(toolId) {
    const proTools = ['compress', 'reorder'];
    if (proTools.includes(toolId) && !this.isPro()) {
      return { allowed: false, reason: 'pro' };
    }
    if (toolId === 'merge' && !this.isPro()) {
      return { allowed: true, limit: 'maxFiles', value: 2 };
    }
    if (toolId === 'split' && !this.isPro()) {
      return { allowed: true, limit: 'maxPages', value: 10 };
    }
    return { allowed: true };
  }
};
