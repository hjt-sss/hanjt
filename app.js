var express = require('express')
var path = require('path')
var router = require('./router')
var session = require('express-session')

var app = express()
var bodyParser = require('body-parser')

app.use('/public',express.static(path.join(__dirname, './public/')))
app.use('node_modules' , express.static(path.join(__dirname, './node_modules/')))

app.engine('html', require('express-art-template')); //对views路径下的html文件使用art-template模板引擎，

app.set('views',path.join(__dirname,'/Views/'))//修改默认的渲染路径

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//express中，默认不支持session和cookie，一般使用express-session解决
app.use(session({
  secret: 'itcast', //配置加密字符串，和原有的拼接起来,用户自定义的呃
  resave: false,
  saveUninitialized: true  //无论是否使用session，都默认给分配一把钥匙
}))

app.use(router)

app.listen(3000,function() {
  console.log('running……')
})