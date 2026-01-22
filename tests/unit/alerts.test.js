'use strict'

const test = require('brittle')
const alerts = require('../../workers/lib/alerts')

test('alerts module exports', (t) => {
  t.ok(alerts, 'alerts module exists')
  t.ok(alerts.specs, 'alerts.specs exists')
  t.ok(alerts.specs.miner, 'alerts.specs.miner exists')
})

test('alerts.specs.miner - chips_temp_critical alert', (t) => {
  const chipsTempCritical = alerts.specs.miner.chips_temp_critical

  t.ok(chipsTempCritical, 'chips_temp_critical alert exists')
  t.ok(chipsTempCritical.valid, 'chips_temp_critical has valid function')
  t.ok(chipsTempCritical.probe, 'chips_temp_critical has probe function')
  t.is(typeof chipsTempCritical.valid, 'function', 'valid is a function')
  t.is(typeof chipsTempCritical.probe, 'function', 'probe is a function')
})

test('alerts.specs.miner - chips_temp_critical valid function', (t) => {
  const valid = alerts.specs.miner.chips_temp_critical.valid

  // Mock context and snap objects
  const mockCtx = {
    conf: {
      chips_temp_critical: {
        enabled: true,
        params: {
          temp: 80
        }
      }
    }
  }

  const validSnap = {
    stats: {
      status: 'MINING',
      temperature_c: {
        chips: [{ avg: 50 }]
      }
    }
  }

  const invalidSnap = {
    stats: {
      status: 'OFFLINE'
    }
  }

  // Test with valid snap and enabled config
  t.not(valid(mockCtx, validSnap), true, 'valid returns false for valid snap with enabled config (returns undefined)')

  // Test with invalid snap
  t.not(valid(mockCtx, invalidSnap), true, 'valid returns false for invalid snap')

  // Test with disabled config
  const disabledCtx = {
    conf: {
      chips_temp_critical: false
    }
  }
  t.not(valid(disabledCtx, validSnap), true, 'valid returns false when config is disabled')

  // Test with undefined config
  const undefinedCtx = {
    conf: {}
  }
  t.not(valid(undefinedCtx, validSnap), true, 'valid returns false when config is undefined')

  // Test with null config
  const nullCtx = {
    conf: {
      chips_temp_critical: null
    }
  }
  t.not(valid(nullCtx, validSnap), true, 'valid returns false when config is null')
})

test('alerts.specs.miner - chips_temp_critical probe function', (t) => {
  const probe = alerts.specs.miner.chips_temp_critical.probe

  const mockCtx = {
    conf: {
      chips_temp_critical: {
        params: {
          temp: 80
        }
      }
    }
  }

  // Test with chips above critical temperature
  const highTempSnap = {
    stats: {
      temperature_c: {
        chips: [
          { avg: 85 },
          { avg: 75 },
          { avg: 90 }
        ]
      }
    }
  }
  t.ok(probe(mockCtx, highTempSnap), 'probe returns true when any chip is above critical temperature')

  // Test with chips below critical temperature
  const lowTempSnap = {
    stats: {
      temperature_c: {
        chips: [
          { avg: 70 },
          { avg: 75 },
          { avg: 65 }
        ]
      }
    }
  }
  t.not(probe(mockCtx, lowTempSnap), true, 'probe returns false when all chips are below critical temperature')

  // Test with undefined chips
  const undefinedChipsSnap = {
    stats: {
      temperature_c: {}
    }
  }
  t.not(probe(mockCtx, undefinedChipsSnap), true, 'probe returns false when chips are undefined')

  // Test with null chips
  const nullChipsSnap = {
    stats: {
      temperature_c: {
        chips: null
      }
    }
  }
  t.not(probe(mockCtx, nullChipsSnap), true, 'probe returns false when chips are null')

  // Test with empty chips array
  const emptyChipsSnap = {
    stats: {
      temperature_c: {
        chips: []
      }
    }
  }
  t.not(probe(mockCtx, emptyChipsSnap), true, 'probe returns false when chips array is empty')
})

