const settings = {
    defaultSpeed: 750,
    droppingSpeed: 350,
    cellSize: 20,
    gapSize: 1,
    offsetSize: undefined,
    fieldSX: 10,
    fieldSY: 20
}

settings.offsetSize = settings.cellSize + settings.gapSize;

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
        this.score = 0;
        this.speed = settings.defaultSpeed;
        this.over = false;
        this.matrix = new Array(settings.fieldSX);
        for (let i = 0; i < settings.fieldSX; ++i) {
            this.matrix[i] = new Array(settings.fieldSY);
            for (let j = 0; j < settings.fieldSY; ++j) {
                this.matrix[i][j] = -1;
            }
        }
        this.addFigure();
        this.setSpeed();
        frame.drawFrame();
    },

    random: function(minimum, maximum) {
        return Math.floor(minimum + Math.random() * (maximum + 1 - minimum));
    },

    addFigure: function() {
        this.figure = this.nextFigure;
        if (this.nextFigure != undefined) {
            this.figure = figures[this.random(0, 6)];
        }
        this.figurePosition = [3, 0];
        do {
            this.nextFigure = figures[this.random(0, 6)];
        } while (this.nextFigure == this.figure);
    },

    setSpeed: function(speed) {
        clearInterval(this.interval);
        interval = setInterval(function() {
            frame.drawFrame();
        }, speed);
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
        this.context.font = (settings.cellSize - 5) + 'px Roboto-Regular';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
    }
}

frame.initialize();
game.create();