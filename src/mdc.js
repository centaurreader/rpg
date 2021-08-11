/*
  //////////
  BEGIN GAME
  \\\\\\\\\\
*/
// util
function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}
// state
function State() {
  let state = {
    name: null,
    xp: 0,
    gp: 0,
    hp: 200,
    wounds: 0,
    damage: 6,
    level: 1,
    inventory: [],
    enemy: null,
    inventoryItem: null,
    inventorySlot: null,
    shopItems: [],
    shopItem: null,
    killCount: 0,
    missCount: 0,
    upgrades: [],
    heals: 0,
    characters: [],
    hasDied: false,
    hasWon: false,
    characterId: crypto.getRandomValues(new Uint32Array(4)).join('-'),
  };
  this.getState = () => state;
  this.setState = incoming => {
    state = {
      ...state,
      ...incoming,
    };
  };
}
const gameState = new State();
const SAVE_KEY = 'rpg-state';
const SAVED_CHARACTERS = 'rpg-characters';
function serializeCharacterFromState() {
  const state = gameState.getState();
  return {
    name: state.name,
    xp: state.hasDied ? 0 : state.xp,
    gp: state.gp,
    hp: state.hasDied ? 200 : state.hp,
    damage: state.hasDied ? 6 : state.damage,
    wounds: state.hasDied ? 0 : state.wounds,
    level: state.hasDied ? 1: state.level,
    inventory: state.inventory,
    enemy: state.hasDied ? null : state.enemy,
    killCount: state.killCount,
    upgrades: state.upgrades,
    heals: state.heals,
    hasDied: state.hasDied,
    hasWon: state.hasWon,
    characterId: state.characterId,
  };
}
function hydrateGameStateFromCharacter(character) {
  return {
    name: character.name,
    xp: character.xp,
    gp: character.gp,
    hp: character.hp,
    wounds: character.wounds,
    damage: character.damage,
    level: character.level,
    inventory: character.inventory,
    enemy: character.enemy,
    killCount: character.killCount,
    missCount: character.missCount,
    upgrades: character.upgrades,
    heals: character.heals,
    hasDied: character.hasDied,
    hasWon: false,
    hasDied: character.hasDied,
    characterId: character.characterId,
  };
}
function save(shouldDumpState) {
  let charactersToSave = gameState.getState().characters.map((character) => {
    if (character.characterId === gameState.getState().characterId && !shouldDumpState) {
      return serializeCharacterFromState(gameState.getState());
    }
    return character;
  });
  if (!charactersToSave.length && !shouldDumpState) {
    charactersToSave = [serializeCharacterFromState(gameState.getState())];
  }
  gameState.setState({ characters: charactersToSave });
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState.getState()));
  localStorage.setItem(SAVED_CHARACTERS, JSON.stringify(charactersToSave));
}
function validateGameData(data) {
  const tempState = new State();
  return {
    ...tempState.getState(),
    ...(data || {}),
    inventory: ((data || {}).inventory || []).filter((item) => typeof item === 'object'),
  };
}
function load() {
  try {
    const characters = JSON.parse(localStorage.getItem(SAVED_CHARACTERS));
    gameState.setState(validateGameData({
      characters: characters || [],
    }));
  } catch (err) {
    console.log(err);
  }
}
function selectCharacter(character) {
  gameState.setState({
    ...hydrateGameStateFromCharacter(character),
  });
}

