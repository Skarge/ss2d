/* ///////////////////////////////////////////////////////////////////
 * //// 2D-Gamelib "screenSports2D" Tastatureingabe               ////
 * //// ********************************************************* ////
 * //// @Project:   screenSports2D                                ////
 * //// @Author:    Dennis "Skarge" Müller                        ////
 * //// @Version:   125                                           ////
 * //// @Copyright: screenSports.de                               ////
 * //// @Link:      http://www.screensports.de                    ////
 * //// ********************************************************* ////
 * //// @Release:   2012/07/05                                    ////
 * //// ********************************************************* ////
 * //// @Summary:                                                 ////
 * //// Tastatureingabe erkennen und loggen                       ////
 * //// ********************************************************* ////
 * //// @Description:                                             ////
 * //// Reagiert bei Aktivierung auf Tastendruck und schreibt     ////
 * //// alle aktiven Tasten in einen Array.                       ////
 * ////                                                           ////
 * //// Die Nutzung dieser Software unterliegt den Rahmen-        ////
 * //// bedingungen der Lizenz. Weitere Informationen unter       ////
 * //// http://zero.screensports.de/lizenz.txt                    ////
 * ///////////////////////////////////////////////////////////////////
 */

function cInputPlugin () {

    this.Input = {

	////////////////////////////////////////////////////////////////////////////////////////
	/////
	/////	***** Eigenschaften des Plugins *****
	/////
	////////////////////////////////////////////////////////////////////////////////////////
        
        keyTracker:     true,                   // Mitloggen aktivieren (TRUE = ja, FALSE = nein)
        keyList:        [],                     // Liste der mitgeloggten Keys
		mousePos:		[],
		mousePosOld:	[],
		mouseButton:	[],


	////////////////////////////////////////////////////////////////////////////////////////
	/////
	/////	***** Methoden des Plugins *****
	/////
	////////////////////////////////////////////////////////////////////////////////////////

		Init: function () {
			ss2d.Input.StartMouse();
			ss2d.Callback.Register("__SS2D_UPDATE_INPUT", function () {
				ss2d.Input.UpdateInput();
			}, 40);
		},

        //// Logging an- / ausschalten
          // @param     bool        state                       Mitloggen an oder ausschalten
          // @return    bool                                    TRUE bei Erfolg, sonst FALSE
        SetKeyTracker: function (state) {

            ss2d.Input.keyTracker = (typeof state != "undefined" && state === true ? true : false);
            return true;
        },

        //// Liefert den aktuellen Status des Loggings zurueck
          // @return    bool                                    TRUE bei aktivem Logging, sonst FALSE
        GetKeyTracker: function () {
            return ss2d.Input.keyTracker;
        },
		
		
		StartMouse: function() {
			document.addEventListener("mouseup", ss2d.Input.MouseUp, false);
			document.addEventListener("mousedown", ss2d.Input.MouseDown, false);
			document.addEventListener("mousemove", ss2d.Input.MouseMove, false);
		},
		
		
		MouseUp: function (event) {
			ss2d.Input.mouseButton[event.button] = false;
		},
		
		
		MouseDown: function (event) {
			ss2d.Input.mouseButton[event.button] = true;
		},
		
		
		MouseMove: function (event) {
			ss2d.Input.mousePosOld[0] = ss2d.Input.mousePos[0];
			ss2d.Input.mousePosOld[1] = ss2d.Input.mousePos[1];
			
			ss2d.Input.mousePos[0] = event.pageX;
			ss2d.Input.mousePos[1] = event.pageY;
		},
		
		GetMouse: function () {
			return (ss2d.Input.mousePos[0] + "," + ss2d.Input.mousePos[1]);
		},

        //// Funktion aufrufen zum mitloggen
        UpdateInput: function () {

            //// Tastatureingaben mit abfangen?
            if (ss2d.Input.keyTracker === true) {
                document.onkeydown = function(e) {
                        var key = (window.event ? window.event.keyCode : e.which);
                        ss2d.Input.keyList[key] = true;
                }
                document.onkeyup = function(e) {
                        var key = (window.event ? window.event.keyCode : e.which);
                        ss2d.Input.keyList[key] = false;
                }
            }
			
			
        }
    }
}