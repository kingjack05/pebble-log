// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_late_puck.sql';
import m0001 from './0001_sleepy_serpent_society.sql';
import m0002 from './0002_clever_champions.sql';
import m0003 from './0003_vengeful_viper.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003
    }
  }
  