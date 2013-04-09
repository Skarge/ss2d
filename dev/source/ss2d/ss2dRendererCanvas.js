/* ///////////////////////////////////////////////////////////////////
 * //// 2D-Gamelib "screenSports2D" HTML5 Canvas-Renderer         ////
 * //// ********************************************************* ////
 * //// @Project:   screenSports2D                                ////
 * //// @Author:    Dennis "Skarge" Müller                        ////
 * //// @Version:   217                                           ////
 * //// @Copyright: screenSports.de                               ////
 * //// @Link:      http://www.screensports.de                    ////
 * //// ********************************************************* ////
 * //// @Release:   2012/07/07                                    ////
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

    this.Graphics = {

        _graphMain:     this,

		width:			1000,
		height:			360,

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
            active:     false,
			updated:	false
        },

        sprites:        [],                     // Liste aller Sprites
        aniSprites:     [],
		drawings:		[],						// Liste aller gewuenschten Zeichnungen
        animations:     [],                     // Liste aller Animationen
		
		drawCage:		null,					// Referenz auf das stage-DIV
		canvasList:		[],						// Enthaelt alle Canvas-IDs
		canvasCtx: 		[],						// Array mit Canvas-Context zum Zeichnen (0 = BG, 100 = Text)

		////////////////////////////////////////////////////////////////////////////////////////
		/////
		/////	***** Initialisierung des Plugins *****
		/////
		////////////////////////////////////////////////////////////////////////////////////////
		
		/* /////////////////////////////////////////////////////////////////////////
         * @Func:   Init ()
         * @Author: Skarge
         * @Date:   -
         * @Mod.:   2011/01/07
         * @Desc:   Initialisierung des Canvas-Plugins
         */
		Init: function() {
			
            this.drawCage = document.getElementById("stage");
			this.drawCage.style.width = this.width + "px";
            this.drawCage.style.height = this.height + "px";
            this.drawCage.style.position = "relative";
            this.drawCage.style.overflow = "hidden";

            var objCvBg = document.createElement("canvas");
            objCvBg.setAttribute("id", "SS2D_CANVAS_BG");
            objCvBg.setAttribute("height", this.height);
            objCvBg.setAttribute("width", this.width);
			objCvBg.style.backgroundColor = "transparent";
			objCvBg.style.position = "absolute";
			objCvBg.style.left = "0px";
			objCvBg.style.top = "0px";
            this.drawCage.appendChild(objCvBg);

            var objCv = document.createElement("canvas");
            objCv.setAttribute("id", "SS2D_CANVAS");
            objCv.setAttribute("height", this.height);
            objCv.setAttribute("width", this.width);
			objCv.style.backgroundColor = "transparent";
			objCv.style.position = "absolute";
			objCv.style.left = "0px";
			objCv.style.top = "0px";
			this.drawCage.appendChild(objCv);

            var objCvFont = document.createElement("canvas");
            objCvFont.setAttribute("id", "SS2D_CANVAS_FONT");
            objCvFont.setAttribute("height", this.height);
            objCvFont.setAttribute("width", this.width);
			objCvFont.style.backgroundColor = "transparent";
			objCvFont.style.position = "absolute";
			objCvFont.style.left = "0px";
			objCvFont.style.top = "0px";
			this.drawCage.appendChild(objCvFont);

            //// Erzeugung des Elements fuer die spaetere Anzeige und Einbindung in die Stage
            if (typeof $.browser != "undefined" && $.browser.msie) {
                G_vmlCanvasManager.initElement(objCvBg);
                G_vmlCanvasManager.initElement(objCv);
                G_vmlCanvasManager.initElement(objCvFont);
            }
			
            this.canvasCtx[0] 	= objCvBg.getContext("2d");
			this.canvasCtx[0].fillStyle = "#fff";
            this.canvasCtx[1]   = objCv.getContext("2d");
            this.canvasCtx[100] = objCvFont.getContext("2d");
			
			this.canvasList.push("SS2D_CANVAS_BG");
			this.canvasList.push("SS2D_CANVAS");
			this.canvasList.push("SS2D_CANVAS_FONT");
		},
		
		
		/* /////////////////////////////////////////////////////////////////////////
         * @Func:   SetScreen ()
         * @Author: Skarge
         * @Date:   2010/12/01
         * @Mod.:   2011/01/07
         * @Desc:   Aendern der Groesse der Darstellungsflaeche
         */
        SetScreen: function (width, height) {

            try {
                if (typeof width == "undefined" || width <= 0)
                    throw "SS2D_GRAPHICS_SET_SIZE: Keine Breite definiert.";

                if (typeof height == "undefined" || height <= 0)
                    throw "SS2D_GRAPHICS_SET_SIZE: Keine Hoehe definiert.";

                this.width  = width;
                this.height = height;

				this.drawCage.style.width = width + "px";
            	this.drawCage.style.height = height + "px";
				
				//// Auf alle angelegten Canvas-Ebenen anwenden
				for (var i = this.canvasList.length; i--; ) {
					$("#" + this.canvasList[i]).attr("width", width);
					$("#" + this.canvasList[i]).attr("height", height);
				}
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


        SpriteSetAdd: function (spriteId, src, gameObjId) {

            try {
                if (typeof spriteId == "undefined" || spriteId == "")
                    throw "SS2D_GRAPHICS_SPRITE_SET_ADD: Keine ID angegeben.";

                if (typeof src == "undefined" || src == "")
                    throw "SS2D_GRAPHICS_SPRITE_SET_ADD: Keine Bildquelle angegeben.";

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
				this.panorama.updated 	= true;

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
				this.panorama.updated = true;
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
					
					this.panorama.updated = true;
                }
            }
        },

        RemovePanorama: function () {

            if (this.panorama.image != null && this.panorama.active == true) {
				this.panorama.updated = false;
				this.panorama.active  = false;
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
		/////	***** diverse Zeichenfunktionen *****
		/////
		////////////////////////////////////////////////////////////////////////////////////////
	
		Draw: {
            Clear: function () {
                ss2d.Graphics.drawings = null;
                ss2d.Graphics.drawings = [];
            },

            Dot: function (x, y, color) {
                ss2d.Graphics.drawings.push({
                    type:   "dot",
                    x:      parseInt(x),
                    y:      parseInt(y),
                    color:  color
                });
            },

            Rect: function (x, y, width, height, color) {
                ss2d.Graphics.drawings.push({
                    type:	"rect",
                    x:		parseInt(x),
                    y:		parseInt(y),
                    width:	parseInt(width),
                    height:	parseInt(height),
                    color:	color
                });
            }
		},
	
	
		////////////////////////////////////////////////////////////////////////////////////////
		/////
		/////	***** Leeren des Bildschirms, Zeichnung der Szene *****
		/////
		////////////////////////////////////////////////////////////////////////////////////////
	
		/* /////////////////////////////////////////////////////////////////////////
         * @Func:   ClearScene (ctxLayer)
         * @Author: Skarge
         * @Date:   2010/10/30
         * @Mod.:   2011/01/07
         * @Desc:   Leeren der angegebenen Darstellungsflaeche
		 */
		ClearScene: function (ctxLayer) {
	
			try {
				if (ctxLayer >= 0)
					this.canvasCtx[ctxLayer].clearRect(0, 0, this.width, this.height);
				else
					throw "Kein Layer angegeben.";
			}
			catch (e) {
                eHandler.throwWarning(e);
                return false;
			}
		},
		
		
		/* /////////////////////////////////////////////////////////////////////////
         * @Func:   DrawScene ()
         * @Author: Skarge
         * @Date:   2010/09/01
         * @Mod.:   2011/01/08
         * @Desc:   Zeichnen der Szenerie
		 */
		DrawScene: function () {
            
            try {
				//// Layer mit Figuren leeren
				this.ClearScene(1);
				this.ClearScene(100);
				
				//// Panorama zeichnen bei Aktualisierung
				if (this.panorama.active == true) {
					if (this.panorama.updated === true) {
						this.ClearScene(0);
						if ((this.panorama.x + this.panorama.width) < this.width) {
							var multiply = Math.round(this.width / (this.panorama.width - this.panorama.x)) + 1;
							for (var i = 1; i <= multiply; i++) {
								this.canvasCtx[0].drawImage (this.panorama.image, (this.panorama.x + (i * this.panorama.width)), this.panorama.y, this.panorama.width, this.panorama.height);
							}
						}
	
						if (this.panorama.x > 0) {
							var multiply = Math.round(this.width / this.panorama.width) + 1;
							if (multiply <= 1)
								multiply = 2;
	
							for (var i = 1; i <= multiply; i++) {
								this.canvasCtx[0].drawImage (this.panorama.image, (this.panorama.x - (i * this.panorama.width)), this.panorama.y, this.panorama.width, this.panorama.height);
							}
						}
						this.canvasCtx[0].drawImage (this.panorama.image, this.panorama.x, this.panorama.y, this.panorama.width, this.panorama.height);
						this.panorama.updated = false;
					}
				} 
				
				
				//// Zeichnen der Tiles (EXPERIMENTAL!!!)
				if (typeof ss2d.Map != "undefined" && ss2d.Map.useTiles == true) {

					for (var y = 0; y < ss2d.Map.mapData.header.height; y++) {
						for (var x = 0; x < ss2d.Map.mapData.header.width; x++) {

							for (var l = 0; l < ss2d.Map.mapData.header.layers; l++) {
								if (typeof ss2d.Map.mapData.data[l][y][x] != "undefined" && ss2d.Map.mapData.data[l][y][x].resId != "" && ss2d.Map.mapData.data[l][y][x].resId > 0)
									if (typeof ss2d.Map.resData[ss2d.Map.mapData.data[l][y][x].resId].tileId != "undefined") {
										var resData = ss2d.Map.resData[ss2d.Map.mapData.data[l][y][x].resId];
										this.canvasCtx[0].drawImage(ss2d.Map.tileData[resData.tileId].tileset, resData.x, resData.y, resData.size, resData.size, x * ss2d.Map.tileSize, y * ss2d.Map.tileSize, ss2d.Map.tileSize, ss2d.Map.tileSize);
									}
									else {
										this.canvasCtx[0].drawImage(ss2d.Map.resData[ss2d.Map.mapData.data[y][x][l].resId], x * ss2d.Map.tileSize, y * ss2d.Map.tileSize, ss2d.Map.tileSize, ss2d.Map.tileSize);
									}
							}
						}
					}
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
									this.canvasCtx[1].globalAlpha = sprite.alpha;

								//// Animation aktiv?
								if (sprite.aniKey >= 0) {
									var animation = this.animations[sprite.aniKey];
									this.canvasCtx[1].drawImage(animation.image, (sprite.aniCStep * sprite.gameObjId.width), 0, sprite.gameObjId.width, sprite.gameObjId.height, (sprite.gameObjId.position.x - this.viewport.x), (sprite.gameObjId.position.y - this.viewport.y), sprite.gameObjId.width, sprite.gameObjId.height);
								}
								else
									this.canvasCtx[1].drawImage(sprite.image, (sprite.gameObjId.position.x - this.viewport.x), (sprite.gameObjId.position.y - this.viewport.y), sprite.gameObjId.width, sprite.gameObjId.height);

								this.canvasCtx[1].globalAlpha = "1.0";
							}
						}
						
						/*
						//// !!!!!! DEV !!!!!!! MultipleBB Visualisierung
						if (sprite.gameObjId.boundingBoxes.length > 0) {
							var boxes 		= sprite.gameObjId.boundingBoxes;
							var spritePos 	= sprite.gameObjId.position;
							this.canvasCtx[100].strokeStyle = "#ff0000";
							for (var j = boxes.length; j--; ) {
								this.canvasCtx[100].strokeRect((boxes[j].x + spritePos.x), (boxes[j].y + spritePos.y), boxes[j].width, boxes[j].height);
							}
						}
						*/
					}
				}
					
				//// Text auf obersten Layer zeichnen
				/*
				if (ss2d.Font.updateDraw == true) {
					this.ClearScene(100);
					if (ss2d.Font.activeTxt >= 0 && ss2d.Font.txtData[ss2d.Font.activeTxt] != "") {
						this.canvasCtx[100].font = "12pt sans serif";
						this.canvasCtx[100].fillStyle = "#000";
						this.canvasCtx[100].fillText(ss2d.Font.txtData[ss2d.Font.activeTxt], ss2d.Font.txtPos.x, ss2d.Font.txtPos.y);
					}
					ss2d.Font.updateDraw = false;
				}*/
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
			
			this.isSpriteSet	= false;
			this.spriteSub		= 1;
			
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