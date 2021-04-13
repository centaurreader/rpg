# rpg

RPG gameplay distilled to its purest essence. [Play the game](https://centaurreader.com/rpg).

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
- [ ] Make miss chance an accuracy stat on damage items
- [ ] Make enemy miss chance a dodge stat on armor items
- [ ] Make enemies have chance to pierce armor

### Later
- [ ] Sell inventory items for GP
- [ ] Buy items with GP
- [ ] Show damage when you click
- [ ] Show death animation for monsters
- [ ] More enemy types
- [ ] PWA compliance
