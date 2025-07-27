#!/usr/bin/env node

/**
 * Placeholder Image Generator for Portfolio Management Tool
 * 
 * This script creates placeholder images for documentation until real screenshots are captured.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screenshots');

// Create screenshots directory
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Placeholder SVG content for each screenshot
const PLACEHOLDERS = {
  'navigation.png': `
    <svg width="800" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="60" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="0" y="0" width="200" height="60" fill="#007bff" opacity="0.1"/>
      <text x="20" y="35" font-family="Arial" font-size="16" fill="#495057">Project Roadmap</text>
      <text x="220" y="35" font-family="Arial" font-size="16" fill="#6c757d">PDT Team Capacity</text>
      <text x="400" y="35" font-family="Arial" font-size="12" fill="#6c757d">[Navigation Bar]</text>
    </svg>
  `,
  'timeline-overview.png': `
    <svg width="1200" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="400" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="0" y="0" width="1200" height="40" fill="#e9ecef"/>
      <text x="20" y="25" font-family="Arial" font-size="12" fill="#495057">Week Headers</text>
      <rect x="0" y="60" width="300" height="80" fill="#fff" stroke="#dee2e6"/>
      <text x="20" y="85" font-family="Arial" font-size="14" fill="#495057">E-commerce Platform Redesign</text>
      <rect x="320" y="60" width="80" height="40" fill="#007bff" opacity="0.8"/>
      <text x="330" y="85" font-family="Arial" font-size="10" fill="white">UI/UX Design</text>
      <text x="400" y="200" font-family="Arial" font-size="14" fill="#6c757d">[Timeline Overview]</text>
    </svg>
  `,
  'work-items.png': `
    <svg width="600" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="200" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="20" y="20" width="120" height="40" fill="#007bff" opacity="0.8"/>
      <text x="30" y="45" font-family="Arial" font-size="12" fill="white">UI/UX Design</text>
      <text x="30" y="60" font-family="Arial" font-size="10" fill="white">Design Team • 40%</text>
      <text x="150" y="45" font-family="Arial" font-size="16" fill="#dc3545">⚠️</text>
      <rect x="20" y="80" width="100" height="40" fill="#28a745" opacity="0.8"/>
      <text x="30" y="105" font-family="Arial" font-size="12" fill="white">Frontend Dev</text>
      <text x="30" y="120" font-family="Arial" font-size="10" fill="white">Frontend Team • 60%</text>
      <text x="400" y="100" font-family="Arial" font-size="14" fill="#6c757d">[Work Items]</text>
    </svg>
  `,
  'capacity-table.png': `
    <svg width="1000" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="300" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="0" y="0" width="200" height="40" fill="#e9ecef"/>
      <text x="20" y="25" font-family="Arial" font-size="12" fill="#495057">PDT Team</text>
      <rect x="200" y="0" width="100" height="40" fill="#e9ecef"/>
      <text x="220" y="25" font-family="Arial" font-size="12" fill="#495057">Max Capacity</text>
      <rect x="0" y="40" width="200" height="40" fill="#fff"/>
      <text x="20" y="65" font-family="Arial" font-size="12" fill="#495057">Frontend Team</text>
      <rect x="200" y="40" width="100" height="40" fill="#fff"/>
      <text x="220" y="65" font-family="Arial" font-size="12" fill="#495057">80%</text>
      <rect x="300" y="40" width="80" height="40" fill="#d4edda"/>
      <text x="320" y="65" font-family="Arial" font-size="12" fill="#155724">60%</text>
      <text x="500" y="150" font-family="Arial" font-size="14" fill="#6c757d">[Capacity Table]</text>
    </svg>
  `,
  'alert-popover.png': `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="20" y="20" width="360" height="260" fill="#fff" stroke="#dee2e6" stroke-width="2"/>
      <text x="40" y="50" font-family="Arial" font-size="16" fill="#495057" font-weight="bold">Alerts</text>
      <text x="40" y="80" font-family="Arial" font-size="14" fill="#dc3545">⚠️ Behind Schedule</text>
      <text x="40" y="100" font-family="Arial" font-size="12" fill="#6c757d">Work item is behind schedule</text>
      <text x="40" y="130" font-family="Arial" font-size="14" fill="#dc3545">⚠️ Dependency Conflict</text>
      <text x="40" y="150" font-family="Arial" font-size="12" fill="#6c757d">Dependency conflict detected</text>
      <text x="40" y="180" font-family="Arial" font-size="12" fill="#007bff">Acknowledge Dependency</text>
      <text x="200" y="250" font-family="Arial" font-size="14" fill="#6c757d">[Alert Popover]</text>
    </svg>
  `,
  'project-expansion.png': `
    <svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="200" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="0" y="0" width="300" height="200" fill="#fff" stroke="#dee2e6"/>
      <text x="20" y="30" font-family="Arial" font-size="14" fill="#495057" font-weight="bold">Backlog</text>
      <rect x="20" y="50" width="260" height="30" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="30" y="70" font-family="Arial" font-size="12" fill="#495057">Backlog Item 1</text>
      <rect x="20" y="90" width="260" height="30" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="30" y="110" font-family="Arial" font-size="12" fill="#495057">Backlog Item 2</text>
      <rect x="300" y="0" width="500" height="200" fill="#fff" stroke="#dee2e6"/>
      <text x="320" y="30" font-family="Arial" font-size="14" fill="#495057" font-weight="bold">Timeline</text>
      <rect x="320" y="50" width="80" height="40" fill="#007bff" opacity="0.8"/>
      <text x="330" y="75" font-family="Arial" font-size="10" fill="white">Work Item</text>
      <text x="400" y="100" font-family="Arial" font-size="14" fill="#6c757d">[Project Expansion]</text>
    </svg>
  `,
  'work-item-modal-basic.png': `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="50" y="50" width="500" height="300" fill="#fff" stroke="#dee2e6" stroke-width="2"/>
      <text x="70" y="80" font-family="Arial" font-size="18" fill="#495057" font-weight="bold">Edit Work Item</text>
      <text x="70" y="120" font-family="Arial" font-size="12" fill="#495057">Name:</text>
      <rect x="70" y="130" width="200" height="30" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="80" y="150" font-family="Arial" font-size="12" fill="#495057">UI/UX Design Phase</text>
      <text x="70" y="180" font-family="Arial" font-size="12" fill="#495057">PDT Team:</text>
      <rect x="70" y="190" width="200" height="30" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="80" y="210" font-family="Arial" font-size="12" fill="#495057">Design Team</text>
      <text x="300" y="200" font-family="Arial" font-size="14" fill="#6c757d">[Work Item Modal]</text>
    </svg>
  `,
  'work-item-modal-dependencies.png': `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="50" y="50" width="500" height="300" fill="#fff" stroke="#dee2e6" stroke-width="2"/>
      <text x="70" y="80" font-family="Arial" font-size="18" fill="#495057" font-weight="bold">Edit Work Item</text>
      <text x="70" y="120" font-family="Arial" font-size="14" fill="#495057" font-weight="bold">Dependencies</text>
      <text x="70" y="150" font-family="Arial" font-size="12" fill="#495057">Predecessors:</text>
      <rect x="70" y="160" width="200" height="30" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="80" y="180" font-family="Arial" font-size="12" fill="#495057">Previous Work Item</text>
      <text x="70" y="210" font-family="Arial" font-size="12" fill="#495057">Successors:</text>
      <rect x="70" y="220" width="200" height="30" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="80" y="240" font-family="Arial" font-size="12" fill="#495057">Next Work Item</text>
      <text x="300" y="200" font-family="Arial" font-size="14" fill="#6c757d">[Dependencies Tab]</text>
    </svg>
  `,
  'add-dependency.png': `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="50" y="50" width="300" height="200" fill="#fff" stroke="#dee2e6" stroke-width="2"/>
      <text x="70" y="80" font-family="Arial" font-size="16" fill="#495057" font-weight="bold">Add Dependency</text>
      <text x="70" y="120" font-family="Arial" font-size="12" fill="#495057">Type:</text>
      <rect x="70" y="130" width="200" height="30" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="80" y="150" font-family="Arial" font-size="12" fill="#495057">Predecessor</text>
      <text x="70" y="180" font-family="Arial" font-size="12" fill="#495057">Search:</text>
      <rect x="70" y="190" width="200" height="30" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="80" y="210" font-family="Arial" font-size="12" fill="#495057">Work item name...</text>
      <text x="200" y="250" font-family="Arial" font-size="14" fill="#6c757d">[Add Dependency]</text>
    </svg>
  `,
  'alert-acknowledgment.png': `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="20" y="20" width="360" height="260" fill="#fff" stroke="#dee2e6" stroke-width="2"/>
      <text x="40" y="50" font-family="Arial" font-size="16" fill="#495057" font-weight="bold">Alerts</text>
      <text x="40" y="80" font-family="Arial" font-size="14" fill="#dc3545">⚠️ Dependency Conflict</text>
      <text x="40" y="100" font-family="Arial" font-size="12" fill="#6c757d">Dependency conflict detected</text>
      <text x="40" y="130" font-family="Arial" font-size="12" fill="#6c757d">Work items overlap in time</text>
      <rect x="40" y="150" width="120" height="30" fill="#007bff"/>
      <text x="70" y="170" font-family="Arial" font-size="12" fill="white">Acknowledge</text>
      <text x="200" y="250" font-family="Arial" font-size="14" fill="#6c757d">[Alert Acknowledgment]</text>
    </svg>
  `,
  'pdt-filter.png': `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="200" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="20" y="20" width="260" height="160" fill="#fff" stroke="#dee2e6" stroke-width="2"/>
      <text x="40" y="50" font-family="Arial" font-size="14" fill="#495057" font-weight="bold">PDT Team Filter</text>
      <rect x="40" y="70" width="220" height="25" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="50" y="87" font-family="Arial" font-size="12" fill="#495057">✓ Frontend Team</text>
      <rect x="40" y="100" width="220" height="25" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="50" y="117" font-family="Arial" font-size="12" fill="#495057">Backend Team</text>
      <rect x="40" y="130" width="220" height="25" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="50" y="147" font-family="Arial" font-size="12" fill="#495057">DevOps Team</text>
      <text x="150" y="180" font-family="Arial" font-size="14" fill="#6c757d">[PDT Filter]</text>
    </svg>
  `,
  'project-filter.png': `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="200" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <rect x="20" y="20" width="260" height="160" fill="#fff" stroke="#dee2e6" stroke-width="2"/>
      <text x="40" y="50" font-family="Arial" font-size="14" fill="#495057" font-weight="bold">Project Filter</text>
      <rect x="40" y="70" width="220" height="25" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="50" y="87" font-family="Arial" font-size="12" fill="#495057">✓ E-commerce Platform</text>
      <rect x="40" y="100" width="220" height="25" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="50" y="117" font-family="Arial" font-size="12" fill="#495057">Mobile App Development</text>
      <rect x="40" y="130" width="220" height="25" fill="#f8f9fa" stroke="#dee2e6"/>
      <text x="50" y="147" font-family="Arial" font-size="12" fill="#495057">Data Analytics Dashboard</text>
      <text x="150" y="180" font-family="Arial" font-size="14" fill="#6c757d">[Project Filter]</text>
    </svg>
  `
};

console.log('🎨 Creating placeholder images...');

// Create placeholder images
Object.entries(PLACEHOLDERS).forEach(([filename, svgContent]) => {
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  fs.writeFileSync(filepath.replace('.png', '.svg'), svgContent.trim());
  console.log(`✅ Created ${filename.replace('.png', '.svg')}`);
});

console.log('');
console.log('📁 Placeholder images created in:', SCREENSHOTS_DIR);
console.log('');
console.log('📝 Next steps:');
console.log('1. Replace placeholder SVGs with actual PNG screenshots');
console.log('2. Update USER_GUIDE.md to reference the actual images');
console.log('3. Commit the screenshots to git');
console.log('');
console.log('🎯 To capture real screenshots:');
console.log('- Open http://localhost:3001/Portfolio-Management-Tool/');
console.log('- Use your system screenshot tool');
console.log('- Save as PNG files in the screenshots directory'); 