/* ///////////////////////////////////////////////////////////////////
 * //// 2D-Gamelib "screenSports2D" Font- und Textklasse          ////
 * //// ********************************************************* ////
 * //// @Project:   screenSports2D                                ////
 * //// @Author:    Dennis "Skarge" Müller                        ////
 * //// @Version:   100                                           ////
 * //// @Copyright: screenSports.de                               ////
 * //// @Link:      http://www.screensports.de                    ////
 * //// ********************************************************* ////
 * //// @Release:   2011/01/16                                    ////
 * //// ********************************************************* ////
 * //// @Summary:                                                 ////
 * //// Klasse fuer Font- und Textsystem                          ////
 * //// ********************************************************* ////
 * //// @Description:                                             ////
 * //// Verwaltung von Fonts und Weitergabe an Renderer.          ////
 * ////                                                           ////
 * //// Die Nutzung dieser Software unterliegt den Rahmen-        ////
 * //// bedingungen der Lizenz. Weitere Informationen unter       ////
 * //// http://zero.screensports.de/lizenz.txt                    ////
 * ///////////////////////////////////////////////////////////////////
 */

function cFontPlugin () {

    this.Font = {
		////////////////////////////////////////////////////////////////////////////////////////
		/////
		/////	***** Eigenschaften des Plugins *****
		/////
		////////////////////////////////////////////////////////////////////////////////////////

		updateDraw: false,

		txtData:    [],
        activeTxt:  -1,
		txtPos: {
			x:	0,
			y:	0
		},
		
		
		/* /////////////////////////////////////////////////////////////////////////
         * @Func:   LoadXml (file)
         * @Author: Skarge
         * @Date:   2011/01/04
         * @Mod.:   2011/01/16
         * @Desc:   Laedt die angegebene Datei und deren Inhalt in txtData ein
         */
		LoadXml: function (file) {
			
			try {
				if (!file)
					throw "SS2D_FONT_LOAD_XML: Keine Datei angegeben.";
				
				$.ajax({
					type:		"get",
					url:		file,								
					dataType:   ($.browser.msie) ? "xml" : "text/xml",
        			async:      false,
					complete: function (xml) {
           				$(xml).each(function (index) {
							alert (index + " | " + $(this).text() + "\n");
          				});
					},
					error: function (msg, e) {
           				throw "SS2D_FONT_LOAD_XML:  " + msg + " (" + e + ")";
					}
				});
				
				return true;
			}
			catch (e) {
                eHandler.throwWarning(e);
                return false;
			}
		},
		
		
		/* /////////////////////////////////////////////////////////////////////////
         * @Func:   SetPosition (posX, posY)
         * @Author: Skarge
         * @Date:   2011/01/08
         * @Mod.:   -
         * @Desc:   Position des Texts einstellen
         */
		SetPosition: function (posX, posY) {
			
			if (posX && posX > 0)
				this.txtPos.x = posX;
			
			if (posY && posY > 0)
				this.txtPos.y = posY;
		},
		
		
		/* /////////////////////////////////////////////////////////////////////////
         * @Func:   DrawText ()
         * @Author: Skarge
         * @Date:   2010/12/23
         * @Mod.:   2010/12/25
         * @Desc:   Gibt den eingegebenen Text aus
         */
		DrawText: function (txt, posX, posY) {
			
			try {
				if (typeof txt == "undefined" || txt == "")
					throw "SS2D_FONT_DRAW_TEXT: Kein Text angegeben.";
				
				if (posX && posX > 0)
					this.txtPos.x = posX;
					
				if (posY && posY > 0)
					this.txtPos.y = posY;
				
				this.txtData[0] = txt;
				this.activeTxt  = 0;
				this.updateDraw = true;
				return true;
			}
			catch (e) {
                eHandler.throwWarning(e);
                return false;
			}
		},
		
		
		/* /////////////////////////////////////////////////////////////////////////
         * @Func:   ShowText (txtNo)
         * @Author: Skarge
         * @Date:   2011/01/04
         * @Mod.:   -
         * @Desc:   Zeigt den gewuenschten Text an (bei keinem Parameter der erste Text)
         */
		ShowText: function (txtNo) {
			this.activeTxt = (!txtNo || txtNo < 0) ? 0 : txtNo;
			this.updateDraw = true;
			
			return true;
		},
		
		
		/* /////////////////////////////////////////////////////////////////////////
         * @Func:   HideText ()
         * @Author: Skarge
         * @Date:   2010/12/23
         * @Mod.:   -
         * @Desc:   Versteckt den aktuellen Text
         */
		HideText: function () {
			this.activeTxt = -1;
			this.updateDraw = true;
			return true;
		}
	}
}