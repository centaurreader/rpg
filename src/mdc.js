/*
  //////////
  BEGIN GAME
  \\\\\\\\\\
*/
// state
function State() {
  let state = {
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
    killCount: 0,
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
function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState.getState()));
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
    gameState.setState(validateGameData(JSON.parse(localStorage.getItem(SAVE_KEY))));
    if (!gameState.getState().enemy) {
      genEnemy();
    }
    updateUi(gameState.getState());
  } catch (err) {
    console.log(err);
  }
}

// engine
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
const getEnemyLevelForPlayerLevel = (level) => {
  const diff = Math.floor(Math.random() * 4);
  return Math.abs(diff >= 2 ? level + Math.ceil(diff / 2) : level - diff);
};
const getXpForLevel = (level) => {
  const translation = 50;
  const percentageIncrease = .1;
  return Math.ceil(translation * (1 + percentageIncrease)**level);
};
const calcXp = (xpToAdd) => {
  const { xp: currentXp, enemy } = gameState.getState();
  const enemyXp = Math.ceil(enemy.level * 2.5);
  const newXp = currentXp + enemyXp;
  gameState.setState({
    xp: newXp,
  });
};
const calcLevel = () => {
  const { xp, level, hp, wounds } = gameState.getState();
  const shouldLevelUp = xp >= getXpForLevel(level);
  const hpIfLevelUp = hp + ((level + 1) * 4);
  const woundsIfLevelUp = wounds - (hpIfLevelUp - hp) < 0 ? 0 : wounds - (hpIfLevelUp - hp);
  gameState.setState({
    level: shouldLevelUp ? level + 1 : level,
    xp: shouldLevelUp ? 0 : xp,
    hp: shouldLevelUp ? hpIfLevelUp : hp,
    wounds: shouldLevelUp ? woundsIfLevelUp : wounds,
  });
};
const shouldLoot = () => {
  const limit = 10000;
  const rng = Math.ceil(Math.random() * limit);
  const skewed = rng / .6;
  return skewed > limit;
};
const rollLootLevel = () => {
  const state = gameState.getState();
  return Math.ceil(Math.pow(Math.random(), 3) * (state.level + 2));
};
const lootProc = () => {
  if (!shouldLoot()) {
    return;
  }
  const state = gameState.getState();
  const cat1 = Math.floor(Math.random() * lootTable[0].length);
  const cat2 = Math.floor(Math.random() * lootTable[1].length);
  const lootLevel = rollLootLevel();
  gameState.setState({
    inventory: [
      ...state.inventory,
      {
        name: `Lvl ${lootLevel} ${lootTable[0][cat1].name} ${lootTable[1][cat2].name}`,
        quality: lootTable[0][cat1],
        type: lootTable[1][cat2],
        power: Math.ceil((lootTable[0][cat1].modifier * lootTable[1][cat2].modifier) * lootLevel),
        statType: lootTable[1][cat2].statType,
        equipped: null,
        level: lootLevel,
      },
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
  return item.power * 10 * item.level;
};
const getEnemyDamageModifierForLevel = (level) => {
  if (level > 44) {
    return 8;
  }
  if (level > 24) {
    return 4;
  }
  if (level > 9) {
    return 2;
  }
  return 1;
};
const genEnemy = () => {
  const state = gameState.getState();
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
    },
  });
};
const getAccuracyRating = () => {
  const { inventory } = gameState.getState();
  const equippedWeapons = inventory.filter((item) => item.equipped && item.equipped.includes('HAND') && item.statType === 'Damage');
  const isUnarmed = equippedWeapons.length === 0;
  const isDualWielding = equippedWeapons.length === 2;
  let accuracyRating = equippedWeapons.reduce((sum, curr) => {
    const { value } = curr.type.stats ? curr.type.stats.find((stat) => stat.name === 'Accuracy') : { value: 75 };
    return sum + value;
  }, 0);
  if (isUnarmed) {
    return 100;
  }
  if (isDualWielding) {
    accuracyRating = (accuracyRating * .8) / 2;
  }
  return accuracyRating;
};
const shouldHit = () => {
  const accuracyRating = getAccuracyRating();
  return Math.floor(Math.random() * 100) > (100 - accuracyRating);
};
const getDamage = () => {
  const { damage, inventory, level } = gameState.getState();
  const arms = inventory.filter((item) => (item.equipped || '').includes('HAND') && item.statType === 'Damage');
  return (damage * level) + arms.reduce((total, item) => item.power + total, 0);
};
const rollDamage = () => {
  const calculatedDamage = getDamage();
  return shouldHit() ? calculatedDamage : 0;
};
const getDodgeRating = () => {
  const { inventory } = gameState.getState();
  const equippedArmor = inventory.filter((item) => item.equipped && item.statType === 'Armor');
  return equippedArmor.reduce((sum, curr) => {
    const { value } = curr.type.stats ? curr.type.stats.find((stat) => stat.name === 'Dodge') : { value: 0 };
    return sum + value;
  }, 0);
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
const calcWounds = (damage) => {
  const armorRating = getArmorRating();
  const damageMod = armorRating / 10;
  const calcDamage = damage - damageMod;
  return calcDamage > 0 ? Math.ceil(calcDamage) : 0;
};
const reduceEnemyHp = (damage) => {
  const { enemy } = gameState.getState();
  const newHp = enemy.hp - damage;
  gameState.setState({
    enemy: {
      ...enemy,
      hp: newHp <= 0 ? 0 : newHp,
    },
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
function tick() {
  if (attackButtonEl.disabled) {
    return;
  }
  attack.setAttribute('style', 'visibility: hidden');

  const damageDone = rollDamage();
  const wounds = calcWounds(rollEnemyDamage(gameState.getState().enemy));
  if (wounds > 0) {
    showWound(`-${wounds}`);
    gameState.setState({ wounds: gameState.getState().wounds + wounds });
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
      genEnemy();
      updateUi(gameState.getState());
      save();
    }, 250);
  } else {
    updateUi(gameState.getState());
    save();
  }

  if (gameState.getState().wounds >= gameState.getState().hp) {
    attackButtonEl.disabled = true;
    setTimeout(() => {
      gameMenuTitleEl.innerText = 'You died';
      const killCount = new Intl.NumberFormat(navigator.language).format(gameState.getState().killCount);
      gameMenuDescriptionEl.innerText = `after murdering ${killCount} orcs.`;
      localStorage.removeItem('rpg-state');
      gameMenuModalEl.classList.add('modal-visible');
    }, 1000);
  }
}

/*
  \\\\\\\\
  BEGIN UI
  ////////
*/
// main ui
const titleIconEl = document.getElementById('title_icon');
const characterButtonEl = document.getElementById('character_button');
const inventoryButtonEl = document.getElementById('inventory_button');
const inventoryIconEl = document.getElementById('inventory_icon');
const xpEl = document.getElementById('xp');
const xpStatusEl = document.getElementById('xp_status');
const hpEl = document.getElementById('hp');
const hpStatusEl = document.getElementById('hp_status');
const levelEl = document.getElementById('level');
const woundIndicatorEl = document.getElementById('wound_indicator');
const enemyNameEl = document.getElementById('enemy_name');
const enemyLevelEl = document.getElementById('enemy_level');
const enemyHpEl = document.getElementById('enemy_hp');
const enemyHpStatusEl = document.getElementById('enemy_hp_status');
const hitEl = document.getElementById('attack');
const missEl = document.getElementById('miss');
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
// game menu
const gameMenuModalEl = document.getElementById('game_menu');
const gameMenuTitleEl = document.getElementById('game_menu_title');
const gameMenuDescriptionEl = document.getElementById('game_menu_description');
const gameMenuButtonEl = document.getElementById('game_menu_button');
const gameMenuContinueButtonEl = document.getElementById('game_menu_button_continue');
// area menu
const areaMenuModalEl = document.getElementById('area_menu');
const areaMenuImageEl = document.getElementById('area_menu_image');
const areaMenuDetailEl = document.getElementById('area_menu_detail');
const areaMenuCloseButtonEl = document.getElementById('area_menu_close_button');

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
        el.appendChild(els.labelEl);
        el.appendChild(els.itemEl);
      });
      el.appendChild(inventoryItemTypeEl);
      itemsForSlotEls.forEach((els) => {
        el.appendChild(els.itemEl);
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
        el.appendChild(els.labelEl);
        el.appendChild(els.itemEl);
      });
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
        gameState.setState({
          inventory: gameState.getState().inventory.filter((item) => item !== state.inventoryItem),
          gp: state.gp + getItemValue(state.inventoryItem),
        });
        fromModalSubMenu();
        save();
      });
      elements.push(trashItemEl);

      elements.forEach((newElement) => { el.appendChild(newElement); });
    },
  },
  continueButton: {
    element: gameMenuContinueButtonEl,
    value: (el, state) => {
      if (state.wounds < state.hp && state.killCount > 0) {
        el.classList.remove('action_button-hidden');
      } else {
        el.classList.add('action_button-hidden');
      }
    },
  },
  characterLocation: {
    element: characterLocationEl,
    value: (el, state) => {
      if (state.level < 10) {
        el.innerText = 'Current Location: Open Field';
      }
      if (state.level > 10) {
        el.innerText = 'Current Location: Dark Woods';
      }
      if (state.level > 24) {
        el.innerText = 'Current Location: Ruined Harbor';
      }
      if (state.level > 44) {
        el.innerText = 'Current Location: Orc Stronghold';
      }
    },
  },
  characterStats: {
    element: characterStatsEl,
    value: (el, state) => {
      el.innerHTML = null;

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
      blockStatEl.innerHTML = `${Math.ceil(getArmorRating() / 10)} damage block`;
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

        const dinged10 = state.level === 10 && level && level !== 10;
        const dinged24 = state.level === 24 && level && level !== 24;
        const dinged44 = state.level === 44 && level && level !== 44;
        if (dinged10 || dinged24 || dinged44) {
          gameState.setState({ wounds: 0 });
          areaMenuModalEl.classList.add('modal-visible');
        }

        if (state.level >= 44) {
          areaMenuImageEl.src = 'img/orc-stronghold.gif';
          locationNameEl.innerText = 'Orc Stronghold';
          locationDetailEl.innerText = 'Enemies deal 8x damage';
        }  else if (state.level >= 24) {
          areaMenuImageEl.src = 'img/ruined-harbor.gif';
          locationNameEl.innerText = 'Ruined Harbor';
          locationDetailEl.innerText = 'Enemies deal 4x damage';
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
};
const buildEquippedItems = (inventory, itemType) => {
  const eSlots = equipmentSlots.filter((slot) => slot.key.includes(itemType));
  const currentlyEquippedItems = inventory.filter((item) => eSlots.some(slot => slot.key === item.equipped));
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

// actions
titleIconEl.addEventListener('click', () => {
  gameMenuModalEl.classList.add('modal-visible');
});
gameMenuButtonEl.addEventListener('click', () => {
  localStorage.removeItem('rpg-state');
  load();
  attackButtonEl.disabled = false;
  gameMenuModalEl.classList.remove('modal-visible');
  gameMenuTitleEl.innerText = 'Murder Death Click';
  const killCount = new Intl.NumberFormat(navigator.language).format(gameState.getState().killCount);
  gameMenuDescriptionEl.innerText = 'Murder Orcs. Get Loot. Level Up.';
});
gameMenuContinueButtonEl.addEventListener('click', () => {
  gameMenuModalEl.classList.remove('modal-visible');
});
if (typeof window.ontouchstart === 'undefined') {
  attackButtonEl.addEventListener('mousedown', onAttack);
  attackButtonEl.addEventListener('mouseup', tick);
}
attackButtonEl.addEventListener('touchstart', onAttack, { passive: true });
attackButtonEl.addEventListener('touchend', tick, { passive: true });
characterButtonEl.addEventListener('click', () => {
  characterModalEl.classList.add('modal-visible');
});
characterCloseEl.addEventListener('click', () => {
  characterModalEl.classList.remove('modal-visible');
});
inventoryButtonEl.addEventListener('click', () => {
  inventoryModalEl.classList.add('modal-visible');
});
inventoryCloseEl.addEventListener('click', () => {
  inventoryModalEl.classList.remove('modal-visible');
});
function toSlotSubMenu(slot) {
  gameState.setState({ inventorySlot: slot });
  updateUi(gameState.getState());
  inventorySlotModalEl.classList.add('modal-visible');
}
function fromSlotSubMenu(slot) {
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
areaMenuCloseButtonEl.addEventListener('click', () => {
  areaMenuModalEl.classList.remove('modal-visible');
});


/* INIT GAME */
load();