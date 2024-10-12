from fastapi import WebSocket


class ConnectionManager:
    "Manage active websocket connections"

    def __init__(self):
        self.ws_connections = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        print("accepting websocket")
        await websocket.accept()
        self.ws_connections[user_id] = websocket

    def disconnect(self, user_id: str) -> None:
        if self.ws_connections.get(user_id) is not None:
            self.ws_connections.pop(user_id)

    async def send(
        self, payload: dict, user_id: str = None, websocket: WebSocket = None
    ) -> None:
        """send json to websocket"""
        if websocket:
            await websocket.send_json(payload)
        elif user_id:
            user_ws: WebSocket = self.ws_connections.get(user_id)
            if user_ws:
                await user_ws.send_json(payload)
        else:
            raise Exception("Websocket or user id must be specified.")
