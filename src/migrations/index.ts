import * as migration_20261115_233809_initial from './20261115_233809_initial';

export const migrations = [
  {
    up: migration_20261115_233809_initial.up,
    down: migration_20261115_233809_initial.down,
    name: '20261115_233809_initial'
  },
];
