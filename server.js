const express = require('express')
const config = require('./config');
const app = express();
const PORT = config.server.port;

// 引入jwt-simple用于生成token
const jwt = require('jwt-simple');
const SECRET = config.jwt.secret;

// 微信配置 - 从配置文件获取
const WECHAT_APPID = config.wechat.appid;
const WECHAT_SECRET = config.wechat.secret;

//中间件：解析JSON请求体
app.use(express.json());

//中间件：解析URL编码的请求体
app.use(express.urlencoded({ extended: true }));

// 微信登录接口
app.get('/weixin/wxLogin/:code', async (req, res) => {
    try {
        const { code } = req.params;
        
        if (!code) {
            return res.status(400).json({
                code: 400,
                message: "缺少code参数",
                data: null
            });
        }

        // 服务器根据客户端传来的code向微信接口服务获取session_key和openid
        const response = await fetch(
            `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`
        );
        
        const result = await response.json();
        
        if (result.errcode) {
            return res.status(400).json({
                code: 400,
                message: `微信接口错误: ${result.errmsg}`,
                data: null
            });
        }

        const { openid } = result;  // 获取到openid
        
        if (!openid) {
            return res.status(400).json({
                code: 400,
                message: "获取openid失败",
                data: null
            });
        }

        // 根据用户的openid生成token
        const token = jwt.encode(openid, SECRET);
        
        // 将token返回
        res.json({
            code: 200,
            data: {
                token: token
            },
            message: "成功"
        });

    } catch (error) {
        console.error('微信登录接口错误:', error);
        res.status(500).json({
            code: 500,
            message: "服务器内部错误",
            data: null
        });
    }
});

//GET请求路由-获取用户信息
app.get('/index/findBanner', (req, res) => {//模拟用户数据

    res.json({ "code": 200, "message": "成功", "data": [{ "id": 1, "createTime": "2023-02-09 14:29:49", "updateTime": "2023-11-29 08:36:49", "isDeleted": 0, "title": "情人节", "imageUrl": "http://39.98.123.211:8300/images/banner-1.png", "linkUrl": "", "sort": 1 }, { "id": 2, "createTime": "2023-02-09 14:29:59", "updateTime": "2023-11-29 08:37:53", "isDeleted": 0, "title": "送温暖", "imageUrl": "http://39.98.123.211:8300/images/banner-2.png", "linkUrl": "", "sort": 2 }, { "id": 3, "createTime": "2023-02-09 14:30:04", "updateTime": "2023-11-29 08:37:42", "isDeleted": 0, "title": "生日礼物", "imageUrl": "http://39.98.123.211:8300/images/banner-3.png", "linkUrl": "", "sort": 3 }] }
    );
})



