
/**
 * Space Invader Classic in Canvas
 * @author Roderick Ruotolo <roderickruotolo@gmail.com>
 */

var cv, ctx,
    gameSession;
    //hiScore = 2000;

/**
 * Draw Functions
 */
var background = function (color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, cv.width, cv.height);
};


var drawEllipse = function (x, y, w, h) {
    var kappa = .5522848,
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle

    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    //ctx.closePath(); // not used correctly, see comments (use to close off open path)
    //ctx.stroke();
    ctx.fill();
};

var drawEllipseByCenter = function (cx, cy, w, h) {
    drawEllipse(cx - w/2.0, cy - h/2.0, w, h);
};

// get integer random between two values
Math.getRandomInt = function (min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};


if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}


/**
 * Game Definitions
 */
var Definitions = {
    fontProperties : "17pt 'Courier'",
    pixelSize : 3,
    primaryColor : "#FFFFFF",
    secondaryColor : "#AAFFFF",
    backgroundColor : "#000000",
    widthScreen: 750,
    heightScreen: 680,
};

/**
 * Game Session
 */
var Session = function (Definitions) {
    this.players = new Array();
    this.definitions = Definitions;
    this.includePlayers = function (Player) {
        this.players.push(Player);
    }
    this.hiScore = 5000;
};

/**
 * Game Player
 */
var Player = function () {
    this.won = false;
    this.score = 0;
    this.isAlive = true;
    this.lives = 4;
    this.killed = function () {        
        this.lives--;
        if (this.lives == 0) {
            this.isAlive = false;
        }
    }
};


/**
 * Draw Score
 */
var drawHeader = function (Player1, Player2, HiScore) {

    var player1 = Player1;
    var score = new String(Player1.score);

    ctx.fillStyle = Definitions.primaryColor;
    ctx.font = Definitions.fontProperties;

    ctx.fillText("SCORE<1>", 20, 30);
    ctx.fillText(score.padStart(4, "0"), 40, 60);

    ctx.fillText("HI-SCORE", 310, 30);
    ctx.fillText(HiScore, 340, 60);

    ctx.fillText("SCORE<2>", 600, 30);
    ctx.fillText(score.padStart(4, "0"), 625, 60);
    //ctx.fillText(Player2.score, 40, 60);

};

var drawFooter = function () {
    ctx.fillStyle = Definitions.primaryColor;
    ctx.font = Definitions.fontProperties;
    ctx.fillText("CREDIT 00", 550, 670);
};

var generateFrames = function (callback) {    
    
    frameRate = 0;
    setInterval(function () {
        if (callback != null) {
            callback();
        }
        frameRate++;
    }, 60);

};

var typeWriter = function (text, x, y, callback) {
    
    var total = text.length;
    var counter = 0;
    var spaceLetter = 14;

    var clear = function(id) {
        clearInterval(id);
        if (callback != null) {
            callback();
        }
    };
    
    ctx.fillStyle = Definitions.primaryColor;
    ctx.fillText(text[0], x + counter * spaceLetter, y);

    var id = setInterval(function(){
        ctx.fillStyle = Definitions.primaryColor;
        ctx.fillText(text[counter], x + counter * spaceLetter, y);
        if (counter >= total -1) {
            clear(id);
            console.log("String digitada, animação finalizada! " + new Date());
        }
        counter++;
    }, 60);

}

var turnThePage = function (direction, callback) {

    var count = 0;
    var intDirection = 1;
    var initX = 0;
    var velocity = 6;

    if (direction == "left") {
        intDirection *= -1
        initX = cv.width;
    }

    var clear = function(id) {
        clearInterval(id);
        if (callback != null) {
            callback();
        }
    };

    var id = setInterval(function() {
        ctx.fillStyle = Definitions.backgroundColor;
        ctx.fillRect(40, 180, 40 + 5 * intDirection + count, 350);
        if (direction == "left" && count <= 0) {
            clear(id);
        }
        if (direction == "right" && count > cv.width - 60) {
            clear(id);
            console.log("Página virada " + new Date());
        }
        count += velocity;
    }, 50);

}

