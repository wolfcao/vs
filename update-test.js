const http = require('http');

// 测试更新用户信息
updateUser();

function updateUser() {
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
    
    res.on('data', (d) => {
      console.log('更新响应数据:', d.toString());
      // 验证更新是否成功
      verifyUpdate();
    });
  });

  req.on('error', (error) => {
    console.error('PUT请求错误:', error);
  });

  req.write(updateData);
  req.end();
}

function verifyUpdate() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/users/current',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    res.on('data', (d) => {
      console.log('\n验证更新后的用户信息:', d.toString());
    });
  });

  req.on('error', (error) => {
    console.error('GET请求错误:', error);
  });

  req.end();
}