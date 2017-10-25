var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var blog = require('./routes/blog');
var feedy = require('./routes/feedy')
var tips = require('./routes/tips')
var app = express();

// call socket.io to the app
// var io = require('socket.io')
// var io = require('socket.io')(process.env.PORT || 3000);

// app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/blog', blog);
app.use('/feedy', feedy)
app.use('/tips', tips)


app.get('/cenotifiall', function (req, res, next) {
  res.render('notifi')
})
app.post('/notifiall', function (req, res) {
  let title = req.body.title
  let content = req.body.content

  // console.log(req.body)
  let notifi = {
    title: title,
    content: content
  }

  io.sockets.emit('server_send_notifi', notifi);
  res.json("Đã gửi thông báo");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var server = app.listen(process.env.PORT || 3000, () => console.log('Server started'));


var io = require('socket.io')(server);
var Blog = require('./models/blog_mongodb');
var User = require('./models/connection_mongodb');

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on("client_connect_comment_blog", function (idBlog) {
    socket.join("id_comment_blog=" + idBlog);
    // console.log(idBlog)
    socket.on('client_send_comment_blog' + idBlog, function (data) {
      socket.join("id_comment_blog=" + data.blog_id);
      // console.log(data);
      // add comment into db
      var blogId = data.blog_id;
      var user = {
        user_id: data.user_id,
        user_name: data.user_name,
        user_image: data.user_image
      };
      var content = data.content;
      var time = data.time;
      var vote = [];
      var comment = {
        _id: data._id,
        user: user,
        content: content,
        time: time,
        votes: vote
      };
      // console.log(comment);
      Blog.createComment(blogId, comment, function (err, result) {
        if (err) return console.log(err);
        var resultComment = {
          id_comment: result.comment[result.comment.length - 1]._id,
          user: comment.user,
          is_like: false,
          like_size: 0,
          content: comment.content,
          time: comment.time,
          reply: []
        };
        // console.log(resultComment);
        socket.broadcast.to("id_comment_blog=" + idBlog).emit("server_send_comment_blog" + idBlog, resultComment);

        // return res.json(result);
      });
    });


  });

  socket.on("client_exit_connect_comment_blog", function (idBlog) {
    socket.leave("id_comment_blog=" + idBlog);
    // console.log("Leave");
  });
});