var Menu = {
    option : 1,
    altOption : function () {
        if (this.option == 1) {
            this.option = 2;
            this.drawTwoPlayers();
        } else if (this.option == 2) {
            this.option = 1;
            this.drawOnePlayer();
        }
    },
    drawOnePlayer : function () {
        players = 1;
        ctx.fillStyle = Definitions.secondaryColor;
        ctx.fillText("* 1 PLAYER", 290, 400);
        ctx.fillStyle = Definitions.primaryColor;
        ctx.fillText("* 2 PLAYERS", 290, 450);
    },
    drawTwoPlayers : function () {
        players = 2;
        ctx.fillStyle = Definitions.primaryColor;
        ctx.fillText("* 1 PLAYER", 290, 400);
        ctx.fillStyle = Definitions.secondaryColor;
        ctx.fillText("* 2 PLAYERS", 290, 450);
    }
};

/**
 *
 * Game Scene
 *
 */
var Scene = function (Session) {
    this.sceneName = "";
    this.session = Session;
    this.draw = function () {
        
    };
};

/**
 * Scene Menu
 */
var SceneMenu = function (Session) {
    Scene.call(this, Session);
    this.sceneName = "sceneMenu";
    this.draw = function () {        
        background(this.session.definitions.backgroundColor);
        drawHeader(this.session.players[0], this.session.players[1], this.session.hiScore);
        drawFooter();
        ctx.fillText("Press   Enter   KEY", 250, 300);
        ctx.fillText("<1 OR 2 PLAYERS>", 270, 350);    
        Menu.drawOnePlayer();
        ctx.fillStyle = Session.definitions.primaryColor;
    };
};
SceneMenu.prototype = Object.create(Scene.prototype);

var SceneInstructions = function (Session) {
    Scene.call(this, Session);
    this.sceneName = "sceneInstructions";
    this.draw = function () {

        background(this.session.definitions.backgroundColor);
        drawHeader(Session.players[0], Session.players[1], this.session.hiScore);
        drawFooter();
        
        var ufo     = new UfoInvader(cv.width / 3.3, cv.height  / 1.95);
        var small   = new SmallInvader(cv.width / 3.14, cv.height / 1.79);
        var medium  = new MediumInvader(cv.width / 3.18, cv.height / 1.63);
        var large   = new LargeInvader(cv.width / 3.2, cv.height  /  1.47);

        ObjectsInStage.avatars = new Array(ufo, small, medium, large);
        ctx.fillText("*SCORE   ADVANCE   TABLE*", cv.width / 3.9, cv.height / 2.1);

        typeWriter("PLAY", cv.width / 2.4, cv.height / 3.3, function() {
            typeWriter("SPACE    INVADERS!", cv.width / 3.1, cv.height / 2.7, function() {
                for (var i = 0; i < ObjectsInStage.avatars.length; i++) {
                    ObjectsInStage.avatars[i].render();
                }
                typeWriter("= ? MISTERY", cv.width / 2.5, cv.height / 1.85, function() {
                    typeWriter("= 30 POINTS", cv.width / 2.5, cv.height / 1.7, function() {
                        typeWriter("= 20 POINTS", cv.width / 2.5, cv.height / 1.55, function() {
                            typeWriter("= 10 POINTS", cv.width / 2.5, cv.height / 1.4, function (){ 
                                turnThePage("right");
                             })
                        })
                    })
                })
            })
        });
    };
};
SceneInstructions.prototype = Object.create(Scene.prototype);

/**
 * Scene Default Run Game
 */
