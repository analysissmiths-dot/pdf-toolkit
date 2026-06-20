App({
  globalData: {
    isPro: false,
    licenseKey: ''
  },

  onLaunch() {
    const license = wx.getStorageSync('pdfkit_license');
    if (license) {
      this.globalData.licenseKey = license;
      this.globalData.isPro = license === 'PDFKIT-DEMO-2026-FULL' || license.startsWith('PDFKIT-');
    }
  },

  // Check if user has Pro access
  checkPro() {
    if (!this.globalData.isPro) {
      wx.showModal({
        title: '需要 Pro 版本',
        content: '此功能仅限 Pro 用户使用。一次性付费 $19，终身使用。',
        confirmText: '去购买',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/pro/pro' });
          }
        }
      });
      return false;
    }
    return true;
  }
});
