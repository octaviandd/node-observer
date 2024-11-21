#!/usr/bin/env node

import { Command } from 'commander';
import startServer from '../index';

const program = new Command();
program.command('serve').description('Start the Observatory server').action((req, res) => startServer(req, res));
program.parse(process.argv)