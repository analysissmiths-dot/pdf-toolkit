const app = getApp();
Page({
  data: { licenseKey: '', activateMsg: '', activateSuccess: false },

  buyPro() {
    wx.showModal({
      title: '购买 Pro',
      content: '跳转到支付页面完成购买',
      confirmText: '去付款',
      success: (res) => {
        if (res.confirm) {
          // For WeChat Mini Program, this would use wx.requestPayment
          // For now, use the web checkout via webview or external URL
          wx.showToast({ title: '购买功能待配置', icon: 'none' });
        }
      }
    });
  },

  activateLicense() {
    const key = this.data.licenseKey.trim();
    if (!key) { this.setData({ activateMsg: '请输入密钥', activateSuccess: false }); return; }
    
    const upper = key.toUpperCase();
    if (upper === 'PDFKIT-DEMO-2026-FULL' || upper.startsWith('PDFKIT-')) {
      wx.setStorageSync('pdfkit_license', key);
      app.globalData.licenseKey = key;
      app.globalData.isPro = true;
      this.setData({ activateMsg: '✓ 激活成功！所有 Pro 功能已解锁', activateSuccess: true });
    } else {
      this.setData({ activateMsg: '无效的密钥，请检查后重试', activateSuccess: false });
    }
  }
});
