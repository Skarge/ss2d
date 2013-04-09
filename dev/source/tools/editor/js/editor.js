function ss2Ed () {
	
	var _version 	= "0.1dev";
	var _build		= "2013040901";
	var _release	= "2013-04-09";
	
	var _currProj	= "";
	var _currMap	= null;
	
	var _mapEdMap		= [];
	var _mapEdLayer 	= 1;
	var _mapEdShowOpac 	= 0;
	var _mapTileSize	= 32;
	var _mapTileData	= [];
	var _mapResData		= [];
	
	var _tmplMapTileData	= {
		tileset : null,
		width   : 0,
		height  : 0,
		size    : _mapTileSize
	}
	
	
	
	/* /////////////////////////////////////////////////////////////////////////
     * @Func:   Init ()
     * @Author: Skarge
     * @Date:   2013/04/09
     * @Mod.:   -
     * @Desc:   Initialisiert den Editor
     */
	this.Init = function () {
	}
	
	
	
	/* /////////////////////////////////////////////////////////////////////////
     * @Func:   MapShowEditor ()
     * @Author: Skarge
     * @Date:   2013/04/09
     * @Mod.:   -
     * @Desc:   Zeigt die zuletzt geladene Karte an
     */
	this.MapShowEditor = function () {
		if (_mapEdMap.length >= 1) {
			var output = "";
			for (var layer in _mapEdMap) {
				output += "<div id=\"layer_" + layer + "\" style=\"z-index:" + layer + "; position: absolute; top:0px; left:0px;\">";
				for (var i = 0, x = 0, y = 0; i < _mapEdMap[layer].tileCount; i++) {
					if (typeof _mapEdMap[layer].data[x] != "undefined" && typeof _mapEdMap[layer].data[x][y] != "undefined") {
						if (_mapEdMap[layer].data[x][y] != 0)
							backgroundImageTmp = "background:url('" + _mapTileData[_mapResData[_mapEdMap[layer].data[x][y]].tileId].tileset.src + "'); background-position:-" + _mapResData[_mapEdMap[layer].data[x][y]].x + "px -" + _mapResData[_mapEdMap[layer].data[x][y]].y + "px;";
						else
							backgroundImageTmp = "";
						
						output += "<div id=\"" + layer + "_" + x + "_" + y + "\" style=\"width:32px; height:32px; " + backgroundImageTmp + " float:left;\"></div>";
					}
					
					if (x == (_mapEdMap[layer].width - 1)) {
						x = 0;
						y++;
						output += "<div style=\"clear:both;\"></div>";
					}
					else
						x++;
				}
			}
			output += "</div>";
		}
		
		$("#map").html(output);
		
	}
	
	
	
	/* /////////////////////////////////////////////////////////////////////////
     * @Func:   MapLoadTiledJSON (src)
     * @Author: Skarge
     * @Date:   2013/04/09
     * @Mod.:   -
     * @Desc:   Laedt eine unter src angegebene (in Tiled erstellte) Karte, die im JSON-Format gespeichert wurde, und macht diese im Editor nutzbar
     */
	this.MapLoadTiledJSON = function (src) {
		
		if (typeof src != "undefined" && src != "") {
			var map 		= {};
			var currLayer 	= 0;
			
			//// Ajax auf async = false einstellen, da wir das Ergebnis unbedingt benoetigen bevor es weiter geht
			$.ajaxSetup({
				async: false
			});
			
			//// JSON abrufen und ins Map-Object packen
			$.getJSON(src, function(data) {
				map = jQuery.extend(map, data);
			});
			
			//// Abruf fertig, wir setzen async wieder auf true zurueck, damit es andere Funktionen usw. nicht beeinflusst
			$.ajaxSetup({
				async: true
			});
			
			//// Die erhaltenen Kartendaten werden jetzt der Reihe nach auseinander genommen und in die Eigenschaften des Editors gepackt
			for (var tSet in map.tilesets) {
				this.MapLoadTileset(map.tilesets[tSet].image, 16, 16, 32);
			}
			
			for (var layer in map.layers) {
				if (map.layers[layer].opacity == 1) {
					_mapEdMap[currLayer] 		= {
						data: 		[],
						tileCount:	map.layers[layer].data.length,
						width:		map.layers[layer].width,
						height:		map.layers[layer].height
					};
					for (var i = 0, x = 0, y = 0; i < map.layers[layer].data.length; i++) {
						if (typeof _mapEdMap[currLayer].data[x] == "undefined")
							_mapEdMap[currLayer].data[x] = [];
						
						_mapEdMap[currLayer].data[x][y] = map.layers[layer].data[i];
						
						if (x == (map.width - 1)) {
							y++;
							x = 0;
						}
						else {
							x++;
						}
					}
				}
				currLayer++;
			}
		}
	}
	
	
	
	/* /////////////////////////////////////////////////////////////////////////
     * @Func:   MapLoadTileset (src, a, b, size)
     * @Author: Skarge
     * @Date:   2013/04/08
     * @Mod.:   -
     * @Desc:   Laedt das angegebene Tileset und legt es in lokale Variablen ab	
     */
	this.MapLoadTileset = function (src, a, b, size) {
		
		var index = _mapTileData.length;
		_mapTileData[index] 			= jQuery.extend(_mapTileData[index], _tmplMapTileData);
		_mapTileData[index].tileset 	= new Image();
		_mapTileData[index].tileset.src = src;
		_mapTileData[index].width		= a;
		_mapTileData[index].height		= b;
		_mapTileData[index].size		= size;
		
		for (var i = 0, x = 0, y = 0; i < (a*b); i++, x++) {

			_mapResData[_mapResData.length] = {
				tileId: _mapTileData.length - 1,
				x  : ((x - 1) * size),
				y  : (y * size),
				size: size
			}
			
			if (x >= a) {
				x = 0;
				y++;
			}
		}
	}
}


var ss2Ed = new ss2Ed();
ss2Ed.Init();
ss2Ed.MapLoadTiledJSON("maps/market1.json");
ss2Ed.MapShowEditor();