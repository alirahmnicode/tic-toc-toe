"""A tic-tac-toe game built with Python and Tkinter."""

from itertools import cycle
import uuid

from pydantic import BaseModel


class Player(BaseModel):
    id: str
    label: str
    color: str


class Move(BaseModel):
    row: int
    col: int
    label: str = ""


BOARD_SIZE = 3


class TicTacToeGame:
    def __init__(self, players: tuple, board_size=BOARD_SIZE):
        self._players = cycle(players)
        self.players = players
        self._game_id = str(uuid.uuid4())
        self.board_size = board_size
        self.current_player = next(self._players)
        self.winner_combo = []
        self._current_moves = []
        self._has_winner = False
        self._winning_combos = []
        self._winner_player = None
        self._setup_board()

    def _setup_board(self):
        self._current_moves = [
            [Move(row=row, col=col) for col in range(self.board_size)]
            for row in range(self.board_size)
        ]
        self._winning_combos = self._get_winning_combos()

    def _get_winning_combos(self):
        rows = [[(move.row, move.col) for move in row] for row in self._current_moves]
        columns = [list(col) for col in zip(*rows)]
        first_diagonal = [row[i] for i, row in enumerate(rows)]
        second_diagonal = [col[j] for j, col in enumerate(reversed(columns))]
        return rows + columns + [first_diagonal, second_diagonal]

    def toggle_player(self):
        """Return a toggled player."""
        self.current_player = next(self._players)

    def is_valid_move(self, move):
        """Return True if move is valid, and False otherwise."""
        row, col = move.row, move.col
        move_was_not_played = self._current_moves[row][col].label == ""
        no_winner = not self._has_winner
        return no_winner and move_was_not_played

    def process_move(self, move):
        """Process the current move and check if it's a win."""
        row, col = move.row, move.col
        self._current_moves[row][col] = move
        for combo in self._winning_combos:
            results = set(self._current_moves[n][m].label for n, m in combo)
            print(results)
            is_win = (len(results) == 1) and ("" not in results)
            if is_win:
                self._has_winner = True
                self._winner_player = results.pop()
                self.winner_combo = combo
                break

    def has_winner(self):
        """Return True if the game has a winner, and False otherwise."""
        return self._has_winner

    def is_tied(self):
        """Return True if the game is tied, and False otherwise."""
        no_winner = not self._has_winner
        played_moves = (move.label for row in self._current_moves for move in row)
        return no_winner and all(played_moves)
 
    def reset_game(self):
        """Reset the game state to play again."""
        for row, row_content in enumerate(self._current_moves):
            for col, _ in enumerate(row_content):
                row_content[col] = Move(row, col)
        self._has_winner = False
        self.winner_combo = []

    def add_player(self, player: Player):
        if len(self.players) < 2:
            self.players = self.players + (player,)
            self._players = cycle(self.players)
            self.current_player = next(self._players)
        elif len(self.players) > 1:
            raise TypeError("Players must have at least one player")

    def play(self, row: int, col: int):
        """Handle a player's move."""
        move = Move(row=row, col=col, label=self.current_player.label)
        if self.is_valid_move(move):
            self.process_move(move)
            if self.is_tied():
                print("tied")
            elif self.has_winner():
                msg = f'Player "{self.current_player.label}" won!'
                print("win")
            else:
                msg = f"{self.current_player.label}'s turn"
            self.toggle_player()

def main():
    """Create the game's board and run its main loop."""
    game = TicTacToeGame()


if __name__ == "__main__":
    main()
