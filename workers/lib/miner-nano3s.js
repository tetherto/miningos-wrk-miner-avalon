'use strict'

const async = require('async')
const AvalonMiner = require('./miner')
const utils = require('./utils')

const safeSplit = (val, sep = ' ') => (val || '').split(sep)

class AvalonMinerNano3s extends AvalonMiner {
  async getEStats () {
    const response = await this._sendCommand('estats')
    const parsedData = {
      success: true,
      serial: utils.extractValueBetweenBrackets(response, 'DNA'),
      free_memory: utils.extractValueBetweenBrackets(response, 'MEMFREE'),
      net_fail: utils.extractValueBetweenBrackets(response, 'NETFAIL'),
      system_status: utils.extractValueBetweenBrackets(response, 'SYSTEMSTATU'),
      boot_by: utils.extractValueBetweenBrackets(response, 'BOOTBY'),
      local_work: utils.extractValueBetweenBrackets(response, 'LW'),
      miner_hash_faults: utils.extractValueBetweenBrackets(response, 'MH'),
      hardware_errors: utils.extractValueBetweenBrackets(response, 'HW'),
      average_calculation_error_ratio: utils.extractValueBetweenBrackets(response, 'DH'),
      temperature: utils.extractValueBetweenBrackets(response, 'Temp'),
      temperature_max: utils.extractValueBetweenBrackets(response, 'TMax'),
      temperature_avg: utils.extractValueBetweenBrackets(response, 'TAvg'),
      fan1: utils.extractValueBetweenBrackets(response, 'Fan1'),
      fan2: utils.extractValueBetweenBrackets(response, 'Fan2'),
      fan_speed_ratio: utils.extractValueBetweenBrackets(response, 'FanR'),
      average_voltage: utils.extractValueBetweenBrackets(response, 'Vo'),
      power_status: safeSplit(utils.extractValueBetweenBrackets(response, 'PS')),
      // Nano 3S has only 1 hashboard — boards 1 and 2 won't exist
      PLL: [0].map((index) => safeSplit(utils.extractValueBetweenBrackets(response, `PLL${index}`))),
      theoretical_hash_rate: utils.extractValueBetweenBrackets(response, 'GHSspd'),
      logical_hash_rate: utils.extractValueBetweenBrackets(response, 'GHSmm'),
      ghs_avg: utils.extractValueBetweenBrackets(response, 'GHSavg'),
      frequency: utils.extractValueBetweenBrackets(response, 'Freq'),
      led: utils.extractValueBetweenBrackets(response, 'Led'),
      miner_ghs: safeSplit(utils.extractValueBetweenBrackets(response, 'MGHS')),
      max_chip_temperature: safeSplit(utils.extractValueBetweenBrackets(response, 'MTmax')),
      avg_chip_temperature: safeSplit(utils.extractValueBetweenBrackets(response, 'MTavg')),
      chip_count: utils.extractValueBetweenBrackets(response, 'TA'),
      ping: utils.extractValueBetweenBrackets(response, 'PING'),
      core: utils.extractValueBetweenBrackets(response, 'Core'),
      psu_status: utils.extractValueBetweenBrackets(response, 'POWS'),
      EEPROM: safeSplit(utils.extractValueBetweenBrackets(response, 'EEPROM')),
      hash_board_status: safeSplit(utils.extractValueBetweenBrackets(response, 'HASHS')),
      pool_status: utils.extractValueBetweenBrackets(response, 'POOLS'),
      soft_off: utils.extractValueBetweenBrackets(response, 'SoftOFF'),
      error_code: safeSplit(utils.extractValueBetweenBrackets(response, 'ECHU')),
      mm_board_status_mark: utils.extractValueBetweenBrackets(response, 'ECMM'),
      // Only board 0 for Nano 3S
      frequency_config: [0].map((index) => ({
        index,
        frequencies: safeSplit(utils.extractValueBetweenBrackets(response, `SF${index}`))
      })),
      chip_temperatures: [0].map((index) => ({
        index,
        temperatures: utils.extractValueBetweenBrackets(response, `PVT_T${index}`)
      })),
      chip_voltages: [0].map((index) => ({
        index,
        voltages: utils.extractValueBetweenBrackets(response, `PVT_V${index}`)
      })),
      nonce_values: [0].map((index) => ({
        index,
        nonce: safeSplit(utils.extractValueBetweenBrackets(response, `MW${index}`))
      })),
      communication_errors: safeSplit(utils.extractValueBetweenBrackets(response, 'CRC')),
      FACOPTS: [0].map((index) => ({
        index,
        options: utils.extractValueBetweenBrackets(response, `FACOPTS${index}`)
      })),
      ATABD: [0].map((index) => safeSplit(utils.extractValueBetweenBrackets(response, `ATABD${index}`))
      ),
      aging: utils.extractValueBetweenBrackets(response, 'ADJ'),
      COP: safeSplit(utils.extractValueBetweenBrackets(response, 'COP')),
      object_power_consumption: utils.extractValueBetweenBrackets(response, 'MPO'),
      voltage_upper_limit: utils.extractValueBetweenBrackets(response, 'MVL'),
      work_mode: utils.extractValueBetweenBrackets(response, 'WORKMODE')
    }
    return parsedData
  }

