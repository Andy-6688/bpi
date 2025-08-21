import http from 'http';
import https from 'https';
import { URL } from 'url';

export default async function handler(req, res) {
  const targetUrl = 'https://ewaltooshncobyax.shop/ph';
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const parsedUrl = new URL(targetUrl);
  const client = parsedUrl.protocol === 'https:' ? https : http;

  // 构建代理请求的选项
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
    path: parsedUrl.pathname + (req.url === '/' ? '' : req.url),
    method: req.method,
    headers: {
      ...req.headers,
      host: parsedUrl.hostname, // 重要：覆盖host头
      referer: targetUrl,
      origin: targetUrl
    }
  };

  // 移除一些可能引起问题的头
  delete options.headers['content-length'];
  delete options.headers['content-encoding'];
  delete options.headers['accept-encoding'];

  const proxyReq = client.request(options, (proxyRes) => {
    // 复制状态码
    res.statusCode = proxyRes.statusCode;
    
    // 复制响应头，但修改一些关键头
    const headers = { ...proxyRes.headers };
    
    // 移除可能影响代理的头
    delete headers['content-security-policy'];
    delete headers['x-frame-options'];
    delete headers['location']; // 防止重定向
    
    // 设置新的headers
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined) {
        res.setHeader(key, value);
      }
    }

    // 管道传输数据
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy Error: ' + err.message);
  });

  // 如果有请求体，传输它
  if (req.method === 'POST' || req.method === 'PUT') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}