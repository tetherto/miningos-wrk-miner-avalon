'use strict'

const WrkMinerRackNano3s = require('./lib/worker-base-nano3s')

class WrkMinerRackNano3sModel extends WrkMinerRackNano3s {
  getThingTags () {
    return ['avalon', 'nano3s']
  }
}

module.exports = WrkMinerRackNano3sModel
