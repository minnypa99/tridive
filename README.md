# tridive sample code
## WebServer VM
mainserver.js,  public/index.html. - 첫화면 제공 Web Server/Client,  Streaming/Image Service 선택 <br/>
socketserver.js  public/images.html - image service 를 위한 WebSocket Server/Client <br/>

## Render Worker VM
workerWithSynPull.js  -  Req Topic,  Res Topic 으로 요청 Job 처리 <br/>

## Unity WebAp
app.js  -  클라이언트 로직,  Idle time check 해서 Socket close <br/>
websocket.ts  -  서버 로직,  WebSocket 및 WebRTC 세션 체크
server.ts - 서버 로직, Health Check Function 
