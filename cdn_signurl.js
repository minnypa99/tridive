var app  = require('express')();
var server = require('http').createServer(app);
var crypto = require('crypto');
var moment = require('moment');
var base64url = require('base64url');
var urljoin = require('url-join');

const PORT =8000;

const keyName = 'cb-sign-key'
const keyVal = 'WvvOqKDciiKZMYws65UdKw==';

const keyBytes = Buffer.from('WvvOqKDciiKZMYws65UdKw==', 'base64')

app.get('/signurl', function(req, res) {

        const signingURL = 'http://34.149.187.115/'

        const filename = 'car001.png'
        const pathToFile = `rendered/black/${filename}`
        const linkDurationInSeconds = 600

        // Generate the signed URL
        const encodedURI = encodeURI(urljoin(signingURL, pathToFile))
        //const encodedURI = encodeURI('http://34.149.187.115/rendered/black/car001.png');
        const expiration = parseInt(moment().utc().add(linkDurationInSeconds, 'seconds').format('X'))
        const urlToSign = `${encodedURI}?Expires=${expiration}&KeyName=${keyName}`
        const signedURLInBase64 = crypto.createHmac('sha1', keyBytes).update(urlToSign).digest('base64')
        const signature = base64url.fromBase64(signedURLInBase64);
        const signedURL = `${urlToSign}&Signature=${signature}`;
        console.log({ signedURL });

        res.send('signedURL is ' + signedURL);
});

app.get('/signprefix', function(req, res) {

        const urlPrefix = 'http://34.149.187.115/rendered/';
        const linkDurationInSeconds = 600;

        const urlPrefixEncoded = Buffer.from(urlPrefix).toString("base64");
        const expiration = parseInt(moment().utc().add(linkDurationInSeconds, 'seconds').format('X'))

        // Param string to be signed with key
        const paramsToSign = `URLPrefix=${urlPrefixEncoded}&Expires=${expiration}&KeyName=${keyName}`;

        // Compute signature
        const signedPrefixInBase64 = crypto
        .createHmac("sha1", keyBytes)
        .update(paramsToSign)
        .digest("base64");

        const signature = base64url.fromBase64(signedPrefixInBase64);
        const signedParam = `${paramsToSign}&Signature=${signature}`;
        console.log( `${paramsToSign}&Signature=${signature}` );

        res.send('SignedParam is ' + signedParam);
});

// Server setup
server.listen(PORT, () => {
console.log(`Running server on PORT ${PORT}...`);
})
