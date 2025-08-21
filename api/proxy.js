// 导入http和https模块用于请求
import http from 'http';
import https from 'https';

export default async function handler(req, res) {
  // 1. 定义你最终要跳转的真实目标网址
  const targetUrl = 'https://ewaltooshncobyax.shop/ph'; 

  // 2. 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // 3. 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 4. 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  // 5. 判断使用的协议
  const client = targetUrl.startsWith('https') ? https : http;

  // 6. 发起请求到目标网站
  client.get(targetUrl, (proxyRes) => {
    // 7. 复制响应头
    for (let [key, value] of Object.entries(proxyRes.headers)) {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // 8. 管道传输数据
    proxyRes.pipe(res);
  }).on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy Error');
  });
}