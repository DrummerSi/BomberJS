var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Bomberman;
(function (Bomberman) {
    Bomberman.cfg = {
        game: {
            width: 1280,
            height: 800,
            allowScaling: true
        },
        tile: {
            size: 64,
            width: 19,
            height: 13,
            tilesPerLine: 23
        },
        max: {
            bombs: 12,
            strength: 15,
            speed: 10
        },
        debug: {
            showDebugTable: false,
            showMarkers: false,
            showTileValues: false,
        },
        muteMusic: true,
        muteSound: true
    };
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Entity = (function () {
        function Entity(battle, location) {
            this.battle = battle;
            this.game = battle.game;
            this.location = location;
            this.alive = true;
            this.dying = false;
            this.clearStartArea();
            this.bombs = [];
            this.bombQuantity = 0;
            this.bombStrength = 0;
            this.bombSound = this.game.add.audio("bomb", .8);
            this.itemSound = this.game.add.audio("item", .3);
            this.action = Bomberman.Action.None;
            this.canUseItems = false;
            this.items = [];
            this.speed = 300;
            this.lives = 1;
            this.statusTimer = this.game.time.create(false);
            this.setFireProof(4);
        }
        Entity.prototype.update = function (delta) {
            if (!this.alive) {
                return;
            }
        };
        Entity.prototype.isAlive = function () {
            return this.alive;
        };
        Entity.prototype.isDying = function () {
            return this.dying;
        };
        Entity.prototype.getCollision = function () {
            return new Phaser.Rectangle((this.container.x), (this.container.y), 64, 64);
        };
        Entity.prototype.canMove = function (dir, location) {
            if (location === void 0) { location = this.location; }
            var dirX = 0, dirY = 0;
            if (dir === Bomberman.Direction.Right) {
                dirX = 1;
            }
            else if (dir === Bomberman.Direction.Left) {
                dirX = -1;
            }
            else if (dir === Bomberman.Direction.Down) {
                dirY = 1;
            }
            else if (dir === Bomberman.Direction.Up) {
                dirY = -1;
            }
            var pos = new Bomberman.Point(location.x + dirX, location.y + dirY);
            if (this.battle.getTileType(pos) === Bomberman.TileType.Base && !this.battle.getBomb(pos)) {
                return true;
            }
            return false;
        };
        Entity.prototype.possibleMoves = function (location) {
            if (location === void 0) { location = this.location; }
            var output = [];
            if (this.canMove(Bomberman.Direction.Up, location)) {
                output.push(Bomberman.Direction.Up);
            }
            ;
            if (this.canMove(Bomberman.Direction.Down, location)) {
                output.push(Bomberman.Direction.Down);
            }
            ;
            if (this.canMove(Bomberman.Direction.Left, location)) {
                output.push(Bomberman.Direction.Left);
            }
            ;
            if (this.canMove(Bomberman.Direction.Right, location)) {
                output.push(Bomberman.Direction.Right);
            }
            ;
            return output;
        };
        Entity.prototype.animWalkSpeed = function () {
            return (this.speed / 100) * 4.5;
        };
        Entity.prototype.detectDeath = function () {
            for (var _i = 0, _a = this.battle.fires; _i < _a.length; _i++) {
                var fire = _a[_i];
                for (var _b = 0, _c = fire.locations; _b < _c.length; _b++) {
                    var location_1 = _c[_b];
                    if (location_1.equalTo(this.location)) {
                        return true;
                    }
                }
            }
            var base = this.battle.getBaseTile(this.location);
            if (!base) {
                return true;
            }
            var tile = this.battle.getTile(this.location);
            if (tile) {
                if (tile.type === Bomberman.TileType.Hard) {
                    return true;
                }
            }
            if (this.entityType === Bomberman.EntityType.Local ||
                this.entityType === Bomberman.EntityType.Bot ||
                this.entityType === Bomberman.EntityType.Remote) {
                var monster = this.battle.getMonster(this.location);
                if (monster && monster.isAlive() && !monster.isDying()) {
                    return true;
                }
            }
            return false;
        };
        Entity.prototype.updateLocation = function () {
            this.location = Bomberman.Utils.convertToEntityPosition(new Bomberman.Point(this.container.x, this.container.y));
        };
        Entity.prototype.detectBombCollision = function (pixels) {
            var entity = new Phaser.Rectangle(pixels.x + 2, pixels.y + 2, Bomberman.cfg.tile.size - 3, Bomberman.cfg.tile.size - 3);
            for (var _i = 0, _a = this.battle.bombs; _i < _a.length; _i++) {
                var bomb = _a[_i];
                if (Phaser.Rectangle.intersects(entity, bomb.getCollision())) {
                    if (bomb === this.escapeBomb) {
                        return false;
                    }
                    return true;
                }
            }
            if (this.escapeBomb) {
                this.escapeBomb = null;
            }
            return false;
        };
        Entity.prototype.detectWallCollision = function (position) {
            var entity = new Phaser.Rectangle(position.x + 2, position.y + 2, Bomberman.cfg.tile.size - 3, Bomberman.cfg.tile.size - 3);
            for (var _i = 0, _a = this.battle.blockTiles; _i < _a.length; _i++) {
                var tile = _a[_i];
                if (Phaser.Rectangle.intersects(entity, tile.getCollision())) {
                    return true;
                }
            }
            return false;
        };
        Entity.prototype.detectItemCollision = function () {
            if (this.canUseItems) {
                var item = this.battle.getItem(this.location);
                if (item) {
                    this.applyItem(item);
                    this.items.push(item);
                    item.remove();
                }
            }
        };
        Entity.prototype.redistributeItems = function () {
            if (this.canUseItems) {
                var freeTilePositions = this.battle.getOpenTiles();
                for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
                    var item = _a[_i];
                    var randPos = Bomberman.Utils.randomFromArray(freeTilePositions);
                    Bomberman.Utils.removeFromArray(freeTilePositions, randPos);
                    var newItem = new Bomberman.Item(this.battle, randPos, item.type);
                    newItem.show();
                    this.battle.itemTiles.push(newItem);
                }
            }
        };
        Entity.prototype.applyItem = function (item) {
            Bomberman.Utils.playSound(this.itemSound);
            switch (item.type) {
                case Bomberman.ItemType.BombUp:
                    if (this.bombQuantity < Bomberman.cfg.max.bombs) {
                        this.bombQuantity++;
                    }
                    break;
                case Bomberman.ItemType.FireUp:
                    if (this.bombStrength < Bomberman.cfg.max.strength) {
                        this.bombStrength++;
                    }
                    break;
            }
        };
        Entity.prototype.setFireProof = function (seconds) {
            this.fireProof = true;
            this.fireProofTime = seconds;
            this.statusTimer.loop(320, this.flashEntity, this);
            this.statusTimer.start();
        };
        Entity.prototype.flashEntity = function () {
        };
        Entity.prototype.createColorImage = function (_game, source, color) {
            if (color === void 0) { color = "#ffffff"; }
            console.log("CALLED");
            var anchorX = source.anchor.x;
            var anchorY = source.anchor.y;
            source.anchor.set(0, 0);
            var bmd = this.createRectTexture(_game, source.width, source.height, color);
            bmd.blendDestinationAtop();
            bmd.draw(source, 0, 0, source.width, source.height);
            source.anchor.set(anchorX, anchorY);
            return bmd;
        };
        Entity.prototype.createRectTexture = function (_game, width, height, colorHex, cacheKey) {
            if (colorHex === void 0) { colorHex = "#000000"; }
            var color = Phaser.Color.hexToColor(colorHex);
            var addToCache = !!cacheKey;
            var texture = _game.add.bitmapData(width, height, cacheKey, addToCache);
            texture.fill(color.r, color.g, color.b);
            return texture;
        };
        Entity.prototype.clearStartArea = function () {
            if (this.battle.getTile(this.location)) {
                this.battle.getTile(this.location).delete();
            }
            for (var i = 0; i < 4; i++) {
                var dirX = 0, dirY = 0;
                if (i === 0) {
                    dirX = 1;
                }
                else if (i === 1) {
                    dirX = -1;
                }
                else if (i === 2) {
                    dirY = 1;
                }
                else if (i === 3) {
                    dirY = -1;
                }
                var position = new Bomberman.Point(this.location.x + dirX, this.location.y + dirY);
                var type = this.battle.getTileType(position);
                if (type === Bomberman.TileType.Soft) {
                    var tile = this.battle.getTile(position);
                    tile.delete();
                }
            }
        };
        Entity.prototype.checkBombDrop = function () {
            if (this.action === Bomberman.Action.Bomb) {
                this.action = Bomberman.Action.None;
                if (this.escapeBomb) {
                    return;
                }
                for (var _i = 0, _a = this.battle.bombs; _i < _a.length; _i++) {
                    var bomb = _a[_i];
                    if (this.location.equalTo(bomb.location)) {
                        return;
                    }
                }
                var unexplodedBombs = 0;
                for (var _b = 0, _c = this.bombs; _b < _c.length; _b++) {
                    var bomb = _c[_b];
                    if (!bomb.exploded) {
                        unexplodedBombs++;
                    }
                }
                if (unexplodedBombs < this.bombQuantity) {
                    var bomb = new Bomberman.Bomb(this.battle, this.location, this, this.bombStrength);
                    this.battle.gameView.addChild(bomb.bmp);
                    this.bombs.push(bomb);
                    this.battle.bombs.push(bomb);
                    Bomberman.Utils.playSound(this.bombSound);
                }
            }
        };
        Entity.prototype.getCornerFix = function (dirX, dirY, delta) {
            var edgeSize = 48;
            var location = new Bomberman.Point();
            var pos1 = new Bomberman.Point(this.location.x + dirY, this.location.y + dirX);
            var bmp1 = Bomberman.Utils.convertToBitmapPosition(pos1);
            var pos2 = new Bomberman.Point(this.location.x - dirY, this.location.y - dirX);
            var bmp2 = Bomberman.Utils.convertToBitmapPosition(pos2);
            if (this.battle.getTileType(new Bomberman.Point(this.location.x + dirX, this.location.y + dirY)) === Bomberman.TileType.Base) {
                location = this.location;
            }
            else if (this.battle.getTileType(pos1) === Bomberman.TileType.Base
                && Math.abs(this.container.y - bmp1.y) < edgeSize && Math.abs(this.container.x - bmp1.x) < edgeSize) {
                if (this.battle.getTileType(new Bomberman.Point(pos1.x + dirX, pos1.y + dirY)) === Bomberman.TileType.Base) {
                    location = pos1;
                }
            }
            else if (this.battle.getTileType(pos2) === Bomberman.TileType.Base
                && Math.abs(this.container.y - bmp2.y) < edgeSize && Math.abs(this.container.x - bmp2.x) < edgeSize) {
                if (this.battle.getTileType(new Bomberman.Point(pos2.x + dirX, pos2.y + dirY)) === Bomberman.TileType.Base) {
                    location = pos2;
                }
            }
            if (location.x && this.battle.getTileType(location) === Bomberman.TileType.Base) {
                return Bomberman.Utils.convertToBitmapPosition(location);
            }
        };
        Entity.prototype.die = function () {
            var self = this;
            this.lives--;
            if (this.lives === 0) {
                this.dying = true;
                this.alive = false;
                this.bmp.animations.play("die", 10, false, true);
                this.bmp.animations.currentAnim.onComplete.add(function () {
                    self.dying = false;
                    console.log("DEAD");
                });
            }
            else {
                this.setFireProof(3);
            }
        };
        Entity.prototype.processMovement = function (movement, delta) {
            console.log("ERROR: Method should be over written");
        };
        Entity.prototype.processAction = function () {
            this.checkBombDrop();
        };
        return Entity;
    }());
    Bomberman.Entity = Entity;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(battle, location, colour) {
            var _this = _super.call(this, battle, location) || this;
            _this.playerColour = Bomberman.PlayerColour.White;
            _this.playerColour = colour;
            _this.entityType = Bomberman.EntityType.Local;
            _this.bmp = new Phaser.Sprite(_this.game, -16, -28, "player");
            _this.bmp.animations.add("down", [1, 0, 2, 0].multiplyByPlayer(_this.playerColour));
            _this.bmp.animations.add("right", [4, 3, 5, 3].multiplyByPlayer(_this.playerColour));
            _this.bmp.animations.add("left", [7, 6, 8, 6].multiplyByPlayer(_this.playerColour));
            _this.bmp.animations.add("up", [10, 9, 11, 9].multiplyByPlayer(_this.playerColour));
            _this.bmp.animations.add("down-idle", [0].multiplyByPlayer(_this.playerColour));
            _this.bmp.animations.add("right-idle", [3].multiplyByPlayer(_this.playerColour));
            _this.bmp.animations.add("left-idle", [6].multiplyByPlayer(_this.playerColour));
            _this.bmp.animations.add("up-idle", [9].multiplyByPlayer(_this.playerColour));
            _this.bmp.animations.add("die", [12, 13, 14, 15, 16, 17, 18, 19, 20].multiplyByPlayer(_this.playerColour));
            _this.bmp.animations.play("down-idle", _this.animWalkSpeed(), true);
            var position = Bomberman.Utils.convertToBitmapPosition(location);
            _this.container = _this.game.add.group();
            _this.container.name = "Player";
            _this.container.x = position.x;
            _this.container.y = position.y;
            _this.container.addChild(_this.bmp);
            _this.updateLocation();
            _this.bombs = [];
            _this.bombQuantity = 1;
            _this.bombStrength = 2;
            _this.canUseItems = true;
            return _this;
        }
        Player.prototype.update = function (delta) {
            if (!this.alive) {
                return;
            }
            var movement = Bomberman.Move.None;
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                movement = Bomberman.Move.Up;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                movement = Bomberman.Move.Down;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                movement = Bomberman.Move.Left;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                movement = Bomberman.Move.Right;
            }
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                this.action = Bomberman.Action.Bomb;
            }
            ;
            this.processMovement(movement, delta);
            this.processAction();
        };
        Player.prototype.setName = function (name) {
            this.name = name;
        };
        Player.prototype.die = function () {
            _super.prototype.die.call(this);
            this.redistributeItems();
        };
        Player.prototype.bombsLeft = function () {
            return this.bombQuantity - this.bombs.length;
        };
        Player.prototype.processMovement = function (movement, delta) {
            var originalValues = {
                x: this.container.x,
                y: this.container.y,
                d: this.direction
            };
            var position = new Bomberman.Point(this.container.x, this.container.y);
            var dirX = 0;
            var dirY = 0;
            if (movement === Bomberman.Move.Up) {
                position.y -= this.speed * delta;
                dirY = -1;
                this.direction = Bomberman.Direction.Up;
                this.bmp.animations.play("up", this.animWalkSpeed(), true);
            }
            else if (movement === Bomberman.Move.Down) {
                position.y += this.speed * delta;
                dirY = 1;
                this.direction = Bomberman.Direction.Down;
                this.bmp.animations.play("down", this.animWalkSpeed(), true);
            }
            else if (movement === Bomberman.Move.Left) {
                position.x -= this.speed * delta;
                dirX = -1;
                this.direction = Bomberman.Direction.Left;
                this.bmp.animations.play("left", this.animWalkSpeed(), true);
            }
            else if (movement === Bomberman.Move.Right) {
                position.x += this.speed * delta;
                dirX = 1;
                this.direction = Bomberman.Direction.Right;
                this.bmp.animations.play("right", this.animWalkSpeed(), true);
            }
            else {
                this.bmp.animations.play(Bomberman.Utils.convertDirectionToString(this.direction) + "-idle", this.animWalkSpeed(), true);
            }
            if (position.x !== this.container.x || position.y !== this.container.y) {
                if (!this.detectBombCollision(position)) {
                    if (this.detectWallCollision(position)) {
                        var cornerFix = this.getCornerFix(dirX, dirY, delta);
                        if (cornerFix) {
                            var fixX = 0, fixY = 0;
                            if (dirX) {
                                fixY = (cornerFix.y - this.container.y) > 0 ? 1 : -1;
                                this.bmp.animations.play(fixY === 1 ? "down" : "up", this.animWalkSpeed(), true);
                            }
                            else {
                                fixX = (cornerFix.x - this.container.x) > 0 ? 1 : -1;
                                this.bmp.animations.play(fixX === 1 ? "right" : "left", this.animWalkSpeed(), true);
                            }
                            var diffX = this.container.x % Bomberman.cfg.tile.size;
                            if (diffX > Bomberman.cfg.tile.size / 2) {
                                diffX = Bomberman.cfg.tile.size - diffX;
                            }
                            var diffY = this.container.y % Bomberman.cfg.tile.size;
                            if (diffY > Bomberman.cfg.tile.size / 2) {
                                diffY = Bomberman.cfg.tile.size - diffY;
                            }
                            if (diffX < 0) {
                                this.container.x += Math.max(fixX * this.speed * delta, diffX);
                            }
                            else {
                                this.container.x += Math.min(fixX * this.speed * delta, diffX);
                            }
                            if (diffY < 0) {
                                this.container.y += Math.max(fixY * this.speed * delta, diffY);
                            }
                            else {
                                this.container.y += Math.min(fixY * this.speed * delta, diffY);
                            }
                            this.updateLocation();
                        }
                    }
                    else {
                        this.container.x = position.x;
                        this.container.y = position.y;
                        this.updateLocation();
                    }
                }
            }
            if (this.detectDeath()) {
                this.die();
            }
            this.detectItemCollision();
        };
        return Player;
    }(Bomberman.Entity));
    Bomberman.Player = Player;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Bot = (function (_super) {
        __extends(Bot, _super);
        function Bot(battle, location, colour) {
            var _this = _super.call(this, battle, location, colour) || this;
            _this.AI_VIEW_SIZE = 6;
            _this.BURN_MARK = [
                [0, 0, 0, 0, 0, 0],
                [10, 8, 5, 3, 2, 1],
                [20, 17, 15, 12, 10, 5],
                [30, 26, 24, 22, 15, 10]
            ];
            _this.entityType = Bomberman.EntityType.Bot;
            _this.move = Bomberman.Move.None;
            _this.action = Bomberman.Action.None;
            _this.debug = new Bomberman.Debug(_this.battle);
            _this.matrix = Bomberman.Utils.matrix(Bomberman.cfg.tile.height, Bomberman.cfg.tile.width, 0);
            _this.updatePathMatrix();
            _this.stopTimeLeft = 0.5;
            _this.moveTimeLeft = 0.0;
            _this.setBotMode(Bomberman.BotMode.Think);
            return _this;
        }
        Bot.prototype.update = function (delta) {
            this.renderDebugValues();
            this.tilesInRange = this.battle.getTilesInRange(this.location, this.AI_VIEW_SIZE);
            this.dangerPositions = this.battle.getDangerPositions();
            if (!this.isAlive()) {
                return;
            }
            if (this.stopTimeLeft <= 0) {
                if (this.moveTimeLeft <= 0) {
                    this.updatePathMatrix();
                    if (this.botMode === Bomberman.BotMode.Think) {
                        this.modeThink();
                    }
                    switch (this.botMode) {
                        case Bomberman.BotMode.Item:
                            this.modeItem(delta);
                            break;
                        case Bomberman.BotMode.Defend:
                            this.modeDefend(delta);
                            break;
                    }
                }
                this.processMovement(this.move, delta);
                this.processAction();
                this.moveTimeLeft -= delta;
            }
            else {
                this.processMovement(Bomberman.Move.None, delta);
                this.processAction();
                this.stopTimeLeft -= delta;
            }
        };
        Bot.prototype.setBotMode = function (mode) {
            if (mode === Bomberman.BotMode.Think) {
                switch (this.botMode) {
                    case Bomberman.BotMode.Item:
                        this.stopTimeLeft = 0.08 + Bomberman.Utils.randomNumber(40) / 1000;
                        break;
                    case Bomberman.BotMode.Attack:
                        this.stopTimeLeft = 0.20 + Bomberman.Utils.randomNumber(40) / 1000;
                        break;
                    case Bomberman.BotMode.Defend:
                        this.stopTimeLeft = 0.12 + Bomberman.Utils.randomNumber(40) / 1000;
                        break;
                    case Bomberman.BotMode.Walk:
                        this.stopTimeLeft = 0.22 + Bomberman.Utils.randomNumber(40) / 1000;
                        break;
                }
            }
            this.botMode = mode;
        };
        Bot.prototype.modeThink = function () {
            var bestLocation;
            var bestScore;
            if (_.some(this.dangerPositions, this.location)) {
                this.setBotMode(Bomberman.BotMode.Defend);
                return;
            }
            bestLocation = null;
            bestScore = 0;
            for (var _i = 0, _a = this.tilesInRange; _i < _a.length; _i++) {
                var tile = _a[_i];
                var path = this.findPath(this.location, tile.location);
                var pathLength = this.findPathLength(tile.location);
                if (tile.getNearSoftWalls() > 0 &&
                    pathLength !== -1 &&
                    pathLength < (this.AI_VIEW_SIZE) &&
                    (tile.getDeadEnd() === -1 || !this.isEnemyNear(this.location)) &&
                    !_.some(this.dangerPositions, tile.location) &&
                    this.canDropBombAt(tile.location)) {
                    this.debug.tileText(tile, tile.getNearSoftWalls());
                    if (bestScore < this.BURN_MARK[tile.getNearSoftWalls()][(path.length - 1)] ||
                        (bestScore === this.BURN_MARK[tile.getNearSoftWalls()][pathLength] && Bomberman.Utils.randomNumber(100) >= 50)) {
                        bestLocation = tile;
                        bestScore = this.BURN_MARK[tile.getNearSoftWalls()][(path.length - 1)];
                    }
                }
            }
            this.debug.markTile(bestLocation, Bomberman.DebugTile.Highlight);
            this.debug.showValue("bestScore", bestScore);
            if (bestScore > 0) {
                this.itemGoal = bestLocation.location;
                this.itemDropBomb = true;
                this.setBotMode(Bomberman.BotMode.Item);
                return;
            }
        };
        Bot.prototype.modeItem = function (delta) {
            this.action = Bomberman.Action.None;
            this.move = Bomberman.Move.None;
            if ((this.isEnemyNearAndFront() &&
                this.canDropBombAt(this.location) &&
                Bomberman.Utils.randomNumber(100) < 70) || (this.itemDropBomb &&
                !this.canDropBombAt(this.location))) {
                this.setBotMode(Bomberman.BotMode.Think);
                return;
            }
            var goalReached = false;
            if (this.findPathLength(this.itemGoal) >= 0) {
                goalReached = this.goto(this.itemGoal);
            }
            else {
                this.setBotMode(Bomberman.BotMode.Think);
                return;
            }
            if (goalReached && this.itemDropBomb && this.bombsLeft() > 0) {
                this.action = Bomberman.Action.Bomb;
                this.itemGoal = this.location;
                this.itemDropBomb = false;
            }
            else if (goalReached && !this.itemDropBomb) {
                this.setBotMode(Bomberman.BotMode.Think);
            }
        };
        Bot.prototype.modeDefend = function (delta) {
            if (!_.some(this.dangerPositions, this.location)) {
                this.move = Bomberman.Move.None;
                this.action = Bomberman.Action.None;
                this.setBotMode(Bomberman.BotMode.Think);
                return;
            }
            var found = false;
            var bestLocation;
            var bestDistance = 999;
            var isDeadEnd = true;
            var tiles = this.battle.getTilesInRange(this.location, this.AI_VIEW_SIZE);
            for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
                var tile = tiles_1[_i];
                var pathLength = this.findPathLength(tile.location);
                if (pathLength !== -1
                    && (this.isEnemyNear(tile.location) ? tile.getDeadEnd() === -1 : tile.getDeadEnd() !== -1 || !isDeadEnd)
                    && !_.some(this.dangerPositions, tile.location)
                    && (pathLength < bestDistance
                        || (pathLength === bestDistance && Bomberman.Utils.randomNumber(100) >= 50))) {
                    found = true;
                    bestLocation = tile.location;
                    bestDistance = pathLength;
                    isDeadEnd = tile.getDeadEnd() !== -1;
                }
            }
            if (found) {
                console.log(bestLocation);
                this.goto(bestLocation);
            }
            else {
                this.move = Bomberman.Move.None;
                this.moveTimeLeft - 0;
            }
        };
        Bot.prototype.goto = function (location) {
            if (this.location === location || this.findPathLength(location) < 1) {
                this.move = Bomberman.Move.None;
            }
            else {
                var path = this.findPath(this.location, location);
                var step = path[1];
                if (step[0] < this.location.x) {
                    this.move = Bomberman.Move.Left;
                }
                else if (step[0] > this.location.x) {
                    this.move = Bomberman.Move.Right;
                }
                else if (step[1] < this.location.y) {
                    this.move = Bomberman.Move.Up;
                }
                else if (step[1] > this.location.y) {
                    this.move = Bomberman.Move.Down;
                }
            }
            if (this.move !== Bomberman.Move.None) {
                this.moveTimeLeft = Bomberman.cfg.tile.size / this.speed;
            }
            else {
                this.moveTimeLeft = 0;
            }
            return this.location.equalTo(this.itemGoal);
        };
        Bot.prototype.renderDebugValues = function () {
            this.debug.showValue("moveTimeLeft", this.moveTimeLeft.toFixed(5));
            this.debug.showValue("stopTimeLeft", this.stopTimeLeft.toFixed(5));
            this.debug.showValue("enemyNear?", this.isEnemyNearAndFront());
            this.debug.showValue("atDestination", this.location.equalTo(this.itemGoal || new Bomberman.Point(0, 0)));
            this.debug.showValue("itemDropBomb", this.itemDropBomb);
            var move = "";
            switch (this.move) {
                case Bomberman.Move.Down:
                    move = "Down";
                    break;
                case Bomberman.Move.Left:
                    move = "Left";
                    break;
                case Bomberman.Move.None:
                    move = "None";
                    break;
                case Bomberman.Move.Right:
                    move = "Right";
                    break;
                case Bomberman.Move.Up:
                    move = "Up";
                    break;
            }
            this.debug.showValue("Move", move);
            var mode = "";
            switch (this.botMode) {
                case Bomberman.BotMode.Attack:
                    mode = "Attack";
                    break;
                case Bomberman.BotMode.Defend:
                    mode = "Defend";
                    break;
                case Bomberman.BotMode.Item:
                    mode = "Item";
                    break;
                case Bomberman.BotMode.Think:
                    mode = "Think";
                    break;
                case Bomberman.BotMode.Walk:
                    mode = "Walk";
                    break;
            }
            this.debug.showValue("Mode", mode);
            this.debug.renderValues();
            this.debug.markTiles(this.tilesInRange, Bomberman.DebugTile.Movement);
            this.debug.markPoints(this.dangerPositions, Bomberman.DebugTile.Danger);
        };
        Bot.prototype.canDropBombAt = function (location) {
            if (this.findPathLength(location) < 0 ||
                this.battle.getBomb(location)) {
                return false;
            }
            if (!_.some(this.dangerPositions, location)) {
                var tile = this.battle.getBaseTile(location);
                if ((!tile.tileLeft() || _.some(this.dangerPositions, tile.tileLeft().location)) &&
                    (!tile.tileRight() || _.some(this.dangerPositions, tile.tileRight().location)) &&
                    (!tile.tileUp() || _.some(this.dangerPositions, tile.tileUp().location)) &&
                    (!tile.tileDown() || _.some(this.dangerPositions, tile.tileDown().location))) {
                    return false;
                }
            }
            return true;
        };
        Bot.prototype.isEnemyNearAndFront = function () {
            if (this.battle.getBomb(this.location)) {
                return false;
            }
            var entities = this.battle.getEntities(this.location);
            if (entities.length > 1) {
                for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
                    var entity = entities_1[_i];
                    if (entity !== this && entity.isAlive()) {
                        return true;
                    }
                }
            }
            var MAX_NEAR_DISTANCE = 3;
            var checkLocation = this.location;
            var tiles;
            for (var direction = 1; direction <= 4; direction++) {
                tiles = this.tilesFromCenter(this.location, direction, MAX_NEAR_DISTANCE);
                for (var _a = 0, tiles_2 = tiles; _a < tiles_2.length; _a++) {
                    var tile = tiles_2[_a];
                    if (tile.isBlocked() || tile.isBomb()) {
                        break;
                    }
                    else if (this.battle.getEntity(tile.location)) {
                        return true;
                    }
                }
            }
            return false;
        };
        Bot.prototype.isEnemyNear = function (location) {
            for (var _i = 0, _a = this.battle.entities; _i < _a.length; _i++) {
                var entity = _a[_i];
                if (entity.isAlive() &&
                    Math.abs(entity.location.x - location.x) + Math.abs(entity.location.y - location.y) <= 3 &&
                    Bomberman.Utils.randomNumber(100) < 92) {
                    return true;
                }
            }
            return false;
        };
        Bot.prototype.updatePathMatrix = function () {
            this.debug.clearAll(Bomberman.DebugTile.Path);
            for (var _i = 0, _a = this.battle.baseTiles; _i < _a.length; _i++) {
                var tile = _a[_i];
                if ((tile.isBlocked() || tile.isBomb()) && !tile.location.equalTo(this.location)) {
                    this.matrix[tile.location.y][tile.location.x] = 1;
                }
                else {
                    this.matrix[tile.location.y][tile.location.x] = 0;
                    this.debug.markTile(tile, Bomberman.DebugTile.Path, false);
                }
            }
            this.grid = new PF.Grid(this.matrix);
        };
        Bot.prototype.findPath = function (source, destination) {
            var grid = this.grid.clone();
            var finder = new PF.AStarFinder({
                weight: 10
            });
            return finder.findPath(source.x, source.y, destination.x, destination.y, grid);
        };
        Bot.prototype.findPathLength = function (destination) {
            var path = this.findPath(this.location, destination);
            return path.length - 1;
        };
        Bot.prototype.tilesFromCenter = function (location, direction, distance) {
            var addition;
            var point = location.clone();
            var output = [];
            for (var j = 1; j <= distance; j++) {
                point = location.moveDirection(direction);
                var tile = this.battle.getBaseTile(point);
                if (tile) {
                    output.push(tile);
                }
            }
            return output;
        };
        return Bot;
    }(Bomberman.Player));
    Bomberman.Bot = Bot;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Monster = (function (_super) {
        __extends(Monster, _super);
        function Monster(battle, location) {
            var _this = _super.call(this, battle, location) || this;
            _this.entityType = Bomberman.EntityType.Monster;
            _this.stopTimeLeft = 0.3;
            _this.moveTimeLeft = 0;
            _this.stopTime = 2;
            _this.setupInitialDirection();
            return _this;
        }
        Monster.prototype.update = function (delta) {
            if (!this.isAlive()) {
                return;
            }
            if (this.stopTimeLeft <= 0) {
                this.isMoving = true;
                if (this.moveTimeLeft <= 0) {
                    this.goal = this.findGoal();
                    this.setMovement();
                }
                this.processMovement(this.move, delta);
                this.processAction();
                this.moveTimeLeft -= delta;
            }
            else {
                this.processMovement(Bomberman.Move.None, delta);
                this.processAction();
                this.stopTimeLeft -= delta;
            }
        };
        Monster.prototype.stop = function () {
            this.isMoving = false;
            this.stopTimeLeft = this.calculateStopTime();
            return this;
        };
        Monster.prototype.die = function () {
            var self = this;
            console.log("die");
            this.dying = true;
            this.alive = false;
            this.bmp.animations.play("die", 10, false, true);
            this.bmp.animations.currentAnim.onComplete.add(function () {
                self.dying = false;
                console.log("CONFIRMED KILL");
            });
        };
        Monster.prototype.calculateStopTime = function () {
            return this.stopTime;
        };
        Monster.prototype.findGoal = function () {
            console.log("ERROR: Should be overwritten by Monster class");
            return;
        };
        Monster.prototype.setupInitialDirection = function () {
            this.direction = Bomberman.Direction.Left;
            return;
        };
        Monster.prototype.setMovement = function () {
            var diff = this.location.difference(this.goal);
            if (diff.x === -1) {
                this.move = Bomberman.Move.Left;
            }
            else if (diff.x === 1) {
                this.move = Bomberman.Move.Right;
            }
            else if (diff.y === -1) {
                this.move = Bomberman.Move.Up;
            }
            else if (diff.y === 1) {
                this.move = Bomberman.Move.Down;
            }
            else {
                this.move = Bomberman.Move.None;
            }
            this.moveTimeLeft = Bomberman.cfg.tile.size / this.speed;
            return this;
        };
        Monster.prototype.processMovement = function (movement, delta) {
            if (!this.isAlive()) {
                return;
            }
            if (this.detectDeath()) {
                this.die();
                return;
            }
            if (!this.isMoving) {
                this.bmp.animations.play(Bomberman.Utils.convertDirectionToString(this.direction) + "-idle", this.animWalkSpeed(), true);
                return;
            }
            var originalValues = {
                x: this.container.x,
                y: this.container.y,
                d: this.direction
            };
            var position = new Bomberman.Point(this.container.x, this.container.y);
            var dirX = 0, dirY = 0;
            if (movement === Bomberman.Move.Up) {
                position.y -= this.speed * delta;
                dirY = -1;
                this.direction = Bomberman.Direction.Up;
                this.bmp.animations.play("up", this.animWalkSpeed(), true);
                this.isMoving = true;
            }
            else if (movement === Bomberman.Move.Down) {
                position.y += this.speed * delta;
                dirY = 1;
                this.direction = Bomberman.Direction.Down;
                this.bmp.animations.play("down", this.animWalkSpeed(), true);
                this.isMoving = true;
            }
            else if (movement === Bomberman.Move.Left) {
                position.x -= this.speed * delta;
                dirX = -1;
                this.direction = Bomberman.Direction.Left;
                this.bmp.animations.play("left", this.animWalkSpeed(), true);
                this.isMoving = true;
            }
            else if (movement === Bomberman.Move.Right) {
                position.x += this.speed * delta;
                dirX = 1;
                this.direction = Bomberman.Direction.Right;
                this.bmp.animations.play("right", this.animWalkSpeed(), true);
                this.isMoving = true;
            }
            else {
                this.bmp.animations.play(Bomberman.Utils.convertDirectionToString(this.direction) + "-idle", this.animWalkSpeed(), true);
                this.isMoving = false;
            }
            if (!this.detectBombCollision(position)) {
                if (this.detectWallCollision(position)) {
                    var cornerFix = this.getCornerFix(dirX, dirY, delta);
                    if (cornerFix) {
                        var fixX = 0, fixY = 0;
                        if (dirX) {
                            fixY = (cornerFix.y - this.container.y) > 0 ? 1 : -1;
                            this.bmp.animations.play(fixY === 1 ? "down" : "up", this.animWalkSpeed(), true);
                        }
                        else {
                            fixX = (cornerFix.x - this.container.x) > 0 ? 1 : -1;
                            this.bmp.animations.play(fixX === 1 ? "right" : "left", this.animWalkSpeed(), true);
                        }
                        var diffX = this.container.x % Bomberman.cfg.tile.size;
                        if (diffX > Bomberman.cfg.tile.size / 2) {
                            diffX = Bomberman.cfg.tile.size - diffX;
                        }
                        var diffY = this.container.y % Bomberman.cfg.tile.size;
                        if (diffY > Bomberman.cfg.tile.size / 2) {
                            diffY = Bomberman.cfg.tile.size - diffY;
                        }
                        if (diffX < 0) {
                            this.container.x += Math.max(fixX * this.speed * delta, diffX);
                        }
                        else {
                            this.container.x += Math.min(fixX * this.speed * delta, diffX);
                        }
                        if (diffY < 0) {
                            this.container.y += Math.max(fixY * this.speed * delta, diffY);
                        }
                        else {
                            this.container.y += Math.min(fixY * this.speed * delta, diffY);
                        }
                        this.updateLocation();
                    }
                }
                else {
                    this.container.x = position.x;
                    this.container.y = position.y;
                    this.updateLocation();
                }
            }
        };
        return Monster;
    }(Bomberman.Entity));
    Bomberman.Monster = Monster;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var MonsterBlob = (function (_super) {
        __extends(MonsterBlob, _super);
        function MonsterBlob(battle, location) {
            var _this = _super.call(this, battle, location) || this;
            _this.monsterType = Bomberman.MonsterType.Blue;
            _this.bmp = new Phaser.Sprite(_this.game, 0, -16, "monster-blob");
            _this.bmp.animations.add("down", [0, 1, 0, 2]);
            _this.bmp.animations.add("right", [3, 4, 3, 5]);
            _this.bmp.animations.add("left", [6, 7, 6, 8]);
            _this.bmp.animations.add("up", [9, 10, 9, 11]);
            _this.bmp.animations.add("down-idle", [0]);
            _this.bmp.animations.add("right-idle", [3]);
            _this.bmp.animations.add("left-idle", [6]);
            _this.bmp.animations.add("up-idle", [9]);
            _this.bmp.animations.add("die", [12, 13, 14, 15, 16, 17, 18, 19, 20]);
            _this.bmp.animations.play(Bomberman.Utils.convertDirectionToString(_this.direction) + "-idle", _this.animWalkSpeed(), true);
            var position = Bomberman.Utils.convertToBitmapPosition(location);
            _this.container = _this.game.add.group();
            _this.container.name = "Blob";
            _this.container.x = position.x;
            _this.container.y = position.y;
            _this.container.addChild(_this.bmp);
            _this.battle.entityView.addChild(_this.container);
            _this.lives = 1;
            _this.speed = 300;
            _this.stopTime = .6;
            _this.updateLocation();
            _this.setupAI();
            return _this;
        }
        MonsterBlob.prototype.setupAI = function () {
        };
        MonsterBlob.prototype.findGoal = function () {
            if (this.canMove(this.direction)) {
                return this.location.moveDirection(this.direction);
            }
            else {
                this.stop();
                var direction = Bomberman.Utils.oppositeDirection(this.direction);
                var possibleDirections = this.possibleMoves();
                var randomDirection = Bomberman.Utils.randomFromArray(possibleDirections);
                return this.location.moveDirection(randomDirection);
            }
        };
        MonsterBlob.prototype.calculateStopTime = function () {
            var rndTime = this.stopTime * 1000;
            return (Bomberman.Utils.randomNumber(rndTime) / 1000) + .1;
        };
        return MonsterBlob;
    }(Bomberman.Monster));
    Bomberman.MonsterBlob = MonsterBlob;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var MonsterBlue = (function (_super) {
        __extends(MonsterBlue, _super);
        function MonsterBlue(battle, location) {
            var _this = _super.call(this, battle, location) || this;
            _this.monsterType = Bomberman.MonsterType.Blue;
            _this.bmp = new Phaser.Sprite(_this.game, -32, -64, "monster-blue");
            _this.bmp.animations.add("down", [0, 1, 2, 1]);
            _this.bmp.animations.add("right", [3, 4, 5, 3]);
            _this.bmp.animations.add("up", [6, 7, 8, 7]);
            _this.bmp.animations.add("left", [9, 10, 11, 10]);
            _this.bmp.animations.add("down-idle", [0]);
            _this.bmp.animations.add("right-idle", [3]);
            _this.bmp.animations.add("up-idle", [6]);
            _this.bmp.animations.add("left-idle", [9]);
            _this.bmp.animations.add("die", [12, 13, 14, 15, 16]);
            _this.bmp.animations.play("down-idle", _this.animWalkSpeed(), true);
            var position = Bomberman.Utils.convertToBitmapPosition(location);
            _this.container = _this.game.add.group();
            _this.container.name = "Blue";
            _this.container.x = position.x;
            _this.container.y = position.y;
            _this.container.addChild(_this.bmp);
            _this.battle.entityView.addChild(_this.container);
            _this.lives = 3;
            _this.speed = 280;
            _this.stopTime = .4;
            _this.updateLocation();
            _this.setupAI();
            return _this;
        }
        MonsterBlue.prototype.setupAI = function () {
        };
        MonsterBlue.prototype.findGoal = function () {
            var possibleDirections = this.possibleMoves();
            var direction = this.direction;
            if (this.canMove(this.direction)) {
                if (possibleDirections.length > 2) {
                    if (Bomberman.Utils.randomNumber(100) > 80) {
                        this.stop();
                        while (direction === this.direction || direction === Bomberman.Utils.oppositeDirection(this.direction)) {
                            direction = Bomberman.Utils.randomFromArray(possibleDirections);
                        }
                    }
                }
                return this.location.moveDirection(direction);
            }
            else {
                this.stop();
                var direction_1 = Bomberman.Utils.oppositeDirection(this.direction);
                var randomDirection = Bomberman.Utils.randomFromArray(possibleDirections);
                return this.location.moveDirection(randomDirection);
            }
        };
        MonsterBlue.prototype.calculateStopTime = function () {
            var rndTime = this.stopTime * 1000;
            return (Bomberman.Utils.randomNumber(rndTime) / 1000);
        };
        return MonsterBlue;
    }(Bomberman.Monster));
    Bomberman.MonsterBlue = MonsterBlue;
})(Bomberman || (Bomberman = {}));
Array.prototype.multiplyBy = function (multiply, factor) {
    if (factor === void 0) { factor = 1; }
    var output = [];
    for (var _i = 0, _a = this; _i < _a.length; _i++) {
        var out = _a[_i];
        output.push(out + (multiply * factor));
    }
    return output;
};
Array.prototype.multiplyByPlayer = function (colour) {
    var output = [];
    for (var _i = 0, _a = this; _i < _a.length; _i++) {
        var out = _a[_i];
        output.push(out + (colour * 24));
    }
    return output;
};
var Bomberman;
(function (Bomberman) {
    var GameEngine = (function (_super) {
        __extends(GameEngine, _super);
        function GameEngine() {
            var _this = _super.call(this, Bomberman.cfg.game.width, Bomberman.cfg.game.height, Phaser.WEBGL, 'game', null, true) || this;
            _this.state.add("Boot", Bomberman.Boot, false);
            _this.state.add("Preloader", Bomberman.Preloader, false);
            _this.state.add("TitleScreen", Bomberman.TitleScreen, false);
            _this.state.add("Loading", Bomberman.Loading, false);
            _this.state.add("Battle", Bomberman.Battle, false);
            _this.state.start("Boot");
            return _this;
        }
        return GameEngine;
    }(Phaser.Game));
    Bomberman.GameEngine = GameEngine;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Point = (function () {
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        Point.prototype.equalTo = function (pt) {
            return (this.x === pt.x && this.y == pt.y);
        };
        Point.prototype.difference = function (pt) {
            return new Point(pt.x - this.x, pt.y - this.y);
        };
        Point.prototype.pTheorem = function (pt) {
            return Math.floor(Math.sqrt(((pt.x - this.x) * (pt.x - this.x)) + ((pt.y - this.y) * (pt.y - this.y))));
        };
        Point.prototype.radiusDistance = function (pt) {
            var dx = pt.x - this.x;
            dx *= dx;
            var dy = pt.y - this.y;
            dy *= dy;
            return Math.sqrt(dx + dy);
        };
        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };
        Point.prototype.boardOpposite = function () {
            var x, y = 0;
            if (this.x < 9) {
                x = 18 - this.x;
            }
            else if (this.x > 9) {
                x = this.x - 9;
            }
            else if (this.x === 9) {
                x = 9;
            }
            if (this.y < 6) {
                y = 12 - this.y;
            }
            else if (this.y > 6) {
                y = this.y - 6;
            }
            else if (this.y === 6) {
                y = 6;
            }
            x = 18 - this.x;
            y = 12 - this.y;
            return new Point(x, y);
        };
        Point.prototype.moveDirection = function (dir) {
            var dirX = 0, dirY = 0;
            if (dir === Bomberman.Direction.Right) {
                dirX = 1;
            }
            else if (dir === Bomberman.Direction.Left) {
                dirX = -1;
            }
            else if (dir === Bomberman.Direction.Down) {
                dirY = 1;
            }
            else if (dir === Bomberman.Direction.Up) {
                dirY = -1;
            }
            return new Point(this.x + dirX, this.y + dirY);
        };
        return Point;
    }());
    Bomberman.Point = Point;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Stage;
    (function (Stage) {
        Stage[Stage["Toys"] = 1] = "Toys";
        Stage[Stage["Micro"] = 2] = "Micro";
        Stage[Stage["UFO"] = 3] = "UFO";
        Stage[Stage["Snow"] = 4] = "Snow";
        Stage[Stage["Crayons"] = 5] = "Crayons";
        Stage[Stage["Classic"] = 6] = "Classic";
    })(Stage = Bomberman.Stage || (Bomberman.Stage = {}));
    var GameType;
    (function (GameType) {
        GameType[GameType["Local"] = 0] = "Local";
        GameType[GameType["Multiplayer"] = 1] = "Multiplayer";
    })(GameType = Bomberman.GameType || (Bomberman.GameType = {}));
    var EntityType;
    (function (EntityType) {
        EntityType[EntityType["Local"] = 0] = "Local";
        EntityType[EntityType["Remote"] = 1] = "Remote";
        EntityType[EntityType["Bot"] = 2] = "Bot";
        EntityType[EntityType["Monster"] = 3] = "Monster";
    })(EntityType = Bomberman.EntityType || (Bomberman.EntityType = {}));
    var MonsterType;
    (function (MonsterType) {
        MonsterType[MonsterType["Blue"] = 0] = "Blue";
        MonsterType[MonsterType["Blob"] = 1] = "Blob";
        MonsterType[MonsterType["Bulb"] = 2] = "Bulb";
        MonsterType[MonsterType["Mouse"] = 3] = "Mouse";
        MonsterType[MonsterType["Orange"] = 4] = "Orange";
        MonsterType[MonsterType["Snail"] = 5] = "Snail";
    })(MonsterType = Bomberman.MonsterType || (Bomberman.MonsterType = {}));
    var TileType;
    (function (TileType) {
        TileType[TileType["Base"] = 0] = "Base";
        TileType[TileType["Soft"] = 1] = "Soft";
        TileType[TileType["Hard"] = 2] = "Hard";
    })(TileType = Bomberman.TileType || (Bomberman.TileType = {}));
    var PlayerColour;
    (function (PlayerColour) {
        PlayerColour[PlayerColour["None"] = 0] = "None";
        PlayerColour[PlayerColour["White"] = 1] = "White";
        PlayerColour[PlayerColour["Green"] = 2] = "Green";
        PlayerColour[PlayerColour["Red"] = 3] = "Red";
        PlayerColour[PlayerColour["Blue"] = 4] = "Blue";
    })(PlayerColour = Bomberman.PlayerColour || (Bomberman.PlayerColour = {}));
    var Direction;
    (function (Direction) {
        Direction[Direction["None"] = 0] = "None";
        Direction[Direction["Up"] = 1] = "Up";
        Direction[Direction["Right"] = 2] = "Right";
        Direction[Direction["Down"] = 3] = "Down";
        Direction[Direction["Left"] = 4] = "Left";
    })(Direction = Bomberman.Direction || (Bomberman.Direction = {}));
    var Move;
    (function (Move) {
        Move[Move["None"] = 0] = "None";
        Move[Move["Up"] = 1] = "Up";
        Move[Move["Right"] = 2] = "Right";
        Move[Move["Down"] = 3] = "Down";
        Move[Move["Left"] = 4] = "Left";
    })(Move = Bomberman.Move || (Bomberman.Move = {}));
    var Action;
    (function (Action) {
        Action[Action["None"] = 0] = "None";
        Action[Action["Bomb"] = 1] = "Bomb";
    })(Action = Bomberman.Action || (Bomberman.Action = {}));
    var BotMode;
    (function (BotMode) {
        BotMode[BotMode["Think"] = 0] = "Think";
        BotMode[BotMode["Item"] = 1] = "Item";
        BotMode[BotMode["Attack"] = 2] = "Attack";
        BotMode[BotMode["Defend"] = 3] = "Defend";
        BotMode[BotMode["Walk"] = 4] = "Walk";
    })(BotMode = Bomberman.BotMode || (Bomberman.BotMode = {}));
    var ItemType;
    (function (ItemType) {
        ItemType[ItemType["None"] = 0] = "None";
        ItemType[ItemType["BombUp"] = 1] = "BombUp";
        ItemType[ItemType["FireUp"] = 2] = "FireUp";
    })(ItemType = Bomberman.ItemType || (Bomberman.ItemType = {}));
    var DebugTile;
    (function (DebugTile) {
        DebugTile[DebugTile["Danger"] = 0] = "Danger";
        DebugTile[DebugTile["Movement"] = 1] = "Movement";
        DebugTile[DebugTile["Path"] = 2] = "Path";
        DebugTile[DebugTile["Highlight"] = 3] = "Highlight";
    })(DebugTile = Bomberman.DebugTile || (Bomberman.DebugTile = {}));
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Map = (function () {
        function Map(config) {
            this.closeInPoint = new Bomberman.Point(1, 0);
            this.closeInDirection = Bomberman.Direction.Down;
            console.log(config);
            if (config) {
                this.config = config;
            }
            this.shadowIntensity = 0.2;
            this.mapData = {
                base: [],
                blocks: [],
                items: [],
                players: [],
                bots: [],
                monsters: []
            };
            this.initialItems = [
                { type: Bomberman.ItemType.BombUp, qty: 10 },
                { type: Bomberman.ItemType.FireUp, qty: 15 }
            ];
        }
        Map.prototype.generateStartData = function (player) {
            this.generateStartTiles();
            this.generateStartItems();
            return this.mapData;
        };
        Map.prototype.generateStartTiles = function () {
            var baseData = Bomberman.Utils.CSVToArray(this.getBaseFloor());
            var blockData = Bomberman.Utils.CSVToArray(this.getBlocks());
            for (var row = 0; row < baseData.length; row++) {
                for (var col = 0; col < baseData[row].length; col++) {
                    this.mapData.base.push({
                        name: this.tileNumberToName(baseData[row][col]),
                        type: Bomberman.TileType.Base,
                        location: new Bomberman.Point(col, row)
                    });
                }
            }
            for (var row = 0; row < blockData.length; row++) {
                for (var col = 0; col < blockData[row].length; col++) {
                    if (blockData[row][col] !== -1) {
                        this.mapData.blocks.push({
                            name: this.tileNumberToName(blockData[row][col]),
                            type: this.tileNumberToType(blockData[row][col]),
                            location: new Bomberman.Point(col, row)
                        });
                    }
                }
            }
        };
        Map.prototype.generateStartItems = function () {
            var tiles = _.filter(this.mapData.blocks, function (o) {
                return o.type === Bomberman.TileType.Soft;
            });
            tiles.sort(function () {
                return 0.5 - Math.random();
            });
            for (var _i = 0, _a = this.initialItems; _i < _a.length; _i++) {
                var item = _a[_i];
                for (var i = 0; i < item.qty; i++) {
                    var tile = tiles[0];
                    if (tile) {
                        tiles.splice(0, 1);
                        this.mapData.items.push({
                            type: item.type,
                            location: tile.location
                        });
                    }
                }
            }
        };
        Map.prototype.generateStartingMonsters = function () {
            return;
        };
        Map.prototype.setup = function (battle) {
            this.battle = battle;
            this.game = this.battle.game;
            var data = jsonpack.unpack(this.config.data);
            for (var _i = 0, _a = data.base; _i < _a.length; _i++) {
                var base = _a[_i];
                var tile = new Bomberman.Tile(this.battle, base.name, base.type, new Bomberman.Point(base.location.x, base.location.y));
                this.battle.baseTiles.push(tile);
                this.battle.baseView.add(tile.bmp);
            }
            for (var _b = 0, _c = data.blocks; _b < _c.length; _b++) {
                var block = _c[_b];
                var tile = new Bomberman.Tile(this.battle, block.name, block.type, new Bomberman.Point(block.location.x, block.location.y));
                this.battle.blockTiles.push(tile);
                if (tile.type === Bomberman.TileType.Hard && tile.name !== "invisible") {
                    this.battle.gameView.add(tile.shadow);
                }
                this.battle.gameView.add(tile.bmp);
            }
            for (var _d = 0, _e = data.items; _d < _e.length; _d++) {
                var item = _e[_d];
                var newItem_1 = new Bomberman.Item(this.battle, new Bomberman.Point(item.location.x, item.location.y), item.type);
                this.battle.itemTiles.push(newItem_1);
            }
            var newItem = new Bomberman.Item(this.battle, new Bomberman.Point(3, 1), Bomberman.ItemType.BombUp);
            this.battle.itemTiles.push(newItem);
            newItem.show();
            this.closeInTimer = this.game.time.create(false);
        };
        Map.prototype.getMapName = function () {
            return this.config.stage;
        };
        Map.prototype.playerPosition = function (playerNumber) {
            if (playerNumber === 1) {
                return new Bomberman.Point(1, 1);
            }
            else if (playerNumber === 2) {
                return new Bomberman.Point(17, 11);
            }
            else if (playerNumber === 3) {
                return new Bomberman.Point(17, 1);
            }
            else if (playerNumber === 4) {
                return new Bomberman.Point(1, 11);
            }
        };
        Map.prototype.initCloseIn = function () {
            this.closeInTimer.loop(320, this.triggerCloseIn, this);
            this.closeInTimer.start();
        };
        Map.prototype.cancelCloseIn = function () {
            this.closeInTimer.stop();
        };
        Map.prototype.getBaseFloor = function () {
            return "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7\n\t\t\t\t\t0,1,2,3,2,3,2,3,2,3,2,3,2,3,2,3,4,0,7\n\t\t\t\t\t0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7\n\t\t\t\t\t0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7\n\t\t\t\t\t0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7\n\t\t\t\t\t0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7\n\t\t\t\t\t0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7\n\t\t\t\t\t0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7\n\t\t\t\t\t0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7\n\t\t\t\t\t0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7\n\t\t\t\t\t0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1-,7\n\t\t\t\t\t0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7\n\t\t\t\t\t0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7";
        };
        Map.prototype.getBlocks = function () {
            return "7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7\n\t\t\t\t\t7,-1,-1,-1,-1,-1,-1,-1, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 7\n\t\t\t\t\t7,-1, 5,-1, 5,-1, 5,-1, 5, 8, 5, 8, 5, 8, 5, 8, 5, 8, 7\n\t\t\t\t\t7,-1,-1,-1,-1,-1,-1,-1, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 7\n\t\t\t\t\t7,-1, 5, 8, 5,-1, 7, 7, 7, 8, 5, 8, 5, 8, 7,-1, 7, 8, 7\n\t\t\t\t\t7,-1, 8, 8, 8,-1, 7, 7, 7, 8, 8, 8, 8, 8,-1,-1,-1, 8, 7\n\t\t\t\t\t7, 8, 5, 8, 5,-1, 7, 7, 7, 8, 5, 8, 5, 8, 7,-1, 7, 8, 7\n\t\t\t\t\t7, 8, 8, 8, 8,-1,-1,-1,-1,-1, 8, 8, 8, 8, 8, 8, 8, 8, 7\n\t\t\t\t\t7, 8, 5, 8, 5, 8, 5, 8, 5,-1, 5, 8, 5, 8, 5, 8, 5, 8, 7\n\t\t\t\t\t7, 8, 8, 8, 8, 8, 8, 8, 8,-1, 8,-1,-1,-1, 8, 8, 8, 8, 7\n\t\t\t\t\t7, 8, 5, 8, 5, 8, 5, 8, 5,-1, 5,-1, 5,-1, 5, 8, 7, 7, 7\n\t\t\t\t\t7, 8, 8, 8, 8, 8, 8, 8, 8,-1,-1,-1, 8,-1, 8, 8, 7, 7, 7\n\t\t\t\t\t7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7";
        };
        Map.prototype.getMonsters = function () {
        };
        Map.prototype.triggerCloseIn = function () {
            switch (this.closeInDirection) {
                case Bomberman.Direction.Up:
                    this.closeInPoint = new Bomberman.Point(this.closeInPoint.x, this.closeInPoint.y - 1);
                    break;
                case Bomberman.Direction.Down:
                    this.closeInPoint = new Bomberman.Point(this.closeInPoint.x, this.closeInPoint.y + 1);
                    break;
                case Bomberman.Direction.Left:
                    this.closeInPoint = new Bomberman.Point(this.closeInPoint.x - 1, this.closeInPoint.y);
                    break;
                case Bomberman.Direction.Right:
                    this.closeInPoint = new Bomberman.Point(this.closeInPoint.x + 1, this.closeInPoint.y);
                    break;
            }
            var oppositePoint;
            for (var i = 0; i <= 1; i++) {
                var thePoint = (i === 0) ? this.closeInPoint : this.closeInPoint.boardOpposite();
                if (this.canBeClosedIn(thePoint)) {
                    var tile = new Bomberman.Tile(this.battle, "hard1", Bomberman.TileType.Hard, thePoint).closeIn();
                    this.battle.blockTiles.push(tile);
                    this.battle.gameView.add(tile.bmp);
                }
            }
            var impactSound = this.game.add.audio("impact", .2);
            Bomberman.Utils.playSound(impactSound);
            if (this.closeInPoint.equalTo(new Bomberman.Point(1, 11))) {
                this.closeInDirection = Bomberman.Direction.Right;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(2, 11))) {
                this.closeInDirection = Bomberman.Direction.Up;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(2, 1))) {
                this.closeInDirection = Bomberman.Direction.Right;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(3, 1))) {
                this.closeInDirection = Bomberman.Direction.Down;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(3, 11))) {
                this.closeInDirection = Bomberman.Direction.Right;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(14, 11))) {
                this.closeInDirection = Bomberman.Direction.Up;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(14, 10))) {
                this.closeInDirection = Bomberman.Direction.Left;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(4, 10))) {
                this.closeInDirection = Bomberman.Direction.Up;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(4, 9))) {
                this.closeInDirection = Bomberman.Direction.Right;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(14, 9))) {
                this.closeInDirection = Bomberman.Direction.Up;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(14, 4))) {
                this.closeInDirection = Bomberman.Direction.Left;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(13, 4))) {
                this.closeInDirection = Bomberman.Direction.Down;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(13, 8))) {
                this.closeInDirection = Bomberman.Direction.Left;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(12, 8))) {
                this.closeInDirection = Bomberman.Direction.Up;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(12, 4))) {
                this.closeInDirection = Bomberman.Direction.Left;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(11, 4))) {
                this.closeInDirection = Bomberman.Direction.Down;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(11, 8))) {
                this.closeInDirection = Bomberman.Direction.Left;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(10, 8))) {
                this.closeInDirection = Bomberman.Direction.Up;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(10, 8))) {
                this.closeInDirection = Bomberman.Direction.Up;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(10, 4))) {
                this.closeInDirection = Bomberman.Direction.Left;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(9, 4))) {
                this.closeInDirection = Bomberman.Direction.Down;
            }
            else if (this.closeInPoint.equalTo(new Bomberman.Point(9, 6))) {
                this.closeInTimer.stop();
            }
        };
        Map.prototype.canBeClosedIn = function (point) {
            var tile = this.battle.getTile(point);
            if (!tile) {
                tile = this.battle.getBaseTile(point);
            }
            if (tile.type === Bomberman.TileType.Hard) {
                return false;
            }
            else if (tile.name !== "invisible") {
                return true;
            }
        };
        Map.prototype.tileNumberToName = function (tileNumber) {
            switch (tileNumber) {
                case 0:
                    return "base1";
                case 1:
                    return "base2";
                case 2:
                    return "base3";
                case 3:
                    return "base4";
                case 4:
                    return "base5";
                case 5:
                    return "hard1";
                case 6:
                    return "hard2";
                case 7:
                    return "invisible";
                case 8:
                    return "soft";
                case 17:
                    return "hard3";
                case 18:
                    return "hard4";
                case 19:
                    return "hard5";
                case 20:
                    return "hard6";
                case 21:
                    return "hard7";
                case 22:
                    return "hard8";
            }
        };
        Map.prototype.tileNumberToType = function (tileNumber) {
            if (_.indexOf([5, 6, 7, 17, 18, 19, 20, 21, 22], tileNumber) !== -1) {
                return Bomberman.TileType.Hard;
            }
            else {
                return Bomberman.TileType.Soft;
            }
        };
        return Map;
    }());
    Bomberman.Map = Map;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var SnowMap = (function (_super) {
        __extends(SnowMap, _super);
        function SnowMap(gameConfig) {
            var _this = _super.call(this, gameConfig) || this;
            _this.shadowIntensity = 0.45;
            return _this;
        }
        SnowMap.prototype.setup = function (battle) {
            _super.prototype.setup.call(this, battle);
            var water = new Phaser.TileSprite(this.game, 0, 0, Bomberman.cfg.game.width, Bomberman.cfg.game.height, "back-water");
            water.animations.add("water", [0, 1, 2]);
            water.animations.play("water", 3, true);
            this.battle.backgroundView.addChild(water);
            var underlay = new Phaser.Sprite(this.game, 0, 0, "overlay-snow");
            this.battle.underlayView.addChild(underlay);
            var igloo1 = new Phaser.Sprite(this.game, Bomberman.cfg.tile.size * 15 - (Bomberman.cfg.tile.size / 2), Bomberman.cfg.tile.size * 3, "overlay-igloo1");
            this.battle.underPlayerView.addChild(igloo1);
            var treebase = new Phaser.Sprite(this.game, Bomberman.cfg.tile.size * 6.5 - (Bomberman.cfg.tile.size / 2), Bomberman.cfg.tile.size * 4, "overlay-treebase");
            this.battle.baseView.addChild(treebase);
            var igloo2 = new Phaser.Sprite(this.game, Bomberman.cfg.tile.size * 15 - (Bomberman.cfg.tile.size / 2), Bomberman.cfg.tile.size * 3, "overlay-igloo2");
            this.battle.overlayView.addChild(igloo2);
            var tree = new Phaser.Sprite(this.game, Bomberman.cfg.tile.size * 7, Bomberman.cfg.tile.size * 2, "overlay-tree");
            tree.animations.add("lights", [0, 1]);
            tree.animations.play("lights", 2, true);
            this.battle.overlayView.addChild(tree);
            this.battle.overlayView.addChild(new Bomberman.Penguin(this.battle, 0, 2, "right").bmp);
            this.battle.overlayView.addChild(new Bomberman.Penguin(this.battle, 0, 3, "right").bmp);
            this.battle.overlayView.addChild(new Bomberman.Penguin(this.battle, 0, 6, "right").bmp);
            this.battle.overlayView.addChild(new Bomberman.Penguin(this.battle, 0, 9, "right").bmp);
            this.battle.overlayView.addChild(new Bomberman.Penguin(this.battle, 0, 10, "right").bmp);
            this.battle.overlayView.addChild(new Bomberman.Penguin(this.battle, 3, 11.5, "up").bmp);
            this.battle.overlayView.addChild(new Bomberman.Penguin(this.battle, 4, 11.5, "up").bmp);
            this.battle.overlayView.addChild(new Bomberman.Penguin(this.battle, 6, 11.5, "up").bmp);
            this.battle.overlayView.addChild(new Bomberman.Penguin(this.battle, 9, 11.5, "up").bmp);
            this.battle.underPlayerView.addChild(new Bomberman.Penguin(this.battle, 7, 0, "down").bmp);
            this.battle.underPlayerView.addChild(new Bomberman.Penguin(this.battle, 10, 0, "down").bmp);
            this.battle.underPlayerView.addChild(new Bomberman.Penguin(this.battle, 13, 0, "down").bmp);
            this.battle.underPlayerView.addChild(new Bomberman.Penguin(this.battle, 15, 0, "down").bmp);
            this.battle.underPlayerView.addChild(new Bomberman.Penguin(this.battle, 0.5, 0, "dance").bmp);
            this.battle.underPlayerView.addChild(new Bomberman.Penguin(this.battle, 1.7, 0, "dance").bmp);
            this.battle.underPlayerView.addChild(new Bomberman.Penguin(this.battle, 2.9, 0, "dance").bmp);
            this.battle.underPlayerView.addChild(new Bomberman.Penguin(this.battle, 6.65, 5.7, "dance").bmp);
            this.battle.underPlayerView.addChild(new Bomberman.Penguin(this.battle, 7.65, 5.7, "dance").bmp);
        };
        SnowMap.prototype.playerPosition = function (playerNumber) {
            if (playerNumber === 1) {
                return new Bomberman.Point(1, 1);
            }
            else if (playerNumber === 2) {
                return new Bomberman.Point(15, 11);
            }
            else if (playerNumber === 3) {
                return new Bomberman.Point(13, 1);
            }
            else if (playerNumber === 4) {
                return new Bomberman.Point(1, 11);
            }
        };
        return SnowMap;
    }(Bomberman.Map));
    Bomberman.SnowMap = SnowMap;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Match = (function () {
        function Match(game, gameType) {
            var self = this;
            this.game = game;
            this.matchConfig = {
                type: gameType,
                wins: 1
            };
            this.battleConfig = {
                type: Bomberman.GameType.Local,
                data: "",
                stage: Bomberman.Stage.Snow,
                players: []
            };
            if (gameType === Bomberman.GameType.Local) {
                self.game.state.start("Loading", true, false);
                window.mainMenu.close();
                setTimeout(function () {
                    self.setupSinglePlayer();
                }, 200);
            }
            else {
                alert("Multiplayer not yet supported");
            }
        }
        Match.prototype.setupSinglePlayer = function () {
            var map = Bomberman.Utils.loadStage(this.battleConfig);
            this.battleConfig.players = [
                { key: "1", name: "Player 1", type: Bomberman.EntityType.Local },
                { key: "2", name: "Bot 1", type: Bomberman.EntityType.Bot },
            ];
            var startData = map.generateStartData(this.battleConfig.players);
            this.battleConfig.data = jsonpack.pack(startData);
            this.game.state.start("Battle", true, false, this.battleConfig);
        };
        return Match;
    }());
    Bomberman.Match = Match;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var GameObject = (function () {
        function GameObject(battle, location) {
            this.battle = battle;
            this.game = battle.game;
            this.location = location;
        }
        GameObject.prototype.getCollision = function () {
            return new Phaser.Rectangle((this.location.x * Bomberman.cfg.tile.size), (this.location.y * Bomberman.cfg.tile.size), 64, 64);
        };
        return GameObject;
    }());
    Bomberman.GameObject = GameObject;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Bomb = (function (_super) {
        __extends(Bomb, _super);
        function Bomb(battle, location, owner, strength, explodeTime) {
            var _this = _super.call(this, battle, location) || this;
            _this.exploded = false;
            _this.fuseTime = 3;
            _this.owner = owner;
            _this.strength = strength;
            _this.bmp = new Phaser.Sprite(_this.game, location.x * Bomberman.cfg.tile.size, location.y * Bomberman.cfg.tile.size, "bomb");
            _this.bmp.animations.add("bomb", [0, 1, 2, 3]);
            _this.bmp.animations.play("bomb", 5, true);
            var pixels = Bomberman.Utils.convertToBitmapPosition(location);
            _this.bmp.x = pixels.x;
            _this.bmp.y = pixels.y;
            for (var _i = 0, _a = _this.battle.entities; _i < _a.length; _i++) {
                var entity = _a[_i];
                if (_this.location.equalTo(entity.location)) {
                    entity.escapeBomb = _this;
                }
            }
            _this.explosionSound = _this.game.add.audio("explosion", .4);
            _this.explodeTime = (typeof explodeTime !== "undefined") ? explodeTime : Date.now() + (_this.fuseTime * 1000);
            return _this;
        }
        Bomb.prototype.update = function () {
            if (this.exploded) {
                return;
            }
            if (Date.now() > this.explodeTime) {
                this.explode();
            }
        };
        Bomb.prototype.remove = function () {
            this.battle.gameView.remove(this.bmp);
            if (this.owner) {
                Bomberman.Utils.removeFromArray(this.owner.bombs, this);
            }
            Bomberman.Utils.removeFromArray(this.battle.bombs, this);
        };
        Bomb.prototype.explode = function () {
            this.exploded = true;
            var positions = _.uniqWith(this.getDangerPositions(), _.isEqual);
            this.battle.fires.push(new Bomberman.Fire(this.battle, this, positions));
        };
        Bomb.prototype.getDangerPositions = function (checkedBombs) {
            if (checkedBombs === void 0) { checkedBombs = []; }
            var locations = new Array();
            locations.push(this.location);
            checkedBombs.push(this.location);
            for (var i = 0; i < 4; i++) {
                var dirX = 0, dirY = 0;
                if (i === 0) {
                    dirX = 1;
                }
                else if (i === 1) {
                    dirX = -1;
                }
                else if (i === 2) {
                    dirY = 1;
                }
                else if (i === 3) {
                    dirY = -1;
                }
                for (var j = 1; j <= this.strength; j++) {
                    var explode = true;
                    var last = false;
                    var position = new Bomberman.Point(this.location.x + j * dirX, this.location.y + j * dirY);
                    var type = this.battle.getTileType(position);
                    if (type === Bomberman.TileType.Hard) {
                        explode = false;
                        last = true;
                    }
                    else if (type === Bomberman.TileType.Soft) {
                        explode = true;
                        last = true;
                    }
                    if (explode) {
                        locations.push(position);
                        var bomb = this.battle.getBomb(position);
                        if (bomb) {
                            if (!_.some(checkedBombs, bomb.location)) {
                                bomb.getDangerPositions(checkedBombs).forEach(function (pos) {
                                    locations.push(pos);
                                });
                            }
                        }
                    }
                    if (last) {
                        break;
                    }
                }
            }
            return locations;
        };
        return Bomb;
    }(Bomberman.GameObject));
    Bomberman.Bomb = Bomb;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Explosion = (function (_super) {
        __extends(Explosion, _super);
        function Explosion(battle, location) {
            var _this = _super.call(this, battle, location) || this;
            _this.bmp = new Phaser.Sprite(_this.game, 0, 0, "explosion");
            _this.bmp.animations.add("explode", [0, 1, 2, 3, 4, 5, 6]);
            var pixels = Bomberman.Utils.convertToBitmapPosition(location);
            _this.bmp.x = pixels.x - 20;
            _this.bmp.y = pixels.y - 48;
            _this.bmp.events.onAnimationComplete.add(_this.remove, _this);
            _this.bmp.animations.play("explode", 10);
            _this.battle.gameView.addChild(_this.bmp);
            return _this;
        }
        Explosion.prototype.remove = function () {
            this.battle.gameView.removeChild(this.bmp);
        };
        return Explosion;
    }(Bomberman.GameObject));
    Bomberman.Explosion = Explosion;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Fire = (function (_super) {
        __extends(Fire, _super);
        function Fire(battle, bomb, locations) {
            var _this = _super.call(this, battle, bomb.location) || this;
            _this.bomb = bomb;
            _this.locations = locations;
            _this.bmps = [];
            _this.createFirePositions();
            return _this;
        }
        Fire.prototype.createFirePositions = function () {
            for (var _i = 0, _a = this.locations; _i < _a.length; _i++) {
                var location_2 = _a[_i];
                var tileType = this.battle.getTileType(location_2);
                if (tileType === Bomberman.TileType.Soft) {
                    var tile = this.battle.getTile(location_2);
                    tile.delete();
                }
                else {
                    var item = this.battle.getItem(location_2);
                    if (item) {
                    }
                    var bmp = new Phaser.Sprite(this.game, location_2.x * Bomberman.cfg.tile.size, location_2.y * Bomberman.cfg.tile.size, "bomb");
                    this.bmps.push(bmp);
                    bmp.animations.add("center", [4, 5, 6, 7]);
                    bmp.animations.add("h", [8, 9, 10, 11]);
                    bmp.animations.add("h-left", [12, 13, 14, 15]);
                    bmp.animations.add("h-right", [16, 17, 18, 19]);
                    bmp.animations.add("v", [20, 21, 22, 23]);
                    bmp.animations.add("v-up", [24, 25, 26, 27]);
                    bmp.animations.add("v-down", [28, 29, 30, 31]);
                    var dir = void 0, anim = "";
                    var bomb = this.battle.getBomb(location_2);
                    if (bomb) {
                        anim = "center";
                        bomb.remove();
                        bomb.bmp.visible = false;
                        if (this.bomb.owner) {
                            Bomberman.Utils.removeFromArray(this.bomb.owner.bombs, this.bomb);
                        }
                    }
                    else {
                        var isHorizontal = false;
                        var isVertical = false;
                        var leftFire = _.find(this.locations, { x: location_2.x - 1, y: location_2.y });
                        var rightFire = _.find(this.locations, { x: location_2.x + 1, y: location_2.y });
                        var upFire = _.find(this.locations, { x: location_2.x, y: location_2.y - 1 });
                        var downFire = _.find(this.locations, { x: location_2.x, y: location_2.y + 1 });
                        if (leftFire || rightFire) {
                            isHorizontal = true;
                            anim = "h";
                        }
                        if (upFire || downFire) {
                            isVertical = true;
                            anim = "v";
                        }
                        if (isHorizontal && isVertical) {
                            anim = "center";
                        }
                        else {
                            if (isHorizontal) {
                                if (!leftFire) {
                                    anim = "h-left";
                                }
                                else if (!rightFire) {
                                    anim = "h-right";
                                }
                            }
                            if (isVertical) {
                                if (!upFire) {
                                    anim = "v-up";
                                }
                                else if (!downFire) {
                                    anim = "v-down";
                                }
                            }
                        }
                    }
                    bmp.events.onAnimationComplete.add(this.remove, this, 0, { bmp: bmp });
                    bmp.animations.play(anim, 10);
                    var pixels = Bomberman.Utils.convertToBitmapPosition(location_2);
                    bmp.x = pixels.x;
                    bmp.y = pixels.y;
                    this.battle.gameView.addChild(bmp);
                }
            }
        };
        Fire.prototype.remove = function (bmp) {
            this.battle.gameView.removeChild(bmp);
            Bomberman.Utils.removeFromArray(this.bmps, bmp);
            if (this.bmps.length === 0) {
                Bomberman.Utils.removeFromArray(this.battle.fires, this);
            }
        };
        return Fire;
    }(Bomberman.GameObject));
    Bomberman.Fire = Fire;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Item = (function (_super) {
        __extends(Item, _super);
        function Item(battle, location, type) {
            var _this = _super.call(this, battle, location) || this;
            _this.bmp = new Phaser.Sprite(_this.game, location.x * Bomberman.cfg.tile.size, location.y * Bomberman.cfg.tile.size, "bonuses");
            var pixels = Bomberman.Utils.convertToBitmapPosition(location);
            _this.bmp.x = pixels.x;
            _this.bmp.y = pixels.y;
            _this.type = type;
            var animFrames = _this.generateAnimFrames(_this.type);
            _this.bmp.animations.add("special", animFrames);
            _this.spawned = false;
            return _this;
        }
        Item.prototype.show = function () {
            this.bmp.animations.play("special", 8, true);
            var startFrame;
            startFrame = Math.floor(10 - (this.location.x + this.location.y) % 10);
            this.bmp.animations.currentAnim.setFrame(startFrame, true);
            this.battle.gameView.addChild(this.bmp);
            this.spawned = true;
        };
        Item.prototype.hasSpawned = function () {
            return this.spawned;
        };
        Item.prototype.explode = function () {
            new Bomberman.Explosion(this.battle, this.location);
            this.remove();
        };
        Item.prototype.remove = function () {
            this.battle.gameView.remove(this.bmp);
            Bomberman.Utils.removeFromArray(this.battle.itemTiles, this);
        };
        Item.prototype.generateAnimFrames = function (animNumber) {
            var arr = [];
            for (var i = 0; i < 10; i++) {
                arr.push(i + (animNumber * 10));
            }
            return arr;
        };
        return Item;
    }(Bomberman.GameObject));
    Bomberman.Item = Item;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Penguin = (function () {
        function Penguin(battle, x, y, anim) {
            this.battle = battle;
            this.game = battle.game;
            this.bmp = new Phaser.Sprite(this.game, x * Bomberman.cfg.tile.size + Bomberman.cfg.tile.size / 3, y * Bomberman.cfg.tile.size, "penguins");
            this.bmp.animations.add("right", [9, 10]);
            this.bmp.animations.add("up", [13, 14]);
            this.bmp.animations.add("down", [0, 1]);
            this.bmp.animations.add("dance", [0, 1, 0, 1, 2, 0, 3, 0, 4, 5, 6, 7, 8, 0, 1, 0, 1, 0, 1, 0, 1]);
            this.bmp.animations.play(anim, 5, true);
        }
        return Penguin;
    }());
    Bomberman.Penguin = Penguin;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Tile = (function () {
        function Tile(battle, name, type, location) {
            this.battle = battle;
            this.game = battle.game;
            this.name = name;
            this.type = type;
            this.location = location;
            var mapNo = this.battle.map.getMapName();
            this.bmp = new Phaser.Sprite(this.game, location.x * Bomberman.cfg.tile.size, location.y * Bomberman.cfg.tile.size, "tiles");
            this.bmp.animations.add("base1", [0].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("base2", [1].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("base3", [2].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("base4", [3].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("base5", [4].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("hard1", [5].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("hard2", [6].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("hard3", [17].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("hard4", [18].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("hard5", [19].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("hard6", [20].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("hard7", [21].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("hard8", [22].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("invisible", [7].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("soft", [8].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.animations.add("explode", [9, 10, 11, 12, 13, 14, 15, 16].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.bmp.events.onAnimationComplete.add(this.animationEnd, this);
            this.bmp.animations.play(name);
            this.shadow = new Phaser.Sprite(this.game, location.x * Bomberman.cfg.tile.size + 10, location.y * Bomberman.cfg.tile.size + 10, "tiles");
            this.shadow.animations.add("hard1", [5].multiplyBy(mapNo, Bomberman.cfg.tile.tilesPerLine));
            this.shadow.animations.play("hard1");
            this.shadow.tint = 0x000000;
            this.shadow.alpha = this.battle.map.shadowIntensity;
        }
        Tile.prototype.delete = function () {
            this.battle.gameView.remove(this.bmp);
            Bomberman.Utils.removeFromArray(this.battle.blockTiles, this);
        };
        Tile.prototype.explode = function () {
            this.bmp.animations.play("explode", 20);
            var item = this.battle.getItem(this.location);
            if (item) {
            }
        };
        Tile.prototype.closeIn = function () {
            var item = this.battle.getItem(this.location);
            if (item) {
            }
            var entities = this.battle.getEntities(this.location);
            for (var _i = 0, entities_2 = entities; _i < entities_2.length; _i++) {
                var entity = entities_2[_i];
                entity.die();
            }
            var tile = this.battle.getTile(this.location);
            if (tile) {
                tile.delete();
            }
            return this;
        };
        Tile.prototype.getCollision = function () {
            return new Phaser.Rectangle((this.location.x * Bomberman.cfg.tile.size), (this.location.y * Bomberman.cfg.tile.size), 64, 64);
        };
        Tile.prototype.isBlocked = function () {
            var type = this.battle.getTileType(this.location);
            if (type !== Bomberman.TileType.Base) {
                return true;
            }
            else {
                return false;
            }
        };
        Tile.prototype.isBomb = function () {
            var bomb = this.battle.getBomb(this.location);
            if (bomb) {
                return true;
            }
            else {
                return false;
            }
        };
        Tile.prototype.tileUp = function () {
            return this.battle.getBaseTile(new Bomberman.Point(this.location.x, this.location.y - 1));
        };
        Tile.prototype.tileDown = function () {
            return this.battle.getBaseTile(new Bomberman.Point(this.location.x, this.location.y + 1));
        };
        Tile.prototype.tileLeft = function () {
            return this.battle.getBaseTile(new Bomberman.Point(this.location.x - 1, this.location.y));
        };
        Tile.prototype.tileRight = function () {
            return this.battle.getBaseTile(new Bomberman.Point(this.location.x + 1, this.location.y));
        };
        Tile.prototype.isOnOuterEdge = function () {
            if (this.location.x === 0 || this.location.x === Bomberman.cfg.tile.width - 1 ||
                this.location.y === 0 || this.location.y === Bomberman.cfg.tile.height - 1) {
                return true;
            }
            return false;
        };
        Tile.prototype.setNearSoftWalls = function (val) {
            this.nearSoftWalls = val;
        };
        Tile.prototype.getNearSoftWalls = function () {
            return this.nearSoftWalls;
        };
        Tile.prototype.setDeadEnd = function (val) {
            this.deadEnd = val;
        };
        Tile.prototype.getDeadEnd = function () {
            return this.deadEnd;
        };
        Tile.prototype.setDeadEndExit = function (tile) {
            this.deadEndExit = tile;
        };
        Tile.prototype.getDeadEndExit = function () {
            return this.deadEndExit;
        };
        Tile.prototype.animationEnd = function (sprite, animation) {
            if (animation.name === "explode") {
                this.delete();
            }
        };
        return Tile;
    }());
    Bomberman.Tile = Tile;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Battle = (function (_super) {
        __extends(Battle, _super);
        function Battle() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.hasStarted = false;
            _this.timeLimit = 120;
            return _this;
        }
        Battle.prototype.init = function (config) {
            console.log("INIT Battle");
            this.config = config;
        };
        Battle.prototype.create = function () {
            console.log("CREATE battle");
            this.background = this.game.add.sprite(400, 0);
            this.background.x = this.background.y = 0;
            this.background.width = Bomberman.cfg.game.width;
            this.background.height = Bomberman.cfg.game.height;
            this.containerView = this.game.add.group(undefined, "Container");
            this.containerView.x = 0;
            this.containerView.y = 0;
            this.backgroundView = this.game.add.group(this.containerView, "Backround");
            this.backgroundView.x = 96 - Bomberman.cfg.tile.size;
            this.backgroundView.y = 0;
            this.baseView = this.game.add.group(this.containerView, "Base");
            this.baseView.x = 96 - Bomberman.cfg.tile.size;
            this.baseView.y = 0;
            this.underlayView = this.game.add.group(this.containerView, "Underlay");
            this.underlayView.x = this.underlayView.y = 0;
            this.gameView = this.game.add.group(this.containerView, "Game");
            this.gameView.x = 96 - Bomberman.cfg.tile.size;
            this.gameView.y = 0;
            this.underPlayerView = this.game.add.group(this.containerView, "UnderPlayer");
            this.underPlayerView.x = this.underPlayerView.y = 0;
            this.entityView = this.game.add.group(this.containerView, "Entity");
            this.entityView.x = 96 - Bomberman.cfg.tile.size;
            this.entityView.y = 0;
            this.overlayView = this.game.add.group(this.containerView, "Overlay");
            this.overlayView.x = this.overlayView.y = 0;
            this.debugView = this.game.add.group(this.containerView, "Debug");
            this.debugView.x = 96 - Bomberman.cfg.tile.size;
            this.debugView.y = 0;
            this.baseTiles = [];
            this.blockTiles = [];
            this.itemTiles = [];
            this.bombs = [];
            this.fires = [];
            this.entities = [];
            this.setupMap();
            this.setupPlayers();
            Bomberman.Utils.playMusic(this.game.add.audio("music1", .8));
            this.timedEvents = [];
            this.startBattle();
        };
        Battle.prototype.update = function () {
            var delta = this.game.time.elapsed / 1000;
            if (this.hasStarted) {
                this.updateSoftTiles();
                this.updateDeadEnds();
                for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
                    var entity = _a[_i];
                    entity.update(delta);
                }
                for (var _b = 0, _c = this.bombs; _b < _c.length; _b++) {
                    var bomb = _c[_b];
                    bomb.update();
                }
                this.calculatePlayerIndex();
                this.checkTimedEvents();
            }
        };
        Battle.prototype.render = function () {
            for (var _i = 0, _a = this.blockTiles; _i < _a.length; _i++) {
                var tile = _a[_i];
            }
            for (var _b = 0, _c = this.entities; _b < _c.length; _b++) {
                var entity = _c[_b];
            }
        };
        Battle.prototype.getTile = function (pos) {
            for (var _i = 0, _a = this.blockTiles; _i < _a.length; _i++) {
                var tile = _a[_i];
                if (tile.location.equalTo(pos)) {
                    return tile;
                }
            }
        };
        Battle.prototype.getBaseTile = function (pos) {
            for (var _i = 0, _a = this.baseTiles; _i < _a.length; _i++) {
                var tile = _a[_i];
                if (tile.location.equalTo(pos)) {
                    return tile;
                }
            }
        };
        Battle.prototype.getTileType = function (pos) {
            var tile = this.getTile(pos);
            return (tile) ? tile.type : Bomberman.TileType.Base;
        };
        Battle.prototype.getBomb = function (pos) {
            for (var _i = 0, _a = this.bombs; _i < _a.length; _i++) {
                var bomb = _a[_i];
                if (bomb.location.equalTo(pos)) {
                    return bomb;
                }
            }
        };
        Battle.prototype.getItem = function (pos) {
            for (var _i = 0, _a = this.itemTiles; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.location.equalTo(pos)) {
                    return item;
                }
            }
        };
        Battle.prototype.getEntity = function (pos) {
            for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
                var entity = _a[_i];
                if (entity.location.equalTo(pos)) {
                    return entity;
                }
            }
        };
        Battle.prototype.getMonster = function (pos) {
            for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
                var entity = _a[_i];
                if (entity.location.equalTo(pos) && entity.entityType == Bomberman.EntityType.Monster) {
                    return entity;
                }
            }
        };
        Battle.prototype.getOpenTiles = function () {
            var freeTiles = [];
            for (var _i = 0, _a = this.baseTiles; _i < _a.length; _i++) {
                var tile = _a[_i];
                var location_3 = tile.location.clone();
                if (this.getTileType(location_3) === Bomberman.TileType.Base) {
                    if (!this.getItem(location_3) && !this.getBomb(location_3) && !this.getEntity(location_3)) {
                        freeTiles.push(location_3);
                    }
                }
            }
            return freeTiles;
        };
        Battle.prototype.getEntities = function (pos) {
            var entities = new Array();
            for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
                var entity = _a[_i];
                if (entity.location.equalTo(pos)) {
                    entities.push(entity);
                }
            }
            return entities;
        };
        Battle.prototype.getDangerPositions = function () {
            var positions = new Array();
            for (var _i = 0, _a = this.bombs; _i < _a.length; _i++) {
                var bomb = _a[_i];
                positions = _.union(positions, bomb.getDangerPositions());
            }
            for (var _b = 0, _c = this.fires; _b < _c.length; _b++) {
                var fire = _c[_b];
                positions = _.union(positions, fire.locations);
            }
            return positions;
        };
        Battle.prototype.getTilesInRange = function (location, size) {
            var tiles = [];
            for (var _i = 0, _a = this.baseTiles; _i < _a.length; _i++) {
                var tile = _a[_i];
                if (tile.location.x > 0 && tile.location.x > location.x - size &&
                    tile.location.x < (Bomberman.cfg.tile.width - 1) && tile.location.x < location.x + size &&
                    tile.location.y > 0 && tile.location.y > location.y - size &&
                    tile.location.y < (Bomberman.cfg.tile.height - 1) && tile.location.y < location.y + size) {
                    tiles.push(tile);
                }
            }
            return tiles;
        };
        Battle.prototype.startBattle = function () {
            var self = this;
            var style = { font: "bold 120px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            this.mapText = new Phaser.Text(self.game, 0, 0, "", style);
            this.mapText.setShadow(10, 10, 'rgba(0,0,0,0.5)', 2);
            this.mapText.setTextBounds(0, 0, Bomberman.cfg.game.width, Bomberman.cfg.game.height);
            this.mapText.stroke = "#000";
            this.mapText.strokeThickness = 25;
            this.overlayView.add(this.mapText);
            this.mapText.setText("Ready...");
            setTimeout(function () {
                self.mapText.setText("GO!");
                self.gameStartTime = self.game.time.totalElapsedSeconds();
                self.hasStarted = true;
                setTimeout(function () {
                    self.mapText.destroy();
                }, 1000);
            }, 2000);
        };
        Battle.prototype.calculatePlayerIndex = function () {
            var sortedEntities = _.sortBy(this.entities, function (entity) { return entity.container.y; });
            for (var _i = 0, sortedEntities_1 = sortedEntities; _i < sortedEntities_1.length; _i++) {
                var entity = sortedEntities_1[_i];
                this.entityView.bringToTop(entity.container);
            }
        };
        Battle.prototype.checkTimedEvents = function () {
            var elapsed = this.game.time.totalElapsedSeconds() - this.gameStartTime;
            var timeLeft = this.timeLimit - elapsed;
            if (timeLeft < 0) {
                timeLeft = 0;
            }
            this.timeLeft = Math.floor(timeLeft);
            var timeDisplay = Bomberman.Utils.formatTime(timeLeft);
            $("#countdown>div").html(timeDisplay);
            if (this.timeLeft === 0 && _.indexOf(this.timedEvents, "endMatch") === -1) {
                this.timedEvents.push("endMatch");
                this.map.initCloseIn();
            }
        };
        Battle.prototype.setupMap = function () {
            this.map = Bomberman.Utils.loadStage(this.config);
            this.map.setup(this);
        };
        Battle.prototype.setupPlayers = function () {
            if (this.config.type === Bomberman.GameType.Local) {
                this.setupPlayersLocal();
            }
            else {
                alert("NOT YET SUPPORTED");
            }
        };
        Battle.prototype.setupPlayersLocal = function () {
            var players = this.config.players;
            for (var i = 0; i < players.length; i++) {
                if (players[i].type == Bomberman.EntityType.Local) {
                    var player = new Bomberman.Player(this, this.map.playerPosition(i + 1), i);
                    player.setName(players[i].name);
                    this.entities.push(player);
                    this.entityView.addChild(player.container);
                }
                else if (players[i].type === Bomberman.EntityType.Bot) {
                    var bot = new Bomberman.Bot(this, this.map.playerPosition(i + 1), i);
                    bot.setName(players[i].name);
                    this.entities.push(bot);
                    this.entityView.addChild(bot.container);
                }
            }
        };
        Battle.prototype.updateSoftTiles = function () {
            var SOFT_WALL_MAX_DEPTH = 2;
            for (var _i = 0, _a = this.baseTiles; _i < _a.length; _i++) {
                var tile = _a[_i];
                var softWallsNear = 0;
                if (tile.isBlocked()) {
                    tile.setNearSoftWalls(-1);
                }
                else {
                    for (var direction = 1; direction <= 4; direction++) {
                        var checkTiles = this.tilesFromCenter(tile.location, direction, SOFT_WALL_MAX_DEPTH);
                        for (var _b = 0, checkTiles_1 = checkTiles; _b < checkTiles_1.length; _b++) {
                            var checkTile = checkTiles_1[_b];
                            var tileType = this.getTileType(checkTile.location);
                            if (tileType === Bomberman.TileType.Soft) {
                                softWallsNear++;
                                break;
                            }
                            else if (tileType === Bomberman.TileType.Hard) {
                                break;
                            }
                        }
                    }
                    tile.setNearSoftWalls(softWallsNear);
                }
            }
        };
        Battle.prototype.updateDeadEnds = function () {
            var currentDeadEnd = 0;
            var current_tile;
            for (var _i = 0, _a = this.baseTiles; _i < _a.length; _i++) {
                var tile = _a[_i];
                tile.setDeadEnd(-2);
            }
            for (var _b = 0, _c = this.baseTiles; _b < _c.length; _b++) {
                var tile = _c[_b];
                if (tile.getDeadEnd() === -2) {
                    if (tile.isOnOuterEdge() || tile.isBlocked()) {
                        tile.setDeadEnd(-1);
                    }
                    else {
                        var blockedUp = tile.tileUp().isBlocked();
                        var blockedDown = tile.tileDown().isBlocked();
                        var blockedLeft = tile.tileLeft().isBlocked();
                        var blockedRight = tile.tileRight().isBlocked();
                        if (blockedLeft && blockedUp && blockedDown) {
                            while (blockedUp && blockedDown && !tile.isBlocked() && tile) {
                                tile.setDeadEnd(currentDeadEnd);
                                current_tile = tile;
                                tile = tile.tileRight();
                                blockedUp = tile.tileUp().isBlocked();
                                blockedDown = tile.tileDown().isBlocked();
                                if (!tile.isBlocked()) {
                                    current_tile.setDeadEndExit(tile);
                                }
                                currentDeadEnd++;
                            }
                        }
                        else if (blockedUp && blockedLeft && blockedRight) {
                            while (blockedLeft && blockedRight && !tile.isBlocked() && tile) {
                                tile.setDeadEnd(currentDeadEnd);
                                current_tile = tile;
                                tile = tile.tileDown();
                                blockedLeft = tile.tileLeft().isBlocked();
                                blockedRight = tile.tileRight().isBlocked();
                                if (!tile.isBlocked()) {
                                    current_tile.setDeadEndExit(tile);
                                }
                                currentDeadEnd++;
                            }
                        }
                        else if (blockedRight && blockedUp && blockedDown) {
                            while (blockedUp && blockedDown && !tile.isBlocked() && tile) {
                                tile.setDeadEnd(currentDeadEnd);
                                current_tile = tile;
                                tile = tile.tileRight();
                                blockedUp = tile.tileUp().isBlocked();
                                blockedDown = tile.tileDown().isBlocked();
                                if (!tile.isBlocked()) {
                                    current_tile.setDeadEndExit(tile);
                                }
                                currentDeadEnd++;
                            }
                        }
                        else if (blockedDown && blockedLeft && blockedRight) {
                            while (blockedLeft && blockedRight && !tile.isBlocked() && tile) {
                                tile.setDeadEnd(currentDeadEnd);
                                current_tile = tile;
                                tile = tile.tileUp();
                                blockedLeft = tile.tileLeft().isBlocked();
                                blockedRight = tile.tileRight().isBlocked();
                                if (!tile.isBlocked()) {
                                    current_tile.setDeadEndExit(tile);
                                }
                                currentDeadEnd++;
                            }
                        }
                        else {
                            tile.setDeadEnd(-1);
                        }
                    }
                }
            }
        };
        Battle.prototype.tilesFromCenter = function (location, direction, distance) {
            var addition;
            var point = new Bomberman.Point(location.x, location.y);
            var output = [];
            switch (direction) {
                case Bomberman.Direction.Up:
                    addition = new Bomberman.Point(0, -1);
                    break;
                case Bomberman.Direction.Down:
                    addition = new Bomberman.Point(0, 1);
                    break;
                case Bomberman.Direction.Left:
                    addition = new Bomberman.Point(-1, 0);
                    break;
                case Bomberman.Direction.Right:
                    addition = new Bomberman.Point(1, 0);
                    break;
            }
            for (var j = 1; j <= distance; j++) {
                point = new Bomberman.Point(point.x + addition.x, point.y + addition.y);
                var tile = this.getBaseTile(point);
                if (tile) {
                    output.push(tile);
                }
            }
            return output;
        };
        Battle.prototype.addBomb = function (location, strength) {
            if (strength === void 0) { strength = 2; }
            var bomb = new Bomberman.Bomb(this, location, null, strength);
            this.gameView.addChild(bomb.bmp);
            this.bombs.push(bomb);
        };
        return Battle;
    }(Phaser.State));
    Bomberman.Battle = Battle;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Boot.prototype.preload = function () { };
        Boot.prototype.create = function () {
            this.stage.setBackgroundColor(0x000000);
            if (Bomberman.cfg.game.allowScaling) {
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            }
            else {
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
            this.game.add.plugin(eval("Phaser.Plugin.Debug"));
            this.game.state.start("Preloader", true, false);
        };
        Boot.prototype.onSizeChange = function (e) {
            var width = e.width / e.scaleFactor.x;
            var height = e.height / e.scaleFactor.y;
            $("#ui-container")
                .width(e.width)
                .height(e.height);
        };
        return Boot;
    }(Phaser.State));
    Bomberman.Boot = Boot;
})(Bomberman || (Bomberman = {}));
var fontReady = false;
var windowReady = false;
function fontLoaded() {
    fontReady = true;
    checkAllReady();
}
window.onload = function () {
    windowReady = true;
    checkAllReady();
};
function checkAllReady() {
    if (fontReady && windowReady) {
        new Bomberman.GameEngine();
    }
}
var Bomberman;
(function (Bomberman) {
    var Loading = (function (_super) {
        __extends(Loading, _super);
        function Loading() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Loading.prototype.create = function () {
            var style = { font: "bold 52px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            this.text = this.game.add.text(0, 0, "Loading...", style);
            this.text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            this.text.setTextBounds(0, 0, Bomberman.cfg.game.width, Bomberman.cfg.game.height);
        };
        return Loading;
    }(Phaser.State));
    Bomberman.Loading = Loading;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Preloader = (function (_super) {
        __extends(Preloader, _super);
        function Preloader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Preloader.prototype.preload = function () {
            this.progress = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 30, '0%', { fill: 'white' });
            this.progress.anchor.setTo(.5, .5);
            this.load.spritesheet("tiles", "assets/gfx/tiles.png", 64, 64);
            this.load.spritesheet("bomb", "assets/gfx/bomb.png", 64, 64);
            this.load.spritesheet("bonuses", "assets/gfx/bonuses.png", 64, 64);
            this.load.spritesheet("explosion", "assets/gfx/explosion.png", 128, 116);
            this.load.spritesheet("penguins", "assets/gfx/penguins.png", 64, 64);
            this.load.spritesheet("player", "assets/gfx/player.png?v=2", 96, 96);
            this.load.spritesheet("monster-blob", "assets/gfx/monsters/blob.png", 96, 76);
            this.load.spritesheet("monster-blue", "assets/gfx/monsters/blue.png", 132, 132);
            this.load.spritesheet("monster-bulb", "assets/gfx/monsters/bulb.png", 76, 76);
            this.load.spritesheet("monster-mouse", "assets/gfx/monsters/mouse.png", 108, 12);
            this.load.spritesheet("monster-orange", "assets/gfx/monsters/orange.png", 64, 76);
            this.load.spritesheet("monster-snail", "assets/gfx/monsters/snail.png", 156, 132);
            this.load.image("overlay-lights", "assets/gfx/overlays/lights.png");
            this.load.image("overlay-rocks", "assets/gfx/overlays/rocks.png");
            this.load.image("overlay-snow", "assets/gfx/overlays/snow.png");
            this.load.image("overlay-classic", "assets/gfx/overlays/classic.png");
            this.load.image("overlay-igloo1", "assets/gfx/overlays/igloo1.png");
            this.load.image("overlay-igloo2", "assets/gfx/overlays/igloo2.png");
            this.load.image("overlay-treebase", "assets/gfx/overlays/treebase.png");
            this.load.spritesheet("overlay-tree", "assets/gfx/overlays/tree.png", 130, 196);
            this.load.spritesheet("overlay-spaceship", "assets/gfx/overlays/spaceship.png", 352, 196);
            this.load.image("logo", "assets/gfx/ui/bomberman.png");
            this.load.spritesheet("back-water", "assets/gfx/backgrounds/water.png", 64, 64);
            this.game.load.script("filter-space", "assets/filters/space.js");
            this.game.load.script("filter-water", "assets/filters/water.js");
            this.load.audio("bomb", "assets/sound/bomb.wav");
            this.load.audio("explosion", "assets/sound/explosion.wav");
            this.load.audio("item", "assets/sound/item.wav");
            this.load.audio("impact", "assets/sound/impact1.wav");
            this.load.audio("music1", "assets/music/battle94.ogg");
            this.game.load.script("webfont", "//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js");
            this.game.load.script("filter-clouds", "assets/filters/clouds.js");
            this.game.load.onFileComplete.add(this.fileComplete, this);
            this.game.load.start();
        };
        Preloader.prototype.create = function () {
            this.testSinglePlayerMatch();
        };
        Preloader.prototype.startupGame = function () {
            this.game.state.start("TitleScreen", true, false);
        };
        Preloader.prototype.testSinglePlayerMatch = function () {
            new Bomberman.UIManager().init(this.game);
            new Bomberman.Match(this.game, Bomberman.GameType.Local);
        };
        Preloader.prototype.testSinglePlayerRound = function () {
            new Bomberman.UIManager().init(this.game);
        };
        Preloader.prototype.fileComplete = function (progress, cacheKey, success, totalLoaded, totalFiles) {
            this.progress.text = progress + "%";
            this.progressBar = this.game.add.graphics(this.game.world.centerX - 200, this.game.world.centerY);
            this.progressBar.beginFill(0xFFFFFF, 1);
            this.progressBar.drawRoundedRect(5, 5, (380 / 100) * progress, 30, 2);
        };
        return Preloader;
    }(Phaser.State));
    Bomberman.Preloader = Preloader;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var TitleScreen = (function (_super) {
        __extends(TitleScreen, _super);
        function TitleScreen() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TitleScreen.prototype.create = function () {
            this.game.stage.setBackgroundColor(0x000000);
            this.background = this.game.add.sprite(0, 0);
            this.background.width = Bomberman.cfg.game.width;
            this.background.height = Bomberman.cfg.game.height;
            this.filter = this.game.add.filter('Clouds', 800, 600);
            this.background.filters = [this.filter];
            this.logo = this.game.add.sprite(this.game.world.centerX, 120, "logo");
            this.logo.x = this.game.width / 2;
            this.logo.anchor.x = this.logo.anchor.y = 0.5;
            var tween = this.game.add.tween(this.logo.scale);
            tween.to({ x: 1.3, y: 1.3 }, 3000, Phaser.Easing.Quadratic.InOut)
                .to({ x: 1, y: 1 }, 3000, Phaser.Easing.Quadratic.InOut);
            tween.repeatAll(-1);
            tween.start();
        };
        TitleScreen.prototype.update = function () {
            this.filter.update();
        };
        return TitleScreen;
    }(Phaser.State));
    Bomberman.TitleScreen = TitleScreen;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var UIManager = (function () {
        function UIManager() {
            if (UIManager.instance) {
                return UIManager.instance;
            }
            UIManager.instance = this;
        }
        UIManager.prototype.init = function (game) {
            this.game = game;
            this.createMainMenu();
            this.game.scale.onSizeChange.add(this.onSizeChange, this);
        };
        UIManager.prototype.createMainMenu = function () {
            var self = this;
            window.mainMenu = $("#mainMenuButton").PopupLayer({
                content: "#mainMenu",
                to: "right",
                backgroundColor: "rgba(62,68,76,.8)",
                blur: true,
                screenRatio: 0,
                heightOrWidth: 300
            });
            $("#mainMenuSingle").click(function (e) {
                window.mainMenu.close();
                alert("WHTA");
            });
            $("#mainMenuFullscreen").click(function (e) {
                if (!window.screenTop && !window.screenY) {
                    self.exitFullScreen();
                }
                else {
                    self.launchFullScreen();
                }
            });
            $("#mainMenuHowToPlay").click(function (e) {
                e.preventDefault();
                window.mainMenu.close();
                self.loadModalInfo("How to play", "howToPlay");
            });
            $("#mainMenuControls").click(function (e) {
                e.preventDefault();
                window.mainMenu.close();
                self.loadModalInfo("Controls", "controls");
            });
            $("#mainMenuCredits").click(function (e) {
                e.preventDefault();
                window.mainMenu.close();
                self.loadModalInfo("Credits", "credits");
            });
        };
        UIManager.prototype.loadModalInfo = function (title, file) {
            var dialog = bootbox.dialog({
                title: title,
                message: '<p><i class="fa fa-spin fa-spinner"></i> Loading...</p>',
                size: "large",
                backdrop: true
            });
            dialog.init(function () {
                $.get("ajax/" + file + ".htm", function (data) {
                    dialog.find(".bootbox-body").html("<div id=\"perfectScroll\">" + data + "</div>");
                    dialog.find(".bootbox-body #perfectScroll").perfectScrollbar();
                });
            });
        };
        UIManager.prototype.onSizeChange = function (e) {
            window.mainMenu.resize();
        };
        UIManager.prototype.launchFullScreen = function (element) {
            if (typeof element === "undefined") {
                element = document.documentElement;
            }
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
            else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            }
            else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
            else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        };
        UIManager.prototype.exitFullScreen = function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        };
        return UIManager;
    }());
    Bomberman.UIManager = UIManager;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Debug = (function () {
        function Debug(battle) {
            this.dOldValues = [];
            this.dValues = [];
            this.battle = battle;
            this.game = battle.game;
            this.debugView = this.game.add.group(this.battle.debugView, "DebugView");
            this.debugView.x = this.debugView.y = 0;
        }
        Debug.prototype.showValue = function (name, value) {
            if (!Bomberman.cfg.debug.showDebugTable) {
                return;
            }
            var val = { 'name': name, 'value': value };
            var entry = _.find(this.dValues, { 'name': name });
            if (entry) {
                entry['value'] = value;
            }
            else {
                this.dValues.push(val);
            }
        };
        Debug.prototype.renderValues = function () {
            if (!Bomberman.cfg.debug.showDebugTable) {
                return;
            }
            if (this.dValues !== this.dOldValues) {
                var str = '<table class="table table-striped" style="table-layout:fixed;"><thead><tr><th noresize>Name</th><th noresize>Value</th></tr></thead><tbody>';
                for (var _i = 0, _a = this.dValues; _i < _a.length; _i++) {
                    var value = _a[_i];
                    str += '<tr><td>' + value['name'] + '</td><td>' + value['value'] + '</td></tr>';
                }
                str += '</tbody></table>';
                $("#info").html(str);
            }
            this.dOldValues = this.dValues.slice(0);
        };
        Debug.prototype.markTiles = function (tiles, debugTile) {
            if (debugTile === void 0) { debugTile = Bomberman.DebugTile.Danger; }
            if (!Bomberman.cfg.debug.showMarkers) {
                return;
            }
            this.clearAll(debugTile);
            if (tiles) {
                for (var _i = 0, tiles_3 = tiles; _i < tiles_3.length; _i++) {
                    var tile = tiles_3[_i];
                    this.markTile(tile, debugTile);
                }
            }
        };
        Debug.prototype.markPoints = function (points, debugTile) {
            if (debugTile === void 0) { debugTile = Bomberman.DebugTile.Danger; }
            if (!Bomberman.cfg.debug.showMarkers) {
                return;
            }
            var tiles = [];
            if (points) {
                for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
                    var point = points_1[_i];
                    tiles.push(this.battle.getBaseTile(point));
                }
                this.markTiles(tiles, debugTile);
            }
        };
        Debug.prototype.markArray = function (arr, debugTile) {
            if (debugTile === void 0) { debugTile = Bomberman.DebugTile.Danger; }
            if (!Bomberman.cfg.debug.showMarkers) {
                return;
            }
            var tiles = [];
            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                var ar = arr_1[_i];
                tiles.push(this.battle.getBaseTile(new Bomberman.Point(ar[0], ar[1])));
            }
            this.markTiles(tiles, debugTile);
        };
        Debug.prototype.markTile = function (tile, debugTile, clearPrevious) {
            if (debugTile === void 0) { debugTile = Bomberman.DebugTile.Danger; }
            if (clearPrevious === void 0) { clearPrevious = false; }
            if (!Bomberman.cfg.debug.showMarkers) {
                return;
            }
            var lineColour, offset;
            switch (debugTile) {
                case Bomberman.DebugTile.Danger:
                    lineColour = 0xff0000;
                    offset = 0;
                    break;
                case Bomberman.DebugTile.Movement:
                    lineColour = 0xFFFF00;
                    offset = 6;
                    break;
                case Bomberman.DebugTile.Path:
                    lineColour = 0x0099CC;
                    offset = 12;
                    break;
                case Bomberman.DebugTile.Highlight:
                    lineColour = 0x00CC00;
                    offset = 18;
                    break;
            }
            if (clearPrevious) {
                this.clearAll(debugTile);
            }
            var graphics = this.game.add.graphics(tile.location.x * Bomberman.cfg.tile.size, tile.location.y * Bomberman.cfg.tile.size, this.debugView);
            graphics.lineStyle(6, lineColour, .7);
            graphics.moveTo(0 + offset, 0 + offset);
            graphics.lineTo(Bomberman.cfg.tile.size - offset, 0 + offset);
            graphics.lineTo(Bomberman.cfg.tile.size - offset, Bomberman.cfg.tile.size - offset);
            graphics.lineTo(0 + offset, Bomberman.cfg.tile.size - offset);
            graphics.lineTo(0 + offset, 0 + offset);
            graphics.key = "tile-" + debugTile;
        };
        Debug.prototype.tileText = function (tile, text) {
            if (!Bomberman.cfg.debug.showTileValues) {
                return;
            }
            for (var _i = 0, _a = this.debugView.children; _i < _a.length; _i++) {
                var i = _a[_i];
                if (i['key'] === "text_" + tile.location.x + "_ " + tile.location.y) {
                    i['text'] = text;
                    return;
                }
            }
            ;
            var txt = this.game.add.text(tile.location.x * Bomberman.cfg.tile.size, tile.location.y * Bomberman.cfg.tile.size, text, { font: "bold 20px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" }, this.debugView);
            txt.setTextBounds(0, 0, Bomberman.cfg.tile.size, Bomberman.cfg.tile.size);
            txt.stroke = "#ffffff";
            txt.strokeThickness = 3;
            txt.key = "text_" + tile.location.x + "_ " + tile.location.y;
        };
        Debug.prototype.markPath = function () {
        };
        Debug.prototype.clearPath = function () {
        };
        Debug.prototype.clearAll = function (debugTile) {
            if (debugTile === void 0) { debugTile = null; }
            if (debugTile === null) {
                this.debugView.removeAll();
            }
            else {
                for (var _i = 0, _a = this.debugView.children; _i < _a.length; _i++) {
                    var i = _a[_i];
                    if (i['key'] === "tile-" + debugTile) {
                        this.debugView.remove(i, true);
                    }
                }
            }
        };
        return Debug;
    }());
    Bomberman.Debug = Debug;
})(Bomberman || (Bomberman = {}));
var Bomberman;
(function (Bomberman) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.convertDirectionToString = function (direction) {
            switch (direction) {
                case Bomberman.Direction.Down:
                    return "down";
                case Bomberman.Direction.Left:
                    return "left";
                case Bomberman.Direction.Right:
                    return "right";
                case Bomberman.Direction.Up:
                    return "up";
            }
        };
        Utils.convertToBitmapPosition = function (pt) {
            var p = new Bomberman.Point();
            p.x = pt.x * Bomberman.cfg.tile.size;
            p.y = pt.y * Bomberman.cfg.tile.size;
            return p;
        };
        Utils.convertToEntityPosition = function (pt) {
            return new Bomberman.Point(Math.round(pt.x / 64), Math.round(pt.y / 64));
        };
        Utils.CSVToArray = function (data) {
            var objPattern = new RegExp(("(\,|\\r?\\n|\\r|^)" +
                "([^\"\,\\r\\n]*)"), "gi");
            var arrData = [[]];
            var arrMatches = null;
            while (arrMatches = objPattern.exec(data)) {
                var strMatchedDelimiter = arrMatches[1];
                if (strMatchedDelimiter.length &&
                    strMatchedDelimiter !== ",") {
                    arrData.push([]);
                }
                var strMatchedValue = arrMatches[2];
                arrData[arrData.length - 1].push(parseInt(strMatchedValue));
            }
            return (arrData);
        };
        Utils.debugCollision = function (obj) {
            var col = obj.getCollision();
            col.x = col.x + (Bomberman.cfg.tile.size / 2);
            return col;
        };
        Utils.formatTime = function (time) {
            var minutes = Math.floor(time / 60);
            var seconds = Math.floor(time - minutes * 60);
            var ms = Math.floor(time * 10).toString().slice(-1);
            return ("00" + minutes).slice(-2) + ":" + ("00" + seconds).slice(-2) + "." + ms;
        };
        Utils.matrix = function (rows, cols, defaultValue) {
            var arr = [];
            for (var i = 0; i < rows; i++) {
                arr.push([]);
                arr[i].push(new Array(cols));
                if (typeof defaultValue !== 'undefined') {
                    for (var j = 0; j < cols; j++) {
                        arr[i][j] = defaultValue;
                    }
                }
            }
            return arr;
        };
        Utils.loadStage = function (battleConfig) {
            switch (battleConfig.stage) {
                case Bomberman.Stage.Snow:
                    return new Bomberman.SnowMap(battleConfig);
            }
        };
        Utils.oppositeDirection = function (direction) {
            switch (direction) {
                case Bomberman.Direction.Down:
                    return Bomberman.Direction.Up;
                case Bomberman.Direction.Left:
                    return Bomberman.Direction.Right;
                case Bomberman.Direction.Right:
                    return Bomberman.Direction.Left;
                case Bomberman.Direction.Up:
                    return Bomberman.Direction.Down;
            }
        };
        Utils.playMusic = function (music) {
            if (!Bomberman.cfg.muteMusic) {
                music.loopFull();
            }
        };
        Utils.playSound = function (sound) {
            if (!Bomberman.cfg.muteSound) {
                sound.play();
            }
        };
        Utils.randomFromArray = function (array) {
            return array[Math.floor(Math.random() * array.length)];
        };
        Utils.removeFromArray = function (array, item) {
            for (var i = 0; i < array.length; i++) {
                if (item === array[i]) {
                    array.splice(i, 1);
                }
            }
        };
        Utils.randomNumber = function (max, min) {
            if (min === void 0) { min = 0; }
            return Math.floor((Math.random() * max) + min);
        };
        return Utils;
    }());
    Bomberman.Utils = Utils;
})(Bomberman || (Bomberman = {}));
//# sourceMappingURL=game.js.map