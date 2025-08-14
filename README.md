# Flower Express Server

一个基于Express的服务器，提供微信小程序登录等API接口。

## 功能特性

- 微信小程序登录接口
- 用户管理API
- JWT token认证

## 安装依赖

```bash
npm install
```

## 配置

### 方法1: 使用环境变量

在启动服务器前设置环境变量：

```bash
# Windows PowerShell
$env:WECHAT_APPID="你的微信APPID"
$env:WECHAT_SECRET="你的微信SECRET"
$env:JWT_SECRET="你的JWT密钥"

# Windows CMD
set WECHAT_APPID=你的微信APPID
set WECHAT_SECRET=你的微信SECRET
set JWT_SECRET=你的JWT密钥

# Linux/Mac
export WECHAT_APPID=你的微信APPID
export WECHAT_SECRET=你的微信SECRET
export JWT_SECRET=你的JWT密钥
```

### 方法2: 修改配置文件

直接编辑 `config.js` 文件中的默认值。

## 启动服务器

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API接口

### 微信登录
- **路径**: `GET /weixin/wxLogin/:code`
- **参数**: `code` - 微信小程序登录凭证
- **返回**: 
```json
{
  "code": 200,
  "data": {
    "token": "JWT token"
  },
  "message": "成功"
}
```

### 其他接口
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `POST /api/login` - 用户登录

## 测试

使用curl测试微信登录接口：

```bash
curl -X GET "http://localhost:3000/weixin/wxLogin/123456789"
```

## 注意事项

- 请确保微信APPID和SECRET的安全性
- 生产环境建议使用环境变量而不是硬编码
- JWT密钥应该足够复杂且保密 