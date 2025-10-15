const mysql = require('mysql2');

console.log('🦅 DOCKER SYSTEM HEALTH MONITOR STARTING...');

class DockerHealthMonitor {
    constructor() {
        this.metrics = {
            timestamp: new Date().toISOString(),
            mysql: false,
            n8n: false,
            ollama: false,
            models_loaded: 0
        };
    }

    checkMySQL() {
        return new Promise((resolve) => {
            const connection = mysql.createConnection({
                host: 'mysql',  // ← DOCKER SERVICE NAME
                user: 'admin',
                password: 'hossam2024',
                database: 'hossam',
                port: 3306,
                connectTimeout: 5000
            });

            connection.connect((err) => {
                if (err) {
                    console.log('❌ MySQL: OFFLINE - ' + err.message);
                    this.metrics.mysql = false;
                } else {
                    console.log('✅ MySQL: ONLINE via Docker network');
                    this.metrics.mysql = true;
                    connection.end();
                }
                resolve();
            });
        });
    }

    checkN8N() {
        return new Promise((resolve) => {
            const http = require('http');
            
            const options = {
                host: 'localhost',  // n8n port is exposed to host
                port: 5678,
                path: '/healthz',
                timeout: 5000
            };

            const req = http.request(options, (res) => {
                console.log('✅ n8n: ONLINE (port 5678)');
                this.metrics.n8n = true;
                resolve();
            });

            req.on('error', (err) => {
                console.log('❌ n8n: OFFLINE - ' + err.message);
                this.metrics.n8n = false;
                resolve();
            });

            req.on('timeout', () => {
                console.log('❌ n8n: TIMEOUT');
                this.metrics.n8n = false;
                req.destroy();
                resolve();
            });

            req.end();
        });
    }

    checkOllama() {
        return new Promise((resolve) => {
            const http = require('http');
            
            const options = {
                host: 'localhost',  // Ollama port is exposed to host
                port: 11434,
                path: '/api/tags',
                timeout: 5000
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        this.metrics.models_loaded = result.models ? result.models.length : 0;
                        console.log(`✅ Ollama: ONLINE (${this.metrics.models_loaded} models loaded)`);
                        this.metrics.ollama = true;
                    } catch (e) {
                        console.log('❌ Ollama: INVALID RESPONSE');
                        this.metrics.ollama = false;
                    }
                    resolve();
                });
            });

            req.on('error', (err) => {
                console.log('❌ Ollama: OFFLINE - ' + err.message);
                this.metrics.ollama = false;
                resolve();
            });

            req.on('timeout', () => {
                console.log('❌ Ollama: TIMEOUT');
                this.metrics.ollama = false;
                req.destroy();
                resolve();
            });

            req.end();
        });
    }

    async runFullHealthCheck() {
        console.log('🏥 RUNNING DOCKER SYSTEM HEALTH CHECK...');
        console.log('📡 Checking services via Docker network...');
        
        await this.checkMySQL();
        await this.checkN8N();
        await this.checkOllama();

        console.log('\n📊 DOCKER HEALTH CHECK SUMMARY:');
        console.log(`   MySQL (mysql:3306): ${this.metrics.mysql ? '✅ ONLINE' : '❌ OFFLINE'}`);
        console.log(`   n8n (localhost:5678): ${this.metrics.n8n ? '✅ ONLINE' : '❌ OFFLINE'}`);
        console.log(`   Ollama (localhost:11434): ${this.metrics.ollama ? '✅ ONLINE' : '❌ OFFLINE'}`);
        console.log(`   AI Models: ${this.metrics.models_loaded} loaded`);

        // Calculate overall status
        const onlineServices = [this.metrics.mysql, this.metrics.n8n, this.metrics.ollama].filter(Boolean).length;
        console.log(`\n🎯 OVERALL STATUS: ${onlineServices}/3 services online`);

        // Save results
        const fs = require('fs');
        fs.writeFileSync('docker_health_check.json', JSON.stringify(this.metrics, null, 2));
        console.log('💾 Docker health report saved to: docker_health_check.json');

        return this.metrics;
    }
}

// Execute health check
const monitor = new DockerHealthMonitor();
monitor.runFullHealthCheck().then(metrics => {
    console.log('🎉 DOCKER SYSTEM HEALTH CHECK COMPLETE!');
    
    if (metrics.mysql && metrics.n8n && metrics.ollama) {
        console.log('🚀 ALL SYSTEMS OPERATIONAL - READY FOR DEPLOYMENT!');
    } else {
        console.log('⚠️ SOME SERVICES OFFLINE - CHECK DOCKER COMPOSE');
    }
});