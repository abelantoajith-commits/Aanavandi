import Dexie, { type Table } from 'dexie';
import { Student } from './students';
import { ScanRecord } from './scans';
import { ConductorSettings } from './settings';

export class GoPassDatabase extends Dexie {
  students!: Table<Student, string>;
  scans!: Table<ScanRecord, string>;
  settings!: Table<ConductorSettings, string>;

  constructor() {
    super('GoPassDB');
    this.version(1).stores({
      students: 'sid, name, approvalStatus',
      scans: 'id, sid, date, ts, result, [sid+date]',
      settings: 'id'
    });
  }
}

export const db = new GoPassDatabase();
