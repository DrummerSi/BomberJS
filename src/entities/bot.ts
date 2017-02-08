/// <reference path="player.ts" />
/// <reference path="../../typings/pathfinding.d.ts" />

module Bomberman {

	/*************************************************************
	 * AI Bot class
	 *************************************************************/


	export class Bot extends Player {

		//Consts
		private AI_VIEW_SIZE: number = 6;

		private BURN_MARK = [
			//X = Soft wall burns
			//Y = Distance to tile
			[0, 0, 0, 0, 0, 0],			//0 burns
			[10, 8, 5, 3, 2, 1],		//1
			[20, 17, 15, 12, 10, 5],	//2
			[30, 26, 24, 22, 15, 10]	//3
		];


		
		//Pathfinding matrix
		private matrix: Array<Array<number>>;
		private grid: PF.Grid;

		//Variables
		private stopTimeLeft: number;
		private moveTimeLeft: number;

		private botMode: BotMode;

		private tilesInRange: Tile[];
		private dangerPositions: Point[];

		private itemGoal: Point;
		private itemDropBomb: boolean;

		private debug: Debug;




		constructor(battle: Battle, location: Point, colour: PlayerColour) {
			super(battle, location, colour);

			//Set entity to BOT
			this.entityType = EntityType.Bot;

			//Reset commands
			this.move = Move.None;
			this.action = Action.None;

			//Init debug
			this.debug = new Debug(this.battle);

			//Init the matrix
			this.matrix = Utils.matrix(cfg.tile.height, cfg.tile.width, 0);
			this.updatePathMatrix();

			//Init variables
			this.stopTimeLeft = 0.5;
			this.moveTimeLeft = 0.0;


			//Set inital bot mode
			this.setBotMode(BotMode.Think);


		}

