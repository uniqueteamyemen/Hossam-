const mysql = require('mysql2');

console.log('📊 DOCKER MYSQL LOGGER STARTING...');

// DOCKER NETWORKING - Use service names
const connection = mysql.createConnection({
    host: 'mysql',  // ← DOCKER SERVICE NAME, not localhost
    user: 'admin',
    password: 'hossam2024',
    database: 'hossam',
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.log('❌ MySQL connection failed:', err.message);
        console.log('💡 TIP: Ensure MySQL container is running with: docker-compose ps');
        return;
    }
    
    console.log('✅ Connected to MySQL database via Docker network');
    
    // Log a simple test entry
    const query = `
        INSERT INTO eds_logbook 
        (post_content, character_count, image_category, ai_model_used, status_ready, platform, access_tier)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        'Archive Integrator - Docker Deployment Success',
        180,
        'system_operation',
        'archive_integrator',
        1,
        'internal',
        'system'
    ];
    
    connection.query(query, values, (error, results) => {
        if (error) {
            console.log('❌ Database insert failed:', error.message);
        } else {
            console.log('✅ Successfully logged deployment to database');
            console.log(`   Insert ID: ${results.insertId}`);
            
            // Verify the entry
            connection.query('SELECT id, timestamp, post_content FROM eds_logbook ORDER BY id DESC LIMIT 1', (err, rows) => {
                if (err) {
                    console.log('❌ Verification query failed:', err.message);
                } else {
                    console.log('🔍 VERIFICATION: Latest entry:');
                    console.log(`   ID: ${rows[0].id}, Content: ${rows[0].post_content}`);
                }
                connection.end();
                console.log('🔌 MySQL connection closed');
            });
        }
    });
});