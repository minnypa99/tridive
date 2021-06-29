'use strict';

// Requiring module 
var app  = require('express')();
var server = require('http').createServer(app);

// Defining port number 
const PORT =8000;


// Function to serve all static files 
// inside public directory. 
app.get('/main', function(req, res) {
        res.sendFile('/home/autoever/public/index.html');
});


// Server setup 
server.listen(PORT, () => {
console.log(`Running server on PORT ${PORT}...`);
})
      
