/* === Main App === */
(function() {
  'use strict';
  
  const App = {
    currentTool: null,
    
    init() {
      this.bindToolCards();
      this.bindLicenseActions();
      this.bindWorkspaceClose();
      this.updateUI();
      
      // Keyboard shortcut
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeWorkspace();
          closeLicenseModal();
          closePaymentModal();
        }
      });
    },
    
    bindToolCards() {
      document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
          const tool = card.dataset.tool;
          this.openTool(tool);
        });
      });
    },
    
    openTool(tool) {
      this.currentTool = tool;
      const workspace = document.querySelector('#workspace');
      const title = document.querySelector('#workspaceTitle');
      const badge = document.querySelector('#workspaceBadge');
      
      const toolNames = {
        merge: '合并 PDF',
        split: '拆分 PDF',
        compress: '压缩 PDF',
        reorder: '页面排序'
      };
      
      const proTools = ['compress', 'reorder'];
      
      title.textContent = toolNames[tool] || 'PDF 工具';
      
      if (proTools.includes(tool)) {
        badge.textContent = 'Pro';
        badge.className = 'badge pro-badge';
      } else {
        badge.textContent = '免费试用';
        badge.className = 'badge free-badge';
      }
      
      workspace.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      
      const body = document.querySelector('#workspaceBody');
      
      // Render tool
      switch(tool) {
        case 'merge':
          PDFKIT.MergeTool.render(body);
          break;
        case 'split':
          PDFKIT.SplitTool.render(body);
          break;
        case 'compress':
          PDFKIT.CompressTool.render(body);
          break;
        case 'reorder':
          PDFKIT.ReorderTool.render(body);
          break;
      }
    },
    
    closeWorkspace() {
      document.querySelector('#workspace').classList.add('hidden');
      document.body.style.overflow = '';
      this.currentTool = null;
    },
    
    bindWorkspaceClose() {
      document.querySelector('#closeWorkspace').addEventListener('click', () => this.closeWorkspace());
      document.querySelector('#workspace').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) this.closeWorkspace();
      });
    },
    
    bindLicenseActions() {
      // Open license modal
      document.querySelector('#licenseBtn').addEventListener('click', () => {
        openLicenseModal();
      });
      
      // Activate license
      document.querySelector('#activateBtn').addEventListener('click', () => {
        this.activateLicense();
      });
      
      // Open purchase modal
      document.querySelector('#purchaseBtn').addEventListener('click', () => {
        closeLicenseModal();
        openPaymentModal();
      });
      
      // Checkout button
      document.querySelector('#checkoutBtn').addEventListener('click', () => {
        PDFKIT.openCheckout();
      });
      
      // License key input Enter
      document.querySelector('#licenseKeyInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.activateLicense();
      });
    },
    
    activateLicense() {
      const input = document.querySelector('#licenseKeyInput');
      const error = document.querySelector('#licenseError');
      const success = document.querySelector('#licenseSuccess');
      
      error.classList.add('hidden');
      success.classList.add('hidden');
      
      const result = PDFKIT.activateLicense(input.value);
      
      if (result.success) {
        success.textContent = '✓ 许可激活成功！所有 Pro 功能已解锁。';
        success.classList.remove('hidden');
        this.updateUI();
        // Close modal after a moment
        setTimeout(() => {
          closeLicenseModal();
          this.showToast('🎉 Pro 功能已解锁！感谢你的支持！', 'success');
        }, 1500);
      } else {
        error.textContent = result.error;
        error.classList.remove('hidden');
      }
    },
    
    updateUI() {
      const isPro = PDFKIT.isPro();
      document.querySelectorAll('.tool-card').forEach(card => {
        const tool = card.dataset.tool;
        if (tool === 'compress' || tool === 'reorder') {
          const badge = card.querySelector('.badge');
          if (badge) {
            badge.textContent = isPro ? '已解锁 ✓' : 'Pro';
            badge.className = isPro ? 'badge success-badge' : 'badge pro-badge';
          }
        }
      });
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
  
  // Global functions for inline onclick handlers
  window.openLicenseModal = function() {
    document.querySelector('#licenseModal').classList.remove('hidden');
    document.querySelector('#licenseKeyInput').value = '';
    document.querySelector('#licenseError').classList.add('hidden');
    document.querySelector('#licenseSuccess').classList.add('hidden');
  };
  
  window.closeLicenseModal = function() {
    document.querySelector('#licenseModal').classList.add('hidden');
  };
  
  window.openPaymentModal = function() {
    document.querySelector('#paymentModal').classList.remove('hidden');
  };
  
  window.closePaymentModal = function() {
    document.querySelector('#paymentModal').classList.add('hidden');
  };
  
  // Add success badge style
  const style = document.createElement('style');
  style.textContent = `
    .success-badge { background: #dcfce7; color: #166534; }
  `;
  document.head.appendChild(style);
  
  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})();
