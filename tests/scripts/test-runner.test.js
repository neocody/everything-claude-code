const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const runner = fs.readFileSync(path.join(__dirname, '..', 'run-all.js'), 'utf8');
const suites = [...runner.matchAll(/'((?:lib|hooks|integration|ci|scripts)\/[^']+\.test\.js)'/g)]
  .map(match => match[1]);
let passed = 0;
let failed = 0;

function check(name, source, expected, missing = false) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-runner-'));
  try {
    fs.writeFileSync(path.join(root, 'run-all.js'), runner);
    for (const suite of suites) {
      const file = path.join(root, suite);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, 'console.log("Passed: 1, Failed: 0");');
    }
    const target = path.join(root, suites[0]);
    if (missing) fs.unlinkSync(target);
    else fs.writeFileSync(target, source);
    const result = spawnSync(process.execPath, [path.join(root, 'run-all.js')], {
      encoding: 'utf8', timeout: 10000
    });
    assert.strictEqual(result.status, expected, result.stdout + result.stderr);
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}: ${error.message}`);
    failed++;
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

check('complete successful suites pass', 'console.log("Passed: 1, Failed: 0");', 0);
check('alternate existing summary format passes', 'console.log("Results: 1 passed, 0 failed");', 0);
check('crashed suite fails despite successful summary',
  'console.log("Passed: 1, Failed: 0"); process.exit(2);', 1);
check('missing summary fails', 'console.log("suite terminated early");', 1);
check('reported failure fails even with zero exit', 'console.log("Passed: 0, Failed: 1");', 1);
check('missing declared suite fails', '', 1, true);
console.log(`Results: Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
