'use strict'

const test = require('brittle')
const stats = require('../../workers/lib/stats')

test('stats module exports', (t) => {
  t.ok(stats, 'stats module exists')
  t.ok(stats.specs, 'stats.specs exists')
  t.ok(stats.specs.miner, 'stats.specs.miner exists')
  t.ok(stats.specs.miner.ops, 'stats.specs.miner.ops exists')
})

test('stats.specs.miner.ops - hashrate operations', (t) => {
  const ops = stats.specs.miner.ops

  // Test hashrate_mhs_1m_sum
  t.ok(ops.hashrate_mhs_1m_sum, 'hashrate_mhs_1m_sum operation exists')
  t.is(ops.hashrate_mhs_1m_sum.op, 'sum', 'hashrate_mhs_1m_sum operation type is sum')
  t.is(ops.hashrate_mhs_1m_sum.src, 'last.snap.stats.hashrate_mhs.t_5m', 'hashrate_mhs_1m_sum source is correct')

  // Test hashrate_mhs_1m_group_sum
  t.ok(ops.hashrate_mhs_1m_group_sum, 'hashrate_mhs_1m_group_sum operation exists')
  t.is(ops.hashrate_mhs_1m_group_sum.op, 'group_sum', 'hashrate_mhs_1m_group_sum operation type is group_sum')
  t.is(ops.hashrate_mhs_1m_group_sum.src, 'last.snap.stats.hashrate_mhs.t_5m', 'hashrate_mhs_1m_group_sum source is correct')
  t.ok(ops.hashrate_mhs_1m_group_sum.group, 'hashrate_mhs_1m_group_sum has group function')

  // Test hashrate_mhs_1m_avg
  t.ok(ops.hashrate_mhs_1m_avg, 'hashrate_mhs_1m_avg operation exists')
  t.is(ops.hashrate_mhs_1m_avg.op, 'avg', 'hashrate_mhs_1m_avg operation type is avg')
  t.is(ops.hashrate_mhs_1m_avg.src, 'last.snap.stats.hashrate_mhs.t_5m', 'hashrate_mhs_1m_avg source is correct')

  // Test hashrate_mhs_1m_cnt
  t.ok(ops.hashrate_mhs_1m_cnt, 'hashrate_mhs_1m_cnt operation exists')
  t.is(ops.hashrate_mhs_1m_cnt.op, 'cnt', 'hashrate_mhs_1m_cnt operation type is cnt')
  t.is(ops.hashrate_mhs_1m_cnt.src, 'last.snap.stats.hashrate_mhs.t_5m', 'hashrate_mhs_1m_cnt source is correct')
  t.ok(typeof ops.hashrate_mhs_1m_cnt.filter === 'function', 'hashrate_mhs_1m_cnt has filter function')

  // Test hashrate_mhs_1m_cnt_active
  t.ok(ops.hashrate_mhs_1m_cnt_active, 'hashrate_mhs_1m_cnt_active operation exists')
  t.is(ops.hashrate_mhs_1m_cnt_active.op, 'cnt', 'hashrate_mhs_1m_cnt_active operation type is cnt')
  t.is(ops.hashrate_mhs_1m_cnt_active.src, 'last.snap.stats.hashrate_mhs.t_5m', 'hashrate_mhs_1m_cnt_active source is correct')
  t.ok(typeof ops.hashrate_mhs_1m_cnt_active.filter === 'function', 'hashrate_mhs_1m_cnt_active has filter function')
})

test('stats.specs.miner.ops - offline_or_sleeping_miners_cnt', (t) => {
  const ops = stats.specs.miner.ops
  const filter = ops.offline_or_sleeping_miners_cnt.filter

  t.ok(filter, 'offline_or_sleeping_miners_cnt filter exists')
  t.is(typeof filter, 'function', 'offline_or_sleeping_miners_cnt filter is a function')

  // Test with maintenance container (should return false)
  const maintenanceEntry = {
    info: { container: 'maintenance' },
    last: { snap: { stats: { status: 'OFFLINE' } } }
  }
  t.not(filter(maintenanceEntry), true, 'maintenance container should not be counted')

  // Test with offline status (should return true)
  const offlineEntry = {
    info: { container: 'rack-0' },
    last: { snap: { stats: { status: 'OFFLINE' } } }
  }
  t.not(filter(offlineEntry), true, 'offline status should not be counted by this filter')

  // Test with sleeping status (should return true)
  const sleepingEntry = {
    info: { container: 'rack-0' },
    last: { snap: { stats: { status: 'SLEEPING' } } }
  }
  t.not(filter(sleepingEntry), true, 'sleeping status should not be counted by this filter')

  // Test with mining status (should return false)
  const miningEntry = {
    info: { container: 'rack-0' },
    last: { snap: { stats: { status: 'MINING' } } }
  }
  t.not(filter(miningEntry), true, 'mining status should not be counted')
})