var SceneGame = function (Session) {
    Scene.call(this, Session);
    this.sceneName = "sceneGame"; 
    
    //var timeScene = 7;    
    var timeScene = 14;
    var count = 0;
    var start = null;
    

    this.draw = function () {

        var parent = this;

        background(parent.session.definitions.backgroundColor);
        ctx.font = parent.session.definitions.fontProperties;
        drawHeader(parent.session.players[0], parent.session.players[1], parent.session.hiScore);
        drawFooter();
        ctx.fillText("PLAY  PLAYER <1>", cv.width / 3, cv.height / 2.1); 

        window.setTimeout(function () {
            
            background(parent.session.definitions.backgroundColor);
            drawHeader(parent.session.players[0], parent.session.players[1], parent.session.hiScore);
            drawFooter();

            ObjectsInStage.stageIsOver = false;

            //ObjectsInStage
            ufo1 = new UfoInvader(50, 90);
            ObjectsInStage.ufo = [ufo1];
            ObjectsInStage.cannon = new CoreCannon(50, 580);
            ObjectsInStage.alienInvaders = createSpaceInvaders();
            ObjectsInStage.laserCannon = new Array();

            
            masks = new SpaceInvadersMask(ObjectsInStage.alienInvaders);
            masks.create();

            window.setInterval(function() {

                background(parent.session.definitions.backgroundColor);
                drawHeader(parent.session.players[0], parent.session.players[1], parent.session.hiScore);
                drawFooter();

                var toogle = (count % timeScene == 0);
                
                
                // ufo movement
                if (ObjectsInStage.ufo[0].x > cv.width + 100 || ObjectsInStage.ufo[0].x < -100) {
                    ObjectsInStage.ufo[0].direction *= -1;
                } // ufo move and render
                ObjectsInStage.ufo[0].move(ObjectsInStage.ufo[0].velocity, 0);
                ObjectsInStage.ufo[0].render();


                ObjectsInStage.cannon.render();                
                
                // render all aliens invaders from game
                ObjectsInStage.renderInvaders();

                // verifica colisões do lazer atirado pelo jogador
                ObjectsInStage.verifyCannonShoot(parent.session);

                ObjectsInStage.animateInvaders(count % 10 == 0);

                // Efeito para simular renzerização dos invasores finalizado!
                if (masks.animatedFinished) {
                    if (count % 2 == 0) {
                        ObjectsInStage.moveInvadersTroopers(8, 8);
                    }
                    // Music and UFOs sound
                    if (count % 2 == 0) {
                        if (toogle) {
                            //SoundsManager.playSoundTrack();
                        }
                        if (ObjectsInStage.ufo[0].isAlive && (count % 5 == 0)) {
                            //SoundsManager.playSound('ufoHighpitch');                        
                        }
                    }
                } else {
                    // Efeito para simular renderização dos invasores...
                    masks.run();
                }

                if (count > 6000) {
                    count = 0;
                }

                if (count > 500) {
                    console.log("agora o jogo começou");
                }

                count++;

            }, 60);
            
            var controlsGame = function (e) {
                var key = e.which || e.keyCode;

                // shoot
                if (key === 32) { // 32 space
                    // atira apenas um lazer por vez
                    if ( ObjectsInStage.lasersAreDead() ) {
                        ObjectsInStage.cannon.shoot();
                        SoundsManager.playSound('invaderKilled');
                    }
                // move left
                } else if (key === 37) {
                    ObjectsInStage.cannon.move(ObjectsInStage.cannon.x - ObjectsInStage.cannon.velocity, 0);
                // move right
                } else if (key === 39) {
                    ObjectsInStage.cannon.move(ObjectsInStage.cannon.x + ObjectsInStage.cannon.velocity, 0);
                }
            };

            window.addEventListener("keydown", controlsGame);
            if (ObjectsInStage.stageIsOver) {            
                window.removeEventListener("keydown", controlsGame);
            }

            

        }, 2000);


    };
};
SceneGame.prototype = Object.create(Scene.prototype);

/**
 * Scene Winner
 */
var SceneWinner = function (Session) {
    Scene.call(this, Session);
    this.sceneName = "sceneWinner"; 
    this.draw = function () {
        background(this.session.definitions.backgroundColor);
        ctx.font = this.session.definitions.fontProperties;
        ctx.fillText("Thanks for Playing!", 10, 50);
    };
};
SceneWinner.prototype = Object.create(Scene.prototype);
/**
 * Scene Loser
 */