test('alerts.specs.miner - chips_temp_critical probe with edge case temperatures', (t) => {
  const probe = alerts.specs.miner.chips_temp_critical.probe

  const mockCtx = {
    conf: {
      chips_temp_critical: {
        params: {
          temp: 80
        }
      }
    }
  }

  // Test with chip exactly at critical temperature
  const exactTempSnap = {
    stats: {
      temperature_c: {
        chips: [
          { avg: 80 },
          { avg: 75 }
        ]
      }
    }
  }
  t.not(probe(mockCtx, exactTempSnap), true, 'probe returns false when chip is exactly at critical temperature')

  // Test with chip just above critical temperature
  const justAboveTempSnap = {
    stats: {
      temperature_c: {
        chips: [
          { avg: 80.1 },
          { avg: 75 }
        ]
      }
    }
  }
  t.ok(probe(mockCtx, justAboveTempSnap), 'probe returns true when chip is just above critical temperature')

  // Test with mixed temperatures
  const mixedTempSnap = {
    stats: {
      temperature_c: {
        chips: [
          { avg: 70 },
          { avg: 85 },
          { avg: 60 }
        ]
      }
    }
  }
  t.ok(probe(mockCtx, mixedTempSnap), 'probe returns true when any chip is above critical temperature')
})

test('alerts.specs.miner - chips_temp_critical probe with different critical temperatures', (t) => {
  const probe = alerts.specs.miner.chips_temp_critical.probe

  // Test with higher critical temperature
  const highTempCtx = {
    conf: {
      chips_temp_critical: {
        params: {
          temp: 100
        }
      }
    }
  }

  const highTempSnap = {
    stats: {
      temperature_c: {
        chips: [
          { avg: 85 },
          { avg: 90 }
        ]
      }
    }
  }
  t.not(probe(highTempCtx, highTempSnap), true, 'probe returns false when chips are below higher critical temperature')

  // Test with lower critical temperature
  const lowTempCtx = {
    conf: {
      chips_temp_critical: {
        params: {
          temp: 60
        }
      }
    }
  }

  const lowTempSnap = {
    stats: {
      temperature_c: {
        chips: [
          { avg: 70 },
          { avg: 65 }
        ]
      }
    }
  }
  t.ok(probe(lowTempCtx, lowTempSnap), 'probe returns true when chips are above lower critical temperature')
})

test('alerts.specs.miner - chips_temp_critical probe with malformed data', (t) => {
  const probe = alerts.specs.miner.chips_temp_critical.probe

  const mockCtx = {
    conf: {
      chips_temp_critical: {
        params: {
          temp: 80
        }
      }
    }
  }

  // Test with undefined temperature_c
  const undefinedTempSnap = {
    stats: {}
  }
  t.not(probe(mockCtx, undefinedTempSnap), true, 'probe returns false when temperature_c is undefined')

  // Test with null temperature_c
  const nullTempSnap = {
    stats: {
      temperature_c: null
    }
  }
  t.not(probe(mockCtx, nullTempSnap), true, 'probe returns false when temperature_c is null')

  // Test with chips containing undefined avg values
  const undefinedAvgSnap = {
    stats: {
      temperature_c: {
        chips: [
          { avg: undefined },
          { avg: 85 }
        ]
      }
    }
  }
  t.ok(probe(mockCtx, undefinedAvgSnap), 'probe returns true when any chip avg is above threshold')

  // Test with chips containing null avg values
  const nullAvgSnap = {
    stats: {
      temperature_c: {
        chips: [
          { avg: null },
          { avg: 85 }
        ]
      }
    }
  }
  t.ok(probe(mockCtx, nullAvgSnap), 'probe returns true when any chip avg is above threshold')
})

test('alerts.specs.miner - chips_temp_critical valid with different snap statuses', (t) => {
  const valid = alerts.specs.miner.chips_temp_critical.valid

  const mockCtx = {
    conf: {
      chips_temp_critical: {
        enabled: true,
        params: {
          temp: 80
        }
      }
    }
  }

  // Test with MINING status
  const miningSnap = {
    stats: {
      status: 'MINING',
      temperature_c: {
        chips: [{ avg: 50 }]
      }
    }
  }
  t.not(valid(mockCtx, miningSnap), true, 'valid returns false for MINING status (returns undefined)')

  // Test with SLEEPING status
  const sleepingSnap = {
    stats: {
      status: 'SLEEPING',
      temperature_c: {
        chips: [{ avg: 50 }]
      }
    }
  }
  t.not(valid(mockCtx, sleepingSnap), true, 'valid returns false for SLEEPING status (returns undefined)')

  // Test with OFFLINE status
  const offlineSnap = {
    stats: {
      status: 'OFFLINE',
      temperature_c: {
        chips: [{ avg: 50 }]
      }
    }
  }
  t.not(valid(mockCtx, offlineSnap), true, 'valid returns false for OFFLINE status')

  // Test with ERROR status
  const errorSnap = {
    stats: {
      status: 'ERROR',
      temperature_c: {
        chips: [{ avg: 50 }]
      }
    }
  }
  t.not(valid(mockCtx, errorSnap), true, 'valid returns false for ERROR status (returns undefined)')
})
