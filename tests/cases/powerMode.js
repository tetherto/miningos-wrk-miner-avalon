'use strict'

module.exports = (v) => {
  v.setPowerModeNormal.stages[1].wait = 200
  delete v.setPowerModeLow
}
