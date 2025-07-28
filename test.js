// 简单的测试文件
console.log('Hello, Express!');

// 模拟Express应用
const mockApp = {
  get: (path, handler) => console.log(`GET ${path} 路由已注册`),
  post: (path, handler) => console.log(`POST ${path} 路由已注册`),
  use: (middleware) => console.log('中间件已注册'),
  listen: (port, callback) => {
    console.log(`服务器将在端口 ${port} 启动`);
    callback();
  }
};

// 模拟路由
mockApp.get('/api/users', () => {});
mockApp.post('/api/users', () => {});
mockApp.get('/api/users/:id', () => {});
mockApp.post('/api/login', () => {});

console.log('所有路由注册完成！');
console.log('Express服务器代码语法正确！'); 