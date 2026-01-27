'use strict'

const test = require('brittle')
const AvalonMiner = require('../../workers/lib/miner')
const { STATUS, POWER_MODE } = require('miningos-tpl-wrk-miner/workers/lib/constants')
const crypto = require('crypto')

const password = crypto.randomBytes(4).toString('base64').replace(/[^a-z0-9]/gi, '').slice(0, 4)

test('AvalonMiner constructor', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password,
    timeout: 30000
  })

  t.ok(miner, 'miner instance created')
  t.is(miner.opts.address, '127.0.0.1', 'address set correctly')
  t.is(miner.opts.port, 4028, 'port set correctly')
  t.is(miner.opts.username, 'test', 'username set correctly')
  t.is(miner.opts.password, password, 'password set correctly')
  t.is(miner.opts.timeout, 30000, 'timeout set correctly')
})

test('AvalonMiner validateWriteAction - setPowerMode', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  // Test valid power modes
  t.is(miner.validateWriteAction('setPowerMode', POWER_MODE.SLEEP), 1, 'sleep mode valid')
  t.is(miner.validateWriteAction('setPowerMode', POWER_MODE.NORMAL), 1, 'normal mode valid')
  t.is(miner.validateWriteAction('setPowerMode', POWER_MODE.HIGH), 1, 'high mode valid')

  // Test invalid power mode
  try {
    miner.validateWriteAction('setPowerMode', 'invalid')
    t.fail('should have thrown error for invalid power mode')
  } catch (err) {
    t.ok(err.message.includes('ERR_SET_POWER_MODE_INVALID'), 'invalid power mode throws error')
  }
})

test('AvalonMiner _getStatus', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  // Test with errors
  const statusWithErrors = miner._getStatus(true, { soft_off: '0' }, {})
  t.is(statusWithErrors, STATUS.ERROR, 'status is ERROR when has errors')

  // Test mining status
  const miningStatus = miner._getStatus(false, { soft_off: '0' }, {})
  t.is(miningStatus, STATUS.MINING, 'status is MINING when not suspended')

  // Test sleeping status
  const sleepingStatus = miner._getStatus(false, { soft_off: '1' }, {})
  t.is(sleepingStatus, STATUS.SLEEPING, 'status is SLEEPING when suspended')
})

test('AvalonMiner _isSuspended', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  t.ok(miner._isSuspended({ soft_off: '1' }), 'is suspended when soft_off is 1')
  t.not(miner._isSuspended({ soft_off: '0' }), true, 'is not suspended when soft_off is 0')
})

test('AvalonMiner _calcPowerW', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  const power = miner._calcPowerW({ object_power_consumption: '1500.5' })
  t.is(power, 1500.5, 'power calculated correctly')
})

test('AvalonMiner _calcAvgTemp', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  const avgTemp = miner._calcAvgTemp({ temperature_avg: '75.123' })
  t.is(avgTemp, 75.12, 'average temperature calculated correctly')
})

test('AvalonMiner _getPowerMode', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  // Test sleep mode
  const sleepMode = miner._getPowerMode({ soft_off: '1', work_mode: '0' })
  t.is(sleepMode, POWER_MODE.SLEEP, 'power mode is SLEEP when soft_off is 1')

  // Test high mode
  const highMode = miner._getPowerMode({ soft_off: '0', work_mode: '1' })
  t.is(highMode, POWER_MODE.HIGH, 'power mode is HIGH when work_mode is 1')

  // Test normal mode
  const normalMode = miner._getPowerMode({ soft_off: '0', work_mode: '0' })
  t.is(normalMode, POWER_MODE.NORMAL, 'power mode is NORMAL when work_mode is 0')
})

test('AvalonMiner _calcEfficiency', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  const estats = { object_power_consumption: '1500' }
  const stats = { mhs_av: '100' }

  const efficiency = miner._calcEfficiency(estats, stats)
  t.ok(Math.abs(efficiency - 15000000) < 0.01, 'efficiency calculated correctly')

  // Test with zero hashrate
  const zeroEfficiency = miner._calcEfficiency(estats, { mhs_av: '0' })
  t.is(zeroEfficiency, 0, 'efficiency is 0 when hashrate is 0')

  // Test with invalid values
  const invalidEfficiency = miner._calcEfficiency({ object_power_consumption: 'invalid' }, { mhs_av: '100' })
  t.is(invalidEfficiency, 0, 'efficiency is 0 with invalid values')
})

