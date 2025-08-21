export default async function handler(req, res) {
  const targetUrl = 'https://www.reworser.cc/ph';
  
  console.log('开始代理请求到:', targetUrl);
  
  try {
    // 使用 fetch API（现代、更稳定）
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Host': 'www.reworser.cc',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': targetUrl,
        'Origin': targetUrl,
      },
      // 重要：绕过SSL验证
      cf: {
        cacheEverything: false,
        scrapeShield: false,
      }
    });

    console.log('响应状态:', response.status);
    
    // 设置状态码
    res.statusCode = response.status;
    
    // 复制headers
    const headers = response.headers;
    for (const [key, value] of headers.entries()) {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }
    
    // 获取内容并发送
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
    
    console.log('代理完成');

  } catch (error) {
    console.error('代理错误:', error.message);
    
    // 提供详细的错误信息
    res.status(500).send(`
      <html>
        <body>
          <h1>代理错误</h1>
          <p>错误信息: ${error.message}</p>
          <p>请检查目标网站是否可访问</p>
          <p><a href="${targetUrl}" target="_blank">点击这里直接访问目标网站</a></p>
        </body>
      </html>
    `);
  }
}