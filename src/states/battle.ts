/// <reference path="../utils/point.ts" />

module Bomberman {

	/*************************************************************
	 * The main BATTLE game screen
	 *************************************************************/

	export class Battle extends Phaser.State {

		background: Phaser.Sprite;		//Stage backgrounds

		containerView: Phaser.Group;	//CONTAINS all gameplay elements
		backgroundView: Phaser.Group;	//Bcakground colour/ animation/ filters/ etc
		baseView: Phaser.Group;			//Base tiles
		gameView: Phaser.Group;			//Blocks/ Bombs/ Flames/ etc
		underPlayerView: Phaser.Group;	//Items under the players
		entityView: Phaser.Group;		//Entities -- Players/ bots/ monsters
		underlayView: Phaser.Group;		//Any underlays
		overlayView: Phaser.Group;		//Any overlays
		debugView: Phaser.Group;		//Debugging info

		baseTiles: Tile[];				//All walkable base tiles
		blockTiles: Tile[];				//Blocking tiles - hard & soft
		itemTiles: Item[];

		entities: Entity[];				//Collection of entities - players/ bots/ monsters/ etc
		bombs: Bomb[];
		fires: Fire[];

		config: IBattleConfig;			//The settings for this (current) battle
		map: Map;						//The map used in this game

		gameStartTime: number;			//Time that the game started
		timeLeft: number;				//Number of whole seconds left in the battle
		hasStarted: boolean = false;	//Has the match actually started?

		timedEvents: string[];			//Holds a list of timed events that have already been triggered
		mapText: Phaser.Text;			//Text to display at the start of a match (READY/ GO/ etc)


		//Map timelimit
		private timeLimit = 120; //2 mins


		init(config: IBattleConfig) {
			console.log("INIT Battle");
			this.config = config;
		}

		create() {
			console.log("CREATE battle");

			//Stage background
			this.background = this.game.add.sprite(400, 0);
			this.background.x = this.background.y = 0;
			this.background.width = cfg.game.width;
			this.background.height = cfg.game.height;

			//Gameplay container -- EVERYTHING is contained within
			this.containerView = this.game.add.group(undefined, "Container");
			this.containerView.x = 0;
			this.containerView.y = 0;

			//Background view
			this.backgroundView = this.game.add.group(this.containerView, "Backround");
			this.backgroundView.x = 96 - cfg.tile.size;
			this.backgroundView.y = 0;	

			//Base tiles only
			this.baseView = this.game.add.group(this.containerView, "Base");
			this.baseView.x = 96 - cfg.tile.size;
			this.baseView.y = 0;

			//Underlay
			this.underlayView = this.game.add.group(this.containerView, "Underlay");
			this.underlayView.x = this.underlayView.y = 0;

			//Main game view - HARD and SOFT blocks/ bombs, bonuses, fire, explosions, etc
			this.gameView = this.game.add.group(this.containerView, "Game");
			this.gameView.x = 96 - cfg.tile.size;
			this.gameView.y = 0; 

			//Under player graphics
			this.underPlayerView = this.game.add.group(this.containerView, "UnderPlayer");
			this.underPlayerView.x = this.underPlayerView.y = 0;

			//Players / bots / monsters
			this.entityView = this.game.add.group(this.containerView, "Entity");
			this.entityView.x = 96 - cfg.tile.size;
			this.entityView.y = 0;

			//Overlay 
			this.overlayView = this.game.add.group(this.containerView, "Overlay");
			this.overlayView.x = this.overlayView.y = 0;

			//Debugging
			this.debugView = this.game.add.group(this.containerView, "Debug");
			this.debugView.x = 96 - cfg.tile.size;
			this.debugView.y = 0;


			this.baseTiles = [];
			this.blockTiles = [];
			this.itemTiles = [];

			this.bombs = [];
			this.fires = [];

			this.entities = [];


			//Load the specified map in the config
			this.setupMap(); //Loads base & block tiles
			this.setupPlayers();

			//Test monsters
			let m;
			m = new MonsterBlob(this, new Point(11, 4));
			this.entities.push(m);

			m = new MonsterBlue(this, new Point(7, 3));
			this.entities.push(m);



			//maybe music should be map dependant? Or random!?
			Utils.playMusic(this.game.add.audio("music1", .8));


			//Misc setup
			this.timedEvents = [];


			//Start the game
			this.startBattle();

		}


