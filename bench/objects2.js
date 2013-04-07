var workers = [];
var rects		= Array();

function Bench () {
	
	var rectCount 	= 0;
	var stopTicks	= 20;
	var waitUntil	= stopTicks;
	var updateTime	= Math.round(1000 / ss2d.GetTicksPerSecond());
	
	var Random = function (n_max) {
		return Math.floor(Math.random() * (n_max - 1)) + 1;
	}
	
	this.Init = function () {
		workers[0] = new Worker("objects2_worker.js");
		workers[0].onmessage = function(e) {
			alert (e.data);
		}
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
	}
	
	
	this.UpdateRects = function () {	
		var nextReal = ss2d.GetNextReal();
		if (nextReal > 1) {
			this.NewRect();
			waitUntil = stopTicks;
		}
		else
			waitUntil--;
		
		alert (ss2d.EncodeJSON(rects));
		
		workers[0].postMessage(ss2d.EncodeJSON(rects));
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