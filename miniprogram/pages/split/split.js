const app = getApp();

Page({
  data: {
    file: { path: '', name: '', size: '' },
    totalPages: 0,
    splitStart: 1,
    splitEnd: 1,
    splitting: false,
    progress: 0,
    maxPages: 10
  },

  onLoad() {
    if (!app.globalData.isPro) {
      this.setData({ maxPages: 10 });
    }
  },

  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf'],
      success: async (res) => {
        const f = res.tempFiles[0];
        const fs = wx.getFileSystemManager();
        
        try {
          const arrayBuffer = fs.readFileSync(f.path).buffer;
          const PDFLib = require('pdf-lib');
          const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
          const totalPages = pdf.getPageCount();

          if (totalPages > this.data.maxPages && !app.globalData.isPro) {
            wx.showToast({ title: `免费版最多${this.data.maxPages}页`, icon: 'none' });
            return;
          }

          this.setData({
            file: { path: f.path, name: f.name, size: this.formatSize(f.size) },
            totalPages,
            splitStart: 1,
            splitEnd: totalPages
          });
        } catch (err) {
          wx.showToast({ title: '读取失败', icon: 'none' });
        }
      }
    });
  },

  onStartChange(e) { this.setData({ splitStart: parseInt(e.detail.value) || 1 }); },
  onEndChange(e) { this.setData({ splitEnd: parseInt(e.detail.value) || 1 }); },

  async splitRange() {
    const { file, totalPages, splitStart, splitEnd } = this.data;
    if (!file.path || splitStart < 1 || splitEnd > totalPages || splitStart > splitEnd) {
      wx.showToast({ title: '请输入有效范围', icon: 'none' });
      return;
    }

    this.setData({ splitting: true, progress: 30 });

    try {
      const PDFLib = require('pdf-lib');
      const fs = wx.getFileSystemManager();
      const arrayBuffer = fs.readFileSync(file.path).buffer;
      const srcPdf = await PDFLib.PDFDocument.load(arrayBuffer);
      const newPdf = await PDFLib.PDFDocument.create();

      const indices = [];
      for (let i = splitStart - 1; i < splitEnd; i++) indices.push(i);
      const pages = await newPdf.copyPages(srcPdf, indices);
      pages.forEach(p => newPdf.addPage(p));

      this.setData({ progress: 70 });
      const pdfBytes = await newPdf.save();
      const savePath = `${wx.env.USER_DATA_PATH}/pages-${splitStart}-${splitEnd}.pdf`;
      fs.writeFileSync(savePath, pdfBytes);

      this.setData({ progress: 100 });
      wx.showModal({
        title: '提取完成',
        content: `已提取 ${splitEnd-splitStart+1} 页`,
        confirmText: '打开文件',
        success: (r) => { if (r.confirm) wx.openDocument({ filePath: savePath, fileType: 'pdf' }); }
      });
    } catch (err) {
      wx.showToast({ title: '拆分失败', icon: 'none' });
    }
    this.setData({ splitting: false, progress: 0 });
  },

  async splitAll() {
    const { file, totalPages } = this.data;
    this.setData({ splitting: true, progress: 0 });

    try {
      const PDFLib = require('pdf-lib');
      const fs = wx.getFileSystemManager();
      const arrayBuffer = fs.readFileSync(file.path).buffer;
      const srcPdf = await PDFLib.PDFDocument.load(arrayBuffer);

      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFLib.PDFDocument.create();
        const [page] = await newPdf.copyPages(srcPdf, [i]);
        newPdf.addPage(page);
        const bytes = await newPdf.save();
        fs.writeFileSync(`${wx.env.USER_DATA_PATH}/page-${i+1}.pdf`, bytes);
        this.setData({ progress: ((i + 1) / totalPages) * 100 });
      }

      wx.showToast({ title: `已拆分为 ${totalPages} 个文件`, icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '拆分失败', icon: 'none' });
    }
    this.setData({ splitting: false, progress: 0 });
  },

  formatSize(bytes) {
    if (bytes < 1024) return bytes + 'B';
    return (bytes / 1024).toFixed(1) + 'KB';
  }
});