		/**
		 * Per frame update function
		 */
		update() {

			//Get deltatime (time since last update)
			let delta = this.game.time.elapsed / 1000;

			if (this.hasStarted) {

				//Update entities
				for (let entity of this.entities) {
					entity.update(delta);
				}

				//Update bombs
				for (let bomb of this.bombs) {
					bomb.update();
				}

				//Re-calculate the Z-Index of each sprite to make sure players in front
				//always appear ahead of those behind
				this.calculatePlayerIndex();

				//Things like.. Game timer ended, or map specific events?
				this.checkTimedEvents();

			} // END: this.hasStarted			

		}

		render() {

			for (let tile of this.blockTiles) {
				//this.game.debug.rectangle(tile.getCollision(), "rgba(255,0,0,.6)", true);
				////this.game.debug.rectangle(Utils.debugCollision(tile), "rgba(255,0,0,.2)", true);
			}

			/*for (let tile of this.blockTiles) {
				this.game.debug.spriteBounds(tile.bmp, "rgba(255,0,0,.6)", true);
			}*/

			for (let entity of this.entities) {
				//this.game.debug.rectangle(entity.getCollision(), "rgba(0,255,0,.6)", true);
				////this.game.debug.rectangle(Utils.debugCollision(entity), (entity.entityType === EntityType.Local) ? "rgba(0,255,0,.1)" : "rgba(137,72,255,.1)", true);
				//this.game.debug.spriteBounds(entity.bmp, "rgba(0,255,0,.6)", true);

				/*if (entity.entityType === EntityType.Monster) {
					this.game.debug.text(`${entity.container.x} : ${entity.container.y}`, 20, 20, "#000000", "Arial");
				}*/

			}

		}


		/**
		 * Returns the tile at the specified position
		 */
		public getTile(pos: Point): Tile {
			for (let tile of this.blockTiles) {
				if (tile.location.equalTo(pos)){
					return tile;
				}
			}
		}

		/**
		 * Returns the base tile for the specified location
		 */
		public getBaseTile(pos: Point): Tile {
			for (let tile of this.baseTiles) {
				if (tile.location.equalTo(pos)) {
					return tile;
				}
			}
		}

		/**
		 * Returns the tile type at the given position
		 */
		public getTileType(pos: Point): TileType {
			const tile = this.getTile(pos);
			return (tile) ? tile.type : TileType.Base;
		}

		/**
		 * Returns a bomb at a given position
		 */
		public getBomb(pos: Point): Bomb {
			for (let bomb of this.bombs) {
				if (bomb.location.equalTo(pos)) {
					return bomb;
				}
			}
		}

		/**
		 * Returns the pickup item at the given position
		 */
		public getItem(pos: Point): Item {
			for (let item of this.itemTiles) {
				if (item.location.equalTo(pos)) { //&& item.hasSpawned()) {
					return item;
				}
			}
		}

		/**
		 * Returns a single entity from a specified point
		 */
		public getEntity(pos: Point): Entity {
			for (let entity of this.entities) {
				if (entity.location.equalTo(pos)) {
					return entity;
				}
			}
		}

		/**
		 * Returns a single monster entity from a specified point
		 */
		public getMonster(pos: Point): Monster {
			for (let entity of this.entities) {
				if (entity.location.equalTo(pos) && entity.entityType == EntityType.Monster) {
					return <Monster>entity;
				}
			}
		}

