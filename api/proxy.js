export default async function handler(req, res) {
  const targetUrl = 'https://www.reworser.cc/ph';
  
  // 直接返回一个包含iframe的页面
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>代理访问</title>
        <style>
          body { margin: 0; padding: 0; }
          iframe { width: 100%; height: 100vh; border: none; }
        </style>
      </head>
      <body>
        <iframe src="${targetUrl}" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
        <p>如果无法显示，<a href="${targetUrl}" target="_blank">请点击这里直接访问</a></p>
      </body>
    </html>
  `);
}