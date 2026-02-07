import blessed from "blessed";
import { CommandInput } from "./commandInput.js";

export function createUI(NodecatConfig) {
  const INPUT_HEIGHT = 3;

  const screen = blessed.screen({
    smartCSR: true,
    title: "Nodecat CLI",
    fullUnicode: true,
    unicode: true
  });

  screen.key(["C-c", "q"], () => process.exit(0));

  // ===== 顶部固定栏 =====
  const header = blessed.box({
    top: 0,
    left: 0,
    height: 1,
    width: "100%",
    tags: false,
    style: {
      fg: "white",
      bg: "blue"
    },
    content: ` QQ: ${NodecatConfig.Bot.QQ} | Bot: ${NodecatConfig.Bot.Name} `
  });

  // ===== 中间日志区（不会侵占上下）=====
  const logBox = blessed.log({
    top: 1,
    bottom: INPUT_HEIGHT,
    left: 0,
    width: "100%",
    border: "line",
    label: " Console ",
    tags: false,
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    mouse: true
  });

  // ===== 底部输入框 =====
  const commandInput = new CommandInput({
    screen,
    height: INPUT_HEIGHT
  });

  // ===== console 重定向 =====
  const rawLog = console.log;
  console.log = (...args) => {
    logBox.log(args.join(" "));
    screen.render();
    rawLog(...args);
  };

  screen.append(header);
  screen.append(logBox);
  screen.append(commandInput.box);

  commandInput.focus();
  screen.render();

  return {
    screen,
    logBox,
    commandInput
  };
}