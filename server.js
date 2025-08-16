const express = require('express')
const config = require('./config');
const app = express();
const PORT = config.server.port;

// 引入jwt-simple用于生成token
const jwt = require('jwt-simple');
const SECRET = config.jwt.secret;

// 引入multer用于文件上传
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 微信配置 - 从配置文件获取
const WECHAT_APPID = config.wechat.appid;
const WECHAT_SECRET = config.wechat.secret;

// 确保上传目录存在
const uploadDir = config.images.directory;
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：时间戳 + 随机数 + 原扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件过滤器 - 只允许图片文件
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif, webp)'));
    }
};

// 配置multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 限制文件大小为5MB
        files: 10 // 最多允许上传10个文件
    }
});

//中间件：解析JSON请求体
app.use(express.json());

//中间件：解析URL编码的请求体
app.use(express.urlencoded({ extended: true }));

// 静态文件服务中间件 - 提供图片文件访问
app.use(config.images.path, express.static(config.images.directory));

// 图片上传接口 - 单张图片
app.post('/api/upload/single', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                message: '请选择要上传的图片',
                data: null
            });
        }

        const imageUrl = `${req.protocol}://${req.get('host')}${config.images.path}/${req.file.filename}`;
        
        res.json({
            code: 200,
            message: '图片上传成功',
            data: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: imageUrl
            }
        });
    } catch (error) {
        console.error('图片上传错误:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误',
            data: null
        });
    }
});

// 微信小程序专用图片上传接口
app.post('/api/upload/wechat', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                message: '请选择要上传的图片',
                data: null
            });
        }

        const imageUrl = `${req.protocol}://${req.get('host')}${config.images.path}/${req.file.filename}`;
        
        res.json({
            code: 200,
            message: '图片上传成功',
            data: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: imageUrl
            }
        });
    } catch (error) {
        console.error('微信小程序图片上传错误:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误',
            data: null
        });
    }
});

// 图片上传接口 - 多张图片
app.post('/api/upload/multiple', upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '请选择要上传的图片',
                data: null
            });
        }

        const uploadedFiles = req.files.map(file => {
            const imageUrl = `${req.protocol}://${req.get('host')}${config.images.path}/${file.filename}`;
            return {
                filename: file.filename,
                originalname: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                url: imageUrl
            };
        });

        res.json({
            code: 200,
            message: `成功上传 ${uploadedFiles.length} 张图片`,
            data: uploadedFiles
        });
    } catch (error) {
        console.error('多图片上传错误:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误',
            data: null
        });
    }
});

// 删除图片接口
app.delete('/api/upload/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadDir, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                code: 404,
                message: '图片文件不存在',
                data: null
            });
        }
        
        fs.unlinkSync(filePath);
        
        res.json({
            code: 200,
            message: '图片删除成功',
            data: { filename }
        });
    } catch (error) {
        console.error('删除图片错误:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误',
            data: null
        });
    }
});

// 获取已上传图片列表接口
app.get('/api/upload/list', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });
        
        const imageList = imageFiles.map(filename => {
            const filePath = path.join(uploadDir, filename);
            const stats = fs.statSync(filePath);
            const imageUrl = `${req.protocol}://${req.get('host')}${config.images.path}/${filename}`;
            
            return {
                filename,
                url: imageUrl,
                size: stats.size,
                uploadTime: stats.mtime
            };
        });
        
        res.json({
            code: 200,
            message: '获取图片列表成功',
            data: imageList
        });
    } catch (error) {
        console.error('获取图片列表错误:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误',
            data: null
        });
    }
});

// 错误处理中间件 - 处理multer错误
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                code: 400,
                message: '文件大小超过限制（最大5MB）',
                data: null
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                code: 400,
                message: '文件数量超过限制（最多10个）',
                data: null
            });
        }
    }
    
    if (error.message.includes('只允许上传图片文件')) {
        return res.status(400).json({
            code: 400,
            message: error.message,
            data: null
        });
    }
    
    next(error);
});

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

