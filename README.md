# BBF 的个人博客

[bbfbbf.cn](https://bbfbbf.cn) 使用 Next.js 16 Pages Router、React 19、Ant Design 6 和 Prisma。首页、文章、分类和标签采用增量静态生成（ISR）。首页的 Sakana 组件通过 npm 安装，源码维护在 [sakana-react](https://github.com/boiboif/sakana-react)。

## 本地开发

使用 Node.js 22.12 或更高版本和 `package.json` 指定的 pnpm 版本。在仓库根目录的 `.env` 配置开发用的 `DATABASE_URL`（MySQL 连接串）和 `JWT_SECRET`（随机生成的会话签名密钥）。构建时需要读取文章，运行时还需要执行后台写入。开发和生产应分别配置数据库与密钥。

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm exec prisma generate
```

第一次使用**空的本地测试库**时，运行 `corepack pnpm exec prisma db push` 创建表。随后运行 `corepack pnpm dev`，访问 [本地博客](http://localhost:8010)。

## 管理员和发布

首次建站时，将初始管理员密码放入进程环境变量 `ADMIN_PASSWORD`，可用 `ADMIN_USERNAME` 设置用户名，默认值为 `admin`。运行 `corepack pnpm db:bootstrap` 后即可清除初始密码环境变量。对已有管理员重复执行命令会保留原密码。

```sh
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm start
```

生产服务默认监听 3000 端口。构建只生成 Prisma 客户端并读取页面数据。文章发布、修改和删除后，服务端刷新首页、分类、标签和对应的文章页。页面保留 60 秒的 ISR 周期，后台刷新出错时可在后续访问中重试。已有文章链接、分类查询参数 `cateId` 和标签查询参数 `tags` 可继续使用。

## 验证发布流程

在独立测试库上初始化管理员，运行生产构建并通过 `corepack pnpm exec next start -p 8010` 启动。设置 `TEST_ADMIN_PASSWORD`（如自定义用户名则同时设置 `TEST_ADMIN_USERNAME`），然后运行：

```sh
node --test tests/*.test.mjs
```

默认测试地址为 `http://127.0.0.1:8010`，可通过 `TEST_BLOG_ORIGIN` 指向其他本机端口。发布回归会新建两篇带分类和标签的测试文章，验证首屏正文、摘要、浏览计数、编辑和删除后的缓存，结束时清理这些内容。

设置 `TEST_BROWSER_PATH` 为 Chrome 或 Edge 的可执行文件路径，可同时验证桌面与手机宽度下的文章导航、React 水合和关闭 JavaScript 时的正文与样式。
