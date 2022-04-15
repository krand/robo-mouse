'use strict';

import {Map} from "./map";
import {Mouse} from "./mouse";

const STATE_MAIN_MENU = "MAIN_MENU";
const STATE_CONSTRUCTION_MAP = "CONSTRUCTION_MAP";
const STATE_CONSTRUCTION_MOUSE = "CONSTRUCTION_MOUSE";
const STATE_CONSTRUCTION_CHEESE = "CONSTRUCTION_CHEESE";
const STATE_PROGRAM_ROUTE = "PROGRAM_ROUTE";
const STATE_PLAY_ROUTE = "PLAY_ROUTE";

const MAP_SIZE = 10;

let divMap = document.getElementById('map');
let divProgramPanel = document.getElementById('programPanel');
let imgMouse = document.getElementById('mouse');
let imgCheese = document.getElementById('cheese');

let gameState = STATE_MAIN_MENU;
let program = [];
let cheese = [-1, -1];
let originalPosition = [-1, -1];
let mouse = new Mouse(function (column, row, direction) {
    let rect = document.getElementById('movingArea').getBoundingClientRect();
    imgMouse.style.top = (row + 0.5) * (rect.height / MAP_SIZE) + 'px';
    imgMouse.style.left = (column + 0.5) * (rect.width / MAP_SIZE) + 'px';
    imgMouse.style.display = 'initial';
    if (direction === 'UP') {
        imgMouse.style.transform = 'rotate(180deg)';
    } else if (direction === 'DN') {
        imgMouse.style.transform = 'rotate(0deg)';
    } else if (direction === 'LT') {
        imgMouse.style.transform = 'rotate(90deg)';
    } else if (direction === 'RT') {
        imgMouse.style.transform = 'rotate(270deg)';
    }
});
let map = new Map(MAP_SIZE, function (column, row, state, rightBorderState, bottomBorderState) {
    let cell = divMap.children[row * MAP_SIZE + column];
    if (state) {
        cell.classList.add('land');
    } else {
        cell.classList.remove('land');
    }

    if (rightBorderState) {
        cell.classList.add('rb');
    } else {
        cell.classList.remove('rb');
    }

    if (bottomBorderState) {
        cell.classList.add('bb');
    } else {
        cell.classList.remove('bb');
    }
});

for (let i = 0; i < MAP_SIZE * MAP_SIZE; i++) {
    let cellDiv = document.createElement('div');
    cellDiv.className = "cell";
    divMap.appendChild(cellDiv);
}

document.getElementById('btnMM').addEventListener('click', toMainMenu);
document.getElementById('btnBuildLevel').addEventListener('click', setState.bind(this, STATE_CONSTRUCTION_MAP));
document.getElementById('btnPutCheese').addEventListener('click', setState.bind(this, STATE_CONSTRUCTION_CHEESE));
document.getElementById('btnPutMouse').addEventListener('click', setState.bind(this, STATE_CONSTRUCTION_MOUSE));
document.getElementById('btnPlay').addEventListener('click', resetProgram);
document.getElementById('btnReset').addEventListener('click', resetProgram);
document.getElementById('btnGo').addEventListener('click', playProgram);

document.getElementById('btnUp').addEventListener('click', event => addCommand('UP', event));
document.getElementById('btnLeft').addEventListener('click', event => addCommand('LT', event));
document.getElementById('btnRight').addEventListener('click', event => addCommand('RT', event));
document.getElementById('btnDown').addEventListener('click', event => addCommand('DN', event));
document.getElementById('btnRemoveLast').addEventListener('click', removeLastCommand);

document.getElementById('movingArea').addEventListener('click', onMapClick);

onStateChanged(gameState);

