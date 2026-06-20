/* === PDF Reorder Tool === */
PDFKIT.ReorderTool = {
  file: null,
  srcPdf: null,
  pageOrder: [],
  
  render(container) {
    if (!PDFKIT.isPro()) {
      container.innerHTML = `
        <div class="pricing-card" style="margin:0 0 1rem;">
          <div class="price">🔒</div>
          <p class="price-label">页面排序是 Pro 专属功能</p>
        </div>
        <p style="text-align:center;margin-bottom:1rem;">购买 Pro 后您可以：</p>
        <ul class="price-features" style="margin:0 auto 1.25rem;max-width:300px;">
          <li>拖拽调整页面顺序</li>
          <li>删除不需要的页面</li>
          <li>本地处理，不上传任何文件</li>
        </ul>
        <button class="btn btn-primary btn-block btn-lg" onclick="document.getElementById('purchaseBtn').click()">
          💳 购买 Pro - $19
        </button>
      `;
      return;
    }
    
    container.innerHTML = `
      <div class="drop-zone" id="reorderDrop">
        <div class="drop-zone-icon">📄</div>
        <p>拖拽或点击选择 PDF 文件</p>
        <p class="text-muted">选择一个 PDF 来调整页面顺序</p>
      </div>
      <input type="file" id="reorderFileInput" accept=".pdf" hidden>
      <div class="file-list" id="reorderFileInfo"></div>
      <div class="hidden" id="reorderWorkspace">
        <div style="display:flex;align-items:center;justify-content:space-between;margin:1rem 0 0.5rem;">
          <span style="font-size:0.875rem;font-weight:500;">点击页面标记为删除，然后点击确认</span>
          <div class="action-area" style="margin:0;">
            <button class="btn" id="reorderResetBtn">↻ 重置</button>
            <button class="btn btn-primary" id="reorderApplyBtn">✓ 应用并下载</button>
          </div>
        </div>
        <div class="page-grid" id="reorderGrid"></div>
        <div class="progress-bar hidden" id="reorderProgress">
          <div class="progress-bar-inner" id="reorderProgressInner"></div>
        </div>
      </div>
    `;
    
    this.file = null;
    this.srcPdf = null;
    this.pageOrder = [];
    this.bindEvents(container);
  },
  
  bindEvents(container) {
    const drop = container.querySelector('#reorderDrop');
    const input = container.querySelector('#reorderFileInput');
    
    if (!drop) return;
    
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
  },
  
  async loadFile(file) {
    if (file.type !== 'application/pdf') {
      this.showToast('请选择 PDF 文件', 'error');
      return;
    }
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
      
      this.file = file;
      this.srcPdf = pdf;
      this.pageOrder = pdf.getPageIndices();
      
      const info = document.querySelector('#reorderFileInfo');
      info.innerHTML = `
        <div class="file-item">
          <span>📄</span>
          <span class="file-name">${file.name}</span>
          <span class="file-size">共 ${pdf.getPageCount()} 页</span>
        </div>
      `;
      
      document.querySelector('#reorderWorkspace').classList.remove('hidden');
      this.renderThumbnails(pdf);
      this.bindWorkspaceEvents();
      
    } catch (err) {
      this.showToast('读取 PDF 失败: ' + err.message, 'error');
    }
  },
  
  async renderThumbnails(pdf) {
    const grid = document.querySelector('#reorderGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < this.pageOrder.length; i++) {
      const pageIdx = this.pageOrder[i];
      const thumb = document.createElement('div');
      thumb.className = 'page-thumb';
      thumb.dataset.index = pageIdx;
      thumb.dataset.position = i;
      
      const num = document.createElement('div');
      num.className = 'page-num';
      num.textContent = `第 ${pageIdx + 1} 页`;
      
      const del = document.createElement('span');
      del.className = 'page-delete';
      del.textContent = '×';
      
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 160;
      
      thumb.appendChild(canvas);
      thumb.appendChild(num);
      thumb.appendChild(del);
      
      // Render page to canvas
      try {
        const [page] = await this.srcPdf.copyPages(pdf, [pageIdx]);
        // We can't render PDF pages to canvas without PDF.js
        // So we'll show a placeholder with page number
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 120, 160);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(1, 1, 118, 158);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`📄`, 60, 70);
        ctx.fillText(`第 ${pageIdx + 1} 页`, 60, 100);
      } catch (e) {
        // fallback
      }
      
      thumb.addEventListener('click', () => {
        thumb.classList.toggle('selected');
      });
      
      // Simple drag swap
      thumb.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', thumb.dataset.position);
      });
      
      thumb.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      
      thumb.addEventListener('drop', (e) => {
        e.preventDefault();
        const fromPos = parseInt(e.dataTransfer.getData('text/plain'));
        const toPos = parseInt(thumb.dataset.position);
        if (fromPos === toPos) return;
        
        // Swap in the page order array
        [this.pageOrder[fromPos], this.pageOrder[toPos]] = [this.pageOrder[toPos], this.pageOrder[fromPos]];
        this.renderThumbnails(this.srcPdf);
      });
      
      thumb.draggable = true;
      
      grid.appendChild(thumb);
    }
  },
  
  bindWorkspaceEvents() {
    const resetBtn = document.querySelector('#reorderResetBtn');
    const applyBtn = document.querySelector('#reorderApplyBtn');
    
    resetBtn.addEventListener('click', () => {
      if (this.srcPdf) {
        this.pageOrder = this.srcPdf.getPageIndices();
        this.renderThumbnails(this.srcPdf);
        this.showToast('已重置页面顺序', 'success');
      }
    });
    
    applyBtn.addEventListener('click', () => this.applyReorder());
  },
  
  async applyReorder() {
    const selectedThumbs = document.querySelectorAll('#reorderGrid .page-thumb.selected');
    const deleteIndices = Array.from(selectedThumbs).map(t => parseInt(t.dataset.index));
    
    // Filter out deleted pages
    const finalOrder = this.pageOrder.filter(idx => !deleteIndices.includes(idx));
    
    if (finalOrder.length === 0) {
      this.showToast('至少需要保留一页', 'error');
      return;
    }
    
    const progress = document.querySelector('#reorderProgress');
    const progressInner = document.querySelector('#reorderProgressInner');
    progress.classList.remove('hidden');
    
    try {
      const newPdf = await PDFLib.PDFDocument.create();
      const pages = await newPdf.copyPages(this.srcPdf, finalOrder);
      pages.forEach(page => newPdf.addPage(page));
      
      progressInner.style.width = '80%';
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reordered-${this.file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      
      progressInner.style.width = '100%';
      
      if (deleteIndices.length > 0) {
        this.showToast(`已排序并删除 ${deleteIndices.length} 页`, 'success');
      } else {
        this.showToast('已重新排序', 'success');
      }
      
      setTimeout(() => {
        progress.classList.add('hidden');
        progressInner.style.width = '0%';
      }, 1500);
      
    } catch (err) {
      this.showToast('处理失败: ' + err.message, 'error');
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
