module Bomberman {

	/*************************************************************
	 * Entity class which all other entities are derived from
	 *************************************************************/

	export class Entity {

		public game: Phaser.Game;
        public battle: Battle;
        public location: Point;

		public entityType: EntityType;

		public bombs: Bomb[];
		public escapeBomb: Bomb;		//Bomb that an entity can escape from (If it's just been placed)
		
		public container: Phaser.Group;
        public bmp: Phaser.Sprite;

		protected alive: boolean;				//Is the entity alive?
		protected dying: boolean;				//is the entity dying?
		protected isMoving: boolean;			//Is the entity moving?

		protected speed: number;				//Movement speed (pixels per second)
		protected lives: number

		protected bombQuantity: number;			//Bombs that the entity can spawn
		protected bombStrength: number;			//Range of bomb explosions

		protected move: Move;					//Movement this entity wishes to make
		protected action: Action;				//Action this entity wishes to perform
		protected direction: Direction;			//Direction that this entity is facing

		protected fireProof: boolean;			//Is the entity fireProof
		protected fireProofTime: number;		//Time left on fireproof buff

		protected statusTimer: Phaser.Timer;	//Timer to flashes entity to show they're fireproof or infected

		protected canUseItems: boolean;			//Can this entity pickup and use items?
		protected items: Item[];				//An array of items the entity has acquired

		//Sounds
		protected bombSound: Phaser.Sound;
		protected itemSound: Phaser.Sound;


		constructor(battle: Battle, location: Point) {
			this.battle = battle;
			this.game = battle.game;
			this.location = location;

			this.alive = true;
			this.dying = false;

			//When we spawn an entity, we need to make sure there's enough room around them to not die instantly.
			this.clearStartArea();

			this.bombs = []; //Reset bombs
			this.bombQuantity = 0;
			this.bombStrength = 0;

			//Sounds
			this.bombSound = this.game.add.audio("bomb", .8);
			this.itemSound = this.game.add.audio("item", .3);

			this.action = Action.None;
			this.canUseItems = false;
			this.items = [];

			this.speed = 300;
			this.lives = 1;

			this.statusTimer = this.game.time.create(false);

			this.setFireProof(4);
		}

		/**
		 * Per tick update function
		 * Should generally be overridden with custom update for each type of entity
		 */
		public update(delta: number): void {
			if (!this.alive) {
				return;
			}
		}

		/**
		 * Returns TRUE if the entity is alive
		 */
		public isAlive() {
			return this.alive;
		}

		/**
		 * Returns TRUE if the entity is dying
		 */
		public isDying() {
			return this.dying;
		}

		/**
		 * Returns the collision area for the entity
		 */
		public getCollision() {
			return new Phaser.Rectangle(
				(this.container.x),
				(this.container.y),
				64, 64);
		}

		/**
		 * Returns TRUE if entity can move in specified direction without being blocked
		 */
		public canMove(dir: Direction, location = this.location) {

			let dirX = 0, dirY = 0;
			if (dir === Direction.Right) {
				dirX = 1;
			} else if (dir === Direction.Left) {
				dirX = -1;
			} else if (dir === Direction.Down) {
				dirY = 1;
			} else if (dir === Direction.Up) {
				dirY = -1;
			}

			const pos = new Point(location.x + dirX, location.y + dirY);
			if (this.battle.getTileType(pos) === TileType.Base && !this.battle.getBomb(pos)) {
				return true
			}
			return false;
		}

		/**
		 * Returns an array of possible moves an entity can make
		 */
		public possibleMoves(location = this.location) : Direction[] {

			var output: Direction[] = [];

			if (this.canMove(Direction.Up   , location))   { output.push(Direction.Up) };
			if (this.canMove(Direction.Down , location))   { output.push(Direction.Down) };
			if (this.canMove(Direction.Left , location))   { output.push(Direction.Left) };
			if (this.canMove(Direction.Right, location))   { output.push(Direction.Right) };

			return output;
		}


		/**
		 * Return the animation spped for the walk speed
		 */
		protected animWalkSpeed() {
			//TODO: This needs to finalised
			return (this.speed / 100) * 4.5;
		}

		/**
		 * Returns TRUE if we detect that this entity should die
		 * > Collision with bomb flames, falling blocks, explosions, etc
		 */
		protected detectDeath() {

			//Detect flame death
			for (let fire of this.battle.fires) {
				for (let location of fire.locations) {
					if (location.equalTo(this.location)){
						return true;
					}
				}
			}

			//Detect areas where entity shouldn't be
			let base = this.battle.getBaseTile(this.location);
			if (!base) {
				//If there's no floor, we die
				return true;
			}

			let tile = this.battle.getTile(this.location);
			if (tile) {
				if (tile.type === TileType.Hard) {
					//If a solid block is here, we die
					return true;
				}
			}

			//If we're a player or bot, and we TOUCH a monster.. we die
			if (this.entityType === EntityType.Local ||
			this.entityType === EntityType.Bot ||
			this.entityType === EntityType.Remote) {
				let monster = this.battle.getMonster(this.location);
				if (monster && monster.isAlive() && !monster.isDying()) {
					return true;
				}
			}

			return false;

		}

