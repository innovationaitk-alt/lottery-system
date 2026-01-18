const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, '../../migrations');
    
    console.log('========================================');
    console.log('📂 マイグレーション開始');
    console.log(`📁 ディレクトリ: ${migrationsDir}`);
    
    // migrations ディレクトリが存在するか確認
    if (!fs.existsSync(migrationsDir)) {
      console.error('❌ migrations ディレクトリが見つかりません:', migrationsDir);
      throw new Error('migrations ディレクトリが存在しません');
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📂 マイグレーションファイル: ${files.length}件`);
    files.forEach(file => console.log(`  - ${file}`));

    if (files.length === 0) {
      console.log('⚠️ マイグレーションファイルが見つかりません');
      return;
    }

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`\n▶️ Running migration: ${file}`);
      console.log(`   File path: ${filePath}`);
      console.log(`   SQL length: ${sql.length} characters`);
      console.log(`   SQL preview: ${sql.substring(0, 200)}...`);
      
      try {
        const result = await pool.query(sql);
        console.log(`✅ ${file} completed successfully`);
        if (result.rows && result.rows.length > 0) {
          console.log(`   Result:`, result.rows);
        }
      } catch (error) {
        console.error(`❌ ${file} failed:`, error.message);
        console.error(`   Error detail:`, error);
        throw error;
      }
    }

    console.log('\n========================================');
    console.log('✅ すべてのマイグレーション完了');
    console.log('========================================');
  } catch (error) {
    console.error('❌ マイグレーションエラー:', error.message);
    console.error('   スタックトレース:', error.stack);
    throw error;
  }
}

module.exports = { runMigrations };
