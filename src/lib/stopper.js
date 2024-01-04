class Stopper { // process.hrtime.bigint() is nanoseconds
  constructor({ header = '', total = '' }) {
    this.header = header;
    this.total = total;
    this.steps = [];
  }

  start() {
    this.start = process.hrtime.bigint();
    if (this.header) console.log(this.header);
    return this;
  }

  click(name) {
    this.steps.push({ name, time: process.hrtime.bigint() });

    let step = this.steps[this.steps.length - 1];
    let stepBefore = this.steps.length === 1 ? { time: this.start } : this.steps[this.steps.length - 2];

    console.info(
      `${step.name} %d.%ss`,
      this.toSecs(step.time - stepBefore.time).toString(),
      this.toMilis(step.time - stepBefore.time).toString().padStart(3, '0')
    );

    return this;
  }

  stop() {
    this.end = process.hrtime.bigint();
    console.info(
      `${this.total} %d.%ss`,
      this.toSecs(this.end - this.start).toString(),
      this.toMilis(this.end - this.start).toString().padStart(3, '0')
    );
    return this;
  }

  cancel() {
    this.end = process.hrtime.bigint();
    return this;
  }

  toSecs(t) {
    return Number(t / BigInt(1000000000));
  }

  toMilis(t) {
    return Number(t / BigInt(1000000)) % 1000;
  }
}

module.exports = {
  Stopper
};