test('AvalonMiner _calcHashrates', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  const stats = {
    mhs_av: '100.123',
    mhs_30s: '99.456',
    mhs_1m: '98.789',
    mhs_5m: '97.012',
    mhs_15m: '96.345'
  }

  const hashrates = miner._calcHashrates(stats)

  t.is(hashrates.avg, 100.12, 'average hashrate calculated correctly')
  t.is(hashrates.t_30s, 99.45, '30s hashrate calculated correctly')
  t.is(hashrates.t_1m, 98.78, '1m hashrate calculated correctly')
  t.is(hashrates.t_5m, 97.01, '5m hashrate calculated correctly')
  t.is(hashrates.t_15m, 96.34, '15m hashrate calculated correctly')
})

test('AvalonMiner _prepErrors - all pools dead', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  const data = {
    pools: [
      { status: 'Dead' },
      { status: 'Dead' }
    ],
    estats: {
      power_status: ['1', '1', '1'],
      error_code: '500',
      hash_board_status: ['0', '0', '0'],
      mm_board_status_mark: '0',
      psu_status: '0',
      pool_status: '0'
    }
  }

  const result = miner._prepErrors(data)
  t.ok(result.isErrored, 'isErrored is true when all pools are dead')
  t.ok(result.errors.length >= 1, 'at least one error detected')
  const allPoolsDeadError = result.errors.find(e => e.name === 'all_pools_dead')
  t.ok(allPoolsDeadError, 'all pools dead error detected')
})

test('AvalonMiner _prepErrors - power supply issues', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  const data = {
    pools: [{ status: 'Alive' }],
    estats: {
      power_status: ['0', '0', '0'],
      error_code: '500',
      hash_board_status: ['0', '0', '0'],
      mm_board_status_mark: '0',
      psu_status: '0',
      pool_status: '0'
    }
  }

  const result = miner._prepErrors(data)
  t.ok(result.isErrored, 'isErrored is true when power supply has issues')
  t.is(result.errors.length, 1, 'one error detected')
  t.is(result.errors[0].name, 'power_error_status', 'correct error name')
})

test('AvalonMiner _prepErrors - hash board errors', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  const data = {
    pools: [{ status: 'Alive' }],
    estats: {
      power_status: ['1', '1', '1'],
      error_code: '513',
      hash_board_status: ['1', '0', '0'],
      mm_board_status_mark: '0',
      psu_status: '0',
      pool_status: '0'
    }
  }

  const result = miner._prepErrors(data)
  t.ok(result.isErrored, 'isErrored is true when hash board has errors')
  t.ok(result.errors.length >= 1, 'at least one error detected')
  const hashBoardErrors = result.errors.filter(e => e.name === 'hashboard_error')
  t.ok(hashBoardErrors.length >= 1, 'hash board error detected')
})

test('AvalonMiner _prepErrors - pool connection failed', (t) => {
  const mockRpc = {
    rpc: () => ({
      stop: () => Promise.resolve()
    })
  }

  const miner = new AvalonMiner({
    socketer: mockRpc,
    address: '127.0.0.1',
    port: 4028,
    username: 'test',
    password
  })

  const data = {
    pools: [{ status: 'Alive' }],
    estats: {
      power_status: ['1', '1', '1'],
      pool_status: '1',
      error_code: '500',
      hash_board_status: ['0', '0', '0'],
      mm_board_status_mark: '0',
      psu_status: '0'
    }
  }

  const result = miner._prepErrors(data)
  t.ok(result.isErrored, 'isErrored is true when pool connection failed')
  t.ok(result.errors.length >= 1, 'at least one error detected')
  const poolConnectError = result.errors.find(e => e.name === 'pool_connect_failed')
  t.ok(poolConnectError, 'pool connection failed error detected')
})
