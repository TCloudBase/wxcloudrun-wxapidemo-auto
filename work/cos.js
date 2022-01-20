// 引入模块
var COS = require('cos-nodejs-sdk-v5');
// 创建实例
var cos = new COS({
    SecretId: process.env.COS_SID,
    SecretKey: process.env.COS_SK,
});

var Bucket = process.env.COS_BUCKET;
var Region = process.env.COS_REGION;

module.exports = { COS: cos, Bucket, Region };