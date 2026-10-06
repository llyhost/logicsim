# LogicSim（量词增强 · 现代化改造版）

一个把**逻辑表达式**自动转换为**电路风格图形**的纯前端工具。

本项目改造自 [kuangdash/logicsim](https://gitlab.com/kuangdash/logicsim)（2021 年，GitLab Pages 地址：<https://kuangdash.gitlab.io/logicsim>）。

## 功能

在文本框内输入**逆波兰逻辑表达式**，即可解析为图模型 JSON，并一键生成自动布局的正规图形（多路选择器 SEL 树），支持画布缩放、拖拽、导航图、元素改名、JSON 保存/载入。

### 五种基本运算符（原有）

| 逆波兰写法 | 含义 |
| ---------- | ---- |
| `a b .` | a 与 b（与） |
| `a b ,` | a 或 b（或） |
| `a <` | 非 a（非） |
| `a b >` | a 推出 b（蕴含） |
| `a b =` | a 等价 b（同或） |

### 两种量词（本次改造新增）

| 逆波兰写法 | 含义 |
| ---------- | ---- |
| `A x @` | ∀x.A（全称量词） |
| `A x #` | ∃x.A（存在量词） |

量词在解析时按定义自动**消去**（量化消去）：

- `∀x.A` 展开为 `A(x:=0) ∧ A(x:=1)`，即逆波兰式 `A(x:=0) A(x:=1) .`
- `∃x.A` 展开为 `A(x:=0) ∨ A(x:=1)`，即逆波兰式 `A(x:=0) A(x:=1) ,`

示例：

- `a x = x @` 即 ∀x(a⇔x)，化简后恒为假（图形显示常量 0）
- `a x = x #` 即 ∃x(a⇔x)，化简后恒为真（图形显示常量 1）
- `a b . fe >` 即“a 与 b 推出 fe”
- `a b . fe ge > =` 即“a 与 b 等价于 fe 推出 ge”

## 本次改造内容

1. **量词支持**：新增 `@`（∀）与 `#`（∃）两个量词运算符，基于命题逻辑量词消去原理实现（见 `public/LogicParser.js` 中的 `QuantifierExpand`），完全兼容原有解析器；解析后展示“量词消去后”的等价表达式。
2. **现代化 UI**：
   - 全新设计系统：CSS 变量驱动的浅色/深色双主题（右上角切换，偏好本地记忆）
   - 卡片式布局、圆角阴影、系统字体栈，替代原 W3.css 风格
   - 运算符/量词快捷插入按钮、示例表达式一键载入并渲染
   - 中文界面与帮助文档
3. 保留原有全部功能：文本↔图互转、画布交互、导航图、JSON 载入/保存、元素改名等。

## 本地运行

纯静态站点，无需构建：

```bash
git clone <本仓库地址>
cd logicsim/public
python -m http.server 8000
# 浏览器打开 http://localhost:8000
```

（也可以直接双击 `public/index.html` 打开。）

## 部署（免费静态托管）

### GitLab Pages（本项目自带 `.gitlab-ci.yml`，推送即自动部署）

```bash
git push <你的 gitlab 远程> main
# Pages 地址：https://<用户名>.gitlab.io/<项目名>/
```

### GitHub Pages

仓库附带 `.github/workflows/pages.yml`，推送到 GitHub 后在
Settings → Pages → Build and deployment → Source 选择 **GitHub Actions** 即可，
地址为 `https://<用户名>.github.io/<仓库名>/`。

### Cloudflare Pages / Vercel

均为纯静态站点：框架预设选 **None**，构建命令留空，输出目录填 `public`。

## 目录结构

```
public/            站点根目录
├── index.html     页面结构
├── LogicParser.js 表达式解析（含量词消去 QuantifierExpand）
├── ViewGen.js     应用控制器（画布、交互、主题等）
├── style.css      现代化样式
└── lib/           本地依赖（joint.js、dagre 等）
```

## 许可与致谢

- 原项目：[kuangdash/logicsim](https://gitlab.com/kuangdash/logicsim)
- 依赖库：JointJS、dagre、graphlib、jQuery、Lodash、Backbone、Select2
