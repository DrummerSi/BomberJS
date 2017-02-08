/// <reference path="entity.ts" />

module Bomberman {

	/*************************************************************
	 * A playable player class - Local player on computer
	 *************************************************************/

	export class Player extends Entity {

		protected playerColour = PlayerColour.White;
		protected name: string;


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
			this.bombQuantity = 1;
			this.bombStrength = 2;

			this.canUseItems = true		

		}

		/**
		 * Per tick update function
		 */
		public update(delta: number) {

			if (!this.alive) {
				return;
			}

			//Detect movement
			let movement = Move.None;
			if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
				movement = Move.Up;
			} else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
				movement = Move.Down;
			} else if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
				movement = Move.Left;
			} else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
				movement = Move.Right;
			}

			if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
				this.action = Action.Bomb;
			};

			this.processMovement(movement, delta);
			this.processAction();

		}


		/**
		 * Set's the name of the current player
		 */
		public setName(name: string) {
			this.name = name;
		}


		/**
		 * Kills the player and redistributes their items
		 */
		public die(): void {
			super.die();			
			this.redistributeItems();
		}

		/**
		 * Returns the number of bombs left that a bomber casn plant
		 */
		public bombsLeft(): number {
			//Amount of bombs we have MINUS amount of bombs we've dropped on battlefield
			return this.bombQuantity - this.bombs.length;
		}
		

		/**
		 * Processes the movement of this entity
		 */
		protected processMovement(movement: Move, delta: number): void {

			//Backup original movement values
			let originalValues = {
				x: this.container.x,
				y: this.container.y,
				d: this.direction
			}

			let position = new Point(this.container.x, this.container.y);

			let dirX = 0;
			let dirY = 0;

			if (movement === Move.Up) {
                position.y -= this.speed * delta;
                dirY = -1;
                this.direction = Direction.Up;
                this.bmp.animations.play("up", this.animWalkSpeed(), true);

            } else if (movement === Move.Down) {
                position.y += this.speed * delta;
                dirY = 1;
                this.direction = Direction.Down;
                this.bmp.animations.play("down", this.animWalkSpeed(), true);

            } else if (movement === Move.Left) {
                position.x -= this.speed * delta;
                dirX = -1;
                this.direction = Direction.Left;
                this.bmp.animations.play("left", this.animWalkSpeed(), true);

            } else if (movement === Move.Right) {
                position.x += this.speed * delta;
                dirX = 1;
                this.direction = Direction.Right;
                this.bmp.animations.play("right", this.animWalkSpeed(), true);

			} else {
                //No key is pressed. 
                this.bmp.animations.play(Utils.convertDirectionToString(this.direction) + "-idle", this.animWalkSpeed(), true);
            }

			if (position.x !== this.container.x || position.y !== this.container.y) {
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
			}

			if (this.detectDeath()) {
				this.die();
			}

			this.detectItemCollision();

		} // END: processMovement
		

	}

}