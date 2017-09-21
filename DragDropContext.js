import React, { Component } from 'react';
import { findNodeHandle, PanResponder, UIManager } from 'react-native';
import ReactNativeComponentTree from 'react-native/Libraries/Renderer/shims/ReactNativeComponentTree';
import PropTypes from 'prop-types';
import styled from 'styled-components/native';
import Rect from './Rect';
import { DragSource, DragSourceRegistry } from './DragSource';
import { DropTarget, DropTargetRegistry } from './DropTarget';

export function registerDragDropContext(
  {
    dragSourceHeight = 0,
    dragSourceWidth = 0,
    dropTargetHeight = 0,
    dropTargetWidth = 0,
  } = {}
) {
  return function wrapper(WrappedComponent) {
    return class extends WrappedComponent {
      static childContextTypes = {
        registerDragSource: PropTypes.func,
        registerDropTarget: PropTypes.func,
      };

      constructor(props) {
        super(props);

        if (typeof this.onDrag == 'function')
          this.onDrag = this.onDrag.bind(this);
        if (typeof this.onDrop == 'function')
          this.onDrop = this.onDrop.bind(this);

        this.unregisteredDragSourceNodes = [];
        this.dragSourceRegistry = new DragSourceRegistry();

        this.unregisteredDropTargetNodes = [];
        this.dropTargetRegistry = new DropTargetRegistry();
      }

      componentWillMount() {
        this.panResponder = PanResponder.create({
          onStartShouldSetPanResponder: (evt, gestureState) => true,
          onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
          onMoveShouldSetPanResponder: (evt, gestureState) => true,
          onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

          onPanResponderGrant: (evt, gestureState) => {
            const { nativeEvent: { locationX, locationY } } = evt;

            /**
             * Lookup drag source elements
             */
            const x0 = locationX - dragSourceWidth / 2;
            const y0 = locationY - dragSourceHeight / 2;
            const rect0 = new Rect({
              x: x0,
              y: y0,
              width: dragSourceWidth,
              height: dragSourceHeight,
            });

            const dragSources = this.dragSourceRegistry.retrieve(rect0);
            const dragSourceElements = dragSources
              .map(dragSource => {
                let dragSourceNode = dragSource.target;
                let dragSourceInstance = ReactNativeComponentTree.getInstanceFromNode(
                  dragSourceNode
                );
                return (
                  dragSourceInstance != null &&
                  dragSourceInstance._currentElement
                );
              })
              .filter(dragSourceElement => dragSourceElement);

            /**
             * Call dragDropContext's onDrop method
             */
            if (typeof this.onDrop == 'function')
              this.onDrag({
                dragSources: dragSourceElements,
                startLocation: { x: x0, y: y0 },
              });
          },
          onPanResponderMove: (evt, gestureState) => {},
          onPanResponderTerminationRequest: (evt, gestureState) => true,
          onPanResponderRelease: (evt, gestureState) => {
            const { nativeEvent: { locationX, locationY } } = evt;
            const { dx, dy } = gestureState;

            /**
             * Lookup drag source elements
             */
            const x0 = locationX - dx - dragSourceWidth / 2;
            const y0 = locationY - dy - dragSourceHeight / 2;
            const rect0 = new Rect({
              x: x0,
              y: y0,
              width: dragSourceWidth,
              height: dragSourceHeight,
            });

            const dragSources = this.dragSourceRegistry.retrieve(rect0);
            const dragSourceElements = dragSources
              .map(dragSource => {
                let dragSourceNode = dragSource.target;
                let dragSourceInstance = ReactNativeComponentTree.getInstanceFromNode(
                  dragSourceNode
                );
                return (
                  dragSourceInstance != null &&
                  dragSourceInstance._currentElement
                );
              })
              .filter(dragSourceElement => dragSourceElement);

            /**
             * Lookup drop target elements
             */
            const x1 = locationX - dropTargetWidth / 2;
            const y1 = locationY - dropTargetHeight / 2;
            const rect1 = new Rect({
              x: x1,
              y: y1,
              width: dropTargetWidth,
              height: dropTargetHeight,
            });

            const dropTargets = this.dropTargetRegistry.retrieve(rect1);
            const dropTargetElements = dropTargets
              .map(dropTarget => {
                let dropTargetNode = dropTarget.target;
                let dropTargetInstance = ReactNativeComponentTree.getInstanceFromNode(
                  dropTargetNode
                );
                return (
                  dropTargetInstance != null &&
                  dropTargetInstance._currentElement
                );
              })
              .filter(dropTargetElement => dropTargetElement);

            /**
             * Call dragDropContext's onDrop handler
             */
            if (typeof this.onDrop == 'function')
              this.onDrop({
                dragSources: dragSourceElements,
                dropTargets: dropTargetElements,
                startLocation: { x: x0, y: y0 },
                endLocation: { x: x1, y: y1 },
              });
          },
          onPanResponderTerminate: (evt, gestureState) => {},
          onShouldBlockNativeResponder: (evt, gestureState) => {
            return true;
          },
        });
      }

      componentDidMount() {
        var dragSourceNodeIdx, dragSourceNode;
        for (
          dragSourceNodeIdx = 0;
          dragSourceNodeIdx < this.unregisteredDragSourceNodes.length;
          dragSourceNodeIdx++
        ) {
          dragSourceNode = this.unregisteredDragSourceNodes[dragSourceNodeIdx];
          this.registerDragSourceNode(dragSourceNode);
        }

        var dropTargetNodeIdx, dropTargetNode;
        for (
          dropTargetNodeIdx = 0;
          dropTargetNodeIdx < this.unregisteredDropTargetNodes.length;
          dropTargetNodeIdx++
        ) {
          dropTargetNode = this.unregisteredDropTargetNodes[dropTargetNodeIdx];
          this.registerDropTargetNode(dropTargetNode);
        }
      }

      registerDragSourceNode = dragSourceNode => {
        this.measureLayout(dragSourceNode, (x, y, width, height) => {
          let dragSource = new DragSource({
            x,
            y,
            width,
            height,
            target: dragSourceNode,
          });
          this.dragSourceRegistry.insert(dragSource);
        });
      };

      registerDropTargetNode = dropTargetNode => {
        this.measureLayout(dropTargetNode, (x, y, width, height) => {
          let dropTarget = new DropTarget({
            x,
            y,
            width,
            height,
            target: dropTargetNode,
          });
          this.dropTargetRegistry.insert(dropTarget);
        });
      };

      measureLayout = (child: Number, callback: PropTypes.func) => {
        setTimeout(() => {
          /**
           * The components arent fullt loaded when componentDidMount is called.
           * Wrapping this call to measureLayout in a setTimeout with duration 0
           * forces the measurement into the event loop where it wont error out
           */
          const dragDropContextRef = this.refs.dragDropContextRef;
          const dragDropContextNode = findNodeHandle(dragDropContextRef);
          UIManager.measureLayout(
            child,
            dragDropContextNode,
            e => console.log('ERROR', e),
            callback
          );
        }, 0);
      };

      registerDragSource = (dragSource: Number) => {
        if (this.refs.dragDropContextRef == null) {
          this.unregisteredDragSourceNodes.push(dragSource);
        } else {
          this.registerDragSourceNode(dragSource);
        }
      };

      registerDropTarget = (dropTarget: Number) => {
        if (this.refs.dragDropContextRef == null) {
          this.unregisteredDropTargetNodes.push(dropTarget);
        } else {
          this.registerDropTargetNode(dropTarget);
        }
      };

      getChildContext() {
        return {
          registerDragSource: this.registerDragSource,
          registerDropTarget: this.registerDropTarget,
        };
      }

      render() {
        const elementsTree = super.render();
        let newProps = {
          ref: 'dragDropContextRef',
          pointerEvents: 'box-only',
          ...this.panResponder.panHandlers,
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