// 获取微信用户信息接口
app.get('/weixin/getuserInfo', (req, res) => {
    try {
        // 模拟返回微信用户信息
        const userInfo = {
            nickname: "汤圆",
            headimgurl: "http://localhost:3000/assets/images/美女头像.jpg"
        };
        
        res.json({
            code: 200,
            message: "成功",
            data: userInfo
        });
        
    } catch (error) {
        console.error('获取微信用户信息接口错误:', error);
        res.status(500).json({
            code: 500,
            message: "服务器内部错误",
            data: null
        });
    }
});

// 获取首页轮播图接口
app.get('/index/findBanner', (req, res) => {
    try {
        // 模拟轮播图数据
        const bannerData = [
            {
                id: 1,
                createTime: "2023-02-09 14:29:49",
                updateTime: "2023-11-29 08:36:49",
                isDeleted: 0,
                title: "情人节",
                imageUrl: "http://39.98.123.211:8300/images/banner-1.png",
                linkUrl: "",
                sort: 1
            },
            {
                id: 2,
                createTime: "2023-02-09 14:29:59",
                updateTime: "2023-11-29 08:37:53",
                isDeleted: 0,
                title: "送温暖",
                imageUrl: "http://39.98.123.211:8300/images/banner-2.png",
                linkUrl: "",
                sort: 2
            },
            {
                id: 3,
                createTime: "2023-02-09 14:30:04",
                updateTime: "2023-11-29 08:37:42",
                isDeleted: 0,
                title: "生日礼物",
                imageUrl: "http://39.98.123.211:8300/images/banner-3.png",
                linkUrl: "",
                sort: 3
            }
        ];

        res.json({
            code: 200,
            message: "成功",
            data: bannerData
        });

    } catch (error) {
        console.error('获取轮播图接口错误:', error);
        res.status(500).json({
            code: 500,
            message: "服务器内部错误",
            data: null
        });
    }
});



// 获取一级分类接口
app.get('/index/findCategory1', (req, res) => {
    try {
        // 模拟一级分类数据
        const categoryData = [
            {
                id: 1,
                imageUrl: "http://39.98.123.211:8300/images/cate-1.png",
                name: "爱礼精选"
            },
            {
                id: 2,
                imageUrl: "http://39.98.123.211:8300/images/cate-2.png",
                name: "鲜花玫瑰"
            },
            {
                id: 3,
                imageUrl: "http://39.98.123.211:8300/images/cate-3.png",
                name: "永生玫瑰"
            },
            {
                id: 4,
                imageUrl: "http://39.98.123.211:8300/images/cate-4.png",
                name: "玫瑰珠宝"
            },
            {
                id: 5,
                imageUrl: "http://39.98.123.211:8300/images/cate-5.png",
                name: "香水体护"
            },
            {
                id: 6,
                imageUrl: "http://39.98.123.211:8300/images/cate-6.png",
                name: "玫瑰家居"
            },
            {
                id: 7,
                imageUrl: "http://39.98.123.211:8300/images/cate-7.png",
                name: "开业花礼"
            },
            {
                id: 8,
                imageUrl: "http://39.98.123.211:8300/images/cate-8.png",
                name: "生日祝福"
            },
            {
                id: 9,
                imageUrl: "http://39.98.123.211:8300/images/cate-9.png",
                name: "一周一花"
            },
            {
                id: 10,
                imageUrl: "http://39.98.123.211:8300/images/cate-10.png",
                name: "网红绿植"
            }
        ];

        res.json({
            code: 200,
            message: "成功",
            data: categoryData
        });

    } catch (error) {
        console.error('获取一级分类接口错误:', error);
        res.status(500).json({
            code: 500,
            message: "服务器内部错误",
            data: null
        });
    }
});



