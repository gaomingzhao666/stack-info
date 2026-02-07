import { defineCommand, runMain } from 'citty'
import { name, version, description } from '../package.json'

import infoCommand from './commands/info'

export const main = defineCommand({
	meta: {
		name,
		version,
		description,
	},

	subCommands: {
		info: infoCommand,
	},
})

export async function run() {
	await runMain(main)
}
