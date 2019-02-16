'use strict';
const { playPause, randomize } = (() => {
    class Cell {
        constructor(x, y, width, height, context) {
            this._x = x;
            this._y = y;
            this._width = width;
            this._height = height;
            this._context = context;
            this._color = `rgba(${Cell.randclr()},${Cell.randclr()},${Cell.randclr()},1)`;
            this._isAlive = null;
            this._willLive = null;
            this._neighbors = [];
            this.randomize();
        }
        get isAlive() {
            return this._isAlive;
        }
        set isAlive(a) {
            this._isAlive = a;
            if (this._isAlive) {
                this._context.fillStyle = this._color;
                this._context.fillRect(this._x, this._y, this._width, this._height);
            }
        }
        set neighbors(n) {
            this._neighbors = n;
        }
        judge() {
            const nbNeighborsAlive = this._neighbors.filter(n => n.isAlive).length;
            if (this._isAlive) {
                this._willLive = (nbNeighborsAlive === 2 || nbNeighborsAlive === 3);
            } else {
                this._willLive = (nbNeighborsAlive === 3);
            }
        }
        execute() {
            this.isAlive = this._willLive;
        }
        randomize() {
            this.isAlive = (Math.round(Math.random()) % 2 === 0);
        }
        static randclr() {
            return Math.trunc(Math.random() * 255);
        }
    }
    class Population {
        constructor(worldWidth, worldHeight, worldContext, nbColumns, nbRows) {
            // Define cells size.
            const cellWidth = worldWidth / nbColumns;
            const cellHeight = worldHeight / nbRows;
            // Spawn cells in list.
            this._rows = [];
            while (this._rows.length < nbRows) {
                this._rows.push(new Array(nbColumns).fill(null));
            };
            for (const [row_index, row] of this._rows.entries()) {
                for (const column_index of row.keys()) {
                    const x = column_index * cellWidth;
                    const y = row_index * cellHeight;
                    const cell = new Cell(x, y, cellWidth, cellHeight, worldContext);
                    row[column_index] = cell;
                };
            };
            // Set cells neighbors.
            for (const [row_index, row] of this._rows.entries()) {
                for (const [cell_index, cell] of row.entries()) {
                    const left_index = cell_index > 0 ? cell_index - 1 : row.length - 1;
                    const right_index = cell_index < row.length - 1 ? cell_index + 1 : 0;
                    const top_index = row_index > 0 ? row_index - 1 : this._rows.length - 1;
                    const bottom_index = row_index < this._rows.length - 1 ? row_index + 1 : 0;
                    cell.neighbors = [
                        this._rows[top_index][left_index],
                        this._rows[top_index][cell_index],
                        this._rows[top_index][right_index],
                        this._rows[row_index][left_index],
                        this._rows[row_index][right_index],
                        this._rows[bottom_index][left_index],
                        this._rows[bottom_index][cell_index],
                        this._rows[bottom_index][right_index]
                    ];
                };
            };
        }
        * [Symbol.iterator]() {
            for (const row of this._rows) {
                for (const cell of row) {
                    yield cell;
                };
            };
        }
    }
    class World {
        constructor(width, height, selector, nbColumns, nbRows) {
            this._width = width;
            this._height = height;
            const canvas = document.querySelector(selector);
            canvas.setAttribute('width', this._width);
            canvas.setAttribute('height', this._height);
            this._context = canvas.getContext('2d');
            this._population = new Population(this._width, this._height, this._context, nbColumns, nbRows);
        }
        evolve() {
            this._context.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this._context.fillRect(0, 0, this._width, this._height);
            for (const cell of this._population) {
                cell.judge();
            };
            for (const cell of this._population) {
                cell.execute();
            };
        }
        clear() {
            this._context.fillStyle = 'white';
            this._context.fillRect(0, 0, this._width, this._height);
        }
        randomize() {
            this.clear();
            for (const cell of this._population) {
                cell.randomize();
            }
        }
    }
    const WORLD_WIDTH = 800;
    const WORLD_HEIGHT = 600;
    const NB_COLUMNS = 80;
    const NB_ROWS = 60;
    let world = new World(WORLD_WIDTH, WORLD_HEIGHT, '#world', NB_COLUMNS, NB_ROWS);
    let playing = false, interval = null;
    var playPause = () => {
        if (playing) {
            clearInterval(interval);
            world.clear();
            world.evolve();
        } else {
            interval = setInterval(() => {world.evolve()}, 100);
        }
        playing = !playing;
        document.querySelector('#playPauseBtn').setAttribute('value', playing ? 'pause' : 'play');
    }
    var randomize = () => {
        world.randomize();
    }
    playPause();
    return { 
        playPause, randomize 
    };
})();