// 获取首页广告接口
app.get('/index/advertisement', (req, res) => {
    try {
        // 模拟广告数据
        const advertisementData = [
            {
                id: 1,
                imageUrl: "http://39.98.123.211:8300/images/love.jpg",
                category2Id: 3
            },
            {
                id: 2,
                imageUrl: "http://39.98.123.211:8300/images/elder.jpg",
                category2Id: 4
            },
            {
                id: 3,
                imageUrl: "http://39.98.123.211:8300/images/friend.jpg",
                category2Id: 5
            }
        ];

        res.json({
            code: 200,
            message: "成功",
            data: advertisementData
        });

    } catch (error) {
        console.error('获取广告接口错误:', error);
        res.status(500).json({
            code: 500,
            message: "服务器内部错误",
            data: null
        });
    }
});

// 获取商品列表接口
app.get('/index/findListGoods', (req, res) => {
    try {
        // 模拟商品列表数据
        const goodsData = [
            {
                id: 1,
                createTime: "2022-11-15 19:06:22",
                updateTime: "2023-02-10 15:48:51",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 1,
                name: "甜心熊-不倒翁-红色",
                price: 1699.00,
                marketPrice: 1999.00,
                saleCount: 100,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/1-1-1.png",
                floralLanguage: "人间蹉跎，你是唯一值得",
                applyUser: "恋人/老婆/朋友",
                material: "香槟玫瑰4枝、橙色辉煌玫瑰7枝、蓝星花2枝",
                packing: "粉色opp雾面纸6张、酒红色缎带2米",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 3,
                createTime: "2022-11-15 19:08:33",
                updateTime: "2023-02-10 15:48:51",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 2,
                name: "朱砂-经典花盒",
                price: 1999.00,
                marketPrice: 2399.00,
                saleCount: 3789,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/1-2-1.png",
                floralLanguage: "永远爱你，百年好合",
                applyUser: "恋人/老婆/朋友",
                material: "枝卡罗拉红玫瑰",
                packing: "粉色opp雾面纸6张、酒红色缎带2米",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 9,
                createTime: "2022-11-15 19:15:34",
                updateTime: "2023-02-10 15:48:51",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 3,
                name: "台湾鲜花：红玫瑰18朵、深山樱",
                price: 1888.00,
                marketPrice: 1988.00,
                saleCount: 230,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/1-3-4.png",
                floralLanguage: "坚定的情谊，传达至永远；用途： 情人、朋友、生日",
                applyUser: "恋人/老婆/朋友",
                material: "红玫瑰18朵、深山樱",
                packing: "尺寸:33x25x60cm",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 15,
                createTime: "2022-11-15 19:21:05",
                updateTime: "2023-02-10 15:48:51",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 4,
                name: "爱在心头/19枝+31枝",
                price: 2998.00,
                marketPrice: 3098.00,
                saleCount: 100,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/1-4-4.png",
                floralLanguage: "\"此情无计可消除，才下眉头，却上心头。\"李清照《一剪梅》",
                applyUser: "恋人/老婆/朋友",
                material: "玫瑰共50枝：戴安娜粉玫瑰19枝，卡罗拉红玫瑰31枝",
                packing: "内层白色纱网，外层粉色牛皮纸，红粉双色缎带花结",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 19,
                createTime: "2022-11-15 19:24:40",
                updateTime: "2023-02-14 17:43:35",
                isDeleted: 0,
                category1Id: 2,
                category2Id: 5,
                name: "用心爱你/99枝",
                price: 2848.00,
                marketPrice: 2948.00,
                saleCount: 100,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/2-1-1.png",
                floralLanguage: "一心一意都为你",
                applyUser: "恋人/老婆/朋友",
                material: "戴安娜粉玫瑰",
                packing: "冰淇淋包装纸1张， 白色雪梨纸3张，螺纹金丝带细，甜筒英文手提袋附带底托",
                isRecommend: 1,
                detailList: null
            },
            {
                id: 21,
                createTime: "2022-11-15 19:26:11",
                updateTime: "2023-02-14 17:43:37",
                isDeleted: 0,
                category1Id: 2,
                category2Id: 5,
                name: "迪奥520999双口红款永生花礼盒/红",
                price: 1498.00,
                marketPrice: 1698.00,
                saleCount: 100,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/2-1-3.png",
                floralLanguage: "一心一意都为你",
                applyUser: "恋人/老婆/朋友",
                material: "卡罗拉红玫瑰11枝、白色满天星3枝、尤加利10枝",
                packing: "红色风华纸3大张、 白色小号英文插画纸（You are my love）4张、白色雪梨纸1张、酒红色罗纹烫金丝带2米",
                isRecommend: 0,
                detailList: null
            }
        ];

        res.json({
            code: 200,
            message: "成功",
            data: goodsData
        });

    } catch (error) {
        console.error('获取商品列表接口错误:', error);
        res.status(500).json({
            code: 500,
            message: "服务器内部错误",
            data: null
        });
    }
});


