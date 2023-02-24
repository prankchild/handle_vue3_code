const path = require("path");
const rollupPluginTypeScript = require("rollup-plugin-typescript2");
const rollupPluginJson = require("@rollup/plugin-json");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const rollupPluginCommonJS = require("@rollup/plugin-commonjs");

const packageFormats = process.env.FORMATS && process.env.FORMATS.split(",");
const sourcemap = process.env.SOURCE_MAP;
const target = process.env.TARGET;

// 需要根据target找到打包的目录
const packagesDir = path.resolve(__dirname, "packages");
// 要打包的目录
const packageDir = path.resolve(packagesDir, target);
//获取打包文件的名称
const name = path.basename(packageDir);

const resolve = (p) => path.resolve(packageDir, p);
// 获取打包文件的package.json
const pkg = require(resolve("package.json"));

const outputConfig = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: "esm",
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: "cjs",
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: "iife",
  },
};

const packageConfigs = packageFormats || pkg.buildOptions.formats;

function createConfig(format, output) {
  output.sourcemap = sourcemap;
  output.export = `named`;
  // 外部模块
  let external = [];
  if (format === "global") {
    output.name = pkg.buildOptions.name;
    output.globals = pkg.buildOptions.name;
  } else {
    external = [...Object.keys(pkg.dependencies)];
  }
  console.log("output", output);

  return {
    input: resolve(`src/index.ts`),
    output,
    external,
    plugins: [
      rollupPluginJson(),
      rollupPluginTypeScript(),
      rollupPluginCommonJS(),
      nodeResolve(),
    ],
  };
}
// 返回数组
module.exports = packageConfigs.map((format) =>
  createConfig(format, outputConfig[format])
);
