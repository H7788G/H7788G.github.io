const assert = require('assert');
const {
  calculateStreak,
  calculateWeekVolume,
  calculateWorkoutVolumeFromSets,
  weekOverWeek
} = require('../src/calculations.js');

(function testWorkoutVolume(){
  const vol = calculateWorkoutVolumeFromSets([
    { sets: [{ kg: 100, reps: 5, done: true }, { kg: 90, reps: 8, done: true }] },
    { sets: [{ kg: 40, reps: 12, done: false }] }
  ]);
  assert.strictEqual(vol, 1220);
})();

(function testStreak(){
  const today = new Date('2026-03-03T12:00:00Z');
  const history = [
    { date: '2026-03-03', volume: 1000 },
    { date: '2026-03-02', volume: 1000 },
    { date: '2026-03-01', volume: 1000 },
    { date: '2026-02-27', volume: 1000 }
  ];
  const RealDate = Date;
  global.Date = class extends RealDate {
    constructor(...args){
      if(args.length) return new RealDate(...args);
      return new RealDate(today);
    }
    static now(){ return today.getTime(); }
    static parse(v){ return RealDate.parse(v); }
    static UTC(...args){ return RealDate.UTC(...args); }
  };
  assert.strictEqual(calculateStreak(history), 3);
  global.Date = RealDate;
})();

(function testWeekVolumeAndWoW(){
  const history = [
    { date: '2026-03-02', volume: 5000 },
    { date: '2026-03-03', volume: 6000 },
    { date: '2026-02-24', volume: 4000 },
    { date: '2026-02-26', volume: 3000 }
  ];
  const weekVol = calculateWeekVolume(history, '2026-03-03T09:00:00Z');
  assert.strictEqual(weekVol, 11000);

  const wow = weekOverWeek(history, '2026-03-03T09:00:00Z');
  assert.strictEqual(wow.current.volume, 11000);
  assert.strictEqual(wow.previous.volume, 7000);
})();

console.log('calculations tests: OK');