		/**
         * Updates the players grid location based on the container coordinates
         */
		protected updateLocation() {
			this.location = Utils.convertToEntityPosition(new Point(this.container.x, this.container.y));
        }

		/**
		 * Detects if an entity has moved (or is about to move) to a tile containing a bomb
		 * Allows walking over a recently placed bomb
		 */
		protected detectBombCollision(pixels: Point) {

			//Tweak collision rectangle to avoid interference
			let entity = new Phaser.Rectangle(pixels.x + 2, pixels.y + 2, cfg.tile.size - 3, cfg.tile.size - 3);

			for (let bomb of this.battle.bombs) {
				if (Phaser.Rectangle.intersects(entity, bomb.getCollision())) {
					if (bomb === this.escapeBomb) {
						return false;
					}
					return true;
				}
			}

			if (this.escapeBomb) {
				this.escapeBomb = null;
			}
			return false;

		}

		/**
		 * Detects if an entity has moveed (or is about to move) to a tile containing a wall
		 */
		protected detectWallCollision(position: Point) {

			//Tweak collision rectangle to avoid interference
			let entity = new Phaser.Rectangle(position.x + 2, position.y + 2, cfg.tile.size - 3, cfg.tile.size - 3);

			for (let tile of this.battle.blockTiles) {
				if (Phaser.Rectangle.intersects(entity, tile.getCollision())) {
					return true;
				}
			}
			return false;
		}

		/**
		 * Checks if this entity is on the same tile as a pickup item
		 */
		protected detectItemCollision() {
			if (this.canUseItems) {
				const item = this.battle.getItem(this.location);
				if (item) {
					this.applyItem(item);
					this.items.push(item);
					item.remove();
				}
			}
		}

		/**
		 * Redistributes the players items to random locations on the map
		 */
		protected redistributeItems() {
			if (this.canUseItems) {
				let freeTilePositions = this.battle.getOpenTiles();

				for (let item of this.items) {
					//Select a random position
					let randPos = Utils.randomFromArray(freeTilePositions);
					Utils.removeFromArray(freeTilePositions, randPos);

					const newItem = new Item(this.battle, randPos, item.type);
					newItem.show();
					this.battle.itemTiles.push(newItem);
				}

			}
		}

		/**
		 * Applies the specified item to the current entity
		 */
		private applyItem(item: Item) {
			Utils.playSound(this.itemSound);

			switch (item.type) {
				case ItemType.BombUp:
					if (this.bombQuantity < cfg.max.bombs) {
						this.bombQuantity++;
					}
					break;

				case ItemType.FireUp:
					if (this.bombStrength < cfg.max.strength) {
						this.bombStrength++;
					}
					break;
			}
		}

		/**
		 * Sets a fireproof buff for x seconds
		 */
		private setFireProof(seconds: number) {
			this.fireProof = true;
			this.fireProofTime = seconds;

			this.statusTimer.loop(320, this.flashEntity, this);
			this.statusTimer.start();
		}

		/**
		 * Flashes the entity a certain colour
		 */
		private flashEntity() {

			/*if (this.fireProof) {
				if (this.bmp.tint !== 0xffffff) {
					this.bmp.tint = 0xffffff;
				} else {
					this.bmp.tint = Math.random() * 0xffffff;
				}
			}	*/

			/*let mask = this.game.add.graphics(this.container.x, this.container.y);
			mask.beginFill(0x000000);
			mask.drawRect(0,0, cfg.tile.size, cfg.tile.size);
			this.bmp.mask = mask;*/

			//let bmd = this.game.make.bitmapData(this.bmp.width, this.bmp.height);

			
			//bmd.alphaMask(this.bmp, this.bmp);
			//this.bmp.loadTexture(bmd);

			//PIXI.CanvasTinter.tintWithPerPixel(this.bmp.texture, 0xffffff, document.getElementsByTagName("canvas")[0]);

			//this.bmp.loadTexture(this.createColorImage(this.game, this.bmp, "#ffffff"));
				

		}

		public createColorImage(_game: Phaser.Game, source: Phaser.Image, color: string = "#ffffff"): Phaser.BitmapData { // Phaser.Image {
			console.log("CALLED");
			var anchorX: number = source.anchor.x;
			var anchorY: number = source.anchor.y;
			source.anchor.set(0, 0);
			var bmd: Phaser.BitmapData = this.createRectTexture(_game, source.width, source.height, color);
			bmd.blendDestinationAtop();
			bmd.draw(source, 0, 0, source.width, source.height);
			source.anchor.set(anchorX, anchorY);
			//return _game.make.image(0, 0, bmd);
			return bmd;
		}

