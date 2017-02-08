module Bomberman {

	/*************************************************************
	 * Main game configuration
	 *************************************************************/

	export const cfg = {

		game: {
			width: 1280,
			height: 800,
			allowScaling: true
		},
		tile: {
			size: 64,
			width: 19,
			height: 13,
			tilesPerLine: 23 //Tiles on spritesheet
		},
		max: {				//Maximum atttributes of a player
			bombs: 12,
			strength: 15,
			speed: 10
		},
		debug: {
			showDebugTable: false, //true,
			showMarkers: false, //true,
			showTileValues: false, //true
		},

		muteMusic: true,
		muteSound: true

	}

}