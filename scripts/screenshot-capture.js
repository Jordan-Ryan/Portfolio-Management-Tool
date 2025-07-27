#!/usr/bin/env node

/**
 * Screenshot Capture Script for Portfolio Management Tool
 * 
 * This script helps capture screenshots of the application for documentation.
 * Note: This requires Puppeteer to be installed for automated screenshots.
 * For manual screenshots, use the capture guide instead.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Screenshot configuration
const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screenshots');
const APP_URL = 'http://localhost:3001/Portfolio-Management-Tool/';

// Screenshot definitions
const SCREENSHOTS = [
  {
    name: 'navigation.png',
    description: 'Navigation bar with tabs',
    selector: 'nav',
    waitFor: '.nav-tabs'
  },
  {
    name: 'timeline-overview.png',
    description: 'Main timeline view',
    selector: '.timeline-container',
    waitFor: '.week-header'
  },
  {
    name: 'work-items.png',
    description: 'Work item bars',
    selector: '.work-item-bar',
    waitFor: '.work-item-bar'
  },
  {
    name: 'capacity-table.png',
    description: 'Capacity table page',
    url: `${APP_URL}#capacity`,
    selector: '.capacity-table',
    waitFor: '.capacity-table'
  },
  {
    name: 'project-expansion.png',
    description: 'Expanded project view',
    selector: '.project-expanded',
    waitFor: '.backlog-column'
  }
];

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  console.log('✅ Created screenshots directory');
}

console.log('📸 Screenshot Capture Guide');
console.log('============================');
console.log('');
console.log('The application is running at:', APP_URL);
console.log('');
console.log('Required screenshots:');
console.log('');

SCREENSHOTS.forEach((screenshot, index) => {
  console.log(`${index + 1}. ${screenshot.name}`);
  console.log(`   Description: ${screenshot.description}`);
  console.log(`   Selector: ${screenshot.selector || 'N/A'}`);
  console.log('');
});

console.log('📋 Manual Capture Instructions:');
console.log('');
console.log('1. Open your browser to:', APP_URL);
console.log('2. Use your system screenshot tool:');
console.log('   - macOS: Cmd + Shift + 4 (select area)');
console.log('   - Windows: PrtScn or Snipping Tool');
console.log('   - Linux: PrtScn or gnome-screenshot');
console.log('');
console.log('3. Save screenshots to:', SCREENSHOTS_DIR);
console.log('');
console.log('4. Update USER_GUIDE.md with actual image references');
console.log('');
console.log('🎯 Key Features to Capture:');
console.log('- Navigation between Project Roadmap and PDT Team Capacity');
console.log('- Work items with alert icons (⚠️)');
console.log('- Drag and drop functionality');
console.log('- Alert popovers with detailed information');
console.log('- Project expansion with backlog column');
console.log('- Capacity table with color-coded indicators');
console.log('- Work item modal with basic info and dependencies');
console.log('- Filter dropdowns with multi-select options');
console.log('');
console.log('📁 Screenshots will be saved to:', SCREENSHOTS_DIR);
console.log('');
console.log('✅ Ready to capture screenshots!'); 