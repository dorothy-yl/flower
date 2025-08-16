# 🌸 花店管理系统 - 图片上传服务

这是一个基于Express.js的图片上传服务，支持单张和多张图片上传，自动保存到指定文件夹。

## ✨ 功能特性

- 📸 **单张图片上传** - 支持单张图片上传
- 🖼️ **多张图片上传** - 支持同时上传多张图片（最多10张）
- 🗂️ **图片管理** - 查看已上传图片列表
- 🗑️ **图片删除** - 删除指定的图片文件
- 🔒 **安全限制** - 文件类型和大小限制
- 📱 **响应式设计** - 美观的测试界面

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务器

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

### 3. 测试图片上传

打开浏览器访问 `upload-test.html` 文件，或者直接使用API接口进行测试。

## 📡 API接口

### 单张图片上传

**接口地址：** `POST /api/upload/single`

**请求参数：**
- `image`: 图片文件（multipart/form-data）

**响应示例：**
```json
{
    "code": 200,
    "message": "图片上传成功",
    "data": {
        "filename": "1703123456789-123456789.jpg",
        "originalname": "example.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg",
        "url": "http://localhost:3000/assets/images/1703123456789-123456789.jpg"
    }
}
```

### 微信小程序图片上传

**接口地址：** `POST /api/upload/wechat`

**请求参数：**
- `file`: 图片文件（微信小程序使用 `name: 'file'`）
- `type`: 图片类型（可选）

**响应示例：**
```json
{
    "code": 200,
    "message": "图片上传成功",
    "data": {
        "filename": "1703123456789-123456789.jpg",
        "originalname": "avatar.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg",
        "url": "http://localhost:3000/assets/images/1703123456789-123456789.jpg"
    }
}
```

### 多张图片上传

**接口地址：** `POST /api/upload/multiple`

**请求参数：**
- `images`: 图片文件数组（multipart/form-data）

**响应示例：**
```json
{
    "code": 200,
    "message": "成功上传 3 张图片",
    "data": [
        {
            "filename": "1703123456789-123456789.jpg",
            "originalname": "image1.jpg",
            "size": 1024000,
            "mimetype": "image/jpeg",
            "url": "http://localhost:3000/assets/images/1703123456789-123456789.jpg"
        }
    ]
}
```

### 获取图片列表

**接口地址：** `GET /api/upload/list`

**响应示例：**
```json
{
    "code": 200,
    "message": "获取图片列表成功",
    "data": [
        {
            "filename": "1703123456789-123456789.jpg",
            "url": "http://localhost:3000/assets/images/1703123456789-123456789.jpg",
            "size": 1024000,
            "uploadTime": "2023-12-21T10:30:45.123Z"
        }
    ]
}
```

### 删除图片

**接口地址：** `DELETE /api/upload/:filename`

**路径参数：**
- `filename`: 要删除的图片文件名

**响应示例：**
```json
{
    "code": 200,
    "message": "图片删除成功",
    "data": {
        "filename": "1703123456789-123456789.jpg"
    }
}
```

## ⚙️ 配置说明

### 文件上传配置

在 `config.js` 中配置图片相关设置：

```javascript
// 图片服务配置
images: {
    path: '/assets/images',        // 访问路径
    directory: './assets/images'   // 存储目录
}
```

### 上传限制

- **文件类型**：只允许 jpeg, jpg, png, gif, webp 格式
- **文件大小**：单个文件最大 5MB
- **文件数量**：多张上传最多 10 个文件

### 文件命名规则

上传的文件会自动重命名，格式为：`时间戳-随机数.扩展名`

例如：`1703123456789-123456789.jpg`

## 🎨 测试界面

项目包含一个美观的测试页面 `upload-test.html`，提供：

- 拖拽式上传界面
- 实时进度显示
- 图片预览功能
- 图片管理功能
- 响应式设计

## 📁 项目结构

```
flower/
├── assets/
│   └── images/          # 图片存储目录
├── config.js            # 配置文件
├── package.json         # 项目依赖
├── server.js            # 主服务器文件
├── upload-test.html     # 测试页面
└── README.md            # 项目说明
```

## 🔧 技术栈

- **后端框架**: Express.js
- **文件上传**: Multer
- **文件系统**: Node.js fs 模块
- **前端界面**: HTML5 + CSS3 + JavaScript

## 🚨 注意事项

1. 确保 `assets/images` 目录有写入权限
2. 上传的图片会保存在服务器本地，注意磁盘空间
3. 生产环境建议添加用户认证和权限控制
4. 可以考虑添加图片压缩和格式转换功能

## 📝 更新日志

- **v1.0.0** - 初始版本，支持基本的图片上传功能
- 支持单张和多张图片上传
- 添加图片管理接口
- 包含美观的测试界面

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## �� 许可证

MIT License 