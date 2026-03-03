(function(global){
  function toDayStart(dateLike){
    const d = new Date(dateLike);
    d.setHours(0,0,0,0);
    return d;
  }

  function dayKey(dateLike){
    const d = toDayStart(dateLike);
    return d.toISOString().slice(0,10);
  }

  function calculateStreak(history){
    if(!Array.isArray(history) || !history.length) return 0;
    const uniqueDays = [...new Set(history.map(h => dayKey(h.date)))].sort().reverse();
    let streak = 0;
    let cursor = toDayStart(new Date());

    for(const key of uniqueDays){
      const hd = toDayStart(key);
      const diff = Math.round((cursor - hd) / 86400000);
      if(diff <= 1){
        streak++;
        cursor = hd;
      } else {
        break;
      }
    }

    return streak;
  }

  function calculateWeekVolume(history, nowDate){
    if(!Array.isArray(history) || !history.length) return 0;
    const now = nowDate ? new Date(nowDate) : new Date();
    const dayIdx = (now.getDay() + 6) % 7;
    const start = new Date(now);
    start.setDate(now.getDate() - dayIdx);
    start.setHours(0,0,0,0);

    return history
      .filter(h => new Date(h.date) >= start)
      .reduce((acc, h) => acc + (Number(h.volume) || 0), 0);
  }

  function calculateWorkoutVolumeFromSets(exercises){
    if(!Array.isArray(exercises)) return 0;
    let total = 0;
    for(const ex of exercises){
      for(const s of (ex.sets || [])){
        if(s.done || s.completed || s.completedAt){
          const kg = Number(s.kg ?? s.weight ?? 0);
          const reps = Number(s.reps ?? 0);
          if(Number.isFinite(kg) && Number.isFinite(reps)) total += kg * reps;
        }
      }
    }
    return total;
  }

  function weekOverWeek(history, nowDate){
    const now = nowDate ? new Date(nowDate) : new Date();
    const dayIdx = (now.getDay() + 6) % 7;

    const curStart = new Date(now);
    curStart.setDate(now.getDate() - dayIdx);
    curStart.setHours(0,0,0,0);

    const prevStart = new Date(curStart);
    prevStart.setDate(curStart.getDate() - 7);

    const prevEnd = new Date(curStart);

    const cur = (history || []).filter(h => {
      const d = new Date(h.date);
      return d >= curStart;
    });

    const prev = (history || []).filter(h => {
      const d = new Date(h.date);
      return d >= prevStart && d < prevEnd;
    });

    const curVol = cur.reduce((a,h)=>a+(Number(h.volume)||0),0);
    const prevVol = prev.reduce((a,h)=>a+(Number(h.volume)||0),0);
    const deltaPct = ((curVol - prevVol) / Math.max(prevVol, 1)) * 100;

    return {
      current: { volume: curVol, workouts: cur.length },
      previous: { volume: prevVol, workouts: prev.length },
      deltaPct
    };
  }

  const api = {
    calculateStreak,
    calculateWeekVolume,
    calculateWorkoutVolumeFromSets,
    weekOverWeek
  };

  if(typeof module !== 'undefined' && module.exports){
    module.exports = api;
  }
  global.LiftrCalc = api;
})(typeof window !== 'undefined' ? window : globalThis);