var SceneLoser = function (Session) {
    Scene.call(this, Session);
    this.sceneName = "sceneLoser"; 
    this.draw = function () {
        background(this.session.definitions.backgroundColor);
        ctx.font = this.session.definitions.fontProperties;
        ctx.fillText("You Lose!",10,50);
    };
};
SceneLoser.prototype = Object.create(Scene.prototype);


/**
 * Scenes Manager
 */
var ScenesManager = function (GameScenes) {
    this.currentScene = 0;
    this.won = false;
    this.gameScenes = GameScenes;
    this.nextScene = function () {
        if (this.currentScene == 2 && this.won) {
            this.currentScene = 3;
            this.gameScenes[3];
        } else if (this.currentScene == 2 && !this.won) {
            this.currentScene = 3;
            this.gameScenes[3];
        } else {
            this.currentScene++;
            this.gameScenes[this.currentScene];
            console.log("Cena atual: " + this.currentScene + " " + new Date());
        }
    },
    this.run = function () {
        var parent = this;
        //this.gameScenes[this.currentScene].objectsInStage = this.objectsInStage;
        this.gameScenes[this.currentScene].draw();

        // Aqui iniciamos o menu e setaremos o objeto Definitions 
        // dependendo das escolhas do usuário 
        if (this.gameScenes[this.currentScene].sceneName == "sceneMenu") {
            var initGame = function (e) {
                var key = e.which || e.keyCode;
                if (key === 13) { // 13 is enter
                    // code for enter
                    parent.nextScene();
                    window.removeEventListener("keydown", initGame);
                    parent.run();
                } else if (key === 38 || key === 40) {
                    Menu.altOption();
                }
            };
            window.addEventListener("keydown", initGame);

        // Aqui roda a cena de preparação onde são mostradas as pontuações básicas
        } else if (this.gameScenes[this.currentScene].sceneName == "sceneInstructions") {
            
            window.setTimeout(function () {
                console.log("Terminada cena de preparação "  + new Date());
                parent.nextScene();
                parent.run();
            }, 10000);

        // Aqui a lógica do jogo, criação e 
        // comportamento dos objetos relativos aos personagens, 
        // dificuldade e tals
        } else if (this.gameScenes[this.currentScene].sceneName == "sceneGame") {
            
            
            //console.log(ObjectsInStage);

        }
    }
};


/**
 * @return Array - a object array
 */
var createSpaceInvaders = function () { 
    
    var AlienInvaders = [];

    // Create indexes for push
    for (var i = 0; i < 5; i++) {
        AlienInvaders[i] = [];
    }
    // Populate array
    for (var i = 0; i < 11; i++) {
        // Create Small Invaders
        AlienInvaders[0][i] = new SmallInvader(100 + (50 * i), 20 + 140);

        // Create Medium Invaders
        AlienInvaders[1][i] = new MediumInvader(100 + (50 * i), 20 + 180);
        AlienInvaders[2][i] = new MediumInvader(100 + (50 * i), 20 + 220);

        // Create Large Invaders
        AlienInvaders[3][i] = new LargeInvader(100 + (50 * i), 20 + 260);
        AlienInvaders[4][i] = new LargeInvader(100 + (50 * i), 20 + 300);

    }
    return AlienInvaders;
};

var SpaceInvadersMask = function (AlienInvaders) {
    this.aliens = AlienInvaders;
    this.masks = new Array();
    this.totalMasks = 0;
    this.animatedFinished = false;
    this.create = function () {
        for (var i = 0; i < this.aliens.length; i++) {
            for (var j = 0; j < this.aliens[i].length; j++) {
                this.masks.push({
                    x:this.aliens[i][j].x, 
                    y:this.aliens[i][j].y, 
                    w:this.aliens[i][j].width, 
                    h:this.aliens[i][j].height
                });
            }
        }
        this.totalMasks = this.masks.length - 1;
    };
    this.render = function () {
        if (this.totalMasks > 0) {            
            ctx.fillStyle = "#000000";
            for (var i = 0; i < this.totalMasks; i++) {
                ctx.fillRect(this.masks[i].x, this.masks[i].y, 40, 40);
            }
        }
    };
    this.remove = function () {
        this.totalMasks--;
    };
    this.run = function () {
        // Efeito para mostrar os invasores...
        if (this.totalMasks > 0) {
            for (var i = 0; i < 2; i++) {
                this.render();
                this.remove();
            }
        } else {
            this.animatedFinished = true;
        }
    }
};



