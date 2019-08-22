const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');


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
  const baseUrl = req.protocol + "://" + req.headers.host;
  const publicPath = '/uploads/' + file.filename;

  const visualRecognition = new VisualRecognitionV3({
    version: '2019-08-22',
    iam_apikey: process.env.IBM_API_KEY
  });

  visualRecognition.classify({
    url: baseUrl + publicPath,
    classifier_ids: ['food']
  }, async (err, response) => {
      if (err) res.sendStatus(500);
  
      await fs.unlink(file.path, (err) => {
      if (err) throw err;
        console.log(`${file.path} was deleted`);
        
      return res.json(response);
    });
  })
});

module.exports = router;
