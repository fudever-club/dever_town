import { FileDatabaseAdapter } from './fileAdapter.js';
import { PostgresDatabaseAdapter } from './postgresAdapter.js';

let dbInstance = null;

export async function initDatabase() {
  if (dbInstance) return dbInstance;

  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    try {
      console.log(`🔌 [DB Factory] Đang thử kết nối PostgreSQL qua DATABASE_URL...`);
      const pgAdapter = new PostgresDatabaseAdapter(dbUrl);
      await pgAdapter.init();
      dbInstance = pgAdapter;
      console.log(`✅ [DB Factory] Đang sử dụng PostgreSQL Adapter làm kho lưu trữ chính.`);
      return dbInstance;
    } catch (err) {
      console.warn(`⚠️ [DB Factory] Kết nối PostgreSQL thất bại, tự động chuyển sang File Storage fallback.`);
    }
  }

  // Fallback an toàn sang File Adapter
  const fileAdapter = new FileDatabaseAdapter();
  await fileAdapter.init();
  dbInstance = fileAdapter;
  console.log(`✅ [DB Factory] Đang sử dụng JSON File Adapter (server/data/users.json).`);
  return dbInstance;
}

export function getDB() {
  if (!dbInstance) {
    throw new Error('Database chưa được khởi tạo! Hãy gọi initDatabase() trước.');
  }
  return dbInstance;
}
