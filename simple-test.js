const http = require('http');

// 测试获取用户信息
testGetUser();

function testGetUser() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/users/current',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`GET /api/users/current 状态码: ${res.statusCode}`);
    
    res.on('data', (d) => {
      console.log('响应数据:', d.toString());
    });
  });

  req.on('error', (error) => {
    console.error('GET请求错误:', error);
  });

  req.end();
}