function onMapClick(e) {
    let rect = divMap.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    let cellX = x / (rect.width / MAP_SIZE);
    let cellY = y / (rect.height / MAP_SIZE);

    console.log("X? : " + x + " ; Y? : " + y);
    console.log("cellX? : " + cellX + " ; cellY? : " + cellY);

    let column = Math.trunc(cellX);
    let row = Math.trunc(cellY);

    console.log("col? : " + column + " ; row? : " + row);

    if (gameState === STATE_CONSTRUCTION_MAP) {
        console.log('change map');
        if (Math.abs(Math.round(cellX) - cellX) < 0.1 && Math.abs(Math.round(cellY) - cellY) < 0.1) {
            //do nothing
        } else if (Math.abs(Math.round(cellX) - cellX) < 0.1) {
            if (cellX > 0 && cellX - column < 0.5) {
                map.swapRightBorder(row, column - 1, column);
            } else if (cellX < (MAP_SIZE - 1) && cellX - column > 0.5) {
                map.swapRightBorder(row, column, column + 1);
            }
        } else if (Math.abs(Math.round(cellY) - cellY) < 0.1) {
            if (cellY > 0 && cellY - row < 0.5) {
                map.swapBottomBorder(column, row - 1, row);
            } else if (cellY < (MAP_SIZE - 1) && cellY - row > 0.5) {
                map.swapBottomBorder(column, row, row + 1);
            }
        } else {
            map.swapCell(column, row);
        }
    } else if (gameState === STATE_CONSTRUCTION_CHEESE) {
        console.log('change cheese position');
        if (map.isLand(column, row)) {
            let rect = document.getElementById('movingArea').getBoundingClientRect();
            cheese = [column, row];
            imgCheese.style.display = 'initial';
            imgCheese.style.top = (row + 0.5) * (rect.height / MAP_SIZE) + 'px';
            imgCheese.style.left = (column + 0.5) * (rect.width / MAP_SIZE) + 'px';
        }
        onStateChanged(STATE_CONSTRUCTION_CHEESE);
    } else if (gameState === STATE_CONSTRUCTION_MOUSE) {
        console.log('change mouse position');
        if (map.isLand(column, row)) {
            originalPosition = [column, row];
            mouse.put(column, row, 'UP');
        }
        onStateChanged(STATE_CONSTRUCTION_MOUSE);
    }
}

function addCommand(commandName, e) {
    if (program.length === 0) {
        mouse.put(originalPosition[0], originalPosition[1], commandName);
    }
    program.push(commandName);
    let img = document.createElement('img');
    img.src = e.target.src ? e.target.src : e.target.children[0].src;
    divProgramPanel.appendChild(img);
}

function removeLastCommand() {
    if (program.length > 0) {
        program.pop();
        divProgramPanel.removeChild(divProgramPanel.children[divProgramPanel.children.length - 1]);
    }
}

function toMainMenu() {
    program = [];
    cheese = [-1, -1];
    originalPosition = [-1, -1];
    divProgramPanel.innerHTML = '';
    map.clear();
    setState(STATE_MAIN_MENU);
}

function resetProgram() {
    program = [];
    divProgramPanel.innerHTML = '';
    mouse.put(originalPosition[0], originalPosition[1], 'UP');
    setState(STATE_PROGRAM_ROUTE);
}

function playProgram() {
    mouse.play(map, cheese, program, function () {
        alert('Win');
        resetProgram();
    }, function () {
        alert('Lose');
        resetProgram();
    });
}

function onStateChanged(newState) {
    console.log('onStateChanged');

    document.getElementById('btnMM').style.visibility = 'visible';
    document.getElementById('btnBuildLevel').style.display = [STATE_MAIN_MENU].indexOf(newState) < 0 ? 'none' : 'initial';
    document.getElementById('btnPutCheese').style.display = [STATE_CONSTRUCTION_MAP].indexOf(newState) < 0 ? 'none' : 'initial';
    document.getElementById('btnPutMouse').style.display = [STATE_CONSTRUCTION_CHEESE].indexOf(newState) < 0 ? 'none' : 'initial';
    document.getElementById('btnPlay').style.display = [STATE_CONSTRUCTION_MOUSE].indexOf(newState) < 0 ? 'none' : 'initial';
    document.getElementById('btnReset').style.display = [STATE_PROGRAM_ROUTE, STATE_PLAY_ROUTE].indexOf(newState) < 0 ? 'none' : 'initial';
    document.getElementById('btnGo').style.display = [STATE_PROGRAM_ROUTE].indexOf(newState) < 0 ? 'none' : 'initial';

    let controlBtns = document.getElementsByClassName('control-btns');
    Array.from(controlBtns).forEach(el => el.disabled = newState !== STATE_PROGRAM_ROUTE);

    document.getElementById('cheese').style.display = (cheese[0] === -1 || [STATE_CONSTRUCTION_CHEESE, STATE_CONSTRUCTION_MOUSE, STATE_PROGRAM_ROUTE, STATE_PLAY_ROUTE].indexOf(newState) < 0) ? 'none' : 'initial';
    document.getElementById('mouse').style.display = (originalPosition[0] === -1 || [STATE_CONSTRUCTION_MOUSE, STATE_PROGRAM_ROUTE, STATE_PLAY_ROUTE].indexOf(newState) < 0) ? 'none' : 'initial';

    document.getElementById('btnPutMouse').disabled = document.getElementById('cheese').style.display === 'none';
    document.getElementById('btnPlay').disabled = document.getElementById('mouse').style.display === 'none';

    mouse.playing = newState === STATE_PLAY_ROUTE;
}

function setState(state) {
    let oldState = gameState;
    gameState = state;
    console.log('state' + oldState + '>' + state);
    if (oldState !== state) {
        onStateChanged(state);
    }
}

