 /* ///////////////////////////////////////////////////////////////////
 * //// 2D-Gamelib "screenSports2D" Socketplugin                  ////
 * //// ********************************************************* ////
 * //// @Project:   screenSports2D                                ////
 * //// @Author:    Dennis "Skarge" Müller                        ////
 * //// @Version:   110                                           ////
 * //// @Copyright: screenSports.de                               ////
 * //// @Link:      http://www.screensports.de                    ////
 * //// ********************************************************* ////
 * //// @Release:   2011/04/17                                    ////
 * //// ********************************************************* ////
 * //// @Summary:                                                 ////
 * //// Netzwerkplugin mittels Socket-Verbindung                  ////
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

////////////////////////////////////////////////////////////////////////////////////////
/////
/////	***** Packages *****
/////
////////////////////////////////////////////////////////////////////////////////////////
function sockPackage (data) {
	this.id 	= 1;
	this.name 	= "test";
	this.no		= 0;			// Wird automatisch gesetzt
	this.data 	= data;
	this.length = 0;
}
 
 
function cWebSocketPlugin () {

    this.Socket = {

		////////////////////////////////////////////////////////////////////////////////////////
		/////
		/////	***** Eigenschaften des Plugins *****
		/////
		////////////////////////////////////////////////////////////////////////////////////////
		
		socket:		null,
		host:		"",
		currPkg:	null,
		lastPkg:	null,
		buffPkg:	null,
		useBuffer:	false,
		bufferLen:	0,
		pkgCount:	0,
		tolerance:	10,
		altFunc:	null,
		
		////////////////////////////////////////////////////////////////////////////////////////
		/////
		/////	***** Methoden des Plugins *****
		/////
		////////////////////////////////////////////////////////////////////////////////////////
	
		/* /////////////////////////////////////////////////////////////////////////
		 * @Func:   Init ()
		 * @Author: Skarge
		 * @Date:   2011/04/15
		 * @Mod.:   -
		 * @Desc:   Initialisierung des Plugins
		 */
		Init: function () {
		},
		
		
		/* /////////////////////////////////////////////////////////////////////////
		 * @Func:   Connect ()
		 * @Author: Skarge
		 * @Date:   2011/04/15
		 * @Mod.:   2011/04/17
		 * @Desc:   Stellt eine Verbindung zum angegebenen Host her
		 */	
		Connect: function () {
			try {
				this.socket = new WebSocket(ss2d.Socket.host);
				
				this.socket.onopen = function() {
					console.log("SS2D_WEB_SOCKET: Verbindung erfolgreich hergestellt.");
				}
				
				this.socket.onmessage = function(msg) {
					
					if (ss2d.Socket.altFunc != "")
						ss2d.Socket.altFunc(msg);
					else {
						console.log("SS2D_WEB_SOCKET: " + msg.data);
						//if (ss2d.Socket.pkgCount == 0 || msg.data.no != ss2d.Socket.pkgCount) {
							/*
							//// Bei aktiviertem Buffer wird vorab das aktuelle Paket gebuffert (sofern eins da ist)
							if (ss2d.Socket.currPkg && ss2d.Socket.useBuffer === true) {
								if (typeof ss2d.Socket.buffPkg != "array")
									ss2d.Socket.buffPkg = new Array();
								
								ss2d.Socket.buffPkg[ss2d.Socket.bufferLen] = ss2d.Socket.currPkg;
								ss2d.Socket.bufferLen++;
							}
							
							ss2d.Socket.currPkg = jQuery.parseJSON(msg.data);
							*/
						//}
					}
				}
				
				this.socket.onclose = function() {
					console.log("SS2D_WEB_SOCKET: Verbindung getrennt.");
				}
				
				this.socket.onerror = function(msg) {
					alert ("Socketfehler: " + msg);
				}
			}
			catch (e) {
			}
		},
			

		/* /////////////////////////////////////////////////////////////////////////
		 * @Func:   SendPackage (pkg)
		 * @Author: Skarge
		 * @Date:   2011/04/15
		 * @Mod.:   2011/04/16
		 * @Desc:   Sendet bei bestehender Verbindung das uebergebene Paket an den Host
		 */
		SendPackage: function (pkg) {
			try {
				if (ss2d.Socket.socket.readyState == 1) {
					if (pkg && typeof pkg === "object" && pkg.data != "") {
						ss2d.Socket.pkgCount++;
						pkg.no = ss2d.Socket.pkgCount;
						ss2d.Socket.socket.send(ss2d.EncodeJSON(pkg));
					}
					else
						throw "SS2D_WEB_SOCKET::SEND_PACKAGE: Kein Paket angegeben oder falscher Typ";
				}
				else
					throw "SS2D_WEB_SOCKET::SEND_PACKAGE: Keine bestehende Verbindung, Senden nicht moeglich";
			}
			catch (e) {
			}
		},
			

		/* /////////////////////////////////////////////////////////////////////////
		 * @Func:   ReadPackage ()
		 * @Author: Skarge
		 * @Date:   2011/04/15
		 * @Mod.:   2011/04/17
		 * @Desc:   Liest das letzte empfangene Paket ein
		 */
		ReadPackage: function() {
			try {
				if (ss2d.Socket.currPkg && typeof ss2d.Socket.currPkg != "undefined" && typeof ss2d.Socket.currPkg != "null") {
					if (ss2d.Socket.currPkg.no < (ss2d.Socket.pkgCount - ss2d.Socket.tolerance))
						throw "";
					else {
						ss2d.Socket.pkgCount = (ss2d.Socket.pkgCount == ss2d.Socket.currPkg.no) ? ss2d.Socket.currPkg.no + 1 : ss2d.Socket.currPkg.no;
						ss2d.Socket.lastPkg = ss2d.Socket.currPkg;
						ss2d.Socket.currPkg = null;
						return ss2d.Socket.lastPkg.data;
					}
				}
			}
			catch (e) {
				alert (e);
			}
		},
		
		
		CheckBuffer: function () {
			if (ss2d.Socket.useBuffer === true && ss2d.Socket.bufferLen > 0)
				return true;
			else
				return false;
		},
		
		
		CheckBufferLength: function () {
			return ss2d.Socket.bufferLen;
		},
		
		
		ReadBuffer: function () {
			//// Auf gehaltene Pakete pruefen
			if (ss2d.Socket.useBuffer === true && ss2d.Socket.buffPkg != null && ss2d.Socket.bufferLen > 0) {
				for (var i = 0; i <= ss2d.Socket.bufferLen; i++) {
					var tmpPkg = ss2d.Socket.buffPkg[i];
					
					if (ss2d.Socket.currPkg.no < (ss2d.Socket.pkgCount - ss2d.Socket.tolerance))
						throw "";
					else {
						ss2d.Socket.pkgCount = (ss2d.Socket.pkgCount == ss2d.Socket.currPkg.no) ? ss2d.Socket.currPkg.no + 1 : ss2d.Socket.currPkg.no;
						ss2d.Socket.lastPkg = ss2d.Socket.currPkg;
						ss2d.Socket.currPkg = null;
						return ss2d.Socket.lastPkg.data;
					}
				}
			}
		},
		
		
		ReadBufferPos: function(pos) {
			//// Auf gehaltene Pakete pruefen
			if (ss2d.Socket.useBuffer === true && typeof ss2d.Socket.buffPkg === "array" && ss2d.Socket.bufferLen > 0 && pos >= 0 && pos <= ss2d.Socket.bufferLen) {
				
				var tmpPkg = ss2d.Socket.buffPkg[pos];
				
				ss2d.Socket.pkgCount = (ss2d.Socket.pkgCount == tmpPkg.no) ? tmpPkg.no + 1 : tmpPkg.no;
				ss2d.Socket.lastPkg = tmpPkg;
				
				return ss2d.Socket.lastPkg.data;
			}
		},
		
		
		ClearBuffer: function () {
			if (ss2d.Socket.useBuffer === true) {
				if (!(ss2d.Socket.buffPkg = null))
					return false;
			}
			return true;
		},
		
		
		/* /////////////////////////////////////////////////////////////////////////
		 * @Func:   SetHost (host)
		 * @Author: Skarge
		 * @Date:   2011/04/16
		 * @Mod.:   -
		 * @Desc:   Setzt einen neuen Host
		 */
		SetHost: function (host) {
			if (host && host != "") {
				ss2d.Socket.host = host;
			}
		},
		
		
		/* /////////////////////////////////////////////////////////////////////////
		 * @Func:   GetHost ()
		 * @Author: Skarge
		 * @Date:   2011/04/16
		 * @Mod.:   -
		 * @Desc:   Ausgabe des aktuellen Hosts
		 */		
		GetHost: function () {
			return ss2d.Socket.host;
		},
			

		/* /////////////////////////////////////////////////////////////////////////
		 * @Func:   GetState ()
		 * @Author: Skarge
		 * @Date:   2011/04/15
		 * @Mod.:   -
		 * @Desc:   Ausgabe des aktuellen Verbindungsstatus
		 */
		GetState: function () {
			return ss2d.Socket.socket.readyState;
		},
		
		
		RegisterFunc: function (fn) {
			if (typeof fn == "function")
				ss2d.Socket.altFunc = fn;
		}
	}
}