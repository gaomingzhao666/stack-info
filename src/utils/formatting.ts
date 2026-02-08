import process from 'node:process'
import { stripVTControlCharacters } from 'node:util'
import { colors } from 'consola/utils'

const getStringWidth = (str: string): number => {
	const stripped = stripVTControlCharacters(str)
	let width = 0

	for (const char of stripped) {
		const code = char.codePointAt(0)
		if (!code) continue
		// Variation selectors don't add width
		if (code >= 0xfe00 && code <= 0xfe0f) continue

		// Emoji and wide characters (simplified heuristic)
		// Most emojis are in these ranges
		if (
			(code >= 0x1f300 && code <= 0x1f9ff) || // Emoticons, symbols, pictographs
			(code >= 0x1f600 && code <= 0x1f64f) || // Emoticons
			(code >= 0x1f680 && code <= 0x1f6ff) || // Transport and map symbols
			(code >= 0x2600 && code <= 0x26ff) || // Miscellaneous symbols (includes ❤)
			(code >= 0x2700 && code <= 0x27bf) || // Dingbats
			(code >= 0x1f900 && code <= 0x1f9ff) || // Supplemental symbols and pictographs
			(code >= 0x1fa70 && code <= 0x1faff) // Symbols and Pictographs Extended-A
		)
			width += 2
		else width += 1
	}

	return width
}

export const formatInfoBox = (
	infoObj: Record<string, string | undefined>,
): string => {
	let firstColumnLength = 0
	let ansiFirstColumnLength = 0
	const entries = Object.entries(infoObj).map(([label, val]) => {
		if (label.length > firstColumnLength) {
			ansiFirstColumnLength = colors.bold(colors.whiteBright(label)).length + 6
			firstColumnLength = label.length + 6
		}
		return [label, val || '-'] as const
	})

	// get maximum width of terminal
	const terminalWidth =
		Math.max(process.stdout.columns || 80, firstColumnLength) -
		8 /* box padding + extra margin */

	let boxStr = ''
	for (const [label, value] of entries) {
		const formattedValue = value
			.replace(/\b@([^, ]+)/g, (_, r) => colors.gray(` ${r}`))
			.replace(/`([^`]*)`/g, (_, r) => r)

		boxStr += `${colors.bold(colors.whiteBright(label))}`.padEnd(
			ansiFirstColumnLength,
		)

		let boxRowLength = firstColumnLength

		// Split by spaces and wrap as needed
		const words = formattedValue.split(' ')
		let currentLine = ''

		for (const word of words) {
			const wordLength = getStringWidth(word)
			const spaceLength = currentLine ? 1 : 0

			if (boxRowLength + wordLength + spaceLength > terminalWidth) {
				// Wrap to next line
				if (currentLine) boxStr += colors.cyan(currentLine)

				boxStr += `\n${' '.repeat(firstColumnLength)}`
				currentLine = word
				boxRowLength = firstColumnLength + wordLength
			} else {
				currentLine += (currentLine ? ' ' : '') + word
				boxRowLength += wordLength + spaceLength
			}
		}
		if (currentLine) boxStr += colors.cyan(currentLine)

		boxStr += '\n'
	}

	return boxStr
}
