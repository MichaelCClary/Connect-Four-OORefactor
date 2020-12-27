/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
class Game {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.HEIGHT = 6;
    this.WIDTH = 7;
    this.currPlayer = p1;
    this.makeBoard();
    this.makeHtmlBoard();
    this.gameOver = false;
    this.waitForComp = false;
  }
  /** makeBoard: create in-JS board structure:
   *   board = array of rows, each row is array of cells  (board[y][x])
   */
  makeBoard() {
    this.board = [];
    for (let y = 0; y < this.HEIGHT; y++) {
      this.board.push(Array.from({ length: this.WIDTH }));
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */
  makeHtmlBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');

    this.handleGameClick = this.handleClick.bind(this);

    top.addEventListener('click', this.handleGameClick);

    for (let x = 0; x < this.WIDTH; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }

    board.append(top);

    // make main part of board
    for (let y = 0; y < this.HEIGHT; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < this.WIDTH; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }

      board.append(row);
    }
  }
  /** findSpotForCol: given column x, return top empty y (null if filled) */
  findSpotForCol(x) {
    for (let y = this.HEIGHT - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }
  /** placeInTable: update DOM to place piece into HTML table of board */

  placeInTable(y, x) {
    const piece = document.createElement('div');

    piece.classList.add('piece');
    piece.style.backgroundColor = this.currPlayer.color;
    piece.style.top = -50 * (y + 2);

    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  /** endGame: announce game end */

  endGame(msg) {

    alert(msg);
  }

  /** handleClick: handle click of column top to play piece */

  handleClick(evt) {
    //prevents clicking too fast
    if (this.waitForComp) {
      return;
    }

    if (this.gameOver) {
      return this.endGame("This game is over, Please play again!")
    }
    // get x from ID of clicked cell
    const x = +evt.target.id;

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);

    // check for win
    if (this.checkForWin(this.board)) {
      this.gameOver = true;
      return this.endGame(`${this.currPlayer.color.toUpperCase()} Wins!!`);
    }

    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      this.gameOver = true;
      return this.endGame('Tie!');
    }

    // switch players
    this.currPlayer === this.p1 ? this.currPlayer = this.p2 : this.currPlayer = this.p1;

    //call computer mode
    if (this.p2.entity === "comp") {
      this.waitForComp = true;
      setTimeout(this.computerTurn.bind(this), 500);
    }
  }


  computerTurn() {

    const x = this.checkforComputer();
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }
    this.currPlayer = this.p2;
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);

    if (this.checkForWin(this.board)) {
      this.gameOver = true;
      return this.endGame(`${this.currPlayer.color.toUpperCase()} Wins!!`);
    }

    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      this.gameOver = true;
      return this.endGame('Tie!');
    }

    this.currPlayer === this.p1 ? this.currPlayer = this.p2 : this.currPlayer = this.p1;
    this.waitForComp = false;
  }
  /** checkForWin: check board cell-by-cell for "does a win start here?" */

  checkforComputer() {
    //checks every possible move for win/lose then does random if none of those happen
    for (let x = 0; x < this.WIDTH; x++) {
      const checkBoard = [];
      for (let j = 0; j < this.HEIGHT; j++) {
        checkBoard.push([...this.board[j]]);
      }
      const y = this.findSpotForCol(x);
      //prevents breaking when getting to top
      if (y !== null) {
        //check for win
        this.currPlayer = this.p2;
        checkBoard[y][x] = this.currPlayer;
        if (this.checkForWin(checkBoard)) {
          return x;
        };

        //check for block
        this.currPlayer = this.p1;
        checkBoard[y][x] = this.currPlayer;
        if (this.checkForWin(checkBoard)) {
          return x;
        };
      }
    }

    //returns random if no wins/loses in next turn
    return Math.floor(Math.random() * this.WIDTH);

  }

  checkForWin(board) {
    const _win = (cells) => {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer

      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.HEIGHT &&
          x >= 0 &&
          x < this.WIDTH &&
          board[y][x] === this.currPlayer
      );
    }

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }


}

class player {
  constructor(color, entity) {
    this.color = color;
    this.entity = entity;
  }
}


const button = document.getElementById("newGame");



button.addEventListener('click', function (e) {
  const p1color = document.getElementById("p1").value;
  let p2color = document.getElementById("p2").value;
  let entity = "human";

  const p1 = new player(p1color, entity);
  //checks for value in player 2 box and if none switches to computer player for player 2 and gives default of black for computer
  if (p2color === "") {
    p1color === "black" ? p2color = "pink" : p2color = "black";
    entity = "comp";
  }

  const p2 = new player(p2color, entity);
  const game = new Game(p1, p2);

});




