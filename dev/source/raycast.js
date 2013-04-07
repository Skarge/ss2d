var objCanvas = null;
var count = 0;

var scene = {
	width:	640,
	height:	480
}

var abstand = (scene.width / 2) /  Math.tan(180);

var mapWidth = 12;
var mapHeight = 7;

var map = [
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

var player = {
	x:			3,
	y:			2,
	dir:		0,
	rotDeg:		0,
	rot:		135,
	speed:		0,
	moveSpeed:	0.3,
	rotSpeed:	3
}

var rayWidth 	= 1;
var fov			= 60 * Math.PI / 180;
var numRays		= Math.ceil(scene.width / rayWidth);
var viewDist	= (scene.width / 2) / Math.tan((fov / 2));
var twoPI		= Math.PI * 2;


function SendRay () {
	
	var startAngle = player.rot;
	for (var i = 0; i < numRays; i++) {
		
		var angle = (startAngle - (i * (640 / numRays)));
		CastRay(angle);
	}
}

function CastRay (rayAngle) {
	
	var wand = { x: 0, y: 0, dist: 1, angle: rayAngle }
	
	var rayX = player.x;
	var rayY = player.y;
	var rayC = 1;
	
	var tangens = Math.tan(((rayAngle / 180) * Math.PI));
	
	//// Winkel 0, Strahl nach rechts
	if (rayAngle == 0) {
		rayX += 1;
		while (map[rayY][rayX] != 1) {
			rayX += 1;
			rayC++;
		}
		wand.x = rayX;
		wand.y = rayY;
		wand.dist = rayC;
	}
	else if (rayAngle > 0 && rayAngle < 90) {
		dx = 0.5;
		dy = -tangens * dx;
		var wand1 = WallDiag(player.x, player.y, dx, dy);
		dx = -0.5;
		dy = -dy / tangens;
		var wand2 = WallDiag(player.x, player.y, dx, dy);
		
		wand = (wand1.y < wand2.y) ? wand1 : wand2;
	}
	//// Winkel 90, Strahl nach oben
	else if (rayAngle == 90) {
		rayY += 1;
		while (map[rayY][rayX] != 1) {
			rayY += 1;
			rayC++;
		}
		wand.x = rayX;
		wand.y = rayY;
		wand.dist = rayC;
	}
	else if (rayAngle > 90 && rayAngle < 180) {
		dx = -0.5;
		dy = -tangens * dx;
		var wand1 = WallDiag(player.x, player.y, dx, dy);
		dx = -0.5;
		dy = -dy / tangens;
		var wand2 = WallDiag(player.x, player.y, dx, dy);
		
		wand = (wand1.y < wand2.y) ? wand1 : wand2;
	}
	//// Winkel 180, Strahl nach links
	else if (rayAngle == 180) {
		rayX -= 1;
		while (map[rayY][rayX] != 1) {
			rayX -= 1;
			rayC++;
		}
		wand.x = rayX;
		wand.y = rayY;
		wand.dist = rayC;
	}
	else if (rayAngle > 180 && rayAngle < 270) {
		dx = -0.5;
		dy = -tangens * dx;
		var wand1 = WallDiag(player.x, player.y, dx, dy);
		dx = 0.5;
		dy = -dy / tangens;
		var wand2 = WallDiag(player.x, player.y, dx, dy);
		
		wand = (wand1.y < wand2.y) ? wand1 : wand2;
	}
	//// Winkel 270, Strahl nach rechts
	else if (rayAngle == 270) {
		rayY -= 1;
		while (map[rayY][rayX] != 1) {
			rayY -= 1;
			rayC++;
		}
		wand.x = rayX;
		wand.y = rayY;
		wand.dist = rayC;
	}
	else {
		dx = 0.5;
		dy = -tangens * dx;
	}
	
	wand.angle = rayAngle;
	drawRay(wand);
}


function WallDiag (px, py, dx, dy) {
	
	var mitteX = px + 0.5;
	var mitteY = py + 0.5;
	var schnittpunktX = mitteX + dx;
	var schnittpunktY = mitteY + dy;
	
	dx = dx * 2;
	dy = dy * 2;
	FeldXpos = parseInt(schnittpunktX);
	FeldYpos = parseInt(schnittpunktY);
	
	if (0 < FeldXpos < mapWidth && 0 < FeldYpos < mapHeight) {
		while (map[FeldYpos][FeldXpos] != 1) {
			schnittpunktX += dx;
			schnittpunktY += dy;
			FeldXpos = parseInt(schnittpunktX);
			FeldYpos = parseInt(schnittpunktY);
			
			if (0 >= FeldXpos || FeldXpos == mapWidth || 0 >= FeldYpos || FeldYpos == mapHeight)
				break;
		}
		var dist = Math.sqrt(Math.pow((schnittpunktX - mitteX), 2) + Math.pow((schnittpunktY - mitteY), 2));
	}
	
	return ({ x: FeldXpos, y: FeldYpos, dist: dist, angle: 0 });
}


function drawRay(strip) {

	objCanvas.lineWidth = "1.0";
	objCanvas.beginPath();
    objCanvas.moveTo(320 + (180 - strip.angle), 30 + Math.round(abstand / strip.dist));
    objCanvas.lineTo(320 + (180 - strip.angle), 450 - Math.round(abstand / strip.dist));
    objCanvas.strokeStyle = "#000000";
    objCanvas.stroke();
}


function ClearScene() {
	//objCanvas.fillStyle = "#bbb";
	//objCanvas.fillRect(0, 0, scene.width, scene.height);
}


function DrawScene () {
}


function MainLoop () {
	
	ClearScene();
	SendRay();
	DrawScene();
	
	count++;
	//document.getElementById("output").innerHTML = count;
	
	//setTimeout("MainLoop()", 50);
}

function Init () {

	objCanvas = document.getElementById("screen").getContext("2d");
}


Init();
MainLoop();