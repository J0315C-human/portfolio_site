
// Creates a pseudo-random value generator. The seed must be an integer.
class Random {
  private seed: number;
  private startSeed: number;
  constructor(seed: number) {
    this.startSeed = seed;
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  // starts the sequence over from the original seed
  restart() {
    console.log('restarting prng');
    this.seed = this.startSeed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  // Returns a pseudo-random value between 1 and 2^32 - 2.
  next() {
    return this.seed = this.seed * 16807 % 2147483647;
  }

  // Returns a pseudo-random value between min (inclusive) and max
  between(min: number, max: number) {
    const mod = max - min;
    return (this.next() % mod) + min;
  }

  // Returns a pseudo-random floating point number in range [0, 1).
  nextFloat() {
    // We know that result of next() will be 1 to 2147483646 (inclusive).
    return (this.next() - 1) / 2147483646;
  }
}

export default Random;