module Bomberman {

	export class GameEngine extends Phaser.Game {

		constructor() {

			super(cfg.game.width, cfg.game.height, Phaser.CANVAS, 'game', null, true);

			this.state.add("Boot", Boot, false);
			this.state.add("Preloader", Preloader, false);
			this.state.add("TitleScreen", TitleScreen, false);
			this.state.add("Loading", Loading, false);

			this.state.add("Battle", Battle, false);


			this.state.start("Boot");

		}


	}

}