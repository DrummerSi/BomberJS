/// <reference path="gameObject.ts" />

module Bomberman {

	export class Fire extends GameObject {


		private bomb: Bomb;
		public locations: Point[];
		private bmps: Phaser.Sprite[];


		constructor(battle: Battle, bomb: Bomb, locations: Array<Point>) {
			super(battle, bomb.location);

			this.bomb = bomb;				//The triggering bomb
			this.locations = locations;		//Affected locations

			this.bmps = [];
			this.createFirePositions();
		}


		private createFirePositions() {

			for (let location of this.locations) {

				//Check if we need to destroy the tile below the fire
				const tileType = this.battle.getTileType(location);

				//If we're a SOFT block, destroy it, but don't render flames over it
				if (tileType === TileType.Soft) {
					//Explode soft targets
					const tile = this.battle.getTile(location);
					//tile.remove();
					tile.delete();
				} else {

					//If a bonus is in this square, destory it
					let item = this.battle.getItem(location);
					if (item) {
						//item.explode();
					}

					const bmp = new Phaser.Sprite(this.game, location.x * cfg.tile.size, location.y * cfg.tile.size, "bomb");
					this.bmps.push(bmp);

					//Center of fire
					bmp.animations.add("center", [4, 5, 6, 7]);

					//Vertical fire
					bmp.animations.add("h", [8, 9, 10, 11]);
					bmp.animations.add("h-left", [12, 13, 14, 15]);
					bmp.animations.add("h-right", [16, 17, 18, 19]);

					bmp.animations.add("v", [20, 21, 22, 23]);
					bmp.animations.add("v-up", [24, 25, 26, 27]);
					bmp.animations.add("v-down", [28, 29, 30, 31]);

					//Calulate which fire animation this cell requires
					let dir, anim = "";

					let bomb = this.battle.getBomb(location);

					if (bomb) {
						anim = "center";
						bomb.remove();

						//Hide the bomb and allow the user to replant it
						bomb.bmp.visible = false;
						if (this.bomb.owner) {
							Utils.removeFromArray(this.bomb.owner.bombs, this.bomb);
						}
		
					} else {

						let isHorizontal = false;
						let isVertical = false;

						const leftFire = _.find(this.locations, { x: location.x - 1, y: location.y });
						const rightFire = _.find(this.locations, { x: location.x + 1, y: location.y });
						const upFire = _.find(this.locations, { x: location.x, y: location.y - 1 });
						const downFire = _.find(this.locations, { x: location.x, y: location.y + 1 });

						if (leftFire || rightFire) {
							//We're going horizontally
							isHorizontal = true;
							anim = "h";
						}
						if (upFire || downFire) {
							//We're going vertically
							isVertical = true;
							anim = "v";
						}

						if (isHorizontal && isVertical) {
							anim = "center";
						} else {

							if (isHorizontal) {
								if (!leftFire) {
									anim = "h-left";
								} else if (!rightFire) {
									anim = "h-right";
								}
							}

							if (isVertical) {
								if (!upFire) {
									anim = "v-up";
								} else if (!downFire) {
									anim = "v-down";
								}
							}
						}


					}


					//Play the animation
					bmp.events.onAnimationComplete.add(this.remove, this, 0, { bmp: bmp });
					bmp.animations.play(anim, 10);
					//bmp.animations.play(anim, 2);

					const pixels = Utils.convertToBitmapPosition(location);
					bmp.x = pixels.x;
					bmp.y = pixels.y;

					this.battle.gameView.addChild(bmp);


				}

			}

		} //End: createFirePositions


		/**
		 * Removes the fire graphic after the explosion has finished
		 */
		private remove(bmp: Phaser.Sprite) {

			//Remove the fire
			this.battle.gameView.removeChild(bmp);
			Utils.removeFromArray(this.bmps, bmp);

			if (this.bmps.length === 0) {
				//All fires have died out
				Utils.removeFromArray(this.battle.fires, this);
			}

		}



	}

}