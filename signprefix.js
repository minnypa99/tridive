var app  = require('express')();
var server = require('http').createServer(app);
var base64url = require('base64url');
var moment = require('moment');
var crypto = require('crypto');
var urljoin = require('url-join');

// Defining port number 
const PORT =8000;

const keyName = 'cb-sign-key'
const keyVal = 'WvvOqKDciiKZMYws65UdKw==';

const keyBytes = Buffer.from(keyVal, 'base64')

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
