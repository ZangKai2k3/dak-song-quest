import { Router, Request, Response } from 'express';
import { getDbPool, sql } from '../config/db';

export const leaderboardRouter = Router();

function getVietnamDate(date = new Date()): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 3600000);
}

function getCurrentIsoWeekId(): string {
  const vnDate = getVietnamDate();
  const target = new Date(Date.UTC(vnDate.getFullYear(), vnDate.getMonth(), vnDate.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
let isTableEnsured = false;
async function ensureLeaderboardTable(pool: any) {
  if (isTableEnsured) return;
  try {
    const curWeek = getCurrentIsoWeekId();
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='QuizLeaderboard' and xtype='U')
      BEGIN
        CREATE TABLE dbo.QuizLeaderboard (
          AttemptId INT IDENTITY(1,1) PRIMARY KEY,
          ZaloUserId NVARCHAR(100) NOT NULL,
          DisplayName NVARCHAR(200) NOT NULL,
          AvatarUrl NVARCHAR(1000) NULL,
          WeekId VARCHAR(20) NOT NULL,
          Score INT NOT NULL,
          TotalQuestions INT NOT NULL,
          TimeMs INT NOT NULL,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE()
        );

        -- Thêm chỉ mục để tối ưu tốc độ tra cứu BXH tuần
        CREATE INDEX IX_QuizLeaderboard_WeekId ON dbo.QuizLeaderboard (WeekId, Score DESC, TimeMs ASC);

        -- Dữ liệu mẫu khởi đầu sinh động cho tuần hiện tại
        INSERT INTO dbo.QuizLeaderboard (ZaloUserId, DisplayName, AvatarUrl, WeekId, Score, TotalQuestions, TimeMs, CreatedAt, UpdatedAt)
        VALUES
        ('demo-1', N'M’Nông Explorer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', '${curWeek}', 24, 25, 68300, DATEADD(DAY, -2, GETDATE()), GETDATE()),
        ('demo-2', N'Cà Phê Tây Nguyên', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', '${curWeek}', 23, 25, 71500, DATEADD(DAY, -1, GETDATE()), GETDATE()),
        ('demo-3', N'Green Traveler', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', '${curWeek}', 23, 25, 82400, DATEADD(HOUR, -14, GETDATE()), GETDATE()),
        ('demo-4', N'Dak Song Fan', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', '${curWeek}', 22, 25, 90100, DATEADD(HOUR, -7, GETDATE()), GETDATE()),
        ('demo-5', N'Hidden Gem Hunter', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', '${curWeek}', 21, 25, 88700, DATEADD(HOUR, -3, GETDATE()), GETDATE());
      END
    `);
    isTableEnsured = true;
  } catch (err) {
    console.warn('Lỗi khởi tạo bảng QuizLeaderboard:', err);
  }
}

// 1. GET /api/leaderboard?weekId=...
// Lấy danh sách xếp hạng tuần thực tế từ cơ sở dữ liệu
leaderboardRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = await getDbPool();
    await ensureLeaderboardTable(pool);

    let rawWeek = (req.query.weekId as string) || '';
    if (!rawWeek || rawWeek === 'undefined' || rawWeek === 'null' || !rawWeek.trim()) {
      rawWeek = getCurrentIsoWeekId();
    }
    const weekId = rawWeek.trim();

    const result = await pool.request()
      .input('weekId', sql.VarChar(20), weekId)
      .query(`
        SELECT 
          AttemptId,
          ZaloUserId,
          DisplayName,
          AvatarUrl,
          WeekId,
          Score,
          TotalQuestions,
          TimeMs,
          CONVERT(VARCHAR(19), CreatedAt, 120) AS CreatedAt,
          CONVERT(VARCHAR(19), UpdatedAt, 120) AS UpdatedAt
        FROM dbo.QuizLeaderboard
        WHERE WeekId = @weekId
        ORDER BY 
          (CAST(Score AS FLOAT) / CASE WHEN TotalQuestions > 0 THEN TotalQuestions ELSE 1 END) DESC,
          TimeMs ASC,
          CreatedAt ASC
      `);

    const mapped = result.recordset.map((row: any, idx: number) => ({
      rank: idx + 1,
      attemptId: row.AttemptId,
      zaloUserId: row.ZaloUserId,
      name: row.DisplayName,
      avatar: row.AvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      score: row.Score,
      totalQuestions: row.TotalQuestions,
      timeMs: row.TimeMs,
      weekId: row.WeekId,
      badge: idx === 0 ? 'Top 1' : idx === 1 ? 'Top 2' : idx === 2 ? 'Top 3' : idx < 5 ? `Top ${idx + 1}` : undefined,
      createdAt: row.CreatedAt,
    }));

    res.json({
      success: true,
      data: {
        weekId,
        leaderboard: mapped,
        totalParticipants: mapped.length,
      },
    });
  } catch (error: any) {
    console.error('Lỗi lấy BXH:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải Bảng xếp hạng từ máy chủ SQL Server!',
      error: error.message,
    });
  }
});

// 1b. GET /api/leaderboard/weeks
// Lấy danh sách các tuần đã có thí sinh tham gia thi đấu
leaderboardRouter.get('/weeks', async (_req: Request, res: Response) => {
  try {
    const pool = await getDbPool();
    await ensureLeaderboardTable(pool);
    const result = await pool.request().query(`
      SELECT DISTINCT WeekId
      FROM dbo.QuizLeaderboard
      ORDER BY WeekId DESC
    `);
    const curWeek = getCurrentIsoWeekId();
    const weeks: string[] = result.recordset.map((r: any) => r.WeekId);
    if (!weeks.includes(curWeek)) {
      weeks.unshift(curWeek);
    }
    res.json({
      success: true,
      data: {
        weeks,
        currentWeek: curWeek,
      },
    });
  } catch (error: any) {
    console.error('Lỗi lấy danh sách tuần BXH:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 1c. GET /api/leaderboard/status?userId=...&weekId=...&userName=...
// Kiểm tra xem thí sinh đã có kết quả thi chính thức tuần này trên BXH chưa
leaderboardRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const { userId, weekId, userName } = req.query;
    let rawWeek = (weekId as string) || '';
    if (!rawWeek || rawWeek === 'undefined' || rawWeek === 'null' || !rawWeek.trim()) {
      rawWeek = getCurrentIsoWeekId();
    }
    const targetWeekId = rawWeek.trim();

    if (!userId && !userName) {
      return res.json({ success: true, data: { hasAttempt: false, weekId: targetWeekId } });
    }

    const pool = await getDbPool();
    await ensureLeaderboardTable(pool);

    const result = await pool.request()
      .input('uid', sql.NVarChar(100), String(userId || ''))
      .input('name', sql.NVarChar(200), String(userName || ''))
      .input('wid', sql.VarChar(20), targetWeekId)
      .query(`
        SELECT AttemptId, ZaloUserId, DisplayName, AvatarUrl, Score, TotalQuestions, TimeMs,
          CONVERT(VARCHAR(19), CreatedAt, 120) AS CreatedAt
        FROM dbo.QuizLeaderboard
        WHERE (ZaloUserId = @uid OR (DisplayName = @name AND @name <> '')) AND WeekId = @wid
      `);

    if (result.recordset.length > 0) {
      const row = result.recordset[0];
      const rankResult = await pool.request()
        .input('wid', sql.VarChar(20), targetWeekId)
        .query(`
          SELECT AttemptId, ROW_NUMBER() OVER (
            ORDER BY 
              (CAST(Score AS FLOAT) / CASE WHEN TotalQuestions > 0 THEN TotalQuestions ELSE 1 END) DESC,
              TimeMs ASC,
              CreatedAt ASC
          ) as CurrentRank
          FROM dbo.QuizLeaderboard
          WHERE WeekId = @wid
        `);
      const rankRow = rankResult.recordset.find((r: any) => r.AttemptId === row.AttemptId);

      return res.json({
        success: true,
        data: {
          hasAttempt: true,
          attempt: {
            attemptId: row.AttemptId,
            zaloUserId: row.ZaloUserId,
            displayName: row.DisplayName,
            avatarUrl: row.AvatarUrl,
            score: row.Score,
            totalQuestions: row.TotalQuestions,
            timeMs: row.TimeMs,
            rank: rankRow ? rankRow.CurrentRank : 1,
            createdAt: row.CreatedAt,
            weekId: targetWeekId,
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        hasAttempt: false,
        weekId: targetWeekId,
      },
    });
  } catch (error: any) {
    console.error('Lỗi kiểm tra trạng thái lượt thi BXH:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. POST /api/leaderboard/submit
// Nộp kết quả thi Quiz tuần kèm Tên & Avatar Zalo thực tế
leaderboardRouter.post('/submit', async (req: Request, res: Response) => {
  try {
    const {
      zaloUserId,
      displayName,
      avatarUrl,
      score,
      totalQuestions,
      timeMs,
      weekId,
    } = req.body;

    if (!displayName || score === undefined || !totalQuestions || timeMs === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin kết quả bài thi!',
      });
    }

    const targetWeekId = weekId || getCurrentIsoWeekId();
    const userId = zaloUserId || `user-${displayName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const cleanName = displayName.trim();
    const cleanAvatar = avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

    const pool = await getDbPool();
    await ensureLeaderboardTable(pool);

    // Kiểm tra xem người dùng đã có kết quả thi trong tuần này chưa (hỗ trợ cả oldUserId hoặc DisplayName)
    const existingResult = await pool.request()
      .input('uid', sql.NVarChar(100), userId)
      .input('oldUid', sql.NVarChar(100), req.body.oldUserId || userId)
      .input('name', sql.NVarChar(200), cleanName)
      .input('wid', sql.VarChar(20), targetWeekId)
      .query(`
        SELECT AttemptId, Score, TotalQuestions, TimeMs
        FROM dbo.QuizLeaderboard
        WHERE ((ZaloUserId = @uid OR ZaloUserId = @oldUid) OR (DisplayName = @name)) AND WeekId = @wid
      `);

    if (existingResult.recordset.length > 0) {
      const existing = existingResult.recordset[0];
      const oldRate = existing.Score / (existing.TotalQuestions || 1);
      const newRate = Number(score) / (Number(totalQuestions) || 1);

      // Cập nhật điểm nếu điểm mới cao hơn, hoặc cùng điểm nhưng thời gian nhanh hơn
      const isBetter = newRate > oldRate || (newRate === oldRate && Number(timeMs) < existing.TimeMs);

      if (isBetter) {
        await pool.request()
          .input('id', sql.Int, existing.AttemptId)
          .input('uid', sql.NVarChar(100), userId)
          .input('name', sql.NVarChar(200), cleanName)
          .input('avatar', sql.NVarChar(1000), cleanAvatar)
          .input('score', sql.Int, Number(score))
          .input('total', sql.Int, Number(totalQuestions))
          .input('timeMs', sql.Int, Number(timeMs))
          .query(`
            UPDATE dbo.QuizLeaderboard
            SET 
              ZaloUserId = @uid,
              DisplayName = @name,
              AvatarUrl = @avatar,
              Score = @score,
              TotalQuestions = @total,
              TimeMs = @timeMs,
              UpdatedAt = GETDATE()
            WHERE AttemptId = @id
          `);
      } else {
        // Cập nhật tên và avatar mới nếu điểm không cao hơn nhưng người chơi đổi profile
        await pool.request()
          .input('id', sql.Int, existing.AttemptId)
          .input('uid', sql.NVarChar(100), userId)
          .input('name', sql.NVarChar(200), cleanName)
          .input('avatar', sql.NVarChar(1000), cleanAvatar)
          .query(`
            UPDATE dbo.QuizLeaderboard
            SET 
              ZaloUserId = @uid,
              DisplayName = @name,
              AvatarUrl = @avatar,
              UpdatedAt = GETDATE()
            WHERE AttemptId = @id
          `);
      }
    } else {
      // Thêm mới kết quả thi
      await pool.request()
        .input('uid', sql.NVarChar(100), userId)
        .input('name', sql.NVarChar(200), cleanName)
        .input('avatar', sql.NVarChar(1000), cleanAvatar)
        .input('wid', sql.VarChar(20), targetWeekId)
        .input('score', sql.Int, Number(score))
        .input('total', sql.Int, Number(totalQuestions))
        .input('timeMs', sql.Int, Number(timeMs))
        .query(`
          INSERT INTO dbo.QuizLeaderboard (ZaloUserId, DisplayName, AvatarUrl, WeekId, Score, TotalQuestions, TimeMs, CreatedAt, UpdatedAt)
          VALUES (@uid, @name, @avatar, @wid, @score, @total, @timeMs, GETDATE(), GETDATE())
        `);
    }

    // Lấy thứ hạng hiện tại của người này trong tuần
    const rankResult = await pool.request()
      .input('wid', sql.VarChar(20), targetWeekId)
      .query(`
        SELECT ZaloUserId, ROW_NUMBER() OVER (
          ORDER BY 
            (CAST(Score AS FLOAT) / CASE WHEN TotalQuestions > 0 THEN TotalQuestions ELSE 1 END) DESC,
            TimeMs ASC,
            CreatedAt ASC
        ) as CurrentRank
        FROM dbo.QuizLeaderboard
        WHERE WeekId = @wid
      `);

    const myRankRow = rankResult.recordset.find((r: any) => r.ZaloUserId === userId);
    const myRank = myRankRow ? myRankRow.CurrentRank : 1;

    res.json({
      success: true,
      message: 'Đã lưu kết quả thi lên Bảng xếp hạng tuần thành công!',
      data: {
        rank: myRank,
        name: cleanName,
        score,
        totalQuestions,
        timeMs,
        weekId: targetWeekId,
      },
    });
  } catch (error: any) {
    console.error('Lỗi nộp bài thi lên BXH:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lưu kết quả thi lên cơ sở dữ liệu!',
      error: error.message,
    });
  }
});

// 3. PUT /api/leaderboard/rename
// Cập nhật tên hiển thị và avatar của thí sinh trực tiếp vào bản ghi BXH hiện có (không tạo dòng mới)
leaderboardRouter.put('/rename', async (req: Request, res: Response) => {
  try {
    const { userId, oldUserId, oldName, newName, avatarUrl, weekId, attemptId } = req.body;
    if (!newName || !newName.trim()) {
      return res.status(400).json({ success: false, message: 'Tên hiển thị không được để trống!' });
    }

    const cleanName = newName.trim();
    const cleanAvatar = avatarUrl ? avatarUrl.trim() : null;
    const targetWeekId = weekId || getCurrentIsoWeekId();
    const pool = await getDbPool();
    await ensureLeaderboardTable(pool);

    const request = pool.request()
      .input('name', sql.NVarChar(200), cleanName)
      .input('avatar', sql.NVarChar(1000), cleanAvatar)
      .input('uid', sql.NVarChar(100), userId)
      .input('oldUid', sql.NVarChar(100), oldUserId || userId)
      .input('oldName', sql.NVarChar(200), oldName || cleanName)
      .input('wid', sql.VarChar(20), targetWeekId);

    let query = '';
    if (attemptId) {
      request.input('attemptId', sql.Int, Number(attemptId));
      query = `
        UPDATE dbo.QuizLeaderboard
        SET 
          DisplayName = @name,
          AvatarUrl = ISNULL(@avatar, AvatarUrl),
          ZaloUserId = @uid,
          UpdatedAt = GETDATE()
        WHERE AttemptId = @attemptId
      `;
    } else {
      query = `
        UPDATE dbo.QuizLeaderboard
        SET 
          DisplayName = @name,
          AvatarUrl = ISNULL(@avatar, AvatarUrl),
          ZaloUserId = @uid,
          UpdatedAt = GETDATE()
        WHERE (ZaloUserId = @uid OR ZaloUserId = @oldUid OR DisplayName = @oldName) AND WeekId = @wid
      `;
    }

    const result = await request.query(query);

    res.json({
      success: true,
      message: 'Đã cập nhật thông tin người chơi trên Bảng xếp hạng!',
      rowsAffected: result.rowsAffected[0],
    });
  } catch (error: any) {
    console.error('Lỗi đổi tên/avatar thí sinh:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


