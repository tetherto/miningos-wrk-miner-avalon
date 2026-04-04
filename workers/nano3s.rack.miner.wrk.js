'use strict'

const WrkMinerRack = require('./lib/worker-base')
const MinerNano3s = require('./lib/miner-nano3s')

class WrkMinerRackNano3s extends WrkMinerRack {
  getThingType () {
    return super.getThingType() + '-nano3s'
  }

  getThingTags () {
    return ['avalon', 'nano3s']
  }

  createMiner (opts) {
    return new MinerNano3s(opts)
  }
}

module.exports = WrkMinerRackNano3s