// engine
const startGame = () => {
  // apply heals upgrade (if dead)
  const healUpgrade = getUpgrade('Alchemist');
  if (!gameState.getState().enemy) {
    genEnemy();
    if (healUpgrade) {
      gameState.setState({ heals: 1 });
    }
  }
  // trigger upgrade purchase (if dead)
}
const upgradeTable = [
  { name: 'Alchemist', description: 'Gain one health potion for each area you visit', stats: [ { name: 'Potions', value: 1 } ] },
  { name: 'Cleave', description: 'Gain a chance to deal 2x damage on hit', stats: [ { name: 'Chance', value: .2 }, { name: 'Multiplier', value: 2 } ] },
  { name: 'Drain', description: 'Steal 1% of enemy life on hit', stats: [ { name: 'Life Drain', value: .01 } ] },
  { name: 'Marksman', description: '+20 base accuracy', stats: [ { name: 'Accuracy', value: 20 } ] },
  { name: 'Nimble', description: '+20 base dodge', stats: [ { name: 'Dodge', value: 20 } ] },
  { name: 'Overpower', description: '+10% critical hit chance', stats: [ { name: 'Multiplier', value: 1.25, }, { name: 'Chance', value: .2 } ] },
  { name: 'Refined', description: 'Increase dropped loot quality by 30%', stats: [ { name: 'Loot Quality', value: 0.3 } ] },
  { name: 'Scavenger', description: '+10% chance to drop loot on enemy death', stats: [ { name: 'Loot Find', value: 0.1 } ] },
];
const equipmentSlots = [
  { key: 'HEAD', value: 'Head', },
  { key: 'BODY', value: 'Body', },
  { key: 'LEFT_HAND', value: 'Left Hand', },
  { key: 'RIGHT_HAND', value: 'Right Hand', },
  { key: 'LEGS', value: 'Legs', },
  { key: 'FEET', value: 'Feet', },
];
const lootTable = [
    [
        { name: 'Amazing', modifier: 4.5, statType: 'Armor' },
        { name: 'Bad', modifier: 1.5, statType: 'Armor' },
        { name: 'Broken', modifier: .5, statType: 'Armor' },
        { name: 'Cheap', modifier: 1, statType: 'Armor' },
        { name: 'Cool', modifier: 4,  statType: 'Armor'},
        { name: 'Crappy', modifier: 1.5, statType: 'Armor', },
        { name: 'Dank', modifier: 5, statType: 'Armor' },
        { name: 'Fancy', modifier: 3, statType: 'Armor' },
        { name: 'Heavy', modifier: 3.5, statType: 'Armor' },
        { name: 'Magic', modifier: 4.5, statType: 'Armor' },
        { name: 'Shiny', modifier: 2, statType: 'Armor' },
        { name: 'Ugly', modifier: 1.5, statType: 'Armor' },
        { name: 'Worthless', modifier: .5, statType: 'Armor' },
    ],
    [
      { name: 'Boots', type: 'FEET', modifier: 5, stats: [ { name: 'Dodge', value: 10 } ], statType: 'Armor' },
      { name: 'Clogs', type: 'FEET', modifier: 3, stats: [ { name: 'Dodge', value: 20 } ], statType: 'Armor' },
      { name: 'Sandals', type: 'FEET', modifier: 2, stats: [ { name: 'Dodge', value: 30 } ], statType: 'Armor' },
      { name: 'Shoes', type: 'FEET', modifier: 4, stats: [ { name: 'Dodge', value: 15 } ], statType: 'Armor' },

      { name: 'Pants', type: 'LEGS', modifier: 3, stats: [ { name: 'Dodge', value: 10 } ], statType: 'Armor' },
      { name: 'Loin Cloth', type: 'LEGS', modifier: 1, stats: [ { name: 'Dodge', value: 20 } ], statType: 'Armor' },
      { name: 'Skirt', type: 'LEGS', modifier: 2, stats: [ { name: 'Dodge', value: 15 } ], statType: 'Armor' },
      { name: 'Leggings', type: 'LEGS', modifier: 2, stats: [ { name: 'Dodge', value: 15 } ], statType: 'Armor' },

      { name: 'Cap', type: 'HEAD', modifier: 2, statType: 'Armor' },
      { name: 'Hat', type: 'HEAD', modifier: 3, statType: 'Armor' },
      { name: 'Helmet', type: 'HEAD', modifier: 5, statType: 'Armor' },
      { name: 'Ribbon', type: 'HEAD', modifier: 1, statType: 'Armor' },

      { name: 'Chainmail', type: 'BODY', modifier: 6, statType: 'Armor' },
      { name: 'Cuirass', type: 'BODY', modifier: 5, stats: [ { name: 'Dodge', value: 5 } ], statType: 'Armor' },
      { name: 'Doublet', type: 'BODY', modifier: 3, stats: [ { name: 'Dodge', value: 10 } ], statType: 'Armor' },
      { name: 'Shirt', type: 'BODY', modifier: 2, stats: [ { name: 'Dodge', value: 20 } ], statType: 'Armor' },

      { name: 'Buckler', type: 'HAND', modifier: 2, statType: 'Armor' },
      { name: 'Heater', type: 'HAND', modifier: 5, statType: 'Armor', },
      { name: 'Tower Shield', type: 'HAND', modifier: 10, statType: 'Armor' },

      { name: 'Axe', type: 'HAND', modifier: 10, stats: [ { name: 'Accuracy', value: 50 } ], statType: 'Damage' },
      { name: 'Bow', type: 'HAND', modifier: 3, stats: [ { name: 'Accuracy', value: 90 } ], statType: 'Damage' },
      { name: 'Flail', type: 'HAND', modifier: 6, stats: [ { name: 'Accuracy', value: 60 } ], statType: 'Damage' },
      { name: 'Hammer', type: 'HAND', modifier: 5, stats: [ { name: 'Accuracy', value: 70 } ], statType: 'Damage' },
      { name: 'Lance', type: 'HAND', modifier: 4, stats: [ { name: 'Accuracy', value: 80 } ], statType: 'Damage' },
      { name: 'Mace', type: 'HAND', modifier: 5, stats: [ { name: 'Accuracy', value: 70 } ], statType: 'Damage' },
      { name: 'Scepter', type: 'HAND', modifier: 3, stats: [ { name: 'Accuracy', value: 90 } ], statType: 'Damage' },
      { name: 'Staff', type: 'HAND', modifier: 2, stats: [ { name: 'Accuracy', value: 90 } ], statType: 'Damage' },
      { name: 'Sword', type: 'HAND', modifier: 7, stats: [ { name: 'Accuracy', value: 75 } ], statType: 'Damage' },
    ],
];
const enemyTable = [
  [
    { name: 'Beautiful', modifier: 2 },
    { name: 'Berserk', modifier: 4 },
    { name: 'Bored', modifier: 1 },
    { name: 'Brilliant', modifier: 2 },
    { name: 'Cursed', modifier: 4 },
    { name: 'Dark', modifier: 3 },
    { name: 'Drunk', modifier: 2 },
    { name: 'Dull', modifier: 1 },
    { name: 'Dumpy', modifier: 1 },
    { name: 'Fat', modifier: 2 },
    { name: 'Light', modifier: 3 },
    { name: 'Mystic', modifier: 4 },
    { name: 'Raging', modifier: 3 },
    { name: 'Skinny', modifier: 1 },
    { name: 'Stinky', modifier: 2 },
    { name: 'Stoned', modifier: 1 },
    { name: 'Ugly', modifier: 2 },
    { name: 'Wretched', modifier: 3 },
  ],
  [
    { name: 'Orc', modifier: 2, },
  ],
];
const getUpgrade = (name) => {
  const { upgrades } = gameState.getState();
  return upgrades.find((upgrade) => upgrade.name === name);
};
const getEnemyLevelForPlayerLevel = (level) => {
  const diff = Math.floor(Math.random() * 4);
  return Math.abs(diff >= 2 ? level + Math.ceil(diff / 2) : level - diff);
};
const getXpForLevel = (level) => {
  const translation = 50;
  const percentageIncrease = .1;
  return Math.ceil(translation * (1 + percentageIncrease)**level);
};
const calcXp = () => {
  const { xp: currentXp, enemy } = gameState.getState();
  const enemyXp = Math.ceil(enemy.level * 2.5);
  const newXp = currentXp + enemyXp;
  gameState.setState({
    xp: newXp,
  });
};
const calcLevel = () => {
  const { xp, level, hp, wounds, heals, } = gameState.getState();
  const healUpgrade = getUpgrade('Alchemist');
  const shouldLevelUp = xp >= getXpForLevel(level);
  const hpIfLevelUp = 10 * ((level - 1) * (level + 2)) + 200;
  const woundsIfLevelUp = wounds - (hpIfLevelUp - hp) < 0 ? 0 : wounds - (hpIfLevelUp - hp);

  const dinged10 = shouldLevelUp && level + 1 === 10;
  const dinged24 = shouldLevelUp && level + 1 === 24;
  const dinged44 = shouldLevelUp && level + 1 === 44;
  const dinged = dinged10 || dinged24 || dinged44;
  if (dinged10 || dinged24 || dinged44) {
    gameState.setState({
      heals: healUpgrade ? heals + 1 : heals,
      shopItems: equipmentSlots.map((slot) => {
        let slotName = slot.key;
        if (slotName.includes('HAND')) {
          slotName = 'HAND';
        }
        return rollItem(slotName);
      }),
    });
    areaMenuModalEl.classList.add('modal-visible');
  }

  gameState.setState({
    level: shouldLevelUp ? level + 1 : level,
    xp: shouldLevelUp ? 0 : xp,
    hp: shouldLevelUp ? hpIfLevelUp : hp,
    wounds: dinged ? 0 : (shouldLevelUp ? woundsIfLevelUp : wounds),
  });
};
const getLocation = (state) => {
  const defaultedState = state || gameState.getState();
  if (defaultedState.level < 10) {
    return 'Open Field';
  }
  if (defaultedState.level > 10) {
    return 'Dark Woods';
  }
  if (defaultedState.level > 24) {
    return 'Ruined Harbor';
  }
  if (defaultedState.level > 44) {
    return 'Orc Stronghold';
  }
}
const shouldLoot = () => {
  const scavengerUpgrade = { stats: [ { name: 'Loot Find', value: 0.1 } ] };
  let skewAmount = .6;
  if (scavengerUpgrade) {
    skewAmount = skewAmount - scavengerUpgrade.stats.find((s) => s.name === 'Loot Find').value;
  }
  const limit = 10000;
  const rng = Math.ceil(Math.random() * limit);
  const skewed = rng / skewAmount;
  return skewed > limit;
};
const rollLootLevel = () => {
  const { level } = gameState.getState();
  const refinedUpgrade = getUpgrade('Refined');
  let minAmount = 5;
  if (refinedUpgrade) {
    minAmount = minAmount - Math.ceil(minAmount * refinedUpgrade.stats.find((s) => s.name === 'Loot Quality').value);
  }
  const min = Math.abs(level - minAmount);
  const max = level + 2;
  return Math.ceil(Math.pow(Math.random(), 3) * (max - min) + min);
};
const rollItem = (slot) => {
  const cat1 = Math.floor(Math.random() * lootTable[0].length);
  const typeTable = slot ? lootTable[1].filter((type) => type.type === slot) : lootTable[1];
  const cat2 = Math.floor(Math.random() * typeTable.length);
  const lootLevel = rollLootLevel();
  return {
    name: `Lvl ${lootLevel} ${lootTable[0][cat1].name} ${typeTable[cat2].name}`,
    quality: lootTable[0][cat1],
    type: typeTable[cat2],
    power: Math.ceil((lootTable[0][cat1].modifier * typeTable[cat2].modifier) * lootLevel),
    statType: typeTable[cat2].statType,
    equipped: null,
    level: lootLevel,
  };
};
const lootProc = () => {
  if (!shouldLoot()) {
    return;
  }
  const state = gameState.getState();
  gameState.setState({
    inventory: [
      ...state.inventory,
      rollItem(),
    ],
  });
  inventoryIconEl.classList.add('inventory_icon-lit');
  setTimeout(() => {
    inventoryIconEl.classList.remove('inventory_icon-lit');
    setTimeout(() => {
      inventoryIconEl.classList.add('inventory_icon-lit');
      setTimeout(() => {
        inventoryIconEl.classList.remove('inventory_icon-lit');
      }, 125);
    }, 125);
  }, 125);
};
const calcGp = () => {
  const orcGoldMax = 20;
  const orcGoldMin = 1;
  const goldDropped = Math.ceil(Math.random() * orcGoldMax) || orcGoldMin;

  const state = gameState.getState();
  gameState.setState({
    gp: state.gp + goldDropped,
  });
};
const getItemValue = (item) => {
  return item.power * 5;
};
const getEnemyDamageModifierForLevel = (level) => {
  if (level > 44) {
    return 4;
  }
  if (level > 24) {
    return 3;
  }
  if (level > 9) {
    return 2;
  }
  return 1;
};
const genEnemy = () => {
  const state = gameState.getState();
  if (state.level === 60) {
    gameState.setState({
      enemy: {
        name: 'Zugare',
        level: 60,
        hp: 10000,
        maxHp: 10000,
        damage: 3400,
        image: 'img/boss.gif',
      },
    });
  } else {
    const level = getEnemyLevelForPlayerLevel(state.level);
    const type = enemyTable[0][Math.floor(Math.random() * enemyTable[0].length)];
    const enemy = enemyTable[1][Math.floor(Math.random() * enemyTable[1].length)];
    const enemyHp = (type.modifier + level) * (enemy.modifier + level);
    gameState.setState({
      enemy: {
        name: `${type.name} ${enemy.name}`,
        level: level === 0 ? 1 : level,
        hp: enemyHp,
        maxHp: enemyHp,
        damage: type.modifier * enemy.modifier * level * getEnemyDamageModifierForLevel(level),
        image: 'img/enemy.gif',
      },
    });
  }
};
const getAccuracyRating = () => {
  const { inventory } = gameState.getState();
  const equippedWeapons = inventory.filter((item) => item.equipped && item.equipped.includes('HAND') && item.statType === 'Damage');
  const isUnarmed = equippedWeapons.length === 0;
  const isDualWielding = equippedWeapons.length === 2;
  const marksmanUpgrade = getUpgrade('Marksman');
  let accuracyRating = equippedWeapons.reduce((sum, curr) => {
    const { value } = curr.type.stats ? curr.type.stats.find((stat) => stat.name === 'Accuracy') : { value: 75 };
    return sum + value;
  }, 0);
  if (marksmanUpgrade) {
    accuracyRating = accuracyRating + marksmanUpgrade.stats.find((s) => s.name === 'Accuracy').value;
  }
  if (isUnarmed) {
    return 100;
  }
  if (isDualWielding) {
    accuracyRating = (accuracyRating * .8) / 2;
  }
  return accuracyRating > 100 ? 100 : accuracyRating;
};
const shouldHit = () => {
  const accuracyRating = getAccuracyRating();
  const willHit = Math.floor(Math.random() * 100) > (100 - accuracyRating);
  if (!willHit) {
    const { missCount } = gameState.getState();
    gameState.setState({
      missCount: missCount + 1,
    });
    if (missCount + 1 > 2) {
      gameState.setState({
        missCount: 0,
      });
      return true;
    } else {
      gameState.setState({
        missCount: missCount + 1,
      });
    }
  }
  return willHit;
};
const shouldOverpower = () => {
  const overpowerUpgrade = getUpgrade('Overpower');
  return overpowerUpgrade
    ? Math.random() < overpowerUpgrade.stats.find(s => s.name === 'Chance').value
    : false;
};
const shouldCleave = () => {
  const cleaveUpgrade = getUpgrade('Cleave');
  return cleaveUpgrade
    ? Math.random() < cleaveUpgrade.stats.find(s => s.name === 'Chance').value
    : false;
};
const getDamage = (damageMultiplier = 1) => {
  const { damage, inventory, level } = gameState.getState();
  const arms = inventory.filter((item) => (item.equipped || '').includes('HAND') && item.statType === 'Damage');
  const damageProc = (damage * level) + arms.reduce((total, item) => item.power + total, 0);
  return damageProc * damageMultiplier;
};
const rollDamage = (damageMultiplier) => {
  const calculatedDamage = Math.ceil(getDamage(damageMultiplier));
  return shouldHit() ? calculatedDamage : 0;
};
const getDodgeRating = () => {
  const { inventory } = gameState.getState();
  const equippedArmor = inventory.filter((item) => item.equipped && item.statType === 'Armor');
  const nimbleUpgrade = getUpgrade('Nimble');
  let dodgeRating = equippedArmor.reduce((sum, curr) => {
    const { value } = curr.type.stats ? curr.type.stats.find((stat) => stat.name === 'Dodge') : { value: 0 };
    return sum + value;
  }, 0);
  if (nimbleUpgrade) {
    dodgeRating = dodgeRating + nimbleUpgrade.stats.find((s) => s.name === 'Dodge').value;
  }
  return dodgeRating > 100 ? 100 : dodgeRating;
};
const shouldDodge = () => {
  const dodgeRating = getDodgeRating();
  return (Math.random() * 100) < (dodgeRating / 2);
};
const getMissChanceforLevel = () => {
  const { level } = gameState.getState();
  if (level > 44) {
    return 80;
  }
  if (level > 24) {
    return 60;
  }
  if (level > 10) {
    return 40;
  }
  return 20;
};
const shouldMiss = () => {
  return Math.random() * 100 > getMissChanceforLevel();
};
const rollEnemyDamage = (enemy) => {
  const shouldHit = !shouldMiss() && !shouldDodge();
  return shouldHit ? enemy.damage : 0;
};
const getArmorRating = () => {
  const { inventory } = gameState.getState();
  const equippedHpItems = inventory.filter((item) => item.statType === 'Armor' && !!item.equipped);
  return equippedHpItems.reduce((total, item) => item.power + total, 0);
};
const getBlockRating = () => {
  return Math.ceil(getArmorRating() / 10);
};
const calcWounds = (damage) => {
  const armorRating = getArmorRating();
  const damageMod = armorRating / 10;
  const calcDamage = damage - damageMod;
  return calcDamage > 0 ? Math.ceil(calcDamage) : 0;
};
const reduceEnemyHp = (damage) => {
  const { enemy, wounds } = gameState.getState();
  let damageProc = damage;
  const drainUpgrade = getUpgrade('Drain');
  let healAmount = 0;
  if (damage > 0 && drainUpgrade) {
    const drainUpgradeStat = drainUpgrade.stats.find((stat) => stat.name === 'Life Drain');
    healAmount = Math.ceil(enemy.hp * drainUpgradeStat.value);
    damageProc = damage + healAmount;
  }
  const newHp = enemy.hp - damageProc;
  gameState.setState({
    enemy: {
      ...enemy,
      hp: newHp <= 0 ? 0 : newHp,
    },
    wounds: wounds - healAmount > 0 ? wounds - healAmount : 0,
  });
  save();
};
function onAttack() {
  if (attackButtonEl.disabled) {
    return;
  }
  attack.setAttribute('style', 'visibility: visible');
}
function equipItem(slotName, toEquip) {
  const { inventory } = gameState.getState();
  gameState.setState({
    inventory: inventory.map((item) => {
      if (item === toEquip) {
        return {
          ...toEquip,
          equipped: slotName,
        };
      }
      if (item.equipped === slotName) {
        return {
          ...item,
          equipped: null,
        };
      }
      return item;
    }),
    inventoryItem: {
      ...toEquip,
      equipped: slotName,
    },
  });
  updateUi(gameState.getState());
  save();
}
function incrementKillCount() {
  gameState.setState({
    killCount: gameState.getState().killCount + 1,
  });
}
function didWin() {
  const { enemy, level } = gameState.getState();
  if (enemy.name === 'Zugare') {
    return true;
  }
  return false;
}
function isPlayerDead() {
  return gameState.getState().wounds >= gameState.getState().hp;
}
function tick() {
  if (attackButtonEl.disabled) {
    return;
  }
  attack.setAttribute('style', 'visibility: hidden');

  const willCleave = shouldCleave();
  const cleaveUpgrade = getUpgrade('Cleave');
  const cleaveMultiplier = willCleave ? cleaveUpgrade.stats.find(s => s.name === 'Multiplier').value : 0;

  const willOverpower = shouldOverpower();
  const overpowerUpgrade = getUpgrade('Overpower');
  const overpowerMultiplier = willOverpower ? overpowerUpgrade.stats.find(s => s.name === 'Multiplier').value : 0;

  const dmgMultiplier = overpowerMultiplier + cleaveMultiplier;
  const damageDone = rollDamage(dmgMultiplier === 0 ? 1 : dmgMultiplier);

  if (willCleave) {
    cleaveEl.setAttribute('style', 'visibility: visible');
    setTimeout(() => { cleaveEl.setAttribute('style', 'visibility: hidden'); }, 500);
  }
  if (willOverpower) {
    critEl.setAttribute('style', 'visibility: visible');
    setTimeout(() => { critEl.setAttribute('style', 'visibility: hidden'); }, 500);
  }
  if (damageDone === 0) {
    missEl.setAttribute('style', 'visibility: visible');
    setTimeout(() => { missEl.setAttribute('style', 'visibility: hidden'); }, 500);
  }

  reduceEnemyHp(damageDone);

  if (gameState.getState().enemy.hp <= 0) {
    enemyHpStatusEl.setAttribute('style', 'width: 0');
    setTimeout(() => {
      incrementKillCount();
      calcXp();
      calcLevel();
      lootProc();
      calcGp();
      if (didWin()) {
        launchGameWinModal()
      } else {
        genEnemy();
        updateUi(gameState.getState());
        save();
      }
    }, 250);
  } else {
    updateUi(gameState.getState());
    save();
  }

  const wounds = calcWounds(rollEnemyDamage(gameState.getState().enemy));
  if (wounds > 0) {
    showWound(`-${wounds}`);
    gameState.setState({ wounds: gameState.getState().wounds + wounds });
  }
  if (isPlayerDead()) {
    launchDeathModal();
  }
}

