const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const directory = path.join(__dirname, '../public/uploads');
    cb(null, directory)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage });

router.get('/', function(req, res, next) {
  res.status(404).json('Please upload via /upload');
});

router.post('/upload', upload.single('image'), async (req, res, next) => {
  const file = req.file;
  const publicPath = '/uploads/' + file.filename

  await fs.unlink(file.path, (err) => {
    if (err) throw err;
    console.log(`${file.path} was deleted`);
  });

  const baseUrl = req.protocol + "://" + req.headers.host;

  res.json(baseUrl);
});

module.exports = router;
