import http from 'http';
import https from 'https';
import { URL } from 'url';

export default async function handler(req, res) {
  const targetUrl = 'https://www.reworser.cc/ph';
  
  // 设置超时，防止无限加载
  res.setTimeout(10000, () => {
    if (!res.headersSent) {
      res.status(504).send('Gateway Timeout');
    }
  });

  try {
    const parsedUrl = new URL(targetUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + (req.url === '/' ? '' : req.url),
      method: req.method,
      headers: {
        'Host': parsedUrl.hostname,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      }
    };

    console.log('开始代理请求:', options.hostname);

    const proxyReq = client.request(options, (proxyRes) => {
      console.log('收到响应:', proxyRes.statusCode);
      
      // 快速设置状态码和headers
      res.statusCode = proxyRes.statusCode;
      
      // 只复制必要的headers
      const safeHeaders = ['content-type', 'cache-control'];
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        if (safeHeaders.includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      }

      // 直接管道传输，不进行任何处理
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('请求错误:', err.message);
      if (!res.headersSent) {
        res.status(500).end();
      }
    });

    // 设置代理请求超时
    proxyReq.setTimeout(8000, () => {
      console.error('代理请求超时');
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).send('Proxy Timeout');
      }
    });

    proxyReq.end();

  } catch (error) {
    console.error('捕获错误:', error.message);
    if (!res.headersSent) {
      res.status(500).end();
    }
  }
}