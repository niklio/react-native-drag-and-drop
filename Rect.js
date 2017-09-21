export default class Rect {
  constructor({ x, y, width, height }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  overlaps(rect: Rect) {
    return (
      rect.x <= this.x + this.width &&
      rect.x + rect.width >= this.x &&
      rect.y <= this.y + this.height &&
      rect.y + rect.height >= this.y
    );
  }
}
