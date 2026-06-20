const app = getApp();
Page({
  data: { isPro: false, file: { path: '', name: '', size: '' }, quality: 70, compressing: false, progress: 0 },
  onShow() { this.setData({ isPro: app.globalData.isPro }); },
  goPro() { wx.navigateTo({ url: '/pages/pro/pro' }); },
  onQualityChange(e) { this.setData({ quality: e.detail.value }); },

  chooseFile() {
    wx.chooseMessageFile({ count: 1, type: 'file', extension: ['pdf'], success: (res) => {
      const f = res.tempFiles[0];
      this.setData({ file: { path: f.path, name: f.name, size: this.formatSize(f.size) }, compressedData: null });
    }});
  },

  async compressPDF() {
    this.setData({ compressing: true, progress: 30 });
    try {
      const PDFLib = require('pdf-lib');
      const fs = wx.getFileSystemManager();
      const arrayBuffer = fs.readFileSync(this.data.file.path).buffer;
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
      this.setData({ progress: 50 });

      const newPdf = await PDFLib.PDFDocument.create();
      const pages = await newPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => newPdf.addPage(p));
      this.setData({ progress: 70 });

      const pdfBytes = await newPdf.save({ useObjectStreams: true });
      const savePath = `${wx.env.USER_DATA_PATH}/compressed-${this.data.file.name}`;
      fs.writeFileSync(savePath, pdfBytes);
      this.setData({ progress: 100 });

      const before = this.data.file.rawSize || this.data.file.path.length;
      const saved = Math.round((1 - pdfBytes.length / before) * 100);

      wx.showModal({
        title: '压缩完成',
        content: `节省了 ${saved}% 的体积`,
        confirmText: '打开文件',
        success: (r) => { if (r.confirm) wx.openDocument({ filePath: savePath, fileType: 'pdf' }); }
      });
    } catch (err) {
      wx.showToast({ title: '压缩失败', icon: 'none' });
    }
    this.setData({ compressing: false, progress: 0 });
  },

  formatSize(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / 1048576).toFixed(1) + 'MB';
  }
});
