const cheatModalEl = document.getElementById('cheat');
const cheatXpI = document.getElementById('cheat_xp');
const cheatLevelI = document.getElementById('cheat_level');
const cheatHpI = document.getElementById('cheat_hp');
const cheatCloseEl = document.getElementById('cheat_close');
const lifeDrainEl = document.getElementById('cheat_drain');
const marksmanEl = document.getElementById('cheat_marksman');
const nimbleEl = document.getElementById('cheat_nimble');
const overpowerEl = document.getElementById('cheat_overpower');
const refinedEl = document.getElementById('cheat_refined');
const scavengerEl = document.getElementById('cheat_scavenger');

let press = 0;

document.addEventListener('keydown', (e) => {
  setTimeout(() => {
    press = 0;
  }, 1000);
  if (e.key === 'Escape') { 
    press += 1;
  }
  if (press === 5) {
    /* init upgrades */
    lifeDrainEl.checked = hasUpgrade('Drain');
    marksmanEl.checked = hasUpgrade('Marksman');
    nimbleEl.checked = hasUpgrade('Nimble');
    overpowerEl.checked = hasUpgrade('Overpower');
    refinedEl.checked = hasUpgrade('Refined');
    scavengerEl.checked = hasUpgrade('Scavenger');
    
    /* open modal */
    cheatModalEl.classList.add('modal-visible');
  }
});

cheatXpI.addEventListener('blur', (e) => applyCheat('xp', e.target.value));
cheatLevelI.addEventListener('blur', (e) => applyCheat('level', e.target.value));
cheatHpI.addEventListener('blur', (e) => applyCheat('hp', e.target.value));

lifeDrainEl.addEventListener('click', (event) => {
  applyUpgrade(getUpgradeFromTable('Drain'), lifeDrainEl.checked);
});
marksmanEl.addEventListener('click', (event) => {
  applyUpgrade(getUpgradeFromTable('Marksman'), marksmanEl.checked);
});
nimbleEl.addEventListener('click', (event) => {
  applyUpgrade(getUpgradeFromTable('Nimble'), nimbleEl.checked);
});
overpowerEl.addEventListener('click', () => {
  applyUpgrade(getUpgradeFromTable('Overpower'), overpowerEl.checked);
});
refinedEl.addEventListener('click', () => {
  applyUpgrade(getUpgradeFromTable('Refined'), refinedEl.checked);
});
scavengerEl.addEventListener('click', () => {
  applyUpgrade(getUpgradeFromTable('Scavenger'), scavengerEl.checked);
});

function getUpgradeFromTable(name) {
  return upgradeTable.find(u => u.name === name);
}
function hasUpgrade(upgradeName) {
  const { upgrades } = gameState.getState();
  return upgrades.find((u) => u.name === upgradeName);
}
function applyUpgrade(upgrade, shouldAdd) {
  const { upgrades } = gameState.getState();
  const upgradeInState = upgrades.find((u) => u.name === upgrade.name);
  if (shouldAdd) {
    if (!upgradeInState) {
      gameState.setState({
        upgrades: [
          ...upgrades,
          upgrade,
        ],
      });
    }
  } else {
    gameState.setState({
      upgrades: upgrades.filter((u) => u.name !== upgrade.name),
    });
  }
}

function applyCheat(key, val) {
  gameState.setState({
    [key]: parseInt(val, 10),
  });
  updateUi(gameState.getState());
}

cheatCloseEl.addEventListener('click', () => {
  cheatModalEl.classList.remove('modal-visible');
});

const bossSkipButton = document.getElementById('boss_skip');
bossSkipButton.addEventListener('click', () => {
  cheatXpI.value = 13840;
  cheatXpI.focus();
  cheatLevelI.value = 59;
  cheatLevelI.focus();
  cheatHpI.value = 100000000;
  cheatHpI.focus();
  cheatCloseEl.click();
});
