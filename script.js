(() => {
  const SAVE_KEY = "valeria_v4_saves";
  const MAX_TEAM_SIZE = 4;
  const DUNGEON_FLOORS = 10;
  const STARTING_GOLD = 40;
  const CREATION_POINTS = 30;
  const CREATION_BASE_STATS = { force: 1, rapidity: 1, constitution: 1, mana: 1 };
  const COMBAT_END_FEEDBACK_DELAY = 650;
  let lastDamageCritical = false;

  const CLASS_DEFS = {
    assassin: {
      id: "assassin",
      name: "Assassin",
      emoji: "🗡️",
      baseStats: { force: 1, rapidity: 3, constitution: 0, mana: 0 },
      weaponType: "Dague",
      skills: [
        {
          id: "assassinate",
          icon: "🗡️",
          name: "Assassinat",
          cost: 7,
          requiredLevel: 1,
          description: "Frappe critique ciblée.",
          execute(hero, enemy) {
            const power = Math.round(getHeroDerived(hero).atk * 1.45 + getHeroDerived(hero).crit * 0.35);
            return dealDamage(enemy, power, "physical", 0.15);
          },
        },
        {
          id: "blade_flurry",
          icon: "🌪️",
          name: "Déluge de lames",
          cost: 18,
          requiredLevel: 3,
          description: "Enchaînement rapide qui perce la défense.",
          execute(hero, enemy) {
            const power = Math.round(getHeroDerived(hero).atk * 1.25 + hero.level * 2);
            return dealDamage(enemy, power, "physical", 0.22);
          },
        },
      ],
    },
    warrior: {
      id: "warrior",
      name: "Guerrier",
      emoji: "⚔️",
      baseStats: { force: 2, rapidity: 0, constitution: 2, mana: 0 },
      weaponType: "Épée",
      skills: [
        {
          id: "frenzy",
          icon: "💥",
          name: "Punition frénétique",
          cost: 12,
          requiredLevel: 1,
          description: "Attaque lourde physique.",
          execute(hero, enemy) {
            const power = Math.round(getHeroDerived(hero).atk * 1.55);
            return dealDamage(enemy, power, "physical", 0.08);
          },
        },
        {
          id: "guard_break",
          icon: "🛡️",
          name: "Brise-garde",
          cost: 16,
          requiredLevel: 3,
          description: "Frappe puissante qui affaiblit l’ennemi.",
          execute(hero, enemy) {
            const amount = dealDamage(enemy, Math.round(getHeroDerived(hero).atk * 1.25), "physical", 0.1);
            enemy.statuses.push({ type: "weaken", turns: 2, label: "ATK -20%" });
            return amount;
          },
        },
      ],
    },
    guardian: {
      id: "guardian",
      name: "Gardien",
      emoji: "🛡️",
      baseStats: { force: 0, rapidity: 0, constitution: 3, mana: 1 },
      weaponType: "Masse",
      skills: [
        {
          id: "hydra_bite",
          icon: "🐍",
          name: "Morsure de l'hydre",
          cost: 12,
          requiredLevel: 1,
          description: "Frappe et affaiblit l’ennemi.",
          execute(hero, enemy) {
            const result = dealDamage(enemy, Math.round(getHeroDerived(hero).atk * 1.1), "physical", 0.05);
            enemy.statuses.push({ type: "weaken", turns: 3, label: "ATK -20%" });
            return result;
          },
        },
        {
          id: "iron_wall",
          icon: "🧱",
          name: "Mur de fer",
          cost: 15,
          requiredLevel: 3,
          description: "Le gardien encaisse et frappe en retour.",
          execute(hero, enemy) {
            hero.statuses.push({ type: "defend", turns: 2, label: "Défense renforcée" });
            return dealDamage(enemy, Math.round(getHeroDerived(hero).atk * 0.95), "physical", 0.04);
          },
        },
      ],
    },
    mage: {
      id: "mage",
      name: "Mage",
      emoji: "🔮",
      baseStats: { force: 0, rapidity: 0, constitution: 0, mana: 4 },
      weaponType: "Bâton",
      skills: [
        {
          id: "fireball",
          icon: "🔥",
          name: "Boule de feu",
          cost: 15,
          requiredLevel: 1,
          description: "Dégâts magiques et brûlure.",
          execute(hero, enemy) {
            const power = Math.round(getHeroDerived(hero).magic * 1.7);
            const result = dealDamage(enemy, power, "magic", 0.05);
            enemy.statuses.push({ type: "burn", turns: 3, label: "Brûlure" });
            return result;
          },
        },
        {
          id: "arcane_bolt",
          icon: "⚡",
          name: "Éclair arcanique",
          cost: 11,
          requiredLevel: 3,
          description: "Projectile magique rapide.",
          execute(hero, enemy) {
            return dealDamage(enemy, Math.round(getHeroDerived(hero).magic * 1.35), "magic", 0.09);
          },
        },
      ],
    },
  };

  const STARTER_GEAR = {
    assassin: {
      weapon: { id: "starter_dagger", name: "Dague effilée", type: "weapon", atk: 2, crit: 3, value: 18 },
      armor: { id: "starter_leather", name: "Armure de cuir", type: "armor", def: 1, esq: 2, value: 16 },
    },
    warrior: {
      weapon: { id: "starter_sword", name: "Épée de recrue", type: "weapon", atk: 3, value: 18 },
      armor: { id: "starter_mail", name: "Cotte simple", type: "armor", def: 2, hp: 6, value: 18 },
    },
    guardian: {
      weapon: { id: "starter_mace", name: "Masse lourde", type: "weapon", atk: 2, def: 1, value: 18 },
      armor: { id: "starter_guard", name: "Armure du rempart", type: "armor", def: 3, hp: 10, value: 20 },
    },
    mage: {
      weapon: { id: "starter_staff", name: "Bâton novice", type: "weapon", magic: 3, energy: 8, value: 18 },
      armor: { id: "starter_robe", name: "Robe mystique", type: "armor", def: 1, energy: 6, value: 16 },
    },
  };

  const FOREST_RESOURCES = [
    { key: "Crocs", type: "resource", category: "resources", name: "Crocs", value: 8, stackable: true, icon: "🦷" },
    { key: "Peaux", type: "resource", category: "resources", name: "Peaux", value: 10, stackable: true, icon: "🧶" },
    { key: "Herbes", type: "resource", category: "resources", name: "Herbes", value: 7, stackable: true, icon: "🌿" },
    { key: "Viande", type: "resource", category: "resources", name: "Viande", value: 9, stackable: true, icon: "🥩" },
    { key: "Champignons", type: "resource", category: "resources", name: "Champignons", value: 7, stackable: true, icon: "🍄" },
    { key: "Fruits", type: "resource", category: "resources", name: "Fruits", value: 6, stackable: true, icon: "🍎" },
  ];

  const DUNGEON_LOOT = [
    { key: "Os", type: "resource", category: "resources", name: "Os", value: 11, stackable: true, icon: "🦴" },
    { key: "Fragments d'armure", type: "resource", category: "resources", name: "Fragments d'armure", value: 14, stackable: true, icon: "🛡️" },
    { key: "Reliques", type: "resource", category: "resources", name: "Reliques", value: 18, stackable: true, icon: "🏺" },
    { key: "Gemmes", type: "resource", category: "resources", name: "Gemmes", value: 22, stackable: true, icon: "💎" },
  ];

  const FOREST_ENEMIES = [
    {
      id: "forest_goblin",
      name: "Gobelin",
      emoji: "👺",
      level: 1,
      stats: { force: 5, rapidity: 5, constitution: 4, mana: 2 },
      xp: 18,
      skill: { name: "Jet de pierre", cost: 8, multiplier: 1.15, school: "physical" },
      lootPool: ["Crocs", "Peaux"],
    },
    {
      id: "forest_wolf",
      name: "Loup affamé",
      emoji: "🐺",
      level: 1,
      stats: { force: 6, rapidity: 6, constitution: 5, mana: 2 },
      xp: 20,
      skill: { name: "Bond sauvage", cost: 8, multiplier: 1.2, school: "physical" },
      lootPool: ["Crocs", "Viande"],
    },
    {
      id: "forest_slime",
      name: "Slime",
      emoji: "🟢",
      level: 1,
      stats: { force: 4, rapidity: 3, constitution: 7, mana: 4 },
      xp: 18,
      skill: { name: "Gel caustique", cost: 8, multiplier: 1.1, school: "magic" },
      lootPool: ["Herbes", "Champignons"],
    },
    {
      id: "forest_bear",
      name: "Ours",
      emoji: "🐻",
      level: 2,
      stats: { force: 8, rapidity: 4, constitution: 8, mana: 2 },
      xp: 24,
      skill: { name: "Étreinte sauvage", cost: 10, multiplier: 1.35, school: "physical" },
      lootPool: ["Peaux", "Viande"],
    },
    {
      id: "forest_centipede",
      name: "Scolopendre géante",
      emoji: "🐛",
      level: 2,
      stats: { force: 7, rapidity: 7, constitution: 5, mana: 3 },
      xp: 24,
      skill: { name: "Morsure venimeuse", cost: 10, multiplier: 1.2, school: "physical", status: "poison" },
      lootPool: ["Crocs", "Herbes"],
    },
  ];

  const DUNGEON_DEFS = [
    {
      id: "wrath",
      name: "Tour de la Colère",
      available: true,
      description: "Brutes et orques frappent sans relâche du premier au dernier étage.",
      lootPool: ["Os", "Fragments d'armure", "Gemmes"],
      enemies: [
        {
          id: "wrath_goblin",
          name: "Gobelin brutal",
          emoji: "👺",
          level: 1,
          stats: { force: 7, rapidity: 4, constitution: 6, mana: 2 },
          xp: 22,
          skill: { name: "Coup de masse", cost: 8, multiplier: 1.2, school: "physical" },
        },
        {
          id: "wrath_orc",
          name: "Orque",
          emoji: "👹",
          level: 2,
          stats: { force: 9, rapidity: 4, constitution: 8, mana: 2 },
          xp: 28,
          skill: { name: "Charge brutale", cost: 10, multiplier: 1.3, school: "physical" },
        },
        {
          id: "wrath_high_orc",
          name: "Haut Orque",
          emoji: "👹",
          level: 3,
          stats: { force: 11, rapidity: 5, constitution: 9, mana: 3 },
          xp: 34,
          skill: { name: "Furie du clan", cost: 12, multiplier: 1.4, school: "physical" },
        },
      ],
      boss: {
        id: "wrath_boss",
        name: "Boss Haut Orque",
        emoji: "👑",
        level: 5,
        stats: { force: 14, rapidity: 5, constitution: 12, mana: 4 },
        xp: 90,
        skill: { name: "Onde Sismique", cost: 16, multiplier: 1.75, school: "physical" },
      },
    },
    { id: "pride", name: "Tour de l'Orgueil", available: false, description: "Indisponible", lootPool: [], enemies: [], boss: null },
    { id: "avarice", name: "Tour de l'Avarice", available: false, description: "Indisponible", lootPool: [], enemies: [], boss: null },
    { id: "lust", name: "Tour de la Luxure", available: false, description: "Indisponible", lootPool: [], enemies: [], boss: null },
    { id: "envy", name: "Tour de l'Envie", available: false, description: "Indisponible", lootPool: [], enemies: [], boss: null },
    { id: "sloth", name: "Tour de la Paresse", available: false, description: "Indisponible", lootPool: [], enemies: [], boss: null },
  ];

  const SHOP_ITEMS = [
    {
      id: "iron_blade",
      category: "equipment",
      tab: "buy",
      name: "Lame de fer",
      type: "weapon",
      atk: 5,
      value: 55,
      price: 55,
      unlock: null,
    },
    {
      id: "bone_dagger",
      category: "equipment",
      tab: "buy",
      name: "Dague en os",
      type: "weapon",
      atk: 4,
      crit: 4,
      value: 70,
      price: 70,
      unlock: { sold: { Os: 3 } },
    },
    {
      id: "guard_mail",
      category: "equipment",
      tab: "buy",
      name: "Armure du rempart",
      type: "armor",
      def: 5,
      hp: 18,
      value: 80,
      price: 80,
      unlock: { sold: { "Fragments d'armure": 2 } },
    },
    {
      id: "focus_staff",
      category: "equipment",
      tab: "buy",
      name: "Bâton de focus",
      type: "weapon",
      magic: 5,
      energy: 12,
      value: 72,
      price: 72,
      unlock: { sold: { Gemmes: 1 } },
    },
    {
      id: "heal_potion",
      category: "consumable",
      tab: "buy",
      name: "Potion de soin",
      type: "consumable",
      effect: "heal",
      amount: 45,
      value: 14,
      price: 14,
      stackable: true,
      icon: "🧪",
      unlock: null,
    },
    {
      id: "energy_potion",
      category: "consumable",
      tab: "buy",
      name: "Potion d'énergie",
      type: "consumable",
      effect: "energy",
      amount: 35,
      value: 14,
      price: 14,
      stackable: true,
      icon: "🔵",
      unlock: null,
    },
  ];

  const state = {
    view: "save-list",
    saves: loadSaves(),
    selectedSaveId: null,
    draftTeam: [],
    createForm: createDefaultDraftMember(),
    createPointsLeft: CREATION_POINTS,
    run: null,
    activeInventoryFilter: "all",
    selectedInventoryHeroId: null,
    merchantBuyScrollTop: 0,
    modal: null,
    combatVisualBars: {},
    selectedExplorationHeroId: null,
    levelUpQueue: [],
    levelUpDraft: null,
  };

  const refs = {
    screens: {
      saveList: document.getElementById("screen-save-list"),
      createTeam: document.getElementById("screen-create-team"),
      mainMenu: document.getElementById("screen-main-menu"),
      forestExploration: document.getElementById("screen-forest-exploration"),
      forestCombat: document.getElementById("screen-forest-combat"),
      dungeonSelect: document.getElementById("screen-dungeon-select"),
      dungeonExploration: document.getElementById("screen-dungeon-exploration"),
      dungeonCombat: document.getElementById("screen-dungeon-combat"),
    },
    saveList: document.getElementById("save-list"),
    btnNewGame: document.getElementById("btn-new-game"),
    btnLoadGame: document.getElementById("btn-load-game"),
    btnDeleteSave: document.getElementById("btn-delete-save"),
    btnBackToSaves: document.getElementById("btn-back-to-saves"),
    createName: document.getElementById("create-name"),
    createClass: document.getElementById("create-class"),
    createPoints: document.getElementById("create-points"),
    createStats: document.getElementById("create-stats"),
    createClassInfo: document.getElementById("create-class-info"),
    btnAddMember: document.getElementById("btn-add-member"),
    draftTeamList: document.getElementById("draft-team-list"),
    btnStartRun: document.getElementById("btn-start-run"),
    menuSaveName: document.getElementById("menu-save-name"),
    menuGold: document.getElementById("menu-gold"),
    menuTeamList: document.getElementById("menu-team-list"),
    mapMessage: document.getElementById("map-message"),
    btnOpenInventory: document.getElementById("btn-open-inventory"),
    btnSaveAndExit: document.getElementById("btn-save-and-exit"),
    poiMerchant: document.getElementById("poi-merchant"),
    poiTavern: document.getElementById("poi-tavern"),
    poiForest: document.getElementById("poi-forest"),
    poiDungeon: document.getElementById("poi-dungeon"),
    forestTeamList: document.getElementById("forest-team-list"),
    forestStepCounter: document.getElementById("forest-step-counter"),
    forestLog: document.getElementById("forest-log"),
    btnForestOpenInventory: document.getElementById("btn-forest-open-inventory"),
    btnForestSaveAndExit: document.getElementById("btn-forest-save-and-exit"),
    btnForestAdvance: document.getElementById("btn-forest-advance"),
    btnForestExit: document.getElementById("btn-forest-exit"),
    forestCombatTurn: document.getElementById("forest-combat-turn"),
    forestCombatRoot: document.getElementById("forest-combat-root"),
    dungeonList: document.getElementById("dungeon-list"),
    btnDungeonSelectBack: document.getElementById("btn-dungeon-select-back"),
    dungeonTitle: document.getElementById("dungeon-title"),
    dungeonFloorLabel: document.getElementById("dungeon-floor-label"),
    dungeonTeamList: document.getElementById("dungeon-team-list"),
    dungeonSceneTitle: document.getElementById("dungeon-scene-title"),
    dungeonSceneSubtitle: document.getElementById("dungeon-scene-subtitle"),
    dungeonLog: document.getElementById("dungeon-log"),
    btnDungeonAdvance: document.getElementById("btn-dungeon-advance"),
    btnDungeonFlee: document.getElementById("btn-dungeon-flee"),
    dungeonCombatTitle: document.getElementById("dungeon-combat-title"),
    dungeonCombatTurn: document.getElementById("dungeon-combat-turn"),
    dungeonCombatRoot: document.getElementById("dungeon-combat-root"),
    modalOverlay: document.getElementById("modal-overlay"),
    modalClose: document.getElementById("modal-close"),
    modalTitle: document.getElementById("modal-title"),
    modalBody: document.getElementById("modal-body"),
    modalActions: document.getElementById("modal-actions"),
  };

  init();

  function init() {
    populateClassSelect();
    wireStaticEvents();
    if (state.saves.length) {
      state.selectedSaveId = state.saves[0].id;
    }
    render();
  }

  function populateClassSelect() {
    refs.createClass.innerHTML = Object.values(CLASS_DEFS)
      .map((classDef) => `<option value="${classDef.id}">${classDef.name}</option>`)
      .join("");
    refs.createClass.value = state.createForm.classId;
  }

  function wireStaticEvents() {
    refs.btnNewGame.addEventListener("click", openCreateTeam);
    refs.btnLoadGame.addEventListener("click", loadSelectedSave);
    refs.btnDeleteSave.addEventListener("click", deleteSelectedSave);
    refs.btnBackToSaves.addEventListener("click", () => setView("save-list"));
    refs.createName.addEventListener("input", onDraftFormChange);
    refs.createClass.addEventListener("change", onClassChange);
    refs.btnAddMember.addEventListener("click", addDraftMember);
    refs.btnStartRun.addEventListener("click", startNewRun);
    refs.btnOpenInventory.addEventListener("click", openInventoryModal);
    refs.btnSaveAndExit.addEventListener("click", saveAndExitToList);
    refs.btnForestOpenInventory.addEventListener("click", openInventoryModal);
    refs.btnForestSaveAndExit.addEventListener("click", saveAndExitToList);
    refs.poiMerchant.addEventListener("click", openMerchantModal);
    refs.poiTavern.addEventListener("click", openTavernModal);
    refs.poiForest.addEventListener("click", enterForest);
    refs.poiDungeon.addEventListener("click", openDungeonSelect);
    refs.btnForestAdvance.addEventListener("click", advanceForest);
    refs.btnForestExit.addEventListener("click", returnToMenu);
    refs.btnDungeonSelectBack.addEventListener("click", returnToMenu);
    refs.btnDungeonAdvance.addEventListener("click", advanceDungeon);
    refs.btnDungeonFlee.addEventListener("click", fleeDungeon);
    refs.modalClose.addEventListener("click", () => closeModal());
    refs.modalOverlay.addEventListener("click", (event) => {
      if (event.target === refs.modalOverlay) closeModal();
    });
  }

  function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadSaves() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Impossible de charger les sauvegardes", error);
      return [];
    }
  }

  function persistSaves() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state.saves));
  }

  function setView(view) {
    state.view = view;
    render();
  }

  function render() {
    document.body.classList.toggle("combat-view-active", state.view === "forest-combat" || state.view === "dungeon-combat");
    Object.values(refs.screens).forEach((screen) => screen.classList.add("hidden"));

    if (state.view === "save-list") refs.screens.saveList.classList.remove("hidden");
    if (state.view === "create-team") refs.screens.createTeam.classList.remove("hidden");
    if (state.view === "main-menu") refs.screens.mainMenu.classList.remove("hidden");
    if (state.view === "forest-exploration") refs.screens.forestExploration.classList.remove("hidden");
    if (state.view === "forest-combat") refs.screens.forestCombat.classList.remove("hidden");
    if (state.view === "dungeon-select") refs.screens.dungeonSelect.classList.remove("hidden");
    if (state.view === "dungeon-exploration") refs.screens.dungeonExploration.classList.remove("hidden");
    if (state.view === "dungeon-combat") refs.screens.dungeonCombat.classList.remove("hidden");

    renderSaveList();
    renderCreateTeam();
    renderMainMenu();
    renderForestExploration();
    renderDungeonSelect();
    renderDungeonExploration();
    renderCombatView("forest");
    renderCombatView("dungeon");
    renderModal();
  }

  function createDefaultDraftMember() {
    return {
      name: "",
      classId: "warrior",
      stats: createDraftStats("warrior"),
      pointsLeft: CREATION_POINTS,
    };
  }

  function createDraftStats(classId) {
    const classBonus = CLASS_DEFS[classId].baseStats;
    return {
      force: CREATION_BASE_STATS.force + classBonus.force,
      rapidity: CREATION_BASE_STATS.rapidity + classBonus.rapidity,
      constitution: CREATION_BASE_STATS.constitution + classBonus.constitution,
      mana: CREATION_BASE_STATS.mana + classBonus.mana,
    };
  }

  function getDraftStatMinimum(classId, stat) {
    return CREATION_BASE_STATS[stat] + (CLASS_DEFS[classId].baseStats[stat] || 0);
  }

  function onDraftFormChange() {
    state.createForm.name = refs.createName.value.trimStart();
  }

  function onClassChange() {
    state.createForm.classId = refs.createClass.value;
    state.createForm.stats = createDraftStats(state.createForm.classId);
    state.createForm.pointsLeft = CREATION_POINTS;
    renderCreateTeam();
  }

  function renderSaveList() {
    if (state.view !== "save-list") return;
    refs.saveList.innerHTML = "";

    if (!state.saves.length) {
      refs.saveList.innerHTML = `<div class="save-card"><h3>Aucune sauvegarde</h3><p>Commence une nouvelle aventure pour créer ta première partie.</p></div>`;
      refs.btnLoadGame.disabled = true;
      refs.btnDeleteSave.disabled = true;
      return;
    }

    state.saves
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .forEach((save) => {
        const selected = save.id === state.selectedSaveId;
        const card = document.createElement("button");
        card.type = "button";
        card.className = `save-card ${selected ? "selected" : ""}`;
        card.innerHTML = `
          <h3>${escapeHtml(save.name)}</h3>
          <p>${save.team.length} héros · ${save.gold} Or · ${Object.keys(save.unlockedDungeonIds || {}).length || 1} donjon(s) débloqué(s)</p>
          <p>Dernière mise à jour : ${new Date(save.updatedAt || save.createdAt).toLocaleString("fr-FR")}</p>
        `;
        card.addEventListener("click", () => {
          state.selectedSaveId = save.id;
          renderSaveList();
        });
        refs.saveList.appendChild(card);
      });

    refs.btnLoadGame.disabled = !state.selectedSaveId;
    refs.btnDeleteSave.disabled = !state.selectedSaveId;
  }

  function openCreateTeam() {
    state.draftTeam = [];
    state.createForm = createDefaultDraftMember();
    refs.createName.value = "";
    refs.createClass.value = state.createForm.classId;
    setView("create-team");
  }

  function renderCreateTeam() {
    if (state.view !== "create-team") return;

    refs.createPoints.textContent = String(state.createForm.pointsLeft);
    refs.createName.value = state.createForm.name;
    refs.createClass.value = state.createForm.classId;

    refs.createStats.innerHTML = Object.entries(state.createForm.stats)
      .map(([key, value]) => `
        <div class="stat-row">
          <strong>${formatStatLabel(key)}</strong>
          <button class="mini-btn" data-stat-minus="${key}" ${value <= getDraftStatMinimum(state.createForm.classId, key) ? "disabled" : ""}>-</button>
          <div class="stat-value">${value}</div>
          <button class="mini-btn" data-stat-plus="${key}" ${state.createForm.pointsLeft <= 0 ? "disabled" : ""}>+</button>
        </div>
      `)
      .join("");

    refs.createStats.querySelectorAll("[data-stat-minus]").forEach((button) => {
      button.addEventListener("click", () => adjustDraftStat(button.dataset.statMinus, -1));
    });
    refs.createStats.querySelectorAll("[data-stat-plus]").forEach((button) => {
      button.addEventListener("click", () => adjustDraftStat(button.dataset.statPlus, 1));
    });

    const classDef = CLASS_DEFS[state.createForm.classId];
    refs.createClassInfo.innerHTML = `
      <div class="tag">${classDef.emoji} ${classDef.name}</div>
      <p style="margin:10px 0 0;">Arme de prédilection : ${classDef.weaponType}</p>
      <p style="margin:6px 0 0;">Compétences de départ :</p>
      ${classDef.skills.map((skill) => `<p style="margin:6px 0 0;">${skill.icon} ${skill.name} · niv.${skill.requiredLevel} · ${skill.cost} énergie</p>`).join("")}
    `;

    refs.draftTeamList.innerHTML = state.draftTeam.length
      ? state.draftTeam.map((hero) => renderDraftHeroCard(hero)).join("")
      : `<div class="member-card"><h3>Aucun membre</h3><p>Ajoute des héros à ton équipe.</p></div>`;

    refs.draftTeamList.querySelectorAll("[data-remove-hero]").forEach((button) => {
      button.addEventListener("click", () => {
        state.draftTeam = state.draftTeam.filter((hero) => hero.id !== button.dataset.removeHero);
        renderCreateTeam();
      });
    });

    refs.btnStartRun.disabled = state.draftTeam.length === 0;
  }

  function adjustDraftStat(stat, delta) {
    if (delta > 0 && state.createForm.pointsLeft <= 0) return;
    if (delta < 0 && state.createForm.stats[stat] <= getDraftStatMinimum(state.createForm.classId, stat)) return;
    state.createForm.stats[stat] += delta;
    state.createForm.pointsLeft -= delta;
    renderCreateTeam();
  }

  function addDraftMember() {
    const name = refs.createName.value.trim();
    if (!name) {
      showMessageModal("Nom requis", "Donne un nom à ce héros avant de l’ajouter.");
      return;
    }
    if (state.draftTeam.length >= MAX_TEAM_SIZE) {
      showMessageModal("Équipe complète", "L’équipe ne peut pas dépasser quatre héros.");
      return;
    }

    const classDef = CLASS_DEFS[state.createForm.classId];
    const hero = {
      id: uid("hero"),
      name,
      classId: classDef.id,
      level: 1,
      xp: 0,
      xpNext: 100,
      stats: deepClone(state.createForm.stats),
      statuses: [],
      equipment: deepClone(STARTER_GEAR[classDef.id]),
      hp: 0,
      energy: 0,
    };
    restoreHero(hero, true);
    state.draftTeam.push(hero);
    state.createForm = createDefaultDraftMember();
    refs.createName.value = "";
    refs.createClass.value = state.createForm.classId;
    renderCreateTeam();
  }

  function startNewRun() {
    const run = createRunFromDraft();
    state.saves.unshift(run);
    state.selectedSaveId = run.id;
    persistSaves();
    state.run = deepClone(run);
    setView("main-menu");
  }

  function createRunFromDraft() {
    const party = state.draftTeam.map((hero) => {
      const freshHero = deepClone(hero);
      restoreHero(freshHero, true);
      return freshHero;
    });

    return {
      id: uid("save"),
      name: `Partie de ${party[0]?.name || "l'équipe"}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      team: party,
      gold: STARTING_GOLD,
      inventory: [
        createStackableItem({ name: "Potion de soin", effect: "heal", amount: 45, value: 14, icon: "🧪" }, 2),
        createStackableItem({ name: "Potion d'énergie", effect: "energy", amount: 35, value: 14, icon: "🔵" }, 1),
      ],
      unlockedDungeonIds: { wrath: true },
      unlockProgress: { sold: {} },
      forestState: { steps: 0, log: "La forêt bruisse autour de votre équipe." },
      dungeonState: null,
      encounter: null,
    };
  }

  function createStackableItem(base, quantity) {
    return {
      id: uid("item"),
      name: base.name,
      type: "consumable",
      category: "consumables",
      stackable: true,
      quantity,
      effect: base.effect,
      amount: base.amount,
      value: base.value,
      icon: base.icon,
    };
  }

  function loadSelectedSave() {
    if (!state.selectedSaveId) return;
    const save = state.saves.find((entry) => entry.id === state.selectedSaveId);
    if (!save) return;
    state.run = deepClone(save);
    normalizeRun(state.run);
    setView("main-menu");
  }

  function deleteSelectedSave() {
    if (!state.selectedSaveId) return;
    state.saves = state.saves.filter((save) => save.id !== state.selectedSaveId);
    persistSaves();
    state.selectedSaveId = state.saves[0]?.id || null;
    renderSaveList();
  }

  function normalizeRun(run) {
    run.team.forEach((hero) => restoreHero(hero, false));
    run.inventory = Array.isArray(run.inventory) ? run.inventory : [];
    run.unlockedDungeonIds = run.unlockedDungeonIds || { wrath: true };
    run.unlockProgress = run.unlockProgress || { sold: {} };
    run.forestState = run.forestState || { steps: 0, log: "La forêt bruisse autour de votre équipe." };
  }

  function saveCurrentRun() {
    if (!state.run) return;
    state.run.updatedAt = Date.now();
    const index = state.saves.findIndex((entry) => entry.id === state.run.id);
    if (index >= 0) state.saves[index] = deepClone(state.run);
    else state.saves.unshift(deepClone(state.run));
    persistSaves();
  }

  function returnToMenu() {
    saveCurrentRun();
    setView("main-menu");
  }

  function saveAndExitToList() {
    saveCurrentRun();
    state.run = null;
    setView("save-list");
  }

  function renderMainMenu() {
    if (state.view !== "main-menu" || !state.run) return;
    refs.menuSaveName.textContent = state.run.name;
    refs.menuGold.textContent = `${state.run.gold} Or`;
    refs.mapMessage.textContent = "Choisis une destination sur la carte.";
    renderExplorationTeam(refs.menuTeamList, "menu");
    renderExplorationHeroDetail("menu");
  }

  function openTavernModal() {
    if (!state.run) return;
    openModal({
      title: "Taverne",
      body: `
        <div class="info-card">
          <p>La taverne permet de remettre l’équipe d’aplomb entre deux expéditions.</p>
        </div>
      `,
      actions: [
        {
          label: "Se reposer",
          className: "primary",
          onClick: () => {
            state.run.team.forEach((hero) => restoreHero(hero, true));
            saveCurrentRun();
            closeModal();
            showMessageModal("Repos terminé", "Toute l’équipe récupère tous ses PV et toute son énergie.");
            render();
          },
        },
        {
          label: "Boire un verre",
          onClick: () => {
            state.run.team.forEach((hero) => {
              const caps = getHeroCaps(hero);
              hero.energy = clamp(hero.energy + 12, 0, caps.maxEnergy);
            });
            saveCurrentRun();
            closeModal();
            showMessageModal("Taverne", "L’équipe retrouve un peu d’entrain après une tournée.");
            render();
          },
        },
      ],
    });
  }

  function openMerchantModal(tab = "buy", preserveScroll = false) {
    if (!state.run) return;
    if (tab === "buy" && !preserveScroll) state.merchantBuyScrollTop = 0;

    const body = `
      <div class="merchant-toolbar">
        <button class="btn ${tab === "buy" ? "primary" : ""}" data-merchant-tab="buy">Acheter</button>
        <button class="btn ${tab === "sell" ? "primary" : ""}" data-merchant-tab="sell">Vendre</button>
        <div class="gold-pill">Votre or : ${state.run.gold}</div>
      </div>
      ${tab === "buy" ? renderMerchantBuyList() : renderMerchantSellList()}
    `;

    openModal({
      title: "Marchand",
      body,
      actions: [],
      afterRender(modalRoot) {
        const merchantList = modalRoot.querySelector(".merchant-list");
        if (tab === "buy" && merchantList) {
          merchantList.scrollTop = state.merchantBuyScrollTop || 0;
          merchantList.addEventListener("scroll", () => {
            state.merchantBuyScrollTop = merchantList.scrollTop;
          });
        }

        modalRoot.querySelectorAll("[data-merchant-tab]").forEach((button) => {
          button.addEventListener("click", () => openMerchantModal(button.dataset.merchantTab));
        });
        modalRoot.querySelectorAll("[data-buy-item]").forEach((button) => {
          button.addEventListener("click", () => buyShopItem(button.dataset.buyItem));
        });
        modalRoot.querySelectorAll("[data-sell-item]").forEach((button) => {
          button.addEventListener("click", () => sellInventoryItem(button.dataset.sellItem, false));
        });
        modalRoot.querySelectorAll("[data-sell-all-item]").forEach((button) => {
          button.addEventListener("click", () => sellInventoryItem(button.dataset.sellAllItem, true));
        });
      },
    });
  }

  function renderMerchantBuyList() {
    const cards = SHOP_ITEMS.map((item) => {
      const unlocked = isShopItemUnlocked(item, state.run);
      const affordable = state.run.gold >= item.price;
      return `
        <div class="shop-card">
          <h3>${escapeHtml(item.name)}</h3>
          <p>${describeShopItem(item)}</p>
          <p style="margin-top:6px;">Prix : ${item.price} Or</p>
          ${item.unlock ? `<p style="margin-top:6px;">Prérequis : ${describeUnlock(item.unlock)}</p>` : ""}
          <div class="merchant-action-row">
            <button class="btn primary" data-buy-item="${item.id}" ${!unlocked || !affordable ? "disabled" : ""}>Acheter</button>
            ${!unlocked ? `<span class="tag">Verrouillé</span>` : ""}
          </div>
        </div>
      `;
    }).join("");
    return `<div class="merchant-list">${cards}</div>`;
  }

  function renderMerchantSellList() {
    const sellable = state.run.inventory.filter((item) => item.category === "resources" || item.category === "consumables" || item.type === "weapon" || item.type === "armor");
    if (!sellable.length) {
      return `<div class="shop-card"><p>Aucun objet à vendre.</p></div>`;
    }
    return `
      <div class="merchant-list">
        ${sellable.map((item) => `
          <div class="shop-card">
            <h3>${escapeHtml(item.name)}${item.stackable ? ` x${item.quantity}` : ""}</h3>
            <p>${describeInventoryItem(item)}</p>
            <p style="margin-top:6px;">Prix de vente : ${getSellPrice(item)} Or${item.stackable ? ` l’unité` : ""}</p>
            <div class="merchant-action-row">
              <button class="btn primary" data-sell-item="${item.id}">Vendre</button>
              ${item.stackable && item.quantity > 1 ? `<button class="btn" data-sell-all-item="${item.id}">Tout vendre</button>` : ""}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function buyShopItem(itemId) {
    const item = SHOP_ITEMS.find((entry) => entry.id === itemId);
    if (!item || !isShopItemUnlocked(item, state.run) || state.run.gold < item.price) return;

    const merchantList = refs.modalBody.querySelector(".merchant-list");
    if (merchantList) state.merchantBuyScrollTop = merchantList.scrollTop;

    state.run.gold -= item.price;
    addItemToInventory(convertShopItemToInventory(item));
    saveCurrentRun();
    openMerchantModal("buy", true);
    renderMainMenu();
  }

  function sellInventoryItem(itemId, sellAll) {
    const item = state.run.inventory.find((entry) => entry.id === itemId);
    if (!item) return;
    const quantity = sellAll && item.stackable ? item.quantity : 1;
    state.run.gold += getSellPrice(item) * quantity;
    if (item.stackable) {
      item.quantity -= quantity;
    }
    if ((item.stackable && item.quantity <= 0) || !item.stackable) {
      state.run.inventory = state.run.inventory.filter((entry) => entry.id !== item.id);
    }
    registerSaleProgress(item.name, quantity);
    saveCurrentRun();
    openMerchantModal("sell");
    renderMainMenu();
  }

  function registerSaleProgress(itemName, quantity) {
    state.run.unlockProgress.sold[itemName] = (state.run.unlockProgress.sold[itemName] || 0) + quantity;
  }

  function isShopItemUnlocked(item, run) {
    if (!item.unlock) return true;
    const sold = run.unlockProgress?.sold || {};
    return Object.entries(item.unlock.sold || {}).every(([name, qty]) => (sold[name] || 0) >= qty);
  }

  function convertShopItemToInventory(item) {
    return {
      id: uid("item"),
      name: item.name,
      type: item.type,
      category: item.category === "consumable" ? "consumables" : "equipment",
      stackable: !!item.stackable,
      quantity: item.stackable ? 1 : undefined,
      atk: item.atk || 0,
      def: item.def || 0,
      crit: item.crit || 0,
      esq: item.esq || 0,
      hp: item.hp || 0,
      energy: item.energy || 0,
      magic: item.magic || 0,
      effect: item.effect,
      amount: item.amount,
      value: item.value,
    };
  }

  function getInventoryTargetHero() {
    if (!state.run?.team?.length) return null;
    const exists = state.run.team.some((hero) => hero.id === state.selectedInventoryHeroId);
    if (!exists) state.selectedInventoryHeroId = state.run.team[0].id;
    return state.run.team.find((hero) => hero.id === state.selectedInventoryHeroId) || state.run.team[0];
  }

  function convertInventoryItemToEquipment(item) {
    return {
      id: item.id,
      name: item.name,
      atk: item.atk || 0,
      def: item.def || 0,
      crit: item.crit || 0,
      esq: item.esq || 0,
      hp: item.hp || 0,
      energy: item.energy || 0,
      magic: item.magic || 0,
      value: item.value || 0,
    };
  }

  function convertEquippedItemToInventory(item, slot) {
    if (!item || !item.name) return null;
    return {
      id: uid("item"),
      name: item.name,
      type: slot,
      category: "equipment",
      stackable: false,
      atk: item.atk || 0,
      def: item.def || 0,
      crit: item.crit || 0,
      esq: item.esq || 0,
      hp: item.hp || 0,
      energy: item.energy || 0,
      magic: item.magic || 0,
      value: item.value || 0,
    };
  }

  function refreshInventoryState() {
    saveCurrentRun();
    render();
    openInventoryModal();
  }

  function equipInventoryItem(itemId) {
    if (!state.run) return;
    const hero = getInventoryTargetHero();
    const item = state.run.inventory.find((entry) => entry.id === itemId);
    if (!hero || !item || !["weapon", "armor"].includes(item.type)) return;

    const slot = item.type;
    const previous = convertEquippedItemToInventory(hero.equipment?.[slot], slot);
    hero.equipment = hero.equipment || {};
    hero.equipment[slot] = convertInventoryItemToEquipment(item);
    state.run.inventory = state.run.inventory.filter((entry) => entry.id !== itemId);
    if (previous) addItemToInventory(previous);
    restoreHero(hero, false);
    refreshInventoryState();
  }

  function unequipHeroItem(slot) {
    if (!state.run) return;
    const hero = getInventoryTargetHero();
    if (!hero?.equipment?.[slot]?.name) return;

    const item = convertEquippedItemToInventory(hero.equipment[slot], slot);
    hero.equipment[slot] = null;
    if (item) addItemToInventory(item);
    restoreHero(hero, false);
    refreshInventoryState();
  }

  function renderEquippedSlotCard(hero, slot, label) {
    const equipped = hero.equipment?.[slot];
    const hasItem = !!equipped?.name;
    return `
      <div class="equipment-slot-card">
        <div class="inventory-card-head">
          <div>
            <h3>${label}</h3>
            <p class="inventory-summary">${hasItem ? escapeHtml(equipped.name) : "Aucun équipement"}</p>
          </div>
          <span class="tag">${slot === "weapon" ? "Arme" : "Armure"}</span>
        </div>
        <p>${hasItem ? describeInventoryItem({ ...equipped, type: slot, category: "equipment" }) : "Ce slot est vide."}</p>
        ${hasItem ? `<div class="inventory-action-row"><button class="btn danger" data-inventory-unequip="${slot}">Déséquiper</button></div>` : ""}
      </div>
    `;
  }

  function openInventoryModal() {
    if (!state.run) return;
    const hero = getInventoryTargetHero();
    const filters = [
      { id: "all", label: "Tout" },
      { id: "equipment", label: "Équipements" },
      { id: "consumables", label: "Consommables" },
      { id: "resources", label: "Ressources" },
    ];
    const visibleItems = state.run.inventory.filter((item) => state.activeInventoryFilter === "all" || item.category === state.activeInventoryFilter);

    openModal({
      title: "Inventaire",
      body: `
        <div class="inventory-layout">
          <div class="inventory-hero-picker">
            ${state.run.team.map((member) => `<button class="btn ${hero?.id === member.id ? "primary" : ""}" data-inventory-hero="${member.id}">${escapeHtml(member.name)}</button>`).join("")}
          </div>
          ${hero ? `
            <p class="inventory-summary">Cible actuelle : ${escapeHtml(hero.name)} · ATK ${getHeroDerived(hero).atk} · DEF ${getHeroDerived(hero).def} · PV ${hero.hp}/${getHeroCaps(hero).maxHp} · Énergie ${hero.energy}/${getHeroCaps(hero).maxEnergy}</p>
            <div class="inventory-equipment-grid">
              ${renderEquippedSlotCard(hero, "weapon", "Arme équipée")}
              ${renderEquippedSlotCard(hero, "armor", "Armure équipée")}
            </div>
          ` : ""}
          <div class="inventory-toolbar">
            ${filters.map((filter) => `<button class="btn ${state.activeInventoryFilter === filter.id ? "primary" : ""}" data-inventory-filter="${filter.id}">${filter.label}</button>`).join("")}
          </div>
          <div class="inventory-list">
            ${visibleItems.length ? visibleItems.map((item) => `
              <div class="inventory-card">
                <div class="inventory-card-head">
                  <div>
                    <h3>${escapeHtml(item.name)}${item.stackable ? ` x${item.quantity}` : ""}</h3>
                    <p>${describeInventoryItem(item)}</p>
                  </div>
                  ${item.category === "equipment" ? `<span class="tag">${item.type === "weapon" ? "Arme" : "Armure"}</span>` : ""}
                </div>
                ${item.category === "equipment" ? `<div class="inventory-action-row"><button class="btn primary" data-inventory-equip="${item.id}">Équiper</button></div>` : ""}
              </div>
            `).join("") : `<div class="inventory-card"><p>Aucun objet dans cette catégorie.</p></div>`}
          </div>
        </div>
      `,
      actions: [],
      afterRender(modalRoot) {
        modalRoot.querySelectorAll("[data-inventory-filter]").forEach((button) => {
          button.addEventListener("click", () => {
            state.activeInventoryFilter = button.dataset.inventoryFilter;
            openInventoryModal();
          });
        });
        modalRoot.querySelectorAll("[data-inventory-hero]").forEach((button) => {
          button.addEventListener("click", () => {
            state.selectedInventoryHeroId = button.dataset.inventoryHero;
            openInventoryModal();
          });
        });
        modalRoot.querySelectorAll("[data-inventory-equip]").forEach((button) => {
          button.addEventListener("click", () => equipInventoryItem(button.dataset.inventoryEquip));
        });
        modalRoot.querySelectorAll("[data-inventory-unequip]").forEach((button) => {
          button.addEventListener("click", () => unequipHeroItem(button.dataset.inventoryUnequip));
        });
      },
    });
  }

  function enterForest() {
    if (!state.run) return;
    state.run.encounter = null;
    state.run.forestState = state.run.forestState || { steps: 0, log: "La forêt bruisse autour de votre équipe." };
    saveCurrentRun();
    setView("forest-exploration");
  }

  function renderForestExploration() {
    if (state.view !== "forest-exploration" || !state.run) return;
    refs.forestStepCounter.textContent = `Progression : ${state.run.forestState.steps} avancée(s)`;
    refs.forestLog.textContent = "";
    renderExplorationTeam(refs.forestTeamList, "forest");
    renderExplorationHeroDetail("forest");
  }

  function advanceForest() {
    const roll = randomInt(1, 100);
    state.run.forestState.steps += 1;

    if (roll <= 42) {
      const loot = buildForestExplorationLoot();
      loot.forEach((item) => addItemToInventory(item));
      state.run.forestState.log = `L’équipe trouve ${formatLootList(loot)} dans la forêt.`;
      saveCurrentRun();
      renderForestExploration();
      showExplorationPopup("Trouvaille", state.run.forestState.log);
      return;
    }

    if (roll <= 66) {
      const trapDamage = randomInt(8, 15);
      state.run.team.forEach((hero) => {
        hero.hp = clamp(hero.hp - trapDamage, 0, getHeroCaps(hero).maxHp);
      });
      state.run.forestState.log = `Un piège forestier se referme sur le groupe et inflige ${trapDamage} dégâts à toute l’équipe.`;
      if (!state.run.team.some((hero) => hero.hp > 0)) {
        handleAreaDefeat("forest", "L’équipe succombe à un piège dissimulé dans la forêt.");
        return;
      }
      saveCurrentRun();
      renderForestExploration();
      showExplorationPopup("Piège", state.run.forestState.log);
      return;
    }

    startEncounter("forest");
  }

  function openDungeonSelect() {
    if (!state.run) return;
    setView("dungeon-select");
  }

  function renderDungeonSelect() {
    if (state.view !== "dungeon-select" || !state.run) return;
    refs.dungeonList.innerHTML = DUNGEON_DEFS.map((dungeon) => {
      const unlocked = !!state.run.unlockedDungeonIds[dungeon.id] || dungeon.available;
      return `
        <div class="dungeon-card ${unlocked ? "selected" : ""}">
          <div>
            <h3>${escapeHtml(dungeon.name)}</h3>
            <p>${escapeHtml(dungeon.description)}</p>
            <div class="dungeon-meta">10 étages · boss final au dernier étage</div>
          </div>
          <button class="btn primary" data-enter-dungeon="${dungeon.id}" ${!unlocked ? "disabled" : ""}>Entrer</button>
        </div>
      `;
    }).join("");

    refs.dungeonList.querySelectorAll("[data-enter-dungeon]").forEach((button) => {
      button.addEventListener("click", () => enterDungeon(button.dataset.enterDungeon));
    });
  }

  function enterDungeon(dungeonId) {
    const dungeon = getDungeon(dungeonId);
    if (!dungeon) return;
    state.run.dungeonState = {
      dungeonId,
      floor: 1,
      log: `L’équipe franchit l’entrée de ${dungeon.name}.`,
      completed: false,
    };
    state.run.encounter = null;
    saveCurrentRun();
    setView("dungeon-exploration");
  }

  function renderDungeonExploration() {
    if (state.view !== "dungeon-exploration" || !state.run?.dungeonState) return;
    const dungeon = getDungeon(state.run.dungeonState.dungeonId);
    refs.dungeonTitle.textContent = dungeon.name;
    refs.dungeonFloorLabel.textContent = `Étage ${state.run.dungeonState.floor} / ${DUNGEON_FLOORS}`;
    refs.dungeonSceneTitle.textContent = dungeon.name;
    refs.dungeonSceneSubtitle.textContent = "Le prochain pas peut révéler un piège, un coffre ou un combat.";
    refs.dungeonLog.textContent = "";
    renderExplorationTeam(refs.dungeonTeamList, "dungeon");
    renderExplorationHeroDetail("dungeon");
  }

  function showExplorationPopup(title, message) {
    openModal({
      title,
      className: "modal-compact",
      body: `<p>${escapeHtml(message)}</p>`,
      actions: [{ label: "Continuer", className: "primary", onClick: closeModal }],
    });
  }

  function startLevelUpQueueAfterDelay() {
    if (!state.levelUpQueue.length) return;
    openModal({
      title: "",
      className: "modal-compact modal-delay",
      body: "<p></p>",
      actions: [],
      closeDisabled: true,
    });
    setTimeout(openNextLevelUpPopup, 500);
  }

  function openNextLevelUpPopup() {
    const nextLevelUp = state.levelUpQueue[0];
    if (!nextLevelUp || !state.run) {
      state.levelUpDraft = null;
      closeModal(true);
      return;
    }

    const hero = state.run.team.find((member) => member.id === nextLevelUp.heroId);
    if (!hero) {
      state.levelUpQueue.shift();
      state.levelUpDraft = null;
      startLevelUpQueueAfterDelay();
      return;
    }

    if (!state.levelUpDraft || state.levelUpDraft.heroId !== hero.id) {
      state.levelUpDraft = {
        heroId: hero.id,
        baseStats: { ...hero.stats },
        remaining: nextLevelUp.points,
      };
    }

    const draft = state.levelUpDraft;
    openModal({
      title: "Level up",
      className: "modal-compact level-up-modal",
      closeDisabled: true,
      body: `
        <p>${escapeHtml(hero.name)} passe niveau ${nextLevelUp.level}</p>
        <p>Points à distribuer : <strong>${draft.remaining}</strong></p>
        <div class="level-up-stats">
          ${renderLevelUpStatRow("FOR", "force", hero.stats.force)}
          ${renderLevelUpStatRow("RAP", "rapidity", hero.stats.rapidity)}
          ${renderLevelUpStatRow("CON", "constitution", hero.stats.constitution)}
          ${renderLevelUpStatRow("MANA", "mana", hero.stats.mana)}
        </div>
        <div class="level-up-controls">
          <button class="btn ghost" type="button" data-level-reset>Réinitialiser</button>
          <button class="btn primary" type="button" data-level-validate ${draft.remaining > 0 ? "disabled" : ""}>Valider</button>
        </div>
      `,
      actions: [],
      afterRender(modalRoot) {
        modalRoot.querySelectorAll("[data-level-stat]").forEach((button) => {
          button.addEventListener("click", () => addLevelUpStat(button.dataset.levelStat));
        });
        modalRoot.querySelector("[data-level-reset]")?.addEventListener("click", resetLevelUpDraft);
        modalRoot.querySelector("[data-level-validate]")?.addEventListener("click", validateLevelUpDraft);
      },
    });
  }

  function renderLevelUpStatRow(label, stat, value) {
    const disabled = state.levelUpDraft?.remaining > 0 ? "" : "disabled";
    return `
      <div class="level-up-stat-row">
        <span>${label}</span>
        <strong>${value}</strong>
        <button class="btn" type="button" data-level-stat="${stat}" ${disabled}>+</button>
      </div>
    `;
  }

  function addLevelUpStat(stat) {
    const nextLevelUp = state.levelUpQueue[0];
    const draft = state.levelUpDraft;
    const hero = state.run?.team.find((member) => member.id === nextLevelUp?.heroId);
    if (!hero || !draft || draft.remaining <= 0 || !["force", "rapidity", "constitution", "mana"].includes(stat)) return;
    hero.stats[stat] += 1;
    draft.remaining -= 1;
    openNextLevelUpPopup();
  }

  function resetLevelUpDraft() {
    const nextLevelUp = state.levelUpQueue[0];
    const draft = state.levelUpDraft;
    const hero = state.run?.team.find((member) => member.id === nextLevelUp?.heroId);
    if (!hero || !draft) return;
    hero.stats = { ...draft.baseStats };
    draft.remaining = nextLevelUp.points;
    openNextLevelUpPopup();
  }

  function validateLevelUpDraft() {
    const nextLevelUp = state.levelUpQueue[0];
    const draft = state.levelUpDraft;
    const hero = state.run?.team.find((member) => member.id === nextLevelUp?.heroId);
    if (!hero || !draft || draft.remaining > 0) return;
    hero.statPoints = Math.max(0, (hero.statPoints || 0) - nextLevelUp.points);
    state.levelUpQueue.shift();
    state.levelUpDraft = null;
    saveCurrentRun();
    render();
    closeModal(true);
    startLevelUpQueueAfterDelay();
  }

  function advanceDungeon() {
    const dungeon = getDungeon(state.run.dungeonState.dungeonId);
    if (!dungeon) return;
    const floor = state.run.dungeonState.floor;

    if (floor === DUNGEON_FLOORS) {
      startEncounter("dungeon", dungeon.id, true);
      return;
    }

    const roll = randomInt(1, 100);
    if (roll <= 28) {
      const loot = buildDungeonChestLoot(dungeon.id);
      loot.forEach((item) => addItemToInventory(item));
      state.run.dungeonState.log = `Étage ${floor} : un coffre contient ${formatLootList(loot)}.`;
      state.run.dungeonState.floor += 1;
      saveCurrentRun();
      renderDungeonExploration();
      showExplorationPopup("Coffre", state.run.dungeonState.log);
      return;
    }

    if (roll <= 50) {
      const trapDamage = randomInt(10, 18);
      const target = randomFrom(state.run.team.filter((hero) => hero.hp > 0));
      if (target) target.hp = clamp(target.hp - trapDamage, 0, getHeroCaps(target).maxHp);
      state.run.dungeonState.log = `Étage ${floor} : un piège frappe ${target?.name || "l’équipe"} et inflige ${trapDamage} dégâts.`;
      state.run.dungeonState.floor += 1;
      if (!state.run.team.some((hero) => hero.hp > 0)) {
        handleAreaDefeat("dungeon", "Le groupe est terrassé par les pièges du donjon.");
        return;
      }
      saveCurrentRun();
      renderDungeonExploration();
      showExplorationPopup("Piège", state.run.dungeonState.log);
      return;
    }

    startEncounter("dungeon", dungeon.id, false);
  }

  function fleeDungeon() {
    if (!state.run) return;
    state.run.dungeonState = null;
    state.run.encounter = null;
    saveCurrentRun();
    setView("main-menu");
  }

  function startEncounter(zone, dungeonId = null, forceBoss = false) {
    const encounter = createEncounter(zone, dungeonId, forceBoss);
    state.run.encounter = encounter;
    saveCurrentRun();
    setView(zone === "forest" ? "forest-combat" : "dungeon-combat");
  }

  function createEncounter(zone, dungeonId, forceBoss) {
    const averageLevel = getAveragePartyLevel(state.run.team);
    let enemyTemplate;
    if (zone === "forest") {
      enemyTemplate = deepClone(randomFrom(FOREST_ENEMIES));
    } else {
      const dungeon = getDungeon(dungeonId);
      enemyTemplate = deepClone(forceBoss ? dungeon.boss : randomFrom(dungeon.enemies));
    }

    enemyTemplate.level = clamp(enemyTemplate.level + randomInt(0, zone === "forest" ? 1 : 2), 1, 99);
    const enemy = buildEnemy(enemyTemplate, averageLevel, zone, forceBoss);

    return {
      zone,
      dungeonId,
      enemy,
      turn: 1,
      activeHeroIndex: getNextAliveHeroIndex(state.run.team, 0),
      log: zone === "forest"
        ? `Un ${enemy.name} surgit entre les arbres.`
        : `Un ${enemy.name} garde l’étage du donjon.`,
      lastHeroAction: null,
      lastEnemyAction: null,
      visualShakeQueue: [],
      visualDamageQueue: [],
      showConsumables: false,
      showSkills: false,
      forceBoss,
    };
  }

  function renderCombatView(zone) {
    const combatView = zone === "forest" ? "forest-combat" : "dungeon-combat";
    if (state.view !== combatView || !state.run?.encounter || state.run.encounter.zone !== zone) return;

    const root = zone === "forest" ? refs.forestCombatRoot : refs.dungeonCombatRoot;
    const turnLabel = zone === "forest" ? refs.forestCombatTurn : refs.dungeonCombatTurn;
    const titleLabel = zone === "dungeon" ? refs.dungeonCombatTitle : null;
    const encounter = state.run.encounter;
    const activeHero = state.run.team[encounter.activeHeroIndex];
    const consumables = getCombatConsumables();
    const skills = activeHero ? getHeroSkills(activeHero) : [];
    const combatEnding = Boolean(encounter.combatEnding);
    const combatEndingDisabled = combatEnding ? "disabled" : "";
    const quickSkill = skills.find((skill) => skill.id === "assassinate");
    const drawerSkills = quickSkill ? skills.filter((skill) => skill.id !== quickSkill.id) : skills;
    const quickSkillDisabled = quickSkill && (combatEnding || !activeHero || activeHero.level < quickSkill.requiredLevel || activeHero.energy < quickSkill.cost) ? "disabled" : "";

    if (titleLabel) {
      const dungeon = getDungeon(encounter.dungeonId);
      titleLabel.textContent = `${dungeon.name} - Combat`;
    }
    turnLabel.textContent = `Tour ${encounter.turn}`;

    root.innerHTML = `
      <div class="v3-combat-screen game-screen in-combat">
        <div class="side-panel team-panel">
          <h2>&Eacute;quipe</h2>
          <div class="team-scroll">
            ${state.run.team.map((hero, index) => renderV3TeamCard(hero, index === encounter.activeHeroIndex)).join("")}
          </div>
        </div>

        <div class="content-shell">
          <div class="main-center">
            <div class="battlefield-shell">
              <div class="battlefield">
                <div class="combat-side combat-left">
                  <div class="combat-stat-panel">${activeHero ? renderV3CombatStats(activeHero, getHeroDerived(activeHero), "Héros actif") : ""}</div>
                  <div class="combat-bonus-panel">
                    <div class="combat-panel-title">Bonus / Malus</div>
                    <div>${activeHero ? renderV3Statuses(activeHero) : "Aucun bonus<br>Aucun malus"}</div>
                  </div>
                </div>

                <div id="player-card" class="visual-card player-focus">
                  <h3>${activeHero ? `${escapeHtml(activeHero.name)} (niv.${activeHero.level})` : "H&eacute;ros"}</h3>
                  <div class="subtext">${activeHero ? escapeHtml(CLASS_DEFS[activeHero.classId].name) : ""}</div>
                  <div class="combat-inline-bars">
                    ${activeHero ? renderV3InlineBar(`hero-${activeHero.id}-hp`, "health", activeHero.hp, getHeroCaps(activeHero).maxHp, "PV") : ""}
                    ${activeHero ? renderV3InlineBar(`hero-${activeHero.id}-energy`, "mana", activeHero.energy, getHeroCaps(activeHero).maxEnergy, "&Eacute;nergie") : ""}
                  </div>
                  <div class="combat-card-separator"></div>
                  <div class="sprite battle-emoji">${activeHero ? renderHeroPortrait(activeHero) : "?"}</div>
                  <div class="bar-wrap exploration-bar-wrap">
                    ${activeHero ? renderV3ExploreBars(activeHero.hp, getHeroCaps(activeHero).maxHp, activeHero.energy, getHeroCaps(activeHero).maxEnergy) : ""}
                  </div>
                  <div class="status-chip">En attente</div>
                  <div class="bakoro-main-actions" aria-label="Actions principales">
                    <button class="bakoro-square-action is-attack" type="button" data-combat-action="attack" data-tooltip="Attaque normale - Inflige des dégâts physiques" ${combatEndingDisabled}>⚔️</button>
                    ${quickSkill ? `<button class="bakoro-square-action is-assassinate" type="button" data-cast-skill="${quickSkill.id}" data-tooltip="${escapeHtml(quickSkill.name)} - ${escapeHtml(quickSkill.description)} Co&ucirc;t : ${quickSkill.cost} &eacute;nergie" ${quickSkillDisabled}>${quickSkill.icon}</button>` : ""}
                    <button class="bakoro-square-action is-defend" type="button" data-combat-action="defend" data-tooltip="Encaisser - Réduit la prochaine attaque" ${combatEndingDisabled}>🛡️</button>
                    <button class="bakoro-square-action is-flee" type="button" data-combat-action="flee" data-tooltip="Tente de fuir le combat. Basé sur la RAP moyenne du groupe." ${combatEndingDisabled}>🏃</button>
                  </div>
                  <div class="bakoro-secondary-actions" aria-label="Compétences et objets">
                    <button class="bakoro-drawer-toggle ${encounter.showSkills ? "active" : ""}" type="button" data-combat-action="skill" ${combatEndingDisabled}>Compétences</button>
                    <button class="bakoro-drawer-toggle ${encounter.showConsumables ? "active" : ""}" type="button" data-combat-action="item" ${combatEndingDisabled}>Objets</button>
                  </div>
                </div>

                <div id="enemy-card" class="visual-card enemy-focus">
                  <h3>${escapeHtml(encounter.enemy.name)} (niv.${encounter.enemy.level})</h3>
                  <div class="subtext">Adversaire</div>
                  <div class="combat-inline-bars">
                    ${renderV3InlineBar(`enemy-${encounter.enemy.id}-hp`, "health", encounter.enemy.hp, encounter.enemy.maxHp, "PV")}
                    ${renderV3InlineBar(`enemy-${encounter.enemy.id}-energy`, "mana", encounter.enemy.energy, encounter.enemy.maxEnergy, "&Eacute;nergie")}
                  </div>
                  <div class="combat-card-separator"></div>
                  <div class="sprite battle-emoji">${encounter.enemy.emoji}</div>
                  <div class="bar-wrap exploration-bar-wrap">
                    ${renderV3ExploreBars(encounter.enemy.hp, encounter.enemy.maxHp, encounter.enemy.energy, encounter.enemy.maxEnergy)}
                  </div>
                  <div class="status-chip">Combat</div>
                </div>

                <div class="combat-side combat-right">
                  <div class="combat-stat-panel">${renderV3CombatStats(encounter.enemy, getEnemyDerived(encounter.enemy), "Ennemi")}</div>
                  <div class="combat-bonus-panel">
                    <div class="combat-panel-title">Bonus / Malus</div>
                    <div>${renderV3Statuses(encounter.enemy)}</div>
                  </div>
                </div>
              </div>
              <div class="bakoro-drawer bakoro-skills-drawer ${encounter.showSkills ? "" : "hidden"}">
                <strong>Compétences</strong>
                <div class="combat-skill-grid">
                  ${drawerSkills.length ? drawerSkills.map((skill) => renderCombatSkillButton(skill, activeHero)).join("") : `<span class="tag">Aucune comp&eacute;tence</span>`}
                </div>
              </div>
              <div class="bakoro-drawer bakoro-items-drawer ${encounter.showConsumables ? "" : "hidden"}">
                <strong>Objets</strong>
                <div class="combat-consumable-list">
                  ${consumables.length ? consumables.map((item) => `
                    <button class="small-btn" data-use-consumable="${item.id}" ${combatEndingDisabled}>
                      ${escapeHtml(item.name)} x${item.quantity}
                    </button>
                  `).join("") : `<span class="tag">Aucun objet utilisable</span>`}
                </div>
              </div>
            </div>

            <div id="combat-actions" class="combat-actions-panel panel">
              <div class="combat-last-action combat-last-action-player">${formatV4CombatActionCard(encounter.lastHeroAction, false)}</div>
              <div class="combat-last-action combat-last-action-enemy">${formatV4CombatActionCard(encounter.lastEnemyAction, true)}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    root.querySelectorAll("[data-combat-action]").forEach((button) => {
      button.addEventListener("click", () => handleCombatAction(button.dataset.combatAction));
    });
    root.querySelectorAll("[data-use-consumable]").forEach((button) => {
      button.addEventListener("click", () => useCombatConsumable(button.dataset.useConsumable));
    });
    root.querySelectorAll("[data-cast-skill]").forEach((button) => {
      button.addEventListener("click", () => handleCombatSkill(button.dataset.castSkill));
    });
    animateCombatBars(root);
    playCombatShakeQueue(root, encounter.visualShakeQueue || []);
    encounter.visualShakeQueue = [];
    playCombatDamageQueue(root, encounter.visualDamageQueue || []);
    encounter.visualDamageQueue = [];
  }

  function renderV3TeamCard(hero, active) {
    const classDef = CLASS_DEFS[hero.classId];
    const caps = getHeroCaps(hero);
    return `
      <div class="team-card ${active ? "active-turn selected" : ""} ${hero.hp <= 0 ? "dead" : ""}">
        <div class="small-emoji">${classDef.emoji}</div>
        <div class="combat-hero-name">${escapeHtml(hero.name)}</div>
        <div class="hero-class">${classDef.name} - niv. ${hero.level}</div>
        <div class="combat-bars">
          ${renderBar(hero.hp, caps.maxHp, "hp", "PV")}
          ${renderBar(hero.energy, caps.maxEnergy, "energy", "&Eacute;nergie")}
        </div>
      </div>
    `;
  }

  function renderV3InlineBar(id, kind, current, max, label) {
    const pct = max > 0 ? clamp((current / max) * 100, 0, 100) : 0;
    const previousPct = state.combatVisualBars[id] ?? pct;
    const value = `${Math.max(0, Math.ceil(current))} / ${max}`;
    return `
      <div class="${kind}-bar-container compact-bar">
        <div class="${kind === "health" ? "health-bar" : "mana-bar"} combat-animated-bar" data-bar-id="${id}" data-target-width="${pct}" style="width:${previousPct}%"></div>
        <span class="bar-inline-text">${label} ${value}</span>
      </div>
    `;
  }

  function animateCombatBars(root) {
    const bars = [...root.querySelectorAll(".combat-animated-bar")];
    requestAnimationFrame(() => {
      bars.forEach((bar) => {
        const target = Number(bar.dataset.targetWidth || 0);
        bar.style.width = `${target}%`;
        state.combatVisualBars[bar.dataset.barId] = target;
      });
    });
  }

  function queueCombatShake(encounter, target) {
    encounter.visualShakeQueue = encounter.visualShakeQueue || [];
    encounter.visualShakeQueue.push(target);
  }

  function queueCombatDamage(encounter, target, amount, critical = false) {
    if (amount <= 0) return;
    encounter.visualDamageQueue = encounter.visualDamageQueue || [];
    encounter.visualDamageQueue.push({ target, amount, critical });
  }

  function playCombatShakeQueue(root, queue) {
    queue.forEach((target, index) => {
      window.setTimeout(() => {
        const card = root.querySelector(target === "enemy" ? "#enemy-card" : "#player-card");
        if (!card) return;
        card.classList.remove("shake-hit");
        void card.offsetWidth;
        card.classList.add("shake-hit");
        window.setTimeout(() => card.classList.remove("shake-hit"), 350);
      }, index * 280);
    });
  }

  function playCombatDamageQueue(root, queue) {
    queue.forEach((entry, index) => {
      window.setTimeout(() => {
        const card = root.querySelector(entry.target === "enemy" ? "#enemy-card" : "#player-card");
        if (!card) return;
        const popup = document.createElement("div");
        popup.className = `combat-damage-float ${entry.critical ? "is-crit" : ""}`;
        popup.textContent = `${entry.critical ? "💥 " : ""}-${entry.amount}`;
        card.appendChild(popup);
        window.setTimeout(() => popup.remove(), 780);
      }, index * 180);
    });
  }

  function formatV4CombatActionCard(action, enemySide = false) {
    if (!action) return "&nbsp;";
    const valueClass = action.critical ? "combat-action-value is-crit" : "combat-action-value";
    return `
      <div class="combat-action-content ${enemySide ? "combat-action-content-enemy" : "combat-action-content-player"}">
        <span class="combat-action-label">${escapeHtml(action.label)}</span>
        <span class="${valueClass}">${escapeHtml(action.value)}</span>
      </div>
    `;
  }

  function renderV3ExploreBars(hp, maxHp, energy, maxEnergy) {
    const hpPct = maxHp > 0 ? clamp((hp / maxHp) * 100, 0, 100) : 0;
    const energyPct = maxEnergy > 0 ? clamp((energy / maxEnergy) * 100, 0, 100) : 0;
    return `
      <div class="bar-label"><span>PV</span><span>${Math.max(0, Math.ceil(hp))} / ${maxHp}</span></div>
      <div class="health-bar-container"><div class="health-bar" style="width:${hpPct}%"></div></div>
      <div class="bar-label"><span>&Eacute;nergie</span><span>${Math.max(0, Math.ceil(energy))} / ${maxEnergy}</span></div>
      <div class="mana-bar-container"><div class="mana-bar" style="width:${energyPct}%"></div></div>
    `;
  }

  function renderV3CombatStats(entity, derived, title) {
    const stats = entity.stats || {};
    return `
      <div class="combat-panel-title">${title}</div>
      <div class="combat-stat-line"><strong>FOR</strong><span>${stats.force ?? 0}</span></div>
      <div class="combat-stat-line"><strong>RAP</strong><span>${stats.rapidity ?? 0}</span></div>
      <div class="combat-stat-line"><strong>CON</strong><span>${stats.constitution ?? 0}</span></div>
      <div class="combat-stat-line"><strong>MANA</strong><span>${stats.mana ?? 0}</span></div>
      <div class="combat-stat-spacer"></div>
      <div class="combat-stat-line is-atk"><strong>ATK</strong><span>${derived.atk}</span></div>
      <div class="combat-stat-line is-def"><strong>DEF</strong><span>${derived.def}</span></div>
      <div class="combat-stat-line is-crit"><strong>CRIT</strong><span>${derived.crit}%</span></div>
      <div class="combat-stat-line is-esq"><strong>ESQ</strong><span>${derived.esq}%</span></div>
    `;
  }

  function renderV3Statuses(unit) {
    const statuses = unit.statuses || [];
    if (!statuses.length) return "Aucun bonus<br>Aucun malus";
    return statuses.map((status) => `<span class="status-line status-bonus">${escapeHtml(status.label || status.type)}</span>`).join("<br>");
  }

  function finishCombatWithFeedback(result) {
    const encounter = state.run?.encounter;
    if (!encounter || encounter.combatEnding) return;

    encounter.combatEnding = result;
    encounter.showConsumables = false;
    encounter.showSkills = false;
    render();

    setTimeout(() => {
      const currentEncounter = state.run?.encounter;
      if (!currentEncounter || currentEncounter !== encounter || currentEncounter.combatEnding !== result) return;
      if (result === "victory") winEncounter();
      if (result === "defeat") loseEncounter();
    }, COMBAT_END_FEEDBACK_DELAY);
  }

  function getRapEquipe() {
    const livingHeroes = state.run?.team?.filter((hero) => hero.hp > 0) || [];
    if (!livingHeroes.length) return 0;
    const totalRap = livingHeroes.reduce((total, hero) => total + hero.stats.rapidity, 0);
    return totalRap / livingHeroes.length;
  }

  function getChanceFuite(encounter = state.run?.encounter) {
    if (!encounter) return 10;
    const rapEquipe = getRapEquipe();
    const rapMonstre = encounter.enemy?.stats?.rapidity || 0;
    return clamp(50 + (rapEquipe - rapMonstre) * 2, 10, 90);
  }

  function tenterFuite() {
    const encounter = state.run?.encounter;
    if (!encounter || encounter.combatEnding) return;

    const chanceFuite = getChanceFuite(encounter);
    const roll = randomInt(0, 100);

    encounter.showConsumables = false;
    encounter.showSkills = false;

    if (roll < chanceFuite) {
      const targetView = encounter.zone === "dungeon" ? "dungeon-exploration" : "forest-exploration";
      encounter.log = "Votre équipe prend la fuite !";
      encounter.lastHeroAction = { label: "Fuir", value: "Réussite", critical: false };
      state.run.encounter = null;
      saveCurrentRun();
      setView(targetView);
      openModal({
        title: "Défaite",
        className: "modal-compact",
        body: "<p>Votre équipe prend la fuite !</p>",
        actions: [
          {
            label: "Retour à l’exploration",
            className: "primary",
            onClick: () => {
              closeModal();
            },
          },
        ],
      });
      return;
    }

    encounter.log = "Impossible de fuir !";
    encounter.lastHeroAction = { label: "Fuir", value: "Échec", critical: false };
    enemyTurn();
  }

  function handleCombatAction(action) {
    const encounter = state.run?.encounter;
    if (!encounter || encounter.combatEnding) return;
    const hero = state.run.team[encounter.activeHeroIndex];
    if (!hero || hero.hp <= 0) return;

    if (action === "item") {
      encounter.showConsumables = !encounter.showConsumables;
      encounter.showSkills = false;
      render();
      return;
    }

    if (action === "skill") {
      encounter.showSkills = !encounter.showSkills;
      encounter.showConsumables = false;
      render();
      return;
    }

    encounter.showConsumables = false;
    encounter.showSkills = false;

    if (action === "flee") {
      tenterFuite();
      return;
    }

    if (action === "attack") {
      const amount = dealDamage(encounter.enemy, Math.round(getHeroDerived(hero).atk), "physical");
      encounter.log = `${hero.name} attaque et inflige ${amount} dégâts à ${encounter.enemy.name}.`;
      encounter.lastHeroAction = { label: "Attaquer", value: amount > 0 ? `${lastDamageCritical ? "💥 " : ""}${amount} dégâts` : "Esquivé", critical: lastDamageCritical };
      if (amount > 0) {
        queueCombatShake(encounter, "enemy");
        queueCombatDamage(encounter, "enemy", amount, lastDamageCritical);
      }
    }

    if (action === "defend") {
      hero.statuses.push({ type: "defend", turns: 1, label: "Défense renforcée" });
      encounter.log = `${hero.name} adopte une posture défensive.`;
      encounter.lastHeroAction = { label: "Encaisser", value: "Garde active", critical: false };
    }

    if (encounter.enemy.hp <= 0) {
      finishCombatWithFeedback("victory");
      return;
    }

    advanceCombatFlow();
  }

  function handleCombatSkill(skillId) {
    const encounter = state.run?.encounter;
    if (!encounter || encounter.combatEnding) return;
    const hero = state.run.team[encounter.activeHeroIndex];
    const skill = getHeroSkills(hero).find((entry) => entry.id === skillId);
    if (!hero || !skill) return;

    if (hero.level < skill.requiredLevel) {
      encounter.log = `${hero.name} n’a pas encore le niveau requis pour ${skill.name}.`;
      encounter.lastHeroAction = { label: skill.name, value: "Niveau requis", critical: false };
      render();
      return;
    }
    if (hero.energy < skill.cost) {
      encounter.log = `${hero.name} n’a pas assez d’énergie pour utiliser ${skill.name}.`;
      encounter.lastHeroAction = { label: skill.name, value: "Énergie insuffisante", critical: false };
      render();
      return;
    }

    hero.energy -= skill.cost;
    encounter.showSkills = false;
    const amount = skill.execute(hero, encounter.enemy);
    encounter.log = `${hero.name} utilise ${skill.name} et inflige ${amount} dégâts.`;
    encounter.lastHeroAction = { label: skill.name, value: amount > 0 ? `${lastDamageCritical ? "💥 " : ""}${amount} dégâts` : "Esquivé", critical: lastDamageCritical };
    if (amount > 0) {
      queueCombatShake(encounter, "enemy");
      queueCombatDamage(encounter, "enemy", amount, lastDamageCritical);
    }

    if (encounter.enemy.hp <= 0) {
      finishCombatWithFeedback("victory");
      return;
    }

    advanceCombatFlow();
  }

  function useCombatConsumable(itemId) {
    const encounter = state.run?.encounter;
    if (!encounter || encounter.combatEnding) return;
    const hero = state.run.team[encounter.activeHeroIndex];
    const item = state.run.inventory.find((entry) => entry.id === itemId);
    if (!hero || !item) return;

    if (item.effect === "heal") {
      hero.hp = clamp(hero.hp + item.amount, 0, getHeroCaps(hero).maxHp);
      encounter.log = `${hero.name} utilise ${item.name} et récupère ${item.amount} PV.`;
      encounter.lastHeroAction = { label: item.name, value: `+${item.amount} PV`, critical: false };
    }
    if (item.effect === "energy") {
      hero.energy = clamp(hero.energy + item.amount, 0, getHeroCaps(hero).maxEnergy);
      encounter.log = `${hero.name} utilise ${item.name} et récupère ${item.amount} énergie.`;
      encounter.lastHeroAction = { label: item.name, value: `+${item.amount} énergie`, critical: false };
    }

    consumeInventoryItem(item.id, 1);
    encounter.showConsumables = false;
    encounter.showSkills = false;
    advanceCombatFlow();
  }

  function advanceCombatFlow() {
    const encounter = state.run.encounter;
    const nextHeroIndex = getNextAliveHeroIndex(state.run.team, encounter.activeHeroIndex + 1);
    if (nextHeroIndex !== -1) {
      encounter.activeHeroIndex = nextHeroIndex;
      render();
      saveCurrentRun();
      return;
    }

    enemyTurn();
  }

  function enemyTurn() {
    const encounter = state.run.encounter;
    if (encounter.combatEnding) return;
    const livingHeroes = state.run.team.filter((hero) => hero.hp > 0);
    if (!livingHeroes.length) {
      finishCombatWithFeedback("defeat");
      return;
    }

    const target = randomFrom(livingHeroes);
    const enemySkillReady = encounter.enemy.energy >= encounter.enemy.skill.cost;
    let damage;

    if (enemySkillReady) {
      encounter.enemy.energy -= encounter.enemy.skill.cost;
      damage = dealDamage(target, Math.round(getEnemyDerived(encounter.enemy).atk * encounter.enemy.skill.multiplier), encounter.enemy.skill.school, 0.03);
      encounter.log = `${encounter.enemy.name} utilise ${encounter.enemy.skill.name} sur ${target.name} et inflige ${damage} dégâts.`;
      encounter.lastEnemyAction = { label: `${encounter.enemy.skill.name} → ${target.name}`, value: damage > 0 ? `${lastDamageCritical ? "💥 " : ""}${damage} dégâts` : "Esquivé", critical: lastDamageCritical };
    } else {
      damage = dealDamage(target, Math.round(getEnemyDerived(encounter.enemy).atk), "physical", 0.02);
      encounter.log = `${encounter.enemy.name} attaque ${target.name} et inflige ${damage} dégâts.`;
      encounter.lastEnemyAction = { label: `${encounter.enemy.name} attaque → ${target.name}`, value: damage > 0 ? `${lastDamageCritical ? "💥 " : ""}${damage} dégâts` : "Esquivé", critical: lastDamageCritical };
    }
    if (damage > 0) {
      queueCombatShake(encounter, "player");
      queueCombatDamage(encounter, "player", damage, lastDamageCritical);
    }

    tickStatusesAfterTurn();

    if (!state.run.team.some((hero) => hero.hp > 0)) {
      finishCombatWithFeedback("defeat");
      return;
    }

    encounter.turn += 1;
    encounter.activeHeroIndex = getNextAliveHeroIndex(state.run.team, 0);
    render();
    saveCurrentRun();
  }

  function tickStatusesAfterTurn() {
    const encounter = state.run.encounter;

    state.run.team.forEach((hero) => {
      hero.statuses = (hero.statuses || [])
        .map((status) => ({ ...status, turns: status.turns - 1 }))
        .filter((status) => status.turns > 0);
    });

    encounter.enemy.statuses = (encounter.enemy.statuses || [])
      .map((status) => ({ ...status, turns: status.turns - 1 }))
      .filter((status) => {
        if (status.turns < 0) return false;
        if (status.type === "burn") {
          encounter.enemy.hp = clamp(encounter.enemy.hp - Math.max(2, Math.round(encounter.enemy.maxHp * 0.05)), 0, encounter.enemy.maxHp);
        }
        return status.turns > 0;
      });
  }

  function winEncounter() {
    const encounter = state.run.encounter;
    const xpReward = encounter.enemy.xp;
    state.run.team.filter((hero) => hero.hp > 0).forEach((hero) => {
      hero.xp += xpReward;
      const gainedLevels = levelUpHeroIfNeeded(hero);
      if (gainedLevels > 0) {
        state.levelUpQueue.push({ heroId: hero.id, level: hero.level, points: gainedLevels * 2 });
      }
    });

    const loot = encounter.zone === "forest"
      ? buildForestVictoryLoot(encounter.enemy)
      : buildDungeonVictoryLoot(encounter.enemy, encounter.dungeonId);

    loot.forEach((item) => addItemToInventory(item));

    if (encounter.zone === "dungeon" && state.run.dungeonState) {
      state.run.dungeonState.floor += 1;
      if (encounter.forceBoss || state.run.dungeonState.floor > DUNGEON_FLOORS) {
        state.run.dungeonState.completed = true;
      }
    }

    state.run.encounter = null;
    saveCurrentRun();

    if (encounter.zone === "forest") {
      openModal({
        title: "Victoire",
        className: "modal-compact",
        body: `
          <p>XP gagnée : ${xpReward}</p>
          <p>Loot : ${loot.map((item) => `${escapeHtml(item.name)}${item.stackable ? ` x${item.quantity}` : ""}`).join(", ")}</p>
        `,
        actions: [
          {
            label: "Continuer",
            className: "primary",
            onClick: () => {
              state.run.forestState.log = "La forêt s’ouvre à nouveau devant l’équipe.";
              closeModal();
              setView("forest-exploration");
              startLevelUpQueueAfterDelay();
            },
          },
          {
            label: "Sortir",
            onClick: () => {
              closeModal();
              setView("main-menu");
            },
          },
        ],
      });
      return;
    }

    if (state.run.dungeonState?.completed) {
      openModal({
        title: "Donjon terminé",
        body: `<p>${getDungeon(encounter.dungeonId).name} est vaincu. Le groupe revient victorieux.</p>`,
        actions: [
          {
            label: "Retour au menu",
            className: "primary",
            onClick: () => {
              state.run.dungeonState = null;
              closeModal();
              setView("main-menu");
            },
          },
        ],
      });
      return;
    }

    state.run.dungeonState.log = `Le combat est gagné. Le groupe atteint l’étage ${state.run.dungeonState.floor}.`;
    setView("dungeon-exploration");
    startLevelUpQueueAfterDelay();
  }

  function loseEncounter() {
    handleAreaDefeat(state.view === "dungeon-combat" ? "dungeon" : "forest", "L’équipe est vaincue au combat.");
  }

  function dealDamage(target, baseDamage, school = "physical", critBonus = 0) {
    const derived = target.maxHp ? getEnemyDerived(target) : getHeroDerived(target);
    const defense = school === "magic" ? Math.floor(derived.def * 0.65) : derived.def;
    const dodgeRoll = randomInt(1, 100);
    lastDamageCritical = false;
    if (dodgeRoll <= derived.esq) return 0;
    const critRoll = randomInt(1, 100);
    const crit = critRoll <= (school === "magic" ? 6 : 10 + Math.floor(critBonus * 100));
    let damage = Math.max(1, baseDamage - defense);
    if (hasStatus(target, "defend")) {
      damage = Math.max(1, Math.floor(damage * 0.55));
    }
    if (crit) damage = Math.round(damage * 1.35);
    lastDamageCritical = crit;
    target.hp = clamp(target.hp - damage, 0, target.maxHp || getHeroCaps(target).maxHp);
    return damage;
  }

  function renderDraftHeroCard(hero) {
    const classDef = CLASS_DEFS[hero.classId];
    return `
      <div class="member-card">
        <div class="hero-card-head">
          <div>
            <div class="hero-name">${classDef.emoji} ${escapeHtml(hero.name)}</div>
            <div class="hero-class">${classDef.name}</div>
          </div>
          <button class="btn danger" data-remove-hero="${hero.id}">Retirer</button>
        </div>
        <p>FOR ${hero.stats.force} · RAP ${hero.stats.rapidity} · CON ${hero.stats.constitution} · MANA ${hero.stats.mana}</p>
      </div>
    `;
  }

  function renderMenuHeroCard(hero) {
    const classDef = CLASS_DEFS[hero.classId];
    const caps = getHeroCaps(hero);
    return `
      <div class="hero-card">
        <div class="hero-card-head">
          <div>
            <div class="hero-name">${classDef.emoji} ${escapeHtml(hero.name)}</div>
            <div class="hero-class">${classDef.name} · niv. ${hero.level}</div>
          </div>
        </div>
        <div class="hero-mini-bars">
          ${renderBar(hero.hp, caps.maxHp, "hp", "PV")}
          ${renderBar(hero.energy, caps.maxEnergy, "energy", "Énergie")}
        </div>
      </div>
    `;
  }

  function getSelectedExplorationHero() {
    if (!state.run?.team?.length) return null;
    const existing = state.run.team.find((hero) => hero.id === state.selectedExplorationHeroId);
    if (existing) return existing;
    state.selectedExplorationHeroId = state.run.team[0].id;
    return state.run.team[0];
  }

  function renderExplorationTeam(root, zone) {
    const selectedHero = getSelectedExplorationHero();
    root.classList.add("exploration-team-list");
    root.innerHTML = renderCompactTeamListHtml(selectedHero?.id);

    root.querySelectorAll("[data-exploration-hero]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedExplorationHeroId = button.dataset.explorationHero;
        renderExplorationTeam(root, zone);
        renderExplorationHeroDetail(zone);
      });
    });
  }

  function renderCompactTeamList(root) {
    root.classList.add("exploration-team-list");
    root.innerHTML = renderCompactTeamListHtml();
  }

  function renderCompactTeamListHtml(selectedHeroId = null) {
    return state.run.team.map((hero) => {
      const classDef = CLASS_DEFS[hero.classId];
      const selected = selectedHeroId === hero.id;
      return `
        <button type="button" class="exploration-hero-emoji ${selected ? "selected" : ""} ${hero.hp <= 0 ? "down" : ""}" data-exploration-hero="${hero.id}" aria-label="${escapeHtml(hero.name)}">
          ${classDef.emoji}
        </button>
      `;
    }).join("");
  }

  function ensureExplorationHeroDetail(zone) {
    if (zone === "menu") {
      const mapPanel = refs.mapMessage.closest(".map-panel");
      const layout = refs.mapMessage.closest(".menu-layout");
      const worldMap = mapPanel?.querySelector(".world-map");
      if (!mapPanel || !layout || !worldMap) return null;

      let main = mapPanel.querySelector(".menu-main");
      if (!main) {
        main = document.createElement("div");
        main.className = "menu-main";
        mapPanel.insertBefore(main, worldMap);
        main.appendChild(worldMap);
      }
      if (refs.mapMessage.parentElement !== main) {
        main.appendChild(refs.mapMessage);
      }

      let detail = layout.querySelector("#menu-exploration-hero-detail");
      if (!detail) {
        detail = document.createElement("aside");
        detail.id = "menu-exploration-hero-detail";
        detail.className = "exploration-hero-detail menu-hero-detail";
      }
      if (detail.parentElement !== layout) {
        layout.appendChild(detail);
      }
      return detail;
    }

    if (zone === "forest") {
      const panel = refs.forestStepCounter.closest(".exploration-panel");
      const layout = refs.forestStepCounter.closest(".exploration-layout");
      const scene = panel?.querySelector(".exploration-scene");
      if (!panel || !layout || !scene) return null;

      let main = panel.querySelector(".exploration-main");
      if (!main) {
        main = document.createElement("div");
        main.className = "exploration-main";
        panel.insertBefore(main, scene);
        main.appendChild(scene);
      }

      const actions = panel.querySelector(".exploration-actions");
      if (actions && actions.parentElement !== main) {
        main.appendChild(actions);
      }

      if (refs.forestLog && refs.forestLog.parentElement !== main) {
        main.appendChild(refs.forestLog);
      }

      let detail = layout.querySelector("#forest-exploration-hero-detail");
      if (!detail) {
        detail = document.createElement("aside");
        detail.id = "forest-exploration-hero-detail";
        detail.className = "exploration-hero-detail forest-hero-detail";
      }
      if (detail.parentElement !== layout) {
        layout.appendChild(detail);
      }
      return detail;
    }

    const panel = zone === "menu"
      ? refs.mapMessage.closest(".map-panel")
      : zone === "forest"
        ? refs.forestStepCounter.closest(".exploration-panel")
        : refs.dungeonSceneTitle.closest(".exploration-panel");
    if (!panel) return null;

    const scene = zone === "menu" ? panel.querySelector(".world-map") : panel.querySelector(".exploration-scene");
    if (!scene) return null;

    let main = panel.querySelector(".exploration-main");
    if (!main) {
      main = document.createElement("div");
      main.className = zone === "menu" ? "exploration-main menu-main" : "exploration-main";
      panel.insertBefore(main, scene);
      main.appendChild(scene);
    }

    const actions = zone === "menu" ? null : panel.querySelector(".exploration-actions");
    if (actions && actions.parentElement !== main) {
      main.appendChild(actions);
    }

    const log = zone === "menu" ? refs.mapMessage : zone === "forest" ? refs.forestLog : refs.dungeonLog;
    if (log && log.parentElement !== main) {
      main.appendChild(log);
    }

    const detailId = `${zone}-exploration-hero-detail`;
    let detail = panel.querySelector(`#${detailId}`);
    if (!detail) {
      detail = document.createElement("aside");
      detail.id = detailId;
      detail.className = "exploration-hero-detail";
      main.appendChild(detail);
    }
    return detail;
  }

  function renderExplorationHeroDetail(zone) {
    const detail = ensureExplorationHeroDetail(zone);
    const hero = getSelectedExplorationHero();
    if (!detail || !hero) return;

    const classDef = CLASS_DEFS[hero.classId];
    const caps = getHeroCaps(hero);
    detail.innerHTML = `
      <div class="exploration-detail-card">
        <div class="exploration-detail-title">${escapeHtml(hero.name)} <span>(niv.${hero.level})</span></div>
        <div class="exploration-detail-bars">
          ${renderBar(hero.hp, caps.maxHp, "hp", "PV")}
          ${renderBar(hero.energy, caps.maxEnergy, "energy", "Énergie")}
        </div>
        <div class="exploration-detail-separator"></div>
        <div class="exploration-detail-portrait">${renderHeroPortrait(hero)}</div>
        <div class="exploration-detail-footer">
          <div class="exploration-detail-separator"></div>
          ${renderBar(hero.xp, hero.xpNext, "xp", "EXP")}
          <div class="exploration-gold-counter">${state.run.gold} Or</div>
        </div>
      </div>
    `;
  }

  function renderHeroPortrait(hero) {
    const classDef = CLASS_DEFS[hero.classId];
    if (hero.classId !== "assassin") return classDef.emoji;
    if (hero.hp <= 0) {
      return `<img class="hero-portrait-img" src="assets/assassin_mort.png" alt="${escapeHtml(hero.name)}">`;
    }
    return `
      <img class="hero-portrait-img hero-portrait-rest" src="assets/assassin_repos.png" alt="${escapeHtml(hero.name)}">
      <img class="hero-portrait-img hero-portrait-hurt" src="assets/assassin_blesse.png" alt="${escapeHtml(hero.name)} blessé">
    `;
  }

  function renderCombatHeroCard(hero, active) {
    const classDef = CLASS_DEFS[hero.classId];
    const caps = getHeroCaps(hero);
    return `
      <div class="combat-hero-card ${active ? "active" : ""} ${hero.hp <= 0 ? "down" : ""}">
        <div class="combat-hero-card-head">
          <div>
            <div class="combat-hero-name">${classDef.emoji} ${escapeHtml(hero.name)}</div>
            <div class="hero-class">${classDef.name}</div>
          </div>
          <div class="tag">niv. ${hero.level}</div>
        </div>
        <div class="combat-bars">
          ${renderBar(hero.hp, caps.maxHp, "hp", "PV")}
          ${renderBar(hero.energy, caps.maxEnergy, "energy", "Énergie")}
        </div>
      </div>
    `;
  }

  function renderBarsHtml(hp, maxHp, energy, maxEnergy, xp, xpMax, hideXp = false) {
    return `
      <div class="bar-group">
        ${renderBar(hp, maxHp, "hp", "PV")}
        ${renderBar(energy, maxEnergy, "energy", "Énergie")}
        ${hideXp ? "" : renderBar(xp, xpMax, "xp", "EXP")}
      </div>
    `;
  }

  function getHeroSkills(hero) {
    return CLASS_DEFS[hero.classId]?.skills || [];
  }

  function renderCombatSkillButton(skill, hero) {
    const available = hero.level >= skill.requiredLevel;
    const enoughEnergy = hero.energy >= skill.cost;
    const disabled = !available || !enoughEnergy;
    return `
      <button type="button" class="skill-square ${disabled ? "disabled" : ""}" data-cast-skill="${skill.id}">
        <span class="skill-square-icon">${skill.icon}</span>
        <span class="skill-tooltip">
          <strong>${escapeHtml(skill.name)}</strong>
          <span>${escapeHtml(skill.description)}</span>
          <span>Coût : ${skill.cost} énergie</span>
          <span>Niveau requis : ${skill.requiredLevel}</span>
        </span>
      </button>
    `;
  }

  function renderDerivedStats(hero) {
    const derived = getHeroDerived(hero);
    return `
      <div class="combat-stats">
        ${renderDerivedGrid(derived)}
      </div>
    `;
  }

  function renderEnemyDerivedStats(enemy) {
    const derived = getEnemyDerived(enemy);
    return `
      <div class="combat-stats">
        ${renderDerivedGrid(derived)}
      </div>
    `;
  }

  function renderDerivedGrid(derived) {
    return `
      <div class="combat-stat"><strong>ATK</strong>${derived.atk}</div>
      <div class="combat-stat"><strong>DEF</strong>${derived.def}</div>
      <div class="combat-stat"><strong>CRIT</strong>${derived.crit}%</div>
      <div class="combat-stat"><strong>ESQ</strong>${derived.esq}%</div>
    `;
  }

  function renderBar(current, max, type, label) {
    const pct = max > 0 ? clamp((current / max) * 100, 0, 100) : 0;
    return `
      <div class="bar ${type}">
        <div class="bar-fill" style="width:${pct}%"></div>
        <div class="bar-text"><span>${label}</span><span>${Math.ceil(current)} / ${Math.ceil(max)}</span></div>
      </div>
    `;
  }

  function levelUpHeroIfNeeded(hero) {
    let gainedLevels = 0;
    while (hero.xp >= hero.xpNext) {
      hero.xp -= hero.xpNext;
      hero.level += 1;
      gainedLevels += 1;
      hero.xpNext = Math.round(hero.xpNext * 1.35);
      hero.statPoints = (hero.statPoints || 0) + 2;
      restoreHero(hero, true);
    }
    return gainedLevels;
  }

  function buildForestExplorationLoot() {
    const sources = ["Herbes", "Champignons", "Fruits", "Crocs", "Peaux", "Viande"];
    const loot = [];
    const rolls = randomInt(1, 2);
    for (let i = 0; i < rolls; i += 1) {
      const resource = deepClone(FOREST_RESOURCES.find((entry) => entry.name === randomFrom(sources)) || randomFrom(FOREST_RESOURCES));
      resource.id = uid("item");
      resource.quantity = randomInt(1, 2);
      loot.push(resource);
    }
    return mergeLootStacks(loot);
  }

  function buildForestVictoryLoot(enemy) {
    const loot = [];
    const lootNames = enemy.lootPool || ["Crocs"];
    const rollCount = randomInt(1, 2);
    for (let i = 0; i < rollCount; i += 1) {
      const resource = deepClone(FOREST_RESOURCES.find((entry) => entry.name === randomFrom(lootNames)) || randomFrom(FOREST_RESOURCES));
      resource.id = uid("item");
      resource.quantity = 1;
      loot.push(resource);
    }
    return mergeLootStacks(loot);
  }

  function buildDungeonChestLoot(dungeonId) {
    const dungeon = getDungeon(dungeonId);
    const rolls = randomInt(1, 2);
    const loot = [];
    for (let i = 0; i < rolls; i += 1) {
      const resourceName = randomFrom(dungeon.lootPool);
      const resource = deepClone(DUNGEON_LOOT.find((entry) => entry.name === resourceName) || randomFrom(DUNGEON_LOOT));
      resource.id = uid("item");
      resource.quantity = randomInt(1, 2);
      loot.push(resource);
    }
    return mergeLootStacks(loot);
  }

  function buildDungeonVictoryLoot(enemy, dungeonId) {
    const dungeon = getDungeon(dungeonId);
    const rollCount = enemy.level >= 5 ? 2 : 1;
    const loot = [];
    for (let i = 0; i < rollCount; i += 1) {
      const resourceName = randomFrom(dungeon.lootPool);
      const resource = deepClone(DUNGEON_LOOT.find((entry) => entry.name === resourceName) || randomFrom(DUNGEON_LOOT));
      resource.id = uid("item");
      resource.quantity = 1;
      loot.push(resource);
    }
    return mergeLootStacks(loot);
  }

  function formatLootList(loot) {
    return loot.map((item) => `${item.quantity && item.quantity > 1 ? `${item.quantity} ` : ""}${item.name.toLowerCase()}`).join(", ");
  }

  function handleAreaDefeat(zone, message) {
    state.run.encounter = null;
    state.run.team.forEach((hero) => restoreHero(hero, true));
    if (zone === "dungeon") state.run.dungeonState = null;
    saveCurrentRun();
    openModal({
      title: "Défaite",
      className: "modal-compact",
      body: `<p>${escapeHtml(message)}</p><p>L’équipe se replie et revient au menu principal.</p>`,
      actions: [
        {
          label: "Retour au menu",
          className: "primary",
          onClick: () => {
            closeModal();
            setView("main-menu");
          },
        },
      ],
    });
  }

  function mergeLootStacks(items) {
    const merged = [];
    items.forEach((item) => {
      const existing = merged.find((entry) => entry.name === item.name && entry.stackable);
      if (existing) existing.quantity += item.quantity || 1;
      else merged.push(item);
    });
    return merged;
  }

  function addItemToInventory(item) {
    const stackable = item.stackable || item.category === "resources";
    if (stackable) {
      const existing = state.run.inventory.find((entry) => entry.name === item.name && (entry.stackable || entry.category === "resources"));
      if (existing) {
        existing.quantity = (existing.quantity || 0) + (item.quantity || 1);
        return;
      }
      item.stackable = true;
      item.quantity = item.quantity || 1;
    }
    state.run.inventory.push(item);
  }

  function consumeInventoryItem(itemId, quantity) {
    const item = state.run.inventory.find((entry) => entry.id === itemId);
    if (!item) return;
    if (item.stackable) {
      item.quantity -= quantity;
      if (item.quantity <= 0) {
        state.run.inventory = state.run.inventory.filter((entry) => entry.id !== itemId);
      }
    } else {
      state.run.inventory = state.run.inventory.filter((entry) => entry.id !== itemId);
    }
  }

  function getCombatConsumables() {
    return state.run.inventory.filter((item) => item.category === "consumables" && item.quantity > 0);
  }

  function getAveragePartyLevel(team) {
    if (!team.length) return 1;
    return Math.round(team.reduce((sum, hero) => sum + hero.level, 0) / team.length);
  }

  function buildEnemy(template, averageLevel, zone, forceBoss = false) {
    const enemy = deepClone(template);
    const levelOffset = Math.max(0, averageLevel - enemy.level);
    const perStat = zone === "forest" ? 0.55 : 0.8;
    enemy.stats.force += Math.max(0, Math.round(levelOffset * perStat));
    enemy.stats.rapidity += Math.max(0, Math.round(levelOffset * (zone === "forest" ? 0.4 : 0.65)));
    enemy.stats.constitution += Math.max(0, Math.round(levelOffset * (zone === "forest" ? 0.6 : 0.9)));
    enemy.stats.mana += Math.max(0, Math.round(levelOffset * (zone === "forest" ? 0.35 : 0.55)));

    if (zone === "dungeon") {
      enemy.stats.force += 1;
      enemy.stats.constitution += 1;
    }
    if (forceBoss) {
      enemy.stats.force += 2;
      enemy.stats.constitution += 3;
      enemy.stats.mana += 1;
      enemy.xp = Math.round(enemy.xp * 1.35);
    }

    const caps = getEnemyCaps(enemy);
    enemy.maxHp = caps.maxHp;
    enemy.hp = caps.maxHp;
    enemy.maxEnergy = caps.maxEnergy;
    enemy.energy = caps.maxEnergy;
    enemy.statuses = [];
    return enemy;
  }

  function restoreHero(hero, refill) {
    hero.statuses = hero.statuses || [];
    const caps = getHeroCaps(hero);
    hero.hp = refill ? caps.maxHp : clamp(hero.hp || caps.maxHp, 0, caps.maxHp);
    hero.energy = refill ? caps.maxEnergy : clamp(hero.energy || caps.maxEnergy, 0, caps.maxEnergy);
  }

  function getHeroCaps(hero) {
    const weapon = hero.equipment?.weapon || {};
    const armor = hero.equipment?.armor || {};
    return {
      maxHp: 48 + hero.level * 6 + hero.stats.constitution * 10 + (weapon.hp || 0) + (armor.hp || 0),
      maxEnergy: 24 + hero.level * 4 + hero.stats.mana * 8 + (weapon.energy || 0) + (armor.energy || 0),
    };
  }

  function getEnemyCaps(enemy) {
    return {
      maxHp: 40 + enemy.level * 7 + enemy.stats.constitution * 9,
      maxEnergy: 18 + enemy.level * 4 + enemy.stats.mana * 7,
    };
  }

  function getHeroDerived(hero) {
    const weapon = hero.equipment?.weapon || {};
    const armor = hero.equipment?.armor || {};
    return {
      atk: hero.stats.force * 2 + hero.level + (weapon.atk || 0) + (armor.atk || 0),
      def: hero.stats.constitution + Math.floor(hero.stats.rapidity / 2) + (weapon.def || 0) + (armor.def || 0),
      crit: clamp(hero.stats.rapidity * 2 + (weapon.crit || 0) + (armor.crit || 0), 0, 45),
      esq: clamp(hero.stats.rapidity + Math.floor(hero.level / 2) + (weapon.esq || 0) + (armor.esq || 0), 0, 35),
      magic: hero.stats.mana * 2 + hero.level + (weapon.magic || 0) + (armor.magic || 0),
    };
  }

  function getEnemyDerived(enemy) {
    const weakened = hasStatus(enemy, "weaken") ? 0.8 : 1;
    return {
      atk: Math.round((enemy.stats.force * 2 + enemy.level) * weakened),
      def: enemy.stats.constitution + Math.floor(enemy.stats.rapidity / 2),
      crit: clamp(enemy.stats.rapidity * 2, 0, 35),
      esq: clamp(enemy.stats.rapidity, 0, 25),
      magic: enemy.stats.mana * 2 + enemy.level,
    };
  }

  function getNextAliveHeroIndex(team, startIndex) {
    for (let index = startIndex; index < team.length; index += 1) {
      if (team[index].hp > 0) return index;
    }
    return -1;
  }

  function hasStatus(entity, type) {
    return (entity.statuses || []).some((status) => status.type === type);
  }

  function getDungeon(id) {
    return DUNGEON_DEFS.find((dungeon) => dungeon.id === id) || null;
  }

  function getSellPrice(item) {
    return Math.max(1, Math.floor(item.value || 1));
  }

  function describeShopItem(item) {
    if (item.type === "weapon") {
      const parts = [];
      if (item.atk) parts.push(`ATK +${item.atk}`);
      if (item.crit) parts.push(`CRIT +${item.crit}`);
      if (item.magic) parts.push(`MAG +${item.magic}`);
      if (item.energy) parts.push(`Énergie +${item.energy}`);
      return parts.join(" · ");
    }
    if (item.type === "armor") {
      const parts = [];
      if (item.def) parts.push(`DEF +${item.def}`);
      if (item.hp) parts.push(`PV +${item.hp}`);
      if (item.energy) parts.push(`Énergie +${item.energy}`);
      return parts.join(" · ");
    }
    if (item.type === "consumable") {
      return item.effect === "heal" ? `Restaure ${item.amount} PV` : `Restaure ${item.amount} énergie`;
    }
    return "Objet";
  }

  function describeInventoryItem(item) {
    if (item.category === "resources") return `Ressource vendable · valeur ${getSellPrice(item)} Or`;
    if (item.type === "weapon" || item.type === "armor") return describeShopItem(item);
    if (item.type === "consumable") return describeShopItem(item);
    return "Objet";
  }

  function describeUnlock(unlock) {
    return Object.entries(unlock.sold || {}).map(([name, qty]) => `Vendre ${qty} ${name}`).join(" · ");
  }

  function openModal({ title, body, actions = [], afterRender = null, className = "", closeDisabled = false }) {
    state.modal = { title, body, actions, afterRender, className, closeDisabled };
    renderModal();
  }

  function showMessageModal(title, message) {
    openModal({
      title,
      body: `<p>${escapeHtml(message)}</p>`,
      actions: [{ label: "Fermer", className: "primary", onClick: closeModal }],
    });
  }

  function closeModal(force = false) {
    if (state.modal?.closeDisabled && !force) return;
    state.modal = null;
    renderModal();
  }

  function renderModal() {
    if (!state.modal) {
      refs.modalOverlay.classList.add("hidden");
      refs.modalTitle.textContent = "";
      refs.modalBody.innerHTML = "";
      refs.modalActions.innerHTML = "";
      refs.modalOverlay.className = "modal-overlay hidden";
      refs.modalClose.disabled = false;
      refs.modalClose.classList.remove("hidden");
      return;
    }

    refs.modalOverlay.classList.remove("hidden");
    refs.modalOverlay.className = `modal-overlay ${state.modal.className || ""}`.trim();
    refs.modalClose.disabled = !!state.modal.closeDisabled;
    refs.modalClose.classList.toggle("hidden", !!state.modal.closeDisabled);
    refs.modalTitle.textContent = state.modal.title;
    refs.modalBody.innerHTML = state.modal.body;
    refs.modalActions.innerHTML = state.modal.actions.map((action, index) => `
      <button class="btn ${action.className || ""}" data-modal-action="${index}">${action.label}</button>
    `).join("");

    refs.modalActions.querySelectorAll("[data-modal-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = state.modal.actions[Number(button.dataset.modalAction)];
        action?.onClick?.();
      });
    });

    state.modal.afterRender?.(refs.modalBody);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatStatLabel(key) {
    if (key === "force") return "Force";
    if (key === "rapidity") return "Rapidité";
    if (key === "constitution") return "Constitution";
    return "Mana";
  }
})();
