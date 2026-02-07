import blessed from "blessed";

export class CommandInput {
  #handlers = [];
  box;

  constructor({ screen, height = 3 }) {
    this.box = blessed.textbox({
      bottom: 0,
      left: 0,
      height,
      width: "100%",
      border: "line",
      label: " Command ",
      inputOnFocus: true,
      keys: true,
      mouse: true
    });

    this.box.on("submit", (value) => {
      const cmd = value.trim();
      this.box.clearValue();
      screen.render();

      if (!cmd) return;
      for (const fn of this.#handlers) fn(cmd);
    });
  }

  onCommand(fn) {
    this.#handlers.push(fn);
  }

  focus() {
    this.box.focus();
  }
}