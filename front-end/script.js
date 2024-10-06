var userId;
// var ws = new WebSocket("wss://happy-ortensia-alirh-94121905.koyeb.app/ws/game");
var ws = new WebSocket("ws://localhost:8000/ws/game");


let gameActive = true;
let currentPlayer = "X";
let gameState = [];
let rows = 3;
let cols = 3;
let steps,
    counter = 0;
let reconnectInterval = 5000;
let maxRetries = 10; // Maximum number of reconnection attempts
let retries = 0;

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
        var payload = `{"method":"JoinToGame","gameId":"${gameId}"}`
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
        console.log(payload)
    }
    catch (err) {
        console.log(err)
    }
    finally {
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
        gameId = payload.gameId
        message = `The game id is ${gameId}`
        console.log(message)
        appendMessage(message)
    } else if (method == "JoinToRandomGame") {
        if (status == "ok") {
            gameId = payload.game_id
            handleStart()
            appendMessage(message)
        }
    } else if (method == "Alert") {
        handleAlert(payload.status, payload.message)
    }
};

ws.onopen = () => {
    handleAlert("success", "Connection is established")
}

ws.onclose = () => {
    handleAlert("warning", "Connection is closed")
    handleReconnect()
}

function connect() {
    // Establish a new WebSocket connection
    ws = new WebSocket("ws://your-websocket-url");

    // Listen for connection opening
    ws.onopen = function () {
        console.log("Connected to the WebSocket server");
        retries = 0; // Reset the retry counter on successful connection
    };

    // Listen for connection closing
    ws.onclose = function () {
        console.log("WebSocket connection closed");
        handleReconnect(); // Try to reconnect when the connection closes
    };

    // Listen for errors
    ws.onerror = function (error) {
        console.log("WebSocket error:", error);
        ws.close(); // Close the connection if an error occurs
    };

    // Listen for messages
    ws.onmessage = function (event) {
        console.log("Message from server:", event.data);
    };
}
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

        ws.send(`{"method":"HandleMove", "row":${i}, "column":"${j}", "gameID":"${gameId}"}`)
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

let handleAlert = (status, message) => {
    // create alert
    html = `<div class="toast ${status}">
          <div class="container-1">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="container-2">
            <p>${status}</p>
            <p>${message}</p>
          </div>
        </div>`
    document.getElementsByClassName("wrapper")[0].innerHTML = html
    setTimeout(removeAlert, 3000)
}

function removeAlert() {
    document.getElementsByClassName("wrapper")[0].innerHTML = ""
}

let handleReconnect = () => {
    if (retries < maxRetries) {
        retries++;
        handleAlert("info", `Attempting to reconnect... (${retries}/${maxRetries})`)
        setTimeout(connect, reconnectInterval);
    } else {
        handleAlert("info", "Max retries reached. Could not reconnect.")
    }
}

handleAlert("info", "Connecting to game...")