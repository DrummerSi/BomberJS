/// <reference path="utils/point.ts" />

module Bomberman {

	/*************************************************************
	 * Enums for Typescript
	 *************************************************************/

	// Stages (maps) for the game
	export enum Stage {
		Toys = 1,
		Micro,
		UFO,
		Snow,
		Crayons,
		Classic
	}

	// The game types 
	export enum GameType {
		Local,
		Multiplayer
	}

	// Types of entities available
	export enum EntityType {
		Local,
		Remote,
		Bot,
		Monster
	}

	// Types of monsters in the game
	export enum MonsterType {
		Blue,				//Big blue wavey arm thing
		Blob,				//Small yellow creature
		Bulb,				//Small alien creatures
		Mouse,				//Floating, fast, multi life creature
		Orange,				//Small slow creature
		Snail,				//Slow, multi multi-life creature		
	}

	// Types of tiles support by the game
	export enum TileType {
		Base,
		Soft,
		Hard
	}

	// Colours available for players/ bots
	export enum PlayerColour {
		None = 0,
		White = 1,
		Green,
		Red,
		Blue
	}

	// Facing direction
	export enum Direction {
		None,
        Up,
        Right,
        Down,
        Left		
    }

	// The movements that an entity can make
	export enum Move {
		None,
		Up,
		Right,
		Down,
		Left		
	}

	// The actions that an entity can perform
	export enum Action {
		None,
		Bomb
	}

	//Modes assignable to bots
	export enum BotMode {
		Think,			//Decide what to do next
		Item,			//Pick up an item or drop bomb to destroy wall
		Attack,			//Attack another player
		Defend,			//Try to get to a safe place
		Walk			//Walk in random direction until there is some activity around the bot
	}

	// The items available in the map
	export enum ItemType {
		None = 0,			// NONE
		BombUp = 1,			// +1 bomb
		FireUp = 2,			// +1 bomb strength
	}

	// Type of tile to show debug information about
	export enum DebugTile {
		Danger,
		Movement,
		Path,
		Highlight
	}


	/*************************************************************
	 * Interfaces for Typescript
	 *************************************************************/

	// Settings for the current battle
	export interface IBattleConfig {
		stage: Stage,			//Stage to load
		data: string,			//Additional data to sync stae layouts between clients
		type: GameType,			//The type of game to setup
		players: IRoomPlayers	//TYpe and location of players for current match
	}


	// Settings for the current match
	export interface IMatchConfig {
		type: GameType,			//The type of game to setup
		wins: number			//How many battle wins required
	}


	// A player in a room (lobby)
	export interface IRoomPlayer {
		key: string,
		name: string,
		type: EntityType
	}

	// An array of players in a room, ready to play a game
	export interface IRoomPlayers extends Array<IRoomPlayer> {
		[index: number]: IRoomPlayer
	}


	/*************************************************************
	 * Stage setup information
	 *************************************************************/

	// Hold stage setup information
	export interface IMatchData {
		base: IMatchTile[],
		blocks: IMatchTile[],
		items: IMatchItem[],
		players: any,
		bots: any,
		monsters: any
	}

	// Collection of base tile information for match data
	export interface IMatchTile {
		name: string,
		type: TileType,
		location: Point
	}

	// Collection of item information for match data
	export interface IMatchItem {
		type: ItemType,
		location: Point
	}

	// Holds item information for map setup
	export interface InitialItem {
		type: ItemType,
		qty: number
	}


	/*************************************************************
	 * Multiplayer based interfaces & enums
	 *************************************************************/

	// Message sent to clients
	export interface IMessage {
		tick: number, 
		time: number,
		//changes: MessageChange[]
	}

}