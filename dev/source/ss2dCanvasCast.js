/* ///////////////////////////////////////////////////////////////////
 * //// 2D-Gamelib "screenSports2D" HTML5 Canvas-Renderer         ////
 * //// ********************************************************* ////
 * //// @Project:   screenSports2D                                ////
 * //// @Author:    Dennis "Skarge" Müller                        ////
 * //// @Version:   210                                           ////
 * //// @Copyright: screenSports.de                               ////
 * //// @Link:      http://www.screensports.de                    ////
 * //// ********************************************************* ////
 * //// @Release:   2010/10/17                                    ////
 * //// ********************************************************* ////
 * //// @Summary:                                                 ////
 * //// HTML5 Canvas-Rendering                                    ////
 * //// ********************************************************* ////
 * //// @Description:                                             ////
 * //// Zeichnet die Spielszene mit Hilfe des Canvas-Elements von ////
 * //// HTML5.                                                    ////
 * ////                                                           ////
 * //// Die Nutzung dieser Software unterliegt den Rahmen-        ////
 * //// bedingungen der Lizenz. Weitere Informationen unter       ////
 * //// http://zero.screensports.de/lizenz.txt                    ////
 * ///////////////////////////////////////////////////////////////////
 */

function cRendererPlugin ()  {

    this.ss2dGraphics = {

        _graphMain:     this,

	width:		1000,
	height:		360,

        viewport:      {
            x:          0,
            y:          0
        },

        panorama:      {
            image:      null,
            width:      0,
            height:     0,
            x:          0,
            y:          0,
            speedX:     0,
            speedY:     0,
            active:     false
        },

        sprites:        [],                                     // Liste aller Sprites
        aniSprites:     [],
	drawings:	[],					// Liste aller gewuenschten Zeichnungen
        animations:     [],                                     // Liste aller Animationen
	objCanvas: 	null,					// Canvas-Objekt zum zeichnen
	////////////////////////////////////////////////////////////////////////////////////////
	/////
	/////	***** Initialisierung des Plugins *****
	/////
	////////////////////////////////////////////////////////////////////////////////////////
        
	Init: function() {

            objCanvas = document.createElement("canvas");
            objCanvas.setAttribute("id", "SS2D_CANVAS_TEST");

            document.getElementById("stage").appendChild(objCanvas);

            if (document.getElementById("SS2D_CANVAS_TEST").getContext)
                    var drawType = "canvas";
            else if ((!document.getElementById("SS2D_CANVAS_TEST").getContext) && (typeof G_vmlCanvasManager != "undefined") && /MSIE/.test(navigator.userAgent) && !window.opera) {
            objCanvas = G_vmlCanvasManager.initElement(objCanvas);
                    if (document.getElementById("SS2D_CANVAS_TEST").getContext)
                            var drawType = "canvas";
            }

            document.getElementById("stage").innerHTML = "";
            objCanvas = null;

            //// Erzeugung des Elements fuer die spaetere Anzeige und Einbindung in die Stage
            if (/MSIE/.test(navigator.userAgent) && !window.opera && (typeof G_vmlCanvasManager != "undefined")) {
                objCanvas = G_vmlCanvasManager.initElement(screen);
            }

            document.getElementById("stage").style.width = this.width + "px";
            document.getElementById("stage").style.height = this.height + "px";

            ss2dScreen = document.createElement("div");
            ss2dScreen.setAttribute("id", "SS2D_SCREEN");
            ss2dScreen.setAttribute("style", "position:absolute; overflow:hidden;");

            document.getElementById("stage").appendChild(ss2dScreen);

            document.getElementById("SS2D_SCREEN").style.width = this.width + "px";
            document.getElementById("SS2D_SCREEN").style.height = this.height + "px";

            ss2dCanvas = document.createElement("canvas");
            ss2dCanvas.setAttribute("style", "position:absolute; overflow:hidden;");
            ss2dCanvas.setAttribute("height", this.height);
            ss2dCanvas.setAttribute("width", this.width);
            ss2dCanvas.setAttribute("id", "SS2D_CANVAS");

            document.getElementById("SS2D_SCREEN").appendChild(ss2dCanvas);
            this.objCanvas = document.getElementById("SS2D_CANVAS").getContext("2d");
            this.Clear();
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


        SetPanorama: function (src, width, height, x, y) {

            try {
                if (typeof src == "undefined" || src == "")
                    throw "SS2D_GRAPHICS_SET_PANORAMA: Keine Bildquelle angegeben.";

                this.panorama.image     = new Image();
                this.panorama.image.src = src;
                this.panorama.active    = true;

                if (typeof width != "undefined" && width >= 0)
                    this.panorama.width = width;

                if (typeof height != "undefined" && height >= 0)
                    this.panorama.height = height;

                if (typeof x != "undefined" && x >= 0)
                    this.panorama.x = x;

                if (typeof y != "undefined" && y >= 0)
                    this.panorama.y = y;
            }
            catch (e) {
                eHandler.throwWarning(e);
                return false;
            }
        },


        MovePanorama: function (speedX, speedY) {

            try {
                if (typeof speedX == "undefined" && typeof speedY == "undefined")
                    throw "SS2D_GRAPHICS_MOVE_PANORAMA: Keine Parameter angegeben.";

                if (this.panorama.image == null || this.panorama.image.src == "")
                    throw "SS2D_GRAPHICS_MOVE_PANORAMA: Kein Panorama gesetzt. MOVE nicht moeglich.";

                this.panorama.speedX = speedX;
                this.panorama.speedY = speedY;
            }
            catch (e) {
                eHandler.throwWarning(e);
                return false;
            }
        },


        UpdatePanorama: function () {

            if (this.panorama.image != null && this.panorama.image.src != "") {
                if (this.panorama.speedX != 0) {
                    if (this.panorama.speedX < 0) {
                        if ((this.panorama.x + this.panorama.width) > 0)
                            this.panorama.x += this.panorama.speedX;
                        else {
                            var multiply = Math.round(this.width / (this.panorama.width - this.panorama.x)) + 1;
                            this.panorama.x = (multiply * this.panorama.width);
                        }
                    }
                    else {
                        if (this.panorama.x < (this.width + (this.width - this.panorama.width)))
                            this.panorama.x += this.panorama.speedX;
                        else {
                            this.panorama.x = 0 - (this.panorama.width + (this.width - this.panorama.width));
                        }
                    }
                }
            }
        },

        RemovePanorama: function () {

            if (this.panorama.image != null && this.panorama.active == true) {
                
            }
        },


	////////////////////////////////////////////////////////////////////////////////////////
	/////
	/////	***** Animationen *****
	/////
	////////////////////////////////////////////////////////////////////////////////////////

        Animation: {

            Update: function () {

                for (var i = ss2d.ss2dGraphics.aniSprites.length; i--;) {
                    if (ss2d.ss2dGraphics.aniSprites[i].objId.aniTick >= ss2d.ss2dGraphics.aniSprites[i].objId.aniWait) {

                        if (ss2d.ss2dGraphics.aniSprites[i].objId.aniCStep < ss2d.ss2dGraphics.aniSprites[i].objId.aniSteps)
                            ss2d.ss2dGraphics.aniSprites[i].objId.aniCStep++;
                        else
                            ss2d.ss2dGraphics.aniSprites[i].objId.aniCStep = 0;

                        ss2d.ss2dGraphics.aniSprites[i].objId.aniTick = 0;
                        ss2d.ss2dGraphics.aniSprites[i].objId.aniWait  = (ss2d.ss2dGraphics.aniSprites[i].objId.aniDuration / ss2d.ss2dGraphics.aniSprites[i].objId.aniSteps);
                    }
                    else
                        ss2d.ss2dGraphics.aniSprites[i].objId.aniTick++;
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

                ss2d.ss2dGraphics.animations.push(newAnimation);
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

            Stop: function () {
                gameObjId.spriteId.AnimationStop();
            }
        },


	////////////////////////////////////////////////////////////////////////////////////////
	/////
	/////	***** Leeren des Bildschirms, Zeichnung der Szene *****
	/////
	////////////////////////////////////////////////////////////////////////////////////////

	//// Bildschirmanzeige leeren
	Clear: function () {
		this.objCanvas.clearRect(0, 0, this.width, this.height);
	},

	//// Alles zeichnen
	DrawScene: function () {

            this.Clear();
            
            try {
                    //// Panorama zeichnen
                    if (this.panorama.active == true) {

                        if ((this.panorama.x + this.panorama.width) < this.width) {
                            var multiply = Math.round(this.width / (this.panorama.width - this.panorama.x)) + 1;
                            for (var i = 1; i <= multiply; i++) {
                                this.objCanvas.drawImage (this.panorama.image, (this.panorama.x + (i * this.panorama.width)), this.panorama.y, this.panorama.width, this.panorama.height);
                            }
                        }

                        if (this.panorama.x > 0) {
                            var multiply = Math.round(this.width / this.panorama.width) + 1;
                            if (multiply <= 1)
                                multiply = 2;

                            for (var i = 1; i <= multiply; i++) {
                                this.objCanvas.drawImage (this.panorama.image, (this.panorama.x - (i * this.panorama.width)), this.panorama.y, this.panorama.width, this.panorama.height);
                            }
                        }

                        this.objCanvas.drawImage (this.panorama.image, this.panorama.x, this.panorama.y, this.panorama.width, this.panorama.height);
                    }

                    //// Zeichnen der Sprites
                    if (this.sprites.length > 0) {
                        for (var i = 0, length = this.sprites.length; i < length; i++) {
                            var sprite = this.sprites[i];
                            if (sprite.gameObjId != "" && sprite.alpha > 0) {
                                //// Sprite sichtbar oder ausserhalb der Anzeige?
                                if (((sprite.gameObjId.position.x + sprite.gameObjId.width) - this.viewport.x) > 0 && ((sprite.gameObjId.position.y + sprite.gameObjId.height) - this.viewport.y) > 0
                                    && (sprite.gameObjId.position.x - this.viewport.x) < this.width && (sprite.gameObjId.position.y - this.viewport.y) < this.height) {

                                    //// Transparenz im Sprite?
                                    if (sprite.alpha < 1)
                                        this.objCanvas.globalAlpha = sprite.alpha;

                                    //// Animation aktiv?
                                    if (sprite.aniKey >= 0) {
                                        var animation = this.animations[sprite.aniKey];
                                        this.objCanvas.drawImage(animation.image, (sprite.aniCStep * sprite.gameObjId.width), 0, sprite.gameObjId.width, sprite.gameObjId.height, (sprite.gameObjId.position.x - this.viewport.x), (sprite.gameObjId.position.y - this.viewport.y), sprite.gameObjId.width, sprite.gameObjId.height);
                                    }
                                    else
                                        this.objCanvas.drawImage(sprite.image, (sprite.gameObjId.position.x - this.viewport.x), (sprite.gameObjId.position.y - this.viewport.y), sprite.gameObjId.width, sprite.gameObjId.height);

                                    this.objCanvas.globalAlpha = "1.0";
                                }
                            }
                            else {

                            }
                        }
                    }

                    if (this.drawings.length > 0) {
                        for (var i = 0, length = this.drawings.length; i < length; i++) {
                            var draw = this.drawings[i];

                            this.objCanvas.fillStyle = draw.color;
                            this.objCanvas.fillRect(draw.x, draw.y, draw.width, draw.height);
                            this.objCanvas.fillStyle = "#fff";
                        }
                    }
            }
            catch (e) {
                
            }
	},


        UpdateDraw: function () {

            this.Animation.Update();
            this.UpdatePanorama();
            this.DrawScene();
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
            this.image =        new Image();
            this.image.src =    src;
            this.gameObjId =    gameObjId;

            this.width    =     0;
            this.height   =     0;
            this.position =     {
                "x":    0,
                "y":    0
            };
            this.layer   =      1;
            this.alpha   =      "1.0";
            this.angle   =      0;

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

                for (var i = ss2d.ss2dGraphics.animations.length; i--;) {
                    if (ss2d.ss2dGraphics.animations[i].id == name) {
                        this.aniKey = i;
                        this.aniSteps = ss2d.ss2dGraphics.animations[i].steps - 1;
                        this.aniCStep = 0;
                        this.aniTick  = 0;
                        this.aniWait  = (ss2d.ss2dGraphics.animations[i].duration / this.aniSteps);
                        this.aniDuration  = ss2d.ss2dGraphics.animations[i].duration;

                        var found = false;

                        for (var j = ss2d.ss2dGraphics.aniSprites.length; j--;) {
                            if (ss2d.ss2dGraphics.aniSprites[j].spriteId == this.id) {
                                var found = true;
                            }
                        }

                        if (found == false)
                            ss2d.ss2dGraphics.aniSprites.push({ spriteId: this.id, objId: this });
                    }
                }
            }

            /* /////////////////////////////////////////////////////////////////////////
             * @Func:   StopAnimation ()
             * @Date:   2010/10/06
             * @Desc:   Bisherige Animation anhalten
             */
            this.AnimationStop = function () {

                if (this.aniKey != null) {
                    this.aniKey   = -1;
                    this.aniSteps = 0;
                    this.aniCStep = 0;
                    this.aniTick  = 0;
                    this.aniWait  = 0;
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
                return ss2d.ss2dGraphics.SpriteRemove(this.id);
            }

            return this;
        }
    }
}