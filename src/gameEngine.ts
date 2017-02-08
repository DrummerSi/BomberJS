
/**
 * This is the main function called whtn the game starts..
 * Here we register all the state and load them as required.
 */

module Bomberman {

	export class GameEngine extends Phaser.Game {

		constructor() {

			super(cfg.game.width, cfg.game.height, Phaser.WEBGL, 'game', null, true);

			//Setup main Phaser options and boot settings
			this.state.add("Boot", Boot, false);

			//Preload the assets used in the game
			this.state.add("Preloader", Preloader, false);

			//Title screen
			this.state.add("TitleScreen", TitleScreen, false);

			//Loading screen
			this.state.add("Loading", Loading, false);

			//Main battle screen
			this.state.add("Battle", Battle, false);

			//Start the  boot process
			this.state.start("Boot");

		}


	}

}