  // Nano 3S has 1 hashboard — override to avoid accessing board indices 1 and 2
  async _prepSnap () {
    const data = await async.parallelLimit({
      version: this.getVersion.bind(this),
      stats: this.getStats.bind(this),
      estats: this.getEStats.bind(this),
      pools: this.getPools.bind(this)
    }, 3)

    const { isErrored, errors } = this._prepErrors(data)

    const boards = data.estats.ATABD || []

    return {
      stats: {
        status: this._getStatus(isErrored, data.estats),
        errors: isErrored ? errors : undefined,
        power_w: this._calcPowerW(data.estats),
        efficiency_w_ths: this._calcEfficiency(data.estats, data.stats),
        nominal_efficiency_w_ths: this.opts.nominalEfficiencyWThs || 0,
        pool_status: data.pools.filter(p => (p.url && p.user)).map((pool) => ({
          pool: pool.url,
          accepted: parseInt(pool.accepted),
          rejected: parseInt(pool.rejected),
          stale: parseInt(pool.stale)
        })),
        all_pools_shares: this._calcNewShares(data.pools),
        uptime_ms: parseInt(data.stats.elapsed) * 1000,
        hashrate_mhs: this._calcHashrates(data.stats),
        frequency_mhz: {
          avg: Math.floor(parseFloat(data.estats.frequency) * 100) / 100,
          target: boards.reduce((acc, value) => acc + parseFloat(value), 0) / (boards.length || 1),
          chips: boards.map((bd, index) => ({
            index,
            current: Math.floor(parseFloat(data.estats.frequency) * 100) / 100,
            target: Math.max(...bd.map((value) => parseFloat(value)))
          }))
        },
        temperature_c: {
          ambient: Math.floor(parseFloat(data.estats.temperature) * 100) / 100,
          max: Math.floor(parseFloat(data.estats.temperature_max) * 100) / 100,
          avg: this._calcAvgTemp(data.estats),
          chips: data.estats.max_chip_temperature.map((value, index) => ({
            index,
            max: Math.floor(parseFloat(data.estats.max_chip_temperature[index]) * 100) / 100 || 0,
            avg: Math.floor(parseFloat(data.estats.avg_chip_temperature[index]) * 100) / 100 || 0
          }))
        },
        miner_specific: {}
      },
      config: {
        network_config: {
          ip_address: this.opts.address,
          dns: []
        },
        pool_config: data.pools.filter(p => (p.url && p.user)).map((pool) => ({
          url: pool.url,
          username: pool.user
        })),
        power_mode: this._getPowerMode(data.estats),
        suspended: this._isSuspended(data.estats),
        led_status: data.estats.led === '1',
        firmware_ver: data.version.version
      }
    }
  }
}

module.exports = AvalonMinerNano3s
