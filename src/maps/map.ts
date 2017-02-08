module Bomberman {

	/*************************************************************
	 * Map class - All maps must extend from this base class
	 *************************************************************/

	export abstract class Map {

		protected game: Phaser.Game;
		protected battle: Battle;

		protected config: IBattleConfig;
		public shadowIntensity: number;	//How intense of overlay shadows?

		protected mapData: IMatchData;	//Data generate to display the initial map

		//Close in settings
		private closeInTimer: Phaser.Timer;
		private closeInPoint = new Point(1, 0);
		private closeInDirection = Direction.Down;

		//Initial items
		protected initialItems: InitialItem[]


		constructor(config?: IBattleConfig) {
			console.log(config);
			if (config) {
				this.config = config;
			}

			this.shadowIntensity = 0.2;
			this.mapData = <IMatchData>{
				base: [],
				blocks: [],
				items: [],
				players: [],
				bots: [],
				monsters: []
			}

			//Initial items to randomly plkace in map (May be overridden)
			this.initialItems = [
                { type: ItemType.BombUp, qty: 10 },
                { type: ItemType.FireUp, qty: 15 }
            ];

		}

		/**
		 * Functions to generate the starting data for each stage
		 */
		public generateStartData(player: IRoomPlayers): IMatchData {

			//Base and blocks
			this.generateStartTiles();

			//Monsters
			//this.generateStartMonsters();

			//Items
			this.generateStartItems();			
			return this.mapData;
		}

		/**
		 * Generate the initial starting tiles for the specified stage/ map
		 */
		protected generateStartTiles(): void {

			//Get the layout the the specified stage/ map
			const baseData = Utils.CSVToArray(this.getBaseFloor());			
			const blockData = Utils.CSVToArray(this.getBlocks());

			//Base tiles
			for (let row = 0; row < baseData.length; row++) {
				for (let col = 0; col < baseData[row].length; col++) {
					this.mapData.base.push({
						name: this.tileNumberToName(baseData[row][col]),
						type: TileType.Base,
						location: new Point(col, row)
					});
				}
			}

			//Block tiles
			for (let row = 0; row < blockData.length; row++) {
				for (let col = 0; col < blockData[row].length; col++) {
					if (blockData[row][col] !== -1){
						this.mapData.blocks.push({
							name: this.tileNumberToName(blockData[row][col]),
							type: this.tileNumberToType(blockData[row][col]),
							location: new Point(col, row)
						});
					}
				}
			}

		}

		/**
		 * Generates the initial items found inside blocks
		 */
		protected generateStartItems(): void {

			//Grab a list of soft tiles
            let tiles = _.filter(this.mapData.blocks, function (o) {
                return o.type === TileType.Soft
            });

			//Sort the tiles randomly
            tiles.sort(function () {
                return 0.5 - Math.random();
            });

			for (let item of this.initialItems) {
				for (let i = 0; i < item.qty; i++) {

					const tile = tiles[0];
					if (tile) {
						tiles.splice(0, 1);

						this.mapData.items.push({
							type: item.type,
							location: tile.location
						});
					}

				}
			}

		}

		/**
		 * Generates the initials monsters on the map
		 */
		protected generateStartingMonsters(): void {
			return;
		}


		/**
		 * Sets up the map ready for play - takes the config and expands it
		 */
		public setup(battle: Battle) {
			this.battle = battle;
			this.game = this.battle.game;

			//Parse incoming config data
			let data = <IMatchData>jsonpack.unpack(this.config.data);

			//Setup base tiles
			for (let base of data.base) {
				const tile = new Tile(this.battle, base.name, base.type, new Point(base.location.x, base.location.y));
				this.battle.baseTiles.push(tile);
				this.battle.baseView.add(tile.bmp);
			}

			//Setup blocks
			for (let block of data.blocks) {
				const tile = new Tile(this.battle, block.name, block.type, new Point(block.location.x, block.location.y));
				this.battle.blockTiles.push(tile);

				//Add a shadow for HARD blocks
				if (tile.type === TileType.Hard && tile.name !== "invisible") {
					this.battle.gameView.add(tile.shadow);
				}
				this.battle.gameView.add(tile.bmp);
			}

			//Setup items
			for (let item of data.items) {
				const newItem = new Item(this.battle, new Point(item.location.x, item.location.y), <ItemType>item.type);
				this.battle.itemTiles.push(newItem);
			}

			//For testing
			const newItem = new Item(this.battle, new Point(3, 1), ItemType.BombUp);
			this.battle.itemTiles.push(newItem);
			newItem.show();

			this.closeInTimer = this.game.time.create(false);

		}


		/**
		 * Returns the current map/ stage name
		 */
		public getMapName(): Stage {
			return this.config.stage;
		}

		/**
		 * Return the start point of a player number
		 */
		public playerPosition(playerNumber: number) {
            if (playerNumber === 1) {
                return new Point(1, 1);

            } else if (playerNumber === 2) {
                return new Point(17, 11);

            } else if (playerNumber === 3) {
                return new Point(17, 1);

            } else if (playerNumber === 4) {
                return new Point(1, 11);

            }
        }

		/**
		 * Starts the maps "CLOSE IN" procedure
		 */
		public initCloseIn() {
			//Start tiles closing in
			this.closeInTimer.loop(320, this.triggerCloseIn, this);
			this.closeInTimer.start();
		}

		/**
		 * Cancels the "CLOSE IN" procedure
		 */
		public cancelCloseIn() {
			this.closeInTimer.stop();
		}




		/**
		 * Default stage layout for base floor
		 */
		protected getBaseFloor(): string {
			return `0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7
					0,1,2,3,2,3,2,3,2,3,2,3,2,3,2,3,4,0,7
					0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7
					0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7
					0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7
					0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7
					0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7
					0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7
					0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7
					0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7
					0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1-,7
					0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7
					0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7`;
		}


		/**
		 * Default stage layout for blocks
		 */
		protected getBlocks(): string {
			return `7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7
					7,-1,-1,-1,-1,-1,-1,-1, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 7
					7,-1, 5,-1, 5,-1, 5,-1, 5, 8, 5, 8, 5, 8, 5, 8, 5, 8, 7
					7,-1,-1,-1,-1,-1,-1,-1, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 7
					7,-1, 5, 8, 5,-1, 7, 7, 7, 8, 5, 8, 5, 8, 7,-1, 7, 8, 7
					7,-1, 8, 8, 8,-1, 7, 7, 7, 8, 8, 8, 8, 8,-1,-1,-1, 8, 7
					7, 8, 5, 8, 5,-1, 7, 7, 7, 8, 5, 8, 5, 8, 7,-1, 7, 8, 7
					7, 8, 8, 8, 8,-1,-1,-1,-1,-1, 8, 8, 8, 8, 8, 8, 8, 8, 7
					7, 8, 5, 8, 5, 8, 5, 8, 5,-1, 5, 8, 5, 8, 5, 8, 5, 8, 7
					7, 8, 8, 8, 8, 8, 8, 8, 8,-1, 8,-1,-1,-1, 8, 8, 8, 8, 7
					7, 8, 5, 8, 5, 8, 5, 8, 5,-1, 5,-1, 5,-1, 5, 8, 7, 7, 7
					7, 8, 8, 8, 8, 8, 8, 8, 8,-1,-1,-1, 8,-1, 8, 8, 7, 7, 7
					7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7`;
		}

		/**
		 * Default monster setup for map
		 */
		protected getMonsters() {

		}

		/**
		 * Trigger walls closing in at end of match (tick)
		 */
		private triggerCloseIn() {

			//Update the close in point
			switch (this.closeInDirection) {
				case Direction.Up:
					this.closeInPoint = new Point(this.closeInPoint.x, this.closeInPoint.y - 1);
					break;
				case Direction.Down:
					this.closeInPoint = new Point(this.closeInPoint.x, this.closeInPoint.y + 1);
					break;
				case Direction.Left:
					this.closeInPoint = new Point(this.closeInPoint.x - 1, this.closeInPoint.y);
					break;
				case Direction.Right:
					this.closeInPoint = new Point(this.closeInPoint.x + 1, this.closeInPoint.y);
					break;
			}

			//Drop HARD block (if space allows it)
			let oppositePoint: Point;

			for (let i = 0; i <= 1; i++) {
				let thePoint = (i === 0) ? this.closeInPoint : this.closeInPoint.boardOpposite();

				if (this.canBeClosedIn(thePoint)) {
					let tile = new Tile(this.battle, "hard1", TileType.Hard, thePoint).closeIn();
					this.battle.blockTiles.push(tile);
					this.battle.gameView.add(tile.bmp);
				}
			}

			const impactSound = this.game.add.audio("impact", .2);
			Utils.playSound(impactSound);

			//Update the direction if required
			if (this.closeInPoint.equalTo(new Point(1, 11))) {
				this.closeInDirection = Direction.Right
			} else if (this.closeInPoint.equalTo(new Point(2, 11))) {
				this.closeInDirection = Direction.Up
			} else if (this.closeInPoint.equalTo(new Point(2, 1))) {
				this.closeInDirection = Direction.Right
			} else if (this.closeInPoint.equalTo(new Point(3, 1))) {
				this.closeInDirection = Direction.Down
			} else if (this.closeInPoint.equalTo(new Point(3, 11))) {
				this.closeInDirection = Direction.Right
			} else if (this.closeInPoint.equalTo(new Point(14, 11))) {
				this.closeInDirection = Direction.Up
			} else if (this.closeInPoint.equalTo(new Point(14, 10))) {
				this.closeInDirection = Direction.Left
			} else if (this.closeInPoint.equalTo(new Point(4, 10))) {
				this.closeInDirection = Direction.Up
			} else if (this.closeInPoint.equalTo(new Point(4, 9))) {
				this.closeInDirection = Direction.Right
			} else if (this.closeInPoint.equalTo(new Point(14, 9))) {
				this.closeInDirection = Direction.Up
			} else if (this.closeInPoint.equalTo(new Point(14, 4))) {
				this.closeInDirection = Direction.Left
			} else if (this.closeInPoint.equalTo(new Point(13, 4))) {
				this.closeInDirection = Direction.Down;
			} else if (this.closeInPoint.equalTo(new Point(13, 8))) {
				this.closeInDirection = Direction.Left;
			} else if (this.closeInPoint.equalTo(new Point(12, 8))) {
				this.closeInDirection = Direction.Up;
			} else if (this.closeInPoint.equalTo(new Point(12, 4))) {
				this.closeInDirection = Direction.Left;
			} else if (this.closeInPoint.equalTo(new Point(11, 4))) {
				this.closeInDirection = Direction.Down;
			} else if (this.closeInPoint.equalTo(new Point(11, 8))) {
				this.closeInDirection = Direction.Left;
			} else if (this.closeInPoint.equalTo(new Point(10, 8))) {
				this.closeInDirection = Direction.Up;
			} else if (this.closeInPoint.equalTo(new Point(10, 8))) {
				this.closeInDirection = Direction.Up;
			} else if (this.closeInPoint.equalTo(new Point(10, 4))) {
				this.closeInDirection = Direction.Left;
			} else if (this.closeInPoint.equalTo(new Point(9, 4))) {
				this.closeInDirection = Direction.Down;
			} else if (this.closeInPoint.equalTo(new Point(9, 6))) {
				this.closeInTimer.stop();
			} 

		}


		/**
		 * Returns true if the location on the map can be "blocked in"
		 */
		private canBeClosedIn(point: Point) {

			let tile = this.battle.getTile(point);
			if (!tile) {
				//If we didn't find a block tile, grab a base tile
				tile = this.battle.getBaseTile(point);
			}

			if (tile.type === TileType.Hard) {
				return false;
			} else if (tile.name !== "invisible") {
				return true;
			}

		}





		/**
		 * Returns the tilename for the provided tile number
		 */
		protected tileNumberToName(tileNumber: number): string {
			switch (tileNumber) {
				case 0:
					return "base1";
				case 1:
					return "base2";
				case 2:
					return "base3";
				case 3:
					return "base4";
				case 4:
					return "base5";
				case 5:
					return "hard1";
				case 6:
					return "hard2";
				case 7:
					return "invisible";
				case 8:
					return "soft"

				case 17:
					return "hard3";
				case 18:
					return "hard4";
				case 19:
					return "hard5";
				case 20:
					return "hard6";
				case 21:
					return "hard7";
				case 22:
					return "hard8";
			}
		}

		/**
		 * Returns the tiletype for the provided tile number
		 */
		protected tileNumberToType(tileNumber: number): TileType {

			if (_.indexOf([5, 6, 7, 17, 18, 19, 20, 21, 22], tileNumber) !== -1) {
				return TileType.Hard;
			} else {
				return TileType.Soft;
			}
		}


	}

}