const fs = require('fs');
const path = require('path');

console.log('🦅 STARTING ARCHIVE INTEGRATOR SCAN...');

// Simple scanner for demonstration
function scanDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            console.log(`📁 Creating directory: ${dirPath}`);
            fs.mkdirSync(dirPath, { recursive: true });
            return [];
        }
        
        const items = fs.readdirSync(dirPath);
        const files = [];
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isFile()) {
                    files.push({
                        name: item,
                        path: fullPath,
                        size: stat.size,
                        type: path.extname(item)
                    });
                }
            } catch (error) {
                console.log(`⚠️ Cannot access: ${item}`);
            }
        });
        
        return files;
    } catch (error) {
        console.log(`❌ Scan failed: ${error.message}`);
        return [];
    }
}

// Scan multiple locations
const scanLocations = [
    'D:/hossam-edss/documents',
    'D:/hossam-edss/backups', 
    'D:/hossam-edss/config'
];

console.log('📡 Scanning locations...');
let totalFiles = 0;

scanLocations.forEach(location => {
    const files = scanDirectory(location);
    console.log(`📍 ${location}: ${files.length} files`);
    totalFiles += files.length;
});

console.log(`🎉 SCAN COMPLETE: ${totalFiles} files found across ${scanLocations.length} locations`);

// Save results
const results = {
    scanTime: new Date().toISOString(),
    totalFiles: totalFiles,
    locations: scanLocations.map(loc => ({
        path: loc,
        fileCount: scanDirectory(loc).length
    }))
};

const outputPath = path.join(__dirname, 'first_scan.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`💾 Results saved to: ${outputPath}`);