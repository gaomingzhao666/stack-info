import { execSync } from 'node:child_process'

export const getPackageManagerVersion = (name: string) =>
	execSync(`${name} --version`).toString('utf8').trim()
