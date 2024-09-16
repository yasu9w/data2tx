const functions = require('firebase-functions');
const cors = require("cors")({origin: true});
const {Storage} = require("@google-cloud/storage");
const storage = new Storage();
const nacl = require("tweetnacl");
const {PublicKey} = require("@solana/web3.js");

exports.getSignedUrl = functions.region("asia-northeast1").https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Request Body:', req.body);

      const bucketName = "data2txdemo-original";
      const fileName = "images/test/" + req.body.fileName;
      const fileNameJson = "images/test/" + req.body.fileName.split(".")[0] + ".json";
      const publicKeyStr = req.body.message.split(".")[0];
      const options = {
        version: "v4",
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      };

      const publicKey = new PublicKey(publicKeyStr);
      const messageUint8 = new TextEncoder().encode(req.body.message);
      const signatureUint8 = new Uint8Array(Buffer.from(req.body.signature, 'base64'));
      const publicKeyUint8 = Uint8Array.from(publicKey.toBytes());

      const verified = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);

      if (verified) {
        try {
          const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl(options);
          const [urlJson] = await storage.bucket(bucketName).file(fileNameJson).getSignedUrl(options);
          res.status(200).send({url: url, urlJson: urlJson});
        } catch (error) {
          console.error('Error occurred while obtaining the Signed URL:', error);
          res.status(500).send({error: error.toString()});
        }
      } else {
        res.status(400).send({error: 'Failed to verify signature'});
      }
    } catch (error) {
      console.error('Error occurred during function execution:', error);
      res.status(500).send({error: error.toString()});
    }
  });
});