import http from 'http';
import https from 'https';
import { URL } from 'url';

// 创建一个忽略SSL证书验证的httpsAgent
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export default async function handler(req, res) {
  const targetUrl = 'https://ewaltooshncobyax.shop/ph';
  
  console.log('=== 开始代理请求 ===');
  console.log('请求URL:', req.url);
  console.log('请求方法:', req.method);

  try {
    const parsedUrl = new URL(targetUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + (req.url === '/' ? '' : req.url),
      method: req.method,
      headers: {
        'Host': parsedUrl.hostname,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      agent: parsedUrl.protocol === 'https:' ? httpsAgent : undefined,
      timeout: 10000 // 10秒超时
    };

    console.log('代理目标:', options.hostname + options.path);

    const proxyReq = client.request(options, (proxyRes) => {
      console.log('目标网站响应状态:', proxyRes.statusCode);
      console.log('目标网站响应头:', JSON.stringify(proxyRes.headers, null, 2));
      
      res.statusCode = proxyRes.statusCode;
      
      // 复制响应头，但过滤一些
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        const lowerKey = key.toLowerCase();
        if (!['content-length', 'content-encoding', 'transfer-encoding', 'content-security-policy'].includes(lowerKey)) {
          res.setHeader(key, value);
        }
      }

      // 记录响应开始
      console.log('开始向客户端传输数据...');
      
      proxyRes.on('data', (chunk) => {
        console.log('接收到数据块，长度:', chunk.length);
      });

      proxyRes.on('end', () => {
        console.log('=== 代理响应完成 ===');
      });

      // 管道传输
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('代理请求错误:', err.message);
      console.error('错误堆栈:', err.stack);
      res.status(500).send('Proxy Request Error: ' + err.message);
    });

    proxyReq.on('timeout', () => {
      console.error('请求超时');
      proxyReq.destroy();
      res.status(504).send('Gateway Timeout');
    });

    // 结束请求
    proxyReq.end();

  } catch (error) {
    console.error('未预期错误:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
}