export default function handler(req, res) {
  console.log('代理函数被调用:', req.url);
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <html>
      <body>
        <h1>代理函数工作正常！</h1>
        <p>请求路径: ${req.url}</p>
        <p>时间: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `);
}