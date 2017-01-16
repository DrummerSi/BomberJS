/// <reference path="gameObject.ts" />

module Bomberman {

	/*************************************************************
	 * Item class - All pickups, good and bad are handled here
	 *************************************************************/

	export class Item extends GameObject {

		public type: ItemType;
		private spawned: boolean;

		constructor(battle: Battle, location: Point, type: ItemType) {
			super(battle, location);

			this.bmp = new Phaser.Sprite(this.game, location.x * cfg.tile.size, location.y * cfg.tile.size, "bonuses");

			const pixels = Utils.convertToBitmapPosition(location);
			this.bmp.x = pixels.x;
			this.bmp.y = pixels.y;

			this.type = type;

			//Setup an animation based on the current BonusType
			let animFrames = this.generateAnimFrames(this.type);
			this.bmp.animations.add("special", animFrames);

			this.spawned = false;

		}

		/**
		 * Reveals the item on the map - A block probably just got destroyed
		 */
		public show() {

			//Play and select a frame	
			this.bmp.animations.play("special", 8, true);

			let startFrame;
			//startFrame = animFrames[Math.floor(Math.random() * animFrames.length)] //Random
			//startFrame = Math.floor(10 - new Point(0,0).radiusDistance(this.location) % 10); //Circular
			startFrame = Math.floor(10 - (this.location.x + this.location.y) % 10); //Linear
			this.bmp.animations.currentAnim.setFrame(startFrame, true);

			this.battle.gameView.addChild(this.bmp);
			this.spawned = true;
		}

		/**
		 * Returns TRUE if the item has been spawned
		 */
		public hasSpawned(): boolean {
			return this.spawned;
		}

		/**
		 * Removes the item via an explosion
		 */
		public explode() {
			new Explosion(this.battle, this.location);
			this.remove();
		}

		/**
		 * Removes the current item from the game
		 */
		public remove() {
			this.battle.gameView.remove(this.bmp);
			Utils.removeFromArray(this.battle.itemTiles, this);
		}



		/**
		 * Generates the correct animtion for the specified item
		 */
		private generateAnimFrames(animNumber: number) {
			let arr = [];
			for (let i = 0; i < 10; i++) {
				arr.push(i + (animNumber * 10));
			}
			return arr;
		}


	}

}