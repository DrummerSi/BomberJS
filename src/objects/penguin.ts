module Bomberman {

	/*************************************************************
	 * Penguins - As seen on the SNOW stage
	 *************************************************************/

	export class Penguin {

		private game: Phaser.Game;
		private battle: Battle;

		public bmp: Phaser.Sprite;


		constructor(battle: Battle, x: number, y: number, anim: string) {

			this.battle = battle;
			this.game = battle.game;

			this.bmp = new Phaser.Sprite(this.game, x * cfg.tile.size + cfg.tile.size / 3, y * cfg.tile.size, "penguins");

			this.bmp.animations.add("right", [9, 10]);
			this.bmp.animations.add("up", [13, 14]);
			this.bmp.animations.add("down", [0, 1]);
			this.bmp.animations.add("dance", [0, 1, 0, 1, 2, 0, 3, 0, 4, 5, 6, 7, 8, 0, 1, 0, 1, 0, 1, 0, 1]);

			this.bmp.animations.play(anim, 5, true);

		}


	}

}