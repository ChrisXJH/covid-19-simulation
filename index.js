const INFECT_CHANCE = 0.4;

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
    this.grid[person.x][person.y] = null;
    this.grid[newX][newY] = person;
    person.x = newX;
    person.y = newY;
  }

  print() {
    const output = this.grid.map(row =>
      row.map(person => {
        if (!person) return ' ';
        return person.infected ? '*' : '0';
      })
    );
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
    this.infected = false;

    this.board.movePerson(this, this.x, this.y);
  }

  randomMove() {
    let newX, newY;

    do {
      const dx = Math.floor(Math.random() * 3) - 1;
      const dy = Math.floor(Math.random() * 3) - 1;

      newX = this.x + dx;
      newY = this.y + dy;
    } while (this.board.isOccupied(newX, newY));

    this.board.movePerson(this, newX, newY);
  }

  checkInfection() {
    if (this.infected) return;
    const neighbors = this.board.getNeighbors(this);
    const shouldInfect =
      Math.random() <= INFECT_CHANCE && neighbors.some(p => p.infected);
    this.infected = shouldInfect;
  }

  update() {
    this.randomMove();
    this.checkInfection();
  }
}

function main() {
  const numPersons = 20;
  const w = 10;
  const h = 10;

  const times = 10000;
  const interval = 200;
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

  let count = 0;

  const intv = setInterval(() => {
    for (let person of persons) {
      person.update();
    }

    board.print();

    ++count;
    if (count === times) clearInterval(intv);
  }, interval);

  persons[0].infected = true;
}
