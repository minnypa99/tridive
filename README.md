# tridive sample code
## WebServer VM
mainserver.js  [lb_ip/domain]/main 요청시 public/index.html 제공 <br/>
public/index.html 서비스 기본화면 health check 결과를 바탕으로 Streaming/Image Service 선택 <br/>
- preemptible cluster health check : [lb_ip/domain]/preemptible/checkconn 결과를 preemptible_ok 에 저장<br/>
- standard cluster health check : [lb_ip/domain]]/standard/checkconn 결과를 standard_ok 에 저장 <br/>
- if preemptible_ok = 'y' then goto [lb_ip/domain]/preemptible/  ( preemptible cluster ) <br/>
  else if standard_ok = 'y' then goto [lb_ip/domain]/standard/  ( standard cluster ) <br/>
  else goto [lb_ip/domain]/images ( images cluster ) <br/>

socketserver.js  [lb_ip/domain]/images 요청시 public/images.html 제공 <br/>
- image service 를 위한 WebSocket Server <br/>
- socket 연결시에 namespace 사용 ( var nsp = io.of("/imagessocket") )  <br/>
- 메시지 송수신을 위해서 pub/sub topic 사용  ( RenderRequest,   RenderReceived ) <br/>
- 수신 topic subscription - RenderReceived-sub01 <br/>
- 송신 topic subscription 은 서버 시작시점에 확인해서 없는 경우는 서버명 기준으로 동적 생성 <br/>
- await pubSubClient.topic(resTopic).createSubscription(subsName, options) <br/>
- 클라이언트로부터 이미지 요청을 받으면, 송신 topic 에 publish <br/>
- await pubSubClient.topic(reqTopic).publish(dataBuffer, push_attr) <br/>
- Unity 서버에서 이미지 생성 결과를 수신하면 uri 를 조립하여 클라이언트에게 브로드캐스트 <br/>
- nsp.to(resAttr.socketid).emit('openPic', '/rendered/'+message.data ) <br/>

## Render Worker VM
workerWithSynPull.js  -  Req Topic,  Res Topic 으로 요청 Job 처리하는 샘플, Unity 에서 처리하는 C# 코드로 대체해야함 <br/>
- 메시지 송수신을 위해서 pub/sub topic 사용  ( RenderRequest,   RenderReceived ) <br/>
- socketserver.js 가 보낸 이미지 요청을 RenderRequest topic 의 RenderRequest-sub01 구독으로 확인 <br/>
- 메시지 pull 은 synchronous Pulling 사용하여 한번에 한건의 메시지만 가져옴 <br/>
- C# 샘플 참고 https://cloud.google.com/pubsub/docs/samples/pubsub-subscriber-sync-pull#pubsub_subscriber_sync_pull-csharp <br/>
- 이미지가 만들어지면 이미지를 Cloud Storage bucket에 저장하고 RenderReceived topic 에 이미지명을 Push <br/>
- 작업이 끝나면 지정된 주기로 다시 RenderRequest topic 에서 메시지를 pulling ( sample 의 경우 500ms ) <br/>

## Unity WebAp
public/scripts/app.js  -  Render Streaming 클라이언트 로직 <br/>
- Idle time check 해서 사용자 이벤트가 없는 경우 Socket close <br/>

public/scripts/video-player.js <br/>
- stun/turn 서버 리스트 관리 <br/>
- 예) urls: ['stun:34.64.71.200:3478'] <br/>

public/scripts/signaling.js <br/>
- websocket connection url 을 만들때, preemptible 과 standard 를 구분하기 위해서 pathname 을 붙임 <br/>
- var websocketUrl = "wss://" + location.host + location.pathname; <br/>

server.ts - 서버 로직, Health Check Function  <br/>
- sessionid 폴더 설정 ( 예 - folderPath = 'C:/connections' ) <br/>
- health check function 구현 ( e.g.   app.get('/checkconn', (req, res) ) <br/>

websocket.ts  -  서버 로직,  WebSocket 및 WebRTC 세션 체크 <br/>
- 서버가 시작할때, 모든 세션 파일을 정리
- webSocket Close 될때, 모든 세션 파일을 정리
- webrtc connect 일때, 세션파일 저장
- webrtc disconnect 일때, 세션파일 정리

