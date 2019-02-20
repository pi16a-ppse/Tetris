/* базовые настройки, используемые при начале новой игры */
const defaultSettings = {
    speed: 200,
    cellSize: 20,
    gapSize: 1,
    offsetSize: undefined,
    fieldSX: 10,
    fieldSY: 20
}

/* сумма размеров ячейки и отступа для использования в качестве смещения 
при отрисовке сегментов в циклах */
defaultSettings.offsetSize = defaultSettings.cellSize + defaultSettings.gapSize;

/* настройки текущей игры, сохраняемые в локальное хранилище */
let settings = defaultSettings;

/* возможные направления смещения фигуры */
const side = {
    left: 1,
    right: 2,
    bottom: 3
}

/* формы используемых фигур и соответствие цветам */
const figures = [
   [[1],[1],[1],[1]],
   [[0,0,2],[2,2,2]],
   [[3,3,3],[0,0,3]],
   [[4,4],[4,4]],
   [[6,0],[6,6],[6,0]],
   [[0,5],[5,5],[5,0]],
   [[7,0],[7,7],[0,7]]
];

/* реализация основной логики игры */
let game = {
    matrix: undefined,
    score: 0,
    interval: undefined,
    nextFigure: undefined,
    figure: undefined,
    figurePosition: undefined,
    pause: true,
    end: false,

    /** Создание новой игры с базовыми параметрами. */
    create: function() {
        this.pause = true;
        this.end = false;
        this.score = 0;
        this.matrix = new Array(settings.fieldSX);
        for (let i = 0; i < settings.fieldSX; ++i) {
            this.matrix[i] = new Array(settings.fieldSY);
            for (let j = 0; j < settings.fieldSY; ++j) {
                this.matrix[i][j] = -1;
            }
        }
        this._addFigure();
    },

    /** Запуск игрового цикла с интервалом, указанным в настройках. */
    start: function() {
        clearInterval(this.interval);
        this.interval = setInterval(function() {
            if (!game.pause) {
                game.moveFigure();
                frame.drawFrame();
            }
        }, settings.speed);
    },

    /**
    * Генерирует случайное число из заданного диапазона.
    * @param {integer} minimum - Нижняя граница диапазона.
    * @param {integer} maximum - Верхняя граница диапазона.
    * @return {integer} Сгенерированное число.
    */
    _random: function(minimum, maximum) {
        return Math.floor(minimum + Math.random() * (maximum + 1 - minimum));
    },

    /** Запуск игрового цикла с интервалом, указанным в настройках. */
    _addFigure: function() {
        /* если следующая фигура определена, то выбираем текущей её,
        иначе генерируем новую */
        if (this.nextFigure != undefined) {
            this.figure = this.nextFigure;
        } else {
            this.figure = figures[this._random(0, 6)];
        }
        /* определение смещения новой фигуры для центрирования 
        и установка позиции на поле */
        let left = parseInt((settings.fieldSX - this.figure.length) / 2);
        this.figurePosition = [left, 0];
        /* генерация следующей фигуры, отличной от текущей */
        do {
            this.nextFigure = figures[this._random(0, 6)];
        } while (this.nextFigure == this.figure);
    },

    /**
    * Проверка возможности смещения фигуры в заданном направлении.
    * @param {object} figure - Проверяемая фигура.
    * @param {object} position - Текущая позиция фигуры.
    * @param {integer} direction - Направление смещения.
    * @return {boolean} Возможность смещения.
    */
    canShift: function(figure, position, direction = side.bottom) {
        /* определение смещения по координатам при заданном направлении */
        let directionX = 0;
        if (direction == side.left) directionX = -1;
        else if (direction == side.right) directionX = 1;
        let directionY = (direction == side.bottom) ? 1 : 0;
        /* определение возможности смещения для каждого сегмента фигуры */
        let x, y;
        let result = true;
        for (let i = 0; i < figure.length && result; ++i)
            for (let j = 0; j < figure[0].length && result; ++j) {
                /* вычисление координат с учетом позиции фигуры, 
                текущего сегмента и смещения */
                x = position[0] + i + directionX;
                y = position[1] + j + directionY;
                /* если новая позиция сегмента находится вне поля 
                или занята сегментом другой фигуры, то смещение невозможно */
                if (!this._isOnField(x, y)) {
                    result = false;
                } else if (figure[i][j] && game.matrix[x][y] != -1) {
                    result = false;
                }
            }
        return result;
    },

    /**
    * Смещение текущей фигуры в заданном направлении.
    * @param {integer} direction - Направление смещения.
    * @return {boolean} Возможность смещения.
    */
    shiftFigure: function(direction = side.bottom) {
        let result = this.canShift(this.figure, this.figurePosition, direction);
        if (result) {
            if (direction == side.left) --this.figurePosition[0];
            else if (direction == side.right) ++this.figurePosition[0];
            else ++this.figurePosition[1]
        }
        return result; 
    },

    /**
    * Проверка принадлежности заданной точки игровому полю.
    * @param {integer} x - Координата X.
    * @param {integer} y - Координата Y.
    * @return {boolean} Принадлежность игровому полю.
    */
    _isOnField: function(x, y) {
        return x >= 0 && x < settings.fieldSX && y < settings.fieldSY;
    },

    /** Осуществление попытки поворота текущей фигуры. */
    rotateFigure: function() {
        /* определение размеров текущей фигуры */
        let width = this.figure.length;
        let height = this.figure[0].length;
        /* создание и заполнение матрицы повернутой на 90 градусов фигуры */
        let rotatedFigure = new Array(height);
        for (let i = 0; i < height; ++i) {
            rotatedFigure[i] = new Array(width);
        }
        for (var i = 0; i < width; ++i) {
            for (var j = 0; j < height; ++j) {
                rotatedFigure[height - j - 1][i] = this.figure[i][j];
            }
        }
        /* замена текущей фигуры при наличии места для поворота */
        if (this.canShift(rotatedFigure, this.figurePosition)) {
            this.figure = rotatedFigure;
        }
    },

    /**
    * Подсчет пустых ячеек в заданном ряду.
    * @param {integer} line - Номер ряда.
    * @return {integer} Число пустых ячеек.
    */
    _countEmptyCells: function(line) {
        let n = 0;
        for (let i = 0; i < settings.fieldSX; ++i) {
            if (this.matrix[i][line] == -1) {
                ++n;
            }
        }
        return n;
    },

    /** Проверка рядов на заполнение и удаление полных, смещая верхние вниз. */
    _checkLines: function() {
        let top = 0;
        for (let line = settings.fieldSY - 1; line > top; --line) {
            /* смещение всех сегментов начиная от ряда выше и до верхней границы
            игрового поля пока на текущем ряду все ячейки заполнены */
            while (!this._countEmptyCells(line)) {
                for (let j = line - 1; j >= top; --j) {
                    for (let i = 0; i < settings.fieldSX; ++i) {
                        game.matrix[i][j + 1] = game.matrix[i][j];
                    }
                }
                /* смщение верхней границы игрового поля вниз, так как один ряд
                был удален и все сегменты смещены на ряд вниз */
                ++top;
                /* добавление к игровому счету количества удаленных сегментов */
                game.score += settings.fieldSX;
            }
        }
    },

    /** Сдвиг текущей фигуры вниз. */
    moveFigure: function() {
        /* если нет возможности сдвинуть фигуру */
        if (!this.shiftFigure()) {
            /* перенос текущей фигуры в матрицу игрового поля */
            for (let i = 0; i < this.figure.length; ++i) {
                for (let j = 0; j < this.figure[0].length; ++j) {
                    if (this.figure[i][j]) {
                        let x = this.figurePosition[0] + i;
                        let y = this.figurePosition[1] + j;
                        this.matrix[x][y] = this.figure[i][j];
                    }
                }
            }
            /* подсчет числа сегментов в фигуре и увеличение счета */
            let cost = 0;
            for (let i = 0; i < this.figure.length; ++i) {
                for (let j = 0; j < this.figure[0].length; ++j) {
                    if (this.figure[i][j]) {
                        ++cost;
                    }
                }
            }
            game.score += cost;
            /* проверка рядов на заполнение */
            this._checkLines();
            /* определение позиции следующей фигуры */
            let x = parseInt((settings.fieldSX - this.nextFigure.length) / 2);
            /* если нет возможности разместить следующую фигуру, 
            то завершение игры, иначе добавление фигуры на поле */
            if (!this.canShift(this.nextFigure, [x, -1])) {
                this.pause = true;
                this.end  = true;
                frame.drawFrame();
                clearInterval(game.interval);
            } else {
                this._addFigure();
            }
        }
    },

    /** Сброс текущей фигуры на доступное место. */
    dropFigure: function() {
        while (this.canShift(this.figure, this.figurePosition)) {
            this.moveFigure();
        }
    }
}

