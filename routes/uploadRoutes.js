const AWS = require('aws-sdk');
const keys = require('../config/keys');
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3({
  accessKeyId: keys.AWSAccessKeyId,
  secretAccessKey: keys.AWSSecretKey
});

module.exports = app => {
  app.get('/api/upload', requireLogin, (req, res) => {
    // Key = name of file to upload
    const key = `${req.user.id}/${uuid()}.jpeg`;

    const params = {
      Bucket: 'blogster-advanced-node',
      ContentType: 'image/jpeg',
      Key: key
    }
    s3.getSignedUrl('putObject', params, (err, url) => {
      res.send({ key, url });
    });
  });
};
