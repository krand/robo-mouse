'use strict';

import {buildKey, swap} from "./utils";

export class Map {

    constructor(size, onCellStatusChanged) {
        this.size = size;
        this.cells = new Set();
        this.borders = new Set();
        this.onCellStatusChanged = onCellStatusChanged;
    }

    swapRightBorder(row, leftCellColumn, rightCellColumn) {
        console.log('swapRightBorder ' + leftCellColumn + '>' + rightCellColumn + ':' + row);
        swap(this.borders, 'fRow' + row, leftCellColumn, rightCellColumn);
        this.onCellStatusChanged.call(undefined, leftCellColumn, row,
            this.cells.has(buildKey('column' + leftCellColumn, 'row' + row)),
            this.borders.has(buildKey('fRow' + row, leftCellColumn, rightCellColumn)),
            this.borders.has(buildKey('fCol' + leftCellColumn, row, row + 1))
        );
    }

    swapBottomBorder(column, topCellRow, bottomCellRow) {
        console.log('swapBottomBorder ' + column + ':' + topCellRow + '>' + bottomCellRow);
        swap(this.borders, 'fCol' + column, topCellRow, bottomCellRow);
        this.onCellStatusChanged.call(undefined, column, topCellRow,
            this.cells.has(buildKey('column' + column, 'row' + topCellRow)),
            this.borders.has(buildKey('fRow' + topCellRow, column, column + 1)),
            this.borders.has(buildKey('fCol' + column, topCellRow, bottomCellRow))
        );
    }

    swapCell(column, row) {
        console.log('swapCell ' + column + ':' + row);
        swap(this.cells, 'column' + column, 'row' + row);
        this.onCellStatusChanged.call(undefined, column, row,
            this.cells.has(buildKey('column' + column, 'row' + row)),
            this.borders.has(buildKey('fRow' + row, column, column + 1)),
            this.borders.has(buildKey('fCol' + column, row, row + 1))
        );
    }

    clear() {
        this.cells = new Set();
        this.borders = new Set();
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.onCellStatusChanged.call(undefined, i, j, false, false, false);
            }
        }
    }

    isLand(column, row) {
        return this.cells.has(buildKey('column' + column, 'row' + row));
    }

    hasRoute(from, to) {
        return !this.borders.has(buildKey('fRow' + from[1], from[0], to[0]))
            &&
            !this.borders.has(buildKey('fCol' + from[0], from[1], to[1]));
    }
}



