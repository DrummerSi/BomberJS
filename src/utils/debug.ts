module Bomberman {

	export class Debug {


		private game: Phaser.Game;
		private battle: Battle;

		private dOldValues: any[] = [];
		private dValues: any[] = [];

		private debugView: Phaser.Group;

		constructor(battle: Battle) {
			this.battle = battle;
			this.game = battle.game;

			//Create a new debug group in the battles debug group
			this.debugView = this.game.add.group(this.battle.debugView, "DebugView");
			this.debugView.x = this.debugView.y = 0;

		}

		/**
		 * Adds a value to the debug table (So we can view it for testing)
		 */
		public showValue(name: string, value: any) {

			if (!cfg.debug.showDebugTable) {
				return;
			}

			let val = { 'name': name, 'value': value };

			let entry = _.find(this.dValues, { 'name': name });
			if (entry) {
				entry['value'] = value;
			} else {
				this.dValues.push(val);
			}			
		}

		/**
		 * Render debug values to the screen
		 */
		public renderValues(): void {

			if (!cfg.debug.showDebugTable) {
				return;
			}

			if (this.dValues !== this.dOldValues) {
				let str = '<table class="table table-striped" style="table-layout:fixed;"><thead><tr><th noresize>Name</th><th noresize>Value</th></tr></thead><tbody>'
				for (let value of this.dValues) {
					str += '<tr><td>' + value['name'] + '</td><td>' + value['value'] + '</td></tr>';
				}
				str += '</tbody></table>';
				$("#info").html(str);
			}
			this.dOldValues = this.dValues.slice(0);
		}

		/**
		 * Mark specific tiles with a specific colour
		 */
		public markTiles(tiles: Tile[], debugTile: DebugTile = DebugTile.Danger) {
			if (!cfg.debug.showMarkers) {
				return;
			}

			this.clearAll(debugTile);
			if (tiles) {
				for (let tile of tiles) {
					this.markTile(tile, debugTile);
				}
			}
		}		

		public markPoints(points: Point[], debugTile: DebugTile = DebugTile.Danger) {
			if (!cfg.debug.showMarkers) {
				return;
			}

			let tiles: Tile[] = [];
			if (points) {
				for (let point of points) {
					tiles.push(this.battle.getBaseTile(point));
				}
				this.markTiles(tiles, debugTile);
			}
		}

		public markArray(arr: number[][], debugTile: DebugTile = DebugTile.Danger) {
			if (!cfg.debug.showMarkers) {
				return;
			}

			let tiles: Tile[] = [];
			for (let ar of arr) {
				tiles.push(this.battle.getBaseTile(new Point(ar[0], ar[1])));
			}
			this.markTiles(tiles, debugTile);
		}

		public markTile(tile: Tile, debugTile: DebugTile = DebugTile.Danger, clearPrevious: boolean = false) {
			if (!cfg.debug.showMarkers) {
				return;
			}
			
			let lineColour: number, offset: number;

			switch (debugTile) {
				case DebugTile.Danger:
					lineColour = 0xff0000;
					offset = 0;
					break;
				case DebugTile.Movement:
					lineColour = 0xFFFF00;
					offset = 6;
					break;
				case DebugTile.Path:
					lineColour = 0x0099CC;
					offset = 12;
					break;
				case DebugTile.Highlight:
					lineColour = 0x00CC00;
					offset = 18;
					break;
			}


			//console.log("mark");
			if (clearPrevious) {
				this.clearAll(debugTile);
			}


			let graphics = this.game.add.graphics(
				tile.location.x * cfg.tile.size,
				tile.location.y * cfg.tile.size,
				this.debugView);

				graphics.lineStyle(6, lineColour, .7);
				graphics.moveTo(0 + offset, 0 + offset);

				graphics.lineTo(cfg.tile.size - offset, 0 + offset);
				graphics.lineTo(cfg.tile.size - offset, cfg.tile.size- offset);
				graphics.lineTo(0 + offset, cfg.tile.size - offset);
				graphics.lineTo(0 + offset, 0 + offset);

				//graphics.name = "tile";
				graphics.key = "tile-" + debugTile;

		}

		public tileText(tile: Tile, text: any) {
			if (!cfg.debug.showTileValues) {
				return;
			}

			for (let i of this.debugView.children) {
				if (i['key'] === "text_" + tile.location.x + "_ " + tile.location.y) {
					//Update text and return
					i['text'] = <string>text;
					return;
				}
			};


			let txt = this.game.add.text(
				tile.location.x * cfg.tile.size,
				tile.location.y * cfg.tile.size,
				<string>text,
				{ font: "bold 20px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" },
				this.debugView
			);

			txt.setTextBounds(
				0, 0, cfg.tile.size, cfg.tile.size
			);

			txt.stroke = "#ffffff";
			txt.strokeThickness = 3;
			txt.key = "text_" + tile.location.x + "_ " + tile.location.y;

		}

		public markPath() {

		}

		public clearPath() {

		}

		public clearAll(debugTile: DebugTile = null) {

			if (debugTile === null) {
				this.debugView.removeAll();
			} else {
				for (let i of this.debugView.children) {
					if (i['key'] === "tile-" + debugTile) {
						this.debugView.remove(i, true);
					}
				}
			}
		}



	}

}
