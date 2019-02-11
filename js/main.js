const defaultSettings = {
    defaultSpeed: 250,
    cellSize: 20,
    gapSize: 1,
    offsetSize: undefined,
    fieldSX: 10,
    fieldSY: 20
}

defaultSettings.offsetSize = defaultSettings.cellSize + defaultSettings.gapSize;

let settings = defaultSettings;

const colors = {
    light: '#DADADA',
    blue: '#1E50E6',
    red: '#D72328',
    yellow: '#DCCD23',
    green: '#41BE55',
    purple: '#7350C8',
    lightBlue: '#23AFD7',
    pink: '#DC2387',
    gray: '#525252',
    dark: '#424242'
}

const side = {
    left: 1,
    right: 2,
    bottom: 3
}

const keys = {
    esc: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    a: 65,
    w: 87,
    d: 68,
    s: 83
}

const figures = [
   [[1],[1],[1],[1]],
   [[0,0,2],[2,2,2]],
   [[3,3,3],[0,0,3]],
   [[4,4],[4,4]],
   [[6,0],[6,6],[6,0]],
   [[0,5],[5,5],[5,0]],
   [[7,0],[7,7],[0,7]]
];

let game = {
    matrix: undefined,
    score: 0,
    interval: undefined,
    currentSpeed: settings.defaultSpeed,
    nextFigure: undefined,
    figure: undefined,
    figurePosition: undefined,
    pause: true,
    end: false,

    create: function() {
        this.pause = true;
        this.end = false;
        this.score = 0;
        this.currentSpeed = settings.defaultSpeed;
        this.over = false;
        this.matrix = new Array(settings.fieldSX);
        for (let i = 0; i < settings.fieldSX; ++i) {
            this.matrix[i] = new Array(settings.fieldSY);
            for (let j = 0; j < settings.fieldSY; ++j) {
                this.matrix[i][j] = -1;
            }
        }
        this.addFigure();
    },

    start: function() {
        this.setSpeed(this.currentSpeed);
    },

    random: function(minimum, maximum) {
        return Math.floor(minimum + Math.random() * (maximum + 1 - minimum));
    },

    addFigure: function() {
        if (this.nextFigure != undefined) {
            this.figure = this.nextFigure;
        } else {
            this.figure = figures[this.random(0, 6)];
        }
        let left = parseInt((settings.fieldSX - this.figure.length) / 2);
        this.figurePosition = [left, 0];
        do {
            this.nextFigure = figures[this.random(0, 6)];
        } while (this.nextFigure == this.figure);
    },

    setSpeed: function(speed) {
        clearInterval(this.interval);
        interval = setInterval(function() {
            if (!game.pause) {
                game.moveFigure();
                frame.drawFrame();
            }
        }, speed);
    },

    canShift: function(figure, position, direction = side.bottom) {
        let directionX = 0;
        if (direction == side.left) directionX = -1;
        else if (direction == side.right) directionX = 1;
        let directionY = (direction == side.bottom) ? 1 : 0;
        let x, y;
        let result = true;
        for (let i = 0; i < figure.length && result; ++i)
            for (let j = 0; j < figure[0].length && result; ++j) {
                x = position[0] + i + directionX;
                y = position[1] + j + directionY;
                if (!this.isOnField(x, y)) result = false;
                else if (figure[i][j] && game.matrix[x][y] != -1) result = false;
            }
        return result;
    },

    shiftFigure: function(direction = side.bottom) {
        let result = this.canShift(this.figure, this.figurePosition, direction);
        if (result) {
            if (direction == side.left) --this.figurePosition[0];
            else if (direction == side.right) ++this.figurePosition[0];
            else ++this.figurePosition[1]
        }
        return result; 
    },

    isOnField: function(x, y) {
        return x >= 0 && x < settings.fieldSX && y < settings.fieldSY;
    },

    rotateFigure: function() {
        let width = this.figure.length;
        let height = this.figure[0].length;
        let rotatedFigure = new Array(height);
        for (let i = 0; i < height; ++i) {
            rotatedFigure[i] = new Array(width);
        }
        for (var i = 0; i < width; ++i) {
            for (var j = 0; j < height; ++j) {
                rotatedFigure[height - j - 1][i] = this.figure[i][j];
            }
        }
        if (this.canShift(rotatedFigure, this.figurePosition)) {
            this.figure = rotatedFigure;
        }
    },

    countEmptyCells: function(line) {
        let n = 0;
        for (let i = 0; i < settings.fieldSX; ++i) {
            if (this.matrix[i][line] == -1) {
                ++n;
            }
        }
        return n;
    },

    checkLines: function() {
        let top = 0;
        for (let line = settings.fieldSY - 1; line > top; --line) {
            while (!this.countEmptyCells(line)) {
                for (let j = line - 1; j >= top; --j) {
                    for (let i = 0; i < settings.fieldSX; ++i) {
                        game.matrix[i][j + 1] = game.matrix[i][j];
                    }
                }
                ++top;
                score += settings.fieldSX;
            }
        }
    },

    moveFigure: function() {
        if (!this.shiftFigure()) {
            for (let i = 0; i < this.figure.length; ++i) {
                for (let j = 0; j < this.figure[0].length; ++j) {
                    if (this.figure[i][j]) {
                        let x = this.figurePosition[0] + i;
                        let y = this.figurePosition[1] + j;
                        this.matrix[x][y] = this.figure[i][j];
                    }
                }
            }
            let cost = 0;
            for (let i = 0; i < this.figure.length; ++i) {
                for (let j = 0; j < this.figure[0].length; ++j) {
                    if (this.figure[i][j]) {
                        ++cost;
                    }
                }
            }
            score += cost;
            this.checkLines();
            let x = parseInt((settings.fieldSX - this.nextFigure.length) / 2);
            if (!this.canShift(this.nextFigure, [x, -1])) {
                this.pause = true;
                this.end  = true;
                frame.drawFrame();
                clearInterval(game.interval);
            } else {
                this.addFigure();
            }
        }
    },

    dropFigure: function() {
        while (this.canShift(this.figure, this.figurePosition)) {
            this.moveFigure();
        }
    }
}

