module Bomberman {

	/*************************************************************
	 * Snow map
	 *************************************************************/

	export class SnowMap extends Map {

		constructor(gameConfig: IBattleConfig) {
            super(gameConfig);
			this.shadowIntensity = 0.45;
        }


		/**
		 * Run any custom setup functions for the specific map type
		 */
		public setup(battle: Battle) {
			super.setup(battle);

			//background
			let water = new Phaser.TileSprite(this.game, 0, 0, cfg.game.width, cfg.game.height, "back-water");
			water.animations.add("water", [0, 1, 2]);
			water.animations.play("water", 3, true);
			this.battle.backgroundView.addChild(water);

			//Underlays
            let underlay = new Phaser.Sprite(this.game, 0, 0, "overlay-snow");
            this.battle.underlayView.addChild(underlay);

			let igloo1 = new Phaser.Sprite(this.game, cfg.tile.size * 15 - (cfg.tile.size / 2), cfg.tile.size * 3, "overlay-igloo1");
			this.battle.underPlayerView.addChild(igloo1);

			let treebase = new Phaser.Sprite(this.game, cfg.tile.size * 6.5 - (cfg.tile.size / 2), cfg.tile.size * 4, "overlay-treebase");
			this.battle.baseView.addChild(treebase);

			//Overlays
			let igloo2 = new Phaser.Sprite(this.game, cfg.tile.size * 15 - (cfg.tile.size / 2), cfg.tile.size * 3, "overlay-igloo2");
			this.battle.overlayView.addChild(igloo2);

			let tree = new Phaser.Sprite(this.game, cfg.tile.size * 7, cfg.tile.size * 2, "overlay-tree");
			tree.animations.add("lights", [0, 1]);
			tree.animations.play("lights", 2, true);
			this.battle.overlayView.addChild(tree);

			//Setup the penguins
			this.battle.overlayView.addChild(new Penguin(this.battle, 0, 2, "right").bmp);
			this.battle.overlayView.addChild(new Penguin(this.battle, 0, 3, "right").bmp);
			this.battle.overlayView.addChild(new Penguin(this.battle, 0, 6, "right").bmp);
			this.battle.overlayView.addChild(new Penguin(this.battle, 0, 9, "right").bmp);
			this.battle.overlayView.addChild(new Penguin(this.battle, 0, 10, "right").bmp);

			this.battle.overlayView.addChild(new Penguin(this.battle, 3, 11.5, "up").bmp);
			this.battle.overlayView.addChild(new Penguin(this.battle, 4, 11.5, "up").bmp);
			this.battle.overlayView.addChild(new Penguin(this.battle, 6, 11.5, "up").bmp);
			this.battle.overlayView.addChild(new Penguin(this.battle, 9, 11.5, "up").bmp);

			this.battle.underPlayerView.addChild(new Penguin(this.battle, 7, 0, "down").bmp);
			this.battle.underPlayerView.addChild(new Penguin(this.battle, 10, 0, "down").bmp);
			this.battle.underPlayerView.addChild(new Penguin(this.battle, 13, 0, "down").bmp);
			this.battle.underPlayerView.addChild(new Penguin(this.battle, 15, 0, "down").bmp);

			this.battle.underPlayerView.addChild(new Penguin(this.battle, 0.5, 0, "dance").bmp);
			this.battle.underPlayerView.addChild(new Penguin(this.battle, 1.7, 0, "dance").bmp);
			this.battle.underPlayerView.addChild(new Penguin(this.battle, 2.9, 0, "dance").bmp);

			this.battle.underPlayerView.addChild(new Penguin(this.battle, 6.65, 5.7, "dance").bmp);
			this.battle.underPlayerView.addChild(new Penguin(this.battle, 7.65, 5.7, "dance").bmp);

		}




		/**
		 * Return the start point of a player number
		 */
		public playerPosition(playerNumber: number) {

            if (playerNumber === 1) {
                return new Point(1, 1);

            } else if (playerNumber === 2) {
                return new Point(15, 11);

            } else if (playerNumber === 3) {
                return new Point(13, 1);

            } else if (playerNumber === 4) {
                return new Point(1, 11);

            }
        }

	}

}