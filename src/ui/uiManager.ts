module Bomberman {

	/*************************************************************
	 * Handles loading/ unloading of UI components
	 *************************************************************/

	export class UIManager {

		private static instance: UIManager;

		private game: Phaser.Game;

		
		constructor() {
			if (UIManager.instance) {
				return UIManager.instance;
			}

			UIManager.instance = this;
		}

		/**
		 * Initialise the UI Manager
		 */
		public init(game: Phaser.Game) {
			this.game = game;

			this.createMainMenu();
			this.game.scale.onSizeChange.add(this.onSizeChange, this);
		}




		/**
		 * Creates the main menu system for the game
		 */
		private createMainMenu() {
			let self = this;

			window.mainMenu = $("#mainMenuButton").PopupLayer({
				content: "#mainMenu",
				to: "right",
				backgroundColor: "rgba(62,68,76,.8)", //"#3e444c",
				blur: true,
				screenRatio: 0,
				heightOrWidth: 300
			});

			//Main menu actions ----------------------------------------------------

			//Single player game
			$("#mainMenuSingle").click(function (e) {
				window.mainMenu.close();
				alert("WHTA");
			});

			//Fullscreen toggle
			$("#mainMenuFullscreen").click(function (e) {
				if (!window.screenTop && !window.screenY) { //We're already in fullscreen mode, exit it
					self.exitFullScreen();
				} else {
					self.launchFullScreen();
				}
			});

			//How to play
			$("#mainMenuHowToPlay").click(function (e) {
				e.preventDefault();
				window.mainMenu.close();
				self.loadModalInfo("How to play", "howToPlay");
			});

			//Display controls
			$("#mainMenuControls").click(function (e) {
				e.preventDefault();
				window.mainMenu.close();
				self.loadModalInfo("Controls", "controls");
			});

			//Display credits
			$("#mainMenuCredits").click(function (e) {
				e.preventDefault();
				window.mainMenu.close();
				self.loadModalInfo("Credits", "credits");
			});

		}


		/**
		 * Loads and displays modal data to the user
		 */
		private loadModalInfo(title: string, file: string) {
			let dialog = bootbox.dialog({
				title: title,
				message: '<p><i class="fa fa-spin fa-spinner"></i> Loading...</p>',
				size: "large",
				backdrop: true
			});
			dialog.init(function () {
				$.get(`ajax/${file}.htm`, function (data) {
					//TODO: perfectScroll doesn't show scrollbars UNTIL a user has already scrolled
					dialog.find(".bootbox-body").html(`<div id="perfectScroll">${data}</div>`);
					dialog.find(".bootbox-body #perfectScroll").perfectScrollbar();
					//dialog.find(".bootbox-body #perfectScroll").perfectScrollbar("update");
				});
			});
		}


		private onSizeChange(e) {
			//Update mainMenu size if it's open
			window.mainMenu.resize();
		}

		/**
		 * Launches full screen mode on specific element, or the entire window if not provided
		 */
		private launchFullScreen(element?: any) {
			if (typeof element === "undefined") { element = document.documentElement; }
			if (element.requestFullscreen) {
				element.requestFullscreen();
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			} else if (element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
		}

		/**
		 * Exits fullscreen mode
		 */
		private exitFullScreen() {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		}
		

	}

}