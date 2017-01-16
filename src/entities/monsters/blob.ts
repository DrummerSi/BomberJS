module Bomberman {

	/*************************************************************
	 * Blob monster
	 *************************************************************/

	export class MonsterBlob extends Monster {

		constructor(battle: Battle, location: Point) {
			super(battle, location);
			this.monsterType = MonsterType.Blue;

			this.bmp = new Phaser.Sprite(this.game, 0, -16, "monster-blob");

			this.bmp.animations.add("down", [0, 1, 0, 2]);
			this.bmp.animations.add("right", [3, 4, 3, 5]);
			this.bmp.animations.add("left", [6, 7, 6, 8]);
			this.bmp.animations.add("up", [9, 10, 9, 11]);

			this.bmp.animations.add("down-idle", [0]);
			this.bmp.animations.add("right-idle", [3]);
			this.bmp.animations.add("left-idle", [6]);
			this.bmp.animations.add("up-idle", [9]);

			this.bmp.animations.add("die", [12, 13, 14, 15, 16, 17, 18, 19, 20]);

			this.bmp.animations.play(Utils.convertDirectionToString(this.direction) + "-idle", this.animWalkSpeed(), true);
			let position = Utils.convertToBitmapPosition(location);

			//Create the group
            this.container = this.game.add.group();
            this.container.name = "Blob";
            this.container.x = position.x;
            this.container.y = position.y;
            this.container.addChild(this.bmp);
			this.battle.entityView.addChild(this.container);

			this.lives = 1;
			this.speed = 300;
			this.stopTime = .6

			this.updateLocation();
			this.setupAI();

		}

		private setupAI() {
			//Any setup here

		}

		protected findGoal(): Point {

			if (this.canMove(this.direction)) {
				//Keep moving forwards
				return this.location.moveDirection(this.direction);

			} else {
				//We can't move forwards anymore... Turn round
				this.stop();
				var direction = Utils.oppositeDirection(this.direction);

				var possibleDirections = this.possibleMoves();
				var randomDirection = Utils.randomFromArray(possibleDirections);

				return this.location.moveDirection(randomDirection);
			}

		}

		protected calculateStopTime(): number {
			var rndTime = this.stopTime * 1000;
			return (Utils.randomNumber(rndTime) / 1000) + .1;
		}


	}

}