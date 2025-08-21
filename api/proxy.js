import http from 'http';
import https from 'https';
import { URL } from 'url';

// 允许自签名证书（谨慎使用）
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // 跳过SSL证书验证
});

export default async function handler(req, res) {
  const targetUrl = 'https://ewaltooshncobyax.shop/ph';
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const parsedUrl = new URL(targetUrl);
  const client = parsedUrl.protocol === 'https:' ? https : http;

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
    path: parsedUrl.pathname + (req.url === '/' ? '' : req.url),
    method: req.method,
    headers: {
      ...req.headers,
      'Host': parsedUrl.hostname,
      'Referer': targetUrl,
      'Origin': targetUrl,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    agent: parsedUrl.protocol === 'https:' ? httpsAgent : undefined
  };

  // 移除有问题的headers
  const blacklistedHeaders = [
    'content-length', 'content-encoding', 'accept-encoding',
    'connection', 'keep-alive', 'transfer-encoding'
  ];
  
  blacklistedHeaders.forEach(header => {
    delete options.headers[header];
  });

  const proxyReq = client.request(options, (proxyRes) => {
    res.statusCode = proxyRes.statusCode;
    
    // 复制headers但过滤一些
    const headers = { ...proxyRes.headers };
    const headersBlacklist = [
      'content-security-policy', 'x-frame-options', 'location',
      'content-length', 'content-encoding', 'transfer-encoding'
    ];
    
    headersBlacklist.forEach(header => {
      delete headers[header];
    });

    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined && value !== null) {
        res.setHeader(key, value.toString());
      }
    }

    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy Error: ' + err.message);
  });

  // 处理请求体
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}