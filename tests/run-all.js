#!/usr/bin/env node
/**
 * Run all tests
 *
 * Usage: node tests/run-all.js
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const testsDir = __dirname;
const testFiles = [
  'lib/utils.test.js',
  'lib/package-manager.test.js',
  'lib/session-manager.test.js',
  'lib/session-aliases.test.js',
  'lib/project-detect.test.js',
  'hooks/hooks.test.js',
  'hooks/evaluate-session.test.js',
  'hooks/suggest-compact.test.js',
  'integration/hooks.test.js',
  'ci/validators.test.js',
  'scripts/claw.test.js',
  'scripts/setup-package-manager.test.js',
  'scripts/skill-create-output.test.js',
  'scripts/test-runner.test.js'
];

const BOX_W = 58; // inner width between ║ delimiters
const boxLine = (s) => `║${s.padEnd(BOX_W)}║`;

console.log('╔' + '═'.repeat(BOX_W) + '╗');
console.log(boxLine('           Everything Claude Code - Test Suite'));
console.log('╚' + '═'.repeat(BOX_W) + '╝');
console.log();

let totalPassed = 0;
let totalFailed = 0;
let totalTests = 0;
let suiteErrors = 0;

for (const testFile of testFiles) {
  const testPath = path.join(testsDir, testFile);

  if (!fs.existsSync(testPath)) {
    console.error(`Missing required suite: ${testFile}`);
    suiteErrors++;
    continue;
  }

  console.log(`\n━━━ Running ${testFile} ━━━`);

  const result = spawnSync(process.execPath, [testPath], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';

  // Show both stdout and stderr so hook warnings are visible
  if (stdout) console.log(stdout);
  if (stderr) console.log(stderr);

  // Parse results from combined output
  const combined = stdout + stderr;
  const passedMatch = combined.match(/Passed:\s*(\d+)/i) || combined.match(/(\d+)\s+passed/i);
  const failedMatch = combined.match(/Failed:\s*(\d+)/i) || combined.match(/(\d+)\s+failed/i);

  if (passedMatch) totalPassed += parseInt(passedMatch[1], 10);
  if (failedMatch) totalFailed += parseInt(failedMatch[1], 10);
  if (result.error || result.status !== 0 || !passedMatch || !failedMatch) {
    console.error(`Suite did not complete successfully: ${testFile}`);
    suiteErrors++;
  }
}

totalTests = totalPassed + totalFailed;

console.log('\n╔' + '═'.repeat(BOX_W) + '╗');
console.log(boxLine('                     Final Results'));
console.log('╠' + '═'.repeat(BOX_W) + '╣');
console.log(boxLine(`  Total Tests: ${String(totalTests).padStart(4)}`));
console.log(boxLine(`  Passed:      ${String(totalPassed).padStart(4)}  ✓`));
console.log(boxLine(`  Failed:      ${String(totalFailed).padStart(4)}  ${totalFailed > 0 ? '✗' : ' '}`));
console.log(boxLine(`  Suite errors: ${suiteErrors}`));
console.log('╚' + '═'.repeat(BOX_W) + '╝');

process.exit(totalFailed > 0 || suiteErrors > 0 ? 1 : 0);
