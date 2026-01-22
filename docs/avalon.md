# Avalon APIs

This document describes the functions exposed by the `miner.js` library for Avalon. Below are functions common to all miners. Look at individual miner documentation for specific changes if any. As of now we are not aware of any miner specific changes.

## Miner specific documentation
- [Avalon A1346](./avalon-a1346.md)

## Common Functions
- [Avalon APIs](#avalon-apis)
  - [`constructor (minerId, minerName, host, port = 4028, username = 'root', password = 'root')` -\> `AvalonMiner`](#constructor-minerid-minername-host-port--4028-username--root-password--root---avalonminer)
    - [Parameters](#parameters)
  - [`getWorkingMode()` -\> `PowerMode`](#getworkingmode---powermode)
  - [`setFanSpeed(speed)` -\> `boolean`](#setfanspeedspeed---boolean)
    - [Parameters](#parameters-1)
  - [`factoryReset()` -\> `boolean`](#factoryreset---boolean)
  - [`reasonForReboot()` -\> `string`](#reasonforreboot---string)
  - [`setLEDControl(enabled)` -\> `boolean`](#setledcontrolenabled---boolean)
    - [Parameters](#parameters-2)
  - [`suspendMining()` -\> `boolean`](#suspendmining---boolean)
  - [`restoreLogin()` -\> `boolean`](#restorelogin---boolean)
  - [`updateAdminPassword(new_password)` -\> `Boolean`](#updateadminpasswordnew_password---boolean)
    - [Parameters](#parameters-3)
  - [`getVersion()` -\> `Object`](#getversion---object)
    - [Returns](#returns)
  - [`setPools(pools)` -\> `boolean`](#setpoolspools---boolean)
    - [Parameters](#parameters-4)
  - [`getStats()` -\> `Object`](#getstats---object)
    - [Returns](#returns-1)
  - [`getPools()` -\> `Array`](#getpools---array)
    - [Returns](#returns-2)
  - [`setNetworkConfiguration(network)` -\> `boolean`](#setnetworkconfigurationnetwork---boolean)
    - [Parameters](#parameters-5)
  - [`reboot()` -\> `boolean`](#reboot---boolean)
  - [`setPowerMode(mode)` -\> `boolean`](#setpowermodemode---boolean)
    - [Parameters](#parameters-6)
  - [`getLEDStatus()` -\> `boolean`](#getledstatus---boolean)
  - [`getHashPowerStatus()` -\> `boolean`](#gethashpowerstatus---boolean)
  - [`getSnap()` -\> `Object`](#getsnap---object)
    - [Returns](#returns-3)


## `constructor (minerId, minerName, host, port = 4028, username = 'root', password = 'root')` -> `AvalonMiner`
Creates a new `AvalonMiner` instance.

### Parameters
| Param  | Type | Description | Default |
| -- | -- | -- | -- |
| minerId | `string` | Unique identifier for the miner. | |
| minerName | `string` | Name of the miner. | |
| host | `string` | IP address of the miner. | |
| port | `number` | Port number of the miner. | 4028 |
| username | `string` | Username for the miner. | root |
| password | `string` | Password for the miner. | root |

## `getWorkingMode()` -> `PowerMode`
Gets the current working mode of the miner.

## `setFanSpeed(speed)` -> `boolean`
Sets the fan speed of the miner.

### Parameters
| Param  | Type | Description | Default |
| -- | -- | -- | -- |
| speed | `number` | Fan speed to set. | |

## `factoryReset()` -> `boolean`
Resets the miner to factory settings.

## `reasonForReboot()` -> `string`
Gets the reason for the last reboot.

## `setLEDControl(enabled)` -> `boolean`

### Parameters
| Param  | Type | Description | Default |
| -- | -- | -- | -- |
| enabled | `boolean` | Whether to enable or disable LED control. | |

## `suspendMining()` -> `boolean`
Suspends mining on the miner.

## `restoreLogin()` -> `boolean`
Restores the login on the miner.

## `updateAdminPassword(new_password)` -> `Boolean`
Updates the admin password of the miner.

### Parameters
| Param  | Type | Description | Default |
| -- | -- | -- | -- |
| new_password | `string` | New password to set. | |

## `getVersion()` -> `Object`
Gets the version information of the miner.

### Returns
| Key | Type | Description |
| -- | -- | -- |
| model | `string` | Model of the miner. |
| version | `string` | Version of the miner. |
| hardware_version | `string` | Hardware version of the miner. |
| software_version | `string` | Software version of the miner. |
| cgminer.version | `string` | CGMiner version of the miner. |
| cgminer.api | `string` | CGMiner API version of the miner. |

## `setPools(pools, appendId = true)` -> `Boolean`
Sets pool information of the miner. Accepts `pools` which is an array of objects with the following parameters. If `appendId` is set to `true`, the miner ID will be appended to the pool worker name.

### Parameters
| Param  | Type | Description |
| -- | -- | -- |
| url | `string` | Pool URL |
| worker_name | `string` | Worker Username |
| worker_password | `string` | Worker Password |

## `getStats()` -> `Object`
Gets the stats of the miner.

### Returns
| Key | Type | Description |
| -- | -- | -- |
| elapsed | `number` | Elapsed time since miner started. |
| mhs_av | `number` | Average MHS of the miner. |
| mhs_5s | `number` | MHS in the last 5 seconds. |
| mhs_1m | `number` | MHS in the last 1 minute. |
| mhs_5m | `number` | MHS in the last 5 minutes. |
| mhs_15m | `number` | MHS in the last 15 minutes. |
| hs_rt | `number` | Hash rate. |
| accepted | `number` | Number of accepted shares. |
| rejected | `number` | Number of rejected shares. |
| total_mh | `number` | Total MHS. |
| temperature | `number` | Temperature of the miner. |
| freq_avg | `number` | Average frequency of the miner. |
| fan_speed_in | `number` | Fan speed in. |
| fan_speed_out | `number` | Fan speed out. |
| power | `number` | Power consumption of the miner. |
| power_rate | `number` | Power rate of the miner. |
| pool_rejected | `number` | Pool rejected percentage. |
| pool_stale | `number` | Pool stale percentage. |
| uptime | `number` | Uptime of the miner. |
| hash_stable | `number` | Hash stable. |
| hash_stable_cost_seconds | `number` | Hash stable cost seconds. |
| hash_deviation | `number` | Hash deviation. |
| target_freq | `number` | Target frequency. |
| target_mhs | `number` | Target MHS. |
| env_temp | `number` | Environment temperature. |
| power_mode | `number` | Power mode. |
| factory_ghs | `number` | Factory GHS. |
| power_limit | `number` | Power limit. |
| chip_temp_min | `number` | Chip temperature minimum. |
| chip_temp_max | `number` | Chip temperature maximum. |
| chip_temp_avg | `number` | Chip temperature average. |
| debug | `number` | Debug. |
| btminer_fast_boot | `number` | BTMiner fast boot. |

## `getPools()` -> `Array`
Get infomation about the pools set for the miners. Returns an array of `Pool` object data.

### Returns
| Key | Type | Description |
| -- | -- | -- |
| index | `number` | Index of the pool. |
| url | `string` | URL of the pool. |
| status | `string` | Status of the pool. |
| priority | `number` | Priority of the pool. |
| quota | `number` | Quota of the pool. |
| getworks | `number` | Getworks of the pool. |
| accepted | `number` | Accepted shares of the pool. |
| rejected | `number` | Rejected shares of the pool. |
| works | `number` | Works of the pool. |
| discarded | `number` | Discarded shares of the pool. |
| stale | `number` | Stale shares of the pool. |
| get_failures | `number` | Get failures of the pool. |
| remote_failures | `number` | Remote failures of the pool. |
| user | `string` | User of the pool. |
| last_share_time | `string` | Last share time of the pool. |
| stratum_active | `boolean` | Whether the stratum is active or not. |
| stratum_difficulty | `number` | Stratum difficulty of the pool. |
| pool_rejected | `number` | Pool rejected percentage. |
| pool_stale | `number` | Pool stale percentage. |
| bad_work | `number` | Bad work of the pool. |
| current_block_height | `number` | Current block height of the pool. |
| current_block_version | `number` | Current block version of the pool. |

## `setNetworkConfiguration(network)` -> `boolean`
Sets the network configuration of the miner. Accepts `network` which is an object with the following parameters.

### Parameters
| Param  | Type | Description |
| -- | -- | -- |
| type | `string` | Type of network. Can be `static` or `dhcp`. |
| network.ip | `string` | IP Address. |
| network.mask | `string` | Subnet mask. |
| network.gateway | `string` | Gateway. |
| network.dns | `Array` | DNS servers. |

## `reboot()` -> `boolean`
Reboots the miner.

## `setPowerMode(mode)` -> `boolean`
Sets the power mode of the miner.

### Parameters
| Param  | Type | Description |
| -- | -- | -- |
| mode | `number` | Power mode. (number between 0 and 2) |

## `getLEDStatus()` -> `boolean`
Gets the LED status of the miner.

## `getHashPowerStatus()` -> `boolean`
Gets the hash power status of the miner.

## `getSnap()` -> `Object`
Gets a snapshot of the miner. Returns an object with the following parameters.

### Returns
| Key | Type | Description |
| -- | -- | -- |
| stats.elapsed | `number` | Elapsed time since miner started. |
| stats.mhs_av | `number` | Average MHS of the miner. |
| stats.mhs_5s | `number` | MHS in the last 5 seconds. |
| stats.mhs_1m | `number` | MHS in the last 1 minute. |
| stats.mhs_5m | `number` | MHS in the last 5 minutes. |
| stats.mhs_15m | `number` | MHS in the last 15 minutes. |
| stats.hs_rt | `number` | Hash rate. |
| stats.accepted | `number` | Number of accepted shares. |
| stats.rejected | `number` | Number of rejected shares. |
| stats.total_mh | `number` | Total MHS. |
| stats.temperature | `number` | Temperature of the miner. |
| stats.freq_avg | `number` | Average frequency of the miner. |
| stats.fan_speed_in | `number` | Fan speed in. |
| stats.fan_speed_out | `number` | Fan speed out. |
| stats.power | `number` | Power consumption of the miner. |
| stats.power_rate | `number` | Power rate of the miner. |
| stats.pool_rejected | `number` | Pool rejected percentage. |
| stats.pool_stale | `number` | Pool stale percentage. |
| stats.uptime | `number` | Uptime of the miner. |
| stats.hash_stable | `number` | Hash stable. |
| stats.hash_stable_cost_seconds | `number` | Hash stable cost seconds. |
| stats.hash_deviation | `number` | Hash deviation. |
| stats.target_freq | `number` | Target frequency. |
| stats.target_mhs | `number` | Target MHS. |
| stats.env_temp | `number` | Environment temperature. |
| stats.power_mode | `number` | Power mode. |
| stats.factory_ghs | `number` | Factory GHS. |
| stats.power_limit | `number` | Power limit. |
| stats.chip_temp_min | `number` | Chip temperature minimum. |
| stats.chip_temp_max | `number` | Chip temperature maximum. |
| stats.chip_temp_avg | `number` | Chip temperature average. |
| stats.debug | `number` | Debug. |
| stats.btminer_fast_boot | `number` | BTMiner fast boot. |
| pools.index | `number` | Index of the pool. |
| pools.url | `string` | URL of the pool. |
| pools.status | `string` | Status of the pool. |
| pools.priority | `number` | Priority of the pool. |
| pools.quota | `number` | Quota of the pool. |
| pools.getworks | `number` | Getworks of the pool. |
| pools.accepted | `number` | Accepted shares of the pool. |
| pools.rejected | `number` | Rejected shares of the pool. |
| pools.works | `number` | Works of the pool. |
| pools.discarded | `number` | Discarded shares of the pool. |
| pools.stale | `number` | Stale shares of the pool. |
| pools.get_failures | `number` | Get failures of the pool. |
| pools.remote_failures | `number` | Remote failures of the pool. |
| pools.user | `string` | User of the pool. |
| pools.last_share_time | `string` | Last share time of the pool. |
| pools.stratum_active | `boolean` | Whether the stratum is active or not. |
| pools.stratum_difficulty | `number` | Stratum difficulty of the pool. |
| pools.pool_rejected | `number` | Pool rejected percentage. |
| pools.pool_stale | `number` | Pool stale percentage. |
| pools.bad_work | `number` | Bad work of the pool. |
| pools.current_block_height | `number` | Current block height of the pool. |
| pools.current_block_version | `number` | Current block version of the pool. |
| led | `boolean` | LED status of the miner. |
| hashpower | `boolean` | Hash power status of the miner. |
