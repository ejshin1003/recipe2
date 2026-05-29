const crypto = require('crypto');

function generateHmac(method, url, secretKey, accessKey) {
  const datetime = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0,15) + 'Z';
  const parts = url.split('?');
  const path = parts[0];
  const query = parts[1] || '';
  const message = datetime + method + path + (query ? query : '');
  const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex');
  return {
    authorization: `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const keyword = req.query.keyword || '';
  const limit = parseInt(req.query.limit || '3');

  const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
  const SECRET_KEY = process.env.COUPANG_SECRET_KEY;
  const PARTNER_ID = process.env.COUPANG_PARTNER_ID;

  if (!ACCESS_KEY || !SECRET_KEY) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
  }

  try {
    const path = '/v2/providers/affiliate_open_api/apis/openapi/products/search';
    const queryStr = `keyword=${encodeURIComponent(keyword)}&limit=${limit}&imageSize=200`;
    const url = `${path}?${queryStr}`;
    const { authorization } = generateHmac('GET', url, SECRET_KEY, ACCESS_KEY);

    const response = await fetch(`https://api-gateway.coupang.com${url}`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json;charset=UTF-8'
      }
    });

    const data = await response.json();

    if (data.data && PARTNER_ID) {
      data.data = data.data.map(item => ({
        ...item,
        productUrl: `https://link.coupang.com/a/${PARTNER_ID}?url=${encodeURIComponent(item.productUrl || '')}`
      }));
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