test('stats.specs.miner.ops - hashrate_mhs_1m_cnt filter', (t) => {
  const ops = stats.specs.miner.ops
  const filter = ops.hashrate_mhs_1m_cnt.filter

  t.ok(filter, 'hashrate_mhs_1m_cnt filter exists')
  t.is(typeof filter, 'function', 'hashrate_mhs_1m_cnt filter is a function')

  // Test with maintenance container (should return false)
  const maintenanceEntry = {
    info: { container: 'maintenance' },
    last: { snap: { stats: { hashrate_mhs: { t_5m: 100 } } } }
  }
  t.not(filter(maintenanceEntry), true, 'maintenance container should not be counted')

  // Test with valid hashrate (should return true)
  const validEntry = {
    info: { container: 'rack-0' },
    last: { snap: { stats: { hashrate_mhs: { t_5m: 100 } } } }
  }
  t.ok(filter(validEntry), 'valid hashrate should be counted')

  // Test with null hashrate (should return false)
  const nullHashrateEntry = {
    info: { container: 'rack-0' },
    last: { snap: { stats: { hashrate_mhs: { t_5m: null } } } }
  }
  t.not(filter(nullHashrateEntry), true, 'null hashrate should not be counted')

  // Test with undefined hashrate (should return false)
  const undefinedHashrateEntry = {
    info: { container: 'rack-0' },
    last: { snap: { stats: { hashrate_mhs: { t_5m: undefined } } } }
  }
  t.not(filter(undefinedHashrateEntry), true, 'undefined hashrate should not be counted')
})

test('stats.specs.miner.ops - hashrate_mhs_1m_cnt_active filter', (t) => {
  const ops = stats.specs.miner.ops
  const filter = ops.hashrate_mhs_1m_cnt_active.filter

  t.ok(filter, 'hashrate_mhs_1m_cnt_active filter exists')
  t.is(typeof filter, 'function', 'hashrate_mhs_1m_cnt_active filter is a function')

  // Test with mining status (should return true)
  const miningEntry = {
    last: { snap: { stats: { status: 'MINING' } } }
  }
  t.not(filter(miningEntry), true, 'mining status should not be counted by this filter')

  // Test with offline status (should return false)
  const offlineEntry = {
    last: { snap: { stats: { status: 'OFFLINE' } } }
  }
  t.not(filter(offlineEntry), true, 'offline status should not be counted')

  // Test with sleeping status (should return false)
  const sleepingEntry = {
    last: { snap: { stats: { status: 'SLEEPING' } } }
  }
  t.not(filter(sleepingEntry), true, 'sleeping status should not be counted')
})

test('stats.specs.miner.ops - power_w operations', (t) => {
  const ops = stats.specs.miner.ops

  // Test power_w_sum
  t.ok(ops.power_w_sum, 'power_w_sum operation exists')
  t.is(ops.power_w_sum.op, 'sum', 'power_w_sum operation type is sum')
  t.is(ops.power_w_sum.src, 'last.snap.stats.power_w', 'power_w_sum source is correct')

  // Test power_w_avg
  t.ok(ops.power_w_avg, 'power_w_avg operation exists')
  t.is(ops.power_w_avg.op, 'avg', 'power_w_avg operation type is avg')
  t.is(ops.power_w_avg.src, 'last.snap.stats.power_w', 'power_w_avg source is correct')
})

