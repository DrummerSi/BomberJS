/// <reference path="../utils/point.ts" />

module Bomberman {

	/*************************************************************
	 * Tile class - Base, soft and hard tiles are all defined here
	 *************************************************************/

	export class Tile {

		private game: Phaser.Game;
		private battle: Battle;

		public name: string;
		public type: TileType;
		public location: Point;

		public bmp: Phaser.Sprite;
		public shadow: Phaser.Sprite;

		private nearSoftWalls: number;
		private deadEnd: number;		//Dead end number: Unique or -1, -2
		private deadEndExit: Tile;		//Tile we can move to in order to escape the deadEnd


		constructor(battle: Battle, name: string, type: TileType, location: Point) {
			this.battle   = battle;
			this.game     = battle.game;
			this.name     = name;
			this.type     = type;
			this.location = location;

			//mapNo is used to offset the sprites, so the correct one is used by the game
			const mapNo = this.battle.map.getMapName();

			//Define the graphic
			this.bmp = new Phaser.Sprite(this.game, location.x * cfg.tile.size, location.y * cfg.tile.size, "tiles");

			this.bmp.animations.add("base1", [0].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("base2", [1].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("base3", [2].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("base4", [3].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("base5", [4].multiplyBy(mapNo, cfg.tile.tilesPerLine));

			this.bmp.animations.add("hard1", [5].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("hard2", [6].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("hard3", [17].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("hard4", [18].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("hard5", [19].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("hard6", [20].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("hard7", [21].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("hard8", [22].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("invisible", [7].multiplyBy(mapNo, cfg.tile.tilesPerLine));

			this.bmp.animations.add("soft", [8].multiplyBy(mapNo, cfg.tile.tilesPerLine));
			this.bmp.animations.add("explode", [9, 10, 11, 12, 13, 14, 15, 16].multiplyBy(mapNo, cfg.tile.tilesPerLine));

			this.bmp.events.onAnimationComplete.add(this.animationEnd, this);
            this.bmp.animations.play(name);

			//Add shadow
			this.shadow = new Phaser.Sprite(this.game, location.x * cfg.tile.size + 10, location.y * cfg.tile.size + 10, "tiles");
            this.shadow.animations.add("hard1", [5].multiplyBy(mapNo, cfg.tile.tilesPerLine));
            this.shadow.animations.play("hard1");
            this.shadow.tint = 0x000000;
			this.shadow.alpha = this.battle.map.shadowIntensity;



		}


		/**
		 * Quickly remove the tile from play
		 */
		public delete() {
			this.battle.gameView.remove(this.bmp);
			Utils.removeFromArray(this.battle.blockTiles, this);
		}

		/**
		 * Removes the block via an explosion
		 */
		public explode() {
			this.bmp.animations.play("explode", 20);

			//Check if an item is in this location... if so, render it
			const item = this.battle.getItem(this.location);
			if (item) {
				//item.spawn();
			}
		}


		/**
		 * Blows up the current block and add a HARD block in it's place -- used at the end of the game
		 */
		public closeIn() {

			//Remove blocked items
			let item = this.battle.getItem(this.location);
			if (item) {
				//item.remove();
			}

			//Remove entities
			let entities = this.battle.getEntities(this.location);
			for (let entity of entities){
				entity.die();
			}

			//Remove existing block
			let tile = this.battle.getTile(this.location);
			if (tile) {
				tile.delete();
			}

			return this;
		}

		/**
		 * Returns the collision area for the tile
		 */
		public getCollision() {
			return new Phaser.Rectangle(
				(this.location.x * cfg.tile.size),
				(this.location.y * cfg.tile.size),
				64, 64);
		}

		/**
		 * Returns TRUE if this tile is blocked (I.E. Has a wall on it), else FALSE
		 */
		public isBlocked() {
			var type = this.battle.getTileType(this.location);
			if (type !== TileType.Base) {
				return true;
			} else {
				return false;
			}
		}

		/**
		 * Returns TRUE if this tile contains a bomb
		 */
		public isBomb() {
			let bomb = this.battle.getBomb(this.location);
			if (bomb) {
				return true;
			} else {
				return false;
			}
		}

		/**
		 * Returns tile above
		 */
		public tileUp(): Tile {
			return this.battle.getBaseTile(new Point(this.location.x, this.location.y - 1));
		}

		/**
		 * Returns tile below
		 */
		public tileDown(): Tile {
			return this.battle.getBaseTile(new Point(this.location.x, this.location.y + 1));
		}

		/**
		 * Returns tile to left
		 */
		public tileLeft(): Tile {
			return this.battle.getBaseTile(new Point(this.location.x - 1, this.location.y));
		}

		/**
		 * Returns tile to right
		 */
		public tileRight(): Tile {
			return this.battle.getBaseTile(new Point(this.location.x + 1, this.location.y));
		}

		/**
		 * Returns TRUE if this tile is on the outer edge of the arena
		 */
		public isOnOuterEdge():boolean {
			if (
				this.location.x === 0 || this.location.x === cfg.tile.width - 1 ||
				this.location.y === 0 || this.location.y === cfg.tile.height - 1
			){
				return true;
			}
			return false;
		}

		public setNearSoftWalls(val) {
			this.nearSoftWalls = val;
		}

		public getNearSoftWalls() {
			return this.nearSoftWalls;
		}

		public setDeadEnd(val) {
			this.deadEnd = val;
		}

		public getDeadEnd() {
			return this.deadEnd;
		}

		public setDeadEndExit(tile: Tile):void {
			this.deadEndExit = tile;
		}

		public getDeadEndExit(): Tile {
			return this.deadEndExit;
		}



		private animationEnd(sprite, animation) {
			if (animation.name === "explode") {
				//Explosion finished, remove the tile
				this.delete();
			}
		}


	}

}