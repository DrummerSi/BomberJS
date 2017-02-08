module Bomberman {

	/*************************************************************
	 * Main game boot sequence
	 *************************************************************/

	export class Boot extends Phaser.State {

		//Nothing to preload
		preload() {}

		create() {

			this.stage.setBackgroundColor(0x000000);

			if (cfg.game.allowScaling) {
				this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			} else {
				this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
			}

			this.scale.onSizeChange.add(this.onSizeChange, this);

			this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;

            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;

            this.scale.minWidth = 400;
            this.scale.minHeight = 300;

            this.scale.refresh();

			this.game.stage.smoothed = false;
			this.game.time.advancedTiming = true;

			//Init plugins
			this.game.add.plugin(eval("Phaser.Plugin.Debug"));


			this.game.state.start("Preloader", true, false);

		}

		//Called when the browser window changes size/ orientation
		private onSizeChange(e) {
			let width = e.width / e.scaleFactor.x;
			let height = e.height / e.scaleFactor.y;

			$("#ui-container")
				.width(e.width)
				.height(e.height);
		}

	}

}


/*************************************************************
 * Checking if window and font systems are ready for init
 *************************************************************/

let fontReady = false;
let windowReady = false;

function fontLoaded() {
	fontReady = true;
	checkAllReady();
}

window.onload = () => {
	windowReady = true;
	checkAllReady();
}

function checkAllReady() {
	if (fontReady && windowReady) {
		new Bomberman.GameEngine();
	}
}
