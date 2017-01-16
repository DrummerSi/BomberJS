/// <reference path="entity.ts" />

module Bomberman {

	/*************************************************************
	 * AI Bot class
	 *************************************************************/

	export class Bot extends Entity {

		private playerColour = PlayerColour.White;
		private name: string;


		constructor(battle: Battle, location: Point, colour: PlayerColour) {
			super(battle, location);

			this.playerColour = colour;
			this.entityType = EntityType.Local;

			this.bmp = new Phaser.Sprite(this.game, -16, -28, "player");

			this.bmp.animations.add("down", [1, 0, 2, 0].multiplyByPlayer(this.playerColour));
            this.bmp.animations.add("right", [4, 3, 5, 3].multiplyByPlayer(this.playerColour));
            this.bmp.animations.add("left", [7, 6, 8, 6].multiplyByPlayer(this.playerColour));
            this.bmp.animations.add("up", [10, 9, 11, 9].multiplyByPlayer(this.playerColour));

			this.bmp.animations.add("down-idle", [0].multiplyByPlayer(this.playerColour));
            this.bmp.animations.add("right-idle", [3].multiplyByPlayer(this.playerColour));
            this.bmp.animations.add("left-idle", [6].multiplyByPlayer(this.playerColour));
            this.bmp.animations.add("up-idle", [9].multiplyByPlayer(this.playerColour));

			this.bmp.animations.add("die", [12, 13, 14, 15, 16, 17, 18, 19, 20].multiplyByPlayer(this.playerColour));

            this.bmp.animations.play("down-idle", this.animWalkSpeed(), true);
            let position = Utils.convertToBitmapPosition(location);


			//Create the group
            this.container = this.game.add.group();
            this.container.name = "Player";
            this.container.x = position.x;
            this.container.y = position.y;
            this.container.addChild(this.bmp);

			this.updateLocation();

			this.bombs = []; //Reset bombs


		}

		/**
		 * Set's the name of the current player
		 */
		public setName(name: string) {
			this.name = name;
		}


	}

}