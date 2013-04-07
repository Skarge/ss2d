//// Notwendige Plugins laden und initialisieren
ss2d.LoadPlugin("../../ss2d/ss2dWebSocket.js", "cWebSocketPlugin");
ss2d.Init(false);


ss2d.Socket.SetHost("ws://192.168.1.10:8085");
ss2d.Socket.Connect();