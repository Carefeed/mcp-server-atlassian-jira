import { Command } from 'commander';
import { Logger } from '../utils/logger.util.js';
import { VERSION, CLI_NAME } from '../utils/constants.util.js';

import atlassianProjectsCommands from './atlassian.projects.cli.js';
import atlassianIssuesCommands from './atlassian.issues.cli.js';
import atlassianStatusesCommands from './atlassian.statuses.cli.js';

// Package description
const DESCRIPTION =
	'A Model Context Protocol (MCP) server for Atlassian Jira integration';

// Create a contextualized logger for this file
const cliLogger = Logger.forContext('cli/index.ts');

// Log CLI module initialization
cliLogger.debug('Jira CLI module initialized');

export async function runCli(args: string[]) {
	const methodLogger = Logger.forContext('cli/index.ts', 'runCli');
	methodLogger.debug('Running CLI with arguments', args);

	const program = new Command();

	program.name(CLI_NAME).description(DESCRIPTION).version(VERSION);

	// Register CLI commands
	atlassianProjectsCommands.register(program);
	cliLogger.debug('Projects commands registered');

	atlassianIssuesCommands.register(program);
	cliLogger.debug('Issues commands registered');

	atlassianStatusesCommands.register(program);
	cliLogger.debug('Statuses commands registered');

	// Handle unknown commands
	program.on('command:*', (operands) => {
		methodLogger.error(`Unknown command: ${operands[0]}`);
		console.log('');
		program.help();
		process.exit(1);
	});

	// Parse arguments; default to help if no command provided
	await program.parseAsync(args.length ? args : ['--help'], { from: 'user' });
	methodLogger.debug('CLI command execution completed');
}
