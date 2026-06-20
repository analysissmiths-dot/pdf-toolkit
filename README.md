# PDFKit - 隐私优先的 PDF 工具箱

> 在浏览器和微信中本地处理 PDF，文件不上传任何服务器。
> 一次性付费 $19，终身使用。

## 在线体验

🌐 **Web 版**: https://analysissmiths-dot.github.io/pdf-toolkit/

📱 **微信小程序**: 搜索「PDFKit」或扫码体验（开发版）

## 功能

| 功能 | 免费版 | Pro 版 |
|------|--------|--------|
| 📄 合并 PDF | ✅ 限 2 个文件 | ✅ 无限制 |
| ✂️ 拆分 PDF | ✅ 限 10 页 | ✅ 无限制 |
| 🗜️ 压缩 PDF | ❌ | ✅ |
| 🔀 页面排序 | ❌ | ✅ |

- 所有处理在本地完成，不上传任何文件
- 使用 pdf-lib 进行纯前端 PDF 处理
- 一次性付费 $19，终身使用

## 技术栈

- **Web 版**: HTML + CSS + JavaScript (Vanilla) + pdf-lib
- **微信小程序**: WXML + WXSS + JavaScript + pdf-lib
- **部署**: GitHub Pages (Web) + 微信小程序 (Mini Program)

## 付费

使用 LemonSqueezy 收款，HMAC 签名密钥验证。

**Demo 密钥**: `PDFKIT-DEMO-2026-FULL`

## 本地开发

```bash
# Web 版
cd pdf-toolkit
# 直接用浏览器打开 index.html 即可

# 微信小程序
cd miniprogram
npm install
# 用微信开发者工具打开此目录
```

## 项目结构

```
pdf-toolkit/
├── index.html          # Web 版入口
├── css/style.css       # 样式
├── js/
│   ├── app.js          # Web 应用主逻辑
│   ├── payment.js      # 付费/许可系统
│   └── tools/          # PDF 工具
│       ├── merge.js
│       ├── split.js
│       ├── compress.js
│       └── reorder.js
├── api/                # 可选的服务端 API
├── miniprogram/        # 微信小程序源码
└── .github/workflows/  # CI/CD
```
