# BBF 的个人博客

[bbfbbf.cn](https://bbfbbf.cn) 使用 Next.js 16 Pages Router、React 19、Ant Design 6 和 Prisma ORM 7.10.1。首页、文章、分类和标签采用增量静态生成（ISR）。首页的 Sakana 组件通过 npm 安装，源码维护在 [sakana-react](https://github.com/boiboif/sakana-react)。

## 本地开发

使用 Node.js 22 LTS（22.12 起）或 Node.js 24 LTS，以及 `package.json` 指定的 pnpm 版本。在仓库根目录的 `.env` 配置开发用的 `DATABASE_URL`（MySQL 连接串）和 `JWT_SECRET`（随机生成的会话签名密钥）。构建时需要读取文章，运行时还需要执行后台写入。开发和生产应分别配置数据库与密钥。

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm exec prisma generate
```

第一次使用**空的本地测试库**时，运行 `corepack pnpm exec prisma db push` 创建表。随后运行 `corepack pnpm dev`，访问 [本地博客](http://localhost:8010)。

### MySQL 与 TiDB 连接

Prisma CLI 和服务端共用 `DATABASE_URL`。服务端使用 `@prisma/adapter-mariadb`，TiDB Cloud 的 `?sslaccept=strict` 会启用 TLS 并验证服务器证书。使用私有 CA 时可附加 `sslcert`，相对路径从项目的 `prisma/` 目录解析，对应证书文件需要在部署产物中可读。

在 Vercel 的各环境分别提供构建和运行所需的连接串。`connection_limit`、`connect_timeout`、`pool_timeout` 和 `socket_timeout` 仍可配置，超时单位为秒。MariaDB 驱动不支持 `pool_timeout=0` 的无限等待。升级已有配置时，删除该参数可使用默认的 10 秒，也可以配置 1 至 2147483 秒。连接上限按运行实例计算。生成的客户端位于 `generated/prisma/`，由开发、检查类型和构建命令生成。

## 管理员和发布

首次建站时，将初始管理员密码放入进程环境变量 `ADMIN_PASSWORD`，可用 `ADMIN_USERNAME` 设置用户名，默认值为 `admin`。运行 `corepack pnpm db:bootstrap` 后即可清除初始密码环境变量。对已有管理员重复执行命令会保留原密码。

从旧版升级时，核对数据库中带有 `admin` 角色的账号，并撤销未经授权的角色。使用旧版初始密码的管理员需要单独更换密码。

```sh
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm start
```

生产服务默认监听 3000 端口。构建只生成 Prisma 客户端并读取页面数据。文章发布、修改和删除后，服务端刷新首页、分类、标签和对应的文章页。分类变更会刷新所有文章页的分类导航，标签重命名或删除会刷新关联的文章页。页面保留 60 秒的 ISR 周期，后台刷新出错时可在后续访问中重试。已有文章链接、分类查询参数 `cateId` 和标签查询参数 `tags` 可继续使用。

## Markdown 与图片

后台文章编辑器支持从工具栏插入图片地址或选择本地文件，也可以将图片粘贴、拖入编辑区。上传支持 PNG、JPEG、GIF、WebP 和 AVIF，每张最多 20 MiB。编辑预览和公开文章会跟随系统的亮色或暗色设置。

管理员上传 3 MiB 以内的图片时，文件经博客接口写入 Vercel Blob。更大的文件由浏览器直传 Blob，服务端校验文件大小和格式后返回图片地址。编辑器保留原图，Markdown 只保存图片 URL。为部署环境关联 Public Blob 存储后需重新部署，该环境的上传功能才会生效。图片在上传完成后即可通过链接访问，包括还在编辑的草稿图片。

## 验证发布流程

在独立测试库上初始化管理员，运行生产构建并通过 `corepack pnpm exec next start -p 8010` 启动。设置 `TEST_ADMIN_PASSWORD`（如自定义用户名则同时设置 `TEST_ADMIN_USERNAME`），然后运行：

```sh
node --test tests/*.test.mjs
```

默认测试地址为 `http://127.0.0.1:8010`，可通过 `TEST_BLOG_ORIGIN` 指向其他本机端口。发布回归会新建两篇带分类和标签的测试文章，验证首屏正文、摘要、浏览计数、编辑和删除后的缓存，结束时清理这些内容。

设置 `TEST_BROWSER_PATH` 为 Chrome 或 Edge 的可执行文件路径，可同时验证桌面与手机宽度下的文章导航、React 水合和关闭 JavaScript 时的正文与样式。
