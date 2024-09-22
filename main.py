import random
import uuid

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from game import Player, TicTacToeGame


app = FastAPI()

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
    await websocket.accept()
    player = Player(id=str(uuid.uuid4()), label="X", color="green")
    game: TicTacToeGame = None
    players[player.id] = websocket

    while True:
        data = await websocket.receive_json()
        if data["method"] == "CreateGame":
            game = TicTacToeGame(players=(player,))
            games[game._game_id] = game
            payload = {"method": "CreateGame", "status": "ok", "message": game._game_id}
            await websocket.send_json(payload)
        elif data["method"] == "JoinToGame":
            player.label = "O"
            game_id = data["game_id"]
            game: TicTacToeGame = games.get(game_id)
            if game is not None:
                game.add_player(player)
                payload = {"method": "JoinToGame", "status": "ok"}
                await websocket.send_json(payload)
            else:
                print("game is not exist")
        elif data["method"] == "HandleMove":
            row, col = data.get("row"), data.get("column")
            payload = {"method": "HandleMove", "status": "ok", "has_winner": False}

            if row is not None and col is not None:
                print(player.id)
                game.play(row, col)

                # send this move to the next player
                # in play() method the toggle_player() method is called
                player_id = game.current_player.id
                player_ws: WebSocket = players.get(player_id)
                print(player_id)
                if player_ws:
                    move = f"{row}_{col}"
                    payload["message"] = move
                    await player_ws.send_json(payload)

                # if the game hss winner send winner compos to both players
                if game.has_winner():
                    for player in game.players:
                        player_ws: WebSocket = players.get(player.id)
                        payload["winner_combo"] = game.winner_combo
                        payload["has_winner"] = True
                        payload["winner_player"] = game._winner_player
                        await player_ws.send_json(payload)
            else:
                print(row, col)
        elif data["method"] == "JoinToRandomGame":
            player.label = "O"
            payload = {
                "method": "JoinToRandomGame",
            }
            player_ws: WebSocket = players.get(player.id)
            if len(games) > 0:
                game = random.choice(list(games.values()))
                game.add_player(player)
                payload["message"] = "You have joined the game successfully!"
                payload["status"] = "ok"
                await player_ws.send_json(payload)
            else:
                payload["message"] = "There is no any game!"
                payload["status"] = "NotFound"
                await player_ws.send_json(payload)
