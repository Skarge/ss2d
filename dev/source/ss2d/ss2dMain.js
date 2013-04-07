/* ///////////////////////////////////////////////////////////////////
 * //// 2D-Gamelib "screenSports2D" Hauptklasse                   ////
 * //// ********************************************************* ////
 * //// @Project:   screenSports2D                                ////
 * //// @Version:   0.6                                           ////
 * //// @Copyright: screenSports.de                               ////
 * //// @Link:      http://www.screensports.de                    ////
 * //// ********************************************************* ////
 * //// @Release:   2012/07/07                                    ////
 * //// ********************************************************* ////
 * //// @Summary:                                                 ////
 * //// 2D-Gameengine "screenSports2D"                            ////
 * //// ********************************************************* ////
 * //// @Description:                                             ////
 * //// 2D-Engine in Javascript zur Erstellung von Spielen.       ////
 * ////                                                           ////
 * //// Die Nutzung dieser Software unterliegt den Rahmen-        ////
 * //// bedingungen der Lizenz. Weitere Informationen unter       ////
 * //// http://zero.screensports.de/lizenz.txt                    ////
 * ///////////////////////////////////////////////////////////////////
 */

var ss2d = function () {
    ////////////////////////////////////////////////////////////////////////////////////////
    /////
    /////	***** Eigenschaften von ss2d (quasi alles private) *****
    /////
    ////////////////////////////////////////////////////////////////////////////////////////

    //// Infos zum System
    var system = {
        name:				"screenSports2D",
        prefix:				"SS2D",
        desc:				"2D-Gameengine with HTML5 & Javascript",
        version:			"0.6",
        build:              "20120707.560",
        release:			"2012/07/07"
    };

    var  _main             = this;

    var ticks              = 0;         	// Anzahl bisheriger Ticks
    var ticksPerSecond     = 25;        	// Ticks (Aktualisierungen) pro Sekunde (1000 / ticksPerSecond)
    var allowFrameskip     = true;      	// Frameskip erlauben, kann die Geschwindigkeit stabil halten
    var maxFrameskip       = 20;			// Maximale Anzahl erlaubter Skips (25 wegen 3D-Test)
    var droppedFrames      = 0;         	// Anzahl der verworfenen Frames
    var nextTick           = 50;			// Wert zur Vorbeugung, wird im Init() gesetzt
    var nextReal           = 0;
	var drawUpdateDiv	   = 1;				// Gibt an nach wie vielen Ticks die Stage neu gezeichnet wird (25TPS=1, 50TPS=2...)

    var debug              = true;      	// Aktiviert Debug-Ausgabe
    var bench              = true;     	// Loggt diverse Zeiten mit

    var updateTime         = 0;         	// Dauer der Spiel-Aktualisierungen
    var frameTime          = 0;         	// Dauer der Berechnung eines Frames
    var loopTime           = 0;         	// Dauer der Gesamtaktualisierung
    var startTime          = 0;         	// Startzeitpunkt der Ausfuehrung
    var endTime            = 0;         	// Endzeitpunkt der Ausfuehrung

    var gameState          = "init";    	// Status der Engine
	var collisionDetect	   = "bounding";	// Art der Kollisionserkennung (bounding, multiplebb)
	
	var maxLoadRetries     = 20;			// Maximale Anzahl an Ladeversuchen (verhindert Dauerschleife)
	var loadCount		   = [];			// Array mit Ladeversuchen der einzelnen Anfragen
    var loadedScripts      = [];        	// Liste geladener Skripts
    var scriptLoadComplete = true;      	// Status des aktuell zu ladenden Skripts

    var callbackCount      = 0;         	// Gesamtzahl aller Callbacks
    var callbacks          = [];        	// Callback-Storage

    var gameObjects        = [];        	// Liste aller Spielobjekte


    // -------------------------------------------------------------------------
    // Abschnitt: Initialisierung, Starten, Stoppen, Pausieren
    // -------------------------------------------------------------------------

    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   Init ()
     * @Author: Skarge
     * @Date:   2010/10/30
     * @Mod.:   2010/12/26
     * @Desc:   Initialisierung der Engine
     */
    this.Init = function (autostart) {
		if (gameState == "init") {
			if (debug === true)
				eHandler.logText("SS2D::INIT: Initialisiere Engine...");
			
        	startTime 	= new Date().getTime();
        	nextTick	= Math.round(1000 / ticksPerSecond);
	
        	if (autostart === true)
        	    _main.Run();
		}
		else if (gameState == "loading") {
			if (this.CheckFreeLoadRetries("Init")) {
				if (debug === true)
					eHandler.logText("SS2D::INIT: Loading in Progress, delaying Init() 300ms...");
				
				setTimeout("ss2d.Init(" + autostart + ")", 300);
			}
			else {
				eHandler.logText("SS2D::INIT: Maximale Anzahl an Ladeversuchen erreicht, breche ab...");
				this.Shutdown();
			}
		}
    }


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   Run ()
     * @Author: Skarge
     * @Date:   2010/10/30
     * @Mod.:   2010/12/26
     * @Desc:   Main-Loop starten und Funktion ausfuehren
     */
    this.Run = function (loadFn) {
		try {
			if (gameState == "init") {
				if (debug === true)
					eHandler.logText("SS2D::RUN: Starte Ausfuehrung...");
		        
				gameState = "running";
    		    MainLoop();
				if (loadFn && loadFn != "") {
					window[loadFn]();
				}
			}
			else {
				if (gameState == "loading") {
					if (this.CheckFreeLoadRetries("Init")) {
						if (debug === true)
							eHandler.logText("SS2D::RUN: Loading in Progress, delaying Run() 500ms...");
					
						setTimeout(function () {
							_main.Run(loadFn);
						}, 500);
					}
					else {
						eHandler.logText("SS2D::RUN: Maximale Anzahl an Ladeversuchen erreicht, breche ab...");
						this.Shutdown();
					}
				}
			}
		}
		catch (e) {
		}
    }

    //// Main-Loop anhalten
    this.Stop = function () {
        gameState	= "stopped";
    }

    //// Engine herunterfahren
    this.Shutdown = function () {
        endTime		= new Date().getTime();
        gameState	= "shutdown";
		alert ("Ausfuehrung abgebrochen!");
    }


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   GetStatus ()
     * @Author: Skarge
     * @Date:   2010/12/25
     * @Mod.:   -
     * @Desc:   Aktuellen Status der Engine ausgeben
     */
	this.GetStatus = function () {
		return gameState;
	}


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   GetDebug ()
     * @Author: Skarge
     * @Date:   2010/12/25
     * @Mod.:   -
     * @Desc:   Aktuellen Status des Debuggins ausgeben (an / aus)
     */
	this.GetDebug = function () {
		return debug;
	}


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   CheckFreeLoadRetries ()
     * @Author: Skarge
     * @Date:   2010/12/26
     * @Mod.:   -
     * @Desc:   Prueft die Anzahl der verbleibenden Ladeversuche
     */
	this.CheckFreeLoadRetries = function(fnName) {
		
		for (var i = loadCount.length; i--; ) {
			if (loadCount[i].fnName == fnName) {
				loadCount[i].retries -= 1;
				if (loadCount[i].retries > 0)
					return true;
				else
					return false;
			}
		}
		
		loadCount[loadCount.length] = {
			"fnName"  : fnName,
			"retries" : maxLoadRetries
		}
		
		return true;
	}


    // -------------------------------------------------------------------------
    // Abschnitt: Verwaltung, Management (Laden von Dateien...) 
    // -------------------------------------------------------------------------
	
    //// Standard-Plugins laden (wird nur bei aktiviertem Autostart genutzt)
    var LoadPluginDefaults = function () {

        if (gameState == "init") {

			
        }
    }
			


	/* /////////////////////////////////////////////////////////////////////////
     * @Func:   LoadPlugin (src)
     * @Author: Skarge
     * @Date:   2010/12/23
     * @Mod.:   2010/12/27
     * @Desc:   Nachladen von Plugins und autom. Initialisieren bei vorhandener Init()
     *
	 * @param	string      src                     Pfad zum Skript
	 * @param	string      name	                Name der Klasse
     * @return	bool                                TRUE bei Erfolg
	 */
    this.LoadPlugin = function (src, name) {

		try {
			if (!src || src == "")
				throw "SS2D::LOAD_PLUGIN: Keine Quelldatei angegeben.";
				
			if (!name || name == "")
				throw "SS2D::LOAD_PLUGIN: Es wurde kein Pluginname angegeben.";
			
			//// Engine steht auf init, nichts wird geladen -> Andere Ladevorgaenge sperren und Plugin laden
			if (gameState == "init") {
				eHandler.logText("SS2D::LOAD_PLUGIN: Loading " + name + "...");
				gameState = "loading";
				
				$.ajax({
					async: false,
					type:  "GET",
					url:   src,
					data:  null,
					dataType: "script",
					error: function (msg) {
						alert ("FEHLER!" + name + "\n" + msg);
					},
					success: function (msg) {
						if (debug === true)
							eHandler.logText("SS2D::LOAD_PLUGIN: Done loading " + name + ", extending...");
						
						//// Objekt instanzieren und Init-Funktion suchen
						var objNew = new window[name];
						for (var a in objNew) {
							var initFn = a;
						}
						
						jQuery.extend(window.ss2d, objNew);
						//// Initialisieren bei vorhandener Init()-Funktion
						if (jQuery.isFunction(window.ss2d[initFn].Init))
							window.ss2d[initFn].Init();
						
						eHandler.logText("SS2D::LOAD_PLUGIN: Changing gameState back to init...");
						gameState = "init";	
					}
				});
			}
			//// Verzoegerung sofern bereits etwas geladen wird
			else if (gameState == "loading") {
				if (this.CheckFreeLoadRetries("Init")) {
					if (debug === true)
						eHandler.logText("SS2D::LOAD_PLUGIN: Loading in progress, delaying LoadPlugin() 20ms...");	
							
					setTimeout ("ss2d.LoadPlugin('" + src + "', '" + name + "')", 20);
				}
				else {
					eHandler.logText("SS2D::RUN: Maximale Anzahl an Ladeversuchen erreicht, breche ab...");
					this.Shutdown();
				}
			}
			else
				throw "SS2D::LOAD_PLUGIN: Plugins koennen nur waehrend der Initialisierung geladen werden!";
		}
		catch (e) {
            eHandler.throwWarning(e);
            return false;
		}
    }


	/* /////////////////////////////////////////////////////////////////////////
     * @Func:   LoadScript (src)
     * @Author: Skarge
     * @Date:   2010/10/30
     * @Mod.:   2010/12/23
     * @Desc:   Laden von Javascript-Dateien
     *
	 * @param	string      src                     Pfad zum Skript
     * @return	bool                                TRUE bei Erfolg
	 */
    this.LoadScript = function (src) {

		try {
			if (typeof src == "undefined" || src == "")
				throw "SS2D::LOAD_SCRIPT: Keine Quelldatei angegeben.";
				
			$.getScript(src);
		}
		catch (e) {
            eHandler.throwWarning(e);
            return false;
		}
    }


    // -------------------------------------------------------------------------
    // Abschnitt: Eigenschaften (Abruf, Aenderung...)
    // -------------------------------------------------------------------------

    //// Anzahl aller bisherigen Ticks ausgeben
    // @return		int				this.ticks			Anzahl aller bisherigen Ticks
    this.GetTickCount = function () {
        return ticks;
    }

    //// Aktuelle Ticks/Sek ausgeben
    // @return		int				this.ticksPerSecond		Anzahl der Aktualisierungen pro Sekunde
    this.GetTicksPerSecond = function () {
        return ticksPerSecond;
    }

    //// Ticks/Sek neu setzen
    // @param		int		ticks		neue Anzahl an Aktualisierungen pro Sekunde
    // @return		bool                            TRUE bei Erfolg, sonst FALSE
    this.SetTicksPerSecond = function(ticks) {
        try {
            if (typeof ticks == "undefined")
                throw "SS2D::SET_TICKS_PER_SEC: Kein Wert angegeben";

            if (isNaN(ticks))
                throw "SS2D::SET_TICKS_PER_SEC: Der angegebene Wert ist keine Zahl";

            ticksPerSecond  = Math.round(parseInt(ticks));
            nextTick        = Math.round(1000 / ticksPerSecond);
			drawUpdateDiv	= Math.round(parseInt(ticks) / 25);

            return true;
        }
        catch (e) {
            eHandler.throwWarning(e);
            return false;
        }
    }

    //// Frameskip pruefen
    // @return		bool		this.allowFrameskip		Wert der Erlaubnis (TRUE / FALSE)
    this.GetFrameskip = function () {
        return allowFrameskip;
    }

    //// Frameskip setzen
    // @param			bool			value							Wert der Erlaubnis (TRUE / FALSE)
    // @return		bool											TRUE bei Erfolg, sonst FALSE
    this.SetFrameskip = function (value) {
        try {
            if (typeof value != "bool")
                throw "SS2D::SET_FRAMESKIP_SET: Der angegebene Wert ist nicht vom Typ bool.";

            allowFrameskip = value;
            return true;
        }
        catch (e) {
            eHandler.throwWarning(e);
            return false;
        }
    }

    //// Aktuellen maximalen Frameskip ausgeben
    // @return		int				this.maxFrameskip				Aktueller maximaler Frameskip
    this.GetMaxFrameskip = function () {
        return maxFrameskip;
    }

    //// Maximalen Frameskip setzen
    // @param			int				value							Neuer maximaler Frameskip
    // @return		bool											TRUE bei Erfolg, sonst FALSE
    this.SetMaxFrameskip = function (value) {
        if (typeof ticks == "undefined")
            alert ("Kein Wert angegeben");
        else if (isNaN(ticks))
            alert ("Der angegebene Wert ist keine Zahl");
        else {
            maxFrameskip = Math.round(parseInt(value));
            return true;
        }
        return false;
    }

    //// Anzahl verworfener Frames ausgeben
    // @return		int				this.droppedFrames				Anzahl verworfener Frames
    this.GetDroppedFrames = function () {
        return droppedFrames;
    }

    //// Uptime ausgeben
    // @return		int												Aktuelle Uptime
    this.GetUptime = function () {
        return Math.round((new Date().getTime() - startTime) / 1000);
    }

    //// Aktuelle Frametime
    // @return		int												Aktuelle Frametime
    this.GetFrametime = function () {
        return frameTime;
    }

    //// Naechsten Aktualisierungspunkt ausgeben
    // @return		int												Aktuelle Frametime
    this.GetNextReal = function () {
        if (allowFrameskip == true)
            return nextReal;
        else
            return nextTick;
    }


    // -------------------------------------------------------------------------
    // Abschnitt: Callbacks
    // -------------------------------------------------------------------------

    //// Callback-Objekt
    this.Callback = {

        //// Neuen Callback anlegen
          // @param     int             callbackId                  ID des Callbacks
          // @param     function        fn                          Auszufuehrende Funktion
          // @param     int             rate                        Tick-Rate bis zur naechsten Ausfuehrung
          // @param     int             state                       Status des Callbacks (0 = pause / 1 = run)
          // @return    bool                                        TRUE bei Erfolg, sonst FALSE
        Register: function(callbackId, fn, rate, state, ignoreAlert) {
            
            rate    = (rate != 0 && typeof rate != "undefined") ? Math.round(rate) : 15;
            state   = (state != 0 && typeof state != "undefined" && state >= 0 && state <= 1) ? state : 1;
			ignoreAlert = (typeof ignoreAlert != "undefined") ? ignoreAlert : false;
	
            try {
                if (typeof callbackId == "undefined" || callbackId == "")
                    throw "SS2D::CALLBACK_REGISTER: Keine CallbackID angegeben!";

                if (typeof fn == "undefined" || fn == "")
                    throw "SS2D::CALLBACK_REGISTER: Keine Callback-Funktion hinterlegt.";

                if (callbackCount > 0) {
                    for (var i = callbackCount; i--;) {
                        if (callbacks[i].id == callbackId && ignoreAlert !== true) {
                            throw "SS2D::CALLBACK_REGISTER: ID '" + callbackId + "' bereits als Callback vorhanden!";
                            break;
                        }
                    }
                }

                callbacks.push({
                   id:      callbackId,
                   fn:      fn,
                   waitFor: parseInt(rate),
                   sleep:   parseInt(rate),
                   state:   parseInt(state)
                });

                callbackCount++;

                return true;
            }
            catch (e) {
                eHandler.throwWarning(e);
                return false;
            }
        },
		
		Check: function (callbackId) {
			if (typeof callbackId != "") {
				for (var i = callbackCount; i--;) {
                    if (callbacks[i].id == callbackId) {
                        return true;
                        break;
                    }
                }
				return false;
			}
		},

        Delete: function(callbackId) {
            if (callbackCount > 0) {
                for (var i = callbackCount; i--;) {
                    if (callbacks[i].id == callbackId) {
                        callbacks.splice(i, 1);
                        callbackCount--;
                        return true;
                        break;
                    }
                }
            }
            return false;
        },

        GetCallbackCount: function() {
            return callbackCount;
        },

        SetCallbackState: function(callbackId, state) {

            if (callbackCount > 0) {
                for (var i = callbackCount; i--;) {
                    if (callbacks[i].id == callbackId) {
                        callbacks[i].state = parseInt(state);
                        return true;
                        break;
                    }
                }
            }
            return false;
        },

        GetCallbackState: function(callbackId) {
            if (callbackCount > 0) {
                for (var i = callbackCount; i--;) {
                    if (callbacks[i].id == callbackId) {
                        callbacks[i].rate = parseInt(rate);
                        return true;
                        break;
                    }
                }
            }
            return -1;
        },

        SetCallbackRate: function (callbackId, rate) {
            if (callbackCount > 0) {
                for (var i = callbackCount; i--;) {
                    if (callbacks[i].id == callbackId) {
                        return callbacks[i].state;
                        break;
                    }
                }
            }
        },

        GetCallbackRate: function (callbackId) {
            if (callbackCount > 0) {
                for (var i = callbackCount; i--;) {
                    if (callbacks[i].id == callbackId) {
                        return callbacks[i].rate;
                        break;
                    }
                }
            }
            return -1;
        }
    }


    // -------------------------------------------------------------------------
    // Abschnitt: Kollisionserkennung
    // -------------------------------------------------------------------------
	
	/* /////////////////////////////////////////////////////////////////////////
     * @Func:   GetCollisionDetectType ()
     * @Author: Skarge
     * @Date:   2011/01/09
     * @Mod.:   -
     * @Desc:   Aktuelles Verfahren der Kollisionserkennung ausgeben
     *
     * @return	string		this.collisionDetect   Art der Erkennung
	 */
	this.GetCollisionDetectType = function () {
		return collisionDetect;
	}
	
	
	/* /////////////////////////////////////////////////////////////////////////
     * @Func:   SetCollisionDetectType (type)
     * @Author: Skarge
     * @Date:   2011/01/09
     * @Mod.:   -
     * @Desc:   Einstellung des Verfahrens der Kollisionserkennung
     *
	 * @param	string      type                    Art der Erkennung
     * @return	bool                                TRUE bei Erfolg
	 */
	this.SetCollisionDetectType = function (type) {
		
		try {
			if (typeof type == "undefined")
				throw "SS2D::SET_COLLISION_DETECT: Kein Typ angegeben.";
			
			if (type != "bounding" && type != "multiplebb")
				throw "SS2D::SET_COLLISION_DETECT: Unbekannter Typ angegeben, bounding oder multiplebb verwenden.";
			
			collisionDetect = type;
			return true;
		}
		catch (e) {
            eHandler.throwWarning(e);
            return false;
		}
	}

    
    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   DetectCollision (objA, objB)
     * @Author: Skarge
     * @Date:   2010/10/03
     * @Mod.:   2011/01/15
     * @Desc:   Prueft anhand von this.collisionDetect auf eine Kollision
     */
    this.DetectCollision = function (objA, objB) {
		
		try {
			//// Bekannter Pruefungs-Typ eingestellt?
			if (collisionDetect !== "bounding" && collisionDetect !== "multiplebb")
				throw collisionDetect + " SS2D::DETECT_COLLISION: Kein bekannter Pruefungs-Typ eingestellt.";
			
			var foundOne = false;
	
			objAPos = objA.GetPosition();
			objBPos = objB.GetPosition();
			
			//// Objekte tauschen sollte Objekt B weiter links liegen
			if (objAPos.x > objBPos.x) {
				objAPos = objBPos;
				objBPos = objA.GetPosition();
				
				if (collisionDetect === "multiplebb") {
					var objBNew = objA;
					objA		= objB;
					objB		= objBNew;
					objBNew		= null;
				}
			}
	
			//// Erst der grobe Test mittels Objekt-Eigenschaften
			if ((objAPos.x + objA.width) > objBPos.x) {
	
				//// Vertikaler Treffer, horizontalen Treffer pruefen
				if ((objAPos.y + objA.height) >= objBPos.y)
					foundOne = true;
				if (objAPos.y <= (objBPos.y + objB.height))
					foundOne = true;
				
				//// Bei aktivierten Multiple-Boxes weitere Pruefungen durchfuehren
				if (foundOne === true && collisionDetect === "multiplebb") {
					foundOne = false;
					
					//// Objekt A mit mehreren Boxen, Objekt B lediglich mit der Master-Box
					if (objA.boundingBoxes.length > 0 && objB.boundingBoxes.length <= 0) {
						var boxesA = objA.boundingBoxes;
						
						for (var i = boxesA.length; i--; ) {
							if (((boxesA[i].x + objAPos.x) + boxesA[i].width) > objBPos.x && (boxesA[i].x + objAPos.x) < objBPos.x + boxesA[i].width) {
								if (((boxesA[i].y + objAPos.y) + boxesA[i].height) >= objBPos.y)
									foundOne = true;
								if ((boxesA[i].y + objAPos.Y) <= (objBPos.y + objB.height))
									foundOne = true;
							}
						}
					}
					
					//// Objekt B mit mehreren Boxen, Objekt A lediglich mit der Master-Box
					else if (objA.boundingBoxes.length <= 0 && objB.boundingBoxes.length > 0) {
						var boxesB = objB.boundingBoxes;
						
						for (var i = boxesB.length; i--; ) {
							if ((objAPos.x + objA.width) > (boxesB[i].x + objBPos.x) && objAPos.x < boxesB[i].x + (objA.width + objBPos.x)) {
								if ((objAPos.y + objA.height) >= (boxesB[i].y + objBPos.y))
									foundOne = true;
								if (objAPos.y <= ((boxesB[i].y + objBPos.y) + boxesB[i].height))
									foundOne = true;
							}
						}
					}
					
					//// Beide Objekte mit mehreren Boxen
					else if (objA.boundingBoxes.length > 0 && objB.boundingBoxes.length > 0) {
						var boxesA = objA.boundingBoxes;
						var boxesB = objB.boundingBoxes;
						
						//// Jede Box von A mit jeder Box von B pruefen
						for (var i = boxesA.length; i--; ) {
							for (var j = boxesB.length; j--; ) {
								if ((boxesA[i].x + objAPos.x + boxesA[i].width) > (boxesB[j].x + objBPos.x) && (boxesA[i].x + objAPos.x) < (boxesB[j].x + objBPos.x + boxesB[j].width)) {
									if ((boxesA[i].y + objAPos.y + boxesA[i].height) >= (boxesB[j].y + objBPos.y))
										foundOne = true;
									if ((boxesA[i].y + objAPos.y) <= (boxesB[j].y + objBPos.y + boxesB[j].height))
										foundOne = true;
								}
							}
						}
					}
					
					//// Lediglich Masterboxes, bleiben wir bei true
					else
						foundOne = true;
				}
			}
	
			return foundOne;
		}
		catch (e) {
            eHandler.throwWarning(e);
            return false;
		}
    }


    // -------------------------------------------------------------------------
    // Abschnitt: Sonstige Funktionen
    // -------------------------------------------------------------------------
	
	//// Array/Objekt in JSON-Format umwandeln
	this.EncodeJSON = function (obj) {
	
		var parts = [];		
		var is_list = (Object.prototype.toString.apply(obj) === '[object Array]');

		for (var key in obj) {
			var value = obj[key];
			
			if (typeof value == "object") {
				if (is_list) 
					parts.push(ss2d.EncodeJSON(value));
				else 
					parts[key] = ss2d.EncodeJSON(value);
			} 
			else {
				var str = "";
				if (!is_list) 
					str = '"' + key + '":';

				if (typeof value == "number") 
					str += value;
				else if (value === false) 
					str += 'false';
				else if (value === true) 
					str += 'true';
				else 
					str += '"' + value + '"';

				parts.push(str);
			}
		}
		var json_string = parts.join(",");
		
		if (is_list) 
			return '[' + json_string + ']';
		
		return '{' + json_string + '}';
	}
	
	
	//// Ausgabe der Versionsnummer
	this.Version = function () {
		alert (system.name + " (" + system.prefix + ")\n" + system.desc + "\nv" + system.version + " (Build " + system.version + "." + system.build + ")");
	}
	

    // -------------------------------------------------------------------------
    // Abschnitt: Game-Objects
    // -------------------------------------------------------------------------

    //// Dient als Template zur Erstellung neuer Game-Objects
      // @param         string          id                  ID des neuen Objekts
      // @return                        this                Referenz auf Objekt zum fixeren Aufruf
    var GameObject_Template = function (id) {

        var _objMain    = this;

        this.id         = id;
        this.position   = {
            "x": 1,
            "y": 1
        };
        this.direction  = {
            "x": 0,
            "y": 0
        };
		this.toMove = {
			"x": 0,
			"y": 0
		}
		
        this.width      = 1;
        this.height     = 1;
		this.layer		= 1;

        this.speed      = 1;
        this.rate       = 10;
        
        this.spriteId   = null;
        this.animation  = "";

		this.boundingBoxes	= [];

        this.GetPosition = function () {
            return this.position;
        }

        this.SetPosition = function (x, y) {

            if (typeof x != "undefined") {

                _objMain.position.x = parseInt(x);
                _objMain.position.y = (y != "undefined" ? parseInt(y) : _objMain.position.y)

                return true;
            }
            
            return false;
        }

		//// Object zu einer bestimmten Position bewegen
        this.MoveTo = function (x, y, useSpeed) {
			try {
                if (typeof x == "undefined" && typeof y == "undefined")
                    throw "SS2D::GAMEOBJ_MOVE_TO: Keine Richtung angegeben.";
				
				if (typeof useSpeed != "undefined" && useSpeed === true && _objMain.speed <= 0)
					_objMain.speed = 1;

                //// ZielS setzen
                _objMain.direction.x = x;
                _objMain.direction.y = y;
                
                //// Werte gesetzt, Callback anlegen
                ss2d.Callback.Register("_SS2D_MOVE_TO_" + _objMain.id, function () {
					var newX = _objMain.position.x;
					var newY = _objMain.position.y;
					
					if (_objMain.position.x < _objMain.direction.x)
						newX = ((_objMain.direction.x - _objMain.position.x) < _objMain.speed) ? _objMain.direction.x : _objMain.position.x + _objMain.speed;
					else if (_objMain.position.x > _objMain.direction.x)
						newX = ((_objMain.position.x - _objMain.direction.x) < _objMain.speed) ? _objMain.direction.x : _objMain.position.x - _objMain.speed;
					
					if (_objMain.position.y < _objMain.direction.y)
						newY = ((_objMain.direction.y - _objMain.position.y) < _objMain.speed) ? _objMain.direction.y : _objMain.position.y + _objMain.speed;
					else if (_objMain.position.y > _objMain.direction.y)
						newY = ((_objMain.position.y - _objMain.direction.y) < _objMain.speed) ? _objMain.direction.y : _objMain.position.y - _objMain.speed;
					
                    _objMain.SetPosition(newX, newY);
					
					//// Callback automatisch entfernen sowie das Ziel erreicht ist
					if (_objMain.position.x == _objMain.direction.x && _objMain.position.y == _objMain.direction.y) {
						if (!ss2d.Callback.Delete("_SS2D_MOVE_TO_" + _objMain.id))
                    		throw "SS2D::GAME_OBJECT::GAMEOBJ_STOP: Bewegung von " + _objMain.id + " kann nicht angehalten werden.";
					}
                }, _objMain.rate, 1, true);
			}
			catch (e) {
                eHandler.throwWarning(e);
                return false;
			}
        }


        //// Object ohne festes Ziel bewegen
        this.Move = function (x, y, useSpeed) {
            try {
                if (typeof x == "undefined" && typeof y == "undefined")
                    throw "SS2D::GAMEOBJ_MOVE: Keine Richtung angegeben.";

                //// Richtung setzen
                _objMain.direction.x = (useSpeed === true ? Math.round(x * _objMain.speed) : Math.round(x));
                _objMain.direction.y = (useSpeed === true ? Math.round(y * _objMain.speed) : Math.round(y));
                
                //// Werte gesetzt, Callback anlegen
                ss2d.Callback.Register("_SS2D_MOVE_" + _objMain.id, function () {
                    _objMain.SetPosition(_objMain.position.x + _objMain.direction.x, _objMain.position.y + _objMain.direction.y);
                }, _objMain.rate);
            }
            catch (e) {
                eHandler.throwWarning(e);
                return false;
            }
        }

        //// Bewegung des Objekts sofort anhalten
        this.Stop = function () {
            try {
                if (!ss2d.Callback.Delete("_SS2D_MOVE_" + _objMain.id))
                    throw "SS2D::GAME_OBJECT::GAMEOBJ_STOP: Bewegung von " + _objMain.id + " kann nicht angehalten werden.";

                return true;
            }
            catch (e) {
                eHandler.throwWarning(e);
                return false;
            }
        }

        this.AnimationPlay = function (name) {
            ss2d.Graphics.Animation.Play(name, _objMain);
            this.animation = name;
            return true;
        }

        this.AnimationStop = function () {
            ss2d.Graphics.Animation.Stop(_objMain);
            this.animation = "";
            return true;
        }

        this.LoadSprite = function (src) {
            _objMain.spriteId = ss2d.Graphics.SpriteAdd(_objMain.id + "_SPRITE", src, _objMain);
            return true;
        }

        this.LoadSpriteSet = function (src) {
            _objMain.spriteId = ss2d.Graphics.SpriteSetAdd(_objMain.id + "_SPRITE_SET", src, _objMain);
            return true;
        }

        this.RemoveSprite = function () {
            return ss2d.Graphics.SpriteRemove(_objMain.spriteId.id);
        }
		
		this.SpriteSet = function (number) {
		}
		
		//// Neue Box zur Kollisionserkennung anlegen
		this.AddCollisionBox = function (id, x, y, width, height) {
			
			try {
				if (typeof id == "undefined" || id == "")
					throw "SS2D::GAME_OBJECT::ADD_COLLISION_BOX: Bitte eine eindeutige ID angeben";
				
				if (typeof x == "undefined" || x < 0 || typeof y == "undefined" || y < 0)
					throw "SS2D::GAME_OBJECT::ADD_COLLISION_BOX: Startwerte ungueltig.";
				
				if (typeof width == "undefined" || width < 0 || typeof height == "undefined" || height < 0)
					throw "SS2D::GAME_OBJECT::ADD_COLLISION_BOX: Groessenwerte ungueltig.";
				
				this.boundingBoxes.push({
					id:			id,
					x:			x,
					y: 			y,
					width:		width,
					height:		height
				});
				return true;
			}
            catch (e) {
                eHandler.throwWarning(e);
                return false;
            }
		}
		
		//// Box auf Existenz pruefen
		this.IsCollisionBox = function (id) {
			
			try {
				if (typeof id == "undefined" || id === "")
					throw "SS2D::GAME_OBJECT::IS_COLLISION_BOX: Bitte eine eindeutige ID angeben";
				
				if (this.boundingBoxes.length > 0) {
					var boxes = this.boundingBoxes;
					for (var i = boxes.length; i--; ) {
						if (boxes[i].id == id) {
							return true;
						}
					}
				}
                return false;
			}
            catch (e) {
                eHandler.throwWarning(e);
                return false;
            }
		}
		
		//// Bestehende Box wieder entfernen
		this.RemoveCollisionBox = function (id) {
			
			try {
				if (typeof id == "undefined" || id === "")
					throw "SS2D::GAME_OBJECT::REMOVE_COLLISION_BOX: Bitte eine eindeutige ID angeben";
				
				if (this.boundingBoxes.length > 0) {
					var boxes = this.boundingBoxes;
					for (var i = boxes.length; i--; ) {
						if (boxes[i].id == id) {
							this.boundingBoxes.splice(i, 1);
						}
					}
				}
			}
            catch (e) {
                eHandler.throwWarning(e);
                return false;
            }
		}

        return this;
    }

    //// Neues Game-Object erstellen
      // @param         string          id                  ID des neuen Objekts
      // @return        bool                                TRUE bei Erfolg, sonst FALSE
    this.NewGameObject = function (id) {

        try {
            if (typeof id == "undefined" || id == "")
                throw "SS2D::GAMEOBJ_NEW: Keine ID angegeben, Objekt kann nicht erstellt werden.";

            if (gameObjects.length > 0) {
                for (var i = gameObjects.length; i--;) {
                    if (gameObjects[i].id == id) {
                        throw "SS2D::GAMEOBJ_NEW: ID '" + id + "' bereits fuer ein anderes Objekt verwendet, Objekterstellung wird abgebrochen.";
                        break;
                    }
                }
            }
            
            var obj = new GameObject_Template(id);
            if (!gameObjects.push(obj))
                throw "SS2D::GAMEOBJ_NEW: Objekt konnte nicht in Liste eingetragen werden.";

            return obj;
        }
        catch (e) {
            eHandler.throwWarning(e);
            return false;
        }
        return false;
    }


    this.AlertObjects = function () {

        var objects = "";

        if (gameObjects.length > 0) {
            for (var i = gameObjects.length; i--;) {
                objects += i + ": " + gameObjects[i].id + "\n";
            }

            alert(objects);
        }
    }
    

    // -------------------------------------------------------------------------
    // Abschnitt: Aktualisierungsbereich (privat, nicht von extern anzusteuern!)
    // -------------------------------------------------------------------------

    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   MainLoop ()
     * @Author: Skarge
     * @Date:   2010/08/01
     * @Mod.:   2012/07/07
     * @Desc:   Aktualisierung des Spielgeschehens, Regelung des Framedrops
     */
    var MainLoop = function () {
	
        var nextFrame = nextTick;

        //// Nur ausfuehren wenn Spiel laeuft!
        if (gameState == "running") {
			
			//$("#stats").html("x: " + ss2d.Input.mousePos[0] + " | y: " + ss2d.Input.mousePos[1] + "<br />0: " + ss2d.Input.mouseButton[0] + "<br />1: " + ss2d.Input.mouseButton[1] + "<br />2: " + ss2d.Input.mouseButton[2]);

            var time        = new Date().getTime();
            UpdateGame();
			if (ticksPerSecond >= 50) {
				if (ticks % drawUpdateDiv == 1)
		            UpdateDraw();
			}
			else
				UpdateDraw();
			
            updateTime      = new Date().getTime() - time;

            //// Frameskip erlaubt? Wenn ja, notfalls einige Warteticks verwerfen zum Aufholen verlorener Zeit
            if (allowFrameskip == true) {
                var checkFrame 	= nextFrame - updateTime;
                if (checkFrame >= 0 && checkFrame != nextFrame) {

                    if (updateTime < maxFrameskip) {
                        nextFrame = checkFrame;
                        droppedFrames += updateTime;
                    }
                    else {
                        //// Max. Frameskip abziehen. Bei Ergebnis < 0 wird automatisch 1 gesetzt
                        if ((nextFrame - maxFrameskip) <= 0)
                            nextFrame = 1;
                        else
                            nextFrame -= maxFrameskip;
                        
                        droppedFrames += maxFrameskip;
                    }
                }
                else if (checkFrame < 0 && checkFrame != nextFrame) {
                        nextFrame = 1;
                        droppedFrames += updateTime;
				}
                
                nextReal = nextFrame;
            }

            if (bench === true) {
                frameTime 	= (new Date().getTime() - time) - updateTime;
                loopTime	= new Date().getTime() - time;
                
                $("#stats").html("Ticks: " + ticks + "<br />TPS: " + Math.round(((ticksPerSecond / nextTick) * nextReal)) + " (" + ticksPerSecond + ")<br />Tickdrops: " + droppedFrames + "<br />Ausf&uuml;hrungszeit: " + _main.GetUptime() + " Sek");
            }
               
			ticks++;

            //// Timeout setzen bis zur naechsten Aktualisierung
            setTimeout(function _MainLoop () {
                MainLoop()
            }, nextFrame);
        }
    }


    /* /////////////////////////////////////////////////////////////////////////
     * @Func:   UpdateGame ()
     * @Author: Skarge
     * @Date:   2010/09/10
     * @Mod.:   -
     * @Desc:   Callbacks durchlaufen und akt. Eingaben abfragen
     */
    var UpdateGame = function () {
        
        //// Callbacks durchspulen
        RunCallbacks();
    }


    //// Neuzeichnen der Spielszene
    var UpdateDraw = function () {

        _main.Graphics.UpdateDraw();
    }


    //// Aktive Callbacks durchspulen
    var RunCallbacks = function() {

        //// Nur durchlaufen wenn bereits Callbacks angelegt wurden
        if (callbackCount > 0) {
            for (var i = callbackCount; i--;) {

                var callback = callbacks[i];

                //// Ist der Callback ueberhaupt aktiv?
                if (callback.state == 1) {
                    if (callback.waitFor <= 0) {
                        //// Ausfuehrung starten, Wartezeit um
                        callback.fn();
                        callback.waitFor = (callback.sleep - 1);
                    }
                    else
                        //// Wartezeit runtersetzen
                        callback.waitFor--;
                }
            }
        }
        
        return true;
    }
};


