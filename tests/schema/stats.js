'use strict'

module.exports = (v) => {
  v.stats_validate.schema.stats.children.hashrate_mhs.children.t_5s.optional = true
  v.stats_validate.schema.stats.children.hashrate_mhs.children.t_30m.optional = true
  v.stats_validate.schema.stats.children.temperature_c.children.chips.children.min.optional = true

  v.config_validate.schema.config.children.network_config.children.ip_gw.optional = true
  v.config_validate.schema.config.children.network_config.children.ip_netmask.optional = true
}
