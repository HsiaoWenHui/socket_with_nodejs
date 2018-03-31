var http = require("http");
var url = require('url');//url 是用來解析 URL 網址用的
var fs = require('fs');//fs 則是用處理檔案的模組
var io = require('socket.io')(server); // 加入 Socket.IO


let onlineCount = 0;
io.on('connection', (socket) => {
  console.log('Hello!');  // 顯示 Hello!
  onlineCount++;
    // 發送人數給網頁
  io.emit("online", onlineCount);
 
  socket.on("greet", () => {
        socket.emit("greet", onlineCount);
        
  });
  socket.on("send", (msg) => {
    io.emit("msg", msg);
  });
  // 當發生離線事件
  socket.on('disconnect', () => {
    // 有人離線了，扣人
      onlineCount = (onlineCount < 0) ? 0 : onlineCount-=1;
      io.emit("online", onlineCount);
      console.log('Bye~');  // 顯示 bye~
  });
});


var server = http.createServer(function(request, response) {
  console.log('Connection');
  var path = url.parse(request.url).pathname; //當伺服器接收到請求時，使用 url.parse() 函數解析出網址中所指定的路徑
  switch (path) {
    case '/':
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('Hello, World.');
      response.end();
      break;
    case '/socket.html'://如果路徑是 /socket.html 的話，就使用 fs 模組來讀取 socket.html 這個檔案的內容
      fs.readFile(__dirname + path, function(error, data) {
        if (error){
          response.writeHead(404);
          response.write("opps this doesn't exist - 404");
        } else {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.write(data, "utf8");
        }
        response.end();
      });
      break;
    default:
      response.writeHead(404);
      response.write("opps this doesn't exist - 404");
      response.end();
      break;
  }
});
io.listen(server); // 開啟 Socket.IO 的 listener 讓伺服器啟動時就可以準備接收來自於瀏覽器的 WebSocket 連線。
server.listen(8001);


var serv_io = io.listen(server);
serv_io.set('log level', 1);
//on() 函數將特定的事件連接到指定的匿名函數，藉此定義整個資料傳輸過程要如何運作
//on() 函數將 connection 事件與一個匿名函數連接起來，這樣只要 WebSocket 連線一建立，這個匿名函數就會被呼叫
//當瀏覽器端呼叫 io.connection() 之後，就會自動產生這個事件，進而呼叫上面這個匿名函數
serv_io.sockets.on('connection', function(socket) {
  setInterval(function() {
    socket.emit('date', {'date': new Date()});
  }, 1000);
  //每秒使用 JavaScript 的 Date() 函數產生一個 JSON 物件，傳送給瀏覽器。
  socket.on('client_data', function(data) {
    process.stdout.write(data.letter);
    socket.emit('message', {'message': data.letter});
  });
  
  // socket.emit('message', {'message': 'hello world'});
});

//當連線建立之後，我們使用 emit() 函數來傳送資料，這個函數在伺服器與瀏覽器端的用法是一樣的，作用就是將資料傳給對方。
/*emit() 會產生一個事件，而其事件的名稱是透過第一個參數來定義的
（以這個例子來說就是 message，當然你也可以使用其他的名稱），
而第二個參數則是指定這個事件所伴隨的資料，而這個資料的格式則是一個 JSON 的物件。*/