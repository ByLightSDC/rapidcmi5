#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import { registerGenerateAuTerraform } from './commands/generateAuTerraform';
import { registerBuild } from './commands/build';
import { registerBuildOpendash } from './commands/buildOpendash';
import { registerBuildMoodle } from './commands/buildMoodle';

const program = new Command();

program
  .name('cmi5-builder')
  .description(
    'Generate cmi5 content from an mkdocs repo and upload to opendash',
  )
  .version('1.0.0');

registerGenerateAuTerraform(program);
registerBuild(program);
registerBuildOpendash(program);
registerBuildMoodle(program);

program.parse(process.argv);
