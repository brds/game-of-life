'use strict';
let interval = (() => {
    const WIDTH = 800;
    const HEIGHT = 600;
    let world = document.querySelector('#world');
    world.setAttribute('width', WIDTH);
    world.setAttribute('height', HEIGHT);
    class Cell {
        constructor(x, y) {
            this._isAlive = null;
            this._willLive = null;
            this._neighbors = [];
            this._element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            this._element.setAttribute(
                'style',
                `fill:rgba(${Cell.randclr()},${Cell.randclr()},${Cell.randclr()},1)`
            );
            this._element.setAttribute('x', x);
            this._element.setAttribute('y', y);
            world.appendChild(this._element);
            this.isAlive = (Math.trunc(Math.random() * 10) % 2 === 0);
        }
        get isAlive() {
            return this._isAlive;
        }
        set isAlive(a) {
            this._isAlive = a;
            this._element.setAttribute('opacity', a ? '1' : '0');
        }
        set neighbors(n) {
            this._neighbors = n;
        }
        judge() {
            const nbNeighborsAlive = this._neighbors.filter(n => n.isAlive === true).length;
            if (this._isAlive) {
                this._willLive = (nbNeighborsAlive === 2 || nbNeighborsAlive === 3);
            } else {
                this._willLive = (nbNeighborsAlive === 3);
            }
        }
        execute() {
            this.isAlive = this._willLive;
        }
        static randclr() {
            return Math.trunc(Math.random() * 255);
        }
    }
    class Population {
        constructor(worldWidth, worldHeight, nbRows = 10, nbColumns = 10) {
            // Define cell dimensions:
            let cellWidth = worldWidth / nbColumns;
            let cellHeight = worldHeight / nbRows;
            document.styleSheets[0].insertRule(`#world rect {
                width: ${cellWidth}px;
                height: ${cellHeight}px;
            }`);
            // Spawn cells in list:
            this._rows = [];
            while (this._rows.length < nbRows) {
                this._rows.push(new Array(nbColumns).fill(null));
            };
            for (const [row_index, row] of this._rows.entries()) {
                for (const column_index of row.keys()) {
                    const x = column_index * cellWidth;
                    const y = row_index * cellHeight;
                    const cell = new Cell(x, y);
                    row[column_index] = cell;
                };
            };
            // Set cells neighbors:
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
        evolve() {
            for (const cell of this) {
                cell.judge();
            };
            for (const cell of this) {
                cell.execute();
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
    let population = new Population(WIDTH, HEIGHT, 50, 50);
    return setInterval(() => {population.evolve();}, 100);
})();