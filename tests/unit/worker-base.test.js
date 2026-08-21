'use strict'

const test = require('brittle')
const WrkMinerRack = require('../../workers/lib/worker-base')

function makeCtx (creds) {
  const ctx = {
    conf: { thing: { miner: {} } },
    tcp_0: { getRPC: () => ({}) },
    getNominalEficiencyWThs: () => 0,
    debugDeviceError: () => {},
    createMiner: (opts) => ({ opts, on: () => {} }),
    _getThingCredentials: () => creds
  }
  ctx.connectThing = WrkMinerRack.prototype.connectThing.bind(ctx)
  return ctx
}

test('connectThing returns 0 when no password resolves', async (t) => {
  const ctx = makeCtx({ username: undefined, password: undefined })
  const thg = { id: 't1', opts: { address: '10.0.0.1', port: 4028 } }
  t.is(await ctx.connectThing(thg), 0)
  t.absent(thg.ctrl)
})

test('connectThing builds the miner with the resolved credentials', async (t) => {
  const ctx = makeCtx({ username: 'ovruser', password: 'ovrpass' })
  const thg = { id: 't1', opts: { address: '10.0.0.1', port: 4028, username: 'optsuser', password: 'optspass' } }
  t.is(await ctx.connectThing(thg), 1)
  t.is(thg.ctrl.opts.username, 'ovruser')
  t.is(thg.ctrl.opts.password, 'ovrpass')
})
