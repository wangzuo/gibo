#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const packageJSON = require('./package.json');
const { spawnSync } = require('child_process');

const { HOME } = process.env;
const remoteRepo = 'https://github.com/github/gitignore.git';
const localRepo = path.join(HOME, '.gitignore-boilerplates');
const currentRepoRev = '';
const remoteWebRoot = 'https://raw.github.com/github/gitignore';

const echo = console.log;
const exit = process.exit;
const { basename } = path;
const { existsSync: exists } = fs;

function exec(command, options) {
  return spawnSync(command, options).stdout.toString();
}

function cat(filepath) {
  echo(fs.readFileSync(filepath, 'utf8'));
}

function version() {
  const { name, version, author } = packageJSON;
  echo(`${name} ${version} by ${author}`);
  echo('https://github.com/wangzuo/gibo');
}

function usage() {
  version();
  echo(`Fetches gitignore boilerplates from https://github.com/github/gitignore

Usage:
    gibo [command]

Example:
    gibo dump Swift Xcode >> .gitignore

Commands:
    dump BOILERPLATE...   Write boilerplate(s) to STDOUT
    help                  Display this help text
    list                  List available boilerplates
    search STR            Search for boilerplates with STR in the name
    update                Update list of available boilerplates
    version               Display current script version
`);
}

function clone(silently = false) {
  let git = silently
    ? exec('git', ['clone', '-q', remoteRepo, localRepo])
    : exec('git', ['clone', remoteRepo, localRepo]);
}

function init() {
  if (!exists(path.join(localRepo, '.git'))) {
    clone();
  }
}

function list() {}

function search() {}

function update() {
  if (!exists(path.join(localRepo, '.git'))) {
    clone();
  } else {
    exec('cd', [localRepo]);
    exec('git', ['pull', '--ff', 'origin', 'master']);
  }
}

function dump(x) {
  init();

  const languageFile = exec('find', [
    localRepo,
    '-maxdepth',
    1,
    '-iname',
    `${x}.gitignore`
  ]).split('\n')[0];

  if (languageFile) {
    echo(`### ${remoteWebRoot}/${basename(languageFile)}\n`);
    cat(languageFile);
    return;
  }

  const globalFile = exec('find', [
    localRepo,
    '-maxdepth',
    1,
    '-iname',
    `${x}.gitignore`
  ]).split('\n')[0];

  if (globalFile) {
    echo(`### ${remoteWebRoot}/${basename(globalFile)}\n`);
    cat(globalFile);
    return;
  }

  console.error(`Unknown argument: ${x}`);
}

const args = process.argv.slice(2);

if (args.length === 0) {
  usage();
  exit(1);
}

switch (args[0]) {
  case 'version':
    version();
    exit(0);
  case 'list':
    list();
    exit(0);
  case 'update':
    update();
    exit(0);
  case 'help':
    usage();
    exit(0);
  case 'dump':
    if (args[1]) {
      dump(args[1]);
      exit(0);
    } else {
      usage();
      exit(1);
    }
  case 'search':
    search();
    exit(0);
  default:
    usage();
    exit(1);
}
