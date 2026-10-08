import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import format from '../dist/tools/format-code.js';
import lint from '../dist/tools/lint-check.js';
import summary from '../dist/tools/git-summary.js';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-tools-'));
const project = path.join(root, 'project');
const bin = path.join(root, 'bin');
fs.mkdirSync(project);
fs.mkdirSync(bin);
const originalPath = process.env.PATH;
const fixture = `#!${process.execPath}
const args=process.argv.slice(2);
if(args.some(arg => require('path').basename(arg)==='fail-marker.js')) process.exit(1);
if(process.env.ECC_TEST_GIT_FAIL === 'true' && process.argv[1].endsWith('/git')) process.exit(1);
console.log(JSON.stringify(args));
`;
for (const name of ['npx', 'black', 'gofmt', 'rustfmt', 'ruff', 'pylint', 'golangci-lint', 'git']) {
  fs.writeFileSync(path.join(bin, name), fixture, { mode: 0o755 });
}
process.env.PATH = `${bin}${path.delimiter}${originalPath}`;
after(() => {
  process.env.PATH = originalPath;
  fs.rmSync(root, { recursive: true, force: true });
});
function context(ask = async () => {}) {
  return { directory: project, worktree: project, abort: new AbortController().signal, ask };
}
function file(name, content = '') {
  fs.writeFileSync(path.join(project, name), content);
  return name;
}

test('all definitions use the SDK args and return strings', async () => {
  for (const definition of [format, lint, summary]) {
    assert.ok(definition.args);
    assert.equal(typeof definition.description, 'string');
  }
  const result = await summary.execute({ depth: 2, includeDiff: true, baseBranch: 'main' }, context());
  assert.equal(typeof result, 'string');
  const data = JSON.parse(result);
  assert.deepEqual(JSON.parse(data.log), ['log', '--oneline', '-2']);
  assert.deepEqual(JSON.parse(data.branchDiff), ['diff', '--stat', 'main...HEAD', '--']);
});
test('format passes special filenames as a single argv argument and asks before writing', async () => {
  const target = file('name ; touch injected.js');
  const asks = [];
  const result = JSON.parse(await format.execute({ filePath: target }, context(async request => asks.push(request))));
  assert.equal(result.formatted, true);
  assert.equal(result.formatter, 'prettier');
  assert.equal(JSON.parse(result.output).at(-1), path.join(project, target));
  assert.equal(asks[0].permission, 'edit');
  assert.equal(asks[1].permission, 'bash');
  assert.equal(fs.existsSync(path.join(project, 'injected.js')), false);
});
test('denied permission and aborted execution cannot spawn a formatter', async () => {
  const target = file('denied.js');
  await assert.rejects(format.execute({ filePath: target }, context(async () => { throw new Error('denied'); })), /denied/);
  const aborted = context();
  aborted.abort = AbortSignal.abort();
  const result = JSON.parse(await format.execute({ filePath: target }, aborted));
  assert.equal(result.formatted, false);
});
test('format handles language detection and explicit formatters', async () => {
  for (const [extension, formatter] of [['py', 'black'], ['go', 'gofmt'], ['rs', 'rustfmt']]) {
    const result = JSON.parse(await format.execute({ filePath: file(`sample.${extension}`) }, context()));
    assert.equal(result.formatter, formatter);
    assert.equal(result.formatted, true);
  }
  file('biome.json', '{}');
  const result = JSON.parse(await format.execute({ filePath: file('sample.ts') }, context()));
  assert.equal(result.formatter, 'biome');
  fs.unlinkSync(path.join(project, 'biome.json'));
  assert.equal(JSON.parse(await format.execute({ filePath: file('sample.xyz') }, context())).formatted, false);
  assert.equal(JSON.parse(await format.execute({ filePath: 'sample.xyz', formatter: 'prettier' }, context())).formatted, true);
});
test('format reports command failures and rejects paths outside the project', async () => {
  const target = file('fail-marker.js');
  assert.equal(JSON.parse(await format.execute({ filePath: target }, context())).formatted, false);
  const outside = path.join(root, 'outside.js');
  fs.writeFileSync(outside, '');
  await assert.rejects(format.execute({ filePath: outside }, context()), /outside/);
  fs.symlinkSync(outside, path.join(project, 'link.js'));
  await assert.rejects(format.execute({ filePath: 'link.js' }, context()), /outside/);
});
test('a target replaced with an outside symlink during permission approval is rejected', async () => {
  const target = file('race.js');
  const result = JSON.parse(await format.execute({ filePath: target }, context(async request => {
    if (request.permission === 'bash') {
      fs.unlinkSync(path.join(project, target));
      fs.symlinkSync(path.join(root, 'outside.js'), path.join(project, target));
    }
  })));
  assert.equal(result.formatted, false);
  assert.match(result.error, /outside/);
});
test('lint honors project configuration and explicit options', async () => {
  for (const [config, content, linter] of [
    ['biome.json', '{}', 'biome'], ['eslint.config.js', '', 'eslint'],
    ['pyproject.toml', '[tool.ruff]', 'ruff'], ['.golangci.yml', '', 'golangci-lint']
  ]) {
    file(config, content);
    const result = JSON.parse(await lint.execute({ fix: true }, context()));
    assert.equal(result.linter, linter);
    assert.equal(result.success, true);
    fs.unlinkSync(path.join(project, config));
  }
  const fallback = JSON.parse(await lint.execute({}, context()));
  assert.equal(fallback.linter, 'eslint');
  for (const linter of ['eslint', 'biome', 'ruff', 'pylint', 'golangci-lint']) {
    assert.equal(JSON.parse(await lint.execute({ linter, fix: false }, context())).success, true);
  }
});
test('lint denies mutation, handles process failure and fences paths', async () => {
  await assert.rejects(lint.execute({ fix: true }, context(async () => { throw new Error('denied'); })), /denied/);
  assert.equal(JSON.parse(await lint.execute({ target: 'fail-marker.js' }, context())).success, false);
  await assert.rejects(lint.execute({ target: '..' }, context()), /outside/);
});
test('git summary requests command permission and rejects option injection', async () => {
  const requests = [];
  const result = JSON.parse(await summary.execute({ includeDiff: false }, context(async request => requests.push(request))));
  assert.equal(result.stagedDiff, undefined);
  assert.ok(requests.every(request => request.permission === 'bash'));
  await assert.rejects(summary.execute({ baseBranch: '--output=sentinel' }, context()), /branch/);
  await assert.rejects(summary.execute({ depth: -1 }, context()), /depth/);
  await assert.rejects(summary.execute({}, context(async () => { throw new Error('denied'); })), /denied/);
});
test('git command failures return useful fallback results', async () => {
  process.env.ECC_TEST_GIT_FAIL = 'true';
  try {
    const result = JSON.parse(await summary.execute({}, context()));
    assert.equal(result.branch, 'unknown');
    assert.equal(result.status, 'unable to get status');
    assert.equal(result.log, 'unable to get log');
    assert.equal(result.stagedDiff, '');
    assert.equal(result.branchDiff, 'unable to diff against main');
  } finally {
    delete process.env.ECC_TEST_GIT_FAIL;
  }
});
