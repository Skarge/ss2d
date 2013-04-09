/* ///////////////////////////////////////////////////////////////////
 * //// 2D-Gamelib "screenSports2D" Mapklasse                     ////
 * //// ********************************************************* ////
 * //// @Project:   screenSports2D                                ////
 * //// @Author:    Dennis "Skarge" Müller                        ////
 * //// @Version:   100                                           ////
 * //// @Copyright: screenSports.de                               ////
 * //// @Link:      http://www.screensports.de                    ////
 * //// ********************************************************* ////
 * //// @Release:   2013/04/08                                    ////
 * //// ********************************************************* ////
 * //// @Summary:                                                 ////
 * //// Klasse fuer Map und Tilesystem                            ////
 * //// ********************************************************* ////
 * //// @Description:                                             ////
 * //// Verwaltung von Maps auf Tilebasis.                        ////
 * ////                                                           ////
 * //// Die Nutzung dieser Software unterliegt den Rahmen-        ////
 * //// bedingungen der Lizenz. Weitere Informationen unter       ////
 * //// http://zero.screensports.de/lizenz.txt                    ////
 * ///////////////////////////////////////////////////////////////////
 */

function cMapPlugin () {

    this.Map = {

	////////////////////////////////////////////////////////////////////////////////////////
	/////
	/////	***** Eigenschaften des Plugins *****
	/////
	////////////////////////////////////////////////////////////////////////////////////////

        useTiles:   true,
        mapData:    [],
        resData:    [],
        tileData:   [],
        tileSize:   32,

        /* /////////////////////////////////////////////////////////////////////////
         * @Func:   LoadRessource ()
         * @Author: Skarge
         * @Date:   2010/10/15
         * @Mod.:   -
         * @Desc:   Pruefung auf Passierbarkeit eines Feldes
         */
        LoadRessource: function (src) {

            this.resData[this.resData.length]           = new Image();
            this.resData[this.resData.length - 1].src   = src;
        },

        /* /////////////////////////////////////////////////////////////////////////
         * @Func:   LoadTileset ()
         * @Author: Skarge
         * @Date:   2010/10/31
         * @Mod.:   -
         * @Desc:   Laedt ein komplettes Tileset auf einmal und legt dieses als Objekt an
         */
        LoadTileset: function (src, a, b, size) {

            var start = this.tileData.length;

            this.tileData[this.tileData.length] = {
                tileset : new Image(),
                width   : a,
                height  : b,
                size    : size
            }
            this.tileData[(this.tileData.length - 1)].tileset.src = src;

            for (var i = 0, x = 0, y = 0; i < (a*b); i++, x++) {

                this.resData[this.resData.length] = {
                    tileId: this.tileData.length - 1,
                    x  : ((x - 1) * size) + x,
                    y  : (y * size) + y + 1,
                    size: size
                }

                if (x >= a) {
                    x = 0;
                    y++;
                }
            }
        },

        /* /////////////////////////////////////////////////////////////////////////
         * @Func:   CheckPassable ()
         * @Author: Skarge
         * @Date:   2010/10/13
         * @Mod.:   -
         * @Desc:   Pruefung auf Passierbarkeit eines Feldes
         */
        CheckPassable: function (x,y) {
            return true;
        },
		
		
		
		LoadTiledMapJSON: function (src) {
		}
    }
}