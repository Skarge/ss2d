function Bench () {
	
	var rectCount 	= 0;
	var rects		= Array();
	var stopTicks	= 20;
	var waitUntil	= stopTicks;
	var updateTime	= Math.round(1000 / ss2d.GetTicksPerSecond());
	
	var Random = function (n_max) {
		return Math.floor(Math.random() * (n_max - 1)) + 1;
	}
	
	this.Init = function () {
		
		this.UpdateRects();
	}
	
	this.NewRect = function () {
		
		var objNew = ss2d.NewGameObject("rect_" + rectCount);
		objNew.SetPosition(Random(670), Random(400));
		objNew.width 	= Random(80);
		objNew.height 	= objNew.width;
		objNew.dir		= Random(2);
		objNew.speed	= Random(10);
		objNew.LoadSprite("gfx/cube_" + Random(4) + ".png");
		rects.push(objNew);
		rectCount++;
		$("#rectCount").html("Objekte: " + rectCount);
	}
	
	
	this.UpdateRects = function () {
		
		var nextReal = ss2d.GetNextReal();
		if (nextReal > 1) {
			this.NewRect();
			waitUntil = stopTicks;
		}
		else
			waitUntil--;
		
		for (var i = 0; i < rectCount; i++) {
			var locRect = rects[i];
			var pos		= locRect.GetPosition();
			if (locRect.dir == 1) {
				if ((pos.x + locRect.width) < 750)
					locRect.SetPosition((pos.x += locRect.speed), pos.y);
				else {
					locRect.SetPosition((pos.x -= locRect.speed), pos.y);
					locRect.dir = 2;
				}
			}
			else {
				if (pos.x > 2)
					locRect.SetPosition((pos.x -= locRect.speed), pos.y);
				else {
					locRect.SetPosition((pos.x += locRect.speed), pos.y);
					locRect.dir = 1;
				}
			}
			locRect.spriteId.updated = true;
		}
		
		if (waitUntil <= 0) {
			alert ("GameObject-Test: " + (rectCount * 1.5) + " Punkte!");
		}
		else
			setTimeout("objBench.UpdateRects()", updateTime);
	}
}

function Start () {
	ss2d.Graphics.SetScreen(750,480);
	objBench.Init();
}

var objBench = new Bench();

ss2d.SetMaxFrameskip(50);
ss2d.LoadPlugin("../ss2d/ss2dRendererCanvas.js", "cRendererPlugin");
ss2d.Init(false);
ss2d.Run("Start");