/*
  \\\\\\\\
  BEGIN UI
  ////////
*/
// main ui
const titleIconEl = document.getElementById('title_icon');
const healButtonEl = document.getElementById('heal_button');
const characterButtonEl = document.getElementById('character_button');
const inventoryButtonEl = document.getElementById('inventory_button');
const inventoryIconEl = document.getElementById('inventory_icon');
const xpEl = document.getElementById('xp');
const xpStatusEl = document.getElementById('xp_status');
const hpEl = document.getElementById('hp');
const hpStatusEl = document.getElementById('hp_status');
const characterNameEl = document.getElementById('character_name');
const levelEl = document.getElementById('level');
const woundIndicatorEl = document.getElementById('wound_indicator');
const enemyImageEl = document.getElementById('enemy');
const enemyNameEl = document.getElementById('enemy_name');
const enemyLevelEl = document.getElementById('enemy_level');
const enemyHpEl = document.getElementById('enemy_hp');
const enemyHpStatusEl = document.getElementById('enemy_hp_status');
const hitEl = document.getElementById('attack');
const missEl = document.getElementById('miss');
const critEl = document.getElementById('crit');
const cleaveEl = document.getElementById('cleave');
const attackButtonEl = document.getElementById('attack_action');
const lootDropEl = document.getElementById('loot');
// character
const characterModalEl = document.getElementById('character_menu');
const characterLocationEl = document.getElementById('current_location');
const characterCloseEl = document.getElementById('character_close_button');
const characterStatsEl = document.getElementById('character_stats');
// inventory
const inventoryModalEl = document.getElementById('inventory');
const gpEl = document.getElementById('gp');
const inventoryCloseEl = document.getElementById('inventory_close_button');
const inventorySlotModalEl = document.getElementById('inventory_slot');
const inventorySlotDetailEl = document.getElementById('inventory_slot_detail');
const inventorySlotCloseEl = document.getElementById('inventory_slot_close_button');
const inventoryDetailModalEl = document.getElementById('inventory_detail');
const inventoryDetailCloseEl = document.getElementById('inventory_detail_close_button');
const equippedItemsEl = document.getElementById('equipped_items');
const unequippedInventoryEl = document.getElementById('unequipped_items');
const inventoryDetailItemEl = document.getElementById('inventory_detail_item');
const inventoryDetailActionsEl = document.getElementById('inventory_detail_actions');
// heal menu
const healModalEl = document.getElementById('heal_menu');
const healMenuQtyEl = document.getElementById('heal_menu_qty');
const useHealButtonEl = document.getElementById('use_heal_button');
const healMenuCloseButtonEl = document.getElementById('heal_menu_close_button');
// game menu
const gameMenuModalEl = document.getElementById('game_menu');
const gameMenuTitleEl = document.getElementById('game_menu_title');
const gameMenuDescriptionEl = document.getElementById('game_menu_description');
const gameMenuButtonEl = document.getElementById('game_menu_button');
const characterListEl = document.getElementById('character_list');
// new character menu
const newCharcterMenuEl = document.getElementById('new_character_menu');
const charcterNameInputEl = document.getElementById('character_name_input');
const newCharcterButtonEl = document.getElementById('new_character_button');
// area menu
const areaMenuModalEl = document.getElementById('area_menu');
const areaMenuImageEl = document.getElementById('area_menu_image');
const areaMenuDetailEl = document.getElementById('area_menu_detail');
const shopMenuOpenButtonEl = document.getElementById('shop_menu_open');
const areaMenuCloseButtonEl = document.getElementById('area_menu_close_button');
// shop menu
const shopModalEl = document.getElementById('shop_menu');
const shopSubMenuModalEl = document.getElementById('shop_sub_menu');
const shopGpEl = document.getElementById('shop_gp');
const shopInventoryButtonEl = document.getElementById('shop_inventory_button');
const shopItemGpEl = document.getElementById('shop_item_gp');
const shopItemsEl = document.getElementById('shop_items');
const shopItemDetailEl = document.getElementById('shop_item_detail');
const shopItemActionsEl = document.getElementById('shop_item_actions');
const shopCloseButtonEl = document.getElementById('shop_close_button');
const shopSubCloseButtonEl = document.getElementById('shop_item_close_button');
// boss dialog
const bossDialogEl = document.getElementById('boss_dialog');
const bossDialogCloseEl = document.getElementById('boss_dialog_close');
// end menu
const endMenuEl = document.getElementById('end_menu');
const endMenuCloseEl = document.getElementById('end_close_button');
const endMenuContentEl = document.getElementById('end_content');

