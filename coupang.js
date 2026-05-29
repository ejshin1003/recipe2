const crypto = require('crypto');

// 쿠팡 파트너스 API 서명 생성
function generateHmac(method, url, secretKey, accessKey) {
  const datetime = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0,15) + 'Z';
  const parts = url.split('?');
  const path = parts[0];
  const query = parts[1] || '';
  
  const message = datetime + method + path + (query ? query : '');
  const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex');
  
  return {
    authorization: `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`,
    datetime
  };
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const keyword = event.queryStringParameters?.keyword || '';
  const limit = parseInt(event.queryStringParameters?.limit || '3');

  // ★ 환경변수로 설정 (Netlify 대시보드 > Site settings > Environment variables)
  const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
  const SECRET_KEY = process.env.COUPANG_SECRET_KEY;
  const PARTNER_ID = process.env.COUPANG_PARTNER_ID;

  if (!ACCESS_KEY || !SECRET_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API 키가 설정되지 않았습니다. Netlify 환경변수를 확인해주세요.' })
    };
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

    // 딥링크에 파트너 ID 추가
    if (data.data && PARTNER_ID) {
      data.data = data.data.map(item => ({
        ...item,
        productUrl: `https://link.coupang.com/a/${PARTNER_ID}?url=${encodeURIComponent(item.productUrl || '')}`
      }));
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
