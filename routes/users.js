var express = require('express');
var router = express.Router();

// var connection = require('../models/connection');
var xoauth2 = require('xoauth2');
var nodemailer = require('nodemailer');
var md5 = require('md5');
var fs = require('fs');

var User = require('../models/connection_mongodb');

var multer = require('multer');
var uploads = multer({ dest: './uploads/users' });



const URL_SERVER = require('../models/url_server');
const URL = "https://feedyandroid.herokuapp.com"

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // xoauth2: xoauth2.createXOAuth2Generator({
    type: 'OAuth2',
    user: 'mtung280196@gmail.com',
    clientId: '99628620215-mngl75u2ujsuacm8ktaufc1r3c2agk6p.apps.googleusercontent.com',
    clientSecret: 'gGw4V2eOoE1_hkR4RiAq6TQk',
    refreshToken: '1/jXV08q32mZBfohZCjh35WnX0KBc0_hwYY9mitBwatF0'
    // })
  }
})

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource')
  // console.log(URL_SERVER)
})

router.get('/getimage', function (req, res, next) {
  var idImage = req.param('id');
  // console.log(id);
  var urlImage = 'uploads/users/' + idImage;
  // console.log(urlImage);
  var image = fs.readFileSync(urlImage);
  res.end(image, 'binary');
});


//register account
router.post('/register', uploads.single('profileimage'), function (req, res, next) {
  var email = req.body.email;

  User.findUserEmail(email, function (err, result) {
    // console.log(req.body);

    if (err) {
      // console.log(err);
      return res.json("Error");
    }
    if (result.length > 0) {
      return res.json("Account is exists");
    } else {
      var urlImage = '/users/getimage?id=';
      if (req.file) {
        console.log("Uploading File...");
        // console.log(req.file);
        //File Info
        // var profileIamgeOrifinalName = req.files.profileimage.originalname;
        var profileImageName = urlImage + req.file.filename;
        // var profileImageMime = req.file.mimetype;
        // var typeImage = profileImageMime.split('/');
        // var profileImageName = profileImage + "." + typeImage[1];
        // console.log(profileImageMime.);
        // var profileImagePath = req.files.profileimage.path;
        // var profileImageExt = req.files.profileimage.extensions;
        // var profileImageSize = req.files.profileimage.size;
      } else {
        var profileImageName = 'noimage';
      }

      var name_user = req.body.name_user;
      var password = req.body.password;
      var gender = req.body.gender;
      // var image_user = req.body.image_user;
      var birth = req.body.birth;
      var active = false;
      // console.log(name_user);
      //     var id_user = md5(randomString + email);

      var insertValue = new User({
        // "id_user": id_user,
        "name": name_user,
        "email": email,
        "password": password,
        "gender": gender,
        "image": profileImageName,
        "birth": birth,
        "blogs": "",
        "active": 0
      });

      // console.log(User.createUser);

      // connection.query("INSERT INTO users SET ?", insertValue, function (err, result) {
      User.createUser(insertValue, function (err, result) {
        if (err) {
          console.log(err);
          return res.json("Error");
        }
        var id_user = result._id;
        var mailOptions = {
          from: 'Tung Mai <mtung280196@gmail.com>',
          to: email,
          subject: 'Feedy: Xác thực tài khoản',
          text: 'Xác thực tài khoản',
          html: '<p>Truy cập vào link để xác thực tài khoản</p><a href="' + URL + '/users/register/verify?id=' + id_user + '">Xac thuc</a>'
        }

        transporter.sendMail(mailOptions, function (err, res) {
          if (err) {
            console.log(err);
          } else {
            console.log('Email Sent');
          }
        });

        return res.json({ "Response": "Done" });
      });
    }
  });

});

router.get('/register/verify/', function (req, res, next) {
  var id_user = req.query.id;
  // console.log(id_user);
  User.findUserId(id_user, function (err, row) {
    if (err) {
      // console.log(err);
      return res.json(err);
    }
    if (row.length == 0) {
      // console.log(req.param('email'));
      return res.json("Account wasn't exists");
    }
    User.verityAccount(id_user, function (err, result) {
      if (err) return res.json(err);
      res.render('verity_register');
      return console.log("Done");
    });
  });
});
//login account
router.get("/login/:email/:password", function (req, res, next) {
  // var loginValue = {
  var email = req.params.email;
  var password = req.params.password;
  // console.log(email + ";" + password);
  User.loginAccount(email, password, function (err, result) {
    if (err) return res.json("Error");
    if (result.length == 0) return res.json("Ko dc");
    if (result[0].active == 0) return res.json("Don't verity");

    return res.json(result);
  });
});

//forger password account
router.post("/login/forget", function (req, res, next) {
  var email = req.body.email;
  User.findUserEmail(email, function (err, result) {
    if (err) {
      console.log(err);
      return res.json("Error");
    }
    if (result.length == 0) {
      return res.json("Ko dc");
    } else {
      id_user = result[0]._id;
      var mailOptions = {
        from: 'Tung Mai <mtung280196@gmail.com>',
        to: email,
        subject: 'Feedy: Quên mật khẩu',
        text: 'Quên mật khẩu',
        html: 'Mật khẩu của bạn là: ' + result[0].password
      }

      transporter.sendMail(mailOptions, function (err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log('Email Sent');
        }
      });
    }
  });
  return res.json("Done");
});

router.get("/login/change", function (req, res, next) {
  //console.log("abv")
  // res.json("abc")
  res.render('change_password');
});

module.exports = router;
