module Bomberman {

	/*************************************************************
	 * Preload all the assets we require here
	 *************************************************************/

	export class Preloader extends Phaser.State {

		progress: Phaser.Text;
		progressBar: Phaser.Graphics;


		preload() {

			this.progress = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 30, '0%', { fill: 'white' }); 
			this.progress.anchor.setTo(.5, .5);  //show progress 

			//Load spritesheets =====================================================================
            this.load.spritesheet("tiles"    , "assets/gfx/tiles.png", 64, 64);
			this.load.spritesheet("bomb"     , "assets/gfx/bomb.png", 64, 64);
			this.load.spritesheet("bonuses"  , "assets/gfx/bonuses.png", 64, 64);
			this.load.spritesheet("explosion", "assets/gfx/explosion.png", 128, 116);
			this.load.spritesheet("penguins" , "assets/gfx/penguins.png", 64, 64);
            this.load.spritesheet("player", "assets/gfx/player.png?v=2", 96, 96);

			this.load.spritesheet("monster-blob", "assets/gfx/monsters/blob.png", 96, 76);
			this.load.spritesheet("monster-blue", "assets/gfx/monsters/blue.png", 132, 132);
			this.load.spritesheet("monster-bulb", "assets/gfx/monsters/bulb.png", 76, 76);
			this.load.spritesheet("monster-mouse", "assets/gfx/monsters/mouse.png", 108, 12);
			this.load.spritesheet("monster-orange", "assets/gfx/monsters/orange.png", 64, 76);
			this.load.spritesheet("monster-snail", "assets/gfx/monsters/snail.png", 156, 132);

			//Load overlay/ underlay image ============================================================
			this.load.image("overlay-lights"         , "assets/gfx/overlays/lights.png");
			this.load.image("overlay-rocks"          , "assets/gfx/overlays/rocks.png");
			this.load.image("overlay-snow"           , "assets/gfx/overlays/snow.png");
			this.load.image("overlay-classic"        , "assets/gfx/overlays/classic.png");

			this.load.image("overlay-igloo1"         , "assets/gfx/overlays/igloo1.png");
			this.load.image("overlay-igloo2"         , "assets/gfx/overlays/igloo2.png");
			this.load.image("overlay-treebase"       , "assets/gfx/overlays/treebase.png");
			this.load.spritesheet("overlay-tree"     , "assets/gfx/overlays/tree.png", 130, 196);
			this.load.spritesheet("overlay-spaceship", "assets/gfx/overlays/spaceship.png", 352, 196);

			this.load.image("logo", "assets/gfx/ui/bomberman.png"); //From: http://textcraft.net/

			//Load backgrounds ========================================================================
			this.load.spritesheet("back-water"  , "assets/gfx/backgrounds/water.png", 64, 64);
			this.game.load.script("filter-space", "assets/filters/space.js");
			this.game.load.script("filter-water", "assets/filters/water.js");

			//Load audio ===============================================================================
			this.load.audio("bomb"     , "assets/sound/bomb.wav");				//Place bomb
			this.load.audio("explosion", "assets/sound/explosion.wav");		    //Bomb explodes
			this.load.audio("item"     , "assets/sound/item.wav");				//Item (bonus) pickup
			this.load.audio("impact"   , "assets/sound/impact1.wav");			//Tile impact (closein)

			//Load music ===============================================================================
			this.load.audio("music1", "assets/music/battle94.ogg");

			//Load scripts ==============================================================================
			this.game.load.script("webfont"      , "//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js");
			this.game.load.script("filter-clouds", "assets/filters/clouds.js");


			this.game.load.onFileComplete.add(this.fileComplete, this);
			this.game.load.start();


		}

		create() {

			//Decide which function we want to run when all assets are loaded... 
			//Here we can run specific functions used for testing purposes

			//Show the main menu
			//this.startupGame();


			//Start a single player match
			this.testSinglePlayerMatch();


			//Start a single player round
			//this.testSinglePlayerRound();
		}


		/**
		 * Main startup function for the game -- Displays the main menu
		 */
		private startupGame() {
			//Show start screen
			this.game.state.start("TitleScreen", true, false);

			//Setup the ui/ button & mouse clicks, etc
			//new UIManager().init(this.game);
		}

		/**
		 * Start a single player match
		 */
		private testSinglePlayerMatch() {

			//Setup the ui/ button & mouse clicks, etc
			new UIManager().init(this.game);


			//Start game
			new Match(this.game, GameType.Local);

		}

		/**
		 * Start a single player round
		 */
		private testSinglePlayerRound() {

			//Setup the ui/ button & mouse clicks, etc
			new UIManager().init(this.game);


			//Start game
			//new Match(this.game, GameType.Local);
			//alert("Setup round");

		}


		/**
		 * Update the progress bar when loading
		 */
		private fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
			this.progress.text = progress + "%";

			this.progressBar = this.game.add.graphics(this.game.world.centerX - 200, this.game.world.centerY);
			this.progressBar.beginFill(0xFFFFFF, 1);
			this.progressBar.drawRoundedRect(5, 5, (380 / 100) * progress, 30, 2);

		}


	}


}