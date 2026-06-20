const app = getApp();
Page({
  data: { isPro: false, file: { path: '', name: '' }, totalPages: 0, pages: [], processing: false, progress: 0, hasChanges: false },
  onShow() { this.setData({ isPro: app.globalData.isPro }); },
  goPro() { wx.navigateTo({ url: '/pages/pro/pro' }); },

  chooseFile() {
    wx.chooseMessageFile({ count: 1, type: 'file', extension: ['pdf'], success: async (res) => {
      const f = res.tempFiles[0];
      try {
        const fs = wx.getFileSystemManager();
        const PDFLib = require('pdf-lib');
        const pdf = await PDFLib.PDFDocument.load(fs.readFileSync(f.path).buffer);
        const totalPages = pdf.getPageCount();
        const pages = Array.from({length: totalPages}, (_, i) => ({ num: i + 1, deleted: false }));
        this.setData({ file: { path: f.path, name: f.name }, totalPages, pages, hasChanges: false, srcPdf: pdf });
      } catch(e) { wx.showToast({ title: '读取失败', icon: 'none' }); }
    }});
  },

  toggleDelete(e) {
    const idx = e.currentTarget.dataset.index;
    const pages = this.data.pages.map((p, i) => i === idx ? { ...p, deleted: !p.deleted } : p);
    this.setData({ pages, hasChanges: true });
  },

  resetOrder() {
    const pages = Array.from({length: this.data.totalPages}, (_, i) => ({ num: i + 1, deleted: false }));
    this.setData({ pages, hasChanges: false });
  },

  async applyReorder() {
    const { pages, file } = this.data;
    const remaining = pages.filter(p => !p.deleted);
    if (remaining.length === 0) { wx.showToast({ title: '至少保留一页', icon: 'none' }); return; }

    this.setData({ processing: true, progress: 30 });
    try {
      const PDFLib = require('pdf-lib');
      const fs = wx.getFileSystemManager();
      const srcPdf = await PDFLib.PDFDocument.load(fs.readFileSync(file.path).buffer);
      const newPdf = await PDFLib.PDFDocument.create();
      const indices = remaining.map(p => p.num - 1);
      const pagesCopy = await newPdf.copyPages(srcPdf, indices);
      pagesCopy.forEach(p => newPdf.addPage(p));

      this.setData({ progress: 70 });
      const bytes = await newPdf.save();
      const savePath = `${wx.env.USER_DATA_PATH}/reordered-${file.name}`;
      fs.writeFileSync(savePath, bytes);
      this.setData({ progress: 100 });

      const msg = remaining.length < this.data.totalPages ? `已删除 ${this.data.totalPages - remaining.length} 页` : '已重新排序';
      wx.showModal({ title: '完成', content: msg, confirmText: '打开文件', success: (r) => {
        if (r.confirm) wx.openDocument({ filePath: savePath, fileType: 'pdf' });
      }});
    } catch(e) { wx.showToast({ title: '处理失败', icon: 'none' }); }
    this.setData({ processing: false, progress: 0 });
  }
});
