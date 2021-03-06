// 1. Create a grid (map) 10 by 9
// 2. Create dimmed (barriers) square 12 randomly in the map (Grid)
//    Create a function to obtain random number between 1 and 10 (Position)
//    Call function to gte 2 number
//    Use that numbers to find square
//    add class .barrier to found square
// 3. Choose 4 weapons to be created randomly in the map
// 4. Create weapons randomly in the map
// 5. Create player class
// finish step 1
// 6. Start with a default weapon for the players
// 7. Moves for the player (movePlayer)
//   7.1 Update de player => rowPosition and colPosition
//   7.2 Change player in the grid (remove class from the old square and add class to the new square position)
//   7.3 Applied movements rules
//      - Only three parallel squares
//      - Don't pass throw barrier
//      - If the new position has new weapon, we need to switch weapons
// finish step 2
// 8. Know if player are ready to the fight
// 9. Create sequence fight
//  9.1 Create a prompt for the player in turn, asking if he decided defend or attack
//  9.2 If decision defend the damage received will be 50% of the damage triggered by the other player weapon
//  9.2 If decision attack the other player will reduce his health the damage triggered by the weapon



(function () {

  const DEFAULT_WEAPON = 'weapon';

  function getRndNumber() {
    return Math.floor(Math.random() * (10 - 1) + 1);
  }


  function getCell(colPosition, rowPosition) {
    return document
      .querySelectorAll(`div[data-col="${colPosition}"][data-row="${rowPosition}"]`)[0];
  }

  function Player(name, weapon) {
    this.name = name;
    this.weapon = TurnBasedGame.DEFAULT_WEAPONS[weapon];
    this.summaryContainer = document.getElementById(name + '-summary');
    this.position = {
      col: 0,
      row: 0
    };
    this.lastPosition = {
      col: 0,
      row: 0
    };
    this.health = 100;
    this.inTurn = false;
    this.fighting = false;
    this.defending = false;
  }

  Player.prototype.getCell = function () {
    return getCell(this.position.col, this.position.row);
  }

  Player.prototype.getCellHtml = function (newPosition) {
    return `
      <span class="player-health" data-health="${this.health}" >${this.health}</span>
      <div class="player-weapon">
        <span class="${this.weapon.key}" >&nbsp;</span>
        <span>${this.weapon.damage}</span>
      </div>
    `;
  }

  Player.prototype.refreshHtml = function () {
    const oldCell = getCell(this.lastPosition.col, this.lastPosition.row);
    if (oldCell) {
      oldCell.innerHTML = '&nbsp;';
    }

    this.refreshSummaryHtml();
  }

  Player.prototype.refreshSummaryHtml = function () {
    const cell = this.getCellHtml();
    this.summaryContainer.innerHTML = `
      <h2 class="turn-title">${this.name}</h2>
      <h3 class="turn-title">${this.fighting ? 'in fight mode' : 'moving'}</h3>
      <h4 class="turn-title">${this.inTurn ? 'in turn' : 'waiting'}</h4>
      <h5 class="turn-title" ${this.fighting ? '' : 'hidden'} >
        ${this.defending ? 'defending (50% less damage)' : 'attacking (100% damage)'}
      </h5>
      <div class="player-cell ${this.name}">
        ${cell}
      </div>
    `;
  }

  Player.prototype.moveTo = function (newPosition, refreshHtml) {
    this.lastPosition = Object.assign({}, this.position);
    this.position = newPosition;
    refreshHtml && this.refreshHtml();
  }

  Player.prototype.canMoveTo = function (newPosiblePosition, callbackIfCan) {
    const direction = newPosiblePosition.col == this.position.col ? 'row' : 'col';
    const diffCol = Math.abs(this.position.col - newPosiblePosition.col);
    const diffRow = Math.abs(this.position.row - newPosiblePosition.row);

    const validColPosition = direction === 'col' && diffCol <= 3 && diffRow === 0;
    const validRowPosition = direction === 'row' && diffRow <= 3 && diffCol === 0;

    const canMove = (validColPosition || validRowPosition);
    canMove && callbackIfCan && callbackIfCan();

    return canMove;
  }

  function TurnBasedGame() {
    this.gridContainerId = 'grid-container';
    this.gridContainer = document.getElementById(this.gridContainerId);
    this.player1 = null;
    this.player2 = null;
    this.barriers = [];
    this.weapons = TurnBasedGame.DEFAULT_WEAPONS;
    this.playerInTurn = 'player1';
    this.defending = false;

    const self = this;

    this.gridContainer.addEventListener("click", function(event) {
      const element = event.target;
      const newPosiblePosition = {
        col: Number(element.dataset.col),
        row: Number(element.dataset.row)
      };

      self.tryMovePlayerInTurn(newPosiblePosition);
      self.tryFight();
    });
  }

  TurnBasedGame.DEFAULT_WEAPONS = {
    "weapon": {
      key: 'weapon',
      position: null,
      damage: 10,
    },
    "weapon1": {
      key: 'weapon1',
      position: null,
      damage: 20,
    },
    "weapon2": {
      key: 'weapon2',
      position: null,
      damage: 30,
    },
    "weapon3": {
      key: 'weapon3',
      position: null,
      damage: 40,
    },
    "weapon4": {
      key: 'weapon4',
      position: null,
      damage: 50,
    },
  };

  TurnBasedGame.prototype.createPlayer1 = function() {
    return new Player('player1', DEFAULT_WEAPON);
  }

  TurnBasedGame.prototype.createPlayer2 = function() {
    return new Player('player2', DEFAULT_WEAPON);
  }

  TurnBasedGame.prototype.createMap = function() {
    let cells = '';

    for (let iRow = 1; iRow < 11; iRow++) {
      for (let iCol = 1; iCol < 11; iCol++) {
        cells += `<div class='grid-item' data-col=${iCol} data-row=${iRow} >&nbsp;</div>`;
      }
    }
    this.gridContainer.innerHTML = cells;
  }

  TurnBasedGame.prototype.isPositionAvailable = function(position, callbackWhileIsTaken) {
    const cell = getCell(position.col, position.row);
    if (cell.classList.contains('taken')) {
      console.log('exist something int that position');
      callbackWhileIsTaken && callbackWhileIsTaken();
      return false;
    }

    return true;
  }

  TurnBasedGame.prototype.putClass = function(position, newClass, notTaken) {
    const cell = getCell(position.col, position.row);
    console.log('placing ' + newClass);
    cell.classList.add(newClass);
    !notTaken && cell.classList.add('taken');
  }

  TurnBasedGame.prototype.putWeaponInfo = function(position) {
    const cell = getCell(position.col, position.row);
    console.log('putting info weapon ' + newClass);
    cell.classList.add('weapon');
  }

  TurnBasedGame.prototype.removeClass = function(position, classToRemove) {
    const cell = getCell(position.col, position.row);
    console.log('removing ' + classToRemove);
    cell.classList.remove(classToRemove);
    cell.classList.remove('taken');
  }

  TurnBasedGame.prototype.placeBarrier = function() {
    const colPosition = getRndNumber();
    const rowPosition = getRndNumber();
    const position = {
      col: colPosition,
      row: rowPosition
    };
    const self = this;

    const available = this.isPositionAvailable(position, function() {
      self.placeBarrier();
    });

    if (available) {
      this.barriers.push(position);
      this.putClass(position, 'barrier')
    }
  }

  TurnBasedGame.prototype.placeWeapon = function(weapon) {
    const colPosition = getRndNumber();
    const rowPosition = getRndNumber();
    const position = {
      col: colPosition,
      row: rowPosition
    };
    const self = this;

    const available = this.isPositionAvailable(position, function() {
      self.placeWeapon(weapon);
    });

    if (available) {
      this.weapons[weapon].position = position;
      this.putClass(position, weapon, true);
    }
  }

  TurnBasedGame.prototype.placePlayer = function(player) {
    const colPosition = getRndNumber();
    const rowPosition = getRndNumber();
    const position = {
      col: colPosition,
      row: rowPosition
    };
    const me = this;

    const available = this.isPositionAvailable(position, function() {
      me.placePlayer(player);
    });

    if (available) {
      player.moveTo(position, true);
      this.putClass(position, player.name)
    }
  }

  TurnBasedGame.prototype.findWeaponByPosition = function(newPosition) {
    return Object
      .values(this.weapons)
      .find(weapon => weapon.position && weapon.position.col === newPosition.col && weapon.position.row === newPosition.row);
  };

  TurnBasedGame.prototype.switchWeapon = function(player) {
    const position = player.position;
    const newWeapon = this.findWeaponByPosition(position);
    if (newWeapon) {
      // Put down the old weapon
      this.weapons[player.weapon.key].position = position;
      this.putClass(position, player.weapon.key, true);

      // Put up the new Weapon to the player
      // For the weapons in use the position attribute is null
      this.weapons[newWeapon.key].position = null;
      this.removeClass(position, newWeapon.key);
      player.weapon = this.weapons[newWeapon.key];
    }
  };

  TurnBasedGame.prototype.movePlayer = function(player, newPosition) {
    // Remove class player from old position
    this.removeClass(player.position, player.name);

    // Set new position and style of player to the new position cell
    this.putClass(newPosition, player.name);

    player.moveTo(newPosition);

    // switch weapon if necessary
    this.switchWeapon(player);

    // move turn to next player
    this.playerInTurn = this.playerInTurn === 'player1' ? 'player2' : 'player1';
    const anotherLayer = this.playerInTurn === 'player1' ? 'player2' : 'player1';

    this[this.playerInTurn].inTurn = true;
    this[anotherLayer].inTurn = false;

    this[this.playerInTurn].refreshHtml();
    this[anotherLayer].refreshHtml();
  };

  TurnBasedGame.prototype.hasBarriers = function(fromPosition, toPosition) {
    const direction = toPosition.col == fromPosition.col ? 'row' : 'col';
    console.log("TCL: TurnBasedGame.prototype.hasBarriers -> direction", direction)
    const diff = direction === 'col'
      ? fromPosition.col - toPosition.col
      : fromPosition.row - toPosition.row;
    console.log("TCL: TurnBasedGame.prototype.hasBarriers -> diff", diff)

    let col = direction === 'col' ? fromPosition.col - 1 : fromPosition.col;
    let row = direction === 'row' ? fromPosition.row - 1 : fromPosition.row;

    if (diff < 0) {
      col = direction === 'col' ? fromPosition.col + 1 : fromPosition.col;
      row = direction === 'row' ? fromPosition.row + 1 : fromPosition.row;
    }

    const fromPositionWay = { col: col, row: row };

    console.log("TCL: TurnBasedGame.prototype.hasBarriers -> fromPositionWay", fromPositionWay)

    const cell = getCell(fromPositionWay.col, fromPositionWay.row);
    if (!cell) {
      return false;
    }
    if (cell.classList.contains('barrier')) {
      console.log('exist a barrier from fromPosition to toPosition');
      return true;
    }

    if (Math.abs(diff) !== Math.abs(fromPosition[direction] - fromPositionWay[direction])) {
      return this.hasBarriers(fromPositionWay, toPosition);
    }

    return false;
  }

  TurnBasedGame.prototype.isReadyToFight = function() {
    const colPlayer1 = this.player1.position.col;
    const rowPlayer1 = this.player1.position.row;
    const colPlayer2 = this.player2.position.col;
    const rowPlayer2 = this.player2.position.row;

    const diffCol = Math.abs(colPlayer1 - colPlayer2);
    const diffRow = Math.abs(rowPlayer1 - rowPlayer2);

    const isReadyForCol = diffCol === 1 && diffRow === 0;
    const isReadyForRow = diffRow === 1 && diffCol === 0;

    if (isReadyForCol || isReadyForRow) {
      console.log('The player are ready to fight');

      return true
    }

    return false;
  }

  TurnBasedGame.prototype.tryMovePlayer = function(player, newPosiblePosition) {
    const self = this;
    player.canMoveTo(newPosiblePosition, function() {
      if (self.isPositionAvailable(newPosiblePosition) && !self.hasBarriers(player.position, newPosiblePosition)) {
        self.movePlayer(player, newPosiblePosition);
      }
    });
  }

  TurnBasedGame.prototype.tryMovePlayerInTurn = function(newPosiblePosition) {
    this.tryMovePlayer(this[this.playerInTurn], newPosiblePosition);
  }

  TurnBasedGame.prototype.refreshPlayerInTurnLabel = function() {
    const summary = this[this.playerInTurn].summary
  }

  TurnBasedGame.prototype.tryFight = function() {
    const self = this;

    if (!self.isReadyToFight()) {
      return
    }

    if (self.player1.health > 0 && self.player2.health > 0) {
      this.playerInTurn = this.playerInTurn === 'player1' ? 'player2' : 'player1';
      const playerInTurn = self[self.playerInTurn];
      const anotherPlayerKey = self.playerInTurn === 'player1' ? 'player2' : 'player1';
      const anotherPlayer = self[anotherPlayerKey];
      
      playerInTurn.inTurn = true;
      anotherPlayer.inTurn = false;
      playerInTurn.fighting = true;
      anotherPlayer.fighting = true;

      playerInTurn.refreshHtml();
      anotherPlayer.refreshHtml();

      setTimeout(function() {
        console.log(playerInTurn.name + " => " + anotherPlayer.name);
        const responseAction = prompt(playerInTurn.name + ", do you want 'attack' (a) or 'defend' (d) ?", 'attack');

        if (!responseAction) {
          return self.setup();
        }

        const action =  ['attack', 'a'].indexOf(responseAction) !== -1  ? 'attack' : 'defend';

        console.log(playerInTurn.name + ' decided ', action);
        playerInTurn.fighting = true;
        anotherPlayer.fighting = true;

        if (action === 'attack') {
          playerInTurn.defending = false;
          console.log(anotherPlayer.name + '.health before', anotherPlayer.health);
          anotherPlayer.health -= anotherPlayer.defending ? playerInTurn.weapon.damage * .5 : playerInTurn.weapon.damage;
          anotherPlayer.health = Math.max(anotherPlayer.health, 0);
          console.log(anotherPlayer.name + '.health after', anotherPlayer.health);
        } else if (action === 'defend') {
          playerInTurn.defending = true;
        }

        playerInTurn.refreshHtml();
        anotherPlayer.refreshHtml();
        self.tryFight();
      }, 100);
    } else {
      self.player1.refreshHtml();
      self.player2.refreshHtml();

      setTimeout(function() {
        self.player2.health <= 0 && alert('player1 winner !!!');
        self.player1.health <= 0 && alert('player2 winner !!!');
        self.setup();
      }, 0);
    }
  }

  TurnBasedGame.prototype.setup = function() {
    this.barriers = [];
    this.weapons = TurnBasedGame.DEFAULT_WEAPONS;
    this.playerInTurn = 'player1';

    this.createMap();

    this.placeBarrier();
    this.placeBarrier();
    this.placeBarrier();
    this.placeBarrier();
    this.placeBarrier();
    this.placeBarrier();
    this.placeBarrier();
    this.placeBarrier();
    this.placeBarrier();
    this.placeBarrier();
    this.placeBarrier();
    this.placeBarrier();

    this.player1 = this.createPlayer1();
    this.player1.inTurn = true;
    this.placePlayer(this.player1);
    this.player2 = this.createPlayer2();
    this.placePlayer(this.player2);

    if (this.isReadyToFight()) {
      this.setup();
      return;
    }

    this.placeWeapon('weapon1');
    this.placeWeapon('weapon2');
    this.placeWeapon('weapon3');
    this.placeWeapon('weapon4');
  }

  // Start the game
  const game = new TurnBasedGame();
  game.setup();

})()