// -------------------------------------------------------------------------
// Abschnitt: Dev- und Debug-Funktionen
// -------------------------------------------------------------------------

/**
 * Concatenates the values of a variable into an easily readable string
 * by Matt Hackett [scriptnode.com]
 * @param {Object} x The variable to debug
 * @param {Number} max The maximum number of recursions allowed (keep low, around 5 for HTML elements to prevent errors) [default: 10]
 * @param {String} sep The separator to use between [default: a single space ' ']
 * @param {Number} l The current level deep (amount of recursion). Do not use this parameter: it's for the function's own use
 */
function print_r(x, max, sep, l) {

	l = l || 0;
	max = max || 10;
	sep = sep || ' ';

	if (l > max) {
		return "[WARNING: Too much recursion]\n";
	}

	var
		i,
		r = '',
		t = typeof x,
		tab = '';

	if (x === null) {
		r += "(null)\n";
	} else if (t == 'object') {

		l++;

		for (i = 0; i < l; i++) {
			tab += sep;
		}

		if (x && x.length) {
			t = 'array';
		}

		r += '(' + t + ") :\n";

		for (i in x) {
			try {
				r += tab + '[' + i + '] : ' + print_r(x[i], max, sep, (l + 1));
			} catch(e) {
				return "[ERROR: " + e + "]\n";
			}
		}

	} else {

		if (t == 'string') {
			if (x == '') {
				x = '(empty)';
			}
		}

		r += '(' + t + ') ' + x + "\n";

	}

	return r;

};
window.var_dump = print_r;


var eHandler = function () {

    this.throwError = function (exception) {
            alert ("FEHLER: \n" + exception);
            ss2d.Stop();
    }

    this.throwWarning = function (exception) {
		if (ss2d.GetDebug() === true)
			this.logText("WARNUNG: " + exception);
			
        alert ("WARNUNG: \n" + exception);
    }
	
	this.logText = function (txt) {
		if (window["console"]) {
			console.log(txt);
		}
	}
}

window.eHandler = new eHandler();
window.ss2d = new ss2d();