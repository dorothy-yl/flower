// 配置文件
module.exports = {
    // 微信小程序配置
    wechat: {
        appid: process.env.WECHAT_APPID || 'wxe4c660ef27bbb7b7',
        secret: process.env.WECHAT_SECRET || 'f3bf0f3d1a5c4caff55c3b253df98593'
    },
    
    // 服务器配置
    server: {
        port: process.env.PORT || 3000
    },
    
    // JWT配置
    jwt: {
        secret: process.env.JWT_SECRET || '123456'
    },
    
    // 图片服务配置
    images: {
        path: '/assets/images/upload',
        directory: './assets/images/upload'
    }
}; 