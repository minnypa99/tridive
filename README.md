# tridive sample code
## WebServer VM
mainserver.js  [lb_ip/domain]/main 요청시 public/index.html 제공 <br/>
public/index.html 서비스 기본화면 health check 결과를 바탕으로 Streaming/Image Service 선택 <br/>
- preemptible cluster health check : [lb_ip/domain]/preemptible/checkconn 결과를 preemptible_ok 에 저장<br/>
- standard cluster health check : [lb_ip/domain]]/standard/checkconn 결과를 standard_ok 에 저장 <br/>
- if preemptible_ok = 'y' then goto [lb_ip/domain]/preemptible/  ( preemptible cluster ) <br/>
  else if standard_ok = 'y' then goto [lb_ip/domain]/standard/  ( standard cluster ) <br/>
  else goto [lb_ip/domain]/images ( images cluster ) <br/>

socketserver.js  public/images.html - image service 를 위한 WebSocket Server/Client <br/>

## Render Worker VM
workerWithSynPull.js  -  Req Topic,  Res Topic 으로 요청 Job 처리 <br/>

## Unity WebAp
app.js  -  클라이언트 로직,  Idle time check 해서 Socket close <br/>
websocket.ts  -  서버 로직,  WebSocket 및 WebRTC 세션 체크
server.ts - 서버 로직, Health Check Function 
