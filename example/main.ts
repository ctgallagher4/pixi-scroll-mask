import { Application, Graphics } from "pixi.js";
import { ScrollMask } from "../src/index";

(async () => {
  // create a canvas for the application
  const canvas = document.createElement("canvas");
  // create the application
  const app = new Application();
  // initialize the application
  await app.init({
    canvas: canvas,
    resizeTo: window,
    backgroundColor: "#000000",
  });

  // append the canvas to the document body
  document.body.appendChild(app.canvas);

  // creat a window and set its x and y coordinates to the middle of the screen
  const win = new ScrollMask({
    width: 100,
    height: 100,
    globalScroll: true,
  });
  win.x = app.renderer.width / 2 - 50;
  win.y = app.renderer.height / 2 - 50;

  // add the window to the stage
  app.stage.addChild(win);

  // define the x and y scroll positions relative to the top-left
  // of the scrolling container
  let x = 0;
  let y = 0;

  // add a wheel event listener
  document.addEventListener("wheel", (event: WheelEvent) => {
    // if the shift key is pressed scroll left <-> right
    if (event.shiftKey) {
      x += event.deltaY / 100;
      // otherwise scroll up <-> down
    } else {
      y += event.deltaY / 100;
    }
    win.scrollToPosition({ x, y });
  });

  // create an object to view through the window
  const square = new Graphics().rect(25, 25, 50, 50).fill({ color: "red" });

  // create a border for thewindow so we know where the window is
  const windowBorder = new Graphics()
    .rect(win.x, win.y, 100, 100)
    .stroke({ color: "green" });

  // add the object to the window and the border to the stage
  app.stage.addChild(windowBorder);
  win.addScrollableChild(square);
})();
