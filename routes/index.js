var express = require('express');
var router = express.Router();
var multer = require('multer');
var uploads = multer({ dest: './uploads/images' });


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/tips', function (req, res, next) {
  res.render('tips', { title: 'Express' });
});

router.post('/uploadfile', uploads.any(), function (req, res, next) {
  var files = req.files;
  res.json({ files: files });
});

module.exports = router;
