import http from 'http';
import https from 'https';
import { URL } from 'url';
import zlib from 'zlib';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export default async function handler(req, res) {
  const targetUrl = 'https://www.reworser.cc/ph';
  
  console.log('代理手机网站:', targetUrl);

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
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br', // 告诉服务器我们支持压缩
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      agent: parsedUrl.protocol === 'https:' ? httpsAgent : undefined,
      timeout: 15000
    };

    console.log('模拟手机请求:', options.hostname + options.path);

    const proxyReq = client.request(options, (proxyRes) => {
      console.log('响应状态码:', proxyRes.statusCode);
      console.log('内容编码:', proxyRes.headers['content-encoding']);
      
      res.statusCode = proxyRes.statusCode;
      
      // 复制headers，但移除content-encoding相关头
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        const lowerKey = key.toLowerCase();
        if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lowerKey)) {
          res.setHeader(key, value);
        }
      }

      // 处理内容编码
      const encoding = proxyRes.headers['content-encoding'];
      let responseStream = proxyRes;

      if (encoding === 'gzip') {
        responseStream = proxyRes.pipe(zlib.createGunzip());
        console.log('解压缩gzip内容');
      } else if (encoding === 'deflate') {
        responseStream = proxyRes.pipe(zlib.createInflate());
        console.log('解压缩deflate内容');
      } else if (encoding === 'br') {
        responseStream = proxyRes.pipe(zlib.createBrotliDecompress());
        console.log('解压缩brotli内容');
      }

      // 管道传输解码后的内容
      responseStream.pipe(res);

    });

    proxyReq.on('error', (err) => {
      console.error('代理错误:', err.message);
      if (!res.headersSent) {
        res.status(500).send('代理错误: ' + err.message);
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