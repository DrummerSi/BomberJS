module Bomberman {

	/*************************************************************
	 * Blue monster
	 *************************************************************/

	export class MonsterBlue extends Monster {

		constructor(battle: Battle, location: Point) {
			super(battle, location);
			this.monsterType = MonsterType.Blue;

			this.bmp = new Phaser.Sprite(this.game, -32, -64, "monster-blue");

			this.bmp.animations.add("down", [0, 1, 2, 1]);
			this.bmp.animations.add("right", [3, 4, 5, 3]);
			this.bmp.animations.add("up", [6, 7, 8, 7]);
			this.bmp.animations.add("left", [9, 10, 11, 10]);

			this.bmp.animations.add("down-idle", [0]);
			this.bmp.animations.add("right-idle", [3]);
			this.bmp.animations.add("up-idle", [6]);
			this.bmp.animations.add("left-idle", [9]);

			this.bmp.animations.add("die", [12, 13, 14, 15, 16]);

			this.bmp.animations.play("down-idle", this.animWalkSpeed(), true);
			let position = Utils.convertToBitmapPosition(location);


			//Create the group
            this.container = this.game.add.group();
            this.container.name = "Blue";
            this.container.x = position.x;
            this.container.y = position.y;
            this.container.addChild(this.bmp);
			this.battle.entityView.addChild(this.container);

			this.lives = 3;
			this.speed = 280;
			this.stopTime = .4

			this.updateLocation();
			this.setupAI();

		}


		/**
		 * Sets up everything needed for the basic monster AI and finds the first goal
		 */
		public setupAI() {

			/**
			if (this.canMove(Direction.Up)) {
				this.endGoal = this.findFurthestPointToMove(Direction.Up);

			} else if (this.canMove(Direction.Down)) {
				this.endGoal = this.findFurthestPointToMove(Direction.Down);

			} else if (this.canMove(Direction.Left)) {
				this.endGoal = this.findFurthestPointToMove(Direction.Left);

			} else if (this.canMove(Direction.Right)) {
				this.endGoal = this.findFurthestPointToMove(Direction.Right);
			}*/

		}


		protected findGoal(): Point {

			var possibleDirections = this.possibleMoves();
			let direction = this.direction;

			if (this.canMove(this.direction)) {

				if (possibleDirections.length > 2) {
					//There's a 20% chance the blue thing may change direction mid walk
					if (Utils.randomNumber(100) > 80) {
						this.stop();
						
						while (direction === this.direction || direction === Utils.oppositeDirection(this.direction)) {
							direction = Utils.randomFromArray(possibleDirections);
						}
					}
				}

				//Move to the corresponding direction
				return this.location.moveDirection(direction);

			} else {
				//We can't move forwards anymore... Turn round
				this.stop();
				let direction = Utils.oppositeDirection(this.direction);

				var randomDirection = Utils.randomFromArray(possibleDirections);

				return this.location.moveDirection(randomDirection);
			}

		}

		//Returns 0 - 0.4
		protected calculateStopTime(): number {
			var rndTime = this.stopTime * 1000;
			return (Utils.randomNumber(rndTime) / 1000);
		}



	}

}