var userId;
// var ws = new WebSocket("ws://happy-ortensia-alirh-94121905.koyeb.app/ws/game");
var ws = new WebSocket("ws://localhost:8000/ws/game");

let gameActive = true;
let currentPlayer = "X";
let gameState = [];
let rows = 3;
let cols = 3;
let steps,
    counter = 0;

const messages = document.getElementById("messages");
const statusDisplay = document.getElementById("status");
const startBox = document.getElementById("startBox");
const playField = document.getElementById("field");

var myLabel
var myTurn = false
var gameId
var message
var messageBox

function createGame() {
    ws.send('{"method":"CreateGame"}');
    handleStart()
    myTurn = true
    myLabel = "X"
    message = "You are the X player!"
    appendMessage(message)
}

function joinToGame() {
    gameId = document.getElementById("gameId").value;
    if (gameId != "" && gameId != undefined) {
        // request to join to the game
        var payload = `{"method":"JoinToGame","game_id":"${gameId}"}`
        console.log(payload)
        ws.send(payload);
        myTurn = false
        myLabel = "O"
        message = `You are the ${myLabel} player!`
        appendMessage(message)
    }
}

function JoinToRandomGame() {
    ws.send('{"method":"JoinToRandomGame"}');
    myTurn = false
    myLabel = "O"
}

function appendMessage(message) {
    messageBox = document.createElement("li")
    messageBox.innerHTML = message
    messages.appendChild(messageBox)
}

ws.onmessage = function (event) {
    var method, status

    try {
        var payload = JSON.parse(event.data)
        method = payload.method
        status = payload.status
        message = payload.message
    }
    catch (err) {
        console.log(err)
    }
    finally {
        console.log(JSON.parse(event.data))
        console.log("end")
    }

    if (method == "JoinToGame") {
        if (status == "ok") {
            handleStart()
        }
    } else if (method == "HandleMove") {
        // this method is called when the other player is moved
        if (status == "ok") {
            var hasWinner = payload.has_winner
            var winnerPlayer = payload.winner_player
            if (hasWinner) {
                // stop game
                var winnerCombo = payload.winner_combo
                winnActions(winnerCombo)
                winnMessage(winnerPlayer)
            } else {
                handleMove(message)
                myTurn = true
            }
        }
    } else if (method == "CreateGame") {
        appendMessage(message)
    } else if (method == "JoinToRandomGame") {
        if (status == "ok") {
            handleStart()
            appendMessage(message)
        }
    }
};


//   crate matrix
let createMatrix = () => {
    let arr;
    for (let i = 0; i < rows; i++) {
        arr = [];
        for (let j = 0; j < cols; j++) {
            arr[j] = 0;
        }
        gameState[i] = arr;
    }
    console.log(gameState);
};

let drawField = () => {
    let cellSize = (window.innerHeight * 0.5) / cols;
    let box = document.createElement("div");
    box.setAttribute("id", "container");

    let cell, row;
    for (let i = 0; i < rows; i++) {
        row = document.createElement("div");
        row.className = "row";
        for (let j = 0; j < cols; j++) {
            cell = document.createElement("div");
            cell.setAttribute("id", `${i}_${j}`);
            cell.className = "cell";
            cell.style.width =
                cell.style.height =
                cell.style.lineHeight =
                `${cellSize}px`;
            cell.style.fontSize = `${cellSize / 16}em`;
            row.appendChild(cell);
        }
        box.appendChild(row);
    }
    playField.appendChild(box);
};

function winnActions(winnerCombo) {

    gameActive = false
    let cell
    winnerCombo.forEach(cell => {
        cell = document.getElementById(`${cell[0]}_${cell[1]}`)
        cell.style.color = '#139de2'
    })
}


function winnMessage(winnerPlayer) {
    if (winnerPlayer == myLabel) {
        var winnMessage = "you have won"
    } else {
        var winnMessage = `The ${winnerPlayer} player has won!`
    }
    appendMessage(winnMessage)
}

// ----------------------------------  START GAME
let handleStart = () => {
    cols = 3
    rows = 3
    steps = 3
    createMatrix()
    drawField()
    // handlePlayerSwitch()
    document.querySelectorAll('.cell')
        .forEach(cell => cell.addEventListener('click', handleClick))
}

let handleClick = (event) => {
    if (myTurn && gameActive) {
        let clickedIndex = event.target.getAttribute('id').split('_');
        let i = +clickedIndex[0]
        let j = +clickedIndex[1]

        ws.send(`{"method":"HandleMove", "row":${i}, "column":"${j}"}`)
        if (gameState[i][j] !== 0 || !gameActive)
            return

        event.target.innerHTML = myLabel
        myTurn = false
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X'
    }
}

let handleMove = (move) => {
    var label = myLabel == "X" ? "O" : "X"
    document.getElementById(move).innerHTML = label
}