var app  = require('express')();
var server = require('http').createServer(app);
var base64url = require('base64url');
var moment = require('moment');
var crypto = require('crypto');

// Defining port number 
const PORT =8000;

//const crypto = require("crypto")

const urlPrefix = 'http://34.149.187.115/rendered/';
const linkDurationInSeconds = 1800;
const keyName = 'cb-sign-key';
const keyVal = 'WvvOqKDciiKZMYws65UdKw==';

//const urlPrefixEncoded = encodeURI(urlPrefix);
const urlPrefixEncoded = Buffer.from(urlPrefix).toString("base64");
const expireVal = parseInt(moment().utc().add(linkDurationInSeconds, 'seconds').format('X'))

// Param string to be signed with key
const paramsToSign = `URLPrefix=${urlPrefixEncoded}&Expires=${expireVal}&KeyName=${keyName}`;

// Compute signature
const keyBytes = Buffer.from(keyVal, "base64");
// Expected key: []byte{0x9d, 0x9b, 0x51, 0xa2, 0x17, 0x4d, 0x17, 0xd9,
// 0xb7, 0x70, 0xa3, 0x36, 0xe0, 0x87, 0x0a, 0xe3}
  const signedPrefixInBase64 = crypto
    .createHmac("sha1", keyBytes)
    .update(paramsToSign)
    .digest("base64");



const signature = base64url.fromBase64(signedPrefixInBase64);

const signedParam = `${paramsToSign}&Signature=${signature}`;
  console.log( `${paramsToSign}&Signature=${signature}` );


// Function to serve all static files 
// inside public directory. 
app.get('/signedparam', function(req, res) {
        res.send('SignedParam is ' + signedParam);
});


// Server setup 
server.listen(PORT, () => {
console.log(`Running server on PORT ${PORT}...`);
})
