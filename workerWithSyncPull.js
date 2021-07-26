
/**
 *  * TODO(developer): Uncomment these variables before running the sample.
 *   */
const projectId = 'hyundai-autoever-299500';

const resTopic = 'RenderReceived';
const subscriptionName = 'RenderRequest-sub01';
const timeout = 60;
var os = require("os");
var hostname = os.hostname();

// Imports the Google Cloud client library
const {v1} = require('@google-cloud/pubsub');
const {PubSub} = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
//const pubSubClient = new PubSub({grpc});
const subClient = new v1.SubscriberClient();
const pubClient = new PubSub();

var push_data = '';
var push_attr = {};

  const formattedSubscription = subClient.subscriptionPath(
        projectId,
        subscriptionName
  );

  const maxMessages = 1;
  const request = {
        subscription: formattedSubscription,
        maxMessages: maxMessages,
        allowExcessMessages: false
  };

// The ID of your GCS bucket
const bucketName = 'tridive_render_bucket_1';

// The path to your file to upload
const filePath = '/home/autoever/images/';

// The new ID for your GCS file
const destPath = 'rendered/';

// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

// Creates a client
const storage = new Storage();

async function publishMessage(push_data, push_attr) {
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(push_data);

  try {
     const messageId = await pubClient.topic(resTopic).publish(dataBuffer, push_attr);
     console.log(`Message ${push_data} published.`);
  } catch (error) {
     console.error(`Received error while publishing: ${error.message}`);
     process.exitCode = 1;
  }
}


async function syncPull(){
  let isProcessed = false;

  //  the Woker function with received messages
  function worker(resMessage){
     console.log('Processing $(resMssage.message.data} ...' + resMessage.message.data);
  
     push_data = resMessage.message.data + '.png';

     push_attr.workername = hostname;
     push_attr.socketid = resMessage.message.attributes.socketid;

     setTimeout(() => {
	console.log('Finished processing ${resMessage.message.data} ...');
        console.log(`ReplyMessage: ${push_data}`);
        publishMessage(push_data, push_attr);
	isProcessed = true;
     }, 7000);
  }

  // pulss a specified number of messages
  const [response] = await subClient.pull(request);

  console.log('array size :: ' + response.receivedMessages.length );


  if( response.receivedMessages.length > 0 ){

  // obtains the first message
  const resMessage = response.receivedMessages[0];

console.log('message.data ' + resMessage.message.data );
	  
      var name ="";
      var possible = "abcdefghijklmnopqrstuvwxyz";
      for( var i = 0; i < 3; i++ ) {
        name += possible.charAt(Math.floor(Math.random() * possible.length));
      }

        name += resMessage.message.attributes.socketid;
        fs.writeFileSync( path.join(filePath, name), resMessage.message.attributes.socketid);

        await storage.bucket(bucketName).upload(filePath + name, {
                destination: destPath + name,
        });
        console.log(`${filePath} uploaded to ${bucketName}`);	  
  
  worker(resMessage);

  const ackRequest = {
      subscription: formattedSubscription,
      ackIds: [resMessage.ackId],
  };

  //..acknowledges the message.
  await subClient.acknowledge(ackRequest);

  let waiting = true;
  while( waiting ){
    await new Promise( r => setTimeout(r, 500));
	if( isProcessed ){
		waiting = false;
		console.log('Done. ');
	}else{
	
	}
  }

  }

     setTimeout(() => {
        syncPull();
    }, 500)
}

syncPull().catch(console.error);

/*
async function publishMessage(push_data, push_attr) {
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(push_data);
  const customAttr = push_attr;
 
 
  try {
    const messageId = await pubSubClient.topic(resTopic).publish(dataBuffer, customAttr);
    console.log(`Message ${push_data} published.`);
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    process.exitCode = 1;
  }
}

function listenForMessages() {
  // References an existing subscription
  const subscription = pubSubClient.subscription(subscriptionName);

  // Create an event handler to handle messages
  let messageCount = 0;
  const messageHandler = message => {
	var jsonmsg = JSON.parse(message.data);
	
      console.log(`Received message ${message.id}:`);
      console.log(`\tData: ${message.data}`);
      console.log(`\tAttributes: ${message.attributes}`);
      messageCount += 1;

      // "Ack" (acknowledge receipt of) the message
      message.ack();
	
	var msg = {
		socketid: jsonmsg.socketid,
		imageid: jsonmsg.imageid
	}
	//var jsonObj = new Object();
	//jsonObj.socketid = jsonmsg.socketid;
	//jsonObj.image = jsonmsg.imageid + '.png';
	push_data = jsonmsg.imageid + '.png';

	push_attr.workername = hostname;
	push_attr.socketid = jsonmsg.socketid;

	// time consuming - populating two dimensional array
	 const arrData = [];
	// preparing sample data
	for (let p = 0; p < 10000; p++) {
	     arrData[p] = [];
	     for (let c = 0; c < 20000; c++) {
	          arrData[p].push(c);
	     }
	}

	for (const pVal of arrData) {
    		for (const cVal of pVal) {}
	}

	console.log(`ReplyMessage: ${push_data}`);
	publishMessage(push_data, push_attr);
   };

   // Listen for new messages until timeout is hit
   subscription.on('message', messageHandler);

}

listenForMessages();
*/
