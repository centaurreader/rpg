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
- [ ] Make gear affect HP, Receive damage from monster when attacking; add death state
  - [x] calc damage savings from gear
  - [x] display HP
  - [x] roll enemy attack damage; miss chance
  - [x] apply damage to HP; display damage taken
  - [x] warn when close to dead
  - [ ] die when hp is <= 0; you died / new game menu
- [ ] Make leveling increase base HP; heal player for diff of HP gain

### v2
- [ ] Sell inventory items for GP
- [ ] Buy items with GP
- [ ] Show damage when you click
- [ ] Show death animation for monsters
- [ ] More enemy types