		/**
		 * Update loop
		 */
		public update(delta: number): void {

			//Output debug values
			this.renderDebugValues()

			this.tilesInRange = this.battle.getTilesInRange(this.location, this.AI_VIEW_SIZE)
			this.dangerPositions = this.battle.getDangerPositions();

			if (!this.isAlive()) {
				return;
			}

			if (this.stopTimeLeft <= 0) {
				if (this.moveTimeLeft <= 0) {
					this.updatePathMatrix();

					if (this.botMode === BotMode.Think) {
						this.modeThink();
					}

					//Update the bot depending on it's mode
					switch (this.botMode) {
						case BotMode.Item: this.modeItem(delta); break;
						case BotMode.Defend: this.modeDefend(delta); break;
					}


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
		 * Sets the bot mode
		 */
		private setBotMode(mode: BotMode) {

			if (mode === BotMode.Think) {
				switch (this.botMode) {
					case BotMode.Item: this.stopTimeLeft = 0.08 + Utils.randomNumber(40) / 1000; break;
					case BotMode.Attack: this.stopTimeLeft = 0.20 + Utils.randomNumber(40) / 1000; break;
					case BotMode.Defend: this.stopTimeLeft = 0.12 + Utils.randomNumber(40) / 1000; break;
					case BotMode.Walk: this.stopTimeLeft = 0.22 + Utils.randomNumber(40) / 1000; break;
				}
			}

			this.botMode = mode;

		}


		/**
		 * The bot must think about what to do next
		 */
		private modeThink() {

			/**
			 * Possible valid actions ================
			 * >>SETUP: Grab dangerous tiles, tiles in view, etc
			 * > DEFEND: Must we defend against bombs/ bombermen/ monsters/ etc
			 * > ATTACK: Is there any bombermen/ monsters in range to attack
			 * > ITEMS: Are there any items neaby to pickup
			 * > BOMB: Which tile is the best to destroy the most amount of walls
			 * > WALK: If NONE of the above, walk in the best direction until we find something
			**/

			//____________________________________________________________________________________________
			//SETUP
			let bestLocation: Tile;
			let bestScore: number;


			//____________________________________________________________________________________________
			//DEFEND
			if (_.some(this.dangerPositions, this.location)) {
				//Bomb danger detected.. Run away
				this.setBotMode(BotMode.Defend);
				return;
			}


			//____________________________________________________________________________________________
			//BOMB

			bestLocation = null;
			bestScore = 0;

			for (let tile of this.tilesInRange) {

				//Path to tile
				let path = this.findPath(this.location, tile.location);
				let pathLength = this.findPathLength(tile.location);

				if (
					tile.getNearSoftWalls() > 0 &&
					pathLength !== -1 &&
					pathLength < (this.AI_VIEW_SIZE) &&
					(tile.getDeadEnd() === -1 || !this.isEnemyNear(this.location)) &&
					!_.some(this.dangerPositions, tile.location) &&
					this.canDropBombAt(tile.location)
				){
					//This is a valid tile, is it the best tile to bomb though?

					//this.debug.tileText(tile, this.BURN_MARK[tile.getNearSoftWalls()][pathLength].toString());
					this.debug.tileText(tile, tile.getNearSoftWalls());


					if (
						bestScore < this.BURN_MARK[tile.getNearSoftWalls()][(path.length - 1)] ||
						(bestScore === this.BURN_MARK[tile.getNearSoftWalls()][pathLength] && Utils.randomNumber(100) >= 50)
					){
						bestLocation = tile;
						bestScore = this.BURN_MARK[tile.getNearSoftWalls()][(path.length - 1)];
					}
				}
			}

			this.debug.markTile(bestLocation, DebugTile.Highlight);
			this.debug.showValue("bestScore", bestScore);

			//If we've found a loction, update the bot
			if (bestScore > 0) {
				this.itemGoal = bestLocation.location;
				this.itemDropBomb = true;
				this.setBotMode(BotMode.Item);
				return;
			}

			//If no suitable tile was found, we need to walk around the arena
			//this.setBotMode(BotMode.Item);
			//this.walkTime = 0;
		}



		/**
		 * Function called when bomber wants to pick up an item or destroy a wall to receive an item
		 */
		private modeItem(delta: number) {

			//Reset bot commands
			this.action = Action.None;
			this.move = Move.None;


			//If an enemy is directly in front of us and we can drop a bomb, maybe we drop one
			//If we've been TOLD to drop a bomb, and we can, then drop one
			if ((
				this.isEnemyNearAndFront() &&
				this.canDropBombAt(this.location) &&
				Utils.randomNumber(100) < 70
			) || (
				this.itemDropBomb &&
				!this.canDropBombAt(this.location)
			)){
				//Decide what to do and exit early
				this.setBotMode(BotMode.Think);
				return;
			}

			//TODO: Picking up items


			let goalReached = false;

			if (this.findPathLength(this.itemGoal) >= 0) {
				goalReached = this.goto(this.itemGoal);
			} else {
				//We can no longer get to the destination, rethink our objective
				this.setBotMode(BotMode.Think);
				return;
			}

			if (goalReached && this.itemDropBomb && this.bombsLeft() > 0) {
				//We've reached the goal, want to drop a bomb and have bomb(s) to drop
				this.action = Action.Bomb;
				this.itemGoal = this.location
				this.itemDropBomb = false;
			} else if (goalReached && !this.itemDropBomb) {
				//We've reached the goal, but don't want to drop a bomb.. What shall we do next?
				this.setBotMode(BotMode.Think);
			}


		}


		/**
		 * Function called when bomberman must defend against potential bomb deaths
		 */
		private modeDefend(delta: number) {

			if (!_.some(this.dangerPositions, this.location)) {
				//We're NOT in danger. Stay here
				this.move = Move.None;
				this.action = Action.None;

				this.setBotMode(BotMode.Think);
				return;
			}

			//There's danger... Find the best place to be safe
			let found = false;
			let bestLocation: Point;
			let bestDistance: number = 999;
			let isDeadEnd = true;

			let tiles = this.battle.getTilesInRange(this.location, this.AI_VIEW_SIZE);
			for (let tile of tiles) {

				//Distance to tile
				let pathLength = this.findPathLength(tile.location);

				//TODO: Check deadends & skull items
				if (
					pathLength !== -1 //Location is accessible
					&& (this.isEnemyNear(tile.location) ? tile.getDeadEnd() === -1 : tile.getDeadEnd() !== -1 || !isDeadEnd)
					&& !_.some(this.dangerPositions, tile.location)	//Location is NOT in danger
					&& (
						pathLength < bestDistance //Closer than current best location
						|| (pathLength === bestDistance && Utils.randomNumber(100) >=50) //Same distance as best location -- 50/50 chance which to choose
					)
				){
					found = true;
					bestLocation = tile.location;
					bestDistance = pathLength;
					isDeadEnd = tile.getDeadEnd() !== -1;
				}

			}


			if (found) {
				//Found a location, go for it
				console.log(bestLocation);
				this.goto(bestLocation);
			} else {
				//Nothing found. Stop.
				this.move = Move.None;
				this.moveTimeLeft - 0;
			}



		}



		/**
		 * Tells the bot to go to a certain point and returns if it's there or not
		 */
		private goto(location: Point): boolean {

			if (this.location === location|| this.findPathLength(location) < 1) {
				//If we're at the location specified, or it's unreachable, Don't move
				this.move = Move.None;

			} else {

				//Now decide which direction to move in, in order to (eventually) reach the destination
				let path = this.findPath(this.location, location);
				let step = path[1]; //Next step in getting to destination location

				if (step[0] < this.location.x) {
					this.move = Move.Left
				} else if (step[0] > this.location.x) {
					this.move = Move.Right;
				} else if (step[1] < this.location.y) {
					this.move = Move.Up
				} else if (step[1] > this.location.y) {
					this.move = Move.Down;
				}


			}

			if (this.move !== Move.None) {
				//We're moving
				this.moveTimeLeft = cfg.tile.size / this.speed;
			} else {
				//No moves
				this.moveTimeLeft = 0;
			}

			//Return wether or note the bomber is on the specified tile
			return this.location.equalTo(this.itemGoal);

		}









		/**
		 * Outputs the debug values to screen
		 */
		private renderDebugValues() {
			/*this.debug.showValue("delta", delta);
			
			this.debug.showValue("itemDropBomb", this.itemDropBomb);*/

			this.debug.showValue("moveTimeLeft", this.moveTimeLeft.toFixed(5));
			this.debug.showValue("stopTimeLeft", this.stopTimeLeft.toFixed(5));

			this.debug.showValue("enemyNear?", this.isEnemyNearAndFront());

			this.debug.showValue("atDestination", this.location.equalTo(this.itemGoal || new Point(0,0)));
			this.debug.showValue("itemDropBomb", this.itemDropBomb);

			let move = "";
			switch (this.move) {
				case Move.Down: move = "Down"; break;
				case Move.Left: move = "Left"; break;
				case Move.None: move = "None"; break;
				case Move.Right: move = "Right"; break;
				case Move.Up: move = "Up"; break;
			}
			this.debug.showValue("Move", move);

			let mode = "";
			switch (this.botMode) {
				case BotMode.Attack: mode = "Attack"; break;
				case BotMode.Defend: mode = "Defend"; break;
				case BotMode.Item: mode = "Item"; break;
				case BotMode.Think: mode = "Think"; break;
				case BotMode.Walk: mode = "Walk"; break;
			}
			this.debug.showValue("Mode", mode);

			this.debug.renderValues();

			this.debug.markTiles(this.tilesInRange, DebugTile.Movement);
			this.debug.markPoints(this.dangerPositions, DebugTile.Danger);
		}

		/**
		 * Returns if we can drop a bomb at a certain location
		 */
		private canDropBombAt(location: Point) :boolean {

			//Make sure we can actually get to the location
			if (
				this.findPathLength(location) < 0 ||	//Make sure we can actually get to the location
				this.battle.getBomb(location)			//Make sure there's not already a bomb on this tile
			) {
				return false;
			}

			//Check to make sure we're not in danger by placing this bomb
			if (!_.some(this.dangerPositions, location)) {
				//We're not in danger... But check the points around us.. If there's danger, don't drop a bomb

				const tile = this.battle.getBaseTile(location);
				if (
					(!tile.tileLeft()	|| _.some(this.dangerPositions, tile.tileLeft().location)) &&
					(!tile.tileRight()	|| _.some(this.dangerPositions, tile.tileRight().location)) &&
					(!tile.tileUp()		|| _.some(this.dangerPositions, tile.tileUp().location)) &&
					(!tile.tileDown()	|| _.some(this.dangerPositions, tile.tileDown().location))
				){
					return false;
				}
			}

			//Make a rough estimation of our flame size to appear more human
			/*let flameSize = this.bombStrength; //Exact size
			if (flameSize > 4) {
				switch (flameSize) {
					case 4: flameSize = 5; break;
					case 5: flameSize = 7; break;
					case 6: flameSize = 8; break;
					default: flameSize = 99;
				}
			}*/


			return true;

		}


		/**
		 * Returns if an enemy (Bot/ player/ monster) is near and on the same column or row as us
		 */
		private isEnemyNearAndFront():boolean {

			//Exit early if there's a bomb at this location
			if (this.battle.getBomb(this.location)) {
				return false;
			}

			//Check for entities on top of us
			let entities = this.battle.getEntities(this.location);
			if (entities.length > 1) {
				for (let entity of entities) {
					if (entity !== this && entity.isAlive()) {
						return true;
					}
				}
			}

			//Check each direction for enemies
			const MAX_NEAR_DISTANCE = 3;

			let checkLocation = this.location;
			let tiles: Tile[];

			//Loop through each direction from bot location and check if there's any enemies
			for (let direction = 1; direction <= 4; direction++) {
				tiles = this.tilesFromCenter(this.location, direction, MAX_NEAR_DISTANCE);
				for (let tile of tiles) {
					if (tile.isBlocked() || tile.isBomb()) {
						break; //Exit because the path is blocked
					} else if (this.battle.getEntity(tile.location)) {
						return true; //We found an enemy
					}
				}
			}
			return false;

		}

		/**
		 * Returns if an enemy (Bot/ player/ monster) is near
		 */
		private isEnemyNear(location: Point): boolean {

			for (let entity of this.battle.entities) {
				if (
					entity.isAlive() &&
					Math.abs(entity.location.x - location.x) + Math.abs(entity.location.y - location.y) <= 3 &&
					Utils.randomNumber(100) < 92	
				){
					return true;
				}
			}
			return false;
		}








		/**
		 * Updates the pathfinding matrix
		 */
		private updatePathMatrix(): void {

			this.debug.clearAll(DebugTile.Path);

			for (let tile of this.battle.baseTiles) {
				if ((tile.isBlocked() || tile.isBomb()) && !tile.location.equalTo(this.location)) {
					//If this tile is blocked, but the bomber is NOT currently on it
					this.matrix[tile.location.y][tile.location.x] = 1;
				} else {
					this.matrix[tile.location.y][tile.location.x] = 0;
					this.debug.markTile(tile, DebugTile.Path, false);
				}
			}
			this.grid = new PF.Grid(this.matrix);
		}

		/**
		 * Finds the path of tiles from source to location
		 */
		private findPath(source: Point, destination: Point): number[][] {
			let grid = this.grid.clone();
			let finder = new PF.AStarFinder({
				weight: 10 //Not sure what this does exactly, other than speed up the process
			});
			return finder.findPath(source.x, source.y, destination.x, destination.y, grid);
		}

		/**
		 * Finds the length of the path between current location and destination
		 */
		private findPathLength(destination: Point): number {
			let path = this.findPath(this.location, destination);
			return path.length - 1;
		}

		/**
		 * Returns an array of tiles up to x tiles away from location in a specified direction
		 */
		private tilesFromCenter(location: Point, direction: Direction, distance: number) {

			let addition: Point;
			let point = location.clone();
			let output: Tile[] = [];

			for (let j = 1; j <= distance; j++) {
				point = location.moveDirection(direction);
				let tile = this.battle.getBaseTile(point);
				if (tile) {
					output.push(tile);
				}
			}

			return output;

		}



	}


}