// minimist 可以获取到命令
const minimist = require("minimist");

const execa = require("execa");

const args = minimist(process.argv.slice(2));

const target = args._.length ? args._[0] : "reactivity";
const formats = args.f || "global";
const sourcemap = args.s || false;

execa(
  "rollup",
  [
    "-wc",
    "--environment",
    [
      `TARGET:${target}`,
      `FORMATS:${formats}`,
      sourcemap ? `SOURCE_MAP:${sourcemap}` : "",
    ]
      .filter(Boolean)
      .join(","),
  ],
  {
    stdio: "inherit", // 这个子进程是在命令行中输出
  }
);
