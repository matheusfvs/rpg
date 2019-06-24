enchant();
window.onload = function() {
  var game = new Game(300, 300);
  game.keybind(32, "a");
  game.spriteSheetWidth = 256; //trocar aqui quando sprite aumentar
  game.spriteSheetHeight = 16;
  game.itemSpriteSheetWidth = 64;
  game.preload(["sprites.png", "items.png"]);
  game.items = [
    { price: 20, description: "pino de cocaina", id: 0 },
    { price: 50, description: "Arminha de dedo", id: 1, bonus: 1 },
    { price: 120, description: "Uniforme do Brasil", id: 2, bonus: 3 },
    { price: 300, description: "Kit Gay", id: 3, bonus: 1 }
  ];
  game.fps = 15;
  game.spriteWidth = 16;
  game.spriteHeight = 16;
  var map = new Map(game.spriteWidth, game.spriteHeight);
  var foregroundMap = new Map(game.spriteWidth, game.spriteHeight);
  var setMaps = function() {
    map.image = game.assets["sprites.png"];
    map.loadData(mapData);
    foregroundMap.image = game.assets["sprites.png"];
    foregroundMap.loadData(foregroundData);
    var collisionData = [];
    for (var i = 0; i < foregroundData.length; i++) {
      collisionData.push([]);
      for (var j = 0; j < foregroundData[0].length; j++) {
        var collision = foregroundData[i][j] % 13 > 1 ? 1 : 0;
        collisionData[i][j] = collision;
      }
    }
    map.collisionData = collisionData;
  };

  var setBonus = function() {
    var bonus = 0;
    for (i = 0; i < player.inventory.length; i++) {
      player.inventory[i] == 1 ? (bonus += game.items[1].bonus) : null;
      player.inventory[i] == 2 ? (bonus += game.items[2].bonus) : null;
      player.inventory[i] == 4 ? (bonus += game.items[3].bonus) : null;
    }
    console.log(bonus);
    return bonus;
  };

  var setStage = function() {
    var stage = new Group();
    stage.addChild(map);
    stage.addChild(player);
    stage.addChild(foregroundMap);
    stage.addChild(player.statusLabel);
    game.rootScene.addChild(stage);
  };
  var player = new Sprite(game.spriteWidth, game.spriteHeight);
  var setPlayer = function() {
    player.spriteOffset = 5;
    player.startingX = 6;
    player.startingY = 14;
    player.x = player.startingX * game.spriteWidth;
    player.y = player.startingY * game.spriteHeight;
    player.direction = 0;
    player.walk = 0;
    player.frame = player.spriteOffset + player.direction;
    player.image = new Surface(game.spriteSheetWidth, game.spriteSheetHeight);
    player.image.draw(game.assets["sprites.png"]);

    player.name = "Pablito";
    player.characterClass = "Aviãozinho";
    player.exp = 0;
    player.level = 1;
    player.gp = 1000;
    player.levelStats = [
      {},
      { attack: 4, maxHp: 30, maxMp: 5, expMax: 10 },
      { attack: 6, maxHp: 40, maxMp: 5, expMax: 30 },
      { attack: 7, maxHp: 50, maxMp: 6, expMax: 50 }
    ];
    player.attack = function() {
      return player.levelStats[player.level].attack + setBonus();
    };
    player.magic = function(a) {
      player.inventory;
      return a.bonus;
    };
    player.hp = player.levelStats[player.level].maxHp;
    player.mp = player.levelStats[player.level].maxMp;

    player.statusLabel = new Label("");
    player.statusLabel.width = game.width;
    player.statusLabel.y = undefined;
    player.statusLabel.x = undefined;
    player.statusLabel.color = "#fff";
    player.statusLabel.backgroundColor = "#000";
  };
  player.displayStatus = function() {
    player.statusLabel.text =
      "--" +
      player.name +
      " o " +
      player.characterClass +
      "<br />--HP: " +
      player.hp +
      "/" +
      player.levelStats[player.level].maxHp +
      "<br />--MP: " +
      player.mp +
      "/" +
      player.levelStats[player.level].maxMp +
      "<br />--Exp: " +
      player.exp +
      "<br />--Level: " +
      player.level +
      "<br />--GP: " +
      player.gp +
      "<br /><br />--Inventory:";
    player.statusLabel.height = 170;
    player.showInventory(0);
  };
  player.clearStatus = function() {
    player.statusLabel.text = "";
    player.statusLabel.height = 0;
    player.hideInventory();
  };

  player.move = function() {
    this.frame = this.spriteOffset + this.direction * 2 + this.walk;
    if (this.isMoving) {
      this.moveBy(this.xMovement, this.yMovement);
      if (!(game.frame % 2)) {
        this.walk++;
        this.walk %= 2;
      }
      if (
        (this.xMovement && this.x % 16 === 0) ||
        (this.yMovement && this.y % 16 === 0)
      ) {
        this.isMoving = false;
        this.walk = 1;
      }
    } else {
      this.xMovement = 0;
      this.yMovement = 0;
      if (game.input.up) {
        this.direction = 1;
        this.yMovement = -4;
        player.clearStatus();
      } else if (game.input.right) {
        this.direction = 2;
        this.xMovement = 4;
        player.clearStatus();
      } else if (game.input.left) {
        this.direction = 3;
        this.xMovement = -4;
        player.clearStatus();
      } else if (game.input.down) {
        this.direction = 0;
        this.yMovement = 4;
        player.clearStatus();
      }
      if (this.xMovement || this.yMovement) {
        var x =
          this.x +
          (this.xMovement
            ? (this.xMovement / Math.abs(this.xMovement)) * 16
            : 0);
        var y =
          this.y +
          (this.yMovement
            ? (this.yMovement / Math.abs(this.yMovement)) * 16
            : 0);
        if (
          0 <= x &&
          x < map.width &&
          0 <= y &&
          y < map.height &&
          !map.hitTest(x, y)
        ) {
          this.isMoving = true;
          this.move();
        }
      }
    }
  };
  player.square = function() {
    return {
      x: Math.floor(this.x / game.spriteWidth),
      y: Math.floor(this.y / game.spriteHeight)
    };
  };
  player.facingSquare = function() {
    var playerSquare = player.square();
    var facingSquare;
    if (player.direction === 0) {
      facingSquare = { x: playerSquare.x, y: playerSquare.y + 1 };
    } else if (player.direction === 1) {
      facingSquare = { x: playerSquare.x, y: playerSquare.y - 1 };
    } else if (player.direction === 2) {
      facingSquare = { x: playerSquare.x + 1, y: playerSquare.y };
    } else if (player.direction === 3) {
      facingSquare = { x: playerSquare.x - 1, y: playerSquare.y };
    }
    if (
      facingSquare.x < 0 ||
      facingSquare.x >= map.width / 16 ||
      (facingSquare.y < 0 || facingSquare.y >= map.height / 16)
    ) {
      return null;
    } else {
      return facingSquare;
    }
  };
  player.facing = function() {
    var facingSquare = player.facingSquare();
    if (!facingSquare) {
      return null;
    } else {
      return foregroundData[facingSquare.y][facingSquare.x];
    }
  };
  player.visibleItems = [];
  player.itemSurface = new Surface(
    game.itemSpriteSheetWidth,
    game.spriteSheetHeight
  );
  player.inventory = [];
  player.hideInventory = function() {
    for (var i = 0; i < player.visibleItems.length; i++) {
      player.visibleItems[i].remove();
    }
    player.visibleItems = [];
  };
  player.showInventory = function(yOffset) {
    if (player.visibleItems.length === 0) {
      player.itemSurface.draw(game.assets["items.png"]);
      for (var i = 0; i < player.inventory.length; i++) {
        var item = new Sprite(game.spriteWidth, game.spriteHeight);
        item.y = 130 + yOffset;
        item.x = 30 + 70 * i;
        item.frame = player.inventory[i];
        item.scaleX = 2;
        item.scaleY = 2;
        item.image = player.itemSurface;
        player.visibleItems.push(item);
        game.currentScene.addChild(item);
      }
    }
  };
  var npc = {
    say: function(message) {
      player.statusLabel.height = 12;
      player.statusLabel.text = message;
    }
  };
  var morador = {
    action: function() {
      npc.say("hello");
    }
  };
  var shopScene = new Scene();
  var cat = {
    action: function() {
      game.pushScene(shopScene);
    }
  };
  var battleScene = new Scene();
  var noia = {
    maxHp: 10,
    hp: 10,
    sprite: 2,
    attack: 3,
    exp: 3,
    gp: 5,
    action: function() {
      player.currentEnemy = this;
      game.pushScene(battleScene);
    }
  };
  var traveco = {
    maxHp: 10,
    hp: 10,
    sprite: 2,
    attack: 3,
    exp: 3,
    gp: 5,
    action: function() {
      player.currentEnemy = this;
      game.pushScene(battleScene);
    }
  };
  var traficante = {
    maxHp: 10,
    hp: 10,
    sprite: 2,
    attack: 3,
    exp: 3,
    gp: 5,
    action: function() {
      player.currentEnemy = this;
      game.pushScene(battleScene);
    }
  };
  var donoDaBoca = {
    maxHp: 40,
    hp: 40,
    sprite: 15,
    attack: 6,
    exp: 3,
    gp: 5,
    action: function() {
      player.currentEnemy = this;
      game.pushScene(battleScene);
    }
  };
  var spriteRoles = [, , noia, , cat, , , , , , , , , , , donoDaBoca];
  var setBattle = function() {
    battleScene.backgroundColor = "#000";
    var battle = new Group();
    battle.menu = new Label();
    battle.menu.x = 20;
    battle.menu.y = 170;
    battle.menu.color = "#fff";
    battle.activeAction = 0;
    battle.getPlayerStatus = function() {
      return "HP: " + player.hp + "<br />MP: " + player.mp;
    };
    battle.playerStatus = new Label(battle.getPlayerStatus());
    battle.playerStatus.color = "#fff";
    battle.playerStatus.x = 200;
    battle.playerStatus.y = 120;
    battle.hitStrength = function(hit) {
      return Math.round((Math.random() + 0.5) * hit);
    };
    battle.won = function() {
      battle.over = true;
      player.exp += player.currentEnemy.exp;
      player.gp += player.currentEnemy.gp;
      player.currentEnemy.hp = player.currentEnemy.maxHp;
      player.statusLabel.text =
        "+ Respeito!<br />" +
        "Você ganhou " +
        player.currentEnemy.exp +
        " exp<br />" +
        "e " +
        player.currentEnemy.gp +
        "reais!";
      player.statusLabel.height = 45;
      if (player.exp > player.levelStats[player.level].expMax) {
        player.level += 1;
        player.statusLabel.text =
          player.statusLabel.text +
          "<br />E você ganhou um level de moral na quebrada!" +
          "<br />Você agora esta no nivel " +
          player.level +
          "!";
        player.statusLabel.height = 75;
      }
    };
    battle.lost = function() {
      battle.over = true;
      player.hp = player.levelStats[player.level].maxHp;
      player.mp = player.levelStats[player.level].maxMp;
      player.gp = Math.round(player.gp / 2);
      player.statusLabel.text = "Você perdeu!";
      player.statusLabel.height = 12;
    };
    battle.playerAttack = function() {
      var currentEnemy = player.currentEnemy;
      var playerHit = battle.hitStrength(player.attack());
      currentEnemy.hp = currentEnemy.hp - playerHit;
      battle.menu.text = "Você causou " + playerHit + " de dano!";
      if (currentEnemy.hp <= 0) {
        battle.won();
      }
    };
    battle.playerHeal = function() {
      if (player.inventory.includes(0)) {
        player.hp + 10 > player.levelStats[player.level].maxHp
          ? (player.hp = player.levelStats[player.level].maxHp)
          : (player.hp += 10);

        battle.menu.text = "Você recuperou 10 de vida!";
        player.inventory.splice(0, 1);
        return;
      } else {
        battle.menu.text = "Você nao possui cocaina";
        return;
      }
    };

    battle.enemyAttack = function() {
      var currentEnemy = player.currentEnemy;
      var enemyHit = battle.hitStrength(currentEnemy.attack);
      player.hp = player.hp - enemyHit;
      battle.menu.text = "Você tomou " + enemyHit + " de dano!";
      if (player.hp <= 0) {
        battle.lost();
      }
    };
    battle.actions = [
      {
        name: "Brigar",
        action: function() {
          battle.wait = true;
          battle.playerAttack();
          setTimeout(function() {
            if (!battle.over) {
              battle.enemyAttack();
            }
            if (!battle.over) {
              setTimeout(function() {
                battle.menu.text = battle.listActions();
                battle.wait = false;
              }, 1000);
            } else {
              setTimeout(function() {
                battle.menu.text = "";
                game.popScene();
              }, 1000);
            }
          }, 1000);
        }
      },
      {
        name: "Curar",
        action: function() {
          console.log(player.inventory);
          battle.wait = true;
          battle.playerHeal();
          setTimeout(function() {
            if (!battle.over) {
              battle.enemyAttack();
            }
            if (!battle.over) {
              setTimeout(function() {
                battle.menu.text = battle.listActions();
                battle.wait = false;
              }, 1000);
            } else {
              setTimeout(function() {
                battle.menu.text = "";
                game.popScene();
              }, 1000);
            }
          }, 1000);
        }
      },
      {
        name: "Fugir",
        action: function() {
          game.pause();
          player.statusLabel.text = "Você fugiu!";
          player.statusLabel.height = 12;
          battle.menu.text = "";
          game.popScene();
        }
      }
    ];
    battle.listActions = function() {
      battle.optionText = [];
      for (var i = 0; i < battle.actions.length; i++) {
        if (i === battle.activeAction) {
          battle.optionText[i] =
            "<span class='active-option'>" + battle.actions[i].name + "</span>";
        } else {
          battle.optionText[i] = battle.actions[i].name;
        }
      }
      return battle.optionText.join("<br />");
    };
    battle.addCombatants = function() {
      var image = new Surface(game.spriteSheetWidth, game.spriteSheetHeight);
      image.draw(game.assets["sprites.png"]);
      battle.player = new Sprite(game.spriteWidth, game.spriteHeight);
      battle.player.image = image;
      battle.player.frame = 7;
      battle.player.x = 150;
      battle.player.y = 120;
      battle.player.scaleX = 2;
      battle.player.scaleY = 2;
      battle.enemy = new Sprite(game.spriteWidth, game.spriteHeight);
      battle.enemy.image = image;
      battle.enemy.x = 150;
      battle.enemy.y = 70;
      battle.enemy.scaleX = 2;
      battle.enemy.scaleY = 2;
      battle.addChild(battle.enemy);
    };
    battle.addCombatants();

    battleScene.on("enter", function() {
      battle.over = false;
      battle.wait = true;
      battle.menu.text = "";
      battle.enemy.frame = player.currentEnemy.sprite;
      setTimeout(function() {
        battle.menu.text = battle.listActions();
        battle.wait = false;
      }, 500);
    });
    battleScene.on("enterframe", function() {
      if (!battle.wait) {
        if (game.input.a) {
          battle.actions[battle.activeAction].action();
        } else if (game.input.down) {
          battle.activeAction =
            (battle.activeAction + 1) % battle.actions.length;
          battle.menu.text = battle.listActions();
        } else if (game.input.up) {
          battle.activeAction =
            (battle.activeAction - 1 + battle.actions.length) %
            battle.actions.length;
          battle.menu.text = battle.listActions();
        }
        battle.playerStatus.text = battle.getPlayerStatus();
      }
    });
    battleScene.on("exit", function() {
      setTimeout(function() {
        battle.menu.text = "";
        battle.activeAction = 0;
        battle.playerStatus.text = battle.getPlayerStatus();
        game.resume();
      }, 1000);
    });
    battle.addChild(battle.playerStatus);
    battle.addChild(battle.menu);
    battle.addChild(battle.player);
    battleScene.addChild(battle);
  };
  var setShopping = function() {
    var shop = new Group();
    shop.itemSelected = 0;
    shop.shoppingFunds = function() {
      return "Dinheiro: " + player.gp;
    };
    shop.drawManeki = function() {
      var image = new Surface(game.spriteSheetWidth, game.spriteSheetHeight);
      var maneki = new Sprite(game.spriteWidth, game.spriteHeight);
      maneki.image = image;
      image.draw(game.assets["sprites.png"]);
      maneki.frame = 4;
      maneki.y = 10;
      maneki.x = 10;
      maneki.scaleX = 2;
      maneki.scaleY = 2;
      this.addChild(maneki);
      this.message.x = 40;
      this.message.y = 10;
      this.message.color = "#fff";
      this.addChild(this.message);
    };

    shop.drawItemsForSale = function() {
      for (var i = 0; i < game.items.length; i++) {
        var image = new Surface(
          game.itemSpriteSheetWidth,
          game.spriteSheetHeight
        );
        var item = new Sprite(game.spriteWidth, game.spriteHeight);
        image.draw(game.assets["items.png"]);
        itemLocationX = 30 + 70 * i;
        itemLocationY = 70;
        item.y = itemLocationY;
        item.x = itemLocationX;
        item.frame = i;
        item.scaleX = 2;
        item.scaleY = 2;
        item.image = image;
        this.addChild(item);
        var itemDescription = new Label(
          game.items[i].price + "<br />" + game.items[i].description
        );
        itemDescription.x = itemLocationX - 8;
        itemDescription.y = itemLocationY + 40;
        itemDescription.color = "#fff";
        this.addChild(itemDescription);
        if (i === this.itemSelected) {
          var image = new Surface(
            game.spriteSheetWidth,
            game.spriteSheetHeight
          );
          this.itemSelector = new Sprite(game.spriteWidth, game.spriteHeight);
          image.draw(game.assets["sprites.png"]);
          itemLocationX = 30 + 70 * i;
          itemLocationY = 160;
          this.itemSelector.scaleX = 2;
          this.itemSelector.scaleY = 2;
          this.itemSelector.y = itemLocationY;
          this.itemSelector.x = itemLocationX;
          this.itemSelector.frame = 7;
          this.itemSelector.image = image;
          this.addChild(this.itemSelector);
        }
      }
    };
    shop.on("enter", function() {
      shoppingFunds.text = shop.shoppingFunds();
    });
    shop.on("enterframe", function() {
      setTimeout(function() {
        if (game.input.a) {
          shop.attemptToBuy();
        } else if (game.input.down) {
          shop.message.text = shop.farewell;
          setTimeout(function() {
            game.popScene();
            shop.message.text = shop.greeting;
          }, 1000);
        } else if (game.input.left) {
          shop.itemSelected = shop.itemSelected + game.items.length - 1;
          shop.itemSelected = shop.itemSelected % game.items.length;
          shop.itemSelector.x = 30 + 70 * shop.itemSelected;
          shop.message.text = shop.greeting;
        } else if (game.input.right) {
          shop.itemSelected = (shop.itemSelected + 1) % game.items.length;
          shop.itemSelector.x = 30 + 70 * shop.itemSelected;
          shop.message.text = shop.greeting;
        }
      }, 500);
      player.showInventory(100);
      shoppingFunds.text = shop.shoppingFunds();
    });
    shop.attemptToBuy = function() {
      var itemPrice = game.items[this.itemSelected].price;
      if (player.gp < itemPrice) {
        this.message.text = this.apology;
      } else {
        player.visibleItems = [];
        player.gp = player.gp - itemPrice;
        player.inventory.push(game.items[this.itemSelected].id);
        this.message.text = this.sale;
      }
    };

    shop.greeting = "Eai meu patrão, qual vai ser?";
    shop.apology = "Você nao tem dinheiro para isso";
    shop.sale = "Vamo la!";
    shop.farewell = "Volte sempre!";
    shop.message = new Label(shop.greeting);
    shop.drawManeki();
    var shoppingFunds = new Label(shop.shoppingFunds());
    shoppingFunds.color = "#fff";
    shoppingFunds.y = 200;
    shoppingFunds.x = 10;
    shop.addChild(shoppingFunds);
    shop.drawItemsForSale();
    shopScene.backgroundColor = "#000";
    shopScene.addChild(shop);
  };

  game.focusViewport = function() {
    var x = Math.min((game.width - 16) / 2 - player.x, 0);
    var y = Math.min((game.height - 16) / 2 - player.y, 0);
    x = Math.max(game.width, x + map.width) - map.width;
    y = Math.max(game.height, y + map.height) - map.height;
    game.rootScene.firstChild.x = x;
    game.rootScene.firstChild.y = y;
  };
  game.onload = function() {
    setMaps();
    setPlayer();
    setStage();
    setShopping();
    setBattle();
    player.on("enterframe", function() {
      player.move();
      if (game.input.a) {
        var playerFacing = player.facing();
        if (!playerFacing || !spriteRoles[playerFacing]) {
          player.displayStatus();
        } else {
          spriteRoles[playerFacing].action();
        }
      }
    });
    game.rootScene.on("enterframe", function(e) {
      game.focusViewport();
    });
  };

  game.start();
};
