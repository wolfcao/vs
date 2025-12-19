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
    console.log(`响应头: ${JSON.stringify(res.headers)}`);
    
    res.on('data', (d) => {
      process.stdout.write(d);
      console.log('\n\n');
      // 测试更新用户信息
      testUpdateUser();
    });
  });

  req.on('error', (error) => {
    console.error('GET请求错误:', error);
  });

  req.end();
}

function testUpdateUser() {
  const updateData = JSON.stringify({
    name: '测试用户',
    avatar: 'https://example.com/avatar.jpg'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/users/current',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(updateData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`PUT /api/users/current 状态码: ${res.statusCode}`);
    console.log(`响应头: ${JSON.stringify(res.headers)}`);
    
    res.on('data', (d) => {
      process.stdout.write(d);
      console.log('\n\n');
      // 再次获取用户信息验证更新
      testVerifyUpdate();
    });
  });

  req.on('error', (error) => {
    console.error('PUT请求错误:', error);
  });

  req.write(updateData);
  req.end();
}

function testVerifyUpdate() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/users/current',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`验证更新 - GET /api/users/current 状态码: ${res.statusCode}`);
    res.on('data', (d) => {
      process.stdout.write(d);
      console.log('\n\n');
    });
  });

  req.on('error', (error) => {
    console.error('验证更新请求错误:', error);
  });

  req.end();
}