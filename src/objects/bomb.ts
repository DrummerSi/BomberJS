/// <reference path="gameObject.ts" />

module Bomberman {

	export class Bomb extends GameObject {

		public owner: Entity;
		public strength: number;

		
		public exploded = false;		//has the bomb exploded
		public fuseTime = 3;			//Timer, in seconds
		private explodeTime: number;	//The exact time that this bomb should explode

		private explosionSound: Phaser.Sound;


		constructor(battle: Battle, location: Point, owner: Entity, strength: number, explodeTime?: number ) {
			super(battle, location);
			this.owner = owner;

			this.strength = strength;

			this.bmp = new Phaser.Sprite(this.game, location.x * cfg.tile.size, location.y * cfg.tile.size, "bomb");
			this.bmp.animations.add("bomb", [0, 1, 2, 3]);

			this.bmp.animations.play("bomb", 5, true);
			const pixels = Utils.convertToBitmapPosition(location);
			this.bmp.x = pixels.x;
			this.bmp.y = pixels.y;

			//Allow all entities currenty on the bomb, to escape
			for (let entity of this.battle.entities) {
				if (this.location.equalTo(entity.location)) {
					entity.escapeBomb = this;
				}
			}

			//Sounds
			this.explosionSound = this.game.add.audio("explosion", .4);

			//Set when this bomb should explode (in  milliseconds)
			this.explodeTime = (typeof explodeTime !== "undefined") ? explodeTime : Date.now() + (this.fuseTime * 1000);

		}


		public update() {
			if (this.exploded) {
				return;
			}

			if (Date.now() > this.explodeTime) {
				this.explode();
			}
		}

		/**
		 * Remove the bomb from the game
		 */
		public remove() {
			this.battle.gameView.remove(this.bmp);
			if (this.owner) { Utils.removeFromArray(this.owner.bombs, this); }
			Utils.removeFromArray(this.battle.bombs, this);
		}


		/**
		 * Makes this bomb explode!
		 */
		public explode() {
			this.exploded = true;

			//Grab a list of unique danger positions and render flames
			const positions = _.uniqWith(this.getDangerPositions(), _.isEqual);
			this.battle.fires.push(new Fire(this.battle, this, positions));
		}



		/**
		 * Returns an array of positions which will be affected by this bomb
		 */
		public getDangerPositions(checkedBombs:Point[] = []): Point[] {

			const locations:Array <Point> = new Array();
			locations.push(this.location);
			checkedBombs.push(this.location);

			//Check each direction
			for (let i = 0; i < 4; i++) {
				let dirX = 0, dirY = 0;
				if (i === 0) {
					dirX = 1;
				} else if (i === 1) {
					dirX = -1;
				} else if (i === 2) {
					dirY = 1;
				} else if (i === 3) {
					dirY = -1;
				}

				for (let j = 1; j <= this.strength; j++) {
					let explode = true;
					let last = false;

					const position = new Point(this.location.x + j * dirX, this.location.y + j * dirY);
					const type = this.battle.getTileType(position);

					if (type === TileType.Hard) {
						explode = false;
						last = true;
					} else if (type === TileType.Soft) {
						explode = true;
						last = true;
					}

					if (explode) {
						locations.push(position);

						//Check if a bomb is at this location, and if so, return the danger positions of that bomb
						const bomb = this.battle.getBomb(position)
						if (bomb) {
							//If we haven't already checked this bomb, check it
							if (!_.some(checkedBombs, bomb.location)) {
								bomb.getDangerPositions(checkedBombs).forEach(pos => {
									locations.push(pos);
								});
							}
						}
					} //End: explode

					if (last) {
						break;
					}

				}

			}

			return locations;

		}



	}

}