function ss2Ed () {
	
	var _version = "0.1dev";
	
}


function Start () {
	ss2d.Graphics.SetScreen(750,480);
}


ss2d.LoadPlugin("../../ss2d/ss2dRendererCanvas.js", "cRendererPlugin");
ss2d.SetMaxFrameskip(50);
ss2d.Init(false);