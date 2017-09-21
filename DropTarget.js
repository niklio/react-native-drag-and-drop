import React, { Component } from 'react';
import { findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';
import Rect from './Rect';
import QuadTree from './QuadTree';

export class DropTarget extends Rect {
  constructor({ target, ...otherProps }) {
    super(otherProps);
    this.target = target;
  }
}

export class DropTargetRegistry {
  constructor() {
    this.dropTargets = new QuadTree({
      bounds: { x: 300, y: 1000 },
    });
  }

  insert(dropTarget: DropTarget): void {
    this.dropTargets.insert(dropTarget);
  }

  retrieve(rect: Rect): DropTarget {
    return this.dropTargets.retrieve(rect);
  }
}

export function registerDropTarget() {
  return function wrapper(WrappedComponent) {
    return class extends WrappedComponent {
      static contextTypes = {
        registerDropTarget: PropTypes.func,
      };

      constructor(props) {
        super(props);

        if (typeof this.onDrop == 'function')
          this.onDrop = this.onDrop.bind(this);
      }

      componentDidMount() {
        const dropTargetNode = findNodeHandle(this.refs.dropTargetRef);
        this.context.registerDropTarget(dropTargetNode);
      }

      render() {
        const elementsTree = super.render();
        let newProps = {
          ref: 'dropTargetRef',
          onDrop: this.onDrop,
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
