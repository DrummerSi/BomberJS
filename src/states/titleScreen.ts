module Bomberman {

	/*************************************************************
	 * Renders the title screen
	 *************************************************************/

	export class TitleScreen extends Phaser.State {

		private background: Phaser.Sprite;
		private filter: Phaser.Filter;
		private logo: Phaser.Sprite;


		create() {

			this.game.stage.setBackgroundColor(0x000000);

			this.background = this.game.add.sprite(0, 0);
			this.background.width = cfg.game.width;
			this.background.height = cfg.game.height;

			this.filter = this.game.add.filter('Clouds', 800, 600);
			this.background.filters = [this.filter];

			this.logo = this.game.add.sprite(this.game.world.centerX, 120, "logo");
			this.logo.x = this.game.width / 2;
			this.logo.anchor.x = this.logo.anchor.y = 0.5;

			let tween = this.game.add.tween(this.logo.scale);
			tween.to({ x: 1.3, y: 1.3 }, 3000, Phaser.Easing.Quadratic.InOut)
				.to({ x: 1, y: 1 }, 3000, Phaser.Easing.Quadratic.InOut);
			tween.repeatAll(-1);
			tween.start();

		}


		update() {
			//Update clouds
			this.filter.update();
		}

	}

}