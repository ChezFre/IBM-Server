const express = require('express');
const fs = require('fs');
const { promisify } = require("util");

const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');

const router = express.Router();

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

router.post('/upload', async (req, res) => {
  const base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
  const binaryData = new Buffer(base64Data, 'base64').toString('binary');
  const path = `tmp/${Date.now()}.jpg`;

  await writeFile(path, binaryData, "binary")
    .then(() => console.log('file created'))
    .catch(err => console.log(err))

  const visualRecognition = new VisualRecognitionV3({
    version: '2019-08-22',
    iam_apikey: process.env.IBM_API_KEY
  });

  const classification = await visualRecognition.classify({
    images_file: fs.createReadStream(path),
    classifier_ids: ['food']
  });
  
  await unlink(path)
    .then(() => console.log('file deleted'))
    .catch(err => console.log(err))

  res.json(classification);
});

module.exports = router;