let scoreElement = document.getElementById('score');

let frame = {
    canvas: document.getElementById('canvas'),
    context: undefined,

    drawFrame: function() {
        this.setColor();
        this.context.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < settings.fieldSX + 2; ++i) {
            for (let j = 0; j < settings.fieldSY + 2; ++j) {
                let color = 0;
                if (i > 0 && 
                    j > 0 && 
                    i < settings.fieldSX + 1 && 
                    j < settings.fieldSY + 1) {
                    color = game.matrix[i - 1][j - 1];
                }
                this.setColor(color);
                this.drawCell(i, j);
            }
        }
        this.setColor(0);
        let nextFrameSI = settings.fieldSX + 3;
        let nextFrameEI = settings.fieldSX + 8;
        for (let i = nextFrameSI; i <= nextFrameEI; ++i) {
            for (let j = 0; j < 6; ++j) {
                if (i == nextFrameSI || j == 0 || i == nextFrameEI || j == 5) {
                    this.drawCell(i, j);
                }
            }
        }
        for (let i = 0; i < game.nextFigure.length; ++i) {
            for (let j = 0; j < game.nextFigure[0].length; ++j) {
                if (game.nextFigure[i][j]) {
                    this.setColor(game.nextFigure[i][j]);
                    let x = i + nextFrameSI + 1;
                    if (game.nextFigure.length < 3) {
                        ++x;
                    }
                    let y = j + 2;
                    this.drawCell(x, y);
                }
            }
        }
        this.setColor(0);
        scoreElement.innerText = game.score;
        if (game.pause) {
            let left = nextFrameSI * settings.offsetSize;
            let right = (nextFrameEI + 1) * settings.offsetSize;
            let x = (right + left) / 2;
            let y = 7 * settings.offsetSize;
            let text = (game.end) ? 'GAME OVER' : 'PAUSE';
            this.context.fillText(text, x, y);
        }
        let shadowPosition = [game.figurePosition[0], game.figurePosition[1]];
        while (game.canShift(game.figure, shadowPosition)) ++shadowPosition[1];
        for (let i = 0; i < game.figure.length; ++i) {
            for (let j = 0; j < game.figure[0].length; ++j) {
                if (game.figure[i][j]) {
                    this.setColor(8);
                    let x = i + shadowPosition[0] + 1;
                    let y = j + shadowPosition[1] + 1;
                    this.drawCell(x, y);
                    this.setColor(game.figure[i][j]);
                    x = i + game.figurePosition[0] + 1;
                    y = j + game.figurePosition[1] + 1;
                    this.drawCell(x, y);
                }
            }
        }
    },

    drawCell: function(i, j) {
        this.context.fillRect(
            i * settings.offsetSize, 
            j * settings.offsetSize, 
            settings.cellSize,
            settings.cellSize
        );
    },

    setColor: function(code = -1) {
        this.context.fillStyle = 
        (code == 0) ? colors.light :
        (code == 1) ? colors.blue :
        (code == 2) ? colors.red :
        (code == 3) ? colors.yellow :
        (code == 4) ? colors.green :
        (code == 5) ? colors.purple :
        (code == 6) ? colors.lightBlue :
        (code == 7) ? colors.pink :
        (code == 8) ? colors.gray :
        colors.dark;
    },

    initialize: function() {
        let fieldSX = 7;
        fieldSX += settings.fieldSX + 2;
        let fieldSY = settings.fieldSY + 2;
        let fieldWidth = fieldSX * settings.cellSize;
        fieldWidth += (fieldSX - 1) * settings.gapSize;
        let fieldHeight = fieldSY * settings.cellSize;
        fieldHeight += (fieldSY - 1) * settings.gapSize;
        this.canvas.width = fieldWidth;
        this.canvas.style.width = fieldWidth + 'px';
        this.canvas.height = fieldHeight;
        this.canvas.style.height = fieldHeight + 'px';
        this.context = canvas.getContext('2d');
        this.context.font = (settings.cellSize - 5) + 'px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
    }
}

