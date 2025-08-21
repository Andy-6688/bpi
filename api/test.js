// api/test.js
export default function handler(req, res) {
  console.log('测试函数被调用');
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <html>
      <body>
        <h1>测试成功！Vercel函数正常工作</h1>
        <p>时间: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `);
}