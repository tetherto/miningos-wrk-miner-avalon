'use strict'

const WrkMinerRack = require('./lib/worker-base.js')

class WrkMinerRackA1346 extends WrkMinerRack {
  getThingType () {
    return super.getThingType() + '-a1346'
  }
}

module.exports = WrkMinerRackA1346