/**
 * Object Game
 */
var ObjectGame = function (x, y) {
    //this.centerX;
    //this.centerY;
    this.x = x;
    this.y = y;
    this.maps;
    this.currentMap = 0;
    this.isAlive = 1;
    this.velocity = 1;
    this.color = Definitions.primaryColor;
    this.direction = 1;
};

ObjectGame.prototype.render = function () {
    if (this.maps.length > 0) {
        for (var i = 0; i < this.maps[this.currentMap].length; i++) {
            for (var j = 0; j < this.maps[this.currentMap][i].length; j++) {
                if (this.maps[this.currentMap][i][j]) {
                    ctx.fillStyle = this.color;
                } else {
                    ctx.fillStyle = Definitions.backgroundColor;
                }
                ctx.fillRect(
                    this.x + Definitions.pixelSize * j, 
                    this.y + Definitions.pixelSize * i, 
                    Definitions.pixelSize, Definitions.pixelSize
                );
            }
        }
    } else {
        new Error("The propertie maps is empty");
    }
};


ObjectGame.prototype.move = function (x, y) {    
    this.x += x * this.direction * this.velocity;
    this.y += y * this.direction * this.velocity;
};

// if Collision detected return true
ObjectGame.prototype.verifyColision = function (target) {
    return (
        this.x < target.x + target.width &&
        this.x + this.width > target.x &&
        this.y < target.y + target.height &&
        this.height + this.y > target.y
    );
};

// Object collection from Scene
var ObjectsInStage = { currentLineInvaders : 4, directionInvaders : 1 };

// animate space invaders
ObjectsInStage.animateInvaders = function (toogle) {    
    for (var i = 0; i < this.alienInvaders.length; i++) {
        for (var j = 0; j < this.alienInvaders[i].length; j++) {
            this.alienInvaders[i][j].alternateMap(toogle);
        }
    }
    for (var i = 0; i < this.ufo.length; i++) {
        this.ufo[i].alternateMap(toogle);
    }
};

// render all aliens invaders from game        
ObjectsInStage.renderInvaders = function () {    
    for (var i = 0; i < this.alienInvaders.length; i++) {
        for (var j = 0; j < this.alienInvaders[i].length; j++) {
            this.alienInvaders[i][j].render();
        }
    }
};

// move laserCannons
ObjectsInStage.moveLaserCannon = function () {    
    if (this.laserCannon.length > 0) {
        for (var i = 0; i < this.laserCannon.length; i++) {
            this.laserCannon[i].move();
        }
    }
};

ObjectsInStage.lasersAreDead = function () {
    if (this.laserCannon.length > 0) {
        for (var i = 0; i < this.laserCannon.length; i++) {
            if (this.laserCannon[i].isAlive) {
                return false;
            }
        }
    }
    return true;
};

