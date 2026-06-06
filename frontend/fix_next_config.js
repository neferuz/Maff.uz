const fs = require('fs');

const paths = [
    '/Users/apple/Desktop/Maff.uz-main/frontend/next.config.ts',
    '/Users/apple/Desktop/Maff.uz-main/admin-panel/next.config.ts',
    '/Users/apple/Desktop/Maff.uz-main/frontend/next.config.mjs',
    '/Users/apple/Desktop/Maff.uz-main/admin-panel/next.config.mjs'
];

for (const p of paths) {
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        
        // Check if egger is already there
        if (!content.includes("source: '/static/uploads/egger/:path*'")) {
            // Find the last explicit /static/uploads/... rewrite
            const replacement = `      {
        source: '/static/uploads/egger/:path*',
        destination: 'http://127.0.0.1:8000/static/uploads/egger/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/kronospan/:path*',`;
            content = content.replace("      {\n        source: '/static/uploads/kronospan/:path*',", replacement);
            
            // For admin-panel which doesn't have basePath: false on all
            if (!content.includes(replacement)) {
                const replacement2 = `      {
        source: '/static/uploads/egger/:path*',
        destination: 'http://localhost:8000/static/uploads/egger/:path*',
      },
      {
        source: '/static/uploads/kronospan/:path*',`;
                content = content.replace("      {\n        source: '/static/uploads/kronospan/:path*',", replacement2);
            }
            
            fs.writeFileSync(p, content);
            console.log(`Updated ${p}`);
        }
    }
}
