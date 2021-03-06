import Tetrinomino from "./Tetrinomino";
import Board from "./Board";
import Ghost from "./Ghost";
import Display from "./Display";

export default class Player {
  board: Board;
  ghost: Ghost;
  next: Display;
  cache: Display;

  animationId = null;
  gameState = "stopped";

  counter = 0;
  interval = 1000;
  previousTime = 0;

  type: string | null = null;
  pos = { x: 0, y: 0 };
  matrix = [];

  nextPiece: Tetrinomino | null;
  cachedPiece: Tetrinomino | null;
  swapped = false;

  constructor(board: Board, ghost: Ghost, next: Display, cache: Display) {
    this.board = board;
    this.ghost = ghost;
    this.next = next;
    this.cache = cache;

    this.update = this.update.bind(this);
  }

  private initialize(): void {
    this.counter = 0;
    this.interval = 1000;
    this.previousTime = 0;
  
    this.type = null;
    this.pos = { x: 0, y: 0 };
    this.matrix = [];
  
    this.nextPiece = null;
    this.cachedPiece = null;
    this.swapped = false;
  }

  private reset(cachedPiece?): void {
    if (this.gameState !== "active") return;

    const tetrinomino = cachedPiece || this.nextPiece || new Tetrinomino();
    this.nextPiece = new Tetrinomino();

    this.type = tetrinomino.type;
    this.matrix = tetrinomino.matrix;
    this.pos.y = 0;
    this.pos.x = (this.board.matrix[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0);

    this.next.update(this.nextPiece);
    this.cache.update(this.cachedPiece);
    this.ghost.setMatrix(this.matrix);
    this.ghost.setPosition(this.pos);

    if (this.board.checkCollision(this.matrix, this.pos)) {
    }

    this.counter = 0;
  }

  private update(time = 0): void {
    if (this.gameState !== "active") return;

    const timeDelta = time - this.previousTime;
    this.previousTime = time;
    this.counter += timeDelta * (this.board.level || 1);

    if (this.counter > (this.interval)) {
      this.drop();
    }

    this.board.advanceFrame(this.matrix, this.pos);
    requestAnimationFrame(this.update);
  }

  private gameOver(): void {
    this.start();
  }

  private place(): void {
    this.swapped = false;
    this.board.mergePosition(this.matrix, this.pos);
    this.board.clearLines();
    this.reset();
  }

  start(): void {
    this.gameState = "active";
    
    this.board.initialize();
    this.initialize();
    this.update();
    this.reset();
  }

  move(offset: number): void {
    this.pos.x += offset;
    if (this.board.checkCollision(this.matrix, this.pos)) {
      this.pos.x -= offset;
    }

    this.ghost.setPosition(this.pos);
  }

  drop(): void {
    this.pos.y++;
    if (this.board.checkCollision(this.matrix, this.pos)) {
      this.pos.y--;
      this.place();
    }
    this.counter = 0;
    this.ghost.setPosition(this.pos);
  }

  slam(): void {
    for (let y = 0; y < this.board.matrix.length; y++) {
      this.pos.y++;
      if (this.board.checkCollision(this.matrix, this.pos)) {
        this.pos.y--;
        this.place();
        break;
      }
    }
  }

  rotate(direction = 0): void {
    for (let y = 0; y < this.matrix.length; y++) {
      for (let x = 0; x < y; x++) {
        [this.matrix[x][y], this.matrix[y][x]] = [this.matrix[y][x], this.matrix[x][y]];
      }
    }
    if (direction === 1) {
      this.matrix.forEach(row => row.reverse());
    } else {
      this.matrix.reverse();
    }
    // Ensure the tetrinomino doesn't get stuck in the wall
    if (this.board.checkCollision(this.matrix, this.pos)) {
      if (this.pos.x < 0) {
        this.pos.x = 0;
      } else if (this.pos.x + this.matrix.length > 12) {
        this.pos.x = 12 - this.matrix.length;
      } else if (this.pos.y + this.matrix.length > 20) {
        this.pos.y = 20 - this.matrix.length;
      }
    }

    this.ghost.setMatrix(this.matrix);
    this.ghost.setPosition(this.pos);
  }

  cacheTetrinomino(): void {
    if (!this.swapped) {
      const cachedPiece = this.cachedPiece;
      this.cachedPiece = new Tetrinomino(this.type);
      this.reset(cachedPiece);
      this.swapped = true;
    }
  }
}
