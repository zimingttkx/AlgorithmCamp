/**
 * 双重进程测试：模拟用户操作 + 监控系统响应
 * 进程1: 模拟用户操作
 * 进程2: 监控日志
 */

const http = require('http');
const MongoClient = require('mongodb').MongoClient;

const API_BASE = 'http://127.0.0.1:3000';
const DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'AlgorithmCamp';

// 颜色
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(type, msg, color = 'reset') {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`${colors[color]}[${timestamp}] [${type}] ${msg}${colors.reset}`);
}

async function api(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ raw: data, status: res.statusCode });
        }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function checkDb() {
  const client = await MongoClient.connect(DB_URL);
  const db = client.db(DB_NAME);
  return { client, db };
}

async function getUserProgress(username) {
  const { client, db } = await checkDb();
  const user = await db.collection('users').findOne({ username });
  if (!user) {
    await client.close();
    return null;
  }
  const progress = await db.collection('progress').findOne({ userId: user._id });
  await client.close();
  return progress?.data || null;
}

async function countProblems(progress) {
  if (!progress) return 0;
  let count = 0;
  for (const ch in progress) {
    count += Object.keys(progress[ch]).length;
  }
  return count;
}

async function runTest() {
  log('TEST', '===== 开始双重监控测试 =====', 'blue');
  
  // 1. 注册
  log('USER', '1. 用户点击注册', 'cyan');
  const registerRes = await api('POST', '/api/auth/register', { username: 'testuser', password: 'test123' });
  log('SYS', `注册结果: ${registerRes.user?.username || registerRes.error}`, registerRes.user ? 'green' : 'red');
  
  // 等待认证
  await new Promise(r => setTimeout(r, 500));
  
  // 2. 保存进度
  log('USER', '2. 用户勾选chapter-01第1题', 'cyan');
  const save1 = await api('PUT', '/api/progress', {
    progress: { 'chapter-01': { '1': { checked: true, timestamp: new Date().toISOString() }}
  });
  log('SYS', `保存: ${save1.success || save1.error}`, save1.success ? 'green' : 'red');
  
  // 3. 验证数据库
  const db1 = await getUserProgress('testuser');
  const cnt1 = await countProblems(db1);
  log('DB', `数据库验证: ${cnt1}题`, cnt1 > 0 ? 'green' : 'red');
  
  // 4. 继续保存
  log('USER', '3. 勾选chapter-01第2、3题', 'cyan');
  const save2 = await api('PUT', '/api/progress', {
    progress: {
      'chapter-01': { '1': true, '2': true, '3': true },
      'chapter-02': { '1': true }
    }
  });
  log('SYS', `保存: ${save2.success || save2.error}`, save2.success ? 'green' : 'red');
  
  // 5. 获取进度
  log('USER', '4. 查看进度', 'cyan');
  const get1 = await api('GET', '/api/progress');
  const cnt2 = await countProblems(get1.progress);
  log('SYS', `服务器返回: ${cnt2}题`, cnt2 > 0 ? 'green' : 'red');
  
  // 6. 数据库最终验证
  const dbFinal = await getUserProgress('testuser');
  const cnt3 = await countProblems(dbFinal);
  log('DB', `最终数据库: ${cnt3}题`, cnt3 >= 3 ? 'green' : 'red');
  
  log('TEST', '===== 测试完成 =====', 'blue');
}

runTest().catch(console.error);
