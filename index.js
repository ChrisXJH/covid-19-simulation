const INFECT_CHANCE = 0.0005;
const MAX_SPEED = 3;

class Board {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = new Array(this.width);
    for (let i = 0; i < this.width; ++i)
      this.grid[i] = new Array(this.height).fill(null);
  }

  isValidPosition(x, y) {
    return x > 0 && x < this.width && y > 0 && y < this.height;
  }

  isOccupied(x, y) {
    if (!this.isValidPosition(x, y)) return true;

    return this.grid[x][y] !== null;
  }

  getNeighbors(person) {
    const { x, y } = person;
    const results = [];

    for (let newX = x - 1; newX <= x + 1; ++newX) {
      for (let newY = y - 1; newY <= x + 1; ++newY) {
        if ((newX === x && newY === y) || !this.isValidPosition(newX, newY))
          continue;

        this.grid[newX][newY] && results.push(this.grid[newX][newY]);
      }
    }

    return results;
  }

  movePerson(person, newX, newY) {
    if (this.isOccupied(newX, newY)) return;
    this.grid[person.x][person.y] = null;
    this.grid[newX][newY] = person;
    person.x = newX;
    person.y = newY;
  }

  print() {
    const output = this.grid
      .map(row =>
        row
          .map(person => {
            if (!person) return ' ';
            return person.infected ? '*' : '.';
          })
          .join('')
      )
      .join('|\n');
    console.log('\n\n\n\n');
    console.log(output);
  }
}

class Person {
  constructor(id, board, x, y) {
    this.id = id;
    this.board = board;
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.infected = false;

    this.board.movePerson(this, this.x, this.y);
  }

  randomMove() {
    this.dx += Math.floor(Math.random() * 3) - 1;
    this.dy += Math.floor(Math.random() * 3) - 1;

    const sx = Math.abs(this.dx);
    const sy = Math.abs(this.dy);
    const ux = this.dx / sx;
    const uy = this.dy / sy;

    this.dx = sx > MAX_SPEED ? ux * MAX_SPEED : this.dx;
    this.dy = sy > MAX_SPEED ? uy * MAX_SPEED : this.dy;

    const newX = this.x + this.dx;
    const newY = this.y + this.dy;

    this.board.movePerson(this, newX, newY);
  }

  infect() {
    if (!this.infected) return;
    const neighbors = this.board.getNeighbors(this);
    neighbors.forEach(neighbor => {
      if (Math.random() <= INFECT_CHANCE) neighbor.infected = true;
    });
  }

  update() {
    this.randomMove();
    this.infect();
  }
}

function main() {
  const numPersons = 500;
  const w = 50;
  const h = 100;

  const times = 10000;
  const interval = 100;
  const board = new Board(w, h);
  const persons = new Array(numPersons);

  let initX, initY;

  for (let i = 0; i < numPersons; ++i) {
    do {
      initX = Math.floor(Math.random() * w);
      initY = Math.floor(Math.random() * h);
    } while (board.isOccupied(initX, initY));

    persons[i] = new Person(i, board, initX, initY);
  }

  const stats = [];

  let count = 0;

  const intv = setInterval(() => {
    let infections = 0;
    for (let person of persons) {
      person.update();
      if (person.infected) {
        ++infections;
      }
    }

    stats.push({ t: count, y: infections });

    board.print();
    console.log('Infected:', infections);

    ++count;
    if (count === times) clearInterval(intv);
  }, interval);

  persons[0].infected = true;
}

main();