// data binding
const UI = {
  xp: {
    element: xpEl,
    value: (el, state) => {
      const currentXp = new Intl.NumberFormat(navigator.language).format(state.xp);
      const xpForLevel = new Intl.NumberFormat(navigator.language).format(getXpForLevel(state.level));
      el.innerHTML = `${currentXp} / ${xpForLevel} xp`;
    },
  },
  xpStatus: { element: xpStatusEl, value: (el, state) => {
    const percent = state.xp / getXpForLevel(state.level);
    el.setAttribute('style', `width: ${percent * 100}%`);
  }, },
  hp: {
    element: hpEl,
    value: (el, state) => {
      const calcdHp = state.hp - state.wounds;
      const currentHp = new Intl.NumberFormat(navigator.language).format(calcdHp < 0 ? 0 : calcdHp);
      const totalHp = new Intl.NumberFormat(navigator.language).format(state.hp);
      el.innerHTML = `${currentHp} / ${totalHp} hp`;
    },
  },
  hpStatus: { element: hpStatusEl, value: (el, state) => {
    const percent = (state.hp - state.wounds) / state.hp;
    if (percent < .25) {
      el.classList.add('bar_filler-danger');
    } else {
      el.classList.remove('bar_filler-danger');
    }
    el.setAttribute('style', `width: ${percent * 100}%`);
  }, },
  gp: {
    element: gpEl,
    value: (el, state) => {
      el.innerHTML = `${el, state.gp} gp`;
    },
  },
  characterName: {
    element: characterNameEl,
    value: (el, state) => {
      el.innerText = state.name;
    },
  },
  level: {
    element: levelEl,
    value: (el, state) => {
      el.innerHTML = `Level ${state.level}`;
    },
  },
  lootDrop: {
    element: lootDropEl,
    value: (() => {
      let lastLootIndex;
      return (el, state) => {
        if (state.inventory.length - 1 > lastLootIndex) {
          const newestLoot = state.inventory[state.inventory.length - 1];
          loot.innerHTML = `Dropped: ${newestLoot.name}`;
          setTimeout(() => {
            loot.innerHTML = '';
          }, 2000);
        }
        lastLootIndex = state.inventory.length - 1;
      };
    })(),
  },
  enemyImage: {
    element: enemyImageEl,
    value: (el, state) => {
      el.src = (state.enemy && state.enemy.image) || 'img/enemy.gif';
    },
  },
  enemyName: {
    element: enemyNameEl,
    value: (el, state) => {
      if (state.enemy) {
        el.innerHTML = state.enemy.name;
      }
    },
  },
  enemyLevel: {
    element: enemyLevelEl,
    value: (el, state) => {
      if (state.enemy) {
        el.innerHTML = `Level ${state.enemy.level}`;
      }
    }
  },
  enemyHp: {
    element: enemyHpEl,
    value: (el, state) => {
      if (state.enemy) {
        el.innerHTML = `${state.enemy.hp} / ${state.enemy.maxHp} hp`;
      }
      lastEnemy = state.enemy;
    },
  },
  enemyHpStatus: {
    element: enemyHpStatusEl,
    value: (el, state) => {
      if (state.enemy) {
        const percent = state.enemy.hp / state.enemy.maxHp;
        el.setAttribute('style', `width: ${percent * 100}%`);
      }
      lastEnemy = state.enemy;
    },
  },
  equippedItems: {
    element: equippedItemsEl,
    value: (el, state) => {
      el.innerHTML = null;

      equipmentSlots.forEach((slot) => {
        const equippedItem = state.inventory.find((item) => item.equipped === slot.key);

        const slotNameEl = document.createElement('p');
        slotNameEl.classList.add('label-small', 'inventory_category');
        slotNameEl.innerText = slot.value;
        el.appendChild(slotNameEl);

        const itemSlotEl = document.createElement('a');
        itemSlotEl.addEventListener('click', () => toSlotSubMenu(slot.key));
        itemSlotEl.setAttribute('href', '#');
        itemSlotEl.classList.add('inventory_item');
        

        const itemNameEl = document.createElement('p');
        itemNameEl.classList.add('label-large');
        itemNameEl.innerText = equippedItem ? equippedItem.name : 'Nothing';
        itemSlotEl.appendChild(itemNameEl);

        const itemStatEl = document.createElement('p');
        itemStatEl.classList.add('label-medium');
        itemStatEl.innerText = equippedItem ? `${equippedItem.power} ${equippedItem.statType}` : 'N/A';
        itemSlotEl.appendChild(itemStatEl);

        el.appendChild(itemSlotEl);
      });
    },
  },
  unequippedItems: {
    element: unequippedInventoryEl,
    value: (el, state) => {
      el.innerHTML = null;

      const unequipped = state.inventory.filter((item) => !item.equipped);
      unequipped.forEach((item) => {
        const itemEl = document.createElement('li');
        itemEl.classList.add('inventory_list_item');

        const itemLinkEl = document.createElement('a');
        itemLinkEl.addEventListener('click', () => toModalSubMenu(item));
        itemLinkEl.setAttribute('href', '#');
        itemLinkEl.classList.add('inventory_item');
        itemEl.appendChild(itemLinkEl);

        const nameEl = document.createElement('p');
        nameEl.innerHTML = item.name;
        nameEl.classList.add('label-large');
        itemLinkEl.appendChild(nameEl);

        const statEl = document.createElement('p');
        statEl.innerHTML = `${item.power} ${item.statType}`;
        statEl.classList.add('label-medium');
        itemLinkEl.appendChild(statEl);

        const sellButtonEl = document.createElement('button');
        sellButtonEl.setAttribute('type', 'button');
        sellButtonEl.classList.add('action_button', 'action_button-hollow', 'action_button-small', 'inventory_item_action');
        sellButtonEl.innerText = 'Sell';
        sellButtonEl.addEventListener('click', () => {
          sellItem(item);
          updateUi(gameState.getState());
        });
        itemEl.appendChild(sellButtonEl);

        el.appendChild(itemEl);
      });
    },
  },
  inventorySlot: {
    element: inventorySlotDetailEl,
    value: (el, state) => {
      if (!state.inventorySlot) {
        return;
      }
      el.innerHTML = null;

      const currentlyEquippedItemsEls = buildEquippedItems(state.inventory, state.inventorySlot);

      const inventoryItemTypeEl = document.createElement('p');
      inventoryItemTypeEl.classList.add('label-small', 'inventory_category');
      inventoryItemTypeEl.innerText = 'Unequipped Items';
      const itemsForSlot = state.inventory
        .filter((item) => !item.equipped)
        .filter((item) => state.inventorySlot.includes(item.type.type));
      const itemsForSlotEls = itemsForSlot.map((item) => buildInventoryDetailItem(
        null,
        item.name,
        `${item.power} ${item.statType}`,
        () => toModalSubMenu(item)
      ));

      currentlyEquippedItemsEls.forEach((els) => {
        const containerEl = document.createElement('a');
        containerEl.addEventListener('click', (e) => { e.preventDefault(); });
        containerEl.setAttribute('href', '#');
        containerEl.classList.add('inventory_item');

        el.appendChild(els.labelEl);
        containerEl.appendChild(els.itemEl);

        el.appendChild(containerEl);
      });
      el.appendChild(inventoryItemTypeEl);
      itemsForSlotEls.forEach((els) => {
        const containerEl = document.createElement('a');
        containerEl.addEventListener('click', (e) => { e.preventDefault(); });
        containerEl.setAttribute('href', '#');
        containerEl.classList.add('inventory_item');

        containerEl.appendChild(els.itemEl);
        el.appendChild(containerEl);
      });
    },
  },
  inventoryDetailItem: {
    element: inventoryDetailItemEl,
    value: (el, state) => {
      el.innerHTML = null;

      if (!state.inventoryItem) {
        return;
      }

      const currentlyEquippedItemsEls = buildEquippedItems(state.inventory, state.inventoryItem.type.type);
      const selectedItemEls = buildInventoryDetailItem(
        'This Item',
        state.inventoryItem.name,
        `${state.inventoryItem.power} ${state.inventoryItem.statType}`
      );

      currentlyEquippedItemsEls.forEach((els) => {
        const containerEl = document.createElement('a');
        containerEl.addEventListener('click', (e) => { e.preventDefault(); });
        containerEl.setAttribute('href', '#');
        containerEl.classList.add('inventory_item');

        el.appendChild(els.labelEl);

        containerEl.appendChild(els.itemEl);
        el.appendChild(containerEl);
      });
      selectedItemEls.itemEl.classList.remove('inventory_item');
      el.appendChild(selectedItemEls.labelEl);
      el.appendChild(selectedItemEls.itemEl);

      const statEls = (state.inventoryItem.type.stats || []).map((stat) => {
        const statEl = document.createElement('p');
        statEl.classList.add('label-small');
        statEl.innerText = `${stat.name}: ${stat.value}`;
        return statEl;
      });
      statEls.forEach((statEl) => { selectedItemEls.itemEl.appendChild(statEl); });

      const valueEl = document.createElement('p');
      valueEl.classList.add('label-small');
      valueEl.innerText = `Value: ${getItemValue(state.inventoryItem)} gp`;
      selectedItemEls.itemEl.appendChild(valueEl);
    },
  },
  inventoryDetailActions: {
    element: inventoryDetailActionsEl,
    value: (el, state) => {
      el.innerHTML = null;

      if (!state.inventoryItem) {
        return;
      }

      const elements = [];

      const isHandItem = state.inventoryItem.type.type === 'HAND';

      if (isHandItem && !state.inventoryItem.equipped) {
        const equipLeftActionEl = document.createElement('button');
        equipLeftActionEl.setAttribute('type', 'button');
        equipLeftActionEl.classList.add('action_button', 'action_button-hollow');
        equipLeftActionEl.innerText = 'Equip Left';
        equipLeftActionEl.addEventListener('click', () => {
          equipItem('LEFT_HAND', state.inventoryItem);
        });
        elements.push(equipLeftActionEl);

        const equipRightActionEl = document.createElement('button');
        equipRightActionEl.setAttribute('type', 'button');
        equipRightActionEl.classList.add('action_button', 'action_button-hollow');
        equipRightActionEl.innerText = 'Equip Right';
        equipRightActionEl.addEventListener('click', () => {
          equipItem('RIGHT_HAND', state.inventoryItem);
        });
        elements.push(equipRightActionEl);
      } else if (!state.inventoryItem.equipped) {
        const equipActionEl = document.createElement('button');
        equipActionEl.setAttribute('type', 'button');
        equipActionEl.classList.add('action_button', 'action_button-hollow');
        equipActionEl.innerText = 'Equip';
        equipActionEl.addEventListener('click', () => {
          equipItem(state.inventoryItem.type.type, state.inventoryItem);
        });
        elements.push(equipActionEl);
      } else {
        const equipActionEl = document.createElement('button');
        equipActionEl.setAttribute('type', 'button');
        equipActionEl.classList.add('action_button', 'action_button-hollow');
        equipActionEl.innerText = 'Unequip';
        equipActionEl.addEventListener('click', () => {
          gameState.setState({
            inventory: state.inventory.map((item) => {
              if (item === state.inventoryItem) {
                return {
                  ...state.inventoryItem,
                  equipped: null,
                };
              }
              return item;
            }),
            inventoryItem: {
              ...state.inventoryItem,
              equipped: null,
            },
          });
          updateUi(gameState.getState());
          save();
        });
        elements.push(equipActionEl);
      }

      const trashItemEl = document.createElement('button');
      trashItemEl.setAttribute('type', 'button');
      trashItemEl.classList.add('action_button', 'action_button-hollow');
      trashItemEl.innerText = 'Sell';
      trashItemEl.addEventListener('click', () => {
        sellItem(state.inventoryItem);
        fromModalSubMenu();
      });
      elements.push(trashItemEl);

      elements.forEach((newElement) => { el.appendChild(newElement); });
    },
  },
  characterLocation: {
    element: characterLocationEl,
    value: (el, state) => {
      const location = getLocation(state);
      el.innerText = `Current Location: ${location}`;
    },
  },
  characterStats: {
    element: characterStatsEl,
    value: (el, state) => {
      el.innerHTML = null;

      const nameEl = document.createElement('li');
      nameEl.classList.add('label-large');
      nameEl.innerText = state.name;
      el.appendChild(nameEl);

      const levelStatEl = document.createElement('li');
      levelStatEl.classList.add('label-large');
      levelStatEl.innerText = `Level ${state.level}`;
      el.appendChild(levelStatEl);

      const hpStatEl = document.createElement('li');
      hpStatEl.classList.add('label-medium');
      hpStatEl.innerText = `${state.hp - state.wounds} / ${state.hp} hp`;
      el.appendChild(hpStatEl);

      const xpStatEl = document.createElement('li');
      xpStatEl.classList.add('label-medium');
      xpStatEl.innerText = `${state.xp} / ${getXpForLevel(state.level)} xp`;
      el.appendChild(xpStatEl);

      const killCountEl = document.createElement('li');
      killCountEl.classList.add('label-medium');
      killCountEl.innerText = `${state.killCount} orcs killed`;
      el.appendChild(killCountEl);

      const damageEl = document.createElement('li');
      damageEl.classList.add('label-small');
      damageEl.innerText = `${getDamage()} damage`;
      el.appendChild(damageEl);

      const armorEl = document.createElement('li');
      armorEl.classList.add('label-small');
      armorEl.innerHTML = `${getArmorRating()} armor`;
      el.appendChild(armorEl);

      const blockStatEl = document.createElement('li');
      blockStatEl.classList.add('label-small');
      blockStatEl.innerHTML = `${getBlockRating()} damage block`;
      el.appendChild(blockStatEl);

      const dodgeEl = document.createElement('li');
      dodgeEl.classList.add('label-small');
      dodgeEl.innerHTML = `${getDodgeRating()} dodge`;
      el.appendChild(dodgeEl);
      
      const accuracyEl = document.createElement('li');
      accuracyEl.classList.add('label-small');
      accuracyEl.innerHTML = `${getAccuracyRating()} accuracy`;
      el.appendChild(accuracyEl);
      
      const gpStatEl = document.createElement('li');
      gpStatEl.classList.add('label-small');
      gpStatEl.innerHTML = `${state.gp} gp`;
      el.appendChild(gpStatEl);

      const upgradesLabelEl = document.createElement('p');
      upgradesLabelEl.classList.add('label-small', 'inventory_category', 'upgrade_category');
      upgradesLabelEl.innerText = 'Upgrades';
      el.appendChild(upgradesLabelEl);

      const upgradesEl = document.createElement('ul');
      upgradesEl.classList.add('upgrade_list');
      if (!state.upgrades.length) {
        const emptyUpgradesEl = document.createElement('p');
        emptyUpgradesEl.classList.add('label-small');
        emptyUpgradesEl.innerText = 'None';
        upgradesEl.appendChild(emptyUpgradesEl);
      }
      state.upgrades.forEach((upgrade) => {
        const upgradeContainerEl = document.createElement('li');
        upgradeContainerEl.classList.add('upgrade_list_item');
        const upgradeNameEl = document.createElement('p');
        upgradeNameEl.classList.add('label-medium');
        upgradeNameEl.innerText = upgrade.name;
        upgradeContainerEl.appendChild(upgradeNameEl);
        const upgradeDescEl = document.createElement('p');
        upgradeDescEl.classList.add('label-small');
        upgradeDescEl.innerText = upgrade.description;
        upgradeContainerEl.appendChild(upgradeDescEl);
        upgradesEl.appendChild(upgradeContainerEl);
      });
      el.appendChild(upgradesEl);
    },
  },
  areaMenu: {
    element: areaMenuDetailEl,
    value: (() => {
      let level;
      return (el, state) => {
        el.innerText = null;

        const locationNameEl = document.createElement('p');
        locationNameEl.classList.add('label-large');
        const locationDetailEl = document.createElement('p');
        locationDetailEl.classList.add('label-medium');

        if (state.level >= 44) {
          areaMenuImageEl.src = 'img/orc-stronghold.gif';
          locationNameEl.innerText = 'Orc Stronghold';
          locationDetailEl.innerText = 'Enemies deal 4x damage';
        }  else if (state.level >= 24) {
          areaMenuImageEl.src = 'img/ruined-harbor.gif';
          locationNameEl.innerText = 'Ruined Harbor';
          locationDetailEl.innerText = 'Enemies deal 3x damage';
        } else if (state.level >= 10) {
          areaMenuImageEl.src = 'img/dark-woods.gif';
          locationNameEl.innerText = 'Dark Woods';
          locationDetailEl.innerText = 'Enemies deal 2x damage';
        } else {
          areaMenuImageEl.src = 'img/open-field.gif';
          locationNameEl.innerText = 'Open Field';
          locationDetailEl.innerText = 'Enemies deal 1x damage';
        }

        el.appendChild(locationNameEl);
        el.appendChild(locationDetailEl);
        level = state.level;
      };
    })(),
  },
  shopGp: {
    element: shopGpEl,
    value: (el, state) => {
      el.innerHTML = `${el, state.gp} gp`;
    },
  },
  shopItems: {
    element: shopItemsEl,
    value: (el, state) => {
      el.innerHTML = null;

      state.shopItems.forEach((item) => {
        const itemSlotEl = document.createElement('a');
        itemSlotEl.addEventListener('click', () => toShopSubMenu(item));
        itemSlotEl.setAttribute('href', '#');
        itemSlotEl.classList.add('inventory_item');
        

        const itemNameEl = document.createElement('p');
        itemNameEl.classList.add('label-large');
        itemNameEl.innerText = item.name;
        itemSlotEl.appendChild(itemNameEl);

        const itemStatEl = document.createElement('p');
        itemStatEl.classList.add('label-medium');
        itemStatEl.innerText = `${item.power} ${item.statType}`;
        itemSlotEl.appendChild(itemStatEl);

        const costEl = document.createElement('p');
        costEl.classList.add('label-small');
        costEl.innerText = `${getItemValue(item)} gp`;
        itemSlotEl.appendChild(costEl);

        el.appendChild(itemSlotEl);
      });
    },
  },
  shopItemGpEl: {
    element: shopItemGpEl,
    value: (el, state) => {
      el.innerHTML = `${el, state.gp} gp`;
    },
  },
  shopItemDetail: {
    element: shopItemDetailEl,
    value: (el, state) => {
      if (!state.shopItem) {
        return;
      }
      el.innerHTML = null;

      const currentlyEquippedItemsEls = buildEquippedItems(state.inventory, state.shopItem.type.type);
      const selectedItemEls = buildInventoryDetailItem(
        'This Item',
        state.shopItem.name,
        `${state.shopItem.power} ${state.shopItem.statType}`
      );

      currentlyEquippedItemsEls.forEach((els) => {
        el.appendChild(els.labelEl);
        el.appendChild(els.itemEl);
      });
      el.appendChild(selectedItemEls.labelEl);
      el.appendChild(selectedItemEls.itemEl);

      const statEls = (state.shopItem.type.stats || []).map((stat) => {
        const statEl = document.createElement('p');
        statEl.classList.add('label-small');
        statEl.innerText = `${stat.name}: ${stat.value}`;
        return statEl;
      });
      statEls.forEach((statEl) => { selectedItemEls.itemEl.appendChild(statEl); });

      const valueEl = document.createElement('p');
      valueEl.classList.add('label-small');
      valueEl.innerText = `Value: ${getItemValue(state.shopItem)} gp`;
      selectedItemEls.itemEl.appendChild(valueEl);      
    },
  },
  shopItemActions: {
    element: shopItemActionsEl,
    value: (el, state) => {
      if (!state.shopItem) {
        return;
      }
      el.innerHTML = null;

      const buyItemEl = document.createElement('button');
      buyItemEl.setAttribute('type', 'button');
      buyItemEl.classList.add('action_button', 'action_button-hollow');
      buyItemEl.innerText = 'Buy';
      if (getItemValue(state.shopItem) > state.gp) {
        buyItemEl.disabled = true;
      }
      buyItemEl.addEventListener('click', () => {
        gameState.setState({
          inventory: [
            ...state.inventory,
            { ...state.shopItem, },
          ],
          shopItems: state.shopItems.filter((shopItem) => shopItem !== state.shopItem),
          gp: state.gp - getItemValue(state.shopItem),
        });
        fromShopSubMenu();
        save();
        updateUi(gameState.getState());
      });
      el.appendChild(buyItemEl);
    },
  },
  bossDialog: {
    element: bossDialogEl,
    value: (() => {
      let level;
      return (el, state) => {
        if (level && level !== 60 && state.level === 60) {
          el.classList.add('dialog-visible');
        }
        level = state.level;
      };
    })(),
  },
  healButton: {
    element: healButtonEl,
    value: (el, state) => {
      const healUpgrade = getUpgrade('Alchemist');
      if (healUpgrade) {
        el.style = '';
        el.querySelector('.toolbar--item_indicator').innerText = state.heals.toString();
        if (state.heals === 0) {
          el.classList.add('toolbar--item-disabled');
          el.querySelector('.toolbar--item_indicator').style = 'display: none;';
          el.removeEventListener('click', openHealModal);
        } else {
          el.querySelector('.toolbar--item_indicator').style = '';
          el.classList.remove('toolbar--item-disabled');
          el.addEventListener('click', openHealModal);
        }
      } else {
        el.style = 'display: none;';
      }
    },
  },
  healMenuQty: {
    element: healMenuQtyEl,
    value: (el, state) => {
      const { heals } = state;
      el.innerText = `${heals === 0 ? 'No' : heals} ${heals > 1 ? 'potions' : 'potion'} available`;
    },
  },
  characterList: {
    element: characterListEl,
    value: (el, { characters }) => {
      el.innerText = '';
      if (!characters.length) {
        const emptyStateCharacterListEl = document.createElement('li');
        emptyStateCharacterListEl.classList.add('character_list_item', 'label-small', 'label-center');
        emptyStateCharacterListEl.innerText = 'No saved characters';
        el.appendChild(emptyStateCharacterListEl);
      }
      characters.forEach((character) => {
        const characterEl = document.createElement('li');
        characterEl.classList.add('character_list_item');

        const characterNameEl = document.createElement('p');
        characterNameEl.classList.add('label-medium');
        characterNameEl.innerText = character.name;
        characterEl.appendChild(characterNameEl);

        const characterDescriptionEl = document.createElement('p');
        characterDescriptionEl.classList.add('label-small');
        const upgradeList = character.upgrades.reduce((list, upgrade) => `${list}${upgrade}, `, '');
        characterDescriptionEl.innerText = `Lvl ${character.level}: ${upgradeList || 'No upgrades'}`;
        characterEl.appendChild(characterDescriptionEl);

        const actionContainerEl = document.createElement('div');
        actionContainerEl.classList.add('character_list_item_actions');
        const continueContainerEl = document.createElement('div');
        const continueButtonEl = document.createElement('button');
        continueButtonEl.setAttribute('type', 'button');
        continueButtonEl.classList.add('action_button', 'action_button-small');
        continueButtonEl.innerText = 'Continue';
        continueContainerEl.appendChild(continueButtonEl);
        continueButtonEl.addEventListener('click', () => {
          continueCharacter(character);
        });
        const deleteContainerEl = document.createElement('div');
        const deleteButtonEl = document.createElement('button');
        deleteButtonEl.setAttribute('type', 'button');
        deleteButtonEl.classList.add('action_button', 'action_button-small', 'action_button-hollow');
        deleteButtonEl.innerText = 'Delete';
        deleteContainerEl.appendChild(deleteButtonEl);
        deleteButtonEl.addEventListener('click', () => {
          deleteCharacter(character);
        });
        actionContainerEl.appendChild(continueContainerEl);
        actionContainerEl.appendChild(deleteContainerEl);
        characterEl.appendChild(actionContainerEl);

        el.appendChild(characterEl);
      });
    },
  }
};
const sellItem = (itemToSell) => {
  gameState.setState({
    inventory: gameState.getState().inventory.filter((item) => item !== itemToSell),
    gp: gameState.getState().gp + getItemValue(itemToSell),
  });
  save();
}
const buildEquippedItems = (inventory, itemType) => {
  const eSlots = equipmentSlots.filter((slot) => slot.key.includes(itemType));
  const currentlyEquippedItemsEls = eSlots.map((slot) => {
    let currentlyEquippedItemEls = buildInventoryDetailItem(
      `Equipped: ${slot.value}`,
      'Nothing',
      'N/A'
    );
    const currentlyEquippedItem = inventory.find((item) => slot.key === item.equipped);
    if (currentlyEquippedItem) {
      currentlyEquippedItemEls = buildInventoryDetailItem(
        `Equipped: ${slot.value}`,
        currentlyEquippedItem.name,
        `${currentlyEquippedItem.power} ${currentlyEquippedItem.statType}`,
        () => toModalSubMenu(currentlyEquippedItem)
      );
    }
    return currentlyEquippedItemEls;
  });
  return currentlyEquippedItemsEls;
};
const buildInventoryDetailItem = (label, name, description, onClick) => {
  const inventoryItemTypeEl = document.createElement('p');
  inventoryItemTypeEl.classList.add('label-small', 'inventory_category');
  inventoryItemTypeEl.innerText = label;

  const inventoryItemInfoContainerEl = document.createElement('div');
  if (onClick) {
    inventoryItemInfoContainerEl.addEventListener('click', onClick);
  }
  inventoryItemInfoContainerEl.classList.add('inventory_item');

  const inventoryItemInfoNameEl = document.createElement('p');
  inventoryItemInfoNameEl.classList.add('label-large');
  inventoryItemInfoNameEl.innerText = name;
  inventoryItemInfoContainerEl.appendChild(inventoryItemInfoNameEl);

  const inventoryItemInfoStatEl = document.createElement('p');
  inventoryItemInfoStatEl.classList.add('label-medium');
  inventoryItemInfoStatEl.innerText = description;
  inventoryItemInfoContainerEl.appendChild(inventoryItemInfoStatEl);

  return { labelEl: inventoryItemTypeEl, itemEl: inventoryItemInfoContainerEl, };
};
const updateUi = (currentState) => {
  Object.values(UI).forEach(item => {
    item.value(item.element, currentState);
  });
};
function buildEndMenuContent(title, displayLocation) {
  const state = gameState.getState();
  const {
    hp,
    wounds,
    xp,
    damage,
    killCount,
    gp,
    upgrades,
  } = state;
  const location = getLocation();
  const stats = [
    `${hp - wounds} / ${hp} hp`,
    `${xp} xp`,
    `${damage} damage`,
    `${getArmorRating()} armor`,
    `${getBlockRating()} damage block`,
    `${getDodgeRating()} dodge`,
    `${getAccuracyRating()} accuracy`,
    `${gp} gp`,
  ];

  const titleEl = document.createElement('p');
  titleEl.classList.add('label-large', 'label-center', 'mdc-mt-lg');
  titleEl.innerText = title;

  const descriptionEl = document.createElement('p');
  descriptionEl.classList.add('label-small', 'label-center');
  if (displayLocation) {
    const description1El = document.createElement('span');
    description1El.innerText = `in the ${location}`;
    const descriptionBreakEl = document.createElement('br');
    descriptionEl.appendChild(description1El);
    descriptionEl.appendChild(descriptionBreakEl);
  }
  const description2El = document.createElement('span');
  description2El.innerText = `after murdering ${new Intl.NumberFormat(navigator.language).format(killCount)} orc`;
  descriptionEl.appendChild(description2El);

  const statHeaderEl = document.createElement('p');
  statHeaderEl.classList.add('label-small', 'inventory_category', 'mdc-mt-md');
  statHeaderEl.innerText = 'Stats';
  const statListEl = document.createElement('ul');
  statListEl.classList.add('stat_list', 'mdc-mb-md');
  stats.forEach((stat) => {
    const statEl = document.createElement('li');
    statEl.classList.add('label-medium');
    statEl.innerText = stat;
    statListEl.appendChild(statEl);
  });

  const inventoryEl = document.createElement('ul');
  inventoryEl.classList.add('unequipped_items');
  equipmentSlots.forEach((slot) => {
    const equippedItem = state.inventory.find((item) => item.equipped === slot.key);

    const containerEl = document.createElement('li');

    const slotNameEl = document.createElement('p');
    slotNameEl.classList.add('label-small', 'inventory_category');
    slotNameEl.innerText = slot.value;
    containerEl.appendChild(slotNameEl);

    const itemSlotEl = document.createElement('div');
    itemSlotEl.classList.add('inventory_item');

    const itemNameEl = document.createElement('p');
    itemNameEl.classList.add('label-large');
    itemNameEl.innerText = equippedItem ? equippedItem.name : 'Nothing';
    itemSlotEl.appendChild(itemNameEl);

    const itemStatEl = document.createElement('p');
    itemStatEl.classList.add('label-medium');
    itemStatEl.innerText = equippedItem ? `${equippedItem.power} ${equippedItem.statType}` : 'N/A';
    itemSlotEl.appendChild(itemStatEl);

    containerEl.appendChild(itemSlotEl);
    
    inventoryEl.appendChild(containerEl);
  });

  const upgradeHeaderEl = document.createElement('p');
  upgradeHeaderEl.classList.add('label-small', 'inventory_category');
  upgradeHeaderEl.innerText = 'Upgrades';
  const upgradesEl = document.createElement('ul');
  upgradesEl.classList.add('upgrade_list');
  if (upgrades.length) {
    upgrades.forEach((upgrade) => {
      const el = document.createElement('li');
      el.classList.add('upgrade_list_item');
      const name = document.createElement('p');
      name.classList.add('label-medium');
      name.innerText = upgrade.name;
      el.appendChild(name);
      const description = document.createElement('p');
      description.classList.add('label-small');
      description.innerText = upgrade.description;
      el.appendChild(description);
      upgradesEl.appendChild(el);
    });
  } else {
    const noUpgradesEl = document.createElement('p');
    noUpgradesEl.classList.add('label-small');
    noUpgradesEl.innerText = 'None';
    upgradesEl.appendChild(noUpgradesEl);
  }

  return [
    titleEl,
    descriptionEl,
    statHeaderEl,
    statListEl,
    inventoryEl,
    upgradeHeaderEl,
    upgradesEl,
  ];
}
function launchDeathModal() {
  attackButtonEl.disabled = true;
  gameState.setState({ hasDied: true });
  setTimeout(() => {
    const endMenuContent = buildEndMenuContent('You died', true);
    endMenuContent.forEach((el) => {
      endMenuContentEl.appendChild(el);
    });
    endMenuEl.classList.add('modal-visible');
    save(true);
    gameState.setState({
      ...hydrateGameStateFromCharacter(serializeCharacterFromState(true)),
    });
  }, 1000);
}
function launchGameWinModal() {
  attackButtonEl.disabled = true;
  gameState.setState({ hasWon: true });
  save();
  setTimeout(() => {
    const endMenuContent = buildEndMenuContent('You won', false);
    endMenuContent.forEach((el) => {
      endMenuContentEl.appendChild(el);
    });
  }, 1000);
}

