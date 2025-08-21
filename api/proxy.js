import http from 'http';
import https from 'https';
import { URL } from 'url';

export default async function handler(req, res) {
  console.log('代理函数被调用:', req.url);
  
  const targetUrl = 'https://ewaltooshncobyax.shop/ph';
  
  try {
    const parsedUrl = new URL(targetUrl);
    console.log('目标URL解析成功:', parsedUrl.hostname);
    
    // 先返回一个测试页面，包含目标网站的信息
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <html>
        <body>
          <h1>代理测试页面</h1>
          <p>目标网站: ${targetUrl}</p>
          <p>目标域名: ${parsedUrl.hostname}</p>
          <p>请求路径: ${req.url}</p>
          <p>时间: ${new Date().toLocaleString()}</p>
          <hr>
          <p>下一步：添加实际的代理逻辑</p>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('URL解析错误:', error);
    res.status(500).send('URL解析错误: ' + error.message);
  }
}