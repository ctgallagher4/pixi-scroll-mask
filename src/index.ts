import { ScrollBox, ScrollBoxOptions } from "@pixi/ui";
import { Container, ContainerChild, IRenderLayer, PointData } from "pixi.js";

/**
 * Fixed window view with internally scrollable container.
 */
export class ScrollMask extends Container {
  private _unblockedScrollBox: UnblockedScrollBox;
  private _container = new Container();

  constructor(scrollBoxOptions?: ScrollBoxOptions) {
    super();
    this._unblockedScrollBox = new UnblockedScrollBox(scrollBoxOptions);
    this._unblockedScrollBox.addItem(this._container);
    this.addChild(this._unblockedScrollBox);
  }

  addScrollableChild<U extends (ContainerChild | IRenderLayer)[]>(
    ...children: U
  ): U[0] {
    this._container.addChild(...children);
    return children[0];
  }

  /** Current scroll on the y-axis */
  get scrollY(): number {
    return this._container.y;
  }

  /** Current scroll on the y-axis */
  set scrollY(val: number) {
    this._container.y = val;
  }

  /** Current scroll on the x-axis */
  get scrollX(): number {
    return this._container.x;
  }

  /** Current scroll on the x-axis */
  set scrollX(val: number) {
    this._container.x = val;
  }

  /**
   * Scrolls to the given position.
   * @param position - x and y position object.
   * @param position.x - x position.
   * @param position.y - y position.
   */
  scrollToPosition({ x, y }: Partial<PointData>) {
    if (x) {
      this._container.x = x;
    }
    if (y) {
      this._container.y = y;
    }
  }
}

/**
 * Infinitely scrollable `ScrollBox`. No longer bound by size.
 */
class UnblockedScrollBox extends ScrollBox {
  private _container = new Container();

  /**
   * @param options {ScrollBoxOptions}
   */
  constructor(options?: ScrollBoxOptions) {
    super(options);
  }

  /**
   * Adds one or more items to a scrollable list.
   * @param {Container} items - one or more items to add.
   */
  override addItem<T extends Container[]>(...items: T): T[0] {
    // Original method from https://github.com/pixijs/ui/
    // Licensed under MIT. Modified by Charlie Gallagher to change the behavior
    // of the scroll so that it could scroll infinitely.
    if (items.length > 1) {
      items.forEach((item) => this.addItem(item));
    } else {
      const child = items[0];

      child.eventMode = "static";

      this.list.addChild(child);
      this.proximityStatusCache.push(false);

      if (!this.options.disableDynamicRendering) {
        child.renderable = this.isItemVisible(child);
      }
    }

    this.resize();

    return items[0];
  }

  protected override onMouseScroll(event: WheelEvent) {
    // Original method from https://github.com/pixijs/ui/
    // Licensed under MIT. Modified by Charlie Gallagher to change the behavior
    // of the scroll so that it could scroll infinitely.

    if (!this.options.globalScroll) return;

    this.renderAllItems();

    const shiftScroll = !!this.options.shiftScroll;
    const scrollOnX = shiftScroll
      ? typeof event.deltaX !== "undefined" ||
        typeof event.deltaY !== "undefined"
      : typeof event.deltaX !== "undefined";
    const scrollOnY = typeof event.deltaY !== "undefined";

    if ((this.isHorizontal || this.isBidirectional) && scrollOnX) {
      const delta =
        shiftScroll || this.isBidirectional ? event.deltaX : event.deltaY;
      const targetPos = this.list.x - delta;

      if (this.listWidth < this._width) {
        this._trackpad.xAxis.value = 0;
      } else {
        const min = this._width - this.listWidth;
        const max = 0;

        this._trackpad.xAxis.value = Math.min(max, Math.max(min, targetPos));
      }
    }

    if ((this.isVertical || this.isBidirectional) && scrollOnY) {
      const targetPos = this.list.y - event.deltaY;

      if (this.listHeight < this._height) {
        this._trackpad.yAxis.value = 0;
      } else {
        const min = this._height - this.listHeight;
        const max = 0;

        this._trackpad.yAxis.value = Math.min(max, Math.max(min, targetPos));
      }
    }

    if (this.isBidirectional && (scrollOnX || scrollOnY)) {
      this.onScroll?.emit({
        x: this._trackpad.xAxis.value,
        y: this._trackpad.yAxis.value,
      });
    } else if (this.isHorizontal && scrollOnX) {
      this.onScroll?.emit(this._trackpad.xAxis.value);
    } else if (this.isVertical && scrollOnY) {
      this.onScroll?.emit(this._trackpad.yAxis.value);
    }
    this.stopRenderHiddenItems();
  }
}
