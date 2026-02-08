import { defineCommand, runMain } from 'citty'
import infoCommand from './commands/info'

export const main = defineCommand({
	meta: {
		name: 'stack-info',
		version: '1.0.0',
		description:
			'print web stacks information for your project with command line',
	},

	subCommands: {
		info: infoCommand,
	},
})

export async function run() {
	await runMain(main)
}

run().catch((err) => {
	console.error(err)
	process.exit(1)
})
