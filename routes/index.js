const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');


const router = express.Router();

const upload = multer({ dest: 'tmp/' });

router.get('/', function(req, res, next) {
  res.status(404).json('Please upload via /upload');
});

router.post('/upload', upload.single('image'), async (req, res, next) => {
  const { file } = req;
  const baseUrl = req.protocol + "://" + req.headers.host;
  const publicPath = '/uploads/' + file.filename;

  const visualRecognition = new VisualRecognitionV3({
    version: '2019-08-22',
    iam_apikey: process.env.IBM_API_KEY
  });

  const classification = await visualRecognition.classify({
    images_file: fs.createReadStream(req.file.path),
    classifier_ids: ['food']
  });

  await fs.unlink(file.path, (err) => {
    if (err) throw err;
    console.log(`${file.path} was deleted`);
  });

  res.json(classification);
});

module.exports = router;