/* элемент для вывода игрового счета */
let scoreElement = document.getElementById('score');

/* названия цветовых значений для улучшения читаемости */
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

/* реализация игровой графики */
let frame = {
    canvas: document.getElementById('canvas'),
    context: undefined,

    /** Отрисовка игрового кадра. */
    drawFrame: function() {
        /* установка цвета фона и заливка кадра */
        this._setColor();
        this.context.fillRect(0, 0, canvas.width, canvas.height);
        /* отрисовка рамки игрового поля */
        for (let i = 0; i < settings.fieldSX + 2; ++i) {
            for (let j = 0; j < settings.fieldSY + 2; ++j) {
                let color = 0;
                if (i > 0 && 
                    j > 0 && 
                    i < settings.fieldSX + 1 && 
                    j < settings.fieldSY + 1) {
                    color = game.matrix[i - 1][j - 1];
                }
                this._setColor(color);
                this._drawCell(i, j);
            }
        }
        /* определение положения поля следующей фигуры и отрисовка */
        let nextFrameSI = settings.fieldSX + 3;
        let nextFrameEI = settings.fieldSX + 8;
        for (let i = nextFrameSI; i <= nextFrameEI; ++i) {
            for (let j = 0; j < 6; ++j) {
                if (i == nextFrameSI || j == 0 || i == nextFrameEI || j == 5) {
                    this._drawCell(i, j);
                }
            }
        }
        /* отрисовка следующей фигуры */
        for (let i = 0; i < game.nextFigure.length; ++i) {
            for (let j = 0; j < game.nextFigure[0].length; ++j) {
                if (game.nextFigure[i][j]) {
                    this._setColor(game.nextFigure[i][j]);
                    let x = i + nextFrameSI + 1;
                    if (game.nextFigure.length < 3) {
                        ++x;
                    }
                    let y = j + 2;
                    this._drawCell(x, y);
                }
            }
        }
        /* вывод игрового счета */
        scoreElement.textContent = game.score;
        /* установка белого цвета и отрисовка надписей */
        this._setColor(0);
        if (game.pause) {
            let left = nextFrameSI * settings.offsetSize;
            let right = (nextFrameEI + 1) * settings.offsetSize;
            let x = (right + left) / 2;
            let y = 7 * settings.offsetSize;
            let text = (game.end) ? 'GAME OVER' : 'PAUSE';
            this.context.fillText(text, x, y);
        }
        /* создание теневой фигуры и смещение вниз до возможной позиции */
        let shadowPosition = [game.figurePosition[0], game.figurePosition[1]];
        while (game.canShift(game.figure, shadowPosition)) ++shadowPosition[1];
        /* отрисовка теневой фигуры и текущей */
        for (let i = 0; i < game.figure.length; ++i) {
            for (let j = 0; j < game.figure[0].length; ++j) {
                if (game.figure[i][j]) {
                    this._setColor(8);
                    let x = i + shadowPosition[0] + 1;
                    let y = j + shadowPosition[1] + 1;
                    this._drawCell(x, y);
                    this._setColor(game.figure[i][j]);
                    x = i + game.figurePosition[0] + 1;
                    y = j + game.figurePosition[1] + 1;
                    this._drawCell(x, y);
                }
            }
        }
    },

    /**
    * Рисование ячейки на указанной позиции.
    * @param {integer} i - Позиция по оси X.
    * @param {integer} j - Позиция по оси Y.
    */
    _drawCell: function(i, j) {
        this.context.fillRect(
            i * settings.offsetSize, 
            j * settings.offsetSize, 
            settings.cellSize,
            settings.cellSize
        );
    },

    /**
    * Установка цвет заливки.
    * @param {integer} code - Код цвета.
    */
    _setColor: function(code = -1) {
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

    /** Установка парметров холста. */
    initialize: function() {
        /* вычисление ширины холста в ячейках с учетом поля следующей фигуры,
        основного игрового поля, отступа между ними и с учетом их рамок */
        let fieldSX = 7;
        fieldSX += settings.fieldSX + 2;
        /* высота холста в ячейках по размеру игрового поля с учетом рамок */
        let fieldSY = settings.fieldSY + 2;
        /* определение размеров в пикселях с учетом отступов между ячейками */
        let fieldWidth = fieldSX * settings.cellSize;
        fieldWidth += (fieldSX - 1) * settings.gapSize;
        let fieldHeight = fieldSY * settings.cellSize;
        fieldHeight += (fieldSY - 1) * settings.gapSize;
        /* применение размеров холста */
        this.canvas.width = fieldWidth;
        this.canvas.style.width = fieldWidth + 'px';
        this.canvas.height = fieldHeight;
        this.canvas.style.height = fieldHeight + 'px';
        /* получение контекста и установка параметров рисования текста */
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

/* смещение текущей фигуры влево */
leftButton.addEventListener('click', function(){
    if (!game.pause) {
        game.shiftFigure(side.left);
        frame.drawFrame();
    }
});

/* смещение текущей фигуры вправо */
rightButton.addEventListener('click', function(){
    if (!game.pause) {
        game.shiftFigure(side.right);
        frame.drawFrame();
    }
});

/* поворот текущей фигуры */
rotateButton.addEventListener('click', function(){
    if (!game.pause) {
        game.rotateFigure();
        frame.drawFrame();
    }
});

/* быстрый сброс фигуры */
downButton.addEventListener('click', function(){
    if (!game.pause) {
        game.dropFigure();
        frame.drawFrame();
    }
});

/* переключение паузы */
pauseButton.addEventListener('click', function(){
    if (!game.pause) game.pause = true;
    else if (!game.end) game.pause = false;
    if (!game.end) frame.drawFrame();
});

/* сброс настроек, сохранения в локальном хранилище, начало новой игры */
restartButton.addEventListener('click', function(){
    localStorage.removeItem('tetris');
    settings = defaultSettings;
    game.create();
    frame.initialize();
    frame.drawFrame();
    game.start();
    game.pause = true;
});

/* коды клавиш, используемые в обработчиках событий */
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

/* обработка нажатия клавиж */
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

/* установка паузы при переходе в другое окно */
window.addEventListener('blur', function() {
    game.pause = true;
    frame.drawFrame();
});

/* сохранение текущих объектов игры и настроек 
в локальное хранилище при закрыти страницы */
window.addEventListener('unload', function() {
    game.pause = true;
    let tetris = {
        settings: settings,
        game: {
            matrix: game.matrix,
            score: game.score,
            speed: game.speed,
            nextFigure: game.nextFigure,
            figure: game.figure,
            figurePosition: game.figurePosition,
            pause: game.pause,
            end: game.end
        }
    }
    localStorage.setItem('tetris', JSON.stringify(tetris));
});

/* загрузка сохраненной игры при наличии или создание новой */
if (localStorage.getItem('tetris')) {
    let tetris = JSON.parse(localStorage.getItem('tetris'));
    settings = tetris.settings;
    game.matrix = tetris.game.matrix;
    game.score = tetris.game.score;
    game.speed = tetris.game.speed;
    game.nextFigure = tetris.game.nextFigure;
    game.figure = tetris.game.figure;
    game.figurePosition = tetris.game.figurePosition;
    game.pause = tetris.game.pause;
    game.end = tetris.game.end;
} else {
    game.create();
}

/* инициализация графики, отрисовка первого кадра, начало игры */
frame.initialize();
frame.drawFrame();
game.start();