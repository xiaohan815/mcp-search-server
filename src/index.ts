#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { SearchClient } from './search.js';

// SearxNG端点配置
const SEARXNG_URL = process.env.SEARXNG_URL || 'http://localhost:8888';

class MCPSearchServer {
  private server: Server;
  private searchClient: SearchClient;

  constructor() {
    this.server = new Server({
      name: 'free-search-server',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.searchClient = new SearchClient(SEARXNG_URL);
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'webSearch',
            description: '搜索网络信息，返回网页标题、URL、摘要、网站名称、图标等',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '搜索关键词',
                },
                category: {
                  type: 'string',
                  description: '搜索类别 (general, images, videos, news, map, music, it, science, files, social)',
                  default: 'general',
                },
                language: {
                  type: 'string',
                  description: '语言 (zh-CN, en, 等)',
                  default: 'zh-CN',
                },
                timeRange: {
                  type: 'string',
                  description: '时间范围 (day, week, month, year)',
                },
                limit: {
                  type: 'number',
                  description: '返回结果数量 (1-20)',
                  default: 10,
                  minimum: 1,
                  maximum: 20,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'webSearchImages',
            description: '搜索图片，返回图片URL、标题、来源等信息',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '图片搜索关键词',
                },
                limit: {
                  type: 'number',
                  description: '返回结果数量 (1-20)',
                  default: 10,
                  minimum: 1,
                  maximum: 20,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'webSearchVideos',
            description: '搜索视频，返回视频URL、标题、来源等信息',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '视频搜索关键词',
                },
                limit: {
                  type: 'number',
                  description: '返回结果数量 (1-20)',
                  default: 10,
                  minimum: 1,
                  maximum: 20,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'webSearchNews',
            description: '搜索新闻，返回新闻标题、URL、发布时间、来源等',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '新闻搜索关键词',
                },
                limit: {
                  type: 'number',
                  description: '返回结果数量 (1-20)',
                  default: 10,
                  minimum: 1,
                  maximum: 20,
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const toolArgs = args || {};
        switch (name) {
          case 'webSearch':
            const results = await this.searchClient.search({
              query: toolArgs.query as string,
              category: toolArgs.category as string || 'general',
              language: toolArgs.language as string || 'zh-CN',
              timeRange: toolArgs.timeRange as string,
              limit: toolArgs.limit as number || 10,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results, null, 2),
                },
              ],
            };

          case 'webSearchImages':
            const imageResults = await this.searchClient.searchImages({
              query: toolArgs.query as string,
              limit: toolArgs.limit as number || 10,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(imageResults, null, 2),
                },
              ],
            };

          case 'webSearchVideos':
            const videoResults = await this.searchClient.searchVideos({
              query: toolArgs.query as string,
              limit: toolArgs.limit as number || 10,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(videoResults, null, 2),
                },
              ],
            };

          case 'webSearchNews':
            const newsResults = await this.searchClient.searchNews({
              query: toolArgs.query as string,
              limit: toolArgs.limit as number || 10,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(newsResults, null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: errorMessage,
                hint: '确保SearxNG服务正在运行: ' + SEARXNG_URL,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Free Search MCP Server running with SearxNG:', SEARXNG_URL);
  }
}

// 启动服务器
const server = new MCPSearchServer();
server.run().catch(console.error);