		public createRectTexture(_game: Phaser.Game, width: number, height: number, colorHex: string = "#000000", cacheKey?: string): Phaser.BitmapData {
			var color: any = Phaser.Color.hexToColor(colorHex);
			var addToCache: boolean = !!cacheKey;
			var texture: Phaser.BitmapData = _game.add.bitmapData(width, height, cacheKey, addToCache);
			texture.fill(color.r, color.g, color.b);
			return texture;
		}

		/**
		 * Clears the start area around current entity
		 */
		private clearStartArea() {

			if (this.battle.getTile(this.location)) {
				this.battle.getTile(this.location).delete();
			}

			for (let i = 0; i < 4; i++) {
				let dirX = 0, dirY = 0;
				if (i === 0) {
					dirX = 1;
				} else if (i === 1) {
					dirX = -1;
				} else if (i === 2) {
					dirY = 1;
				} else if (i === 3) {
					dirY = -1;
				}

				let position = new Point(this.location.x + dirX, this.location.y + dirY);
				let type = this.battle.getTileType(position);
				if (type === TileType.Soft) {
					let tile = this.battle.getTile(position);
					tile.delete();
				}

			}

		} // END: clearStartArea



		/**
		 * Check if the entity wishes to drop a bomb
		 */
		private checkBombDrop() {
			if (this.action === Action.Bomb) {
				this.action = Action.None;

				//If we're still in the area of a bomb, don't allow dropping another!
				if (this.escapeBomb) {
					return;
				}

				for (let bomb of this.battle.bombs) {
					if (this.location.equalTo(bomb.location)) {
						return;
					}
				}

				//Calculate how many bombs the entity has placed that hasn't exploded yet
				let unexplodedBombs = 0;
				for (let bomb of this.bombs) {
					if (!bomb.exploded) {
						unexplodedBombs++;
					}
				}

				if (unexplodedBombs < this.bombQuantity) {
					const bomb = new Bomb(this.battle, this.location, this, this.bombStrength);
					this.battle.gameView.addChild(bomb.bmp);
					this.bombs.push(bomb);
					this.battle.bombs.push(bomb);
					Utils.playSound(this.bombSound);

				}

			}
		}


		/**
		 * Checks wether an entity is on a corner. Return the position where we should move BEFORE we can go where the player wants
		 */
		protected getCornerFix(dirX: number, dirY: number, delta: number): Point {

			const edgeSize = 48;

			//Fix position of where we should go first
			let location = new Point();

			//Possible fix positions to choose from
			const pos1 = new Point(this.location.x + dirY, this.location.y + dirX);
			const bmp1 = Utils.convertToBitmapPosition(pos1);

			const pos2 = new Point(this.location.x - dirY, this.location.y - dirX);
			const bmp2 = Utils.convertToBitmapPosition(pos2);

			//In front of current position
			if (this.battle.getTileType(new Point(this.location.x + dirX, this.location.y + dirY)) === TileType.Base) {
				location = this.location;
			}

			//right bottom
			//left top
			else if (this.battle.getTileType(pos1) === TileType.Base
				&& Math.abs(this.container.y - bmp1.y) < edgeSize && Math.abs(this.container.x - bmp1.x) < edgeSize) {
				if (this.battle.getTileType(new Point(pos1.x + dirX, pos1.y + dirY)) === TileType.Base) {
					location = pos1;
				}
			}

			//right top
			//left bottom
			else if (this.battle.getTileType(pos2) === TileType.Base
				&& Math.abs(this.container.y - bmp2.y) < edgeSize && Math.abs(this.container.x - bmp2.x) < edgeSize) {
				if (this.battle.getTileType(new Point(pos2.x + dirX, pos2.y + dirY)) === TileType.Base) {
					location = pos2;
				}
			}

			if (location.x && this.battle.getTileType(location) === TileType.Base) {
				return Utils.convertToBitmapPosition(location);
			}

		} //End: getCornerFix


		/**
		 * Functions to be over written
		 */

		public die(): void {
			const self = this;

			this.lives--;

			if (this.lives === 0) {

				this.dying = true;
				this.alive = false;

				this.bmp.animations.play("die", 10, false, true);
				this.bmp.animations.currentAnim.onComplete.add(function () {
					self.dying = false;
					console.log("DEAD");
				});

			} else {
				//We still have lives left... Give temporary protection
				this.setFireProof(3);
			}
		}

		protected processMovement(movement: Move, delta: number): void {
			console.log("ERROR: Method should be over written")
		}


		/**
		 * Functions that COULD be overwritten
		 */

		protected processAction(): void {
			this.checkBombDrop();
		}

	}

}