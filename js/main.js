const settings = {
    defaultSpeed: 750,
    droppingSpeed: 350,
    cellSize: 20,
    gapSize: 1,
    fieldSizeX: 10,
    fieldSizeY: 20
}

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
        pause = true;
        score = 0;
        speed = settings.defaultSpeed;
        over = false;
        matrix = new Array(10);
        for (let i = 0; i < 10; i++) {
            matrix[i] = new Array(20);
            for (let j = 0; j < 20; j++) matrix[i][j] = 0;
        }
        this.addFigure();
        this.setSpeed();
        frame.drawFrame();
    },

    random: function(minimum, maximum) {
        return Math.floor(minimum + Math.random() * (maximum + 1 - minimum));
    },

    addFigure: function() {
        figure = this.nextFigure != undefined ? this.nextFigure : figures[this.random(0, 6)];
        figurePosition = [3, 0];
        do {
            nextFigure = figures[this.random(0, 6)];
        } while (nextFigure == figure);
    },

    setSpeed: function(speed) {
        clearInterval(this.interval);
        interval = setInterval(function() {
            frame.drawFrame();
        }, speed);
    }
}

let frame = {
    canvas: document.getElementById('canvas'),
    context: canvas.getContext('2d'),

    drawFrame: function() {
        this.setColor();
        this.context.fillRect(0, 0, canvas.width, canvas.height);
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

    setSize: function() {
        let fieldSizeX = 7;
        fieldSizeX += settings.fieldSizeX + 2;
        let fieldSizeY = settings.fieldSizeY + 2;
        let fieldWidth = fieldSizeX * settings.cellSize;
        fieldWidth += (fieldSizeX - 1) * settings.gapSize;
        let fieldHeight = fieldSizeY * settings.cellSize;
        fieldHeight += (fieldSizeY - 1) * settings.gapSize;
        canvas.width = fieldWidth;
        canvas.style.width = fieldWidth + 'px';
        canvas.height = fieldHeight;
        canvas.style.height = fieldHeight + 'px';
    }
}

frame.setSize();
game.create();