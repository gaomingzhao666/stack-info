import { defineCommand, runMain } from 'citty'
import infoCommand from './commands/info.ts'

export const main = defineCommand({
	meta: {
		name: 'stack-info',
		version: '1.0.0',
		description:
			'A cross-platform, framework-agnostic CLI for inspecting web project stacks in command line.',
	},

	subCommands: {
		info: infoCommand,
	},
})
export const run = async () => await runMain(main)

run().catch((err) => {
	console.error(err)
	process.exit(1)
})
