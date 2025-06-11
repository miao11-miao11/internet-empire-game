// Stato iniziale
let coins = 0;
let bitTokens = 0;
let coinsPerClick = 1;
let coinsPerSecond = 0;
let xp = 0;
let level = 1;
let xpNeeded = 100;
let titles = ["Tirocinante", "Startupper", "Imprenditore", "Magnate", "Guru"];
let currentTitle = titles[0];

const upgrades = [
  { id: "server", name: "Server", baseCost: 10, cost: 10, cps: 1, qty: 0 },
  { id: "datacenter", name: "Data Center", baseCost: 100, cost: 100, cps: 10, qty: 0 },
  { id: "marketing", name: "Marketing", baseCost: 50, cost: 50, cps: 5, qty: 0 }
];

const advancedUpgrades = [
  { id: "bit-generator", name: "Bit Token Generator", baseCost: 5, cost: 5, bps: 1, qty: 0 }
];

const missions = [
  { id: 1, description: "Sviluppa 100 app", target: 100, progress: 0, reward: 50, done: false },
  { id: 2, description: "Raggiungi 500 ClickCoin", target: 500, progress: 0, reward: 100, done: false },
  { id: 3, description: "Acquista 10 upgrade", target: 10, progress: 0, reward: 150, done: false }
];

// Elementi DOM
const coinsEl = document.getElementById("coins");
const bitTokensEl = document.getElementById("bitTokens");
const clickBtn = document.getElementById("click-btn");
const perSecondEl = document.getElementById("per-second");
const upgradesListEl = document.getElementById("upgrades-list");
const advancedUpgradesListEl = document.getElementById("advanced-upgrades-list");
const missionsListEl = document.getElementById("missions-list");
const xpEl = document.getElementById("xp");
const xpNeededEl = document.getElementById("xp-needed");
const levelEl = document.getElementById("level");
const titleEl = document.getElementById("title");
const xpBar = document.getElementById("xp-bar");
const advancedFeaturesEl = document.getElementById("advanced-features");
const advancedLockText = document.getElementById("advanced-lock-text");

// Funzioni aggiornamento UI

function updateCoins(amount = 0) {
  coins += amount;
  if (coins < 0) coins = 0;
  coinsEl.textContent = Math.floor(coins);
  updateButtons();
  checkAdvancedFeatureUnlock();
}

function updateBitTokens(amount = 0) {
  bitTokens += amount;
  if (bitTokens < 0) bitTokens = 0;
  bitTokensEl.textContent = Math.floor(bitTokens);
  updateAdvancedButtons();
}

function updateButtons() {
  upgrades.forEach(upg => {
    const btn = document.getElementById(`buy-${upg.id}`);
    if (!btn) return;
    btn.disabled = coins < upg.cost;
  });
}

function updateAdvancedButtons() {
  advancedUpgrades.forEach(upg => {
    const btn = document.getElementById(`buy-adv-${upg.id}`);
    if (!btn) return;
    btn.disabled = bitTokens < upg.cost;
  });
}

function updatePerSecond() {
  // Base cps * level multiplier (1.25 every 10 levels)
  const levelMultiplier = Math.pow(1.25, Math.floor(level / 10));
  coinsPerSecond = upgrades.reduce((sum, u) => sum + u.cps * u.qty, 0) * levelMultiplier;
  perSecondEl.textContent = coinsPerSecond.toFixed(1);
}

function updateXP(amount = 0) {
  xp += amount;
  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.15);
    updateTitle();
  }
  xpEl.textContent = Math.floor(xp);
  xpNeededEl.textContent = xpNeeded;
  levelEl.textContent = level;
  updateXPBar();
}

function updateXPBar() {
  const percent = (xp / xpNeeded) * 100;
  xpBar.style.width = percent + "%";
}

function updateTitle() {
  const newTitleIndex = Math.min(titles.length -1, Math.floor(level / 10));
  currentTitle = titles[newTitleIndex];
  titleEl.textContent = currentTitle;
}

