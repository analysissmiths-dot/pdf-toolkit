const app = getApp();

Page({
  data: {
    files: [],
    merging: false,
    progress: 0,
    hasLimit: false,
    maxFiles: 2,
    MAX_FILES: 2
  },

  onLoad() {
    const isFree = !app.globalData.isPro;
    this.setData({
      hasLimit: isFree,
      maxFiles: isFree ? 2 : 999,
      MAX_FILES: isFree ? 2 : 999
    });
  },

  chooseFile() {
    wx.chooseMessageFile({
      count: this.data.MAX_FILES,
      type: 'file',
      extension: ['pdf'],
      success: (res) => {
        const newFiles = res.tempFiles.map(f => ({
          path: f.path,
          name: f.name,
          size: this.formatSize(f.size),
          rawSize: f.size
        }));
        
        let allFiles = [...this.data.files, ...newFiles];
        if (allFiles.length > this.data.MAX_FILES) {
          allFiles = allFiles.slice(0, this.data.MAX_FILES);
          wx.showToast({ title: `免费版最多${this.data.MAX_FILES}个文件`, icon: 'none' });
        }
        
        this.setData({ files: allFiles });
      }
    });
  },

  removeFile(e) {
    const idx = e.currentTarget.dataset.index;
    const files = [...this.data.files];
    files.splice(idx, 1);
    this.setData({ files });
  },

  async mergePDF() {
    if (this.data.files.length < 2) {
      wx.showToast({ title: '请至少选择2个PDF', icon: 'none' });
      return;
    }

    this.setData({ merging: true, progress: 10 });

    try {
      const PDFLib = require('pdf-lib');
      const mergedPdf = await PDFLib.PDFDocument.create();

      for (let i = 0; i < this.data.files.length; i++) {
        const fs = wx.getFileSystemManager();
        const arrayBuffer = fs.readFileSync(this.data.files[i].path).buffer;
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));

        this.setData({ progress: Math.min(80, 10 + ((i + 1) / this.data.files.length) * 70) });
      }

      const pdfBytes = await mergedPdf.save();
      this.setData({ progress: 90 });

      // Save and open
      const tempPath = `${wx.env.USER_DATA_PATH}/merged-output.pdf`;
      const fs = wx.getFileSystemManager();
      fs.writeFileSync(tempPath, pdfBytes);

      this.setData({ progress: 100 });

      wx.showModal({
        title: '合并完成',
        content: `共 ${mergedPdf.getPageCount()} 页，已保存`,
        confirmText: '打开文件',
        success: (res) => {
          if (res.confirm) {
            wx.openDocument({ filePath: tempPath, fileType: 'pdf' });
          }
        }
      });

      this.setData({ merging: false, progress: 0 });
    } catch (err) {
      wx.showToast({ title: '合并失败: ' + err.message, icon: 'none' });
      this.setData({ merging: false, progress: 0 });
    }
  },

  formatSize(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / 1048576).toFixed(1) + 'MB';
  }
});