// actions
titleIconEl.addEventListener('click', () => {
  gameMenuModalEl.classList.add('modal-visible');
});
gameMenuButtonEl.addEventListener('click', () => {
  newCharcterMenuEl.classList.add('modal-visible');
  gameMenuModalEl.classList.remove('modal-visible');
  gameMenuTitleEl.innerText = 'Murder Death Click';
  gameMenuDescriptionEl.innerText = 'Murder Orcs. Get Loot. Level Up.';
});
newCharcterButtonEl.addEventListener('click', () => {
  const name = charcterNameInputEl.value;
  if (!name) {
    return;
  }
  const { characters } = gameState.getState();
  gameState.setState({
    ...new State().getState(),
    name,
  });
  gameState.setState({
    characters: [
      ...characters || [],
      serializeCharacterFromState(),
    ],
  });
  genEnemy();
  save();
  updateUi(gameState.getState());
  attackButtonEl.disabled = false;
  newCharcterMenuEl.classList.remove('modal-visible');
  attackButtonEl.focus();
  charcterNameInputEl.value = '';
});
function continueCharacter(character) {
  if (character.hasDied) {
    gameState.setState({
      ...hydrateGameStateFromCharacter(character),
      hasDied: false,
    });
  } else {
    gameState.setState({
      ...hydrateGameStateFromCharacter(character),
    });
  }
  if (!gameState.getState().enemy) {
    genEnemy();
  }
  updateUi(gameState.getState());
  attackButtonEl.disabled = false;
  gameMenuModalEl.classList.remove('modal-visible');
  attackButtonEl.focus();
}
function deleteCharacter(character) {
  const { characters } = gameState.getState();
  gameState.setState({ characters: characters.filter((c) => c !== character)});
  save(true);
  updateUi(gameState.getState());
}

