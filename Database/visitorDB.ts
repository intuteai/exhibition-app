import SQLite from 'react-native-sqlite-2';

let db: any | null = null;

// -------------------- Get DB --------------------
const getDB = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    try {
      db = SQLite.openDatabase(
        'visitors.db',
        '1.0',
        'Visitors Database',
        200000,
      );

      db.transaction(
        (tx: any) => {
          // Create table if it doesn't exist, including new columns
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS visitors (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT,
              designation TEXT,
              email TEXT,
              whatsapp TEXT,
              company TEXT,
              comments TEXT,
              selfiePath TEXT,
              raw_ocr TEXT,
              visitorCategory TEXT,
              leadImportance TEXT,
              clientType TEXT,
              createdAt TEXT
            );
          `);

          // Ensure old DBs have all new columns
          tx.executeSql(
            `PRAGMA table_info(visitors);`,
            [],
            (_: any, result: any) => {
              const columns: string[] = [];
              for (let i = 0; i < result.rows.length; i++) {
                columns.push(result.rows.item(i).name);
              }

              if (!columns.includes('raw_ocr')) {
                tx.executeSql(`ALTER TABLE visitors ADD COLUMN raw_ocr TEXT;`);
              }
              if (!columns.includes('leadImportance')) {
                tx.executeSql(
                  `ALTER TABLE visitors ADD COLUMN leadImportance TEXT;`,
                );
              }
              if (!columns.includes('clientType')) {
                tx.executeSql(
                  `ALTER TABLE visitors ADD COLUMN clientType TEXT;`,
                );
              }
              if (!columns.includes('visitorCategory')) {
  tx.executeSql(`ALTER TABLE visitors ADD COLUMN visitorCategory TEXT;`);
}
              if (!columns.includes('designation')) {
                tx.executeSql(
                  `ALTER TABLE visitors ADD COLUMN designation TEXT;`,
                );
              }
            },
          );
        },
        (error: any) => {
          console.error('[SQLite] Init error:', error);
          reject(error);
        },
        () => {
          console.log('[SQLite] Database ready');
          resolve(db);
        },
      );
    } catch (err) {
      reject(err);
    }
  });
};

// -------------------- INIT --------------------
export const initDB = async (): Promise<void> => {
  await getDB();
};

// -------------------- INSERT VISITOR --------------------
export const insertVisitor = async (data: {
  name: string;
  designation?: string;
  email: string;
  whatsapp: string;
  company: string;
  comments: string;
  selfiePath: string | null;
  raw_ocr: string;
  visitorCategory?: string;
  leadImportance?: string;
  clientType?: string;
}): Promise<void> => {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    database.transaction(
      (tx: any) => {
        tx.executeSql(
          `
          INSERT INTO visitors
(name, designation, email, whatsapp, company, comments, selfiePath, raw_ocr, visitorCategory, leadImportance, clientType, createdAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            data.name,
            data.designation ?? '',
            data.email,
            data.whatsapp,
            data.company,
            data.comments,
            data.selfiePath ?? '',
            data.raw_ocr ?? '',
            data.visitorCategory ?? '',
            data.leadImportance ?? '',
            data.clientType ?? '',
            new Date().toISOString(),
          ],
        );
      },
      (error: any) => {
        console.error('[SQLite] Insert error:', error);
        reject(error);
      },
      () => {
        console.log('[SQLite] Visitor inserted');
        resolve();
      },
    );
  });
};

// -------------------- FETCH VISITORS --------------------
export const getAllVisitors = async (): Promise<any[]> => {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    database.transaction(
      (tx: any) => {
        tx.executeSql(
          'SELECT * FROM visitors ORDER BY id DESC',
          [],
          (_: any, result: any) => {
            const rows = result.rows;
            const data: any[] = [];
            for (let i = 0; i < rows.length; i++) {
              data.push(rows.item(i));
            }
            resolve(data);
          },
        );
      },
      (error: any) => {
        console.error('[SQLite] Fetch error:', error);
        reject(error);
      },
    );
  });
};
