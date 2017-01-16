/// <reference path="entity.ts" />

module Bomberman {

	/*************************************************************
	 * Monster class that all monsters derive from
	 *************************************************************/

	export class Monster extends Entity {

		protected monsterType: MonsterType

		protected stopTimeLeft: number;		//How long left to wait
		protected moveTimeLeft: number;		//How long left to move

		protected goal: Point;				//Our goal

		protected stopTime: number;			//Maximum wait time of monster

		/*protected waitTime: number;				//Amount of time to wait while thinking about where to go next*/

		/*protected endGoal: Point;				//The ultimate goal of the monster
		protected goal: Point;					//Where does the monster want to move to next
		protected maxMovement: number;			//Max number of tiles a monster will move before needing to rethink it's path*/

		/*protected waitTimeLeft: number;			//Amount of time to wait until monster updates direction
		protected moveTimeLeft: number;			//Time it takes to walk from center of one tile to another*/

		constructor(battle: Battle, location: Point) {
			super(battle, location);
			this.entityType = EntityType.Monster


			this.stopTimeLeft = 0.3;
			this.moveTimeLeft = 0;

			this.stopTime = 2;

			this.setupInitialDirection();

			
			/*this.waitTime = 1;
			this.waitTimeLeft = 0;
			this.moveTimeLeft = 0;
			this.maxMovement = 10;*/
		}


		update(delta: number): void {

			//If monster is dead, don't update
			if (!this.isAlive()){
				return;
			}

			if (this.stopTimeLeft <= 0) {
				this.isMoving = true;

				if (this.moveTimeLeft <= 0) {
					this.goal = this.findGoal();
					this.setMovement();
				}


				this.processMovement(this.move, delta);
				this.processAction();
				this.moveTimeLeft -= delta;

			} else {
				this.processMovement(Move.None, delta);
				this.processAction();
				this.stopTimeLeft -= delta;
			}



		}

		/**
		 * Stops the monster from walking
		 */
		protected stop(): Monster {
			this.isMoving = false;
			this.stopTimeLeft = this.calculateStopTime();
			return this;
		}

		/**
		 * Kills the monster
		 */
		public die(): void {
			const self = this;
			console.log("die");

			this.dying = true;
			this.alive = false;


			//this.bmp.animations.currentAnim.stop();
			this.bmp.animations.play("die", 10, false, true);


			this.bmp.animations.currentAnim.onComplete.add(function () {
				self.dying = false;
				console.log("CONFIRMED KILL");
			});

			//this.bmp.animations.play("die", 10, true);

		}


		/**
		 * Returns the stop time for monster - May be overwritten by each monster to add randomness
		 */
		protected calculateStopTime(): number {
			return this.stopTime;
		}

		/**
		 * Returns the cell that the monster should move to next
		 * Should be overwritten for each monster
		 */
		protected findGoal(): Point {
			console.log("ERROR: Should be overwritten by Monster class")
			return;
		}

		/**
		 * Calculates a starting direction that allows the monster to move in the direction they're facing
		 */
		private setupInitialDirection(): void {
			this.direction = Direction.Left;
			return;

			//Grab a random starting direction
			/*while (true) {
				//Grab random direction
				let startingDirection = <Direction>Utils.randomNumber(4, 1);

				//Check if we can actually move in that direction
				if (this.canMove(startingDirection)) {
					//YES we can... We have our start direction
					this.direction = startingDirection;
					break;
				}

			}*/
		}

		/**
		 * Sets the movement command to get the monster from where they are, to their goal
		 */
		private setMovement():Monster {

			const diff = this.location.difference(this.goal);
			if (diff.x === -1) {
				this.move = Move.Left;
			} else if (diff.x === 1) {
				this.move = Move.Right;
			} else if (diff.y === -1) {
				this.move = Move.Up;
			} else if (diff.y === 1) {
				this.move = Move.Down;
			} else {
				this.move = Move.None;
			}

			this.moveTimeLeft = cfg.tile.size / this.speed;

			return this;
		}

		protected processMovement(movement: Move, delta: number) {

			if (!this.isAlive()) {
				return;
			}

			if (this.detectDeath()) {
				this.die();
				return;
			}

			if (!this.isMoving) {
				//Is we're not moving, play the idle animation
				this.bmp.animations.play(Utils.convertDirectionToString(this.direction) + "-idle", this.animWalkSpeed(), true);
				return
			}

			let originalValues = {
				x: this.container.x,
				y: this.container.y,
				d: this.direction
			}

			let position = new Point(this.container.x, this.container.y);

			let dirX = 0, dirY = 0;

			if (movement === Move.Up) {
                position.y -= this.speed * delta;
                dirY = -1;
                this.direction = Direction.Up;
                this.bmp.animations.play("up", this.animWalkSpeed(), true);
				this.isMoving = true;

            } else if (movement === Move.Down) {
                position.y += this.speed * delta;
                dirY = 1;
                this.direction = Direction.Down;
                this.bmp.animations.play("down", this.animWalkSpeed(), true);
				this.isMoving = true;

            } else if (movement === Move.Left) {
                position.x -= this.speed * delta;
                dirX = -1;
                this.direction = Direction.Left;
                this.bmp.animations.play("left", this.animWalkSpeed(), true);
				this.isMoving = true;

            } else if (movement === Move.Right) {
                position.x += this.speed * delta;
                dirX = 1;
                this.direction = Direction.Right;
                this.bmp.animations.play("right", this.animWalkSpeed(), true);
				this.isMoving = true;

			} else {
                //No movement
                this.bmp.animations.play(Utils.convertDirectionToString(this.direction) + "-idle", this.animWalkSpeed(), true);
				this.isMoving = false;
            }


			if (!this.detectBombCollision(position)) {
				if (this.detectWallCollision(position)) {

					//TODO: CornerFix system needs cleaning up
					let cornerFix = this.getCornerFix(dirX, dirY, delta);
					if (cornerFix) {

						let fixX = 0, fixY = 0;
						if (dirX) {
							fixY = (cornerFix.y - this.container.y) > 0 ? 1 : -1;
							this.bmp.animations.play(fixY === 1 ? "down" : "up", this.animWalkSpeed(), true);
						} else {
							fixX = (cornerFix.x - this.container.x) > 0 ? 1 : -1;
							this.bmp.animations.play(fixX === 1 ? "right" : "left", this.animWalkSpeed(), true);
						}

						//diffX & diffY calculate the difference in pixels from the bomberman to the nearest tile on the X and Y axis
						//The MAXIMUM a player can move when clipping the corner is this distance

						let diffX = this.container.x % cfg.tile.size;
						if (diffX > cfg.tile.size / 2) { diffX = cfg.tile.size - diffX; }

						let diffY = this.container.y % cfg.tile.size;
						if (diffY > cfg.tile.size / 2) { diffY = cfg.tile.size - diffY; }

						if (diffX < 0) {
							this.container.x += Math.max(fixX * this.speed * delta, diffX);
						} else {
							this.container.x += Math.min(fixX * this.speed * delta, diffX);
						}

						if (diffY < 0) {
							this.container.y += Math.max(fixY * this.speed * delta, diffY);
						} else {
							this.container.y += Math.min(fixY * this.speed * delta, diffY);
						}

						this.updateLocation();

					}

				} else {
					this.container.x = position.x;
					this.container.y = position.y;
					this.updateLocation();
				}
			}

			//this.container.x = Math.round(this.container.x);
			//this.container.y = Math.round(this.container.y);

		}



	}

}