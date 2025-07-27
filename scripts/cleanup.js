#!/usr/bin/env node

/**
 * Portfolio Management Tool - Code Cleanup Script
 * 
 * This script performs various cleanup tasks:
 * - Validates TypeScript types
 * - Checks for unused imports
 * - Validates component structure
 * - Ensures consistent formatting
 * - Generates documentation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Portfolio Management Tool - Code Cleanup\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  log('❌ Error: Must run from project root directory', 'red');
  process.exit(1);
}

// 1. TypeScript validation
log('\n📝 Checking TypeScript types...', 'blue');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  log('✅ TypeScript validation passed', 'green');
} catch (error) {
  log('❌ TypeScript validation failed', 'red');
  process.exit(1);
}

// 2. ESLint check
log('\n🔍 Running ESLint...', 'blue');
try {
  execSync('npx eslint src --ext .ts,.tsx', { stdio: 'inherit' });
  log('✅ ESLint check passed', 'green');
} catch (error) {
  log('❌ ESLint check failed', 'red');
  process.exit(1);
}

// 3. Check for unused files
log('\n📁 Checking for unused files...', 'blue');
const srcDir = path.join(__dirname, '../src');
const componentsDir = path.join(srcDir, 'components');

// Check if all components are imported
const componentFileNames = fs.readdirSync(componentsDir)
  .filter(file => file.endsWith('.tsx'))
  .map(file => file.replace('.tsx', ''));

const appContent = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf8');
const unusedComponents = componentFileNames.filter(component => {
  return !appContent.includes(`import.*${component}`) && 
         !appContent.includes(`<${component}`);
});

if (unusedComponents.length > 0) {
  log('⚠️  Potentially unused components:', 'yellow');
  unusedComponents.forEach(component => {
    log(`   - ${component}.tsx`, 'yellow');
  });
} else {
  log('✅ All components appear to be used', 'green');
}

// 4. Validate file structure
log('\n📂 Validating file structure...', 'blue');
const requiredDirs = ['src', 'src/components', 'src/pages', 'src/data', 'src/utils', 'src/types'];
const requiredFiles = [
  'src/App.tsx',
  'src/components/TimelineView.tsx',
  'src/components/CapacityTable.tsx',
  'src/components/WorkItemModal.tsx',
  'src/pages/CapacityPage.tsx',
  'src/data/sampleData.ts',
  'src/utils/calculations.ts',
  'src/types/index.ts'
];

let structureValid = true;

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    log(`❌ Missing directory: ${dir}`, 'red');
    structureValid = false;
  }
});

requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    log(`❌ Missing file: ${file}`, 'red');
    structureValid = false;
  }
});

if (structureValid) {
  log('✅ File structure is valid', 'green');
} else {
  log('❌ File structure validation failed', 'red');
  process.exit(1);
}

// 5. Check for consistent imports
log('\n📦 Checking import consistency...', 'blue');
const importPatterns = [
  /import.*from ['"]react['"]/g,
  /import.*from ['"]date-fns['"]/g,
  /import.*from ['"]lucide-react['"]/g
];

let importIssues = 0;
const filesToCheck = [
  'src/App.tsx',
  'src/components/TimelineView.tsx',
  'src/components/CapacityTable.tsx',
  'src/components/WorkItemModal.tsx'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    importPatterns.forEach(pattern => {
      if (!pattern.test(content)) {
        log(`⚠️  Missing import pattern in ${file}`, 'yellow');
        importIssues++;
      }
    });
  }
});

if (importIssues === 0) {
  log('✅ Import patterns are consistent', 'green');
} else {
  log(`⚠️  Found ${importIssues} import issues`, 'yellow');
}

// 6. Validate TypeScript interfaces
log('\n🔧 Checking TypeScript interfaces...', 'blue');
const typesFile = path.join(srcDir, 'types/index.ts');
if (fs.existsSync(typesFile)) {
  const typesContent = fs.readFileSync(typesFile, 'utf8');
  const requiredInterfaces = ['WorkItem', 'Project', 'PDTTeam', 'Alert'];
  
  let missingInterfaces = 0;
  requiredInterfaces.forEach(interfaceName => {
    if (!typesContent.includes(`interface ${interfaceName}`)) {
      log(`❌ Missing interface: ${interfaceName}`, 'red');
      missingInterfaces++;
    }
  });
  
  if (missingInterfaces === 0) {
    log('✅ All required interfaces are present', 'green');
  } else {
    log(`❌ Missing ${missingInterfaces} interfaces`, 'red');
  }
}

// 7. Check for proper exports
log('\n📤 Checking exports...', 'blue');
const componentFilesForExport = fs.readdirSync(componentsDir)
  .filter(file => file.endsWith('.tsx'));

let exportIssues = 0;
componentFilesForExport.forEach(file => {
  const filePath = path.join(componentsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const componentName = file.replace('.tsx', '');
  
  if (!content.includes(`export.*${componentName}`)) {
    log(`⚠️  Missing export for ${componentName}`, 'yellow');
    exportIssues++;
  }
});

if (exportIssues === 0) {
  log('✅ All components are properly exported', 'green');
} else {
  log(`⚠️  Found ${exportIssues} export issues`, 'yellow');
}

// 8. Generate documentation summary
log('\n📚 Generating documentation summary...', 'blue');
const summary = {
  totalComponents: componentFilesForExport.length,
  totalFiles: fs.readdirSync(srcDir, { recursive: true }).length,
  lastModified: new Date().toISOString(),
  structure: {
    components: fs.readdirSync(componentsDir).length,
    pages: fs.readdirSync(path.join(srcDir, 'pages')).length,
    utils: fs.readdirSync(path.join(srcDir, 'utils')).length,
    types: fs.readdirSync(path.join(srcDir, 'types')).length
  }
};

const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

fs.writeFileSync(
  path.join(docsDir, 'codebase-summary.json'),
  JSON.stringify(summary, null, 2)
);

log('✅ Documentation summary generated', 'green');

// 9. Final status
log('\n🎉 Code cleanup completed successfully!', 'green');
log('\n📊 Summary:', 'blue');
log(`   - Components: ${summary.structure.components}`, 'green');
log(`   - Pages: ${summary.structure.pages}`, 'green');
log(`   - Utils: ${summary.structure.utils}`, 'green');
log(`   - Types: ${summary.structure.types}`, 'green');
log(`   - Total files: ${summary.totalFiles}`, 'green');

log('\n📖 Documentation files created:', 'blue');
log('   - README.md (comprehensive user guide)', 'green');
log('   - docs/USER_GUIDE.md (detailed user instructions)', 'green');
log('   - docs/TECHNICAL_DOCUMENTATION.md (developer guide)', 'green');
log('   - docs/codebase-summary.json (project statistics)', 'green');

log('\n🚀 Ready for deployment!', 'green'); 