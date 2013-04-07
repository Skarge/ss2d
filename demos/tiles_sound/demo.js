function CDemo () {
	
	this.InitDemo = function () {
		player = ss2d.NewGameObject("player");
		player.width    = 32;
		player.height   = 48;
		player.rate     = 2;
		player.speed    = 7;
		player.SetPosition(4*24,4*24);
		player.LoadSpriteSet("images/046-Grappler01.png");
		player.SpriteSet(1);
		
		ss2d.Sound.Load("theme.ogg", "bgm", "background");
		//ss2d.Sound.Play("bgm", "background", true);
		ss2d.Map.useTiles = true;
		ss2d.Graphics.SetScreen(640,480);
		ss2d.SetTicksPerSecond(60);
		
		ss2d.Graphics.SetPanorama("Morning1.png", 640, 480);
		ss2d.Graphics.MovePanorama(1,0);
		
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
		
		ss2d.Map.mapData.data[3][5][0] = { resId: -1 };
		ss2d.Map.mapData.data[3][5][1] = { resId: -1 };
		ss2d.Map.mapData.data[2][5][0] = { resId: -1 };
		ss2d.Map.mapData.data[2][5][1] = { resId: -1 };
		ss2d.Map.mapData.data[1][5][0] = { resId: -1 };
		ss2d.Map.mapData.data[1][5][1] = { resId: -1 };
		ss2d.Map.mapData.data[3][6][0] = { resId: -1 };
		ss2d.Map.mapData.data[3][6][1] = { resId: -1 };
		ss2d.Map.mapData.data[2][6][0] = { resId: -1 };
		ss2d.Map.mapData.data[2][6][1] = { resId: -1 };
		ss2d.Map.mapData.data[1][6][0] = { resId: -1 };
		ss2d.Map.mapData.data[1][6][1] = { resId: -1 };
		
		ss2d.Map.mapData.data[9][0][1] = { resId: 2 };
		ss2d.Map.mapData.data[3][7][1] = { resId: 2 };
		ss2d.Map.mapData.data[1][2][1] = { resId: 2 };
		
		ss2d.Callback.Register("checkUpdate", function () {
		
			if (ss2d.Input.keyList[37] == true) {
				SetPlayer(-1,0);
			}
			else if (ss2d.Input.keyList[38] == true) {
				SetPlayer(0,-1);
			}
			else if (ss2d.Input.keyList[39] == true) {
				SetPlayer(1,0);
			}
			else if (ss2d.Input.keyList[40] == true) {
				SetPlayer(0,1);
			}
			
			if (ss2d.Input.mouseButton[0] === true) {
				if (ss2d.Input.mousePos[1] != ss2d.Input.mousePosOld[1]) {
					SetPlayer(0,1);
				}
			}
			
			if (ss2d.Input.mouseButton[1] === true) {
				if (ss2d.Input.mousePos[1] != ss2d.Input.mousePosOld[1]) {
					SetPlayer(0,-1);
				}
			}
			
		}, 2);
	}
	
	SetPlayer = function (x, y) {
		
		if (ss2d.Callback.Check("_SS2D_MOVE_TO_player") !== true) {
			var pos = player.GetPosition();
			if ((pos.x / ss2d.Map.tileSize) > 0 && x < 0 && y == 0)
				//player.SetPosition(pos.x + (x * ss2d.Map.tileSize), pos.y + (y * ss2d.Map.tileSize));
				player.MoveTo(pos.x + (x * ss2d.Map.tileSize), pos.y + (y * ss2d.Map.tileSize));
		
			else if ((pos.x / ss2d.Map.tileSize) + 1 < ss2d.Map.mapData.header.width && x > 0 && y == 0)
				player.MoveTo(pos.x + (x * ss2d.Map.tileSize), pos.y + (y * ss2d.Map.tileSize));
		
			else if ((pos.y / ss2d.Map.tileSize) > 0 && y < 0 && x == 0)
				player.MoveTo(pos.x + (x * ss2d.Map.tileSize), pos.y + (y * ss2d.Map.tileSize));
		
			else if ((pos.y / ss2d.Map.tileSize) + 2 < ss2d.Map.mapData.header.height && y > 0 && x == 0)
				player.MoveTo(pos.x + (x * ss2d.Map.tileSize), pos.y + (y * ss2d.Map.tileSize));
		}
	}
}

var objDemo = new CDemo();


ss2d.SetMaxFrameskip(50);

ss2d.LoadPlugin("../../ss2d/ss2dRendererCanvas.js", "cRendererPlugin");
ss2d.LoadPlugin("../../ss2d/ss2dInput.js", "cInputPlugin");
ss2d.LoadPlugin("../../ss2d/ss2dSound_HTML5.js", "CSoundHTML");
ss2d.LoadPlugin("../../ss2d/ss2dMap.js", "cMapPlugin");

ss2d.Init(false);
ss2d.Run("Start");

function Start () {
	objDemo.InitDemo();
}