app.get('/index/findCategory1', (req, res) => {//模拟用户数据

    res.json({ "code": 200, "message": "成功", "data": [{ "imageUrl": "http://39.98.123.211:8300/images/cate-1.png", "name": "爱礼精选", "id": 1 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-2.png", "name": "鲜花玫瑰", "id": 2 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-3.png", "name": "永生玫瑰", "id": 3 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-4.png", "name": "玫瑰珠宝", "id": 4 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-5.png", "name": "香水体护", "id": 5 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-6.png", "name": "玫瑰家居", "id": 6 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-7.png", "name": "开业花礼", "id": 7 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-8.png", "name": "生日祝福", "id": 8 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-9.png", "name": "一周一花", "id": 9 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-10.png", "name": "网红绿植", "id": 10 }] })
})



app.get('/index/advertisement', (req, res) => {//模拟用户数据

    res.json({ "code": 200, "message": "成功", "data": [{ "imageUrl": "http://39.98.123.211:8300/images/love.jpg", "category2Id": 3, "id": 1 }, { "imageUrl": "http://39.98.123.211:8300/images/elder.jpg", "category2Id": 4, "id": 2 }, { "imageUrl": "http://39.98.123.211:8300/images/friend.jpg", "category2Id": 5, "id": 3 }] })
})

app.get('/index/findListGoods', (req, res) => {//模拟用户数据

    res.json({ "code": 200, "message": "成功", "data": [{ "id": 1, "createTime": "2022-11-15 19:06:22", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 1, "name": "甜心熊-不倒翁-红色", "price": 1699.00, "marketPrice": 1999.00, "saleCount": 100, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/1-1-1.png", "floralLanguage": "人间蹉跎，你是唯一值得", "applyUser": "恋人/老婆/朋友", "material": "香槟玫瑰4枝、橙色辉煌玫瑰7枝、蓝星花2枝", "packing": "粉色opp雾面纸6张、酒红色缎带2米", "isRecommend": 0, "detailList": null }, { "id": 3, "createTime": "2022-11-15 19:08:33", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 2, "name": "朱砂-经典花盒", "price": 1999.00, "marketPrice": 2399.00, "saleCount": 3789, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/1-2-1.png", "floralLanguage": "永远爱你，百年好合", "applyUser": "恋人/老婆/朋友", "material": "枝卡罗拉红玫瑰", "packing": "粉色opp雾面纸6张、酒红色缎带2米", "isRecommend": 0, "detailList": null }, { "id": 4, "createTime": "2022-11-15 19:09:27", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 2, "name": "全世爱-心形", "price": 6999.00, "marketPrice": 7999.00, "saleCount": 100, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/1-2-2.png", "floralLanguage": "想把你宠成公主，也想给你全部温柔", "applyUser": "恋人/老婆/朋友", "material": "香槟玫瑰4枝、橙色辉煌玫瑰7枝、蓝星花2枝", "packing": "嫣粉/玫粉色欧雅纸7张、透明雾面纸3张、白色雪梨纸2张、粉色罗纹烫金丝带2米", "isRecommend": 0, "detailList": null }, { "id": 6, "createTime": "2022-11-15 19:12:04", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 3, "name": "浪漫情人节-音乐球", "price": 1314.00, "marketPrice": 1714.00, "saleCount": 100, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/1-3-1.png", "floralLanguage": "一生为你心动回旋，真爱永不止息！", "applyUser": "恋人/老婆/朋友", "material": "红玫瑰19枝，白色腊梅2枝（如腊梅无货，则用白色石竹梅或满天星代替）", "packing": "内层白底黑边丽染纸，外层深灰色雾面纸，白咖罗纹带", "isRecommend": 0, "detailList": null }, { "id": 7, "createTime": "2022-11-15 19:12:28", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 3, "name": "爱的诺言", "price": 2639.00, "marketPrice": 2939.00, "saleCount": 3908, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/1-3-2.png", "floralLanguage": "再一次触动妳的心.轻启一段甜蜜的恋爱物语. 用途： 情人、生日、追求她", "applyUser": "恋人/老婆/朋友", "material": "粉红玫瑰20朵、小熊一只、羽毛", "packing": "尺寸:(高x宽)30x20cm", "isRecommend": 1, "detailList": null }, { "id": 27, "createTime": "2022-11-15 19:31:42", "updateTime": "2023-02-14 17:43:43", "isDeleted": 0, "category1Id": 3, "category2Id": 6, "name": "亲爱的/情人节网红款/19枝", "price": 1399.00, "marketPrice": 1599.00, "saleCount": 2000, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/2-2-3.png", "floralLanguage": "一心一意都为你", "applyUser": "恋人/老婆/朋友", "material": "戴安娜粉玫瑰", "packing": "红金色欧雅纸7张,雪梨纸2张,红色烫金丝带蝴蝶结", "isRecommend": 0, "detailList": null }] })
})


app.get('/index/findRecommendGoods', (req, res) => {//模拟用户数据

    res.json({ "code": 200, "message": "成功", "data": [{ "id": 7, "createTime": "2022-11-15 19:12:28", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 3, "name": "爱的诺言", "price": 2639.00, "marketPrice": 2939.00, "saleCount": 3908, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/1-3-2.png", "floralLanguage": "再一次触动妳的心.轻启一段甜蜜的恋爱物语. 用途： 情人、生日、追求她", "applyUser": "恋人/老婆/朋友", "material": "粉红玫瑰20朵、小熊一只、羽毛", "packing": "尺寸:(高x宽)30x20cm", "isRecommend": 1, "detailList": null }, { "id": 3, "createTime": "2022-11-15 19:08:33", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 2, "name": "朱砂-经典花盒", "price": 1999.00, "marketPrice": 2399.00, "saleCount": 3789, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/1-2-1.png", "floralLanguage": "永远爱你，百年好合", "applyUser": "恋人/老婆/朋友", "material": "枝卡罗拉红玫瑰", "packing": "粉色opp雾面纸6张、酒红色缎带2米", "isRecommend": 0, "detailList": null }, { "id": 11, "createTime": "2022-11-15 19:17:29", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 3, "name": "深情挚爱/52枝", "price": 1699.00, "marketPrice": 1999.00, "saleCount": 2900, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/1-3-6.png", "floralLanguage": "许你三生三世，可伴朝朝暮暮", "applyUser": "恋人/老婆/朋友", "material": "卡罗拉玫瑰52枝", "packing": "红色风华纸3大张、 白色小号英文插画纸（You are my love）4张、白色雪梨纸1张、酒红色罗纹烫金丝带2米", "isRecommend": 0, "detailList": null }, { "id": 27, "createTime": "2022-11-15 19:31:42", "updateTime": "2023-02-14 17:43:43", "isDeleted": 0, "category1Id": 3, "category2Id": 6, "name": "亲爱的/情人节网红款/19枝", "price": 1399.00, "marketPrice": 1599.00, "saleCount": 2000, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/2-2-3.png", "floralLanguage": "一心一意都为你", "applyUser": "恋人/老婆/朋友", "material": "戴安娜粉玫瑰", "packing": "红金色欧雅纸7张，雪梨纸2张，红色烫金丝带蝴蝶结", "isRecommend": 0, "detailList": null }, { "id": 50, "createTime": "2022-11-15 19:31:42", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 2, "name": "亲爱的/情人节网红款/19枝", "price": 1399.00, "marketPrice": 1599.00, "saleCount": 2000, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/2-2-3.png", "floralLanguage": "一心一意都为你", "applyUser": "恋人/老婆/朋友", "material": "戴安娜粉玫瑰", "packing": "红金色欧雅纸7张，雪梨纸2张，红色烫金丝带蝴蝶结", "isRecommend": 0, "detailList": null }, { "id": 25, "createTime": "2022-11-15 19:30:15", "updateTime": "2023-02-14 17:43:40", "isDeleted": 0, "category1Id": 2, "category2Id": 6, "name": "爱莎公主99", "price": 3999.00, "marketPrice": 4199.00, "saleCount": 1898, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/2-2-1.png", "floralLanguage": "想把你宠成公主，也想给你全部温柔\r", "applyUser": "恋人/老婆/朋友", "material": "艾莎玫瑰99枝", "packing": "嫣粉/玫粉色欧雅纸7张、透明雾面纸3张、白色雪梨纸2张、粉色罗纹烫金丝带2米", "isRecommend": 0, "detailList": null }, { "id": 48, "createTime": "2022-11-15 19:30:15", "updateTime": "2023-02-10 16:07:10", "isDeleted": 0, "category1Id": 1, "category2Id": 2, "name": "爱莎公主.宠成公主99枝", "price": 3999.00, "marketPrice": 4199.00, "saleCount": 1898, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/2-2-1.png", "floralLanguage": "想把你宠成公主，也想给你全部温柔\r", "applyUser": "恋人/老婆/朋友", "material": "艾莎玫瑰99枝", "packing": "嫣粉/玫粉色欧雅纸7张、透明雾面纸3张、白色雪梨纸2张、粉色罗纹烫金丝带2米", "isRecommend": 0, "detailList": null }, { "id": 16, "createTime": "2022-11-15 19:22:04", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 4, "name": "爱你/红玫瑰香水百合小号", "price": 1099.00, "marketPrice": 1299.00, "saleCount": 1098, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/1-4-5.png", "floralLanguage": "永远爱你，百年好合", "applyUser": "恋人/老婆/朋友", "material": "卡罗拉红玫瑰11枝、白色香水百合2枝、尤加利叶10枝", "packing": "黑色雾面纸7张、白色雪梨纸2张、酒红色罗纹烫金丝带2米", "isRecommend": 0, "detailList": null }, { "id": 5, "createTime": "2022-11-15 19:10:28", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 2, "name": "99枝红玫瑰", "price": 5088.00, "marketPrice": 5388.00, "saleCount": 390, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/1-2-3.png", "floralLanguage": "爱她，就送她一束99枝的玫瑰花！", "applyUser": "恋人/老婆/朋友", "material": "黑色雪梨纸，黑色条纹纸，玻璃纸卷，酒红色缎带花结", "packing": "红色风华纸3大张、 白色小号英文插画纸（You are my love）4张、白色雪梨纸1张、酒红色罗纹烫金丝带2米", "isRecommend": 0, "detailList": null }, { "id": 2, "createTime": "2022-11-15 19:07:19", "updateTime": "2023-02-10 15:48:51", "isDeleted": 0, "category1Id": 1, "category2Id": 1, "name": "玫瑰系列-稳稳", "price": 1999.00, "marketPrice": 2399.00, "saleCount": 299, "stockCount": 10000, "imageUrl": "http://39.98.123.211:8300/images/1-1-2.png", "floralLanguage": "一心一意都为你", "applyUser": "恋人/老婆/朋友", "material": "卡罗拉红玫瑰11枝、白色满天星3枝、尤加利10枝", "packing": "尺寸:(高x宽)30x20cm", "isRecommend": 1, "detailList": null }] })
})

app.get('/index/findCategoryTree', (req, res) => {//模拟用户数据

    res.json({ "code": 200, "message": "成功", "data": [{ "children": [{ "imageUrl": "http://39.98.123.211:8300/images/cate-1.png", "name": "真情告白", "id": 1 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-1.png", "name": "浪漫求婚", "id": 2 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-1.png", "name": "珍贵纪念", "id": 3 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-1.png", "name": "爱意表达", "id": 4 }], "imageUrl": "http://39.98.123.211:8300/images/cate-1.png", "name": "爱礼精选", "id": 1 }, { "children": [{ "imageUrl": "http://39.98.123.211:8300/images/cate-2.png", "name": "经典永续", "id": 5 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-2.png", "name": "玫瑰经典", "id": 6 }], "imageUrl": "http://39.98.123.211:8300/images/cate-2.png", "name": "鲜花玫瑰", "id": 2 }, { "children": [{ "imageUrl": "http://39.98.123.211:8300/images/cate-3.png", "name": "玫瑰公仔", "id": 7 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-3.png", "name": "星座金典", "id": 8 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-3.png", "name": "玫瑰系列", "id": 9 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-3.png", "name": "音乐系列", "id": 10 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-3.png", "name": "经典永续", "id": 11 }], "imageUrl": "http://39.98.123.211:8300/images/cate-3.png", "name": "永生玫瑰", "id": 3 }, { "children": [{ "imageUrl": "http://39.98.123.211:8300/images/cate-4.png", "name": "星座经典", "id": 12 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-4.png", "name": "爱锁系列", "id": 13 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-4.png", "name": "玫瑰公仔", "id": 14 }], "imageUrl": "http://39.98.123.211:8300/images/cate-4.png", "name": "玫瑰珠宝", "id": 4 }, { "children": [{ "imageUrl": "http://39.98.123.211:8300/images/cate-5.png", "name": "香水", "id": 15 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-5.png", "name": "织恋", "id": 16 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-5.png", "name": "沉爱", "id": 17 }], "imageUrl": "http://39.98.123.211:8300/images/cate-5.png", "name": "香水体护", "id": 5 }, { "children": [{ "imageUrl": "http://39.98.123.211:8300/images/cate-6.png", "name": "香氛蜡烛", "id": 18 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-6.png", "name": "香氛散香", "id": 19 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-6.png", "name": "玫瑰礼品", "id": 20 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-6.png", "name": "香氛挂件", "id": 21 }], "imageUrl": "http://39.98.123.211:8300/images/cate-6.png", "name": "玫瑰家居", "id": 6 }, { "children": [{ "imageUrl": "http://39.98.123.211:8300/images/cate-7.png", "name": "开业花礼", "id": 22 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-7.png", "name": "会议用花", "id": 23 }], "imageUrl": "http://39.98.123.211:8300/images/cate-7.png", "name": "开业花礼", "id": 7 }, { "children": [{ "imageUrl": "http://39.98.123.211:8300/images/cate-8.png", "name": "送恋人", "id": 24 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-8.png", "name": "送朋友", "id": 25 }, { "imageUrl": "http://39.98.123.211:8300/images/cate-8.png", "name": "送长辈", "id": 26 }], "imageUrl": "http://39.98.123.211:8300/images/cate-8.png", "name": "生日祝福", "id": 8 }, { "children": [{ "imageUrl": "http://39.98.123.211:8300/images/cate-9.png", "name": "一周一花", "id": 27 }], "imageUrl": "http://39.98.123.211:8300/images/cate-9.png", "name": "一周一花", "id": 9 }, { "children": [{ "imageUrl": "http://39.98.123.211:8300/images/cate-10.png", "name": "网红绿植", "id": 28 }], "imageUrl": "http://39.98.123.211:8300/images/cate-10.png", "name": "网红绿植", "id": 10 }] })
})


// //GET请求路由-获取单个用户信息
// app.get('/api/users/:id', reportError, res => {
//     const userId = req.params.id;

//     //模拟查找用户
//     const user = { id: userId, name: '用户' + userId, email: 'user' + userId + '@example.com' };

//     res.json({
//         success: true,
//         message: '用户信息获取成功',
//         data: user,
//     });
// });


//  POST请求路由-创建用户
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;

    //简单的验证
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: '用户名和邮箱是必填项',
        });
    }

    //模拟创建用户
    const newUser = {
        id: Date.now(),//使用时间作为ID
        name: name,
        email: email,
        createdAt: new Date().toISOString()
    };

    res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: newUser,
    });
})


//POST请求路由-用户登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;


    //简单的验证
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: '用户名和密码是必填项',
        });
    }

    //模拟登录验证
    if (username === 'admin' && password === '123456') {
        res.json({
            success: true,
            message: '登录成功',
            date: {
                token: 'mock-jwt-token-' + Date.now(),
                user: {
                    id: 1,
                    username: username,
                    role: 'admin',
                },
            },
        });
    } else {
        res.status(401).json({
            success: false,
            message: '用户名或密码错误',
        });
    }
})


//根路径
app.get('/', (req, res) => {
    res.json({
        message: '欢迎使用EXPRESS服务器！',
        endpoints: {
            'GET/api/users': '获取用户列表',
            'GET/api/users/:id': '获取单个用户信息',
            'POST/api/users': '创建用户',
            'POST/api/login': '用户登录',
        },
    });
});

//404处里
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '路由不存在',
    });
});

//启动服务器                                            
app.listen(PORT, () => {
    console.log(`服务器运行在http://localhost:${PORT}`);
    console.log('可用在API端点:');
    console.log('GET/api/users: 获取用户列表');
    console.log('GET/api/users/:id: 获取单个用户信息');
    console.log('POST/api/users: 创建用户');
    console.log('POST/api/login: 用户登录');
    console.log('GET/weixin/wxLogin/:code: 微信登录');
});





