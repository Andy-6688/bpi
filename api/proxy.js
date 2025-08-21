import http from 'http';
import https from 'https';
import { URL } from 'url';

// 允许自签名证书
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export default async function handler(req, res) {
  const targetUrl = 'https://www.reworser.cc/ph';
  
  console.log('代理手机网站:', targetUrl);

  try {
    const parsedUrl = new URL(targetUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    // 完整的手机浏览器请求头
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + (req.url === '/' ? '' : req.url),
      method: req.method,
      headers: {
        'Host': parsedUrl.hostname,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      },
      agent: parsedUrl.protocol === 'https:' ? httpsAgent : undefined,
      timeout: 15000
    };

    console.log('模拟手机请求:', options.hostname + options.path);

    const proxyReq = client.request(options, (proxyRes) => {
      console.log('手机网站响应:', proxyRes.statusCode);
      
      res.statusCode = proxyRes.statusCode;
      
      // 复制所有headers
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        if (!['content-length', 'content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      }

      // 管道传输
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('代理错误:', err.message);
      if (!res.headersSent) {
        res.status(500).send('手机网站代理失败: ' + err.message);
      }
    });

    proxyReq.end();

  } catch (error) {
    console.error('错误:', error.message);
    if (!res.headersSent) {
      res.status(500).send('服务器错误: ' + error.message);
    }
  }
}