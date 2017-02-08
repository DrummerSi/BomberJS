module Bomberman {

	/*************************************************************
	 * Misc. utility functions -- Ordered alphabetically 
	 *************************************************************/

	export class Utils {

		/**
		 * Returns the string representation of a direction 
		 */
		static convertDirectionToString(direction: Direction): string {
			switch (direction) {
				case Direction.Down:
					return "down";
				case Direction.Left:
					return "left";
				case Direction.Right:
					return "right";
				case Direction.Up:
					return "up";
			}
		}

		/**
		 * Converts entity on grid position to bitmap pixel position.
		 */
		static convertToBitmapPosition(pt: Point): Point {
			const p = new Point();
			p.x = pt.x * cfg.tile.size;
			p.y = pt.y * cfg.tile.size;
			return p;
		}

		/**
		 * Converts bitmap pixel position to grid position
		 */
		static convertToEntityPosition(pt: Point): Point {
			return new Point(Math.round(pt.x / 64), Math.round(pt.y / 64));
		}

		/**
		 * Converts an inputted CSV string to an array of arrays
		 */
		static CSVToArray(data: string): Array<Array<number>> {

			const objPattern = new RegExp((
				//Delimiters
				"(\,|\\r?\\n|\\r|^)" +

				//Fields
				"([^\"\,\\r\\n]*)"

			), "gi");

			let arrData = [[]];
			let arrMatches = null;

			while (arrMatches = objPattern.exec(data)) {

				let strMatchedDelimiter = arrMatches[1];

				if (strMatchedDelimiter.length &&
					strMatchedDelimiter !== ",") {
					arrData.push([]);
				}

				let strMatchedValue = arrMatches[2];
				arrData[arrData.length - 1].push(parseInt(strMatchedValue));
			}

			return (arrData);

		}

		/**
		 * Takes any class (as long as it contains a "getCollision" method)
		 * and returns a debug rectangle in the correct position on screen
		 */
		static debugCollision(obj: any): Phaser.Rectangle {
			let col = obj.getCollision();
			col.x = col.x + (cfg.tile.size / 2);
			return col;
		}

		/**
		 * Returns a formatted time based on inputted seconds
		 */
		static formatTime(time: number): string {
			const minutes = Math.floor(time / 60);
			const seconds = Math.floor(time - minutes * 60);
			const ms = Math.floor(time * 10).toString().slice(-1);

			return (`00${minutes}`).slice(-2) + ":" + (`00${seconds}`).slice(-2) + "." + ms;
		}

		/**
		 * Creates a 2d matrix of a specified size
		 */
		static matrix(rows: number, cols: number, defaultValue?: any): Array<any> {
			let arr = [];
			for (let i = 0; i < rows; i++) {
				arr.push([]);
				arr[i].push(new Array(cols));

				if (typeof defaultValue !== 'undefined') {
					for (let j = 0; j < cols; j++) {
						arr[i][j] = defaultValue;
					}
				}
			}
			return arr;
		}

		/**
		 * Returns a map object based on it's map name
		 */
		static loadStage(battleConfig: IBattleConfig): Map {

			switch (battleConfig.stage) {
				/*case Stage.Toys:
					return new ToysMap(battleConfig);
				case Stage.Micro:
					return new MicroMap(battleConfig);
				case Stage.UFO:
					return new UFOMap(battleConfig);
				case Stage.Snow:
					return new SnowMap(battleConfig);
				case Stage.Crayons:
					return new CrayonsMap(battleConfig);
				case Stage.Classic:
					return new ClassicMap(battleConfig);*/

				case Stage.Snow:
					return new SnowMap(battleConfig);
			}

		}

		/**
		 * Returns the opposite direction
		 */
		static oppositeDirection(direction: Direction): Direction {
			switch (direction) {
				case Direction.Down:
					return Direction.Up;
				case Direction.Left:
					return Direction.Right;
				case Direction.Right:
					return Direction.Left;
				case Direction.Up:
					return Direction.Down;
			}
		}

		/**
		 * Plays a specified music track (Unless music is muted)
		 */
		static playMusic(music: Phaser.Sound) {
			if (!cfg.muteMusic) {
				music.loopFull();
			}
		}

		/**
		 * Plays a specified sound (Unless sound is muted)
		 */
		static playSound(sound: Phaser.Sound) {
			if (!cfg.muteSound) {
				sound.play();
			}
		}

		/**
		 * Returns a random item from an array
		 */
		static randomFromArray(array: Array<any>) {
			return array[Math.floor(Math.random() * array.length)];
		}

		/**
		 * removes an item from an array
		 */
		static removeFromArray(array: Array<any>, item: any) {
			for (let i = 0; i < array.length; i++) {
				if (item === array[i]) {
					array.splice(i, 1);
				}
			}
		}

		/**
		 * Returns a random number between min and max values
		 */
		static randomNumber(max: number, min = 0) {
			return Math.floor((Math.random() * max) + min);
		}


	}
}