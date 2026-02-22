import fetch from 'node-fetch';

/**
 * SearxNG搜索客户端
 */
export class SearchClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8888') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除末尾斜杠
  }

  /**
   * 通用搜索
   */
  async search(params: {
    query: string;
    category?: string;
    language?: string;
    timeRange?: string;
    limit?: number;
  }) {
    const {
      query,
      category = 'general',
      language = 'zh-CN',
      timeRange,
      limit = 10,
    } = params;

    // 构建SearxNG搜索URL
    const searchUrl = new URL(`${this.baseUrl}/search`);
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('format', 'json');
    searchUrl.searchParams.append('category', category);
    searchUrl.searchParams.append('language', language);

    // 时间范围过滤
    if (timeRange) {
      const timeMap: { [key: string]: string } = {
        day: 'day',
        week: 'week',
        month: 'month',
        year: 'year',
      };
      if (timeMap[timeRange]) {
        searchUrl.searchParams.append('time_range', timeMap[timeRange]);
      }
    }

    try {
      const response = await fetch(searchUrl.toString(), {
        headers: {
          'Accept': 'application/json',
          'X-Forwarded-For': '127.0.0.1',
          'X-Real-IP': '127.0.0.1',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as any;

      // 解析SearxNG响应
      const results = (data.results || []).slice(0, limit).map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        content: item.content || '',
        snippet: item.content || '',
        engine: item.engine || '',
        category: item.category || '',
        score: item.score || 0,
        isImage: item.img_src ? true : false,
        thumbnail: item.img_src || null,
        favicon: item.favicon || null,
        publishedDate: item.publishedDate || null,
      }));

      return {
        query,
        category,
        language,
        totalResults: results.length,
        results,
        meta: {
          searchUrl: searchUrl.toString(),
          engines: (data.query as any)?.engines || [],
          answered: (data as any).answers || [],
          infoboxes: (data as any).infoboxes || [],
        },
      };
    } catch (error) {
      throw new Error(`搜索失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 图片搜索
   */
  async searchImages(params: { query: string; limit?: number }) {
    const { query, limit = 10 } = params;

    const results = await this.search({
      query,
      category: 'images',
      language: 'zh-CN',
      limit,
    });

    // 过滤有图片的结果
    const imageResults = results.results
      .filter((r: any) => r.thumbnail || r.url.match(/\.(jpg|jpeg|png|gif|webp)/i))
      .map((r: any) => ({
        title: r.title,
        url: r.url,
        thumbnail: r.thumbnail || r.url,
        content: r.content,
        source: r.engine,
      }));

    return {
      query,
      totalResults: imageResults.length,
      images: imageResults,
    };
  }

  /**
   * 视频搜索
   */
  async searchVideos(params: { query: string; limit?: number }) {
    const { query, limit = 10 } = params;

    const results = await this.search({
      query,
      category: 'videos',
      language: 'zh-CN',
      limit,
    });

    // 过滤视频结果
    const videoResults = results.results
      .filter((r: any) => {
        const videoDomains = ['youtube.com', 'vimeo.com', 'bilibili.com', 'youku.com', 'qq.com'];
        return videoDomains.some(d => r.url.includes(d)) || r.category === 'video';
      })
      .map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
        source: r.engine,
        publishedDate: r.publishedDate,
      }));

    return {
      query,
      totalResults: videoResults.length,
      videos: videoResults,
    };
  }

  /**
   * 新闻搜索
   */
  async searchNews(params: { query: string; limit?: number }) {
    const { query, limit = 10 } = params;

    const results = await this.search({
      query,
      category: 'news',
      language: 'zh-CN',
      limit,
    });

    // 过滤并格式化新闻结果
    const newsResults = results.results.map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
      source: r.engine,
      publishedDate: r.publishedDate,
    }));

    return {
      query,
      totalResults: newsResults.length,
      news: newsResults,
    };
  }

  /**
   * 检查SearxNG服务是否可用
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}