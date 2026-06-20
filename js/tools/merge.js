/* === PDF Merge Tool === */
PDFKIT.MergeTool = {
  files: [],
  
  render(container) {
    container.innerHTML = `
      <div class="drop-zone" id="mergeDrop">
        <div class="drop-zone-icon">📄</div>
        <p>拖拽 PDF 文件到此处，或点击选择文件</p>
        <p class="text-muted">支持多个 PDF 文件</p>
      </div>
      <input type="file" id="mergeFileInput" accept=".pdf" multiple hidden>
      <div class="file-list" id="mergeFileList"></div>
      <div class="action-area" id="mergeActions">
        <button class="btn btn-primary btn-block" id="mergeBtn" disabled>
          ✨ 合并 PDF
        </button>
      </div>
      <div class="progress-bar hidden" id="mergeProgress">
        <div class="progress-bar-inner" id="mergeProgressInner"></div>
      </div>
    `;
    
    this.files = [];
    this.bindEvents(container);
    this.updateFileList();
  },
  
  bindEvents(container) {
    const drop = container.querySelector('#mergeDrop');
    const input = container.querySelector('#mergeFileInput');
    const btn = container.querySelector('#mergeBtn');
    
    drop.addEventListener('click', () => input.click());
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag-over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      drop.classList.remove('drag-over');
      this.handleFiles(Array.from(e.dataTransfer.files));
    });
    input.addEventListener('change', (e) => {
      this.handleFiles(Array.from(e.target.files));
      input.value = '';
    });
    btn.addEventListener('click', () => this.merge());
  },
  
  handleFiles(newFiles) {
    const pdfFiles = newFiles.filter(f => f.type === 'application/pdf');
    const access = PDFKIT.checkAccess('merge');
    const maxFiles = access.limit === 'maxFiles' ? access.value : Infinity;
    
    if (this.files.length + pdfFiles.length > maxFiles) {
      this.showToast(`免费版最多合并 ${maxFiles} 个文件。购买 Pro 可无限制合并。`, 'error');
      return;
    }
    
    this.files = [...this.files, ...pdfFiles];
    this.updateFileList();
  },
  
  removeFile(index) {
    this.files.splice(index, 1);
    this.updateFileList();
  },
  
  updateFileList() {
    const list = document.querySelector('#mergeFileList');
    const btn = document.querySelector('#mergeBtn');
    if (!list) return;
    
    if (this.files.length === 0) {
      list.innerHTML = '';
      btn && (btn.disabled = true);
      return;
    }
    
    btn && (btn.disabled = false);
    
    list.innerHTML = this.files.map((file, i) => `
      <div class="file-item">
        <span>📄</span>
        <span class="file-name">${file.name}</span>
        <span class="file-size">${this.formatSize(file.size)}</span>
        <button class="file-remove" data-index="${i}">&times;</button>
      </div>
    `).join('');
    
    list.querySelectorAll('.file-remove').forEach(el => {
      el.addEventListener('click', () => this.removeFile(parseInt(el.dataset.index)));
    });
  },
  
  async merge() {
    if (this.files.length < 2) {
      this.showToast('请至少选择 2 个 PDF 文件进行合并。', 'error');
      return;
    }
    
    const progress = document.querySelector('#mergeProgress');
    const progressInner = document.querySelector('#mergeProgressInner');
    const btn = document.querySelector('#mergeBtn');
    
    progress.classList.remove('hidden');
    btn.disabled = true;
    progressInner.style.width = '10%';
    
    try {
      const mergedPdf = await PDFLib.PDFDocument.create();
      
      for (let i = 0; i < this.files.length; i++) {
        const arrayBuffer = await this.files[i].arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const indices = pdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(pdf, indices);
        copiedPages.forEach(page => mergedPdf.addPage(page));
        
        progressInner.style.width = `${((i + 1) / this.files.length) * 80 + 10}%`;
      }
      
      progressInner.style.width = '90%';
      
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged-output.pdf';
      a.click();
      URL.revokeObjectURL(url);
      
      progressInner.style.width = '100%';
      this.showToast(`合并完成！共 ${mergedPdf.getPageCount()} 页`, 'success');
      
      setTimeout(() => {
        progress.classList.add('hidden');
        progressInner.style.width = '0%';
        btn.disabled = false;
      }, 1500);
      
    } catch (err) {
      this.showToast('合并失败: ' + err.message, 'error');
      progress.classList.add('hidden');
      btn.disabled = false;
    }
  },
  
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
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
