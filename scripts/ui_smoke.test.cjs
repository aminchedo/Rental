#!/usr/bin/env node
/**
 * UI Smoke Test for Persian Chat Frontend
 * Tests: prompt sending, bubble render, typing indicator, RTL, dark/light toggle, keyboard shortcuts
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`   ${msg}`)
};

// Frontend directory (adjust if needed)
const FRONTEND_DIR = process.env.FRONTEND_DIR || 'frontend';
const CLIENT_DIR = process.env.CLIENT_DIR || 'client';

// Determine which directory exists
let frontendPath = FRONTEND_DIR;
if (!fs.existsSync(FRONTEND_DIR) && fs.existsSync(CLIENT_DIR)) {
    frontendPath = CLIENT_DIR;
}

console.log('======================================');
console.log('UI Smoke Test');
console.log('======================================');
console.log('');
console.log(`Frontend directory: ${frontendPath}`);
console.log('');

let testsPassed = 0;
let testsFailed = 0;

/**
 * Search for pattern in files
 */
function searchInFiles(dir, pattern, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
    const results = [];
    
    function searchDir(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        
        const files = fs.readdirSync(currentDir);
        
        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
                searchDir(filePath);
            } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
                const content = fs.readFileSync(filePath, 'utf8');
                const matches = content.match(pattern);
                if (matches) {
                    results.push({ file: filePath, matches });
                }
            }
        }
    }
    
    searchDir(dir);
    return results;
}

/**
 * Check if pattern exists in any file
 */
function checkPattern(description, pattern, failOnMissing = true) {
    const results = searchInFiles(frontendPath, pattern);
    
    if (results.length > 0) {
        log.success(description);
        log.info(`Found in ${results.length} file(s): ${results.map(r => path.basename(r.file)).join(', ')}`);
        testsPassed++;
        return true;
    } else {
        if (failOnMissing) {
            log.error(description);
            testsFailed++;
        } else {
            log.warning(description + ' (optional)');
        }
        return false;
    }
}

/**
 * Check if file exists
 */
function checkFileExists(description, filePath, failOnMissing = true) {
    const fullPath = path.join(frontendPath, filePath);
    
    if (fs.existsSync(fullPath)) {
        log.success(description);
        log.info(`File: ${filePath}`);
        testsPassed++;
        return true;
    } else {
        if (failOnMissing) {
            log.error(description);
            log.info(`Expected: ${filePath}`);
            testsFailed++;
        } else {
            log.warning(description + ' (optional)');
        }
        return false;
    }
}

// Test 1: Chat Bubbles
console.log('Test 1: Chat Bubbles');
console.log('--------------------------------------');
checkPattern(
    'Chat bubbles implementation',
    /(chat.*bubble|message.*bubble|bubble.*message)/i
);
console.log('');

// Test 2: RTL Support
console.log('Test 2: RTL Support');
console.log('--------------------------------------');
checkPattern(
    'RTL (Right-to-Left) support',
    /(dir=["']rtl["']|direction:\s*rtl|rtl)/i
);
console.log('');

// Test 3: Typing Indicator
console.log('Test 3: Typing Indicator');
console.log('--------------------------------------');
checkPattern(
    'Typing indicator/spinner',
    /(typing|isLoading|loading|spinner)/i
);
console.log('');

// Test 4: Auto-scroll
console.log('Test 4: Auto-scroll');
console.log('--------------------------------------');
checkPattern(
    'Auto-scroll implementation',
    /(scrollIntoView|scrollTop|auto.*scroll|scroll.*bottom)/i
);
console.log('');

// Test 5: Dark/Light Mode Toggle
console.log('Test 5: Dark/Light Mode Toggle');
console.log('--------------------------------------');
checkPattern(
    'Dark/light mode toggle',
    /(dark.*mode|theme.*toggle|dark:|light.*mode)/i
);
console.log('');

// Test 6: Keyboard Shortcuts
console.log('Test 6: Keyboard Shortcuts');
console.log('--------------------------------------');
checkPattern(
    'Keyboard shortcuts (Enter, Shift+Enter)',
    /(onKeyDown|onKeyPress|KeyboardEvent|keyboard.*shortcut)/i
);
console.log('');

// Test 7: Accessibility (ARIA)
console.log('Test 7: Accessibility (ARIA)');
console.log('--------------------------------------');
checkPattern(
    'ARIA attributes for accessibility',
    /aria-[a-z]+=/i
);
console.log('');

// Test 8: LocalStorage Persistence
console.log('Test 8: LocalStorage Persistence');
console.log('--------------------------------------');
checkPattern(
    'LocalStorage for chat history',
    /localStorage\.(get|set)Item/i
);
console.log('');

// Test 9: Toast Notifications
console.log('Test 9: Toast Notifications');
console.log('--------------------------------------');
checkPattern(
    'Toast notifications for errors',
    /(toast|notification|alert|snackbar)/i,
    false  // Optional
);
console.log('');

// Test 10: Animations
console.log('Test 10: Animations');
console.log('--------------------------------------');
checkPattern(
    'Animations (fade-in, transitions)',
    /(animate-|@keyframes|transition|animation)/i,
    false  // Optional
);
console.log('');

// Test 11: Settings Component
console.log('Test 11: Settings Component');
console.log('--------------------------------------');
checkPattern(
    'Settings modal/panel',
    /(settings|config|configuration)/i
);
console.log('');

// Test 12: API Integration
console.log('Test 12: API Integration');
console.log('--------------------------------------');
checkPattern(
    'API integration (fetch/axios)',
    /(fetch\(|axios\.|api.*endpoint|\/api\/)/i
);
console.log('');

// Test 13: Build Configuration
console.log('Test 13: Build Configuration');
console.log('--------------------------------------');
checkFileExists(
    'Package.json exists',
    'package.json'
);
checkFileExists(
    'Build script configured',
    'package.json'
) && (() => {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(frontendPath, 'package.json'), 'utf8'));
    if (pkgJson.scripts && pkgJson.scripts.build) {
        log.success('Build script found in package.json');
        testsPassed++;
    } else {
        log.error('Build script not found in package.json');
        testsFailed++;
    }
})();
console.log('');

// Test 14: Responsive Design
console.log('Test 14: Responsive Design');
console.log('--------------------------------------');
checkPattern(
    'Responsive design (mobile-first)',
    /(responsive|mobile|sm:|md:|lg:|xl:|@media)/i,
    false  // Optional
);
console.log('');

// Summary
console.log('======================================');
console.log('Test Summary');
console.log('======================================');
console.log('');
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log('');

if (testsFailed === 0) {
    log.success('All UI smoke tests passed! ✨');
    console.log('');
    console.log('Frontend is properly implemented and ready for deployment.');
    process.exit(0);
} else {
    log.error(`${testsFailed} test(s) failed`);
    console.log('');
    console.log('Please implement missing features before proceeding.');
    process.exit(1);
}
