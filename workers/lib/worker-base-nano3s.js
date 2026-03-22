'use strict'

const WrkMinerRack = require('./worker-base')
const MinerNano3s = require('./miner-nano3s')
const TcpFacility = require('svc-facs-tcp')

const DEFAULT_NOMINAL_EFFICIENCY_WTHS_NANO3S = {
  'miner-av-nano3s': 23
}

class WrkMinerRackNano3s extends WrkMinerRack {
  getThingType () {
    // WrkMinerRack returns 'miner-av', we append '-nano3s'
    return super.getThingType() + '-nano3s'
  }

  getNominalEficiencyWThs () {
    return super.getNominalEficiencyWThs(DEFAULT_NOMINAL_EFFICIENCY_WTHS_NANO3S)
  }

  async connectThing (thg) {
    if (!thg.opts.address || !thg.opts.port || !thg.opts.password) {
      return 0
    }

    const miner = new MinerNano3s({
      ...thg.opts,
      socketer: {
        readStrategy: TcpFacility.TCP_READ_STRATEGY.ON_END,
        rpc: (opts) => {
          return this.tcp_0.getRPC(opts)
        }
      },
      conf: this.conf.thing.miner || {},
      id: thg.id,
      nominalEfficiencyWThs: this.getNominalEficiencyWThs()
    })

    miner.on('error', (e) => {
      this.debugDeviceError(thg, e)
    })

    thg.ctrl = miner

    return 1
  }
}

module.exports = WrkMinerRackNano3s
