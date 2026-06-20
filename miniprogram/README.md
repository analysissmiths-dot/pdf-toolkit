# PDFKit 微信小程序

隐私优先的 PDF 工具箱小程序。所有处理在本地完成，文件不上传任何服务器。

## 开发环境

需要安装微信开发者工具：
- 已安装: `/Applications/wechatwebdevtools.app`

## 打开项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择本目录: `这里填写完整路径`
4. 填入你的 AppID（或使用测试号）
5. 点击导入

## 安装依赖

```bash
cd miniprogram
npm install
```

然后在微信开发者工具中：
1. 点击菜单「工具」→「构建 npm」
2. 构建完成后即可使用

## 页面结构

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | pages/index/index | 工具列表 |
| 合并 PDF | pages/merge/merge | 免费功能 |
| 拆分 PDF | pages/split/split | 免费功能 |
| 压缩 PDF | pages/compress/compress | Pro 功能 |
| 页面排序 | pages/reorder/reorder | Pro 功能 |
| 升级 Pro | pages/pro/pro | 购买/激活 |

## 技术栈

- 微信小程序原生框架
- pdf-lib: PDF 操作（合并/拆分/压缩/排序）
- 所有处理在本地完成，不上传文件

## 盈利模式

- 免费版：合并（限2文件）、拆分（限10页）
- Pro 版 ($19)：全部功能无限制
- 付费方式：支持 WeChat Pay / LemonSqueezy
