import http from 'http';
import https from 'https';
import { URL } from 'url';

export default async function handler(req, res) {
  // 使用最新的目标网址
  const targetUrl = 'https://qqq.dinerclubshop.com/q7WmgI75ye';
  
  console.log('代理到:', targetUrl);
  
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
      },
      timeout: 10000
    };

    console.log('请求选项:', options);

    const proxyReq = client.request(options, (proxyRes) => {
      console.log('响应状态码:', proxyRes.statusCode);
      
      res.statusCode = proxyRes.statusCode;
      
      // 复制headers
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        res.setHeader(key, value);
      }

      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('错误:', err.message);
      res.status(500).send('代理错误: ' + err.message);
    });

    proxyReq.end();

  } catch (error) {
    console.error('捕获错误:', error.message);
    res.status(500).send('服务器错误: ' + error.message);
  }
}