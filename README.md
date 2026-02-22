# Free Search MCP Server

基于 **SearxNG** 的免费搜索MCP服务器，无需API密钥，完全自托管。

## 🌟 功能特性

- ✅ **通用搜索** - 网页、新闻、图片、视频等多类别搜索
- ✅ **完全免费** - 自建SearxNG实例，无API费用
- ✅ **隐私保护** - SearxNG聚合多个搜索引擎，保护隐私
- ✅ **无限制** - 不像Brave Search每月2000次限制
- ✅ **高度可定制** - 支持时间范围、语言、类别等过滤

## 📦 包含工具

1. **`webSearch`** - 通用网页搜索
   - 支持多个搜索类别
   - 返回标题、URL、摘要、网站图标等
   - 时间范围过滤

2. **`webSearchImages`** - 图片搜索
   - 返回图片URL和缩略图
   - 支持多源图片聚合

3. **`webSearchVideos`** - 视频搜索
   - 支持YouTube、Bilibili等平台
   - 返回视频链接和简介

4. **`webSearchNews`** - 新闻搜索
   - 实时新闻搜索
   - 包含发布时间

## 🚀 快速开始

### 1. 部署SearxNG

```bash
docker run -d \
  --name searxng \
  -p 8888:8080 \
  -e "BASE_URL=http://localhost:8888/" \
  searxng/searxng:latest
```

验证服务：
```bash
curl http://localhost:8888/config
```

访问Web界面：http://localhost:8888

### 2. 安装依赖

```bash
cd /home/lpsadmin/work/mcp-search-server
npm install
```

### 3. 编译

```bash
npm run build
```

### 4. 配置到Claude Code

编辑Claude Code配置文件（`~/.config/Claude/claude_code_config.json` 或 `~/.claude.json`）：

```json
{
  "mcpServers": {
    "free-search": {
      "command": "node",
      "args": ["/home/lpsadmin/work/mcp-search-server/dist/index.js"],
      "env": {
        "SEARXNG_URL": "http://localhost:8888"
      }
    }
  }
}
```

### 5. 重启Claude Code

## 📖 使用示例

### 基础搜索
```
帮我搜索最新的AI技术发展
查找Python异步编程的最佳实践
```

### 图片搜索
```
搜索"猫"的图片
找一些风景壁纸
```

### 视频搜索
```
搜索JavaScript教程视频
找做饭教程
```

### 新闻搜索
```
搜索今天的科技新闻
查找最新的AI新闻
```

## 🔧 高级配置

### SearxNG自定义配置

如需自定义SearxNG配置（搜索引擎、主题等）：

```bash
docker run -d \
  --name searxng \
  -p 8888:8080 \
  -v /path/to/searxng/config:/etc/searxng \
  -e "BASE_URL=http://localhost:8888/" \
  searxng/searxng:latest
```

参考：https://docs.searxng.org

### 使用其他SearxNG实例

如果已有SearxNG实例或使用公共实例：

```json
{
  "mcpServers": {
    "free-search": {
      "command": "node",
      "args": ["/home/lpsadmin/work/mcp-search-server/dist/index.js"],
      "env": {
        "SEARXNG_URL": "https://your-searxng-instance.com"
      }
    }
  }
}
```

## 🧪 测试

```bash
npm test
```

或直接运行测试脚本：
```bash
node test_search.js
```

## 📂 项目结构

```
mcp-search-server/
├── src/
│   ├── index.ts      # MCP服务器入口
│   └── search.ts     # SearxNG客户端
├── dist/             # 编译输出
├── test_search.js    # 测试脚本
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 与智谱Search MCP对比

| 特性 | 智谱Search | 本项目 |
|------|-----------|--------|
| 费用 | 付费API | ✅ 完全免费 |
| API密钥 | 必需 | ✅ 不需要 |
| 搜索源 | 智谱AI | ✅ 多引擎聚合 |
| 使用限制 | 付费额度 | ✅ 无限制 |
| 隐私保护 | 未知 | ✅ SearxNG保护隐私 |
| 图片搜索 | 支持 | ✅ 支持 |
| 视频搜索 | 支持 | ✅ 支持 |
| 新闻搜索 | 支持 | ✅ 支持 |

## 🛠️ 故障排除

### SearxNG无法访问

检查Docker容器状态：
```bash
docker ps | grep searxng
docker logs searxng
```

### 搜索无结果

1. 检查SearxNG Web界面是否正常
2. 尝试不同搜索引擎类别
3. 检查网络连接

### MCP工具无法调用

1. 确认`SEARXNG_URL`环境变量正确
2. 重启Claude Code
3. 查看终端日志

## 📚 相关资源

- [SearxNG官方文档](https://docs.searxng.org/)
- [MCP协议官方文档](https://modelcontextprotocol.io/)
- [Claude Code MCP配置指南](https://docs.anthropic.com/en/docs/claude-code/mcp)

## 📄 许可证

MIT License

## 🙏 致谢

- [SearxNG](https://github.com/searxng/searxng) - 开源元搜索引擎
- [Model Context Protocol](https://modelcontextprotocol.io/) - 上下文协议