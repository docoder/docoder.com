---
title: Rollup
date: "2019-08-14"
---

## Overview

- Rollup 是前端模块化的一个打包工具，可以将小块代码编译成大块复杂的代码，例如 library 或应用程序。
- Rollup 对代码模块可以使用新的标准化格式，如：ES6，而不是先前的解决方案，如：CommonJS 和 AMD。
- Rollup 被广泛用于 Javascript libraries 的打包

## Quick Start

- [rollup-starter-lib](https://github.com/rollup/rollup-starter-lib)

- [rollup-starter-app](https://github.com/rollup/rollup-starter-app)

### For the browser

```bash
# compile to a <script> containing a self-executing function ('iife')
$ rollup main.js --flie bundle.js --format iife
```

### For Node.js

```bash
# compile to a CommonJS module ('cjs')
$ rollup main.js --file bundle.js --format cjs
```

### For browsers and Node.js

```bash
# UMD format requires a bundle name
$ rollup main.js --file bundle.js --format umd --name "myBundle"
```

### For es module

```bash
$ rollup ./src/main.js --file ./dist/bundle.js --format es
```

## Why Rollup

### Tree-shaking

- 也称为：live code inclusion

- 使用 Rollup 处理代码模块, 采用 ES6 标准（使用 `import/export`），可以对模块文件进行静态分析，并可以排除任何未实际使用的代码
- 为什么 ES Module 要优于 CommonJS
  - ES Module 是官方标准，有一个直接清晰的发展方向
  - CommonJS 只是在 ES Module 出现之前的一个特殊的暂时性的传统E标准
  - ES Module 可以对文件进行静态分析，进行 Tree-shaking 优化
  - ES Module 提供了更高级的特性，如，循环引用和动态绑定
  - [Rollup ES6 modules Playgroup](https://rollupjs.org/repl/?version=1.19.4&shareable=JTdCJTIybW9kdWxlcyUyMiUzQSU1QiU3QiUyMm5hbWUlMjIlM0ElMjJtYWluLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMiUyRiolMjBEWU5BTUlDJTIwSU1QT1JUUyU1Q24lMjAlMjAlMjBSb2xsdXAlMjBzdXBwb3J0cyUyMGF1dG9tYXRpYyUyMGNodW5raW5nJTIwYW5kJTIwbGF6eS1sb2FkaW5nJTVDbiUyMCUyMCUyMHZpYSUyMGR5bmFtaWMlMjBpbXBvcnRzJTIwdXRpbGl6aW5nJTIwdGhlJTIwaW1wb3J0JTIwbWVjaGFuaXNtJTVDbiUyMCUyMCUyMG9mJTIwdGhlJTIwaG9zdCUyMHN5c3RlbS4lMjAqJTJGJTVDbmlmJTIwKGRpc3BsYXlNYXRoKSUyMCU3QiU1Q24lNUN0aW1wb3J0KCcuJTJGbWF0aHMuanMnKS50aGVuKGZ1bmN0aW9uJTIwKG1hdGhzKSUyMCU3QiU1Q24lNUN0JTVDdGNvbnNvbGUubG9nKG1hdGhzLnNxdWFyZSg1KSklM0IlNUNuJTVDdCU1Q3Rjb25zb2xlLmxvZyhtYXRocy5jdWJlKDUpKSUzQiU1Q24lNUN0JTdEKSUzQiU1Q24lN0QlMjIlMkMlMjJpc0VudHJ5JTIyJTNBdHJ1ZSU3RCUyQyU3QiUyMm5hbWUlMjIlM0ElMjJtYXRocy5qcyUyMiUyQyUyMmNvZGUlMjIlM0ElMjJpbXBvcnQlMjBzcXVhcmUlMjBmcm9tJTIwJy4lMkZzcXVhcmUuanMnJTNCJTVDbiU1Q25leHBvcnQlMjAlN0JkZWZhdWx0JTIwYXMlMjBzcXVhcmUlN0QlMjBmcm9tJTIwJy4lMkZzcXVhcmUuanMnJTNCJTVDbiU1Q25leHBvcnQlMjBmdW5jdGlvbiUyMGN1YmUlMjAoeCUyMCklMjAlN0IlNUNuJTVDdHJldHVybiUyMHNxdWFyZSh4KSUyMColMjB4JTNCJTVDbiU3RCUyMiUyQyUyMmlzRW50cnklMjIlM0FmYWxzZSU3RCUyQyU3QiUyMm5hbWUlMjIlM0ElMjJzcXVhcmUuanMlMjIlMkMlMjJjb2RlJTIyJTNBJTIyZXhwb3J0JTIwZGVmYXVsdCUyMGZ1bmN0aW9uJTIwc3F1YXJlJTIwKCUyMHglMjApJTIwJTdCJTVDbiU1Q3RyZXR1cm4lMjB4JTIwKiUyMHglM0IlNUNuJTdEJTIyJTJDJTIyaXNFbnRyeSUyMiUzQWZhbHNlJTdEJTVEJTJDJTIyb3B0aW9ucyUyMiUzQSU3QiUyMmZvcm1hdCUyMiUzQSUyMmFtZCUyMiUyQyUyMm5hbWUlMjIlM0ElMjJteUJ1bmRsZSUyMiUyQyUyMmFtZCUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyJTIyJTdEJTJDJTIyZ2xvYmFscyUyMiUzQSU3QiU3RCU3RCUyQyUyMmV4YW1wbGUlMjIlM0ElMjIwMCUyMiU3RA==)

```js
// 使用 CommonJS，必须导入整个库

// Import a full utils object using CommonJS
var utils = require( 'utils' );
var query = 'Rollup';
// Use the ajax method of the utils object
utils.ajax( 'https://api.example.com?search=' + query ).then( handleResponse );

// 使用 ES6 module，无须导入整个库

// Import ajax function using the ES6 import statement
import { ajax } from 'utils';
var query = 'Rollup';
// Calling ajax function
ajax( 'https://api.example.com?search=' + query ).then( handleResponse );
```

### Use Rollup in a CommonJS module

- Rollup 坚定支持 ES module，CommonJS 没有在 Rollup kernel 中。
- 需要使用插件 `rollup-plugin-commonjs` ，来将其转换为 ES Module，前提还需要安装和引入 `rollup-plugin-node-resolve` 插件，原因是 Rollup 不同于 Webpack 和 Browserify，它不知道如何处理模块中的依赖，所以 `rollup-plugin-node-resolve` 插件可以告诉 Rollup 如何查找外部模块。
- 目前大部分的 npm 包都是以 commonjs 模块形式出现的，以防万一，还是需要安装和引入插件 `rollup-plugin-commonjs` 。另外，为了防止其他插件的改变破坏 commonjs 的检测，`rollup-plugin-commonjs` 应该用在其他插件转换模块之前。

### Use it over Webpack ?

- A number of open-source projects use it over Webpack

- Webpack 获得了巨大成功，每月有百万级的下载，赋能了成千上万的网站和应用，有巨大的生态和[资金支持](https://opencollective.com/webpack)，相比之下，Rollup 无足轻重

- Facebook 采用 Rollup 来实现 React 的 build process，merge 了大量 pull request

  ![](./react-rollup.png)

- Vue, Ember, Preact, D3, Three.js, Moment, and dozens of other well-known libraries also use Rollup

- Rollup 以不同的目的被创建，Rollup 目的是要尽可能的高效的构建扁平的可分配的 Javascript libraries，充分使用 ES Module 的优点, 会将所有代码放在同一个位置统一进行验证，更快的生成更轻量级的代码。Rollup 不支持 `code-splitting`，`HMR`，而且处理 CommonJS 时需要插件。

- Webpack 支持 `code-splitting` , 实现了一个浏览器友好的 `require` ，将每个模块一个接一个的验证再打包。如果需要  on-demand loading，会很好；否则会造成性能浪费，尤其如果打包大量模块时，性能较差。

#### 结论：

**Use webpack for apps, and Rollup for libraries**

- 如果你需要 code-splitting，有很多  static assets，需要使用很多 CommonJS 依赖，使用 Webpack
- 如果你的 codebase 是ES Module，写一些给其他人使用的代码或库，那么使用 Rollup

## pkg.module

- 未来，ES Module ( `import` 和 `export`) 会使统一标准，库的使用也会无缝。但现在很多浏览器以及 Node.js 不支持 `import` 和 `export` , 需要使用 UMD 或 CommonJS (Nodejs)
- 在 `package.json` 文件中增加 `"module": "dist/my-library.es.js"` , 可以同时更好的支持 UMD 和 ES Module
- Webpack 和 Rollup 都会利用 `pkg.module` 来尽可能生成更高效的代码, 在某些情况下都会 tree-shaking

## Example: Create a Typescript and React Module

[**ALL JS LIBRARIES** SHOULD BE AUTHORED IN **TYPESCRIPT**](https://staltz.com/all-js-libraries-should-be-authored-in-typescript.html)

### Install

```bash
$ yarn add typescript rollup rollup-plugin-typescript2 rollup-plugin-commonjs  rollup-plugin-peer-deps-external rollup-plugin-node-resolve --dev

$ yarn add react @types/react --dev
$ yarn add react-dom @types/react-dom --dev
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "outDir": "build",
    "module": "esnext",
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "sourceMap": true,
    "allowJs": false,
    "jsx": "react",
    "declaration": true, // 自动生成 .d.ts
    "moduleResolution": "node",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "resolveJsonModule": true,
    "downlevelIteration": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"], // 查找 ts 文件路径
  "exclude": ["node_modules", "build"] // 排出路径避免 build
}
```

### rollup.config.js

```js
import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import resolve from "rollup-plugin-node-resolve";

import pkg from "./package.json";

export default {
  input: "src/index.tsx",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      // exports: "named",
      sourcemap: true
    },
    {
      file: pkg.module,
      format: "es",
      // exports: "named",
      sourcemap: true
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: [
    commonjs({  // 置于最前 ( 否则可能需要配置 namedExports 才能阻止保错 )
      include: ["node_modules/**"],
    }),
    external(),
    resolve(),
    typescript({
      rollupCommonJSResolveHack: true,
      exclude: "**/__tests__/**",
      clean: true
    })
  ]
};
```

### package.json

```json
{
  "name": "...",
  "version": "...",
  "description": "...",
  "author": "...",
  "main": "build/index.js",
  "module": "build/index.es.js", // pkg.module
  "jsnext:main": "build/index.es.js",
  "types": "build/index.d.ts",
  "license": "...",
  "repository": "...",
  "keywords": ['...', '...'],
  "scripts": {
    "build": "rollup -c",
    "start": "rollup -c -w",
    "prepare": "npm run build" // npm publish 时会先调用进行打包
  },
  "files": [ // 仅 build 文件夹被打包进库里
    "build"
  ],
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "dependencies": {
    ...
  },
  "devDependencies": {
    "@types/react": "^16.8.23",
    "@types/react-dom": "^16.8.4",
    "react": "^16.8.6",
    "react-dom": "^16.8.6",
    "rollup": "^1.16.6",
    "rollup-plugin-commonjs": "^10.0.1",
    "rollup-plugin-node-resolve": "^5.2.0",
    "rollup-plugin-peer-deps-external": "^2.2.0",
    "rollup-plugin-typescript2": "^0.21.2",
    "typescript": "^3.5.2"
  }
}
```

### Developing locally

```bash
# 在开发的库文件目录下
$ yarn link # 会在全局生成一个 link 文件 (如：.nvm/versions/node/v10.15.3/lib/node_modules/your-package-name)，link 到此库文件目录

# 在要使用库的 example project 文件目录下
$ yarn link your-package-name # link 到全局的 link 文件，从而又 link 到开发的库文件目录

# Fix Duplicate React: https://github.com/facebook/react/issues/15315#issuecomment-479802153
$ npm link ../example/node_modules/react
```

