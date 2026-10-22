# 崔瑞昊 · 个人作品集

在线访问：[crh1381328-code.github.io/portfolio](https://crh1381328-code.github.io/portfolio/)

数字媒体艺术本科在读（2027 届），方向是 **AIGC 视频创作 / AI 视觉内容制作 / AI 产品经理**，同时做长视频叙事剪辑、AE 动效与商业合作内容。

## 内容结构

- **简历主页**：身份、方向、三段经历、教育背景、能力与工具
- **作品**：6 件精选案例 + 48 件作品档案（AI 工具 2、长视频 10、商业合作 9、AIGC 影像 3、AE 动效 24），支持分类筛选、搜索与排序
- **案例页**：共享背包、高空缆车、AE 动效、分镜工坊、影策、商业合作
- **服务与联系**：可承接的内容类型、联系方式与简历 PDF 下载

## 技术说明

- 静态站点，无运行时依赖，直接由 GitHub Pages 托管
- 页面内为哈希路由 SPA；`index.html` 只含结构与数据（约 220 KB，gzip 后约 57 KB），图片、字体与视频按哈希文件名放在 `assets/` 下，便于并行加载与长缓存
- 媒体按需加载：首屏人像与展示字体预加载，其余图片 `loading="lazy"`，AE 动效卡片进入视口才注入视频地址；滚动时以封面垫底、解码完成后淡入
- `assets/videos/` 存放体积较大的成片，按需流式播放

资源目录：

```
assets/fonts/   4 个 woff2 子集字体
assets/media/   59 张 WebP（六件案例主图与 48 件作品封面，去重后）
assets/videos/ae/  24 条 AE 动效短片（卡片进视口才请求）
assets/videos/aigc/ 3 条 AIGC 成片
```

本地预览任意静态服务器即可，例如：

```sh
npx serve .
```

## 版权与致谢

页面版式改编自 [vCard - Personal Portfolio](https://github.com/codewithsadee/vcard-personal-portfolio)（MIT License，见 `LICENSE`），在此基础上重构为单页应用并替换全部内容与视觉资产。作品影像、文字与照片版权归崔瑞昊所有。