// 获取推荐商品接口
app.get('/index/findRecommendGoods', (req, res) => {
    try {
        // 模拟推荐商品数据
        const recommendGoodsData = [
            {
                id: 7,
                createTime: "2022-11-15 19:12:28",
                updateTime: "2023-02-10 15:48:51",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 3,
                name: "爱的诺言",
                price: 2639.00,
                marketPrice: 2939.00,
                saleCount: 3908,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/1-3-2.png",
                floralLanguage: "再一次触动妳的心.轻启一段甜蜜的恋爱物语. 用途： 情人、生日、追求她",
                applyUser: "恋人/老婆/朋友",
                material: "粉红玫瑰20朵、小熊一只、羽毛",
                packing: "尺寸:(高x宽)30x20cm",
                isRecommend: 1,
                detailList: null
            },
            {
                id: 3,
                createTime: "2022-11-15 19:08:33",
                updateTime: "2023-02-10 15:48:51",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 2,
                name: "朱砂-经典花盒",
                price: 1999.00,
                marketPrice: 2399.00,
                saleCount: 3789,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/1-2-1.png",
                floralLanguage: "永远爱你，百年好合",
                applyUser: "恋人/老婆/朋友",
                material: "枝卡罗拉红玫瑰",
                packing: "粉色opp雾面纸6张、酒红色缎带2米",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 11,
                createTime: "2022-11-15 19:17:29",
                updateTime: "2023-02-10 15:48:51",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 3,
                name: "深情挚爱/52枝",
                price: 1699.00,
                marketPrice: 1999.00,
                saleCount: 2900,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/1-3-6.png",
                floralLanguage: "许你三生三世，可伴朝朝暮暮",
                applyUser: "恋人/老婆/朋友",
                material: "卡罗拉玫瑰52枝",
                packing: "红色风华纸3大张、 白色小号英文插画纸（You are my love）4张、白色雪梨纸1张、酒红色罗纹烫金丝带2米",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 27,
                createTime: "2022-11-15 19:31:42",
                updateTime: "2023-02-14 17:43:43",
                isDeleted: 0,
                category1Id: 3,
                category2Id: 6,
                name: "亲爱的/情人节网红款/19枝",
                price: 1399.00,
                marketPrice: 1599.00,
                saleCount: 2000,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/2-2-3.png",
                floralLanguage: "一心一意都为你",
                applyUser: "恋人/老婆/朋友",
                material: "戴安娜粉玫瑰",
                packing: "红金色欧雅纸7张，雪梨纸2张，红色烫金丝带蝴蝶结",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 50,
                createTime: "2022-11-15 19:31:42",
                updateTime: "2023-02-10 15:48:51",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 2,
                name: "亲爱的/情人节网红款/19枝",
                price: 1399.00,
                marketPrice: 1599.00,
                saleCount: 2000,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/2-2-3.png",
                floralLanguage: "一心一意都为你",
                applyUser: "恋人/老婆/朋友",
                material: "戴安娜粉玫瑰",
                packing: "红金色欧雅纸7张，雪梨纸2张，红色烫金丝带蝴蝶结",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 25,
                createTime: "2022-11-15 19:30:15",
                updateTime: "2023-02-14 17:43:40",
                isDeleted: 0,
                category1Id: 2,
                category2Id: 6,
                name: "爱莎公主99",
                price: 3999.00,
                marketPrice: 4199.00,
                saleCount: 1898,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/2-2-1.png",
                floralLanguage: "想把你宠成公主，也想给你全部温柔",
                applyUser: "恋人/老婆/朋友",
                material: "艾莎玫瑰99枝",
                packing: "嫣粉/玫粉色欧雅纸7张、透明雾面纸3张、白色雪梨纸2张、粉色罗纹烫金丝带2米",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 48,
                createTime: "2022-11-15 19:30:15",
                updateTime: "2023-02-10 16:07:10",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 2,
                name: "爱莎公主.宠成公主99枝",
                price: 3999.00,
                marketPrice: 4199.00,
                saleCount: 1898,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/2-2-1.png",
                floralLanguage: "想把你宠成公主，也想给你全部温柔",
                applyUser: "恋人/老婆/朋友",
                material: "艾莎玫瑰99枝",
                packing: "嫣粉/玫粉色欧雅纸7张、透明雾面纸3张、白色雪梨纸2张、粉色罗纹烫金丝带2米",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 16,
                createTime: "2022-11-15 19:22:04",
                updateTime: "2023-02-10 15:48:51",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 4,
                name: "爱你/红玫瑰香水百合小号",
                price: 1099.00,
                marketPrice: 1299.00,
                saleCount: 1098,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/1-4-5.png",
                floralLanguage: "永远爱你，百年好合",
                applyUser: "恋人/老婆/朋友",
                material: "卡罗拉红玫瑰11枝、白色香水百合2枝、尤加利叶10枝",
                packing: "黑色雾面纸7张、白色雪梨纸2张、酒红色罗纹烫金丝带2米",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 5,
                createTime: "2022-11-15 19:10:28",
                updateTime: "2023-02-10 15:48:51",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 2,
                name: "99枝红玫瑰",
                price: 5088.00,
                marketPrice: 5388.00,
                saleCount: 390,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/1-2-3.png",
                floralLanguage: "爱她，就送她一束99枝的玫瑰花！",
                applyUser: "恋人/老婆/朋友",
                material: "黑色雪梨纸，黑色条纹纸，玻璃纸卷，酒红色缎带花结",
                packing: "红色风华纸3大张、 白色小号英文插画纸（You are my love）4张、白色雪梨纸1张、酒红色罗纹烫金丝带2米",
                isRecommend: 0,
                detailList: null
            },
            {
                id: 2,
                createTime: "2022-11-15 19:07:19",
                updateTime: "2023-02-10 15:48:51",
                isDeleted: 0,
                category1Id: 1,
                category2Id: 1,
                name: "玫瑰系列-稳稳",
                price: 1999.00,
                marketPrice: 2399.00,
                saleCount: 299,
                stockCount: 10000,
                imageUrl: "http://39.98.123.211:8300/images/1-1-2.png",
                floralLanguage: "一心一意都为你",
                applyUser: "恋人/老婆/朋友",
                material: "卡罗拉红玫瑰11枝、白色满天星3枝、尤加利10枝",
                packing: "尺寸:(高x宽)30x20cm",
                isRecommend: 1,
                detailList: null
            }
        ];

        res.json({
            code: 200,
            message: "成功",
            data: recommendGoodsData
        });

    } catch (error) {
        console.error('获取推荐商品接口错误:', error);
        res.status(500).json({
            code: 500,
            message: "服务器内部错误",
            data: null
        });
    }
});

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
    console.log('图片上传相关接口:');
    console.log('POST/api/upload/single: 上传单张图片');
    console.log('POST/api/upload/wechat: 微信小程序图片上传');
    console.log('POST/api/upload/multiple: 上传多张图片');
    console.log('GET/api/upload/list: 获取图片列表');
    console.log('DELETE/api/upload/:filename: 删除指定图片');
});





