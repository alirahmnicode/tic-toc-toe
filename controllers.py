from fastapi import WebSocket
from connection import ConnectionManager
from game import TicTacToeGame


async def create_game(
    game: TicTacToeGame, ws_manager: ConnectionManager, websocket: WebSocket
):
    payload = {
        "method": "CreateGame",
        "status": "ok",
        "gameId": game._game_id,
    }
    await ws_manager.send(payload=payload, websocket=websocket)


# join to a existing game
async def join_game(
    player, game: TicTacToeGame, ws_manager: ConnectionManager, websocket: WebSocket
):
    player.label = "O"
    if game is not None:
        if len(game.players) <= 1:
            game.add_player(player)
            payload = {"method": "JoinToGame", "status": "ok"}
            await ws_manager.send(payload=payload, websocket=websocket)
        else:
            message = "The game is playing by tow players."
            await send_alert(
                ws_manager=ws_manager,
                websocket=websocket,
                status="error",
                message=message,
            )
    else:
        message = "The game is not exist."
        await send_alert(
            ws_manager=ws_manager,
            websocket=websocket,
            status="error",
            message=message,
        )


# join to a random game
async def join_random_game(
    game: TicTacToeGame, player, ws_manager: ConnectionManager, websocket: WebSocket
):
    player.label = "O"
    payload = {
        "method": "JoinToRandomGame",
    }
    if game:
        game.add_player(player)
        payload["message"] = "You have joined the game successfully!"
        payload["status"] = "ok"
        payload["game_id"] = game._game_id
        # send message to other player
        alert_message = "A random player has joined the game!"
        await ws_manager.send(
            payload=get_alert_payload(status="success", message=alert_message),
            user_id=game._game_id,
        )
    else:
        payload["message"] = "There is no any game!"
        payload["status"] = "NotFound"
    await ws_manager.send(payload=payload, websocket=websocket)


# handle move
async def handle_move(
    row: int, col: int, game: TicTacToeGame, ws_manager: ConnectionManager
):
    payload = {"method": "HandleMove", "status": "ok", "has_winner": False}
    if row is not None and col is not None:
        if game:
            game.play(row, col)
            # send this move to the next player
            # in play() method the toggle_player() method is called
            move = f"{row}_{col}"
            payload["message"] = move
            await ws_manager.send(payload=payload, user_id=game.current_player.id)
            # if the game hss winner send winner compos to both players
            if game.has_winner():
                for player in game.players:
                    payload["winner_combo"] = game.winner_combo
                    payload["has_winner"] = True
                    payload["winner_player"] = game._winner_player
                    await ws_manager.send(payload=payload, user_id=player.id)
        else:
            raise Exception("game dose not exist")


async def send_alert(
    ws_manager: ConnectionManager,
    websocket: WebSocket,
    status: str,
    message: str,
):
    payload = get_alert_payload(status=status, message=message)
    await ws_manager.send(websocket=websocket, payload=payload)


def get_alert_payload(status, message):
    payload = {"method": "Alert"}
    payload["status"] = status
    payload["message"] = message
    return payload
