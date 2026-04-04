// 简单测试脚本
const http = require('http');

function request(options, body) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({ raw: data }); }
      });
    });
    req.on('error', () => resolve({ error: 'connection failed' }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('[1] 注册...');
  const r1 = await request({ path: '/api/auth/register', method: 'POST' }, { username: 't1', password: 'test' });
  console.log(r1);
  
  console.log('[2] 登录...');
  const r2 = await request({ path: '/api/auth/login', method: 'POST' }, { username: 't1', password: 'test' });
  console.log(r2.user ? '登录成功' : '登录失败');
  
  console.log('[3] 保存进度...');
  const r3 = await request({ path: '/api/progress', method: 'PUT' }, { progress: { 'chapter-01': { '1': true, '2': true } } });
  console.log(r3);
  
  console.log('[4] 获取进度...');
  const r4 = await request({ path: '/api/progress' });
  console.log(r4);
  
  console.log('完成');
}

test();
