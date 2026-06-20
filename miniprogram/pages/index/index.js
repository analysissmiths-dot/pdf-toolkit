const app = getApp();

Page({
  data: {
    isPro: false,
    freeLimits: {
      merge: { maxFiles: 2 },
      split: { maxPages: 10 }
    }
  },

  onShow() {
    this.setData({ isPro: app.globalData.isPro });
  },

  openTool(e) {
    const tool = e.currentTarget.dataset.tool;
    const proTools = ['compress', 'reorder'];

    if (proTools.includes(tool) && !app.globalData.isPro) {
      wx.showModal({
        title: '需要 Pro',
        content: '此功能仅限 Pro 用户，一次性付费 $19 终身使用',
        confirmText: '去升级',
        success: (res) => {
          if (res.confirm) wx.navigateTo({ url: '/pages/pro/pro' });
        }
      });
      return;
    }

    wx.navigateTo({ url: `/pages/${tool}/${tool}` });
  },

  goPro() {
    wx.navigateTo({ url: '/pages/pro/pro' });
  }
});
