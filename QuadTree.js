import type Rect from './Rect';

export default class QuadTree {
  constructor({ bounds, maxObjects = 10, maxLevels = 4, level = 0 }): void {
    this.bounds = bounds;
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;

    this.objects = [];
    this.nodes = [];
  }

  split(): void {
    const splitWidth = Math.round(this.bounds.width / 2);
    const splitHeight = Math.round(this.bounds.width / 2);

    const splitBounds: Array<Rect> = [
      {
        x: this.bounds.x + splitWidth,
        y: this.bounds.y + splitHeight,
        width: splitWidth,
        height: splitHeight,
      },
      {
        x: this.bounds.x,
        y: this.bounds.y,
        width: splitWidth,
        height: splitHeight,
      },
      {
        x: this.bounds.x,
        y: this.bounds.y + splitHeight,
        width: splitWidth,
        height: splitHeight,
      },
      {
        x: this.bounds.x + splitWidth,
        y: this.bounds.y,
        width: splitWidth,
        height: splitHeight,
      },
    ];
    this.nodes = splitBounds.map(
      bounds =>
        new QuadTree({
          bounds,
          maxObjects: this.maxObjects,
          maxLevels: this.maxLevels,
          level: this.level + 1,
        })
    );
  }

  divide(): void {
    var objectIdx = 0,
      nodeIdx;
    if (!this.nodes) {
      this.split();
    }
    while (objectIdx < this.objects.length) {
      nodeIdx = this.getIndex(this.objects[objectIdx]);
      if (nodeIdx != -1) {
        this.nodes[nodeIdx].insert(this.objects.splice(objectIdx, 1)[0]);
      } else {
        objectIdx++;
      }
    }
  }

  getIndex(rect: Rect): Number {
    const midpoint = {
      x: this.bounds.x + this.bounds.width / 2,
      y: this.bounds.y + this.bounds.height / 2,
    };

    const isTop = rect.y + rect.height < midpoint.y;
    const isBottom = rect.y > midpoint.y;
    const isLeft = rect.x + rect.width < midpoint.x;
    const isRight = rect.x > midpoint.x;

    if (isTop && isRight) return 0;
    else if (isTop && isLeft) return 1;
    else if (isBottom && isLeft) return 2;
    else if (isBottom && isRight) return 3;
    else return -1;
  }

  insert(rect: Rect): void {
    var index;
    if (this.nodes) {
      index = this.getIndex(rect);
      if (index != -1) {
        this.nodes[index].insert(rect);
        return;
      }
    }

    this.objects.push(rect);
    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      this.divide();
    }
  }

  retrieve(rect: Rect): Array<Rect> {
    /**
     * Search current level
     */
    var object,
      ret = [];
    for (var objectIdx = 0; objectIdx < this.objects.length; objectIdx++) {
      object = this.objects[objectIdx];
      if (rect.overlaps(object)) {
        ret.push(object);
      }
    }

    /**
     * Recursive subtree descent
     */
    var nodeIdx = this.getIndex(rect);
    if (this.nodes) {
      if (nodeIdx != -1) {
        ret = ret.concat(this.nodes[nodeIdx].retrieve(rect));
      } else {
        for (nodeIdx = 0; nodeIdx < this.nodes.length; nodeIdx++) {
          ret = ret.concat(this.nodes[i].retrieve(rect));
        }
      }
    }
    return ret;
  }

  count(): Number {
    var ret = this.objects.length;

    var node;
    for (var nodeIdx = 0; nodeIdx < this.nodes.length; nodeIdx++) {
      node = this.nodes[nodeIdx];
      if (node != null) {
        ret += node.count();
      }
    }

    return ret;
  }

  clear(): void {
    this.objects = [];
    for (var node in this.nodes) {
      node.clear;
    }
    this.nodes = [];
  }
}
