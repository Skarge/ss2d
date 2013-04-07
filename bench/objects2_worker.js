var data;

onmessage = function(e) {
	postMessage("Output " + e.data);
}

function UpdateRects () {		
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