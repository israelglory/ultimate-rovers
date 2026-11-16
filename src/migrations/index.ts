import * as migration_20261115_233809_initial from './20261115_233809_initial';
import * as migration_20261116_003837_lagos_timezone_default from './20261116_003837_lagos_timezone_default';

export const migrations = [
  {
    up: migration_20261115_233809_initial.up,
    down: migration_20261115_233809_initial.down,
    name: '20261115_233809_initial',
  },
  {
    up: migration_20261116_003837_lagos_timezone_default.up,
    down: migration_20261116_003837_lagos_timezone_default.down,
    name: '20261116_003837_lagos_timezone_default'
  },
];
