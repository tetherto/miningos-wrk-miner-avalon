'use strict'

const libAlerts = require('miningos-tpl-wrk-miner/workers/lib/alerts')
const libUtils = require('miningos-tpl-wrk-miner/workers/lib/utils')

libAlerts.specs.miner = {
  ...libAlerts.specs.miner_default,

  chips_temp_critical: {
    valid: (ctx, snap) => {
      return libUtils.isValidSnap(snap) && !libUtils.isOffline(snap) && ctx.conf.chips_temp_critical
    },
    probe: (ctx, snap) => {
      const a = snap.stats.temperature_c?.chips?.some((t) => t.avg > ctx.conf.chips_temp_critical.params.temp)
      return a || false
    }
  }
}

module.exports = libAlerts
