javascript
// 导入http和https模块用于请求
const http = require('http');
const https = require('https');

module.exports = async (req, res) => {
  // 1. 定义你最终要跳转的真实目标网址
  // ！！！将下面的示例网址替换成你自己的真实网址！！！
  const targetUrl = 'https://ewaltooshncobyax.shop/ph'; 

  // 2. 设置CORS头，避免跨域问题（让网页可以在不同地方被嵌入）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // 3. 处理预检请求（OPTIONS），直接返回200
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 4. 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  // 5. 判断使用的协议（http或https）并选择相应的模块
  const client = targetUrl.startsWith('https') ? https : http;

  // 6. 发起请求到目标网站
  client.get(targetUrl, (proxyRes) => {
    // 7. 将目标网站返回的状态码直接传回给客户端
    // res.statusCode = proxyRes.statusCode;

    // 8. 将目标网站返回的响应头复制过来（特别是Content-Type很重要）
    // 注意：谨慎复制所有头，有些头（如压缩头）可能导致问题
    for (let [key, value] of Object.entries(proxyRes.headers)) {
      // 过滤掉一些不需要的头
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // 9. 最关键的一步：像管道一样，将目标网站的数据流实时传输给访问你Vercel页面的用户
    proxyRes.pipe(res);
  }).on('error', (err) => {
    // 10. 如果请求过程中出错（例如目标网站无法访问），返回500错误
    console.error('Proxy error:', err);
    res.status(500).send('Proxy Error');
  });
};