let leftButton = document.getElementById('left');
let rightButton = document.getElementById('right');
let rotateButton = document.getElementById('rotate');
let downButton = document.getElementById('down');
let pauseButton = document.getElementById('pause');
let restartButton = document.getElementById('restart');

leftButton.addEventListener('click', function(){
    if (!game.pause) {
        game.shiftFigure(side.left);
        frame.drawFrame();
    }
});

rightButton.addEventListener('click', function(){
    if (!game.pause) {
        game.shiftFigure(side.right);
        frame.drawFrame();
    }
});

rotateButton.addEventListener('click', function(){
    if (!game.pause) {
        game.rotateFigure();
        frame.drawFrame();
    }
});

downButton.addEventListener('click', function(){
    if (!game.pause) {
        game.dropFigure();
        frame.drawFrame();
    }
});

pauseButton.addEventListener('click', function(){
    if (!game.pause) game.pause = true;
    else if (!game.end) game.pause = false;
    if (!game.end) frame.drawFrame();
});

restartButton.addEventListener('click', function(){
    localStorage.removeItem('tetris');
    settings = defaultSettings;
    game.create();
    frame.initialize();
    frame.drawFrame();
});

document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case keys.space:
            pauseButton.click();
            break;
        case keys.left:
        case keys.a:
            leftButton.click();
            break;
        case keys.up:
        case keys.w:
            rotateButton.click();
            break;
        case keys.right:
        case keys.d:
            rightButton.click();
            break;
        case keys.down:
        case keys.s:
            downButton.click();
            break;
        case keys.esc:
            restartButton.click();
            break;
    }
});

window.addEventListener('blur', function() {
    game.pause = true;
    frame.drawFrame();
});

window.addEventListener('unload', function() {
    game.pause = true;
    let tetris = {
        settings: settings,
        game: {
            matrix: game.matrix,
            score: game.score,
            currentSpeed: game.currentSpeed,
            nextFigure: game.nextFigure,
            figure: game.figure,
            figurePosition: game.figurePosition,
            pause: game.pause,
            end: game.end
        }
    }
    localStorage.setItem('tetris', JSON.stringify(tetris));
});

if (localStorage.getItem('tetris')) {
    let tetris = JSON.parse(localStorage.getItem('tetris'));
    settings = tetris.settings;
    game.matrix = tetris.game.matrix;
    game.score = tetris.game.score;
    game.currentSpeed = tetris.game.currentSpeed;
    game.nextFigure = tetris.game.nextFigure;
    game.figure = tetris.game.figure;
    game.figurePosition = tetris.game.figurePosition;
    game.pause = tetris.game.pause;
    game.end = tetris.game.end;
} else {
    game.create();
}

frame.initialize();
frame.drawFrame();
game.start();