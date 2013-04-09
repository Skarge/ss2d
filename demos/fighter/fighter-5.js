/* ///////////////////////////////////////////////////////////////////
 * //// screenSports2D Demo-Game "Fighter"                        ////
 * //// ********************************************************* ////
 * //// @Project:   screenSports2D                                ////
 * //// @Author:    Dennis "der.skarge" Mueller                   ////
 * //// @Version:   1.0                                           ////
 * //// @Copyright: screenSports.de                               ////
 * //// @Link:      http://www.screensports.de                    ////
 * //// ********************************************************* ////
 * //// @Release:   2013/04/07                                    ////
 * //// ********************************************************* ////
 * ///////////////////////////////////////////////////////////////////
 */

function ss2dFighter () {

    var player = {
            hp:			200,
            waitHit:	10,
            nextHit:	0
    }

    var enemy = {
            hp:			200,
			think:		null,
			level:		"simple",				// dummy, simple, normal, hard
			style:		"normal"			// Noch ohne Wirkung !!!
    }
	
	
	var enemyAct = {
			IDLE:			0,
			WALK:			1,
			PUNCH:			3,
			KICK:			4,
			BEATEN:			5
	}

    var objects = {};


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   InitGame ()
     * @Author: Skarge
     * @Date:   2010/10/08
     * @Mod.:   2010/10/09
     * @Desc:   Initialisierung des Spiels, Einblenden des Menues
     */
    this.InitGame = function() {

		ss2d.Init();
		//ss2d.Input.StartMouse();
        ss2d.SetTicksPerSecond(20);

        //// Anlegen und einstellen der notwendigen GameObjects
        objects.bg   = ss2d.NewGameObject("bg");
        objects.bg.width  = 1280;
        objects.bg.height = 290;
        objects.bg.SetPosition(-255,0);
        objects.bg.LoadSprite("background/stage-background.jpg");
        objects.bg.layer  = 6;

        objects.stage = ss2d.NewGameObject("stage");
        objects.stage.width  =	1075,
        objects.stage.height = 86;
        objects.stage.SetPosition (0,285);
        objects.stage.LoadSprite("sprites/stage-bottom.jpg");
        objects.stage.layer  = 3;

        objects.flag = ss2d.NewGameObject("flag");
        objects.flag.width  = 80;
        objects.flag.height = 64;
        objects.flag.SetPosition(678,20);
        objects.flag.LoadSprite("sprites/stage-flag.jpg");

        objects.ship = ss2d.NewGameObject("ship");
        objects.ship.width  = 580;
        objects.ship.height = 290;
        objects.ship.SetPosition(-20,0);
        objects.ship.LoadSprite("background/ship.png");
        objects.stage.layer  = 4;

        objects.ship_crowd = ss2d.NewGameObject("ship_crowd");
        objects.ship_crowd.width  = 75;
        objects.ship_crowd.height = 89;
        objects.ship_crowd.SetPosition(185,153);
        objects.ship_crowd.LoadSprite("sprites/ship_crowd1.png");
        objects.stage.layer  = 3;

        objects.enemy = ss2d.NewGameObject("enemy");
        objects.enemy.width  = 110;
        objects.enemy.height = 164;
        objects.enemy.SetPosition(750,160);
        objects.enemy.LoadSprite("sprites/enemy1-normal.png");
        objects.stage.layer  = 2;

        objects.player = ss2d.NewGameObject("player");
        objects.player.width  = 115;
        objects.player.height = 164;
        objects.player.SetPosition(150,160);
        objects.player.LoadSprite("sprites/fighter1-normal.png");
        objects.stage.layer  = 2;

        //// Anlegen aller Animationen
        ss2d.Graphics.Animation.Add({
            id       : "flag",
            steps    : 3,
            duration : 21,
            imageURL : "sprites/stage-flag.jpg"
        });

        ss2d.Graphics.Animation.Add({
            id       : "ship_crowd1",
            steps    : 3,
            duration : 21,
            imageURL : "sprites/ship_crowd1_ani.png"
        });

        ss2d.Graphics.Animation.Add({
            id:         "player_standing",
            steps:		4,
            duration:	28,
            imageURL: 	"sprites/fighter1-stand.png"
        });

        ss2d.Graphics.Animation.Add({
            id:         "player_walk",
            steps:	6,
            duration:	12,
            imageURL: 	"sprites/fighter1-walk_n.png"
        });

        ss2d.Graphics.Animation.Add({
            id:         "player_punch",
            steps:		2,
            duration:	4,
            imageURL: 	"sprites/fighter1-punch.png"
        });

        ss2d.Graphics.Animation.Add({
            id:         "player_win",
            steps:		2,
            duration:	6,
            imageURL: 	"sprites/fighter1-win.png"
        });

        ss2d.Graphics.Animation.Add({
            id:         "enemy_standing",
            steps:		2,
            duration:	10,
            imageURL: 	"sprites/enemy1-stand.png"
        });

        ss2d.Graphics.Animation.Add({
            id:         "enemy_walk",
            steps:		6,
            duration:	12,
            imageURL: 	"sprites/enemy1-walk.png"
        });

        ss2d.Graphics.Animation.Add({
            id:         "enemy_punch",
            steps:		2,
            duration:	4,
            imageURL: 	"sprites/enemy1-punch.png"
        });


        //// Soundwrapper initialisieren und Sounds laden
        ss2d.Sound.Init();
        ss2d.Sound.Load("bgm/stage.ogg", "bgm", "stage");
        ss2d.Sound.Load("bgm/opening.ogg", "bgm", "title");
        ss2d.Sound.Load("Chicken.wav", "sound", "test");

        //// Menue einblenden und BGM abspielen
        ss2d.Sound.Play("bgm", "title", true);

        var menu = "<div id=\"menu_links\" style=\"position:absolute; top:270px; left:470px; text-align:center; z-index:999;\">";
           menu += " <a href=\"javascript:Fighter.StartGame();\" style=\"color:#ffffff\">Spiel starten</a><br />";
           menu += " <a href=\"javascript:Fighter.ShowKeys();\" style=\"color:#ffffff\">Steuerung / Hilfe</a><br />";
           menu += " <span style=\"color:#ffffff\">Schwierigkeit w&auml;hlen: <select id=\"menu_level\">";
		   menu += " <option>dummy</option><option selected>simple</option><option>normal</option><option>hard</option>";
		   menu += " </select></span>";
           menu += "</div>";

        $(menu).prependTo("#title");
    }



    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   ShowKeys ()
     * @Author: Skarge
     * @Date:   2010/10/08
     * @Mod.:   -
     * @Desc:   Anzeigen der Spielinformation und Tastenbelegung
     */
    this.ShowKeys = function() {
        var win = window.open("help.html", "HELP", "width=500, height=300");
    }


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   StartGame ()
     * @Author: Skarge
     * @Date:   2010/10/08
     * @Mod.:   2010/12/12
     * @Desc:   Callback mit Refresh anlegen, Starten der Animationen, Titel weg
     */
    this.StartGame = function() {

        objects.flag.AnimationPlay("flag");
        objects.ship_crowd.AnimationPlay("ship_crowd1");
        objects.player.AnimationPlay("player_standing");
        objects.enemy.AnimationPlay("enemy_standing");
		
		if ($("#menu_level").val() != enemy.level)
			enemy.level = $("#menu_level").val();

        $("#title").empty().remove();

        ss2d.Sound.Play("bgm", "stage", true);

        GuiDrawHP("player");
        GuiDrawHP("enemy");
        
        ss2d.Callback.Register("gameRefresh", function () {
            Refresh();
		}, 1);
    }


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   Refresh ()
     * @Author: Skarge
     * @Date:   2010/10/08
     * @Mod.:   2010/12/17
     * @Desc:   MainLoop des Games, wird regelmaessig aufgerufen
     */
    Refresh = function() {
		
		//// Gegner eine Aktion ausfuehren lassen
		if (enemy.hp > 0) {

        	//// Taste D	
	        if (ss2d.Input.keyList[68] == true || ss2d.Input.keyList[32] == true) {
   		        if (player.nextHit > 0)
 	                player.nextHit--;
            	else
                	PlayerPunch();
        	}
			else if (ss2d.Input.keyList[37] == true) {
            	PlayerMove("left");
            	if (objects.player.animation != "player_walk")
                	objects.player.AnimationPlay("player_walk");
        	}
        	else if (ss2d.Input.keyList[39] == true) {
            	PlayerMove("right");
            	if (objects.player.animation != "player_walk")
                	objects.player.AnimationPlay("player_walk");
        	}
        	else {
            	if (objects.player.animation != "player_standing")
                	objects.player.AnimationPlay("player_standing");
			}
			
			EnemyThink();
        }
    }


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   PlayerMove (direction)
     * @Author: Skarge
     * @Date:   2010/10/08
     * @Mod.:   -
     * @Desc:   Bewegung der Spielfigur auswerten und umsetzen
     */
    PlayerMove = function (direction) {

        var pos = objects.player.GetPosition();

        if (direction == "left") {
            if (pos.x > 2)
                pos.x = parseInt(pos.x) - 5;

            objects.player.SetPosition(pos.x, pos.y);
        }
        else if (direction == "right") {
            if (pos.x < (1000 - 99) && !ss2d.DetectCollision(objects.player, objects.enemy) && enemy.hp > 0 || pos.x < (1000 - 99) && enemy.hp <= 0)
                pos.x = parseInt(pos.x) + 5;

            objects.player.SetPosition(pos.x, pos.y);
        }
    }


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   PlayerPunch ()
     * @Author: Skarge
     * @Date:   2010/10/09
     * @Mod.:   -
     * @Desc:   Spielfigur schlagen lassen
     */
    PlayerPunch = function() {
        if (objects.player.animation != "player_punch")
            objects.player.AnimationPlay("player_punch");

        if (ss2d.DetectCollision(objects.player, objects.enemy)) {
            EnemyHit(player.punch);
            GuiDrawHP("enemy");
            player.nextHit = player.waitHit ;
        }
    }


	PlayerHit = function(power) {

            if (player.hp > 0) {
                player.hp -= power;

                if (player.hp <= 0) {
                    objects.player.AnimationPlay("player_fallen");
                }
            }
	}


	EnemyHit = function(power) {

            if (enemy.hp > 0) {
                enemy.hp -= power;

                if (enemy.hp <= 0) {
					ss2d.Callback.Register("lastHit", function () {
						objects.enemy.AnimationStop();
						objects.enemy.RemoveSprite();
						objects.enemy.LoadSprite("sprites/enemy1-dead.png");
	                    objects.player.AnimationPlay("player_win");
                    	//objects.enemy.AnimationPlay("enemy_fallen");
						
						ss2d.Callback.Register("gameEnd", function () {			
							alert ("Thanks for playing! Try another level ;)");
							location.reload();
						}, 70);
					
						ss2d.Callback.Delete("lastHit");
						
					}, 10);
                }
            }
	}


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   EnemyThink ()
     * @Author: Skarge
     * @Date:   2010/11/11
     * @Mod.:   2010/12/12
     * @Desc:   Gegner ueberlegen lassen
     */
	EnemyThink = function () {
		
		var override = true;
		
		//// Level einstellen sofern nichts aktiv ist
		if (enemy.think == null) {
			
			if (enemy.level == "dummy") {
				player.punch	= 50;
            	enemy.punch 	= 0;
            	enemy.waitHit 	= 4;
            	enemy.nextHit 	= 0;
				
				enemy.think 	= {
					waitBeforeNext:	4,
					waitCount:		3,
					currAct:		0,
					repeat:			0,
					repeatWait:		5,
					direction:		0,
					testOverride:	-1,
				}
			}
			else if (enemy.level == "simple") {
				player.punch	= 50;
            	enemy.punch 	= 15;
            	enemy.waitHit 	= 2;
            	enemy.nextHit 	= 0;
				
				enemy.think 	= {
					waitBeforeNext:	2,
					waitCount:		2,
					currAct:		0,
					repeat:			0,
					repeatWait:		5,
					direction:		0,
					testOverride:	6,
				}
			}
			else if (enemy.level == "normal") {
				player.punch	= 40;
            	enemy.punch 	= 25;
            	enemy.waitHit 	= 3;
            	enemy.nextHit 	= 0;
				
				enemy.think 	= {
					waitBeforeNext:	2,
					waitCount:		2,
					currAct:		0,
					repeat:			0,
					repeatWait:		5,
					direction:		0,
					testOverride:	8,
				}
			}
			else if (enemy.level == "hard") {
				player.punch	= 40;
            	enemy.punch 	= 40;
            	enemy.waitHit 	= 6;
            	enemy.nextHit 	= 0;
				
				enemy.think 	= {
					waitBeforeNext:	2,
					waitCount:		2,
					currAct:		0,
					repeat:			0,
					repeatWait:		4,
					direction:		0,
					testOverride:	11,
				}
			}
		}
		
		if (enemy.hp > 0) {
		
			if (enemy.think.waitCount > 0) {
				if (enemy.think.currAct != 0) {
				}
				enemy.think.waitCount--;
			}
			else {
				//// Ueberlegung durchfuehren (sofern wieder ueberlegt werden darf)
				if (enemy.think.currAct == 0) {
					var temp = Math.round(Math.random() * 10);
					
					if (temp == enemyAct.KICK)
						temp = enemyAct.PUNCH;
						
					if (temp == enemyAct.IDLE)
						enemy.think.repeat = 10;
					
					if (temp == enemyAct.PUNCH && !ss2d.DetectCollision(objects.player, objects.enemy))
						temp = enemyAct.WALK;
					
					//// Richtung fuer Laufen aussuchen
					if (temp == enemyAct.WALK || temp > enemyAct.PUNCH) {
						if (ss2d.DetectCollision(objects.player, objects.enemy)) {
							var test = Math.round(Math.random() * 10);
							if (test >= 0 && test <= enemy.think.testOverride) {
								temp = enemyAct.PUNCH;
								override = false;
							}
						}
						
						if (override == true) {
							var pos = objects.enemy.GetPosition();
							if (pos.x >= 920)
								enemy.think.direction = 0;
							else {
								var dir = Math.round(Math.random() * 10);
								if (dir == 0 || dir > 3)
									enemy.think.direction = 0;
								else
									enemy.think.direction = 1;
							}
							
							enemy.think.repeat = Math.round(Math.random() * 20) + Math.round(Math.random() * 20);
						}
					}
					
					enemy.think.currAct = (temp > enemyAct.PUNCH || temp <= enemyAct.IDLE) ? enemyAct.IDLE : temp;
					enemy.think.waitCount = enemy.think.waitBeforeNext;
					
					EnemyAct();
				}
				else
					EnemyAct();
			}
		}
	}


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   EnemyAct ()
     * @Author: Skarge
     * @Date:   2010/11/11
     * @Mod.:   2010/12/12
     * @Desc:   Aktionen des Gegners
     */
	EnemyAct = function () {
		
		if (enemy.think.currAct == enemyAct.WALK) {
			
            if (objects.enemy.animation != "enemy_walk")
                objects.enemy.AnimationPlay("enemy_walk");
			
			enemy.think.repeat--;			
			var pos = objects.enemy.GetPosition();
			
			if (enemy.think.direction == 0) {
				if (!ss2d.DetectCollision(objects.player, objects.enemy))
					objects.enemy.SetPosition((pos.x - 5), pos.y);
				else
					enemy.think.repeat = 0;
			}
			else {
				if (pos.x < 920)
					objects.enemy.SetPosition((pos.x + 5), pos.y);
				else
					enemy.think.repeat = 0;
			}
		}
		else if (enemy.think.currAct == enemyAct.PUNCH) {
			
            if (enemy.nextHit > 0)
                enemy.nextHit--;
            else {
	      	  	if (objects.enemy.animation != "enemy_punch")
    	    	    objects.enemy.AnimationPlay("enemy_punch");
		
    		    if (ss2d.DetectCollision(objects.player, objects.enemy)) {
        		    PlayerHit(enemy.punch);
            		GuiDrawHP("player");
		            enemy.nextHit = enemy.waitHit ;
				}
    	    }
			
		}
		else if (enemy.think.currAct == enemyAct.IDLE) {
			
			if (objects.enemy.animation != "enemy_standing")
    	    	objects.enemy.AnimationPlay("enemy_standing");
			
			enemy.think.repeat--;
		}
		
		if (enemy.think.repeat <= 0 || enemy.think.currAct != 1) {
			enemy.think.currAct = 0;
			enemy.think.repeat  = 0;
		}
		
		//// Zur Sicherheit ueberschreiben wir alles, sollte in der Zwischenzeit der Tod eingetreten sein
		if (enemy.hp <= 0) {
			objects.enemy.AnimationStop();
			enemy.think.currAct = -1;
			enemy.think.repeat  = 0;
		}
	}



    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   GuiDrawHP (person)
     * @Author: Skarge
     * @Date:   2010/10/08
     * @Mod.:   2010/12/15
     * @Desc:   Zeichnen der Gesundheitsanzeige
     */
    GuiDrawHP = function(person) {

        if (person == "player") {
			if (player.hp > 0) {
	            var hpbar = "<img id=\"hpbar_player\" src=\"gui-bar-hp.png\" style=\"width:" + (player.hp * 1.5) + "px; height:20px; position:absolute; top:20px; left: 20px; z-index:900;\" border=\"0\" />";
    	        if ($("#hpbar_player") != null)
        	        $("#hpbar_player").remove();
	
    	        $(hpbar).prependTo("#stage");
			}
        }
        else if (person == "enemy") {
            if (enemy.hp > 0)
                var hpbar = "<img id=\"hpbar_enemy\" src=\"gui-bar-hp.png\" style=\"width:" + (enemy.hp * 1.5) + "px; height:20px; position:absolute; top:20px; left: " + (980 - (enemy.hp * 1.5)) + "px; z-index:900;\" border=\"0\" />";
            else
                var hpbar = "<img id=\"hpbar_enemy\" src=\"gui-bar-hp.png\" style=\"width:0px; height:20px; position:absolute; top:20px; left:980px; z-index:900;\" border=\"0\" />";

            if ($("#hpbar_enemy") != null)
                $("#hpbar_enemy").remove();

            $(hpbar).prependTo("#stage");
        }
    }
}

//// Automatische Ausfuehrung des Spiels
var Fighter = new ss2dFighter();


function Start () {
	Fighter.InitGame();
}


ss2d.SetMaxFrameskip(50);
ss2d.LoadPlugin("../../ss2d/ss2dRendererFallback.js", "cRendererPlugin");
ss2d.LoadPlugin("../../ss2d/ss2dInput.js", "cInputPlugin");
ss2d.LoadPlugin("../../ss2d/ss2dSound_HTML5.js", "CSoundHTML");
ss2d.Init(false);
ss2d.Run("Start");