		/**
		 * Returns an array of open tile locations
		 * (Tiles containing no HARD or SOFT blocks, no items, and no players, bots or monsters)
		 */
		public getOpenTiles(): Point[] {
			let freeTiles = [];

			for (let tile of this.baseTiles) {
				const location = tile.location.clone();

				if (this.getTileType(location) === TileType.Base) {
					//Open tile detected.. check for obstructions
					if(!this.getItem(location) && !this.getBomb(location) && !this.getEntity(location)) {
						freeTiles.push(location);
					}
				}
			}
			return <Point[]>freeTiles;
		}

		/**
		 * Returns an array of entities from a specified point
		 */
		public getEntities(pos: Point): Entity[] {
			let entities = new Array<Entity>();

			for (let entity of this.entities) {
				if (entity.location.equalTo(pos)) {
					entities.push(entity);
				}
			}
			return entities;
		}



		/**
		 * Starts the battle...
		 * Allows movement, starts the counter, etc...
		 */
		private startBattle() {
			const self = this;

			const style = { font: "bold 120px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
			this.mapText = new Phaser.Text(self.game, 0, 0, "", style);
			this.mapText.setShadow(10, 10, 'rgba(0,0,0,0.5)', 2);
			this.mapText.setTextBounds(0, 0, cfg.game.width, cfg.game.height);
			this.mapText.stroke = "#000";
			this.mapText.strokeThickness = 25;

			this.overlayView.add(this.mapText);
			this.mapText.setText("Ready...");

			setTimeout(function () {
				self.mapText.setText("GO!");

				self.gameStartTime = self.game.time.totalElapsedSeconds();
				//self.timeLeft = self.config.timeLimit;
				self.hasStarted = true;

				setTimeout(function () {
					self.mapText.destroy();
				}, 1000);

			}, 2000);


		}


		/**
		 * For each player/ bot/ monster..
		 * Change display order so that entities in front of others appear that way on screen
		 */
		private calculatePlayerIndex() {

			//Sort entities, from furthest away to nearest
			const sortedEntities = _.sortBy(this.entities, entity => entity.container.y);
			for (let entity of sortedEntities) {
				this.entityView.bringToTop(entity.container);
			}

		}

		/**
		 * Checks on timed events throughout the match
		 */
		private checkTimedEvents() {

			//Calculate time left
			const elapsed = this.game.time.totalElapsedSeconds() - this.gameStartTime;
			let timeLeft = this.timeLimit - elapsed;
			if (timeLeft < 0) {
				timeLeft = 0;
			}

			//Set timeleft as an integer number for event calculations
			this.timeLeft = Math.floor(timeLeft);

			//This is the time to display to the user
			let timeDisplay = Utils.formatTime(timeLeft);
			$("#countdown>div").html(timeDisplay);

			//Start the "END MATCH" procedure
			if (this.timeLeft === 0 && _.indexOf(this.timedEvents, "endMatch") === -1) {
				this.timedEvents.push("endMatch");
				this.map.initCloseIn();
			}

		}

		/**
		 * Loads the specified map into the game
		 */
		private setupMap() {
			this.map = Utils.loadStage(this.config);
			this.map.setup(this);
		}

		/**
		 * Sets up players for battle
		 */
		private setupPlayers() {			

			if (this.config.type === GameType.Local) {
				this.setupPlayersLocal();
			} else {
				alert("NOT YET SUPPORTED");
			}

		}

		/**
		 * Sets up players for a local game
		 */
		private setupPlayersLocal() {
			const players = this.config.players;
			for (let i = 0; i < players.length; i++) {

				//Local player
				if (players[i].type == EntityType.Local) {
					const player = new Player(this, this.map.playerPosition(i + 1), i);
					player.setName(players[i].name);
					this.entities.push(player);
					this.entityView.addChild(player.container);

				//AI player
				} else if (players[i].type === EntityType.Bot) {
					const bot = new Bot(this, this.map.playerPosition(i + 1), i);
					bot.setName(players[i].name);
					this.entities.push(bot);
					this.entityView.addChild(bot.container);
				}
			}
		}




	}

}