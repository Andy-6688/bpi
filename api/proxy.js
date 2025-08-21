import http from 'http';
import https from 'https';
import { URL } from 'url';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export default async function handler(req, res) {
  const targetUrl = 'https://ewaltooshncobyax.shop/ph';
  
  console.log('=== 开始代理请求 ===');
  console.log('请求URL:', req.url);

  try {
    const parsedUrl = new URL(targetUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + (req.url === '/' ? '' : req.url),
      method: req.method,
      headers: {
        'Host': parsedUrl.hostname,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      agent: parsedUrl.protocol === 'https:' ? httpsAgent : undefined,
      timeout: 10000
    };

    console.log('代理目标:', options.hostname + options.path);

    const proxyReq = client.request(options, (proxyRes) => {
      console.log('目标网站响应状态:', proxyRes.statusCode);
      
      // 设置状态码
      res.statusCode = proxyRes.statusCode;
      
      // 只复制安全的headers
      const safeHeaders = ['content-type', 'cache-control', 'expires'];
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        const lowerKey = key.toLowerCase();
        if (safeHeaders.includes(lowerKey)) {
          res.setHeader(key, value);
        }
      }

      console.log('开始传输数据...');
      
      // 直接管道传输，但监听错误
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('代理请求错误:', err.message);
      if (!res.headersSent) {
        res.status(500).send('Proxy Request Error');
      }
    });

    proxyReq.on('timeout', () => {
      console.error('请求超时');
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).send('Gateway Timeout');
      }
    });

    proxyReq.end();

  } catch (error) {
    console.error('未预期错误:', error.message);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  }
}