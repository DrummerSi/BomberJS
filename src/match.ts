module Bomberman {

	/*************************************************************
	 * Match system - Plays multiple games, keeps scores, etc
	 *************************************************************/

	export class Match {

		private game: Phaser.Game;

		private matchConfig: IMatchConfig;
		private battleConfig: IBattleConfig;


		constructor(game: Phaser.Game, gameType: GameType) {

			const self = this;
			this.game = game;


			//Set the default match config
			this.matchConfig = {
				type: gameType,
				wins: 1
			}
			
			//Set the default game config
			this.battleConfig = {
				type: GameType.Local,
				data: "",
				stage: Stage.Snow,
				players: []			
			}


			if (gameType === GameType.Local) {

				//Show loading screen, close menu and wait for a fraction of a second before loading the main stage
				self.game.state.start("Loading", true, false);
				window.mainMenu.close();
				setTimeout(function () {
					self.setupSinglePlayer();
				}, 200);

			} else {
				alert("Multiplayer not yet supported");
			}

		}

		/**
		 * Sets up a game for single player usage
		 */
		private setupSinglePlayer() {

			const map = Utils.loadStage(this.battleConfig);

			this.battleConfig.players = [
				<IRoomPlayer>{ key: "1", name: "Player 1", type: EntityType.Local },
				<IRoomPlayer>{ key: "2", name: "Bot 1", type: EntityType.Bot },
				//<IRoomPlayer>{ key: "3", name: "Bot 2", type: EntityType.Bot },
				//<IRoomPlayer>{ key: "4", name: "Bot 3", type: EntityType.Bot }
			];

			//Generate start data
			const startData = map.generateStartData(this.battleConfig.players);

			//Inject the start data into the battle config
			this.battleConfig.data = jsonpack.pack(startData);


			//Start the game
			this.game.state.start("Battle", true, false, this.battleConfig);			

		}


	}

}