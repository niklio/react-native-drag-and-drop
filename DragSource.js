import React from 'react';
import { findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';
import Rect from './Rect';
import QuadTree from './QuadTree';

export class DragSource extends Rect {
  constructor({ target, ...otherProps }) {
    super(otherProps);
    this.target = target;
  }
}

export class DragSourceRegistry {
  constructor() {
    this.dragSources = new QuadTree({
      bounds: { x: 300, y: 1000 },
    });
  }

  insert(dragSource: DragSource): void {
    this.dragSources.insert(dragSource);
  }

  retrieve(rect: Rect): DragSource {
    return this.dragSources.retrieve(rect);
  }

  count(): Number {
    return this.dragSources.count();
  }
}

export function registerDragSource() {
  return function wrapper(WrappedComponent) {
    return class extends WrappedComponent {
      static contextTypes = {
        registerDragSource: PropTypes.func,
      };

      constructor(props) {
        super(props);

        if (typeof this.onDrag == 'function')
          this.onDrag = this.onDrag.bind(this);
      }

      componentDidMount() {
        const dragSourceNode = findNodeHandle(this.refs.dragSourceRef);
        this.context.registerDragSource(dragSourceNode);
      }

      render() {
        const elementsTree = super.render();
        let newProps = {
          ref: 'dragSourceRef',
          onDrag: this.onDrag,
        };
        const props = Object.assign({}, elementsTree.props, newProps);
        const newElementsTree = React.cloneElement(
          elementsTree,
          props,
          elementsTree.props.children
        );
        return newElementsTree;
      }
    };
  };
}
