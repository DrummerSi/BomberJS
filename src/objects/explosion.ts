/// <reference path="gameObject.ts" />

module Bomberman {

	/*************************************************************
	 * Renders explosion animation on specified tile
	 *************************************************************/

	export class Explosion extends GameObject {


		constructor(battle: Battle, location: Point) {
			super(battle, location);

			this.bmp = new Phaser.Sprite(this.game, 0, 0, "explosion");
			this.bmp.animations.add("explode", [0, 1, 2, 3, 4, 5, 6]);

			const pixels = Utils.convertToBitmapPosition(location);
			this.bmp.x = pixels.x - 20;
			this.bmp.y = pixels.y - 48;

			this.bmp.events.onAnimationComplete.add(this.remove, this);
			this.bmp.animations.play("explode", 10);
			this.battle.gameView.addChild(this.bmp);	

		}

		private remove() {
			this.battle.gameView.removeChild(this.bmp);
		}

	}

}