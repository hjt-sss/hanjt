var express = require('express')
var User = require('./models/user')
var md5 = require('blueimp-md5')

var router = express.Router()

router.get('/',function (req, res){
  // console.log(req.session.user)
  res.render('index.html',{
    user: req.session.user
  })
})

router.get('/login',function (req, res){
  res.render('login.html')
})

router.post('/login',function (req, res){
  var body = req.body
  //获取表单数据
  //查询数据库用户名密码是否正确
  //发送响应数据
  // console.log(req.body)
  User.findOne({
    email: body.email,
    password: md5(md5(body.password)+'itcast')//该密码后缀itcast应该与注册是相同
  }, function(err, user) {
    if(err) {
      return res.status(500).json({
        success: false,
        message: err.message  
      })
    }
    //如果不存在该用户
    if(!user) {
      return res.status(200).json({
        err_code: 1,
        message: 'Email or password is invalid'
      })
    }
    //如果有，将登录状态存储到session中
    req.session.user = user
    res.status(200).json({
      err_code: 0,
      message: 'ok'
    })
    console.log(user.nickname+"登录了")
  })
})

router.get('/register',function (req, res){
  res.render('register.html')
})

//表单同步提交
router.post('/register',function (req, res){
  //获取表单提交数据 req.body
  //操作数据库
  //判断是否存在，存在不允许注册，不存在注册新用户
  //发送响应
  var body = req.body
  User.findOne({
    $or:[
      {email: body.email},
      {nickname:body.nickname}
    ]
  },function (err, data){
    if(err) {
      return res.status(500).json({
        success: false,
        message: '服务端错误'
      })
    }
    if(data){  //邮箱或者昵称已存在
      return res.status(200).json({
        err_code: 1,
        message: 'email or nickame aleady exists'
      })
     /*服务端直接渲染页面，表单同步提交
        return res.render('register.html', {
        err_message: 'email or nickame aleady exists',
        form: body
      }) */
    }

    //对密码进行MD5重复加密
    body.password = md5(md5(body.password)+'itcast')

    new User(body).save(function (err, user) {
      if(err) {
        return res.status(500).json({
          err_code: 500, 
          message: 'Server error'
        })
      }
      //注册成功，记录用户登录状态
      req.session.user = user
      //express提供了一个响应方法：json，接收对象作为参数，会自动吧对象转为字符串发给浏览器
      res.status(200).json({
        err_code: 0,
        message: 'ok'
      })
      console.log(user)
      // res.redirect('/') //该重定向只对同步请求有效，对异步请求无效
    })
  })
})

router.get('/logout', function(req, res) {
  //清除登录状态
  console.log(req.session.user.nickname+"退出了")
  req.session.user = null
  //重定向到登录页
  res.redirect('/login')
})
//表单异步提交
/* router.post('/register', async function(req, res){
  var body = req.body
  try {
    if(await User.findOne({email: body.email})) {
      return res.status(500).json({
        err_code: 1,
        message: 'Email aleady exists.'
      })
    }
    if(await User.findOne({nickname: body.nickname})) {
      return res.status(500).json({
        err_code: 2,
        message: 'nickname aleady exists.'
      })
    }
    //对密码进行MD5重复加密
    body.password = md5(md5(body.password))

    //创建用户，执行注册
    await new User(body).save()

    res.status(200).json({
      err_code: 0,
      message:"Ok"
    })
  } catch(err) {
    res.status(500).json({
      err_code: 500,
      message:err.message
    })
  }
}) */
module.exports = router