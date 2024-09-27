import random
import uuid

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from game import Player, TicTacToeGame
from connection import ConnectionManager
from controllers import create_game, handle_move, join_game, join_random_game


app = FastAPI()
manager = ConnectionManager()

# settings //////////////////////////////////////////////////////////////////////////
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
)


class PayLoad(BaseModel):
    method: str
    message: str
    status: str


# app ////////////////////////////////////////////////////////////////////////////////
games = {}
players = {}


@app.websocket("/ws/game")
async def game(websocket: WebSocket):
    player = Player(id=str(uuid.uuid4()), label="X", color="green")
    await manager.connect(websocket, player.id)

    try:
        while True:
            data = await websocket.receive_json()

            if data["method"] == "CreateGame":
                game = TicTacToeGame(players=(player,))
                games[game._game_id] = game
                await create_game(game, manager, websocket)
            elif data["method"] == "JoinToGame":
                game_id = data.get("gameId")
                game: TicTacToeGame = games.get(game_id)
                await join_game(player, game, manager, websocket)
            elif data["method"] == "HandleMove":
                row, col = data.get("row"), data.get("column")
                game_id = data.get("gameID")
                game = games.get(game_id)
                await handle_move(row, col, game, manager)
            elif data["method"] == "JoinToRandomGame":
                if len(games) > 0:
                    game = random.choice(list(games.values()))
                else:
                    game = None
                await join_random_game(game, player, manager, websocket)
    except WebSocketDisconnect:
        manager.disconnect(player.id)
