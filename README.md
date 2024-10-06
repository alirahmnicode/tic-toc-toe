# Online Tic-Tac-Toe Multiplayer Game

This is a simple **Tic-Tac-Toe** game built with **HTML, CSS, JavaScript**, and served by **FastAPI**. The game allows two players to play against each other, taking turns to mark the 3x3 grid until one player wins or the game ends in a draw.

## Features
- Create a new game.
- Playable by two users.
- Join a game with game ID.
- Join a random game.
- Powered by **FastAPI** as the web server.

## How to Play

1. Clone the repository:
   ```bash
   git clone https://github.com/alirahmnicode/tic-toc-toe.git
2. Install dependency
   ```bach
   pip install requirements.txt
3. Run development mode
   ```bach
   fastapi dev main.py
4. Run front-end

  open index.html in a new tab

## Project Structure

```md
├── connection.py #manage socket connections
├── controllers.py
├── Dockerfile
├── front-end
│   ├── index.html
│   ├── script.js
│   └── style.css
├── game.py
├── main.py
└── requirements.txt
```