// Crea lista upgrade base
function createUpgradeButtons() {
  upgradesListEl.innerHTML = "";
  upgrades.forEach(upg => {
    const btn = document.createElement("button");
    btn.id = `buy-${upg.id}`;
    btn.textContent = `${upg.name} (${upg.qty}) - Costo: ${upg.cost} ClickCoin`;
    btn.onclick = () => buyUpgrade(upg.id);
    upgradesListEl.appendChild(btn);
  });
  updateButtons();
}

// Crea lista feature avanzate
function createAdvancedUpgradeButtons() {
  advancedUpgradesListEl.innerHTML = "";
  advancedUpgrades.forEach(upg => {
    const btn = document.createElement("button");
    btn.id = `buy-adv-${upg.id}`;
    btn.textContent = `${upg.name} (${upg.qty}) - Costo: ${upg.cost} BitToken`;
    btn.onclick = () => buyAdvancedUpgrade(upg.id);
    advancedUpgradesListEl.appendChild(btn);
  });
  updateAdvancedButtons();
}

// Acquista upgrade base
function buyUpgrade(id) {
  const upg = upgrades.find(u => u.id === id);
  if (!upg) return;
  if (coins >= upg.cost) {
    updateCoins(-upg.cost);
    upg.qty++;
    upg.cost = Math.floor(upg.baseCost * Math.pow(1.15, upg.qty));
    createUpgradeButtons();
    updatePerSecond();
    updateMissionsProgress(1); // Conta come "acquisto upgrade"
  }
}

// Acquista feature avanzate
function buyAdvancedUpgrade(id) {
  const upg = advancedUpgrades.find(u => u.id === id);
  if (!upg) return;
  if (bitTokens >= upg.cost) {
    updateBitTokens(-upg.cost);
    upg.qty++;
    upg.cost = Math.floor(upg.baseCost * Math.pow(1.15, upg.qty));
    createAdvancedUpgradeButtons();
  }
}

// Aggiorna missioni e UI missioni
function updateMissionsProgress(clicks=0) {
  missions.forEach(m => {
    if (!m.done) {
      if (m.id === 1) {
        m.progress += clicks;
      } else if (m.id === 2) {
        m.progress = Math.max(m.progress, coins);
      } else if (m.id === 3) {
        const totalUpgrades = upgrades.reduce((acc, u) => acc + u.qty, 0);
        m.progress = Math.max(m.progress, totalUpgrades);
      }

      if (m.progress >= m.target) {
        m.done = true;
        updateCoins(m.reward);
        alert(`Missione completata: ${m.description}. Premio: ${m.reward} ClickCoin!`);
      }
    }
  });
  renderMissions();
}

function renderMissions() {
  missionsListEl.innerHTML = "";
  missions.forEach(m => {
    const li = document.createElement("li");
    li.textContent = `${m.description} (${Math.min(m.progress, m.target)}/${m.target})`;
    if (m.done) {
      li.style.textDecoration = "line-through";
      li.style.color = "#666";
    }
    missionsListEl.appendChild(li);
  });
}

// Controlla se sbloccare feature avanzate
function checkAdvancedFeatureUnlock() {
  if (coins >= 10000) {
    advancedFeaturesEl.classList.remove("locked");
    advancedLockText.style.display = "none";
    advancedUpgradesListEl.style.display = "block";
  } else {
    advancedFeaturesEl.classList.add("locked");
    advancedLockText.style.display = "block";
    advancedUpgradesListEl.style.display = "none";
  }
}

// Click sul bottone
clickBtn.onclick = () => {
  updateCoins(coinsPerClick);
  updateXP(5);
  updateMissionsProgress(1);
};

// Incremento automatico
setInterval(() => {
  if (coinsPerSecond > 0) {
    updateCoins(coinsPerSecond);
    updateXP(coinsPerSecond * 0.5);
    updateMissionsProgress(0);
  }
  if (advancedUpgrades[0].qty > 0) {
    updateBitTokens(advancedUpgrades[0].bps * advancedUpgrades[0].qty);
  }
}, 1000);

createUpgradeButtons();
createAdvancedUpgradeButtons();
updatePerSecond();
updateXPBar();
renderMissions();
updateButtons();
updateAdvancedButtons();
updateCoins(0);
updateBitTokens(0);
updateTitle();
