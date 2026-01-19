require('dotenv').config();
const { Pool } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '設定されています' : '設定されていません');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkColumns() {
  try {
    console.log('==================================');
    console.log('📊 データベースのカラム確認');
    console.log('==================================\n');
    
    console.log('データベースに接続中...');

    const result = await pool.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns 
       WHERE table_name = 'series' 
       ORDER BY ordinal_position;`
    );

    console.log('✅ 接続成功！\n');
    console.log('✅ series テーブルのカラム一覧:\n');
    console.table(result.rows);

    const hasAnimationColumn = result.rows.some(
      row => row.column_name === 'animation_video_url'
    );

    console.log('\n==================================');
    if (hasAnimationColumn) {
      console.log('✅ animation_video_url カラムが存在します！');
    } else {
      console.log('❌ animation_video_url カラムが存在しません');
      console.log('\n📝 マイグレーションを実行する必要があります');
    }
    console.log('==================================\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ エラーが発生しました:');
    console.error('エラーメッセージ:', error.message);
    console.error('エラーコード:', error.code);
    console.error('エラー詳細:', error);
    process.exit(1);
  }
}

checkColumns();