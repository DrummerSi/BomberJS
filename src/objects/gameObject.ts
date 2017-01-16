module Bomberman {

	export class GameObject {

		public game: Phaser.Game;
        public battle: Battle;
        public location: Point;

		public bmp: Phaser.Sprite;

		constructor(battle: Battle, location: Point) {
			this.battle = battle;
			this.game = battle.game;
			this.location = location;
		}

		/**
		 * Returns the collision area for the entity
		 */
		public getCollision() {
			return new Phaser.Rectangle(
				(this.location.x * cfg.tile.size),
				(this.location.y * cfg.tile.size),
				64, 64);
		}

	}

}