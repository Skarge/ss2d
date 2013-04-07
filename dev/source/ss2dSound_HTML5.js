/* ///////////////////////////////////////////////////////////////////
 * //// 2D-Gamelib "screenSports2D" HTML5 Sound-Plugin (simpel)   ////
 * //// ********************************************************* ////
 * //// @Project:   screenSports2D                                ////
 * //// @Author:    Dennis "Skarge" Müller                        ////
 * //// @Version:   100                                           ////
 * //// @Copyright: screenSports.de                               ////
 * //// @Link:      http://www.screensports.de                    ////
 * //// ********************************************************* ////
 * //// @Release:   2010/10/08                                    ////
 * //// ********************************************************* ////
 * //// @Summary:                                                 ////
 * //// HTML5 Sound-Plugin (simpel)                              ////
 * //// ********************************************************* ////
 * //// @Description:                                             ////
 * //// Einfaches Soundplugin zur Wiedergabe von Audiodateien mit ////
 * //// HTML5 und Javascript.                                     ////
 * ////                                                           ////
 * //// Die Nutzung dieser Software unterliegt den Rahmen-        ////
 * //// bedingungen der Lizenz. Weitere Informationen unter       ////
 * //// http://zero.screensports.de/lizenz.txt                    ////
 * ///////////////////////////////////////////////////////////////////
 */


function CSoundHTML () {
	////////////////////////////////////////////////////////////////////////////////////////
	/////
	/////	***** Soundwrapper HTML5 Multisound *****
	/////
	////////////////////////////////////////////////////////////////////////////////////////
	this.Sound = {

		bgm: 	[],					//// Array mit allen geladenen BGMs
		sounds: [],					//// Array mit allen geladenen Sound(effekt)-Dateien

		//// Initialisierung des Systems
		Init: function() {
			objAudioBgm 	= new Audio();
			objAudioSound 	= new Audio();
			objAudioBgm.setAttribute("autoplay", "false");
			objAudioSound.setAttribute("autoplay", "false");
		},

		//// Wiedergabe einer Audiodatei
		  // @param		string				type				Art der Audiodatei (BGM, Sound)
		  // @param		string				id					Kennung der Audiodatei
		Play: function(type, id, loop) {

			try {
				if (type == "bgm") {
					if (this.bgm.length > 0) {
						for (var i = 0; i < this.bgm.length; i++) {
							if (this.bgm[i].id == id) {
								objAudioBgm.src = this.bgm[i].url;

								if (loop == true)
									objAudioBgm.loop = loop
								else
									objAudioBgm.loop = "";

								objAudioBgm.load();
								objAudioBgm.play();

								return true;
								break;
							}
						}
						throw "SS2D_SOUND_PLAY: BGM '" + id + "' nicht gefunden";
					}
					else
						throw "SS2D_SOUND_PLAY: Keine BGM bekannt";
				}
				else {
					if (this.sounds.length > 0) {
						for (var i = 0; i < this.sounds.length; i++) {
							if (this.sounds[i].id == id) {
								objAudioSound.src = this.sounds[i].url;
								objAudioSound.load();
								objAudioSound.play();

								return true;
								break;
							}
						}
						throw "SS2D_SOUND_PLAY: Sound '" + id + "' nicht gefunden";
					}
					else
						throw "SS2D_SOUND_PLAY: Keine Sounds bekannt";
				}
			}
			catch (e) {
				alert (e);
			}
		},

		//// Pausieren der Wiedergabe
		  // @param		string				type				Art der Audiodatei (BGM, Sound)
		Pause: function(type) {
			if (type == "bgm") {
				objAudioBgm.pause();
			}
			else {
				objAudioSound.pause();
			}
		},

		//// Stop der Wiedergabe und zurueck an den Anfang der Datei
		  // @param		string				type				Art der Audiodatei (BGM, Sound)
		Stop: function(type) {
			if (type == "bgm") {
				objAudioBgm.pause();
				objAudioBgm.currentTime = 0;
			}
			else {
				objAudioSound.pause();
				objAudioSound.currentTime = 0;
			}
		},

		//// Stummschalten der Audiospur
		  // @param		string				type				Art der Audiospur (BGM, Sound)
		Mute: function(type) {
			if (type == "bgm") {
				objAudioBgm.muted = (objAudioBgm.muted == false) ? true : false;
			}
			else {
				objAudioSound.muted = (objAudioSound.muted == false) ? true : false;
			}
		},

		//// Hinzufuegen neuer Audiodateien
		  // @param		string				url					URL zur Audiodatei
		  // @param		string				type				Art der Audiodatei (BGM, Sound)
		  // @param		string				id					Kennung der Datei fuer Array
		  // @return	bool									TRUE bei Erfolg, sonst FALSE
		Load: function(url, type, id) {

			try {
				if (id == "" || typeof id == "undefined")
					throw "SS2D_SOUND_LOAD: Keine ID definiert";

				if (type == "bgm")
					this.bgm.push({ id: id, url: url});
				else
					this.sounds.push({ id: id, url: url });

				return true;
			}
			catch (e) {
				alert(e);
			}

			return false;
		},

		//// Entfernen einer Audiodatei aus der Liste
		  // @param		string				type				Art der Audiodatei (BGM, Sound)
		  // @param		string				id					Kennung der Datei fuer Array
		  // @return	bool									TRUE bei Erfolg, sonst FALSE
		Unload: function(type, id) {

			try {
				if (type == "bgm") {
					if (this.bgm.length > 0) {
						for (var i = 0; i < this.bgm.length; i++) {
							if (this.bgm[i].id == id) {
								this.bgm.splice(i, 1);
								if (this.bgm.length > 0)
									this.bgm.sort();

								return true;
								break;
							}
						}
						throw "SS2D_SOUND_UNLOAD: BGM '" + id + "' nicht gefunden";
					}
					throw "SS2D_SOUND_UNLOAD: Keine BGM vorhanden";
				}
				else {
					if (this.sounds.length > 0) {
						for (var i = 0; i < this.sounds.length; i++) {
							if (this.sounds[i].id == id) {
								this.sounds.splice(i, 1);
								if (this.sounds.length > 0)
									this.sounds.sort();

								return true;
								break;
							}
						}
						throw "SS2D_SOUND_UNLOAD: Sound '" + id + "' nicht gefunden";
					}
					throw "SS2D_SOUND_UNLOAD: Keine Sounds vorhanden";
				}
			}
			catch (e) {
				alert (e);
			}

			return false;
		}
	}
}