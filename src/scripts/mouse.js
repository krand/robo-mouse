'use strict';

export class Mouse {
    constructor(updateMouseView) {
        this.updateMouseView = updateMouseView;
        this.position = [0, 0];
        this.direction = 'UP';
        this.playing = false;
    }

    put(column, row, direction) {
        this.position = [column, row];
        this.direction = direction;
        this.updateMouseView(column, row, direction);
    }

    play(map, cheese, program, onWin, onLose) {
        this.playing = true;
        let self = this;
        let f = function () {
            if (self.playing) {
                if (cheese[0] === self.position[0] && cheese[1] === self.position[1]) {
                    self.playing = false;
                    onWin();
                } else if (program.length === 0) {
                    self.playing = false;
                    onLose();
                }
                let command = program.shift();
                let col = self.position[0];
                let row = self.position[1];
                let dir = command;
                if (command === 'UP') {
                    row -= 1;
                } else if (command === 'DN') {
                    row += 1;
                } else if (command === 'LT') {
                    col -= 1;
                } else if (command === 'RT') {
                    col += 1;
                }
                if (map.isLand(col, row) && map.hasRoute(self.position, [col, row])) {
                    self.put(col, row, dir);
                    setTimeout(f, 1000);
                } else {
                    self.playing = false;
                    onLose();
                }
            }
        };
        setTimeout(f, 1000);
    }
}