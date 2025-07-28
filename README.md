# 简单Express服务器

这是一个最简单的Express服务器示例，包含GET和POST请求。

## 功能特性

- GET请求：获取用户列表和特定用户信息
- POST请求：创建新用户和用户登录
- JSON响应格式
- 基本的错误处理

## 安装和运行

### 1. 安装依赖
```bash
npm install
```

### 2. 启动服务器
```bash
# 生产模式
npm start

# 开发模式（自动重启）
npm run dev
```

服务器将在 http://localhost:3000 启动

## API端点

### GET请求

#### 获取所有用户
```
GET /api/users
```

响应示例：
```json
{
  "success": true,
  "message": "获取用户列表成功",
  "data": [
    {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com"
    }
  ]
}
```

#### 获取特定用户
```
GET /api/users/:id
```

### POST请求

#### 创建新用户
```
POST /api/users
Content-Type: application/json

{
  "name": "新用户",
  "email": "newuser@example.com"
}
```

#### 用户登录
```
POST /api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

## 测试API

你可以使用以下工具测试API：

### 使用curl

```bash
# 获取所有用户
curl http://localhost:3000/api/users

# 获取特定用户
curl http://localhost:3000/api/users/1

# 创建新用户
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "测试用户", "email": "test@example.com"}'

# 用户登录
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'
```

### 使用Postman或其他API测试工具

1. 导入上述API端点
2. 设置正确的Content-Type头部
3. 发送请求并查看响应

## 项目结构

```
flower/
├── package.json      # 项目配置和依赖
├── server.js         # 主服务器文件
└── README.md         # 项目说明
``` 