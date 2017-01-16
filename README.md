# Bomberman JS
**In development multiplayer clone of the old DOS game Mr. Boom :bomb:**

## Install
Clone the repository and execute the /build directory from a web server.
Or load up the included Visual Studio project

## Contributing
Contributions, new features and bug fixes are welcomed.

1. Fork it
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some featured'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request!

## Roadmap, features & bugs

### 1. MAIN GAME
* Powerups required (? = Not decided yet)
  * Speed up = +1 speed
  * Power up = +1 Firepower
  * Boot? = Allow kicking of bombs
  * Boxing glove? = Allow punching of bombs (Goes over walls)
  * GOLD speed? = Max speed
  * GOLD power? = Max firepower
  * Line bomb? = Places all available bombs in a straight line
  * Skull -- Various debuffs including:
    * Reduce speed (very slow)
    * Radically increase speed (very fast)
    * Disables placing bombs
    * Automatically places bombs as movement occurs
    * Restricts bombs to ONE minimum-range bomb
  * Allow keyboard customization
  * Allow usage of control pad
  * Allow local multiplayer? One keyboard, multiple control pads?

### 1.1. DEBUG
  * Make sure tiles are destroyed by bombs
  * Make sure powerups are rendered
  * Make sure powerups are destroyed when HARD blocks "fall" on them
  * make sure all Bomberman and monsters are killed by HARD blocks falling
  * Write some god-damn unit tests
  * Sometime you die for no reason.. Definately needs fixing
  * Monsters dissapear when web browser panel loses focus (I.E. Switched tab)

### 2. MAPS
* Each map should have a specific theme, with possible varients, and a unique ability, etc. All subject to change. (? = Not decided yet)
  * Classic/ Dungeon - Plain classic-style bomberman map
  * Snow - Snowy map with dancing penguins.. Ice could be slippy? harder to control bombermen. Penguins could fire fireworks into the arena. Igloo!
  * Toys - Bright, flashy level. Have "Turnstiles" on the map that can block bombers in
  * UFO - Partially obscured playing field.. maybe bomberman can be "teleported/ beamed" around the level
  * Micro - Open arena with no destructable blocks where everyone has multiple bombs and maximum firepower
  * Crayons? - Map constricted by large crayons
  * Industrial - A central conveyor belt would allow bombermen and bombs to be transported around the map
  * Space? - background sould be a starfield to distract the player, along with "warp gates" that allow teleporting around the map
  * Forest? - A map covered in many places by trees, obscuring the view.
  * Soccer? - Football pitch themed match. All players can kick the ball at round start
  * Sky - Background sky and cloud animation... "Cloud blocks" can "grow back" after a certain time.

### 3. AI/ Bots
* AI Bombermen should play like human bombermen... Calculate the field, choose where to go, set off bombs, etc
* Monster AI will be available for single player.. Dependant on map
  * "Blue" (a blue thing)
    * Moves in x or y until blocked, decides randomly where to turn. Walks until blocked. Avg. speed. 3 lives
  * "Blob" (Yello blobby thing)
    * Moves in x or y until blocked, decides randomly where to turn. Walks until blocked. Avg. speed.
  * "{Orange}" (It's orange)
    * As "Blob", but slower
  * "Snail" (They're snails)
    * Moves in x or y until blocked, decides randomly where to turn. Walks until blocked. Slow speed. 3 lives
  * "Mouse" (Power mode floaters)
    * Fast moving monsters, have 3 lives and can randomly change direction after x amount of blocks travelled
  * "Bulb" (UFO Alien things)
    * Fast movers.. Will only go in either X or Y direction (determined at match start)... Will however change axis is an enemy bomberman is near

### 4. MULTIPLAYER SPECIFIC
* Multiplayer needs re-implimenting into game
* Use Googles Firebase DB / or custom NodeJS server?
* Test against hacking

### 5. UI
* What's going on with the UI? Should it be overlayed in HTML/css, or added directly to the canvas
* Are we sticking to the side menu?
* Allow map selection or RANDOM

### 6. TESTING
* Ongoing testing in latest browsers
* Add mobile support at later date

### 7. FUTURE
* Register/ login to save stats .. Wins/ Loses/ etc
  * Could do this via Facebook login