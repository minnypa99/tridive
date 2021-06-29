'use strict';

// Requiring module 
var app  = require('express')();
var server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);

var os = require("os");
var hostname = os.hostname();

// Defining port number 
const PORT = 8900;

// For PUb/Sub 
const reqTopic = 'RenderRequest';
const resTopic = 'RenderReceived';
const resSubscription = 'RenderReceived-sub01';
const subsName = 'ResSub-'+hostname;
//var subscription;
// const data = JSON.stringify({foo: 'bar'});
var push_data = '';
var push_attr = {};

// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');
const grpc = require('grpc');
const pubsub = new PubSub({grpc});

// Creates a client; cache this for further use
//const pubSubClient = new PubSub();
const pubSubClient = new PubSub({grpc});



app.get('/hybrid', function(req, res) {
  res.sendFile('/home/autoever/public/hybrid.html');
});


async function createSubscription() {
  const options = {
	messageRetentionDuration: 3600
//	expirationPolicy: {
//		ttl: 1
//	}
  };

    // check if subscription exists, if not, create one
    try{
        const metadata = await pubSubClient.subscription(subsName).getMetadata();
        console.log('sub exists ' );
    }catch(e){
        console.log('sub non exists');
        await pubSubClient.topic(resTopic).createSubscription(subsName, options);
    }
}

//createSubscription().catch(console.error);
createSubscription();


//const subscription = pubSubClient.topic(resTopic).createSubscription(subsName);

async function publishMessage() {
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(push_data);

  try {
    const messageId = await pubSubClient.topic(reqTopic).publish(dataBuffer, push_attr);
    console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    process.exitCode = 1;
  }
}


// connection event handler
// connection이 수립되면 event handler function의 인자로 socket인 들어온다
io.on('connection', function(socket) {
        socket.emit('s2c', {msg:'From server :: Hello all!'});
        console.log('Connected - socket.id : ' + socket.id );

  // 접속한 클라이언트의 정보가 수신되면
  socket.on('login', function(data) {
    console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

    // socket에 클라이언트 정보를 저장한다
    socket.name = data.name;
    socket.userid = data.userid;

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    io.emit('login', data.name );
  });

  // 클라이언트로부터의 메시지가 수신되면
  socket.on('chat', function(data) {
    console.log('Message from %s: %s', socket.id, data.msg);

          var retmsg = data.msg + ' from server';
    var msg = {
      from: {
        name: 'server',
        userid: socket.userid
      },
      msg: retmsg
    };

    // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
    //socket.broadcast.emit('chat', msg);

    // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
          if( data.msg.includes('car') ){
                //socket.emit('openPic', data.msg );

		push_attr.socketid = socket.id;
		push_attr.carid = 'Genesys';

		push_data = data.msg;

		publishMessage();
          }else{
                socket.emit('s2cchat', msg);
          }

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    // io.emit('s2c chat', msg);

    // 특정 클라이언트에게만 메시지를 전송한다
    // io.to(id).emit('s2c chat', data);
  });

  // listen messages on Respose Topic
  async function listenForMessages() {
    // Reference server's own subscription 
    const subscription = await pubSubClient.subscription(subsName);
   
       
    // Create an event handler to handle messages
    let messageCount = 0;
    const messageHandler = message => {
    //   console.log(`Received message ${message.id}:`);
    //   console.log(`\tData: ${message.data}`);
    //   console.log(`\tAttributes: ${message.attributes}`);
        messageCount += 1;

	var resAttr = message.attributes;

	//console.log('RenderImage from %s, to %s ::  %s', resAttr.workername,resAttr.socketid, message.data);
	
       	io.to(resAttr.socketid).emit('openPic', 'http://34.120.229.167/rendered/'+message.data );

       	// "Ack" (acknowledge receipt of) the message
       	message.ack();
     };                                              

     subscription.on('message', messageHandler);

  }

  listenForMessages();
  console.log('start to listen messages from PubSub ');

  // force client disconnect from server
  socket.on('forceDisconnect', function() {
    socket.disconnect();
  })

  socket.on('disconnect', function() {
    console.log('user disconnected: ' + socket.id);
  });
});

// Server setup 
server.listen(PORT, () => {
console.log(`Running server on PORT ${PORT}...`);
})
      
