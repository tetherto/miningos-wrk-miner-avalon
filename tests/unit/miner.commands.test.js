'use strict'

const test = require('brittle')
const crypto = require('crypto')
const AvalonMiner = require('../../workers/lib/miner')

const password = crypto.randomBytes(4).toString('base64').replace(/[^a-z0-9]/gi, '').slice(0, 4)

// cgminer/Avalon responses are comma-separated key=value pairs; isResOk() treats
// Code 118/119 as success.
const okRes = 'STATUS=S,When=1,Code=118,Msg=ok,Description=cgminer'
const errRes = 'STATUS=E,When=1,Code=999,Msg=err,Description=cgminer'

// Build a miner with a stubbed TCP rpc. `requestImpl(command)` returns the raw
// response string; defaults to an OK response for every command.
function makeMiner (requestImpl = async () => okRes, extraOpts = {}) {
  const socketer = {
    readStrategy: 0,
    rpc: () => ({ request: requestImpl, stop: async () => {} })
  }
  return new AvalonMiner({
    socketer,
    address: '127.0.0.1',
    port: 4028,
    username: 'root',
    password,
    timeout: 100,
    ...extraOpts
  })
}

test('close - stops the rpc socket', async (t) => {
  let stopped = false
  const socketer = { readStrategy: 0, rpc: () => ({ request: async () => okRes, stop: async () => { stopped = true } }) }
  const miner = new AvalonMiner({ socketer, address: '127.0.0.1', port: 4028, username: 'root', password, timeout: 100 })
  await miner.close()
  t.is(stopped, true)
})

test('_sendCommand - rethrows on rpc error', async (t) => {
  const miner = makeMiner(async () => { throw new Error('tcp down') })
  await t.exception(() => miner._sendCommand('summary'), /tcp down/)
})

test('getWorkingMode - parses WORKMODE from message', async (t) => {
  const miner = makeMiner(async () => 'STATUS=S,Code=118,Msg=WORKMODE[1]')
  t.is(await miner.getWorkingMode(), 1)
})

test('setFanSpeed - returns success on ok response', async (t) => {
  const miner = makeMiner()
  t.is((await miner.setFanSpeed(50)).success, true)
})

test('setFanSpeed - returns failure on error response', async (t) => {
  const miner = makeMiner(async () => errRes)
  t.is((await miner.setFanSpeed(50)).success, false)
})

test('factoryReset - returns success on ok response', async (t) => {
  const miner = makeMiner()
  t.is((await miner.factoryReset()).success, true)
})

test('reasonForReboot - extracts BOOTBY value', async (t) => {
  const miner = makeMiner(async () => 'STATUS=S,Code=118,Msg=BOOTBY[software]')
  t.is(await miner.reasonForReboot(), 'software')
})

test('setLED - throws on non-boolean argument', async (t) => {
  const miner = makeMiner()
  await t.exception(() => miner.setLED('on'), /ERR_INVALID_ARG_TYPE/)
})

test('setLED - returns success when enabled', async (t) => {
  const miner = makeMiner()
  t.is((await miner.setLED(false)).success, true)
})

test('suspendMining - returns success on ok response', async (t) => {
  const miner = makeMiner()
  t.is((await miner.suspendMining()).success, true)
})

test('restoreLogin - returns success on ok response', async (t) => {
  const miner = makeMiner()
  t.is((await miner.restoreLogin()).success, true)
})

test('updateAdminPassword - updates password on success', async (t) => {
  const miner = makeMiner()
  const res = await miner.updateAdminPassword('newpass')
  t.is(res.success, true)
  t.is(miner.opts.password, 'newpass')
})

test('updateAdminPassword - returns failure on error response', async (t) => {
  const miner = makeMiner(async () => errRes)
  const res = await miner.updateAdminPassword('newpass')
  t.is(res.success, false)
})

test('getVersion - maps version fields', async (t) => {
  const miner = makeMiner(async () => 'STATUS=S,MODEL=A1346,VERSION=1.0,HWTYPE=MM,SWTYPE=SW,CGMiner=4.11,API=3.7,MAC=aa:bb')
  const res = await miner.getVersion()
  t.is(res.success, true)
  t.is(res.model, 'A1346')
  t.is(res.cgminer.version, '4.11')
})

test('getPools - maps pool entries', async (t) => {
  const poolResp = 'STATUS=S|POOL=0,URL=stratum+tcp://p,Status=Alive,User=w|'
  const miner = makeMiner(async () => poolResp)
  const pools = await miner.getPools()
  t.is(pools.length, 1)
  t.is(pools[0].url, 'stratum+tcp://p')
  t.is(pools[0].user, 'w')
})

test('getPools - returns [] on error', async (t) => {
  const miner = makeMiner(async () => { throw new Error('boom') })
  t.alike(await miner.getPools(), [])
})

test('setPools - skips when prepared pools unchanged', async (t) => {
  const miner = makeMiner()
  miner.getPools = async () => []
  miner._prepPools = () => false
  const res = await miner.setPools([{ url: 'u', worker_name: 'w', worker_password: 'p' }])
  t.is(res.success, true)
  t.is(res.message, 'Pools are same, skipping')
})

test('setPools - writes prepared pools and reboots', async (t) => {
  let rebooted = false
  const miner = makeMiner()
  miner.getPools = async () => []
  miner._prepPools = () => [{ url: 'u', worker_name: 'w', worker_password: 'p' }]
  miner.reboot = async () => { rebooted = true; return { success: true } }
  const res = await miner.setPools([{ url: 'u', worker_name: 'w', worker_password: 'p' }])
  t.is(res.success, true)
  t.is(rebooted, true)
})

test('setNetworkConfiguration - static settings succeed', async (t) => {
  const miner = makeMiner()
  const res = await miner.setNetworkConfiguration({
    type: 'static',
    network: { ip: '10.0.0.2', mask: '255.255.255.0', gateway: '10.0.0.1', dns: ['8.8.8.8', '1.1.1.1'] }
  })
  t.is(res.success, true)
})

test('setNetworkConfiguration - dhcp settings succeed', async (t) => {
  const miner = makeMiner()
  const res = await miner.setNetworkConfiguration({ type: 'dhcp', network: { dns: ['8.8.8.8'] } })
  t.is(res.success, true)
})

test('setNetworkConfiguration - throws when device rejects', async (t) => {
  const miner = makeMiner(async () => errRes)
  await t.exception(() => miner.setNetworkConfiguration({ type: 'dhcp', network: { dns: ['8.8.8.8'] } }))
})

test('reboot - returns success and swallows errors', async (t) => {
  const miner = makeMiner(async () => { throw new Error('boom') })
  t.is((await miner.reboot()).success, true)
})

test('setPowerMode - normal mode returns success', async (t) => {
  const miner = makeMiner()
  t.is((await miner.setPowerMode('normal')).success, true)
})

test('setPowerMode - sleep mode returns success', async (t) => {
  const miner = makeMiner()
  t.is((await miner.setPowerMode('sleep')).success, true)
})

test('setPowerMode - throws on invalid mode', async (t) => {
  const miner = makeMiner()
  await t.exception(() => miner.setPowerMode('turbo'), /ERR_INVALID_MODE/)
})

test('getHashPowerStatus - parses PS values', async (t) => {
  const miner = makeMiner(async () => 'STATUS=S,Code=118,Msg=PS[0 1 2 1200 90]')
  t.alike(await miner.getHashPowerStatus(), [0, 1, 2, 1200, 90])
})
