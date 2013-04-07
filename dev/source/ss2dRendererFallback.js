/* ///////////////////////////////////////////////////////////////////
 * //// 2D-Gamelib "screenSports2D" Fallback-Div-Renderer         ////
 * //// ********************************************************* ////
 * //// @Project:   screenSports2D                                ////
 * //// @Author:    Dennis "Skarge" Müller                        ////
 * //// @Version:   210                                           ////
 * //// @Copyright: screenSports.de                               ////
 * //// @Link:      http://www.screensports.de                    ////
 * //// ********************************************************* ////
 * //// @Release:   2011/01/01                                    ////
 * //// ********************************************************* ////
 * //// @Summary:                                                 ////
 * //// Fallback-Rendering		                                  ////
 * //// ********************************************************* ////
 * //// @Description:                                             ////
 * //// Erzeugt mit Hilfe von DIVs eine alternative Anzeige fuer  ////
 * //// Geräte ohne Canvas-Element.                               ////
 * ////                                                           ////
 * //// Die Nutzung dieser Software unterliegt den Rahmen-        ////
 * //// bedingungen der Lizenz. Weitere Informationen unter       ////
 * //// http://zero.screensports.de/lizenz.txt                    ////
 * ///////////////////////////////////////////////////////////////////
 */

function cRendererPlugin ()  {

    this.Graphics = {

        _graphMain:     this,

		width:		1000,
		height:		360,

        viewport:      {
            x:          0,
            y:          0
        },

        sprites:        [],                 // Liste aller Sprites
        aniSprites:     [],
        animations:     [],

		////////////////////////////////////////////////////////////////////////////////////////
		/////
		/////	***** Initialisierung des Plugins *****
		/////
		////////////////////////////////////////////////////////////////////////////////////////
        
		Init: function() {
			var stage = "<div id='fallback_stage' style='position: absolute; overflow:hidden; width:" + this.width + "px; height:" + this.height + "px'></div>";
			$("#stage").css("width", this.width + "px");
			$("#stage").css("height", this.height + "px");
			$("#stage").html(stage);
		},

        SetScreen: function (width, height) {

            try {
                if (typeof width == "undefined" || width <= 0)
                    throw "SS2D_GRAPHICS_SET_SIZE: Keine Breite definiert.";

                if (typeof height == "undefined" || height <= 0)
                    throw "SS2D_GRAPHICS_SET_SIZE: Keine Hoehe definiert.";

                this.width  = width;
                this.height = height;

                $("#SS2D_SCREEN").attr("width", width);
                $("#SS2D_SCREEN").attr("height", height);
                $("#SS2D_CANVAS").attr("width", width);
                $("#SS2D_CANVAS").attr("height", height);
            }
            catch (e) {
                eHandler.throwWarning(e);
                return false;
            }
        },


        SpriteAdd: function (spriteId, src, gameObjId) {

            try {
                if (typeof spriteId == "undefined" || spriteId == "")
                    throw "SS2D_GRAPHICS_SPRITE_ADD: Keine ID angegeben.";

                if (typeof src == "undefined" || src == "")
                    throw "SS2D_GRAPHICS_SPRITE_ADD: Keine Bildquelle angegeben.";

                if (typeof gameObjId == "undefined")
                    gameObjId = "";

                var sprite = new this.Sprite_Template(spriteId, src, gameObjId);
                this.sprites.push(sprite);
				
				$("#fallback_stage").prepend(sprite.image);
				
                return sprite;
            }
            catch (e) {
                eHandler.throwWarning(e);
                return false;
            }
        },

        SpriteRemove: function (spriteId) {

            try {
                if (typeof spriteId == "undefined" || spriteId == "")
                    throw "SS2D_GRAPHICS_SPRITE_REMOVE: Keine ID angegeben. Was soll geloescht werden???";

                if (this.sprites.length > 0) {
                    for (var i = this.sprites.length; i--;) {
                        if (this.sprites[i].id == spriteId) {
							$("#" + this.sprites[i].id).remove();
                            if (this.sprites.splice(i, 1))
                                return true;
                            else
                                return false;
                            
                            break;
                        }
                    }
                }
                
                return false;
            }
            catch (e) {
                eHandler.throwWarning(e);
                return false;
            }
        },


	////////////////////////////////////////////////////////////////////////////////////////
	/////
	/////	***** Animationen *****
	/////
	////////////////////////////////////////////////////////////////////////////////////////

        Animation: {

            Update: function () {

                for (var i = ss2d.Graphics.aniSprites.length; i--;) {
                    if (ss2d.Graphics.aniSprites[i].objId.aniTick >= ss2d.Graphics.aniSprites[i].objId.aniWait) {

                        if (ss2d.Graphics.aniSprites[i].objId.aniCStep < ss2d.Graphics.aniSprites[i].objId.aniSteps)
                            ss2d.Graphics.aniSprites[i].objId.aniCStep++;
                        else
                            ss2d.Graphics.aniSprites[i].objId.aniCStep = 0;

                        ss2d.Graphics.aniSprites[i].objId.aniTick = 0;
                        ss2d.Graphics.aniSprites[i].objId.aniWait  = (ss2d.Graphics.aniSprites[i].objId.aniDuration / ss2d.Graphics.aniSprites[i].objId.aniSteps);
						
						var animation = ss2d.Graphics.animations[ss2d.Graphics.aniSprites[i].objId.aniKey];
						
						$("#" + ss2d.Graphics.aniSprites[i].objId.id).css("background-image", "url('" + animation.image.src + "')");
						$("#" + ss2d.Graphics.aniSprites[i].objId.id).css("background-position", "-" + (ss2d.Graphics.aniSprites[i].objId.aniCStep * ss2d.Graphics.aniSprites[i].objId.gameObjId.width) + "px 0px");
                    }
                    else
                        ss2d.Graphics.aniSprites[i].objId.aniTick++;
                }
            },

            Add: function (objAnimation) {

                newAnimation = {
                    id        : objAnimation.id,
                    steps     : objAnimation.steps,
                    image     : new Image(),
                    duration  : objAnimation.duration
                };

                newAnimation.image.src = objAnimation.imageURL;

                ss2d.Graphics.animations.push(newAnimation);
            },

            Remove: function (id) {

                try {
                    if (typeof id == "undefined" || id == "")
                        throw "SS2D_GRAPHICS_ANIMATION_REMOVE: Keine ID angegeben. Was soll geloescht werden???";

                    
                }
                catch (e) {
                    eHandler.throwWarning(e);
                    return false;
                }
            },

            Play: function (name, gameObjId) {
                gameObjId.spriteId.AnimationPlay(name);
            },

            Stop: function (gameObjId) {
                gameObjId.spriteId.AnimationStop();
            }
        },


	////////////////////////////////////////////////////////////////////////////////////////
	/////
	/////	***** Leeren des Bildschirms, Zeichnung der Szene *****
	/////
	////////////////////////////////////////////////////////////////////////////////////////


	//// Aktualisierungsroutine
    UpdateDraw: function () {

        this.Animation.Update();
		this.CheckPosition();
        //this.DrawScene();
    },
	
	
	/* /////////////////////////////////////////////////////////////////////////
     * @Func:   CheckPosition ()
     * @Author: Skarge
     * @Date:   2011/01/01
     * @Mod.:   -
     * @Desc:   Die Nutzung von DIVs erfordert einen regelmäßigen Abgleich der Positionen
     */
	CheckPosition: function () {
		
		for (var i = this.sprites.length; i--; ) {
			
			var changed = false;
			
			if (this.sprites[i].position.x != this.sprites[i].gameObjId.position.x) {
				changed = true;
				this.sprites[i].position.x = this.sprites[i].gameObjId.position.x;
			}
				
			if (this.sprites[i].position.y != this.sprites[i].gameObjId.position.y) {
				changed = true;
				this.sprites[i].position.y = this.sprites[i].gameObjId.position.y;
			}
			
			if (changed === true) {
				$("#" + this.sprites[i].id).css("left", this.sprites[i].position.x + "px");
				$("#" + this.sprites[i].id).css("top", this.sprites[i].position.y + "px");
			}
		}
	},


	////////////////////////////////////////////////////////////////////////////////////////
	/////
	/////	***** Templates, Sonstiges *****
	/////
	////////////////////////////////////////////////////////////////////////////////////////

        /* /////////////////////////////////////////////////////////////////////////
         * @Func:   Sprite_Template (id, src, gameObjId)
         * @Author: Skarge
         * @Date:   2010/09/01
         * @Mod.:   2010/10/07
         * @Desc:   Template zur Erstellung neuer Sprite-Objekte
         */
        Sprite_Template: function(id, src, gameObjId) {

            this.id =           id;
            this.image =        "<div id='" + id + "' style='position:absolute; display:block; overflow:hidden; height:" + gameObjId.height + "px; width:" + gameObjId.width + "px; left:" + gameObjId.position.x + "px; top:" + gameObjId.position.y + "px; z-index:" + ss2d.Graphics.sprites.length + "; background-image:url(" + src + "); background-position: 0px 0px; background-repeat:no-repeat;' />";
			this.image_src = 	src;
            this.gameObjId =    gameObjId;
			
            this.layer   =      1;
            this.alpha   =      "1.0";
            this.angle   =      0;
			
			this.position  = {
				x: gameObjId.position.x,
				y: gameObjId.position.y
			}

            this.aniKey    =     -1;
            this.aniCStep  =     0;
            this.aniSteps  =     0;
            this.aniTick   =     0;
            this.aniWait   =     0;
            this.aniWidth  =     0;
            this.aniHeigth =     0;


            /* /////////////////////////////////////////////////////////////////////////
             * @Func:   PlayAnimation (name)
             * @Date:   2010/10/06
             * @Desc:   Hinterlegte Animation auf Sprite legen
             */
            this.AnimationPlay = function (name) {

                for (var i = ss2d.Graphics.animations.length; i--;) {
                    if (ss2d.Graphics.animations[i].id == name) {
                        this.aniKey = i;
                        this.aniSteps = ss2d.Graphics.animations[i].steps - 1;
                        this.aniCStep = 0;
                        this.aniTick  = 0;
                        this.aniWait  = (ss2d.Graphics.animations[i].duration / this.aniSteps);
                        this.aniDuration  = ss2d.Graphics.animations[i].duration;

                        var found = false;

                        for (var j = ss2d.Graphics.aniSprites.length; j--;) {
                            if (ss2d.Graphics.aniSprites[j].spriteId == this.id) {
                                var found = true;
                            }
                        }

                        if (found == false)
                            ss2d.Graphics.aniSprites.push({ spriteId: this.id, objId: this });
                    }
                }
            }

            /* /////////////////////////////////////////////////////////////////////////
             * @Func:   StopAnimation ()
             * @Date:   2010/10/06
			 * @Mod:	2010/10/15
             * @Desc:   Bisherige Animation anhalten
             */
            this.AnimationStop = function () {

                if (this.aniKey >= 0) {
                    this.aniKey    =     -1;
            		this.aniCStep  =     0;
            		this.aniSteps  =     0;
            		this.aniTick   =     0;
            		this.aniWait   =     50;
            		this.aniWidth  =     0;
            		this.aniHeigth =     0;
					
					for (var i = ss2d.Graphics.aniSprites.length; i--;) {
						if (ss2d.Graphics.aniSprites[i].spriteId == this.id) {
							ss2d.Graphics.aniSprites.splice(i,1);
						}
					}
                }
            }
            

            /* /////////////////////////////////////////////////////////////////////////
             * @Func:   AlertAnimation ()
             * @Date:   2010/10/06
             * @Desc:   Ausgabe der Animationsvariablen im Sprite
             */
            this.AnimationAlert = function () {

                alert ("AlertAnimation() : \naniKey: " + this.aniKey + "\naniSteps: " + this.aniSteps + "\naniTick: " + this.aniTick +
                       "\naniWait: " + this.aniWait + "\naniWidth: " + this.aniWidth + "\naniHeight: " + this.aniHeigth);
            }

            /* /////////////////////////////////////////////////////////////////////////
             * @Func:   Remove ()
             * @Date:   2010/10/06
             * @Desc:   Sprite-Objekt loeschen
             */
            this.Remove = function () {
                this.gameObjId.spriteId = null;
                return ss2d.Graphics.SpriteRemove(this.id);
            }

            return this;
        }
    }
}