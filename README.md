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
   cd src && fastapi dev main.py

## Project Structure

```md
├── src
│   ├── main.py
│   ├── controllers.py
│   ├── connections.py
|   └── game.py
├── Dockerfile
├── .dockerignore
├── .gitignore
├── README.md
└── requirements.txt
```