ObjectsInStage.verifyCannonShoot = function (Session) {

    if (this.laserCannon.length > 0) {
        
        // Varre cada projétil e os move, quadro a quadro
        for (var i = 0; i < this.laserCannon.length; i++) {
            
            if (this.laserCannon[i].isAlive == 1) {

                this.laserCannon[i].move();
                
                // passado o limite do alvo o projétil se destrói
                if (this.laserCannon[i].y < 0) {
                    ctx.fillStyle = (255, 200, 200);
                    drawEllipseByCenter(this.laserCannon[i].x, 3, 20, 10);
                    this.laserCannon[i].isAlive = 0;
                }

                // Verify colisions with Aliens Invaders
                for (var j = 0; j < this.alienInvaders.length; j++) {
                    for (var k = 0; k < this.alienInvaders[j].length; k++) {
                        if (this.laserCannon[i].isAlive == 1 && this.alienInvaders[j][k].isAlive == 1) {                            
                            if ( this.laserCannon[i].collisionWasDetected(this.alienInvaders[j][k]) ) {                                
                                // collision detected!
                                this.alienInvaders[j][k].currentMap = 2;
                                this.alienInvaders[j][k].isAlive = 0;
                                this.laserCannon[i].isAlive = 0;
                                SoundsManager.playSound('shoot');
                                // Sum points to Player
                                Session.players[0].score += this.alienInvaders[j][k].points;
                            }
                        }
                    }
                }

                // verify colision with UFO
                for (var u = 0; u < this.ufo.length; u++) {
                    //console.log(this.laserCannon[i].isAlive);
                    if (this.laserCannon[i].isAlive == 1 && this.ufo[u].isAlive == 1) {
                        if ( this.laserCannon[i].collisionWasDetected(this.ufo[u]) ) {
                            // collision detected!
                            // ctx.fillStyle = (255, 200, 200);
                            // drawEllipseByCenter(this.laserCannon[i].x, this.laserCannon[i].y, 30, 10);
                            this.ufo[u].currentMap = 2;
                            this.ufo[u].isAlive = 0;
                            this.laserCannon[i].isAlive = 0;
                            ctx.fillText(this.ufo[u].points, this.ufo[u].x + this.ufo[u].width * 0.3, this.ufo[u].y + this.ufo[u].height * 1.05);
                            Session.players[0].score += this.ufo[u].points;
                            SoundsManager.playSound('ufoLowpitch');
                        }
                    }
                }                    
            

            }

        }

    }

};


ObjectsInStage.moveInvadersTroopers = function (x, y) { 

    var stepY = 0;
    var condition = (this.alienInvaders[0][10].x > cv.width - 60 || this.alienInvaders[0][0].x < 15);

    if (condition) {
        this.directionInvaders *= -1;
        stepY = y;
    }

    for (var i = 0; i < this.alienInvaders[this.currentLineInvaders].length; i++) {
        if (this.currentLineInvaders % 2 > 0 && condition) {
            this.alienInvaders[this.currentLineInvaders][i].move(x * this.directionInvaders * -1, 0 + stepY); 
        } else {
            this.alienInvaders[this.currentLineInvaders][i].move(x * this.directionInvaders, 0 + stepY); 
        }
    }

    if (this.currentLineInvaders == 0) {
        this.currentLineInvaders = 4;
    } else {
        this.currentLineInvaders--;
    }

};

// Alien invaders from game
var Invader = function (x, y) {
    ObjectGame.call(this, x, y);
    this.currentMap = 0;
};

Invader.prototype = Object.create(ObjectGame.prototype);

Invader.prototype.alternateMap = function (statusToggle) {
    if (statusToggle && this.currentMap == 0) {
        this.currentMap = 1;
    } else if (statusToggle && this.currentMap == 1) {
        this.currentMap = 0;
    } else if (statusToggle && this.currentMap == 2) {
        this.currentMap = 3;
    }    
    //this.render(this.maps[this.currentMap], this.x, this.y);    
};

var SmallInvader = function (x, y) {
    ObjectGame.call(this, x, y);
    this.points = 30;
    this.maps = [
        PixelSprites.Squid, 
        PixelSprites.Squid2, 
        PixelSprites.AlienExplosion, 
        PixelSprites.Dead
    ];
    this.width = Definitions.pixelSize * this.maps[0][0].length;
    this.height = Definitions.pixelSize * this.maps[0].length;
};
SmallInvader.prototype = Object.create(Invader.prototype);

var MediumInvader = function (x, y) {
    ObjectGame.call(this, x, y);
    this.points = 20;
    this.maps = [
        PixelSprites.Crab, 
        PixelSprites.Crab2, 
        PixelSprites.AlienExplosion, 
        PixelSprites.Dead
    ];
    this.width = Definitions.pixelSize * this.maps[0][0].length;
    this.height = Definitions.pixelSize * this.maps[0].length;
};
MediumInvader.prototype = Object.create(Invader.prototype);

