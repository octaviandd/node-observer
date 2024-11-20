#!/usr/bin/env node

import { Command } from 'commander';
import { startServer } from '../src/cli/start';

const program = new Command();

program.command('serve').description('Start the Telescope server').action(() => startServer());

program.parse(process.argv)