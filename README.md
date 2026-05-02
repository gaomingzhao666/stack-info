# Stack Info CLI

[![npm version](https://img.shields.io/npm/v/@gaomingzhao666/stack-info/latest.svg?style=flat-square)](https://www.npmjs.com/package/@gaomingzhao666/stack-info)
[![npm downloads](https://img.shields.io/npm/dm/@gaomingzhao666/stack-info.svg?style=flat-square)](https://www.npmjs.com/package/@gaomingzhao666/stack-info)
[![License](https://img.shields.io/npm/l/@gaomingzhao666/stack-info.svg?style=flat-square)](./LICENSE)

`@gaomingzhao666/stack-info`, a cross-platform, framework-agnostic CLI for inspecting web project stacks in command line.

## Output Example formatted by `Markdown`

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

## Print Stack Info for Current Project

```bash
pnpm dlx @gaomingzhao666/stack-info info
```

```bash
npx run @gaomingzhao666/stack-info info
```

```bash
yarn dlx @gaomingzhao666/stack-info info
```

```bash
bun dlx @gaomingzhao666/stack-info info
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