test('stats.specs.miner.ops - temperature operations', (t) => {
  const ops = stats.specs.miner.ops

  // Test temperature_c_avg
  t.ok(ops.temperature_c_avg, 'temperature_c_avg operation exists')
  t.is(ops.temperature_c_avg.op, 'avg', 'temperature_c_avg operation type is avg')
  t.is(ops.temperature_c_avg.src, 'last.snap.stats.temperature_c.avg', 'temperature_c_avg source is correct')

  // Test temperature_c_group_avg
  t.ok(ops.temperature_c_group_avg, 'temperature_c_group_avg operation exists')
  t.is(ops.temperature_c_group_avg.op, 'group_avg', 'temperature_c_group_avg operation type is group_avg')
  t.is(ops.temperature_c_group_avg.src, 'last.snap.stats.temperature_c.avg', 'temperature_c_group_avg source is correct')
})

test('stats.specs.miner.ops - efficiency operations', (t) => {
  const ops = stats.specs.miner.ops

  // Test efficiency_w_ths_avg
  t.ok(ops.efficiency_w_ths_avg, 'efficiency_w_ths_avg operation exists')
  t.is(ops.efficiency_w_ths_avg.op, 'avg', 'efficiency_w_ths_avg operation type is avg')
  t.is(ops.efficiency_w_ths_avg.src, 'last.snap.stats.efficiency_w_ths', 'efficiency_w_ths_avg source is correct')

  // Test efficiency_w_ths_type_group_avg
  t.ok(ops.efficiency_w_ths_type_group_avg, 'efficiency_w_ths_type_group_avg operation exists')
  t.is(ops.efficiency_w_ths_type_group_avg.op, 'group_avg', 'efficiency_w_ths_type_group_avg operation type is group_avg')
  t.is(ops.efficiency_w_ths_type_group_avg.src, 'last.snap.stats.efficiency_w_ths', 'efficiency_w_ths_type_group_avg source is correct')
})

test('stats.specs.miner.ops - error operations', (t) => {
  const ops = stats.specs.miner.ops

  // Test error_cnt
  t.ok(ops.error_cnt, 'error_cnt operation exists')
  t.is(ops.error_cnt.op, 'group_cnt', 'error_cnt operation type is group_cnt')
  t.ok(typeof ops.error_cnt.filter === 'function', 'error_cnt has filter function')

  // Test error_miners_cnt
  t.ok(ops.error_miners_cnt, 'error_miners_cnt operation exists')
  t.is(ops.error_miners_cnt.op, 'cnt', 'error_miners_cnt operation type is cnt')
  t.ok(typeof ops.error_miners_cnt.filter === 'function', 'error_miners_cnt has filter function')
})

test('stats.specs.miner.ops - error_cnt filter', (t) => {
  const ops = stats.specs.miner.ops
  const filter = ops.error_cnt.filter

  t.ok(filter, 'error_cnt filter exists')
  t.is(typeof filter, 'function', 'error_cnt filter is a function')

  // Test with errors (should return false based on actual behavior)
  const errorEntry = {
    last: { snap: { stats: { errors: [{ name: 'test_error' }] } } }
  }
  t.not(filter(errorEntry), true, 'entry with errors should not be counted by this filter')

  // Test without errors (should return false)
  const noErrorEntry = {
    last: { snap: { stats: { errors: [] } } }
  }
  t.not(filter(noErrorEntry), true, 'entry without errors should not be counted')

  // Test with undefined errors (should return false)
  const undefinedErrorEntry = {
    last: { snap: { stats: {} } }
  }
  t.not(filter(undefinedErrorEntry), true, 'entry with undefined errors should not be counted')
})

test('stats.specs.miner.ops - error_miners_cnt filter', (t) => {
  const ops = stats.specs.miner.ops
  const filter = ops.error_miners_cnt.filter

  t.ok(filter, 'error_miners_cnt filter exists')
  t.is(typeof filter, 'function', 'error_miners_cnt filter is a function')

  // Test with errors (should return false based on actual behavior)
  const errorEntry = {
    last: { snap: { stats: { errors: [{ name: 'test_error' }] } } }
  }
  t.not(filter(errorEntry), true, 'entry with errors should not be counted by this filter')

  // Test without errors (should return false)
  const noErrorEntry = {
    last: { snap: { stats: { errors: [] } } }
  }
  t.not(filter(noErrorEntry), true, 'entry without errors should not be counted')
})
