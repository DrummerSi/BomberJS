module Bomberman {

	/*************************************************************
	 * A very simple loading screen
	 *************************************************************/

	export class Loading extends Phaser.State {

		private text: Phaser.Text;

		create() {

			let style = { font: "bold 52px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

			//  The Text is positioned at 0, 100
			this.text = this.game.add.text(0, 0, "Loading...", style);
			this.text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

			this.text.setTextBounds(0, 0, cfg.game.width, cfg.game.height);

		}

	}

}