var LargeInvader = function (x, y) {
    ObjectGame.call(this, x, y);
    this.points = 10;
    this.maps = [
        PixelSprites.Jellyfish, 
        PixelSprites.Jellyfish2, 
        PixelSprites.AlienExplosion, 
        PixelSprites.Dead
    ];
    this.width = Definitions.pixelSize * this.maps[0][0].length;
    this.height = Definitions.pixelSize * this.maps[0].length;
};
LargeInvader.prototype = Object.create(Invader.prototype);

var UfoInvader = function (x, y) {
    ObjectGame.call(this, x, y);
    this.color = "red";
    this.points = (new Array(50, 100, 150))[Math.getRandomInt(0, 2)]; // personality function
    this.velocity = 2;
    this.maps = [
        PixelSprites.UFO, 
        PixelSprites.UFO, 
        PixelSprites.AlienExplosion, 
        PixelSprites.Dead
    ];
    this.width = Definitions.pixelSize * this.maps[0][0].length;
    this.height = Definitions.pixelSize * this.maps[0].length;
}
UfoInvader.prototype = Object.create(Invader.prototype);

var CoreCannon = function(x, y) {     
    Invader.call(this, x, y);
    this.color = Definitions.secondaryColor;
    this.velocity = 8;
    this.maps = [
        PixelSprites.Cannon, 
        PixelSprites.Cannon, 
        PixelSprites.AlienExplosion, 
        PixelSprites.Dead
    ];
    this.width = Definitions.pixelSize * this.maps[0][0].length;
    this.height = Definitions.pixelSize * this.maps[0].length;
};
CoreCannon.prototype = Object.create(Invader.prototype);

// Lateral Colision of CoreCannon
CoreCannon.prototype.move = function (positionX) {
    var insideRightLimit = (positionX < cv.width - this.width);
    var insideLeftLimit = (positionX > 1);
    if (insideLeftLimit && insideRightLimit) {
        this.x = positionX;
    }
};

CoreCannon.prototype.shoot = function() {
    var laserCannon = new LaserCannon(this.x + (this.width / 2 - 1), this.y);
    ObjectsInStage.laserCannon.push(laserCannon);
};



var LaserCannon = function (x, y) {
    this.x = x;
    this.y = y - 10;
    //this.velocity = 48;
    this.velocity = 30;
    this.isAlive = 1;
    this.width = 3;
    this.height = 15;
    this.color = Definitions.primaryColor;
};

LaserCannon.prototype.move = function () {
    this.y -= this.velocity;
    this.render();
};

LaserCannon.prototype.render = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
};

LaserCannon.prototype.collisionWasDetected = function (target) {
    // if Collision detected!
    return (
        this.x < target.x + target.width &&
        this.x + this.width > target.x &&
        this.y < target.y + target.height &&
        this.height + this.y > target.y
    );
};


// Laser Invader
var LaserInvaders = function (x, y) {
    LaserCannon.call(this, x, y);
};
LaserInvaders.prototype = Object.create(LaserCannon.prototype);

LaserInvaders.prototype.move = function () {
    this.y += this.velocity;
    this.render();             
};


var LaserSmallInvader = function (x, y) {
    LaserInvaders.call(this, x, y);
};
LaserSmallInvader.prototype = Object.create(LaserInvaders.prototype);
LaserSmallInvader.prototype.render = function () {
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x + 1, this.y);
    ctx.lineTo(this.x - 1, this.y + 3.75);
    ctx.lineTo(this.x + 1, this.y + 7.5);
    ctx.lineTo(this.x - 1, this.y + 11.25);
    ctx.lineTo(this.x + 1, this.y + 15);
    ctx.stroke();
};


