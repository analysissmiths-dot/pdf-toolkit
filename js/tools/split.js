/* === PDF Split Tool === */
PDFKIT.SplitTool = {
  file: null,
  totalPages: 0,
  
  render(container) {
    container.innerHTML = `
      <div class="drop-zone" id="splitDrop">
        <div class="drop-zone-icon">📄</div>
        <p>拖拽或点击选择要拆分的 PDF 文件</p>
        <p class="text-muted">支持一个 PDF 文件</p>
      </div>
      <input type="file" id="splitFileInput" accept=".pdf" hidden>
      <div class="file-list" id="splitFileInfo"></div>
      <div class="split-inputs hidden" id="splitInputs">
        <div>
          <label>起始页</label>
          <input type="number" class="input" id="splitStart" min="1" value="1">
        </div>
        <div>
          <label>结束页</label>
          <input type="number" class="input" id="splitEnd" min="1" value="1">
        </div>
      </div>
      <div class="action-area" id="splitActions">
        <button class="btn btn-primary" id="splitRangeBtn" disabled>📄 提取选中范围</button>
        <button class="btn btn-primary" id="splitAllBtn" disabled>🔪 拆分为单页</button>
      </div>
      <div class="progress-bar hidden" id="splitProgress">
        <div class="progress-bar-inner" id="splitProgressInner"></div>
      </div>
    `;
    
    this.file = null;
    this.totalPages = 0;
    this.bindEvents(container);
  },
  
  bindEvents(container) {
    const drop = container.querySelector('#splitDrop');
    const input = container.querySelector('#splitFileInput');
    
    drop.addEventListener('click', () => input.click());
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag-over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault(); drop.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) this.loadFile(files[0]);
    });
    input.addEventListener('change', (e) => {
      if (e.target.files.length > 0) this.loadFile(e.target.files[0]);
      input.value = '';
    });
    
    container.querySelector('#splitRangeBtn').addEventListener('click', () => this.splitRange());
    container.querySelector('#splitAllBtn').addEventListener('click', () => this.splitAll());
  },
  
  async loadFile(file) {
    if (file.type !== 'application/pdf') {
      this.showToast('请选择 PDF 文件', 'error');
      return;
    }
    
    const access = PDFKIT.checkAccess('split');
    const maxPages = access.limit === 'maxPages' ? access.value : Infinity;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
      this.totalPages = pdf.getPageCount();
      
      if (this.totalPages > maxPages && !PDFKIT.isPro()) {
        this.showToast(`免费版最多处理 ${maxPages} 页。购买 Pro 可处理任意大小。`, 'error');
        return;
      }
      
      this.file = file;
      
      const info = document.querySelector('#splitFileInfo');
      info.innerHTML = `
        <div class="file-item">
          <span>📄</span>
          <span class="file-name">${file.name}</span>
          <span class="file-size">共 ${this.totalPages} 页</span>
        </div>
      `;
      
      const inputs = document.querySelector('#splitInputs');
      inputs.classList.remove('hidden');
      document.querySelector('#splitStart').max = this.totalPages;
      document.querySelector('#splitEnd').max = this.totalPages;
      document.querySelector('#splitEnd').value = this.totalPages;
      
      document.querySelector('#splitRangeBtn').disabled = false;
      document.querySelector('#splitAllBtn').disabled = false;
      
    } catch (err) {
      this.showToast('读取 PDF 失败: ' + err.message, 'error');
    }
  },
  
  async splitRange() {
    if (!this.file) return;
    
    const start = parseInt(document.querySelector('#splitStart').value);
    const end = parseInt(document.querySelector('#splitEnd').value);
    
    if (isNaN(start) || isNaN(end) || start < 1 || end > this.totalPages || start > end) {
      this.showToast(`请输入有效范围 (1 - ${this.totalPages})`, 'error');
      return;
    }
    
    const progress = document.querySelector('#splitProgress');
    const progressInner = document.querySelector('#splitProgressInner');
    progress.classList.remove('hidden');
    
    try {
      const arrayBuffer = await this.file.arrayBuffer();
      const srcPdf = await PDFLib.PDFDocument.load(arrayBuffer);
      const newPdf = await PDFLib.PDFDocument.create();
      
      const pageIndices = [];
      for (let i = start - 1; i < end; i++) pageIndices.push(i);
      
      const pages = await newPdf.copyPages(srcPdf, pageIndices);
      pages.forEach(page => newPdf.addPage(page));
      
      progressInner.style.width = '80%';
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pages-${start}-${end}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      progressInner.style.width = '100%';
      this.showToast('提取完成！', 'success');
      setTimeout(() => {
        progress.classList.add('hidden');
        progressInner.style.width = '0%';
      }, 1500);
      
    } catch (err) {
      this.showToast('拆分失败: ' + err.message, 'error');
      progress.classList.add('hidden');
    }
  },
  
  async splitAll() {
    if (!this.file) return;
    
    const progress = document.querySelector('#splitProgress');
    const progressInner = document.querySelector('#splitProgressInner');
    progress.classList.remove('hidden');
    
    try {
      const arrayBuffer = await this.file.arrayBuffer();
      const srcPdf = await PDFLib.PDFDocument.load(arrayBuffer);
      
      for (let i = 0; i < this.totalPages; i++) {
        const newPdf = await PDFLib.PDFDocument.create();
        const [page] = await newPdf.copyPages(srcPdf, [i]);
        newPdf.addPage(page);
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `page-${i + 1}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        
        progressInner.style.width = `${((i + 1) / this.totalPages) * 100}%`;
        // Small delay to let the browser process downloads
        await new Promise(r => setTimeout(r, 100));
      }
      
      this.showToast('已拆分为单页文件！', 'success');
      setTimeout(() => {
        progress.classList.add('hidden');
        progressInner.style.width = '0%';
      }, 1500);
      
    } catch (err) {
      this.showToast('拆分失败: ' + err.message, 'error');
      progress.classList.add('hidden');
    }
  },
  
  showToast(msg, type) {
    const container = document.querySelector('#toast');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
};
