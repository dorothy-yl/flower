const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件：解析JSON请求体
app.use(express.json());

// 中间件：解析URL编码的请求体
app.use(express.urlencoded({ extended: true }));

// GET请求路由 - 获取用户信息
app.get('/api/users', (req, res) => {
  // 模拟用户数据
  const users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' }
  ];
  
  res.json({
    success: true,
    message: '获取用户列表成功',
    data: users
  });
});

// GET请求路由 - 根据ID获取特定用户
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  // 模拟查找用户
  const user = { id: userId, name: `用户${userId}`, email: `user${userId}@example.com` };
  
  res.json({
    success: true,
    message: '获取用户信息成功',
    data: user
  });
});

// POST请求路由 - 创建新用户
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  
  // 简单的验证
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: '姓名和邮箱是必填项'
    });
  }
  
  // 模拟创建用户
  const newUser = {
    id: Date.now(), // 使用时间戳作为ID
    name: name,
    email: email,
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    message: '用户创建成功',
    data: newUser
  });
});

// POST请求路由 - 用户登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // 简单的验证
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: '用户名和密码是必填项'
    });
  }
  
  // 模拟登录验证
  if (username === 'admin' && password === '123456') {
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: { id: 1, username: 'admin', role: 'admin' }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  }
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '欢迎使用Express服务器！',
    endpoints: {
      'GET /api/users': '获取所有用户',
      'GET /api/users/:id': '根据ID获取用户',
      'POST /api/users': '创建新用户',
      'POST /api/login': '用户登录'
    }
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的路径不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('可用的API端点:');
  console.log('  GET  /api/users     - 获取所有用户');
  console.log('  GET  /api/users/:id - 获取特定用户');
  console.log('  POST /api/users     - 创建新用户');
  console.log('  POST /api/login     - 用户登录');
}); 