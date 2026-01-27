'use strict'

const test = require('brittle')
const utils = require('../../workers/lib/utils')

test('parseAvalonResponseString', (t) => {
  const input = 'STATUS=S,When=1234567890,Code=119,Msg=OK'
  const result = utils.parseAvalonResponseString(input)

  t.is(result.STATUS, 'S', 'STATUS parsed correctly')
  t.is(result.When, '1234567890', 'When parsed correctly')
  t.is(result.Code, '119', 'Code parsed correctly')
  t.is(result.Msg, 'OK', 'Msg parsed correctly')
})

test('parseAvalonResponseString with empty string', (t) => {
  const result = utils.parseAvalonResponseString('')
  t.is(Object.keys(result).length, 1, 'empty string returns object with empty key')
  t.is(result[''], undefined, 'empty key has undefined value')
})

test('parseAvalonResponseString with single key-value', (t) => {
  const input = 'STATUS=S'
  const result = utils.parseAvalonResponseString(input)
  t.is(result.STATUS, 'S', 'single key-value parsed correctly')
})

test('parseAvalonPoolData', (t) => {
  const input = '|POOL=0,URL=stratum+tcp://pool1.com,Status=Alive,Priority=0,Quota=1,Getworks=100,Accepted=50,Rejected=5,Works=45,Discarded=0,Stale=0,Get Failures=0,Remote Failures=0,User=user1,Last Share Time=1234567890,Stratum Active=1,Stratum Difficulty=1000,Pool Rejected%=5.0,Pool Stale%=0.0,Bad Work=0,Current Block Height=800000,Current Block Version=536870912|POOL=1,URL=stratum+tcp://pool2.com,Status=Dead,Priority=1,Quota=0,Getworks=0,Accepted=0,Rejected=0,Works=0,Discarded=0,Stale=0,Get Failures=0,Remote Failures=0,User=user2,Last Share Time=0,Stratum Active=0,Stratum Difficulty=0,Pool Rejected%=0.0,Pool Stale%=0.0,Bad Work=0,Current Block Height=0,Current Block Version=0|'

  const result = utils.parseAvalonPoolData(input)

  t.is(result.length, 2, 'correct number of pools parsed')
  t.is(result[0].POOL, '0', 'first pool POOL value correct')
  t.is(result[0].URL, 'stratum+tcp://pool1.com', 'first pool URL correct')
  t.is(result[0].Status, 'Alive', 'first pool Status correct')
  t.is(result[1].POOL, '1', 'second pool POOL value correct')
  t.is(result[1].URL, 'stratum+tcp://pool2.com', 'second pool URL correct')
  t.is(result[1].Status, 'Dead', 'second pool Status correct')
})

test('parseAvalonPoolData with empty input', (t) => {
  const result = utils.parseAvalonPoolData('')
  t.alike(result, [], 'empty input returns empty array')
})

test('parseAvalonPoolData with single pool', (t) => {
  const input = '|POOL=0,URL=stratum+tcp://pool1.com,Status=Alive|'
  const result = utils.parseAvalonPoolData(input)

  t.is(result.length, 1, 'single pool parsed correctly')
  t.is(result[0].POOL, '0', 'POOL value correct')
  t.is(result[0].URL, 'stratum+tcp://pool1.com', 'URL correct')
  t.is(result[0].Status, 'Alive', 'Status correct')
})

test('extractValueBetweenBrackets', (t) => {
  const input = 'STATUS=S,When=1234567890,Code=119,Msg=OK WORKMODE[1]'
  const result = utils.extractValueBetweenBrackets(input, 'WORKMODE')

  t.is(result, '1', 'value extracted correctly from brackets')
})

test('extractValueBetweenBrackets with multiple brackets', (t) => {
  const input = 'STATUS=S WORKMODE[1] When=1234567890 FREQ[600] Code=119'
  const result = utils.extractValueBetweenBrackets(input, 'WORKMODE')

  t.is(result, '1', 'first matching value extracted correctly')
})

test('extractValueBetweenBrackets with no match', (t) => {
  const input = 'STATUS=S,When=1234567890,Code=119,Msg=OK'
  const result = utils.extractValueBetweenBrackets(input, 'WORKMODE')

  t.is(result, null, 'null returned when no match found')
})

test('extractValueBetweenBrackets with empty brackets', (t) => {
  const input = 'STATUS=S,When=1234567890,Code=119,Msg=OK WORKMODE[]'
  const result = utils.extractValueBetweenBrackets(input, 'WORKMODE')

  t.is(result, '', 'empty string returned for empty brackets')
})

test('extractValueBetweenBrackets with complex value', (t) => {
  const input = 'STATUS=S,When=1234567890,Code=119,Msg=OK WORKMODE[1,2,3,4]'
  const result = utils.extractValueBetweenBrackets(input, 'WORKMODE')

  t.is(result, '1,2,3,4', 'complex value extracted correctly')
})

test('extractValueBetweenBrackets with special characters', (t) => {
  const input = 'STATUS=S,When=1234567890,Code=119,Msg=OK WORKMODE[test-value_123]'
  const result = utils.extractValueBetweenBrackets(input, 'WORKMODE')

  t.is(result, 'test-value_123', 'value with special characters extracted correctly')
})
