var player 	= [];
var ownId	= null;

function MovePlayer (x, y) {
    var pos = player[0].GetPosition();
	
	var tmp = new sockPackage("[*MOV*]P=1||X=" + pos.x + "||Y=" + pos.y + "||nX=" + x + "||nY=" + y);
	ss2d.Socket.SendPackage(tmp);
}

ss2d.LoadPlugin("../../ss2d/ss2dRendererCanvas.js", "cRendererPlugin");
ss2d.LoadPlugin("../../ss2d/ss2dMap.js", "cMapPlugin");
ss2d.LoadPlugin("../../ss2d/ss2dSound_HTML5.js", "CSoundHTML");
ss2d.LoadPlugin("../../ss2d/ss2dInput.js", "cInputPlugin");
ss2d.LoadPlugin("../../ss2d/ss2dWebSocket.js", "cWebSocketPlugin");

ss2d.Init(false);

ss2d.Run("Start");

function Start () {
	ss2d.Socket.SetHost("ws://192.168.1.245:9985/ss2d/chat/server/own.php");
	ss2d.Socket.Connect();
	
	ss2d.Sound.Load("theme.ogg", "bgm", "background");
	//ss2d.Sound.Play("bgm", "background", true);

	ss2d.Map.useTiles = true;
	ss2d.Graphics.SetScreen(640,480);
	ss2d.SetTicksPerSecond(20);
	
	ss2d.Map.LoadRessource("images/tile_black.png");
	ss2d.Map.LoadRessource("images/tile_grass.png");
	ss2d.Map.LoadRessource("images/tile_rock.png");

	ss2d.Map.mapData = {
		header: {
			width:  10,
			height: 10,
			layers: 2
		},
		data: []
	};

	for (i = 0; i < ss2d.Map.mapData.header.height; i++) {
		ss2d.Map.mapData.data[i] = [];

		for (j = 0; j < ss2d.Map.mapData.header.width; j++) {
			ss2d.Map.mapData.data[i][j] = [ss2d.Map.mapData.header.layers];
			ss2d.Map.mapData.data[i][j][0] = {
				resId: 1
			}
			ss2d.Map.mapData.data[i][j][1] = {
				resId: 1
			}
		}
	}

	ss2d.Map.mapData.data[9][0][1] = { resId: 2 };
	ss2d.Map.mapData.data[3][7][1] = { resId: 2 };
	ss2d.Map.mapData.data[1][2][1] = { resId: 2 };
	
	ss2d.Callback.Register("PerformTick", function () {

		if (ss2d.Input.keyList[37] == true) {
			MovePlayer(-1,0);
		}
		else if (ss2d.Input.keyList[38] == true) {
			MovePlayer(0,-1);
		}
		else if (ss2d.Input.keyList[39] == true) {
			MovePlayer(1,0);
		}
		else if (ss2d.Input.keyList[40] == true) {
			MovePlayer(0,1);
		}
	}, 2);
	
	
	ss2d.Socket.RegisterFunc(function (msg) {
		var pkg = jQuery.parseJSON(msg.data);
		
		if (pkg.substr(0, 7) == "[*MOV*]") {
			var pos = pkg.substr(7).split("||");
			log("MOV: " + pkg.substr(7) + " || " + pos[1]);
			player[(pos[0] - 1)].SetPosition(pos[1], pos[2]);
		}
		else if (pkg.substr(0, 7) == "[*LGN*]") {
			var pos = pkg.substr(7).split("||");
			console.log("[LGN] Logging in...");
			console.log("[LGN] New ID received from host: " + pos[0]);
			console.log("[LGN] Setting position to " + pos[1] + "," + pos[2]);
			
			ownId = pos[0];
			player[ownId] = ss2d.NewGameObject("player_self");
			player[ownId].width    = 24;
			player[ownId].height   = 43;
			player[ownId].LoadSprite("images/char.png");
	
			player[ownId].SetPosition(pos[1], pos[2]);
		}
		else if (pkg.substr(0, 7) == "[*MSG*]") {
			log (pkg.substr(7));
		}
	});
}



function send(){
  var txt = $("#msg").val();
  if(!txt){ alert("Message can not be empty"); return; }
  $("#msg").focus();
  try{ var tmp = new sockPackage("[*MSG*]" + txt); ss2d.Socket.SendPackage(tmp); log('Sent: '+txt); } catch(ex){ log(ex); }
}

function onkey(event){ if(event.keyCode==13){ send(); } }
function log(msg){ $("#log").html($("#log").html() + "<br>" + msg); }