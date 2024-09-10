const cors = require('cors')({ origin: true });
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const nacl = require('tweetnacl');
const { PublicKey } = require('@solana/web3.js');


exports.getSignedUrl2 = (req, res) => {
    cors(req, res, async () => {
        // The ID of your GCS bucket
        const bucketName = 'aifoods-original';

        // The ID of your GCS file
        //const fileName = 'images/test/20230622223547AGoUwdnsM9.jpeg';
        const fileName = 'images/test/' + req.body.fileName;
        const fileNameJson = 'images/test/' + req.body.fileName.split('.')[0] + '.json';
        const publicKeyStr = req.body.message.split('.')[0];
        // These options will allow temporary read access to the file
        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        };

        const publicKey = new PublicKey(publicKeyStr);
        const messageUint8 = new TextEncoder().encode(req.body.message);
        const decodedString = atob(req.body.signature);
        const signatureUint8 = new Uint8Array([...decodedString].map(char => char.charCodeAt(0)));

        const publicKeyUint8 = Uint8Array.from(publicKey.toBytes());

        const verified = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);

        if (verified) {
            try {
                const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl(options);
                const [urlJson] = await storage.bucket(bucketName).file(fileNameJson).getSignedUrl(options);
                res.status(200).send({ url: url, urlJson: urlJson });
            } catch (error) {
                console.error(error);
                res.status(500).send(error);
            }
        } else {
            // flagがfalseの場合は何も返さない
            res.status(200).send({});
        }

    });
};