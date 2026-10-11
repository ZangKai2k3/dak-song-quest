import dotenv from 'dotenv';
// @ts-ignore
import sql from 'mssql/lib/msnodesqlv8';

dotenv.config();

const connectionString =
  process.env.DB_CONNECTION_STRING ||
  'Server=.\\SQLEXPRESS;Database=DakSongQuestDB;Trusted_Connection=Yes;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=Yes';

let pool: any = null;

export async function getDbPool(): Promise<any> {
  if (!pool) {
    try {
      pool = await sql.connect({
        connectionString,
      });
      console.log('✅ Kết nối thành công tới Microsoft SQL Server (SQLEXPRESS)!');
    } catch (err) {
      console.error('❌ Lỗi kết nối tới Microsoft SQL Server:', err);
      throw err;
    }
  }
  return pool;
}

export { sql };