var LaserMediumInvader = function (x, y) {
    LaserInvaders.call(this, x, y);
};
LaserMediumInvader.prototype = Object.create(LaserInvaders.prototype);
LaserMediumInvader.prototype.render = function () {
    //ctx.lineWidth = 3;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 0.75, this.y, this.width / 2, this.height - 3);
    ctx.beginPath();
    ctx.moveTo(this.x - 3, this.y + 10);
    ctx.lineTo(this.x + 3, this.y + 10);
    ctx.lineTo(this.x + 0, this.y + 15);
    ctx.fillStyle = this.color;
    ctx.fill();
};


var LaserLargeInvader = function (x, y) {
    LaserInvaders.call(this, x, y);
};
LaserLargeInvader.prototype = Object.create(LaserInvaders.prototype);
LaserLargeInvader.prototype.render = function () {
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x - 1.5, this.y);
    ctx.lineTo(this.x + 1.5, this.y + 5);
    ctx.lineTo(this.x - 1.5, this.y + 10);
    ctx.lineTo(this.x + 1.5, this.y + 15);
    ctx.stroke();
};


var LaserUfoInvader = function (x, y) {
    LaserInvaders.call(this, x, y);
};
LaserUfoInvader.prototype = Object.create(LaserInvaders.prototype);
LaserUfoInvader.prototype.render = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width / 2, this.height);
    ctx.fillRect(this.x - 3.5, this.y, this.width + 6, this.width / 2);
};





var BaseShelter = function (x, y) {
    ObjectGame.call(this, x, y);
    this.currentMap = 0;
};

BaseShelter.prototype = Object.create(ObjectGame.prototype);

var SoundsManager = {
    sounds : {
        shoot : "shoot.wav",
        explosion : "explosion.wav",
        ufoLowpitch : "ufo_lowpitch.wav",
        ufoHighpitch : "ufo_highpitch.wav",
        fastInvader1 : "fastinvader1.wav",
        fastInvader2 : "fastinvader2.wav",
        fastInvader3 : "fastinvader3.wav",
        fastInvader4 : "fastinvader4.wav",
        invaderKilled : "invaderkilled.wav"
    },
    loadSounds : function () {
        for (soundId in this.sounds) {
            createjs.Sound.registerSound('sounds/' + this.sounds[soundId], soundId);
        }
    },
    playSound: function (soundId) {
        createjs.Sound.play(soundId);
    },
    backgroundSounds: [
        'fastInvader4',
        'fastInvader1',
        'fastInvader2',
        'fastInvader3'
    ],
    currentSoundTrack : 0,
    nexSoundTrack : function () {
        if (this.currentSoundTrack >= this.backgroundSounds.length - 1) {
            this.currentSoundTrack = 0; 
        } else {
            this.currentSoundTrack++;
        }
    },
    playSoundTrack : function () {
        console.log(this.backgroundSounds[this.currentSoundTrack]);
        this.playSound(this.backgroundSounds[this.currentSoundTrack]);
        this.nexSoundTrack();
    }
};

var SetUp = function () {
    this.init = function () {        
        cv = document.getElementById("cv");
        cv.width = Definitions.widthScreen;
        cv.height = Definitions.heightScreen;
        ctx = cv.getContext("2d");
    }   
};

var SpaceInvaders = function () {

    this.init = function () {

        gameSession = new Session(Definitions);

        gamePlayer1 = new Player();
        gamePlayer2 = new Player();

        gameSession.includePlayers(gamePlayer1);
        gameSession.includePlayers(gamePlayer2);
        
        var GameScenes = [
            new SceneMenu(gameSession), 
            new SceneInstructions(gameSession), 
            new SceneGame(gameSession), 
            new SceneWinner(gameSession), 
            new SceneLoser(gameSession)
        ];        

        var GameScenes = [new SceneGame(gameSession)];
        var scenesManager = new ScenesManager(GameScenes);
        scenesManager.run();

    };

};


// Início de todas as chamadas do jogo
window.addEventListener("load", function () {
    var setUp = new SetUp();
    var game = new SpaceInvaders();
    setUp.init();
    game.init();
    SoundsManager.loadSounds();
});

  