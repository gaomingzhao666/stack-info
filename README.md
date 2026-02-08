# Stack Info CLI

[![npm version](https://img.shields.io/npm/v/@gaomingzhao666/stack-info/latest.svg?style=flat-square)](https://www.npmjs.com/package/@gaomingzhao666/stack-info)
[![npm downloads](https://img.shields.io/npm/dm/@gaomingzhao666/stack-info.svg?style=flat-square)](https://www.npmjs.com/package/@gaomingzhao666/stack-info)
[![License](https://img.shields.io/npm/l/@gaomingzhao666/stack-info.svg?style=flat-square)](./LICENSE)

`@gaomingzhao666/stack-info`, a cross-platform, framework-agnostic CLI for inspecting web project stacks in command line.

## Output Example

```bash
|                      |                                                              |
| -------------------- | ------------------------------------------------------------ |
| **Project root**     | `C:/Users/Gmz/Desktop/reservation-app`                       |
| **Operating system** | `Windows 10.0.26100`                                         |
| **CPU**              | `AMD Ryzen 7 8745HS w/ Radeon 780M Graphics      (16 cores)` |
| **Node.js version**  | `v24.13.0`                                                   |
| **Package manager**  | `pnpm@10.13.1`                                               |
| **Builder**          | `Vite@^7.0.4`                                                |
| **Frameworks**       | `Vue@^3.5.17`                                                |
```

## Installation

```bash
pnpm add -G @gaomingzhao666/stack-info
```

```bash
npm install -G @gaomingzhao666/stack-info
```

```bash
yarn global add @gaomingzhao666/stack-info
```

```bash
bun add -g @gaomingzhao666/stack-info
```

## Print Stack Info for Current Project

```bash
pnpm @gaomingzhao666/stack-info info
```

```bash
npm run @gaomingzhao666/stack-info info
```

```bash
yarn @gaomingzhao666/stack-info info
```

```bash
bun @gaomingzhao666/stack-info info
```

## Features

### Detections

- Detects project root path.
- Detects popular web frameworks used in current project.
- Detects builder used in current project.
- Detects package manager used in current project.
- Detects runtime environment.
- Detects OS information.
- Detects CPU information.

### others

- Modern and global use.
- Provides a clean and formatted output in the terminal.
- Cross-platform support.

## License

[MIT](./LICENSE)