if (typeof window.ontouchstart === 'undefined') {
  attackButtonEl.addEventListener('mousedown', onAttack);
  attackButtonEl.addEventListener('mouseup', tick);
}
attackButtonEl.addEventListener('touchstart', onAttack, { passive: true });
attackButtonEl.addEventListener('touchend', tick, { passive: true });

document.addEventListener('keypress', debounce((e) => {
  e.preventDefault();
  const openModals = document.querySelector('.modal-visible');
  if (e.key === ' ' && !openModals) {
    onAttack();
    tick();
  }
}, 125));
function openHealModal() {
  healModalEl.classList.add('modal-visible');
}
useHealButtonEl.addEventListener('click', () => {
  const { heals } = gameState.getState();
  if (heals > 0) {
    gameState.setState({
      wounds: 0,
      heals: heals - 1,
    });
    updateUi(gameState.getState());
    save();
    closeHealMenu();
  }
});
function closeHealMenu() {
  healModalEl.classList.remove('modal-visible');
}
healMenuCloseButtonEl.addEventListener('click', closeHealMenu);
characterButtonEl.addEventListener('click', () => {
  characterModalEl.classList.add('modal-visible');
});
characterCloseEl.addEventListener('click', closeCharacterMenu);
function closeCharacterMenu() {
  characterModalEl.classList.remove('modal-visible');
}
inventoryButtonEl.addEventListener('click', () => {
  inventoryModalEl.classList.add('modal-visible');
});
inventoryCloseEl.addEventListener('click', () => {
  inventoryModalEl.classList.remove('modal-visible');
});
function toSlotSubMenu(slot) {
  gameState.setState({ inventorySlot: slot });
  updateUi(gameState.getState());
  inventoryModalEl.classList.add('modal-sub');
  inventorySlotModalEl.classList.add('modal-visible');
}
function fromSlotSubMenu(slot) {
  inventoryModalEl.classList.remove('modal-sub');
  inventorySlotModalEl.classList.remove('modal-visible');
  gameState.setState({ inventorySlot: null });
}
inventorySlotCloseEl.addEventListener('click', fromSlotSubMenu);
function toModalSubMenu(item) {
  gameState.setState({ inventoryItem: item });
  updateUi(gameState.getState());
  inventoryModalEl.classList.add('modal-sub');
  inventoryDetailModalEl.classList.add('modal-visible');
}
function fromModalSubMenu() {
  inventoryModalEl.classList.remove('modal-sub');
  inventoryDetailModalEl.classList.remove('modal-visible');
  gameState.setState({ inventoryItem: null });
  updateUi(gameState.getState());
}
inventoryDetailCloseEl.addEventListener('click', fromModalSubMenu);
function showWound(text) {
  woundIndicatorEl.innerText = text;
  woundIndicatorEl.classList.add('wound-lit');
  setTimeout(() => {
    woundIndicatorEl.innerText = null;
    woundIndicatorEl.classList.remove('wound-lit');
  }, 875)
}
shopMenuOpenButtonEl.addEventListener('click', () => {
  areaMenuModalEl.classList.add('modal-sub');
  shopModalEl.classList.add('modal-visible');
});
areaMenuCloseButtonEl.addEventListener('click', () => {
  areaMenuModalEl.classList.remove('modal-visible');
});
shopCloseButtonEl.addEventListener('click', () => {
  areaMenuModalEl.classList.remove('modal-sub');
  shopModalEl.classList.remove('modal-visible');
});
shopInventoryButtonEl.addEventListener('click', () => {
  inventoryModalEl.classList.add('modal-visible');
});
function toShopSubMenu(item) {
  gameState.setState({ shopItem: item });
  updateUi(gameState.getState());
  shopModalEl.classList.add('modal-sub');
  shopSubMenuModalEl.classList.add('modal-visible');
}
function fromShopSubMenu() {
  shopModalEl.classList.remove('modal-sub');
  shopSubMenuModalEl.classList.remove('modal-visible');
  gameState.setState({ shopItem: null });
}
shopSubCloseButtonEl.addEventListener('click', fromShopSubMenu);
bossDialogCloseEl.addEventListener('click', () => {
  bossDialogEl.classList.remove('dialog-visible');
});
endMenuCloseEl.addEventListener('click', () => {
  endMenuEl.classList.remove('modal-visible');
  gameMenuModalEl.classList.add('modal-visible');
  updateUi(gameState.getState());
});

/* INIT GAME */
load();
updateUi(gameState.getState());
