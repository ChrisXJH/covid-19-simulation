const FPS = 20;
const INFECT_CHANCE = 0.5;
const MOBILITY = 1;
const RADIUS = 2;
const FATALITY_RATE = 0.03;
const SURVIVAL_TIME = 10;
const RECOVERY_TIME = 20;

class Board {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = new Array(this.width);
    for (let i = 0; i < this.width; ++i)
      this.grid[i] = new Array(this.height).fill(null);
  }

  isValidPosition(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  isOccupied(x, y) {
    if (!this.isValidPosition(x, y)) return true;

    return this.grid[x][y] !== null;
  }

  getNeighbors(person) {
    const { x, y } = person;
    const results = [];

    for (let r = 1; r <= RADIUS; ++r) {
      for (let newX = x - r; newX <= x + r; ++newX) {
        for (let newY = y - r; newY <= y + r; ++newY) {
          if ((newX === x && newY === y) || !this.isValidPosition(newX, newY))
            continue;

          this.grid[newX][newY] && results.push(this.grid[newX][newY]);
        }
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
      .map(
        row =>
          row
            .map(person => {
              if (!person) return ' ';
              if (person.dead) return 'X';
              if (person.infected) return '*';

              return '.';
            })
            .join('') + '|'
      )
      .join('\n');
    console.log('\n\n\n\n');
    console.log(output);
  }
}

const PersonStatuses = {
  ALIVE: 'ALIVE',
  INFECTED: 'INFECTED',
  RECOVERED: 'RECOVERED',
  DEAD: 'DEAD'
};

class Person {
  constructor(id, board, x, y) {
    this.id = id;
    this.board = board;
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.status = PersonStatuses.ALIVE;
    this.infectedTime;

    this.board.movePerson(this, this.x, this.y);
  }

  get alive() {
    return this.status === PersonStatuses.ALIVE;
  }

  get infected() {
    return this.status === PersonStatuses.INFECTED;
  }

  get recovered() {
    return this.status === PersonStatuses.RECOVERED;
  }

  get dead() {
    return this.status === PersonStatuses.DEAD;
  }

  randomMove() {
    this.dx += Math.floor(Math.random() * 3) - 1;
    this.dy += Math.floor(Math.random() * 3) - 1;

    const sx = Math.abs(this.dx);
    const sy = Math.abs(this.dy);
    const ux = this.dx / sx;
    const uy = this.dy / sy;

    this.dx = sx > MOBILITY ? ux * MOBILITY : this.dx;
    this.dy = sy > MOBILITY ? uy * MOBILITY : this.dy;

    const newX = this.x + this.dx;
    const newY = this.y + this.dy;

    this.board.movePerson(this, newX, newY);
  }

  infect(time) {
    if (this.dead || this.recovered) return;
    this.infectedTime = time;
    this.status = PersonStatuses.INFECTED;
  }

  infectNeighbors(time) {
    if (!this.infected) return;
    const neighbors = this.board.getNeighbors(this);
    neighbors.forEach(neighbor => {
      if (Math.random() <= INFECT_CHANCE) neighbor.infect(time);
    });
  }

  update(time) {
    if (this.dead) return;
    if (
      Math.random() <= FATALITY_RATE &&
      this.infected &&
      time === this.infectedTime + SURVIVAL_TIME
    ) {
      this.status = PersonStatuses.DEAD;
      return;
    }

    if (this.infected && time >= this.infectedTime + RECOVERY_TIME)
      this.status = PersonStatuses.RECOVERED;

    this.randomMove();
    this.infectNeighbors(time);
  }
}

function main() {
  const numPersons = 150;
  const w = 50;
  const h = 100;

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

  setInterval(() => {
    persons.forEach(person => {
      person.update(count);
    });

    const data = persons.reduce(
      (prev, curr) => ({
        infections:
          prev.infections +
          (curr.infected || curr.recovered || curr.dead ? 1 : 0),
        exiting: prev.exiting + (curr.infected ? 1 : 0),
        deaths: prev.deaths + (curr.dead ? 1 : 0),
        recoveries: prev.recoveries + (curr.recovered ? 1 : 0)
      }),
      { infections: 0, exiting: 0, deaths: 0, recoveries: 0 }
    );

    stats.push({ t: count, data });

    board.print();
    console.log();
    console.log('Infections:', `${data.infections}/${numPersons}`);
    console.log('Existing:', data.exiting);
    console.log('Recoveries:', `${data.recoveries}/${data.infections}`);
    console.log('Deaths:', `${data.deaths}/${data.infections}`);

    ++count;
  }, 1000 / FPS);

  persons[0].infect(0);
}

main();
