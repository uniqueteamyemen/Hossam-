const fs = require('fs');
const http = require('http');

console.log('🦅 DOCKER ENVIRONMENT TEST STARTING...');

// Test 1: Check if we can access Docker services via HTTP
function testService(service, port, path) {
    return new Promise((resolve) => {
        const options = {
            host: 'localhost',
            port: port,
            path: path,
            timeout: 5000
        };

        console.log(`🔍 Testing ${service} on port ${port}...`);
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`✅ ${service}: RESPONSE RECEIVED`);
                resolve(true);
            });
        });

        req.on('error', (err) => {
            console.log(`❌ ${service}: ERROR - ${err.message}`);
            resolve(false);
        });

        req.on('timeout', () => {
            console.log(`❌ ${service}: TIMEOUT`);
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

async function runTests() {
    console.log('🚀 RUNNING DOCKER SERVICE TESTS...');
    
    const results = {
        n8n: await testService('n8n', 5678, '/healthz'),
        ollama: await testService('ollama', 11434, '/api/tags')
    };

    console.log('\n📊 TEST RESULTS:');
    console.log(`   n8n: ${results.n8n ? '✅ ONLINE' : '❌ OFFLINE'}`);
    console.log(`   Ollama: ${results.ollama ? '✅ ONLINE' : '❌ OFFLINE'}`);

    // Test file system access
    console.log('\n📁 TESTING FILE SYSTEM ACCESS...');
    try {
        const testDir = 'D:/hossam-edss/test_output';
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
            console.log('✅ Created test directory');
        }
        
        const testFile = `${testDir}/test_${Date.now()}.txt`;
        fs.writeFileSync(testFile, `Docker Environment Test - ${new Date().toISOString()}`);
        console.log(`✅ File created: ${testFile}`);
        
        // Verify read
        const content = fs.readFileSync(testFile, 'utf8');
        console.log(`✅ File read verified: ${content.length} characters`);
        
        results.fileSystem = true;
    } catch (error) {
        console.log(`❌ File system error: ${error.message}`);
        results.fileSystem = false;
    }

    // Save results
    results.timestamp = new Date().toISOString();
    fs.writeFileSync('docker_environment_test.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results saved to: docker_environment_test.json');
    console.log('🎉 DOCKER ENVIRONMENT TEST COMPLETE!');
}

runTests();