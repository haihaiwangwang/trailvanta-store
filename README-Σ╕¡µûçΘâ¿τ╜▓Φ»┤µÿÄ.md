# TRAILVANTA 国际商城演示版

这是 TRAILVANTA 的第一阶段演示商城，面向美国、加拿大、英国和欧洲顾客，英文界面、手机优先。当前不接入任何支付渠道。

## 当前已实现
- 品牌首页、户外风格视觉、分类入口
- 16 款演示商品，4 个分类：Camping、Fitness、Cycling、Water Sports
- 商品搜索和分类筛选
- 购物车：添加、数量增减、删除、金额小计
- 收货信息表单和未付款订单请求接口
- 客户联系表单
- 手机、平板、桌面响应式布局
- 首页商品先由本地演示数据立即渲染；随后尝试从 `/api/products` 同步后台商品
- 商品 API 使用 CDN 缓存响应头；静态 CSS/JS 设置长期缓存

## 当前限制
- **支付未接入**，订单只是待付款订单请求，不代表已付款或正式发货。
- 商品图片暂时使用轻量 CSS 商品图形，不是实物商品照片；后续可替换为经过压缩的 WebP/AVIF 图片。
- 演示商品名称、价格、库存仅用于预览，上线销售前必须替换为真实、准确的信息。
- 订单和联系表单需要 Cloudflare Pages Functions 与 D1 正确部署并绑定后才能保存数据；仅本地静态预览时，商品展示、筛选和购物车可用，提交接口不可用。
- 正式运营前还需完善管理员界面、订单通知、隐私/退换货/配送政策、反垃圾与速率限制、库存并发控制、备份和安全测试。

## 本地预览（Windows）
1. 双击打开 `public` 文件夹。
2. 双击 `index.html`，即可在浏览器查看首页、分类、商品和购物车。
3. 如果浏览器自动翻译成中文，可在 Edge 地址栏右侧翻译菜单中选择“显示原文”，以查看英文商城。
4. 直接用 `file://` 打开时，后台 `/api` 接口无法运行，因此订单提交和联系表单不会保存；这属于本地文件预览限制。需要测试后台时再部署到 Cloudflare Pages。

## 部署到 Cloudflare Pages
1. 将本项目文件上传到 GitHub 仓库，保持 `public`、`functions`、`migrations` 目录结构。
2. Cloudflare → Workers & Pages → Create application → Pages → Connect to Git，选择仓库。
3. Framework preset 选 `None`；Build command 留空；Build output directory 填 `public`。
4. Cloudflare → Storage & databases → D1 → Create database，数据库名可用 `trailvanta-db`。
5. 新数据库按顺序执行 `migrations/0001_init.sql`、`migrations/0002_expand_demo_catalog.sql`。如果你之前已经执行过旧版 `0001_init.sql`，不要再次执行建表脚本，只执行 `0002_expand_demo_catalog.sql` 补齐演示商品。
6. Pages 项目 Settings → Functions → D1 database bindings，变量名填 `DB`，绑定刚创建的数据库。
7. 保存设置并重新部署。
8. 打开网站，测试首页、商品筛选、购物车；部署后再测试 `/api/products`、订单请求和联系表单。

## 速度设计
- 首屏不依赖远程大图或自动播放视频，避免等待第三方图片才出现主要内容。
- 商品目录先用本地演示数据立即显示，后台 API 在后台同步一次。
- 商品 API 返回 CDN 可缓存响应头；CSS 和 JS 设置长期缓存。
- 页面使用系统字体回退；Google Fonts 只作为渐进增强，字体加载失败时仍可正常显示。
- 目前是轻量前端版本；真实上线后仍需从美国、加拿大、英国、欧洲的手机网络和 TikTok 内置浏览器实测加载速度。

## API
- `GET /api/products`
- `POST /api/orders`
- `POST /api/contact`
- `GET /api/admin/orders`（需要 `Authorization: Bearer <ADMIN_TOKEN>`）

不要把密钥写进前端或提交到公开 GitHub 仓库。D1 免费额度不是无限的，请监控用量并定期备份。
