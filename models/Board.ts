import Cell, { CellColors } from "./Cell";

export default class Board {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  
  width = 240;
  height = 400;
  matrix = [];

  lineTotal = 0;
  level = 0;
  score = 0;

  constructor() {
    this.createElement();
    this.createContext();
    this.initialize();
  }

  private createElement(): void {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    this.canvas = canvas;
  }

  private createContext(): void {
    this.context = this.canvas.getContext("2d");
    this.context.scale(20, 20);
  }

  private createMatrix(w: number, h: number): void {
    while (h--) {
      // @ts-ignore
      const array = new Array(w).fill(0);
      this.matrix.push(array);
    }
  }

  private createCell(x: number, y: number, position, color: string): void {
    const xValue = x + position.x;
    const yValue = y + position.y;

    if (color === "gray") {
      this.context.fillStyle = "rgba(255,255,255,0.2)";
      this.context.fillRect(xValue, yValue, 1, 1);
    } else {
      new Cell(this.context, color, xValue, yValue);
    }
  }

  private drawBoard(matrix, position): void {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!!value) this.createCell(x, y, position, CellColors[value]);
      });
    });
  }

  initialize(): void {
    this.matrix = [];

    this.lineTotal = 0;
    this.level = 0;
    this.score = 0;

    this.createMatrix(12, 20);
    this.updateScore(0);
  }

  checkCollision(playerMatrix, playerPosition): boolean {
    for (let y = 0; y < playerMatrix.length; y++) {
      for (let x = 0; x < playerMatrix[y].length; x++) {
        if (
          !!playerMatrix[y][x] &&
          (this.matrix[y + playerPosition.y] &&
          this.matrix[y + playerPosition.y][x + playerPosition.x]) !== 0 &&
          (this.matrix[y + playerPosition.y] &&
          this.matrix[y + playerPosition.y][x + playerPosition.x]) !== 8
        ) return true;
      }
    }
    return false;
  }

  mergePosition(playerMatrix, playerPosition): void {
    playerMatrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!!value) this.matrix[y + playerPosition.y][x + playerPosition.x] = value;
      });
    });
  }

  mergeGhostPosition(ghostMatrix, ghostPosition): void {
    for (let y = this.matrix.length -1; y > 0; --y) {
      for (let x = 0; x < this.matrix[y].length; ++x) {
        if (this.matrix[y][x] === 8) this.matrix[y][x] = 0;
      }
    }
    this.mergePosition(ghostMatrix, ghostPosition);
  }

  clearLines(): void {
    let lineCount = 0;

    clear:
    for (let y = this.matrix.length -1; y > 0; --y) {
      for (let x = 0; x < this.matrix[y].length; ++x) {
        if (this.matrix[y][x] === 0 || this.matrix[y][x] === 8) {
          continue clear;
        }
      }

      const row = this.matrix.splice(y, 1)[0].fill(0);
      this.matrix.unshift(row);
      lineCount++;
      y++;
    }

    this.updateScore(lineCount);
  }

  updateScore(lineCount: number): void {
    const multipliers = [0, 40, 50, 100, 300];

    this.lineTotal += lineCount;
    this.level = Math.floor(this.lineTotal / 10);
    this.score += (this.level + 1) * (lineCount * multipliers[lineCount]);

    // Display values in HTML
    const scoreEl = document.getElementById("score");
    scoreEl.innerText = `${this.score}`;

    const lineTotalEl = document.getElementById("lineTotal");
    lineTotalEl.innerText = `${this.lineTotal}`;

    const levelEl = document.getElementById("level");
    levelEl.innerText = `${this.level}`;
  }

  advanceFrame(playerMatrix, playerPosition): void {
    this.context.clearRect(0, 0, this.width, this.height);

    this.drawBoard(this.matrix, { x: 0, y: 0 });
    this.drawBoard(playerMatrix, playerPosition);
  }
}
