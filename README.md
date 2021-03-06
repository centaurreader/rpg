# rpg

RPG gameplay distilled to its purest essence. [Play the game](https://centaurreader.com/rpg).

## Dev Env
- Run `npm start`
- App is now available at http://localhost:3000 (note: app is served from `./src`)

## Build Production
- Run `npm run build`
- Rename `./dist/mdc.js` to `./dist/mdc.[version number].js`
- Rename `./dist/css/style.css` to `./dist/css/style.[version number].css`
- Update imports in `./dist/index.html` with the new file names
- Update displayed version in `./dist/index.html`
- Remove `./dist/cheat.js` and remove script tag for cheat.js in `./dist/index.html`

## TODO
### v1
- [x] Save
- [x] Load
- [x] Scale XP requirement per level
- [x] Randomly generate monster with stats (appropriate for level)
- [x] Make monsters take damage (and make player miss them sometimes)
- [x] Add stats to gear, equip gear, augment player stats (damage)
  - [x] inventory UI
  - [x] open inventory
  - [x] close inventory
  - [x] navigate to sub-menus in inventory
  - [x] equip items
  - [x] unequip items
  - [x] deal weapon damage
- [x] (bug) Games without stored data crash on trying to filter the inventory
- [x] (bug) On mobile tapping attack causes the event to fire twice
- [x] Make it display correctly on phones
- [x] favicon
- [x] (bug) Sometimes enemies are level 0
- [x] (bug) Enemies are sometimes too high level for player level
- [x] show enemy hp drain to 0 before spawning new
- [x] Trash inventory items
- [x] Make gear affect HP, Receive damage from monster when attacking
  - [x] calc damage savings from gear
  - [x] display HP
  - [x] roll enemy attack damage; miss chance
  - [x] apply damage to HP; display damage taken
  - [x] warn when close to dead
- [x] new game menu
- [x] die when hp is <= 0; you died menu
- [x] continue after reloading
- [x] Rename "HP" stat type to "Armor"
- [x] disable attack button when dead
- [x] Make leveling increase base HP; heal player when leveling up
- [x] Open the game menu from mid-game; add continue button if game is in progress
- [x] Equip items from slot menu (click "Head" -> see Head items -> equip one)

### v1.1
- [x] Scale inventory items with progression
  - [x] add level to loot and factor into power
  - [x] roll high level loot less often
  - [x] display loot level in inventory
- [x] Add new calculations for damage
- [x] item stats
  - [x] Make miss chance an accuracy stat on damage items
  - [x] Make enemy miss chance a dodge stat on armor items
  - [x] show stats in inventory screens
- [x] adjust stat scaling to match new calculator
- [x] Character screen
  - [x] gp
  - [x] level
  - [x] hp
  - [x] xp + xp to next level
  - [x] accuracy rating
  - [x] damage rating
  - [x] dodge rating
  - [x] current location
- [x] show location when enemy damage rate changes
  - [x] set location name
  - [x] set location description
  - [x] set location image
    - [x] open field image
    - [x] dark woods image
    - [x] ruined harbor image
    - [x] orc stronghold image
  - [x] reset wounds on new area
- [x] indicate drops at inventory icon
- [x] Store Menu
  - [x] merchant image
  - [x] Sell inventory items for GP
  - [x] Open from area menu
  - [x] Buy items with GP
    - [x] display items
    - [x] display item
    - [x] gen item for each slot; near level
    - [x] add to inv and subtract gp
    - [x] remove from store list
- [x] Zugare (Death Orc)
  - [x] spawn @ level 60
  - [x] boss approaching dialog
  - [x] You Win UI after defeating w/ new game button
- [x] add a link to the root site to the game menu
- [x] (bug) equipment slot items are not links
- [x] scale bottom of drops up when in new areas
- [x] adjust damage formula
  - [x] ruined harbor too strong
  - [x] orc stronghold too strong

### v1.2
- [x] trigger attack with spacebar
- [x] sell from unequipped list
- [x] show feedback when pressing buttons
- [x] go to inventory from shop (to allow selling)
- [x] always hit after 2 consecutive misses

### v1.3
- [x] add width and height to all images
- [x] defer css loading for custom font
- [x] include meta description
- [x] make toolbar list items valid html
- [x] (bug) space bar triggers attack while in modals
- [x] (bug) you will die before being healed by level up causing you to have HP but still get game over
- [x] add permanent upgrades for purchase on death (roguelite ish)
  - [x] Drain: 1% life steal on hit
    - [x] check for drain in tick and apply based on damage done
  - [x] Nimble: +20 dodge
    - [x] add method for proc and always use to access
  - [x] Marksman: +20 accuracy
    - [x] add method for proc and always use to access
  - [x] Scavenger: increase chance to drop loot
    - [x] check in lootProc
  - [x] Refined: chance to drop higher quality loot
    - [x] check in lootProc
  - [x] Overpower: critical hit chance
    - [x] check in get damage
    - [x] different hit indicator
  - [x] Cleave: chance to strike twice
    - [x] check for buff in rollDamage (this should apply hit twice, including drain, etc.)
    - [x] different hit indicator
  - [x] Alchemist: gain health pot when you go to an area
    - [x] conditionally display heal pot
    - [x] track and display number of heals available
    - [x] disable heal pot when no heals available
    - [x] heal modal
    - [x] increment heal count on new area
    - [x] heal icon asset for navbar
    - [x] heal image asset for modal
- [x] upgrade UI
  - [x] display upgrades in character screen
  - [x] use game win modal as death modal
    - [x] display stats
    - [x] display equipment
    - [x] display upgrades
  - [x] buy upgrade on death
    - [x] only allow to buy one upgrade
    - [x] end and go back to title screen
  - [ ] multi-char handling
    - [x] serialize character on save
    - [x] move upgrade hydration refs to character list
    - [x] start new character + set name
    - [x] delete character
    - [x] (bug) new game does not reset in-progress state
    - [x] continue existing character
    - [x] display name in character screen, main game screen
    - [x] only persist upgrades and heals on death (reset xp, hp, inv, etc.)
    - [x] add 'view character' from main menu
  - [x] (bug) 1. die 2. do not buy an upgrade 3. continue as char
          observe: game state is as it was when you died
  - [x] make the new update backwards compatible
