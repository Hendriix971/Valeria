    const CLASS_DATA = {
      Guerrier: {
        emoji: '⚔️',
        bonuses: ['+2 FOR au départ', '+2 CON au départ', 'Compétence : Punition frénétique', 'Très résistant quand il encaisse'],
        baseAdjust: { FOR: 2, CON: 2, RAP: 0, MANA: 0 },
        skillName: 'Punition frénétique',
        skillCost: 8,
      },
      Mage: {
        emoji: '🧙‍♂️',
        bonuses: ['+3 MANA au départ', '+1 RAP au départ', 'Compétence : Boule de feu', 'Gros dégâts magiques'],
        baseAdjust: { FOR: 0, CON: 0, RAP: 1, MANA: 3 },
        skillName: 'Boule de feu',
        skillCost: 10,
      },
      Assassin: {
        emoji: '🗡️',
        bonuses: ['+3 RAP au départ', '+1 FOR au départ', 'Compétence : Assassinat', 'Critiques et esquive élevés'],
        baseAdjust: { FOR: 1, CON: 0, RAP: 3, MANA: 0 },
        skillName: 'Assassinat',
        skillCost: 7,
      },
      Gardien: {
        emoji: '🛡️',
        bonuses: ['+3 CON au départ', '+1 MANA au départ', 'Compétence : Morsure de l\'hydre', 'Très grosse réserve de PV'],
        baseAdjust: { FOR: 0, CON: 3, RAP: 0, MANA: 1 },
        skillName: 'Morsure de l\'hydre',
        skillCost: 10,
      }
    };

    const CREATION = {
      points: 10,
      className: 'Guerrier',
      stats: { FOR: 5, CON: 5, RAP: 5, MANA: 5 }
    };

    const BESTIARY = [
      { name: 'Gobelin', hp: 34, dmgMin: 4, dmgMax: 7, xp: 34, sprite: '👺', level: 1 },
      { name: 'Loup affamé', hp: 30, dmgMin: 5, dmgMax: 8, xp: 36, sprite: '🐺', level: 1 },
      { name: 'Squelette', hp: 44, dmgMin: 6, dmgMax: 10, xp: 52, sprite: '💀', level: 2 },
      { name: 'Orc de sang', hp: 68, dmgMin: 8, dmgMax: 13, xp: 88, sprite: '👹', level: 3 },
      { name: 'Spectre', hp: 85, dmgMin: 10, dmgMax: 15, xp: 120, sprite: '👻', level: 4 },
      { name: 'Chevalier noir', hp: 110, dmgMin: 12, dmgMax: 18, xp: 170, sprite: '🛡️', level: 5 },
      { name: 'Dragon ancien', hp: 240, dmgMin: 18, dmgMax: 30, xp: 550, sprite: '🐲', level: 8, boss: true }
    ];

    const WEAPONS = [
      { name: 'Dague rouillée', type: 'weapon', slot: 'weapon', atk: 2, rarity: 'Commun', icon: '🗡️' },
      { name: 'Épée longue', type: 'weapon', slot: 'weapon', atk: 4, rarity: 'Commun', icon: '⚔️' },
      { name: 'Bâton runique', type: 'weapon', slot: 'weapon', atk: 5, mana: 4, rarity: 'Rare', icon: '🪄' },
      { name: 'Lame de l’ombre', type: 'weapon', slot: 'weapon', atk: 7, crit: 6, rarity: 'Rare', icon: '🗡️' },
      { name: 'Claymore royale', type: 'weapon', slot: 'weapon', atk: 9, def: 2, rarity: 'Épique', icon: '⚔️' }
    ];

    const ARMORS = [
      { name: 'Tunique renforcée', type: 'armor', slot: 'armor', def: 2, rarity: 'Commun', icon: '🛡️' },
      { name: 'Armure de cuir', type: 'armor', slot: 'armor', def: 4, evasion: 3, rarity: 'Commun', icon: '🧥' },
      { name: 'Robe mystique', type: 'armor', slot: 'armor', def: 3, mana: 6, rarity: 'Rare', icon: '🪶' },
      { name: 'Cotte d’acier', type: 'armor', slot: 'armor', def: 6, rarity: 'Rare', icon: '🛡️' },
      { name: 'Armure du gardien', type: 'armor', slot: 'armor', def: 8, hp: 20, rarity: 'Épique', icon: '🛡️' }
    ];

    const SAVE_KEY = 'valeria_faux_multi_save_v1';

    const GAME = {
      started: false,
      saveId: null,
      selectedSaveId: null,
      party: [],
      displayHeroIndex: 0,
      activeHeroIndex: 0,
      setupSharedBag: [],
      sharedBag: [],
      currentEnemy: null,
      inCombat: false,
      selectedItemId: null,
      selectedEquipmentId: null,
      roomsCleared: 0,
      pendingActions: [],
      lastRoundHeroActions: {},
      lastEnemyAction: '',
      heroesChosenThisRound: 0,
      isResolvingRound: false,
      isResting: false,
      restInterval: null,
      restEndsAt: null,
      pendingLevelUps: [],
      isLevelingUp: false,
      pendingModalAction: null,
    };

    const refs = {
      gameWrapper: document.getElementById('game-wrapper'),
      menuScreen: document.getElementById('menu-screen'),
      setupScreen: document.getElementById('setup-screen'),
      saveList: document.getElementById('save-list'),
      partyBuilder: document.getElementById('party-builder'),
      addHeroBtn: document.getElementById('add-hero-btn'),
      playBtn: document.getElementById('play-btn'),
      openSetupBtn: document.getElementById('open-setup-btn'),
      backToMenuBtn: document.getElementById('back-to-menu-btn'),
      resetTeamBtn: document.getElementById('reset-team-btn'),
      continueBtn: document.getElementById('continue-btn'),
      clearSaveBtn: document.getElementById('clear-save-btn'),
      saveStatus: document.getElementById('save-status'),
      gameScreen: document.getElementById('game-screen'),
      log: document.getElementById('log'),
      teamScroll: document.getElementById('team-scroll'),
      playerCard: document.getElementById('player-card'),
      enemyCard: document.getElementById('enemy-card'),
      equipmentList: document.getElementById('equipment-list'),
      inventoryList: document.getElementById('inventory-list'),
      btnUseItem: document.getElementById('btn-use-item'),
      btnEquipItem: document.getElementById('btn-equip-item'),
      btnDropItem: document.getElementById('btn-drop-item'),
      btnDropEquipped: document.getElementById('btn-drop-equipped'),
      btnExplore: document.getElementById('btn-explore'),
      btnRest: document.getElementById('btn-rest'),
      btnAttack: document.getElementById('btn-attack'),
      btnHeavy: document.getElementById('btn-heavy'),
      btnBlock: document.getElementById('btn-block'),
      btnSkill: document.getElementById('btn-skill'),
      explorationSidebar: document.getElementById('exploration-sidebar'),
      explorationHud: document.getElementById('exploration-hud'),
      explorationHeroSummary: document.getElementById('exploration-hero-summary'),
      explorationWorldSummary: document.getElementById('exploration-world-summary'),
      combatPlayerStats: document.getElementById('combat-player-stats'),
      combatEnemyStats: document.getElementById('combat-enemy-stats'),
      combatPlayerBonusText: document.getElementById('combat-player-bonus-text'),
      combatEnemyBonusText: document.getElementById('combat-enemy-bonus-text'),
      combatActions: document.getElementById('combat-actions'),
      combatPlanTitle: document.getElementById('combat-plan-title'),
      combatLastTitle: document.getElementById('combat-last-title'),
      combatPlan: document.getElementById('combat-plan'),
      combatLastAction: document.getElementById('combat-last-action'),
      skillLabel: document.getElementById('skill-label'),
      creationModal: document.getElementById('creation-modal'),
      modalOverlay: document.getElementById('modal-overlay'),
      heroName: document.getElementById('hero-name'),
      classGrid: document.getElementById('class-grid'),
      creationStatList: document.getElementById('creation-stat-list'),
      creationPoints: document.getElementById('creation-points'),
      previewEmoji: document.getElementById('preview-emoji'),
      previewName: document.getElementById('preview-name'),
      previewClass: document.getElementById('preview-class'),
      previewFor: document.getElementById('preview-for'),
      previewRap: document.getElementById('preview-rap'),
      previewCon: document.getElementById('preview-con'),
      previewMana: document.getElementById('preview-mana'),
      classBonuses: document.getElementById('class-bonuses'),
      confirmCreateBtn: document.getElementById('confirm-create-btn'),
      cancelCreateBtn: document.getElementById('cancel-create-btn'),
      restModal: document.getElementById('rest-modal'),
      restText: document.getElementById('rest-text'),
      eventModal: document.getElementById('event-modal'),
      eventTitle: document.getElementById('event-title'),
      eventText: document.getElementById('event-text'),
      eventConfirmBtn: document.getElementById('event-confirm-btn'),
      levelupModal: document.getElementById('levelup-modal'),
      levelupText: document.getElementById('levelup-text'),
      levelupChoices: document.getElementById('levelup-choices'),
    };

    function uid() { return `${Date.now()}-${Math.random()}`; }
    function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
    function roll(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    function getSavedRun() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        console.error('Impossible de lire la sauvegarde.', error);
        return null;
      }
    }

    function setSavedRun(state) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    }

    function clearSavedRun() {
      localStorage.removeItem(SAVE_KEY);
      updateSaveControls();
    }

    function buildSaveSummary(save) {
      if (!save?.started || !Array.isArray(save.party) || !save.party.length) {
        return 'Aucune sauvegarde active.';
      }
      const teamSize = save.party.length;
      const room = save.roomsCleared || 0;
      const updatedAt = save.updatedAt ? new Date(save.updatedAt).toLocaleString('fr-FR') : 'inconnue';
      return `Sauvegarde trouvée : ${teamSize} héros, salle ${room}, mise à jour ${updatedAt}.`;
    }

    function updateSaveControls() {
      const save = getSavedRun();
      refs.continueBtn.disabled = !save?.started;
      refs.clearSaveBtn.disabled = !save;
      refs.saveStatus.textContent = buildSaveSummary(save);
    }

    function serializeGameState() {
      if (!GAME.started || !GAME.party.length || GAME.isResolvingRound || GAME.isLevelingUp) return null;
      return {
        started: GAME.started,
        party: clone(GAME.party),
        displayHeroIndex: GAME.displayHeroIndex,
        activeHeroIndex: GAME.activeHeroIndex,
        setupSharedBag: clone(GAME.setupSharedBag),
        sharedBag: clone(GAME.sharedBag),
        currentEnemy: clone(GAME.currentEnemy),
        inCombat: GAME.inCombat,
        selectedItemId: GAME.selectedItemId,
        selectedEquipmentId: GAME.selectedEquipmentId,
        roomsCleared: GAME.roomsCleared,
        pendingActions: clone(GAME.pendingActions),
        lastRoundHeroActions: clone(GAME.lastRoundHeroActions),
        lastEnemyAction: GAME.lastEnemyAction,
        heroesChosenThisRound: GAME.heroesChosenThisRound,
        isResting: GAME.isResting,
        restEndsAt: GAME.restEndsAt,
        pendingLevelUpIds: GAME.pendingLevelUps.map((hero) => hero.id),
        updatedAt: Date.now(),
      };
    }

    function saveGameState() {
      const state = serializeGameState();
      if (!state) return;
      setSavedRun(state);
      updateSaveControls();
    }

    function hydrateGameState(state) {
      GAME.started = !!state.started;
      GAME.party = clone(state.party || []);
      GAME.displayHeroIndex = Math.min(state.displayHeroIndex || 0, Math.max(0, GAME.party.length - 1));
      GAME.activeHeroIndex = Math.min(state.activeHeroIndex || 0, Math.max(0, GAME.party.length - 1));
      GAME.setupSharedBag = clone(state.setupSharedBag || []);
      GAME.sharedBag = clone(state.sharedBag || []);
      GAME.currentEnemy = state.currentEnemy ? clone(state.currentEnemy) : null;
      GAME.inCombat = !!state.inCombat;
      GAME.selectedItemId = state.selectedItemId || GAME.sharedBag[0]?.id || null;
      GAME.selectedEquipmentId = state.selectedEquipmentId || null;
      GAME.roomsCleared = state.roomsCleared || 0;
      GAME.pendingActions = clone(state.pendingActions || []);
      GAME.lastRoundHeroActions = clone(state.lastRoundHeroActions || {});
      GAME.lastEnemyAction = state.lastEnemyAction || '';
      GAME.heroesChosenThisRound = state.heroesChosenThisRound || 0;
      GAME.isResting = !!state.isResting;
      GAME.restEndsAt = state.restEndsAt || null;
      GAME.pendingLevelUps = (state.pendingLevelUpIds || [])
        .map((heroId) => GAME.party.find((hero) => hero.id === heroId))
        .filter(Boolean);
      GAME.isLevelingUp = false;
      GAME.pendingModalAction = null;

      GAME.party.forEach((hero) => syncHeroCaps(hero, false));
      if (GAME.currentEnemy) {
        GAME.currentEnemy.guardBreakTurns = GAME.currentEnemy.guardBreakTurns || 0;
        GAME.currentEnemy.guardBreakAmount = GAME.currentEnemy.guardBreakAmount || 0;
      }
    }

    function addLog(message, type = '') {
      if (!refs.log) return;
      const entry = document.createElement('div');
      entry.className = `log-entry ${type}`.trim();
      entry.innerHTML = message;
      refs.log.appendChild(entry);
      refs.log.scrollTop = refs.log.scrollHeight;
    }

    function formatLootEntries(entries) {
      if (!entries?.length) return '<strong>Aucun butin</strong>';
      return entries.map((item) => `${item.icon || '📦'} ${item.name}${item.stackable ? ` x${item.quantity || 1}` : ''}`).join('<br>');
    }

    function showEventModal(title, body, onConfirm = null) {
      GAME.pendingModalAction = onConfirm;
      refs.eventTitle.textContent = title;
      refs.eventText.innerHTML = body;
      refs.modalOverlay.classList.add('show');
      refs.eventModal.classList.add('show');
    }

    function closeEventModal() {
      refs.modalOverlay.classList.remove('show');
      refs.eventModal.classList.remove('show');
      const action = GAME.pendingModalAction;
      GAME.pendingModalAction = null;
      if (typeof action === 'function') action();
    }

    function shakeElement(el) {
      el.classList.remove('shake');
      void el.offsetWidth;
      el.classList.add('shake');
      setTimeout(() => el.classList.remove('shake'), 420);
    }

    function classAdjustedStats(baseStats, className) {
      const adjusted = { ...baseStats };
      const bonus = CLASS_DATA[className].baseAdjust;
      Object.keys(adjusted).forEach((key) => adjusted[key] += bonus[key] || 0);
      return adjusted;
    }

    function getHeroDerived(hero) {
      const stats = hero.stats;
      const weapon = hero.equipment.weapon;
      const armor = hero.equipment.armor;
      const weaponAtk = weapon?.atk || 0;
      const weaponMana = weapon?.mana || 0;
      const weaponCrit = weapon?.crit || 0;
      const weaponDef = weapon?.def || 0;
      const armorDef = armor?.def || 0;
      const armorMana = armor?.mana || 0;
      const armorHp = armor?.hp || 0;
      const armorEva = armor?.evasion || 0;

      const maxHp = 52 + stats.CON * 12 + hero.level * 10 + armorHp;
      const maxMana = 18 + stats.MANA * 8 + hero.level * 4 + weaponMana + armorMana;
      const atk = Math.max(1, 4 + stats.FOR * 2 + hero.level + weaponAtk);
      const def = Math.max(0, Math.floor(stats.CON * 0.8) + armorDef + weaponDef);
      const evasion = Math.min(45, 4 + stats.RAP * 2 + armorEva + (hero.className === 'Assassin' ? 5 : 0));
      const crit = Math.min(55, 5 + Math.floor(stats.RAP * 1.5) + weaponCrit + (hero.className === 'Assassin' ? 8 : 0));
      return { maxHp, maxMana, atk, def, evasion, crit };
    }

    function syncHeroCaps(hero, fillResources = false) {
      const derived = getHeroDerived(hero);
      hero.maxHp = derived.maxHp;
      hero.maxMana = derived.maxMana;
      if (fillResources) {
        hero.hp = derived.maxHp;
        hero.mana = derived.maxMana;
      } else {
        hero.hp = Math.min(hero.hp, derived.maxHp);
        hero.mana = Math.min(hero.mana, derived.maxMana);
      }
      return derived;
    }

    function createStartingGear(className) {
      const gear = [];
      if (className === 'Guerrier') gear.push({ name: 'Épée du recrue', type: 'weapon', slot: 'weapon', atk: 3, rarity: 'Départ', icon: '⚔️' });
      if (className === 'Mage') gear.push({ name: 'Bâton d’apprenti', type: 'weapon', slot: 'weapon', atk: 2, mana: 5, rarity: 'Départ', icon: '🪄' });
      if (className === 'Assassin') gear.push({ name: 'Dagues jumelles', type: 'weapon', slot: 'weapon', atk: 3, crit: 4, rarity: 'Départ', icon: '🗡️' });
      if (className === 'Gardien') gear.push({ name: 'Masse du rempart', type: 'weapon', slot: 'weapon', atk: 2, def: 2, rarity: 'Départ', icon: '🛡️' });
      gear.push({ name: 'Tenue de voyage', type: 'armor', slot: 'armor', def: 1, rarity: 'Départ', icon: '🛡️' });
      return gear.map((item) => ({ ...clone(item), id: uid() }));
    }

    function ensureSetupBag() {
      if (!GAME.setupSharedBag.length) {
        GAME.setupSharedBag.push({ id: uid(), name: 'Potion de soin', type: 'consumable', stackable: true, quantity: 3, heal: 35, effectText: 'Restaure 35 PV', icon: '🧪' });
        GAME.setupSharedBag.push({ id: uid(), name: 'Potion de mana', type: 'consumable', stackable: true, quantity: 2, manaRestore: 30, effectText: 'Restaure 30 mana', icon: '🔵' });
      }
    }

    function itemDescription(item) {
      const bits = [];
      if (item.atk) bits.push(`+${item.atk} ATK`);
      if (item.def) bits.push(`+${item.def} DEF`);
      if (item.hp) bits.push(`+${item.hp} PV max`);
      if (item.mana) bits.push(`+${item.mana} mana max`);
      if (item.crit) bits.push(`+${item.crit}% crit`);
      if (item.evasion) bits.push(`+${item.evasion}% esquive`);
      if (item.type === 'consumable') bits.push(item.effectText || 'Consommable');
      return bits.join(' • ');
    }

    function getDisplayedHero() {
      return GAME.party[GAME.displayHeroIndex] || null;
    }

    function getActiveHero() {
      return GAME.party[GAME.activeHeroIndex] || null;
    }

    function getAliveHeroes() {
      return GAME.party.filter((hero) => hero.hp > 0);
    }

    function getAliveIndexes() {
      return GAME.party.map((hero, index) => hero.hp > 0 ? index : -1).filter((index) => index !== -1);
    }

    function renderSetupParty() {
      ensureSetupBag();
      refs.partyBuilder.innerHTML = '';
      if (!GAME.party.length) {
        refs.partyBuilder.innerHTML = '<div class="party-slot"><div class="slot-left"><div class="party-emoji">[+]</div><div class="slot-info"><div class="slot-name">Aucun personnage</div><div class="slot-meta">Ajoute ton premier membre d’équipe.</div></div></div></div>';
      } else {
        GAME.party.forEach((hero, index) => {
          const slot = document.createElement('div');
          slot.className = 'party-slot';
          slot.innerHTML = `
            <div class="slot-left">
              <div class="party-emoji">${hero.emoji}</div>
              <div class="slot-info">
                <div class="slot-name">${hero.name}</div>
                <div class="slot-meta">${hero.className} • Ordre ${index + 1}</div>
              </div>
            </div>
            <button class="slot-btn" data-index="${index}">Retirer</button>
          `;
          slot.querySelector('button').onclick = () => {
            GAME.party.splice(index, 1);
            if (GAME.displayHeroIndex >= GAME.party.length) GAME.displayHeroIndex = Math.max(0, GAME.party.length - 1);
            renderSetupParty();
          };
          refs.partyBuilder.appendChild(slot);
        });
      }
      refs.playBtn.disabled = GAME.party.length === 0;
      updateSaveControls();
    }

    function openCreationModal() {
      CREATION.points = 10;
      CREATION.className = 'Guerrier';
      CREATION.stats = { FOR: 5, CON: 5, RAP: 5, MANA: 5 };
      refs.heroName.value = '';
      renderCreation();
      refs.modalOverlay.classList.add('show');
      refs.creationModal.classList.add('show');
    }

    function closeCreationModal() {
      refs.modalOverlay.classList.remove('show');
      refs.creationModal.classList.remove('show');
    }

    function renderCreation() {
      refs.classGrid.innerHTML = '';
      Object.keys(CLASS_DATA).forEach((className) => {
        const btn = document.createElement('button');
        btn.className = `class-btn ${CREATION.className === className ? 'active' : ''}`;
        btn.innerHTML = `<span class="class-emoji">${CLASS_DATA[className].emoji}</span>${className}`;
        btn.onclick = () => { CREATION.className = className; renderCreation(); };
        refs.classGrid.appendChild(btn);
      });

      refs.creationStatList.innerHTML = '';
      ['FOR', 'RAP', 'CON', 'MANA'].forEach((stat) => {
        const row = document.createElement('div');
        row.className = 'stat-row';
        const desc = {
          FOR: 'augmente les dégâts',
          RAP: 'augmente esquive et crit',
          CON: 'augmente les PV',
          MANA: 'augmente le mana'
        }[stat];
        row.innerHTML = `
          <div>
            <div><strong>${stat}</strong></div>
            <div class="stat-desc">${desc}</div>
          </div>
          <button class="adjust-btn minus" ${CREATION.stats[stat] <= 1 ? 'disabled' : ''}>−</button>
          <div class="stat-value">${CREATION.stats[stat]}</div>
          <button class="adjust-btn" ${CREATION.points <= 0 ? 'disabled' : ''}>+</button>
        `;
        const [minusBtn, plusBtn] = row.querySelectorAll('button');
        minusBtn.onclick = () => {
          if (CREATION.stats[stat] > 1) { CREATION.stats[stat]--; CREATION.points++; renderCreation(); }
        };
        plusBtn.onclick = () => {
          if (CREATION.points > 0) { CREATION.stats[stat]++; CREATION.points--; renderCreation(); }
        };
        refs.creationStatList.appendChild(row);
      });

      refs.creationPoints.textContent = CREATION.points;
      const previewStats = classAdjustedStats(CREATION.stats, CREATION.className);
      refs.previewEmoji.textContent = CLASS_DATA[CREATION.className].emoji;
      refs.previewName.textContent = refs.heroName.value.trim() || 'Aventurier';
      refs.previewClass.textContent = CREATION.className;
      refs.previewFor.textContent = previewStats.FOR;
      refs.previewRap.textContent = previewStats.RAP;
      refs.previewCon.textContent = previewStats.CON;
      refs.previewMana.textContent = previewStats.MANA;
      refs.classBonuses.innerHTML = CLASS_DATA[CREATION.className].bonuses.map((b) => `<li>${b}</li>`).join('');
      refs.confirmCreateBtn.disabled = !refs.heroName.value.trim();
    }

    function addCreatedHero() {
      const pseudo = refs.heroName.value.trim();
      if (!pseudo) return;
      const finalStats = classAdjustedStats(CREATION.stats, CREATION.className);
      const inventory = createStartingGear(CREATION.className);
      const hero = {
        id: uid(),
        name: pseudo,
        className: CREATION.className,
        emoji: CLASS_DATA[CREATION.className].emoji,
        level: 1,
        xp: 0,
        xpNext: 100,
        stats: finalStats,
        hp: 1,
        maxHp: 1,
        mana: 1,
        maxMana: 1,
        inventory,
        equipment: {
          weapon: inventory.find((item) => item.slot === 'weapon') || null,
          armor: inventory.find((item) => item.slot === 'armor') || null,
        },
        defending: false,
      };
      syncHeroCaps(hero, true);
      GAME.party.push(hero);
      closeCreationModal();
      renderSetupParty();
    }


    function openLevelUpModal(hero) {
      GAME.isLevelingUp = true;
      refs.modalOverlay.classList.add('show');
      refs.levelupModal.classList.add('show');
      const classColors = {
  Guerrier: "#e74c3c",
  Mage: "#3498db",
  Assassin: "#9b59b6",
  Gardien: "#16a085"
};

const color = classColors[hero.className] || "#f1c40f";

refs.levelupText.innerHTML = `
  <span class="lvlup-hero" style="color:${color}">
    ${hero.emoji} ${hero.name.toUpperCase()} (${hero.className})
  </span>
  <br>
  <span class="lvlup-sub">
    monte au niveau ${hero.level}
  </span>
  <br><br>
  Choisis 2 améliorations
`;
      refs.levelupChoices.innerHTML = '';
      let picksLeft = 2;

      ['FOR', 'RAP', 'CON', 'MANA'].forEach((stat) => {
        const btn = document.createElement('button');
        btn.className = 'class-btn';
        btn.textContent = `${stat} +1`;
        btn.onclick = () => {
          hero.stats[stat] += 1;
          picksLeft -= 1;
          syncHeroCaps(hero, true);
          renderGame();
          if (picksLeft <= 0) {
            closeLevelUpModal();
            setTimeout(() => {
              processNextLevelUp();
            }, 500);
          } else {
            btn.disabled = true;
          }
        };
        refs.levelupChoices.appendChild(btn);
      });
    }

    function closeLevelUpModal() {
      refs.modalOverlay.classList.remove('show');
      refs.levelupModal.classList.remove('show');
      refs.levelupChoices.innerHTML = '';
      GAME.isLevelingUp = false;
      saveGameState();
    }

    function processNextLevelUp() {
      if (GAME.pendingLevelUps.length) {
        const nextHero = GAME.pendingLevelUps.shift();
        openLevelUpModal(nextHero);
      } else {
        renderGame();
      }
    }

    function beginGame() {
      ensureSetupBag();
      GAME.sharedBag = clone(GAME.setupSharedBag);
      GAME.started = true;
      GAME.displayHeroIndex = 0;
      GAME.activeHeroIndex = 0;
      GAME.selectedItemId = GAME.sharedBag[0]?.id || null;
      GAME.selectedEquipmentId = getDisplayedHero()?.equipment.weapon?.id || getDisplayedHero()?.equipment.armor?.id || null;
      refs.setupScreen.classList.add('hidden');
      refs.gameScreen.classList.remove('hidden');
      if (refs.log) refs.log.innerHTML = '';
      addLog(`L'équipe entre dans le donjon avec <strong>${GAME.party.length}</strong> héros.`, 'critical');
      addLog('Hors combat, clique sur les carrés à gauche pour changer le héros affiché.', 'info');
      renderGame();
      saveGameState();
    }

    function continueSavedGame() {
      const save = getSavedRun();
      if (!save?.started) return;
      hydrateGameState(save);
      refs.setupScreen.classList.add('hidden');
      refs.gameScreen.classList.remove('hidden');
      if (refs.log) refs.log.innerHTML = '';
      addLog('La compagnie reprend sa progression dans le donjon.', 'info');
      renderGame();
      if (GAME.isResting && GAME.restEndsAt) {
        resumeRest();
      } else if (GAME.pendingLevelUps.length) {
        processNextLevelUp();
      }
    }

    function setDisplayedHero(index) {
      if (index < 0 || index >= GAME.party.length) return;
      if (GAME.inCombat) return;
      GAME.displayHeroIndex = index;
      const hero = getDisplayedHero();
      GAME.selectedEquipmentId = hero?.equipment.weapon?.id || hero?.equipment.armor?.id || null;
      GAME.selectedItemId = GAME.sharedBag[0]?.id || null;
      renderGame();
    }


    function showTurnPopup(hero) {
      const el = document.getElementById('turn-popup');
      if (!el || !hero || !GAME.inCombat) return;

      el.innerHTML = `Tour de&nbsp;<span class="turn-name">${hero.name.toUpperCase()}</span> ${hero.emoji}`;

      el.classList.remove('hidden');

      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'turnFade 1.2s forwards';

      setTimeout(() => {
        el.classList.add('hidden');
      }, 1200);
    }

    function setActiveHero(index, announce = true) {
      if (index < 0 || index >= GAME.party.length) return;
      GAME.activeHeroIndex = index;
      GAME.displayHeroIndex = index;
      const hero = getActiveHero();
      showTurnPopup(hero);
      if (announce) addLog(`Tour actuel : <strong>${hero.name}</strong>.`, 'info');
      renderGame();
    }

    function renderTeamScroll() {
      refs.teamScroll.innerHTML = '';
      GAME.party.forEach((hero, index) => {
        const card = document.createElement('div');
        card.className = 'team-card';
        const planned = GAME.pendingActions.some((action) => action.heroId === hero.id);
        if (index === GAME.displayHeroIndex) card.classList.add('selected');
        if (GAME.inCombat && index === GAME.activeHeroIndex) card.classList.add('active-turn');
        if (GAME.inCombat && planned) card.classList.add('planned');
        if (hero.hp <= 0) card.classList.add('dead');
        card.innerHTML = `
          <div class="small-emoji">${hero.emoji}</div>
        `;
        card.onclick = () => setDisplayedHero(index);
        refs.teamScroll.appendChild(card);
      });
    }

    function renderCombatHud() {
      if (!GAME.inCombat) {
        refs.combatPlanTitle.textContent = '';
        refs.combatLastTitle.textContent = '';
        refs.combatPlan.innerHTML = '&nbsp;';
        refs.combatLastAction.innerHTML = '&nbsp;';
        return;
      }

      refs.combatPlanTitle.textContent = 'Action précédente';
      refs.combatLastTitle.textContent = 'Action ennemie';
      const displayedHero = getDisplayedHero();
      const heroAction = displayedHero ? GAME.lastRoundHeroActions[displayedHero.id] : null;
      refs.combatPlan.innerHTML = formatCombatActionCard(heroAction, false);
      refs.combatLastAction.innerHTML = formatCombatActionCard(GAME.lastEnemyAction, true);
    }

    function formatCombatActionCard(action, enemySide = false) {
      if (!action) return '&nbsp;';
      const valueClass = action.critical ? 'combat-action-value is-crit' : 'combat-action-value';
      return `
        <div class="combat-action-content">
          <span class="combat-action-label">${action.label}</span>
          <span class="${valueClass}">${action.value}</span>
        </div>
      `;
    }

    function actionLabelForType(hero, type) {
      return {
        attack: 'Attaque',
        heavy: 'Attaque puissante',
        block: 'Encaisser',
        skill: hero ? CLASS_DATA[hero.className].skillName : 'Compétence',
      }[type] || type;
    }

    function renderCombatStatPanels() {
      const hero = getDisplayedHero();
      if (!hero) {
        refs.combatPlayerStats.innerHTML = '';
        refs.combatEnemyStats.innerHTML = '';
        return;
      }

      const heroDerived = getHeroDerived(hero);
      refs.combatPlayerStats.innerHTML = `
        <div class="combat-panel-title">Héros actif</div>
        <div class="combat-stat-line"><strong>Classe</strong><span>${hero.className}</span></div>
        <div class="combat-stat-line"><strong>Niveau</strong><span>${hero.level}</span></div>
        <div class="combat-stat-spacer"></div>
        <div class="combat-stat-line"><strong>FOR</strong><span>${hero.stats.FOR}</span></div>
        <div class="combat-stat-line"><strong>RAP</strong><span>${hero.stats.RAP}</span></div>
        <div class="combat-stat-line"><strong>CON</strong><span>${hero.stats.CON}</span></div>
        <div class="combat-stat-line"><strong>MANA</strong><span>${hero.stats.MANA}</span></div>
        <div class="combat-stat-spacer"></div>
        <div class="combat-stat-line is-atk"><strong>ATK</strong><span>${heroDerived.atk}</span></div>
        <div class="combat-stat-line is-def"><strong>DEF</strong><span>${heroDerived.def}</span></div>
        <div class="combat-stat-line is-crit"><strong>CRIT</strong><span>${heroDerived.crit}%</span></div>
        <div class="combat-stat-line is-esq"><strong>ESQ</strong><span>${heroDerived.evasion}%</span></div>
      `;

      const enemy = GAME.currentEnemy;
      if (!enemy) {
        refs.combatEnemyStats.innerHTML = `
          <div class="combat-panel-title">Menace</div>
          <div class="combat-stat-note">Aucun ennemi présent. L'exploration continue.</div>
        `;
        return;
      }

      refs.combatEnemyStats.innerHTML = `
        <div class="combat-panel-title">Ennemi</div>
        <div class="combat-stat-line"><strong>Type</strong><span>${enemy.name}</span></div>
        <div class="combat-stat-line"><strong>Niveau</strong><span>${enemy.level}</span></div>
        <div class="combat-stat-spacer"></div>
        <div class="combat-stat-line is-atk"><strong>Dégâts</strong><span>${enemy.dmgMin}-${enemy.dmgMax}</span></div>
        <div class="combat-stat-line is-def"><strong>PV restants</strong><span>${Math.max(0, Math.ceil(enemy.hp))}</span></div>
        <div class="combat-stat-spacer"></div>
        <div class="combat-stat-note">${enemy.description || 'Une créature du donjon se dresse devant vous.'}</div>
      `;
    }

    function renderCombatBonusPanels() {
      const hero = getDisplayedHero();
      if (!GAME.inCombat || !hero) {
        refs.combatPlayerBonusText.innerHTML = 'Aucun bonus<br>Aucun malus';
        refs.combatEnemyBonusText.innerHTML = 'Aucun bonus<br>Aucun malus';
        return;
      }

      const heroBonus = [];
      const heroMalus = [];
      if (hero.defending) heroBonus.push('Posture défensive active');
      if (hero.hp <= hero.maxHp * 0.3) heroMalus.push('PV critiques');
      if (hero.mana < CLASS_DATA[hero.className].skillCost) heroMalus.push('Mana insuffisant');
      refs.combatPlayerBonusText.innerHTML = `${heroBonus[0] || 'Aucun bonus'}<br>${heroMalus[0] || 'Aucun malus'}`;

      const enemyBonus = [];
      const enemyMalus = [];
      if (GAME.currentEnemy?.boss) enemyBonus.push('Boss');
      if ((GAME.currentEnemy?.guardBreakTurns || 0) > 0) enemyMalus.push(`Dégâts réduits ${GAME.currentEnemy.guardBreakTurns} tour(s)`);
      refs.combatEnemyBonusText.innerHTML = `${enemyBonus[0] || 'Aucun bonus'}<br>${enemyMalus[0] || 'Aucun malus'}`;
    }

    function renderExplorationHud() {
      const hero = getDisplayedHero();
      if (!hero) {
        refs.explorationSidebar.innerHTML = `
          <h2>Personnage</h2>
          <div class="combat-stat-note">Aucun héros sélectionné.</div>
        `;
        return;
      }

      const derived = getHeroDerived(hero);
      refs.explorationSidebar.innerHTML = `
        <h2>Personnage</h2>
        <div class="character-block-title">Barre de vie</div>
        <div class="health-bar-container"><div class="health-bar" style="width:${Math.max(0, hero.hp) / hero.maxHp * 100}%"></div></div>
        <div class="character-block-title">Barre d'énergie</div>
        <div class="mana-bar-container"><div class="mana-bar" style="width:${Math.max(0, hero.mana) / hero.maxMana * 100}%"></div></div>
        <div class="character-stat-list">
          <div class="character-stat-row"><strong>FOR:</strong><span>${hero.stats.FOR}</span></div>
          <div class="character-stat-row"><strong>RAP:</strong><span>${hero.stats.RAP}</span></div>
          <div class="character-stat-row"><strong>CON:</strong><span>${hero.stats.CON}</span></div>
          <div class="character-stat-row"><strong>MANA:</strong><span>${hero.stats.MANA}</span></div>
        </div>
        <hr class="character-stat-divider">
        <div class="character-stat-list">
          <div class="character-stat-row"><strong>ATK</strong><span>${derived.atk}</span></div>
          <div class="character-stat-row"><strong>DEF</strong><span>${derived.def}</span></div>
          <div class="character-stat-row"><strong>CRIT</strong><span>${derived.crit}%</span></div>
          <div class="character-stat-row"><strong>ESQ</strong><span>${derived.evasion}%</span></div>
        </div>
        <hr class="character-stat-divider">
        <div class="character-room-note"><strong>Salles franchies:</strong> ${GAME.roomsCleared}</div>
      `;
    }

    function renderDisplayedHeroPanel() {
      const hero = getDisplayedHero();
      if (!hero) return;
      refs.playerCard.classList.toggle('player-focus', GAME.inCombat);
      document.getElementById('player-battle-emoji').textContent = hero.emoji;
      document.getElementById('player-battle-name').textContent = `${hero.name} (niv.${hero.level})`;
      document.getElementById('player-battle-sub').textContent = GAME.inCombat ? `${hero.className} — tour ${(GAME.activeHeroIndex + 1)}/${GAME.party.length}` : `${hero.className} prêt au combat`;
      document.getElementById('player-status-chip').textContent = GAME.inCombat ? 'Choix d’action' : 'Exploration';

      document.getElementById('player-card-hp').textContent = `${Math.max(0, Math.ceil(hero.hp))} / ${hero.maxHp}`;
      document.getElementById('player-card-hp-inline').textContent = `PV ${Math.max(0, Math.ceil(hero.hp))} / ${hero.maxHp}`;
      document.getElementById('player-card-hp-bar').style.width = `${Math.max(0, hero.hp) / hero.maxHp * 100}%`;
      document.getElementById('player-card-hp-bar-explore').style.width = `${Math.max(0, hero.hp) / hero.maxHp * 100}%`;
      document.getElementById('player-card-mana').textContent = `${Math.max(0, Math.ceil(hero.mana))} / ${hero.maxMana}`;
      document.getElementById('player-card-mana-inline').textContent = `Énergie ${Math.max(0, Math.ceil(hero.mana))} / ${hero.maxMana}`;
      document.getElementById('player-card-mana-bar').style.width = `${Math.max(0, hero.mana) / hero.maxMana * 100}%`;
      document.getElementById('player-card-mana-bar-explore').style.width = `${Math.max(0, hero.mana) / hero.maxMana * 100}%`;

      refs.skillLabel.textContent = `${CLASS_DATA[hero.className].skillName} (${CLASS_DATA[hero.className].skillCost} mana)`;
    }

    function renderEnemySection() {
      const enemy = GAME.currentEnemy;
      const hpText = document.getElementById('enemy-hp-text');
      const hpBar = document.getElementById('enemy-hp-bar');
      const energyText = document.getElementById('enemy-energy-text');
      const energyBar = document.getElementById('enemy-energy-bar');
      const name = document.getElementById('enemy-name');
      const sprite = document.getElementById('enemy-sprite');
      const sub = document.getElementById('enemy-sub');
      const chip = document.getElementById('enemy-status-chip');
      refs.enemyCard.classList.toggle('enemy-focus', !!enemy);
      if (enemy) {
        const enemyEnergy = enemy.mana ?? 0;
        const enemyMaxEnergy = enemy.maxMana ?? enemy.maxEnergy ?? 0;
        name.textContent = `${enemy.name} (niv.${enemy.level || 0})`;
        sprite.textContent = enemy.sprite;
        hpText.textContent = `${Math.max(0, Math.ceil(enemy.hp))} / ${enemy.maxHp}`;
        document.getElementById('enemy-hp-inline').textContent = `PV ${Math.max(0, Math.ceil(enemy.hp))} / ${enemy.maxHp}`;
        hpBar.style.width = `${Math.max(0, enemy.hp) / enemy.maxHp * 100}%`;
        document.getElementById('enemy-hp-bar-explore').style.width = `${Math.max(0, enemy.hp) / enemy.maxHp * 100}%`;
        energyText.textContent = enemyMaxEnergy ? `${Math.max(0, Math.ceil(enemyEnergy))} / ${enemyMaxEnergy}` : '—';
        document.getElementById('enemy-energy-inline').textContent = enemyMaxEnergy ? `Énergie ${Math.max(0, Math.ceil(enemyEnergy))} / ${enemyMaxEnergy}` : 'Énergie —';
        energyBar.style.width = enemyMaxEnergy ? `${Math.max(0, enemyEnergy) / enemyMaxEnergy * 100}%` : '0%';
        document.getElementById('enemy-energy-bar-explore').style.width = enemyMaxEnergy ? `${Math.max(0, enemyEnergy) / enemyMaxEnergy * 100}%` : '0%';
        sub.textContent = enemy.description || `Niveau ennemi ${enemy.level}`;
        chip.textContent = GAME.inCombat ? 'Combat en cours' : 'Présence hostile';
      } else {
        name.textContent = 'Porte du Donjon (niv.0)';
        sprite.textContent = '🏰';
        hpText.textContent = '—';
        document.getElementById('enemy-hp-inline').textContent = 'PV —';
        hpBar.style.width = '0%';
        document.getElementById('enemy-hp-bar-explore').style.width = '0%';
        energyText.textContent = '—';
        document.getElementById('enemy-energy-inline').textContent = 'Énergie —';
        energyBar.style.width = '0%';
        document.getElementById('enemy-energy-bar-explore').style.width = '0%';
        sub.textContent = 'Une aventure t’attend';
        chip.textContent = 'Exploration';
      }
    }

    function renderEquipment() {
      const hero = getDisplayedHero();
      refs.equipmentList.innerHTML = '';
      if (!hero) return;
      const equipped = [hero.equipment.weapon, hero.equipment.armor].filter(Boolean);
      if (!equipped.length) {
        refs.equipmentList.innerHTML = '<div class="item-row"><div class="item-name">Aucun équipement</div><div class="item-meta">Ce héros n’a rien d’équipé.</div></div>';
        refs.btnDropEquipped.disabled = true;
        return;
      }
      equipped.forEach((item) => {
        const row = document.createElement('div');
        row.className = `item-row ${item.id === GAME.selectedEquipmentId ? 'selected' : ''}`;
        row.innerHTML = `
          <div class="item-name">${item.icon || '📦'} ${item.name}</div>
          <div class="item-meta">${item.rarity || 'Objet'}<br>${itemDescription(item) || 'Aucun bonus affiché'}</div>
        `;
        row.onclick = () => {
          GAME.selectedEquipmentId = item.id;
          renderEquipment();
        };
        refs.equipmentList.appendChild(row);
      });
      refs.btnDropEquipped.disabled = GAME.isLevelingUp;
    }

    function renderBag() {
      refs.inventoryList.innerHTML = '';
      if (!GAME.sharedBag.length) {
        refs.inventoryList.innerHTML = '<div class="item-row"><div class="item-name">Sac vide</div><div class="item-meta">Aucun objet partagé.</div></div>';
        refs.btnUseItem.disabled = true;
        refs.btnEquipItem.disabled = true;
        refs.btnDropItem.disabled = true;
        return;
      }
      GAME.sharedBag.forEach((item) => {
        const row = document.createElement('div');
        row.className = `item-row ${item.id === GAME.selectedItemId ? 'selected' : ''}`;
        const quantity = item.stackable ? ` x${item.quantity}` : '';
        row.innerHTML = `
          <div class="item-name">${item.icon || '📦'} ${item.name}${quantity}</div>
          <div class="item-meta">${item.rarity || 'Objet'}<br>${itemDescription(item) || 'Aucun bonus affiché'}</div>
        `;
        row.onclick = () => {
          GAME.selectedItemId = item.id;
          renderBag();
        };
        refs.inventoryList.appendChild(row);
      });

      const selected = GAME.sharedBag.find((item) => item.id === GAME.selectedItemId);
      refs.btnUseItem.disabled = !selected || selected.type !== 'consumable' || GAME.inCombat || GAME.isResolvingRound || GAME.isLevelingUp;
      refs.btnEquipItem.disabled = !selected || !['weapon', 'armor'].includes(selected.type) || GAME.inCombat || GAME.isResolvingRound || GAME.isLevelingUp;
      refs.btnDropItem.disabled = !selected || GAME.inCombat || GAME.isResolvingRound || GAME.isLevelingUp;
    }

    function renderGame() {
      renderTeamScroll();
      renderDisplayedHeroPanel();
      renderEnemySection();
      renderCombatStatPanels();
      renderCombatBonusPanels();
      renderExplorationHud();
      renderEquipment();
      renderBag();
      renderCombatHud();
      refs.btnExplore.disabled = GAME.inCombat || GAME.isResting || GAME.isResolvingRound || GAME.isLevelingUp;
      refs.btnRest.disabled = GAME.inCombat || GAME.isResting || GAME.isResolvingRound || GAME.isLevelingUp;
      refs.gameScreen.classList.toggle('in-combat', GAME.inCombat);
      document.getElementById('exploration-controls').classList.toggle('hidden', GAME.inCombat);
      document.getElementById('combat-controls').classList.toggle('hidden', !GAME.inCombat);
      refs.explorationHud.classList.add('hidden');
      refs.combatActions.classList.remove('hidden');
      saveGameState();
    }

    function stackOrPush(item) {
      const existing = GAME.sharedBag.find((entry) => entry.name === item.name && entry.type === item.type && entry.stackable);
      if (existing) {
        existing.quantity += item.quantity || 1;
        return existing;
      }
      const cloneItem = { ...clone(item), id: uid() };
      GAME.sharedBag.push(cloneItem);
      return cloneItem;
    }

    function removeSharedBagItem(itemId, quantity = 1) {
      const idx = GAME.sharedBag.findIndex((entry) => entry.id === itemId);
      if (idx === -1) return;
      const item = GAME.sharedBag[idx];
      if (item.stackable) {
        item.quantity -= quantity;
        if (item.quantity <= 0) GAME.sharedBag.splice(idx, 1);
      } else {
        GAME.sharedBag.splice(idx, 1);
      }
      GAME.selectedItemId = GAME.sharedBag[0]?.id || null;
    }

    function dropEquippedItem() {
      const hero = getDisplayedHero();
      if (!hero || GAME.inCombat || GAME.isResolvingRound) return;
      let dropped = null;
      if (hero.equipment.weapon?.id === GAME.selectedEquipmentId) {
        dropped = hero.equipment.weapon;
        hero.equipment.weapon = null;
      } else if (hero.equipment.armor?.id === GAME.selectedEquipmentId) {
        dropped = hero.equipment.armor;
        hero.equipment.armor = null;
      }
      if (!dropped) return;
      hero.inventory = hero.inventory.filter((item) => item.id !== dropped.id);
      syncHeroCaps(hero, false);
      addLog(`${hero.name} jette <strong>${dropped.name}</strong>.`, 'loss');
      GAME.selectedEquipmentId = hero.equipment.weapon?.id || hero.equipment.armor?.id || null;
      renderGame();
    }

    function dropBagItem() {
      if (GAME.inCombat || GAME.isResolvingRound) return;
      const item = GAME.sharedBag.find((entry) => entry.id === GAME.selectedItemId);
      if (!item) return;
      addLog(`Tu jettes <strong>${item.name}</strong> du sac commun.`, 'loss');
      removeSharedBagItem(item.id, item.stackable ? 1 : item.quantity || 1);
      renderGame();
    }

    function useBagItem() {
      if (GAME.inCombat || GAME.isResolvingRound) return;
      const item = GAME.sharedBag.find((entry) => entry.id === GAME.selectedItemId);
      const hero = getDisplayedHero();
      if (!item || !hero || item.type !== 'consumable') return;

      if (item.heal) {
        const oldHp = hero.hp;
        hero.hp = Math.min(hero.maxHp, hero.hp + item.heal);
        addLog(`${hero.name} utilise ${item.name} : <strong>+${Math.ceil(hero.hp - oldHp)} PV</strong>.`, 'gain');
      }
      if (item.manaRestore) {
        const oldMana = hero.mana;
        hero.mana = Math.min(hero.maxMana, hero.mana + item.manaRestore);
        addLog(`${hero.name} récupère <strong>${Math.ceil(hero.mana - oldMana)} mana</strong>.`, 'gain');
      }
      removeSharedBagItem(item.id, 1);
      renderGame();
    }

    function equipFromBag() {
      if (GAME.inCombat || GAME.isResolvingRound) return;
      const hero = getDisplayedHero();
      const item = GAME.sharedBag.find((entry) => entry.id === GAME.selectedItemId);
      if (!hero || !item || !['weapon', 'armor'].includes(item.type)) return;

      if (item.type === 'weapon' && hero.equipment.weapon) {
        stackOrPush(hero.equipment.weapon);
        hero.inventory = hero.inventory.filter((entry) => entry.id !== hero.equipment.weapon.id);
      }
      if (item.type === 'armor' && hero.equipment.armor) {
        stackOrPush(hero.equipment.armor);
        hero.inventory = hero.inventory.filter((entry) => entry.id !== hero.equipment.armor.id);
      }

      removeSharedBagItem(item.id, 1);
      const equipped = { ...clone(item), id: uid(), quantity: 1, stackable: false };
      hero.inventory.push(equipped);
      if (item.type === 'weapon') hero.equipment.weapon = equipped;
      if (item.type === 'armor') hero.equipment.armor = equipped;

      syncHeroCaps(hero, false);
      GAME.selectedEquipmentId = equipped.id;
      addLog(`${hero.name} équipe <strong>${equipped.name}</strong>.`, 'gain');
      renderGame();
    }

    function startCombat() {
      const referenceLevel = Math.max(...GAME.party.map((hero) => hero.level));
      const pool = BESTIARY.filter((e) => e.level <= referenceLevel + 1 && !e.boss);
      const template = (GAME.roomsCleared > 0 && GAME.roomsCleared % 10 === 0)
        ? BESTIARY.find((e) => e.boss)
        : pool[Math.floor(Math.random() * pool.length)];

      GAME.currentEnemy = clone(template);
      GAME.currentEnemy.maxHp = template.hp + GAME.roomsCleared * 3 + referenceLevel * 4;
      GAME.currentEnemy.hp = GAME.currentEnemy.maxHp;
      GAME.currentEnemy.dmgMin += Math.floor(GAME.roomsCleared / 4);
      GAME.currentEnemy.dmgMax += Math.floor(GAME.roomsCleared / 3);
      GAME.currentEnemy.description = GAME.currentEnemy.boss ? 'Le boss du palier te défie.' : `Un ennemi du donjon surgit à la salle ${GAME.roomsCleared}.`;
      GAME.inCombat = true;
      GAME.pendingActions = [];
      GAME.lastRoundHeroActions = {};
      GAME.lastEnemyAction = '';
      GAME.heroesChosenThisRound = 0;
      GAME.party.forEach((hero) => hero.defending = false);
      addLog(`Un <strong>${GAME.currentEnemy.name}</strong> bloque la route de l'équipe !`, 'loss');
      setActiveHero(getAliveIndexes()[0] || 0, true);
    }

    function planAction(type) {
      if (!GAME.inCombat || GAME.isResolvingRound) return;
      const hero = getActiveHero();
      if (!hero || hero.hp <= 0) return;

      GAME.pendingActions.push({
        heroId: hero.id,
        type,
      });

      const actionName = {
        attack: 'Attaque',
        heavy: 'Attaque puissante',
        block: 'Encaisser',
        skill: CLASS_DATA[hero.className].skillName,
      }[type] || type;

      addLog(`${hero.name} prépare : <strong>${actionName}</strong>.`, 'info');
      GAME.heroesChosenThisRound += 1;

      const alive = getAliveIndexes();
      if (GAME.heroesChosenThisRound >= alive.length) {
        resolveTeamRound();
      } else {
        const next = alive.find((idx) => idx > GAME.activeHeroIndex) ?? alive[0];
        setActiveHero(next, true);
      }
    }

    async function resolveTeamRound() {
      GAME.isResolvingRound = true;
      GAME.lastRoundHeroActions = {};
      GAME.lastEnemyAction = '';
      renderGame();
      addLog('<strong>Résolution du tour du groupe…</strong>', 'critical');

      for (const planned of GAME.pendingActions) {
        if (!GAME.currentEnemy || GAME.currentEnemy.hp <= 0) break;
        const hero = GAME.party.find((entry) => entry.id === planned.heroId);
        if (!hero || hero.hp <= 0) continue;
        await executeHeroAction(hero, planned.type);
      }

      GAME.pendingActions = [];
      GAME.heroesChosenThisRound = 0;

      if (GAME.currentEnemy && GAME.currentEnemy.hp > 0) {
        await enemyTurn();
      }

      if (GAME.currentEnemy && GAME.currentEnemy.hp <= 0) {
        victory();
      } else {
        const alive = getAliveIndexes();
        if (alive.length) setActiveHero(alive[0], true);
      }

      GAME.isResolvingRound = false;
      renderGame();
    }

    async function executeHeroAction(hero, type) {
      GAME.displayHeroIndex = GAME.party.findIndex((entry) => entry.id === hero.id);
      renderGame();
      await wait(250);

      const derived = getHeroDerived(hero);

      if (type === 'block') {
        hero.defending = true;
        GAME.lastRoundHeroActions[hero.id] = { label: 'Encaisser', value: 'Garde active', critical: false };
        addLog(`${hero.name} se prépare à encaisser.`, 'info');
        return;
      }

      if (type === 'skill') {
        const cost = CLASS_DATA[hero.className].skillCost;
        if (hero.mana < cost) {
          addLog(`${hero.name} n'a pas assez de mana. Il attaque normalement à la place.`, 'loss');
          type = 'attack';
        } else {
          hero.mana -= cost;
        }
      }

      let hitChance = 88;
      let baseDamage = roll(Math.max(1, derived.atk - 4), derived.atk + 3);
      let critBonus = false;

      if (type === 'heavy') {
        hitChance = 65;
        baseDamage = roll(derived.atk + 1, derived.atk + 11);
      }

      if (type === 'skill') {
        if (hero.className === 'Guerrier') {
          baseDamage = roll(derived.atk + 4, derived.atk + 10);
          hero.defending = true;
        }
        if (hero.className === 'Mage') {
          baseDamage = roll(derived.atk + 8, derived.atk + 18) + Math.floor(hero.stats.MANA * 1.4);
        }
        if (hero.className === 'Assassin') {
          baseDamage = Math.floor(roll(derived.atk + 5, derived.atk + 13) * 1.2);
          const realCrit = roll(1, 100) <= derived.crit;
          if (realCrit) {
            baseDamage = Math.floor(baseDamage * 1.5);
            critBonus = true;
          }
        }
        if (hero.className === 'Gardien') {
          baseDamage = roll(derived.atk + 1, derived.atk + 6);
          GAME.currentEnemy.guardBreakTurns = 2;
          GAME.currentEnemy.guardBreakAmount = Math.max(2, Math.floor(hero.level / 2) + 2);
          hero.defending = true;
        }
      } else if (roll(1, 100) <= derived.crit) {
        critBonus = true;
        baseDamage = Math.floor(baseDamage * 1.5);
      }

      if (type !== 'skill' && roll(1, 100) > hitChance) {
        GAME.lastRoundHeroActions[hero.id] = { label: actionLabelForType(hero, type), value: 'Raté', critical: false };
        addLog(`${hero.name} rate son attaque !`, 'info');
        return;
      }

      const finalDamage = Math.max(1, baseDamage - Math.floor((GAME.currentEnemy.level || 1) / 2));
      GAME.currentEnemy.hp = Math.max(0, GAME.currentEnemy.hp - finalDamage);

      const actionLabel = actionLabelForType(hero, type);

      GAME.lastRoundHeroActions[hero.id] = { label: actionLabel, value: `${finalDamage} dégâts`, critical: critBonus };
      addLog(`${hero.name} utilise <strong>${actionLabel}</strong> et inflige <strong>${finalDamage}</strong> dégâts.${critBonus ? ' <span class="critical">CRITIQUE !</span>' : ''}`, critBonus ? 'critical' : '');
      if (type === 'skill' && hero.className === 'Gardien') {
        addLog(`${GAME.currentEnemy.name} est ébranlé : ses dégâts sont réduits pendant <strong>2 tours</strong>.`, 'info');
      }
      shakeElement(refs.enemyCard);
      renderEnemySection();
      await wait(320);
    }

    async function enemyTurn() {
      const aliveIndexes = getAliveIndexes();
      if (!aliveIndexes.length || !GAME.currentEnemy || GAME.currentEnemy.hp <= 0) return;

      const targetIndex = aliveIndexes[Math.floor(Math.random() * aliveIndexes.length)];
      const hero = GAME.party[targetIndex];
      GAME.displayHeroIndex = targetIndex;
      renderGame();
      await wait(250);

      const derived = getHeroDerived(hero);
      if (roll(1, 100) <= derived.evasion) {
        GAME.lastEnemyAction = { label: `${GAME.currentEnemy.name} attaque`, value: 'Esquivée', critical: false };
        addLog(`${hero.name} esquive l’attaque de ${GAME.currentEnemy.name} !`, 'info');
        return;
      }

      let damage = roll(GAME.currentEnemy.dmgMin, GAME.currentEnemy.dmgMax);
      if (GAME.currentEnemy.guardBreakTurns > 0) {
        damage = Math.max(1, damage - (GAME.currentEnemy.guardBreakAmount || 0));
      }
      damage = Math.max(1, damage - Math.floor(derived.def / 3));
      if (hero.defending) {
        damage = Math.max(1, Math.floor(damage * 0.45));
        addLog(`${hero.name} encaisse une partie du choc grâce à sa défense.`, 'info');
        hero.defending = false;
      }
      if (GAME.currentEnemy.guardBreakTurns > 0) {
        GAME.currentEnemy.guardBreakTurns -= 1;
        if (GAME.currentEnemy.guardBreakTurns <= 0) {
          GAME.currentEnemy.guardBreakAmount = 0;
        }
      }

      hero.hp = Math.max(0, hero.hp - damage);
      GAME.lastEnemyAction = { label: `${GAME.currentEnemy.name} → ${hero.name}`, value: `${damage} dégâts`, critical: false };
      addLog(`${GAME.currentEnemy.name} inflige <strong>${damage}</strong> dégâts à <strong>${hero.name}</strong> !`, 'loss');
      shakeElement(refs.playerCard);
      renderGame();

      if (!getAliveHeroes().length) {
        gameOver();
      }
      await wait(320);
    }

    function victory() {
      const enemy = GAME.currentEnemy;
      GAME.inCombat = false;
      GAME.currentEnemy = null;
      addLog(`${enemy.name} est vaincu ! <strong>+${enemy.xp} XP</strong> pour toute l’équipe.`, 'gain');
      GAME.party.filter((hero) => hero.hp > 0).forEach((hero) => {
        hero.xp += enemy.xp;
        tryLevelUp(hero);
      });
      rollLoot(enemy);
      renderGame();
      if (GAME.pendingLevelUps.length && !GAME.isLevelingUp) {
        processNextLevelUp();
      }
    }

    function tryLevelUp(hero) {
      let leveled = false;
      while (hero.xp >= hero.xpNext) {
        hero.xp -= hero.xpNext;
        hero.level += 1;
        hero.xpNext = Math.floor(hero.xpNext * 1.4);
        syncHeroCaps(hero, true);
        addLog(`<strong>${hero.name}</strong> monte niveau ${hero.level} !`, 'critical');
        GAME.pendingLevelUps.push(hero);
        leveled = true;
      }
      return leveled;
    }

    function gameOver() {
      GAME.inCombat = false;
      GAME.currentEnemy = null;
      addLog('<strong>Toute l’équipe a succombé dans le donjon.</strong>', 'loss');
      renderGame();
    }

    function rollLoot(enemy) {
      const rolls = Math.max(1, Math.ceil(GAME.party.length / 2));
      const drops = [];
      for (let i = 0; i < rolls; i++) {
        const r = roll(1, 100);
        if (r <= 38) {
          drops.push({ name: 'Potion de soin', type: 'consumable', stackable: true, quantity: 1, heal: 35 + Math.max(1, GAME.party[0]?.level || 1) * 3, effectText: 'Restaure des PV', icon: '🧪' });
        } else if (r <= 60) {
          drops.push({ name: 'Potion de mana', type: 'consumable', stackable: true, quantity: 1, manaRestore: 30, effectText: 'Restaure 30 mana', icon: '🔵' });
        } else if (r <= 80) {
          drops.push(clone(WEAPONS[Math.floor(Math.random() * WEAPONS.length)]));
        } else {
          drops.push(clone(ARMORS[Math.floor(Math.random() * ARMORS.length)]));
        }
      }
      if (enemy.boss) drops.push(clone(WEAPONS[Math.min(WEAPONS.length - 1, 4)]));

      drops.forEach((item) => {
        if (item.stackable) stackOrPush(item);
        else GAME.sharedBag.push({ ...item, id: uid(), quantity: 1 });
      });

      addLog(`<strong>Butin récupéré :</strong><br>${drops.map((item) => `${item.icon || '📦'} ${item.name}`).join('<br>')}`, 'loot');
      GAME.selectedItemId = GAME.sharedBag[0]?.id || null;
    }

    function explore() {
      if (GAME.inCombat || GAME.isResting || GAME.isLevelingUp) return;
      GAME.roomsCleared += 1;
      const eventRoll = roll(1, 100);
      if (eventRoll <= 64) return startCombat();
      if (eventRoll <= 84) {
        findTreasure();
        renderGame();
        return;
      }
      trapEvent();
      renderGame();
    }

    function findTreasure() {
      const bonusRoll = roll(1, 100);
      addLog('L’équipe découvre un coffre mystérieux.', 'info');
      if (bonusRoll <= 50) {
        stackOrPush({ name: 'Potion de soin', type: 'consumable', stackable: true, quantity: 2, heal: 35, effectText: 'Restaure 35 PV', icon: '🧪' });
        addLog('Le coffre contient <strong>2 Potions de soin</strong>.', 'gain');
      } else if (bonusRoll <= 70) {
        stackOrPush({ name: 'Potion de mana', type: 'consumable', stackable: true, quantity: 2, manaRestore: 30, effectText: 'Restaure 30 mana', icon: '🔵' });
        addLog('Le coffre contient <strong>2 Potions de mana</strong>.', 'gain');
      } else if (bonusRoll <= 85) {
        const item = clone(WEAPONS[Math.floor(Math.random() * WEAPONS.length)]);
        item.id = uid();
        GAME.sharedBag.push(item);
        addLog(`Le coffre contient <strong>${item.name}</strong>.`, 'loot');
      } else {
        const item = clone(ARMORS[Math.floor(Math.random() * ARMORS.length)]);
        item.id = uid();
        GAME.sharedBag.push(item);
        addLog(`Le coffre contient <strong>${item.name}</strong>.`, 'loot');
      }
    }

    function trapEvent() {
      const aliveIndexes = getAliveIndexes();
      if (!aliveIndexes.length) return;
      const targetIndex = aliveIndexes[Math.floor(Math.random() * aliveIndexes.length)];
      const hero = GAME.party[targetIndex];
      const damage = roll(8, 14) + GAME.roomsCleared;
      hero.hp = Math.max(0, hero.hp - damage);
      addLog(`⚠️ Un piège blesse <strong>${hero.name}</strong> et inflige <strong>${damage}</strong> dégâts !`, 'loss');
      if (!getAliveHeroes().length) gameOver();
    }

    function rest() {
      if (GAME.inCombat || GAME.isResting || GAME.isLevelingUp) return;
      GAME.isResting = true;
      refs.modalOverlay.classList.add('show');
      refs.restModal.classList.add('show');
      let timeLeft = 10;
      refs.restText.innerHTML = `Vous vous reposez.<br>Temps d'attente : <strong>0:10</strong>`;
      refs.restInterval = setInterval(() => {
        timeLeft--;
        refs.restText.innerHTML = `Vous vous reposez.<br>Temps d'attente : <strong>0:${timeLeft.toString().padStart(2, '0')}</strong>`;
        if (timeLeft <= 0) {
          clearInterval(refs.restInterval);
          GAME.party.forEach((hero) => syncHeroCaps(hero, true));
          GAME.isResting = false;
          refs.modalOverlay.classList.remove('show');
          refs.restModal.classList.remove('show');
          addLog('Toute l’équipe est complètement reposée. PV et mana restaurés.', 'gain');
          renderGame();
        }
      }, 1000);
    }

    function wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function applyLootDrops(drops) {
      drops.forEach((item) => {
        if (item.stackable) stackOrPush(item);
        else GAME.sharedBag.push({ ...item, id: uid(), quantity: 1 });
      });
      GAME.selectedItemId = GAME.sharedBag[0]?.id || null;
    }

    function rollLoot(enemy, returnOnly = false) {
      const rolls = Math.max(1, Math.ceil(GAME.party.length / 2));
      const drops = [];
      for (let i = 0; i < rolls; i++) {
        const r = roll(1, 100);
        if (r <= 38) {
          drops.push({ name: 'Potion de soin', type: 'consumable', stackable: true, quantity: 1, heal: 35 + Math.max(1, GAME.party[0]?.level || 1) * 3, effectText: 'Restaure des PV', icon: '🧪' });
        } else if (r <= 60) {
          drops.push({ name: 'Potion de mana', type: 'consumable', stackable: true, quantity: 1, manaRestore: 30, effectText: 'Restaure 30 mana', icon: '🔵' });
        } else if (r <= 80) {
          drops.push(clone(WEAPONS[Math.floor(Math.random() * WEAPONS.length)]));
        } else {
          drops.push(clone(ARMORS[Math.floor(Math.random() * ARMORS.length)]));
        }
      }
      if (enemy.boss) drops.push(clone(WEAPONS[Math.min(WEAPONS.length - 1, 4)]));
      if (returnOnly) return drops;
      applyLootDrops(drops);
      addLog(`<strong>Butin récupéré :</strong><br>${drops.map((item) => `${item.icon || '📦'} ${item.name}`).join('<br>')}`, 'loot');
      return drops;
    }

    function victory() {
      const enemy = GAME.currentEnemy;
      const drops = rollLoot(enemy, true);
      showEventModal(
        'Victoire',
        `<strong>${enemy.name}</strong> est vaincu.<br><br><strong>Récompense :</strong> ${enemy.xp} XP pour chaque survivant.<br><br><strong>Butin :</strong><br>${formatLootEntries(drops)}`,
        () => {
          GAME.inCombat = false;
          GAME.currentEnemy = null;
          GAME.party.filter((hero) => hero.hp > 0).forEach((hero) => {
            hero.xp += enemy.xp;
            tryLevelUp(hero);
          });
          applyLootDrops(drops);
          addLog(`${enemy.name} est vaincu ! <strong>+${enemy.xp} XP</strong> pour toute l'équipe.`, 'gain');
          renderGame();
          if (GAME.pendingLevelUps.length && !GAME.isLevelingUp) {
            processNextLevelUp();
          }
        }
      );
    }

    function gameOver() {
      GAME.inCombat = false;
      GAME.currentEnemy = null;
      showEventModal(
        'Défaite',
        `<strong>Toute l'équipe a succombé dans le donjon.</strong><br><br>Progression atteinte : salle ${GAME.roomsCleared}.`,
        () => {
          addLog('<strong>Toute l\'équipe a succombé dans le donjon.</strong>', 'loss');
          renderGame();
        }
      );
    }

    function explore() {
      if (GAME.inCombat || GAME.isResting || GAME.isLevelingUp) return;
      GAME.roomsCleared += 1;
      const eventRoll = roll(1, 100);
      if (eventRoll <= 64) return startCombat();
      if (eventRoll <= 84) {
        findTreasure();
        return;
      }
      trapEvent();
    }

    function findTreasure() {
      const bonusRoll = roll(1, 100);
      const drops = [];
      if (bonusRoll <= 50) {
        drops.push({ name: 'Potion de soin', type: 'consumable', stackable: true, quantity: 2, heal: 35, effectText: 'Restaure 35 PV', icon: '🧪' });
      } else if (bonusRoll <= 70) {
        drops.push({ name: 'Potion de mana', type: 'consumable', stackable: true, quantity: 2, manaRestore: 30, effectText: 'Restaure 30 mana', icon: '🔵' });
      } else if (bonusRoll <= 85) {
        const item = clone(WEAPONS[Math.floor(Math.random() * WEAPONS.length)]);
        item.id = uid();
        drops.push(item);
      } else {
        const item = clone(ARMORS[Math.floor(Math.random() * ARMORS.length)]);
        item.id = uid();
        drops.push(item);
      }
      showEventModal(
        'Coffre',
        `L'équipe découvre un coffre mystérieux.<br><br><strong>Contenu :</strong><br>${formatLootEntries(drops)}`,
        () => {
          applyLootDrops(drops);
          addLog('L\'équipe découvre un coffre mystérieux.', 'info');
          addLog(`<strong>Contenu du coffre :</strong><br>${formatLootEntries(drops)}`, 'loot');
          renderGame();
        }
      );
    }

    function trapEvent() {
      const aliveIndexes = getAliveIndexes();
      if (!aliveIndexes.length) return;
      const targetIndex = aliveIndexes[Math.floor(Math.random() * aliveIndexes.length)];
      const hero = GAME.party[targetIndex];
      const damage = roll(8, 14) + GAME.roomsCleared;
      showEventModal(
        'Piège',
        `Un mécanisme du donjon se déclenche sous les pieds de <strong>${hero.name}</strong>.<br><br><strong>Dégâts :</strong> ${damage}`,
        () => {
          hero.hp = Math.max(0, hero.hp - damage);
          addLog(`⚠️ Un piège blesse <strong>${hero.name}</strong> et inflige <strong>${damage}</strong> dégâts !`, 'loss');
          if (!getAliveHeroes().length) {
            gameOver();
            return;
          }
          renderGame();
        }
      );
    }

    function formatCountdown(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      return `${minutes}:${seconds}`;
    }

    function updateRestModal(timeLeftSeconds) {
      refs.modalOverlay.classList.add('show');
      refs.restModal.classList.add('show');
      refs.restText.innerHTML = `Vous vous reposez.<br>Temps d'attente : <strong>${formatCountdown(timeLeftSeconds)}</strong>`;
    }

    function finishRest() {
      if (GAME.restInterval) clearInterval(GAME.restInterval);
      GAME.restInterval = null;
      GAME.party.forEach((hero) => syncHeroCaps(hero, true));
      GAME.isResting = false;
      GAME.restEndsAt = null;
      refs.modalOverlay.classList.remove('show');
      refs.restModal.classList.remove('show');
      addLog('Toute l\'équipe est complètement reposée. PV et mana restaurés.', 'gain');
      renderGame();
    }

    function resumeRest() {
      if (!GAME.isResting || !GAME.restEndsAt) return;
      if (GAME.restInterval) clearInterval(GAME.restInterval);

      const tick = () => {
        const timeLeftSeconds = Math.max(0, Math.ceil((GAME.restEndsAt - Date.now()) / 1000));
        if (timeLeftSeconds <= 0) {
          finishRest();
          return;
        }
        updateRestModal(timeLeftSeconds);
      };

      tick();
      GAME.restInterval = setInterval(tick, 1000);
    }

    function rest() {
      if (GAME.inCombat || GAME.isResting || GAME.isLevelingUp) return;
      GAME.isResting = true;
      GAME.restEndsAt = Date.now() + 10000;
      saveGameState();
      resumeRest();
    }

    function getSavedRuns() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        const list = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
        let changed = false;
        const normalized = [];
        const seenIds = new Set();

        list.forEach((save, index) => {
          if (!save || typeof save !== 'object') return;
          const normalizedSave = { ...save };
          if (!normalizedSave.id) {
            normalizedSave.id = `legacy-save-${index}-${uid()}`;
            changed = true;
          }
          if (seenIds.has(normalizedSave.id)) {
            changed = true;
            return;
          }
          seenIds.add(normalizedSave.id);
          normalized.push(normalizedSave);
        });

        if (changed) {
          localStorage.setItem(SAVE_KEY, JSON.stringify(normalized));
        }

        return normalized;
      } catch (error) {
        console.error('Impossible de lire les sauvegardes.', error);
        return [];
      }
    }

    function setSavedRuns(saves) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
    }

    function getSelectedSave() {
      return getSavedRuns().find((save) => save.id === GAME.selectedSaveId) || null;
    }

    function renderSaveList() {
      const saves = getSavedRuns().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      refs.saveList.innerHTML = '';
      if (!saves.length) {
        GAME.selectedSaveId = null;
        refs.saveList.innerHTML = '<div class="party-slot"><div class="slot-left"><div class="party-emoji">💾</div><div class="slot-info"><div class="slot-name">Aucune sauvegarde</div><div class="slot-meta">Crée une équipe pour démarrer une nouvelle aventure.</div></div></div></div>';
        return;
      }
      if (!saves.find((save) => save.id === GAME.selectedSaveId)) {
        GAME.selectedSaveId = saves[0].id;
      }
      saves.forEach((save) => {
        const leader = save.party?.[0];
        const row = document.createElement('div');
        row.className = `save-row ${save.id === GAME.selectedSaveId ? 'selected' : ''}`;
        row.innerHTML = `
          <div class="save-icon">${leader?.emoji || '⚔️'}</div>
          <div class="save-info">
            <div class="save-title">${save.name || (leader ? `Équipe de ${leader.name}` : 'Compagnie sans nom')}</div>
            <div class="save-meta">${save.party?.length || 0} héros • Salle ${save.roomsCleared || 0}</div>
            <div class="save-submeta">${save.updatedAt ? new Date(save.updatedAt).toLocaleString('fr-FR') : 'Date inconnue'}</div>
          </div>
        `;
        row.onclick = () => {
          GAME.selectedSaveId = save.id;
          updateSaveControls();
        };
        refs.saveList.appendChild(row);
      });
    }

    function updateSaveControls() {
      const save = getSelectedSave();
      refs.continueBtn.disabled = !save;
      refs.clearSaveBtn.disabled = !save;
      refs.saveStatus.textContent = save ? `${save.party?.length || 0} héros, salle ${save.roomsCleared || 0}.` : 'Aucune sauvegarde sélectionnée.';
      renderSaveList();
    }

    function serializeGameState() {
      if (!GAME.started || !GAME.party.length || GAME.isResolvingRound || GAME.isLevelingUp) return null;
      const leader = GAME.party[0];
      return {
        id: GAME.saveId || uid(),
        name: leader ? `Équipe de ${leader.name}` : 'Compagnie sans nom',
        started: GAME.started,
        party: clone(GAME.party),
        displayHeroIndex: GAME.displayHeroIndex,
        activeHeroIndex: GAME.activeHeroIndex,
        setupSharedBag: clone(GAME.setupSharedBag),
        sharedBag: clone(GAME.sharedBag),
        currentEnemy: clone(GAME.currentEnemy),
        inCombat: GAME.inCombat,
        selectedItemId: GAME.selectedItemId,
        selectedEquipmentId: GAME.selectedEquipmentId,
        roomsCleared: GAME.roomsCleared,
        pendingActions: clone(GAME.pendingActions),
        lastRoundHeroActions: clone(GAME.lastRoundHeroActions),
        lastEnemyAction: GAME.lastEnemyAction,
        heroesChosenThisRound: GAME.heroesChosenThisRound,
        isResting: GAME.isResting,
        restEndsAt: GAME.restEndsAt,
        pendingLevelUpIds: GAME.pendingLevelUps.map((hero) => hero.id),
        updatedAt: Date.now(),
      };
    }

    function saveGameState() {
      const state = serializeGameState();
      if (!state) return;
      GAME.saveId = state.id;
      const saves = getSavedRuns();
      const index = saves.findIndex((save) => save.id === state.id);
      if (index >= 0) saves[index] = state;
      else saves.push(state);
      setSavedRuns(saves);
      GAME.selectedSaveId = state.id;
      updateSaveControls();
    }

    function hydrateGameState(state) {
      GAME.saveId = state.id || null;
      GAME.selectedSaveId = state.id || null;
      GAME.started = !!state.started;
      GAME.party = clone(state.party || []);
      GAME.displayHeroIndex = Math.min(state.displayHeroIndex || 0, Math.max(0, GAME.party.length - 1));
      GAME.activeHeroIndex = Math.min(state.activeHeroIndex || 0, Math.max(0, GAME.party.length - 1));
      GAME.setupSharedBag = clone(state.setupSharedBag || []);
      GAME.sharedBag = clone(state.sharedBag || []);
      GAME.currentEnemy = state.currentEnemy ? clone(state.currentEnemy) : null;
      GAME.inCombat = !!state.inCombat;
      GAME.selectedItemId = state.selectedItemId || GAME.sharedBag[0]?.id || null;
      GAME.selectedEquipmentId = state.selectedEquipmentId || null;
      GAME.roomsCleared = state.roomsCleared || 0;
      GAME.pendingActions = clone(state.pendingActions || []);
      GAME.lastRoundHeroActions = clone(state.lastRoundHeroActions || {});
      GAME.lastEnemyAction = state.lastEnemyAction || '';
      GAME.heroesChosenThisRound = state.heroesChosenThisRound || 0;
      GAME.isResting = !!state.isResting;
      GAME.restEndsAt = state.restEndsAt || null;
      GAME.pendingLevelUps = (state.pendingLevelUpIds || []).map((heroId) => GAME.party.find((hero) => hero.id === heroId)).filter(Boolean);
      GAME.isLevelingUp = false;
      GAME.pendingModalAction = null;
      GAME.party.forEach((hero) => syncHeroCaps(hero, false));
      if (GAME.currentEnemy) {
        GAME.currentEnemy.guardBreakTurns = GAME.currentEnemy.guardBreakTurns || 0;
        GAME.currentEnemy.guardBreakAmount = GAME.currentEnemy.guardBreakAmount || 0;
      }
    }

    function resetDraftTeam() {
      GAME.saveId = null;
      GAME.started = false;
      GAME.party = [];
      GAME.displayHeroIndex = 0;
      GAME.activeHeroIndex = 0;
      GAME.setupSharedBag = [];
      GAME.sharedBag = [];
      GAME.currentEnemy = null;
      GAME.inCombat = false;
      GAME.selectedItemId = null;
      GAME.selectedEquipmentId = null;
      GAME.roomsCleared = 0;
      GAME.pendingActions = [];
      GAME.lastRoundHeroActions = {};
      GAME.lastEnemyAction = '';
      GAME.heroesChosenThisRound = 0;
      GAME.isResolvingRound = false;
      GAME.isResting = false;
      GAME.restEndsAt = null;
      GAME.pendingLevelUps = [];
      GAME.isLevelingUp = false;
      GAME.pendingModalAction = null;
      if (GAME.restInterval) clearInterval(GAME.restInterval);
      GAME.restInterval = null;
    }

    function showMenuScreen() {
      refs.gameWrapper.classList.remove('game-active');
      refs.menuScreen.classList.remove('hidden');
      refs.setupScreen.classList.add('hidden');
      refs.gameScreen.classList.add('hidden');
      updateSaveControls();
    }

    function openSetupScreen() {
      resetDraftTeam();
      renderSetupParty();
      refs.gameWrapper.classList.remove('game-active');
      refs.menuScreen.classList.add('hidden');
      refs.setupScreen.classList.remove('hidden');
      refs.gameScreen.classList.add('hidden');
    }

    function beginGame() {
      ensureSetupBag();
      GAME.saveId = GAME.saveId || uid();
      GAME.sharedBag = clone(GAME.setupSharedBag);
      GAME.started = true;
      GAME.displayHeroIndex = 0;
      GAME.activeHeroIndex = 0;
      GAME.selectedItemId = GAME.sharedBag[0]?.id || null;
      GAME.selectedEquipmentId = getDisplayedHero()?.equipment.weapon?.id || getDisplayedHero()?.equipment.armor?.id || null;
      refs.gameWrapper.classList.add('game-active');
      refs.menuScreen.classList.add('hidden');
      refs.setupScreen.classList.add('hidden');
      refs.gameScreen.classList.remove('hidden');
      if (refs.log) refs.log.innerHTML = '';
      addLog(`L'équipe entre dans le donjon avec <strong>${GAME.party.length}</strong> héros.`, 'critical');
      addLog('Hors combat, clique sur les carrés à gauche pour changer le héros affiché.', 'info');
      renderGame();
      saveGameState();
    }

    function continueSavedGame() {
      const save = getSelectedSave();
      if (!save?.started) return;
      hydrateGameState(save);
      refs.gameWrapper.classList.add('game-active');
      refs.menuScreen.classList.add('hidden');
      refs.setupScreen.classList.add('hidden');
      refs.gameScreen.classList.remove('hidden');
      if (refs.log) refs.log.innerHTML = '';
      addLog('La compagnie reprend sa progression dans le donjon.', 'info');
      renderGame();
      if (GAME.isResting && GAME.restEndsAt) {
        resumeRest();
      } else if (GAME.pendingLevelUps.length) {
        processNextLevelUp();
      }
    }

    function clearSavedRun() {
      const save = getSelectedSave();
      if (!save) return;
      const saves = getSavedRuns().filter((entry) => entry.id !== save.id);
      setSavedRuns(saves);
      GAME.selectedSaveId = saves[0]?.id || null;
      updateSaveControls();
    }

    refs.addHeroBtn.addEventListener('click', openCreationModal);
    refs.cancelCreateBtn.addEventListener('click', closeCreationModal);
    refs.confirmCreateBtn.addEventListener('click', addCreatedHero);
    refs.heroName.addEventListener('input', renderCreation);
    refs.playBtn.addEventListener('click', beginGame);
    refs.openSetupBtn.addEventListener('click', openSetupScreen);
    refs.backToMenuBtn.addEventListener('click', showMenuScreen);
    refs.resetTeamBtn.addEventListener('click', () => {
      resetDraftTeam();
      renderSetupParty();
    });
    refs.continueBtn.addEventListener('click', continueSavedGame);
    refs.clearSaveBtn.addEventListener('click', clearSavedRun);
    refs.eventConfirmBtn.addEventListener('click', closeEventModal);

    refs.btnExplore.addEventListener('click', explore);
    refs.btnRest.addEventListener('click', rest);
    refs.btnAttack.addEventListener('click', () => planAction('attack'));
    refs.btnHeavy.addEventListener('click', () => planAction('heavy'));
    refs.btnBlock.addEventListener('click', () => planAction('block'));
    refs.btnSkill.addEventListener('click', () => planAction('skill'));

    refs.btnUseItem.addEventListener('click', useBagItem);
    refs.btnEquipItem.addEventListener('click', equipFromBag);
    refs.btnDropItem.addEventListener('click', dropBagItem);
    refs.btnDropEquipped.addEventListener('click', dropEquippedItem);

    showMenuScreen();
