React native drag and drop is a collection of flexible higher order components to implement drag and drop interfaces.

## Installation
```
npm install --save react-native-drag-and-drop
```

## Example
```
import React, { Component } from 'react';
import { View } from 'react-native'
import PropTypes from 'prop-types';
import {
  registerDragDropContext,
  registerDragSource,
} from 'react-native-drag-drop';

class Checker extends Component {
  render() {
    return (
      <View style={{
        height: 50,
        width: 50,
        borderRadius: 50,
        color: 'red'
       }} />
    );
  }
}

const DraggableChecker = registerDragSource(Checker);

class CheckerBoard extends Component {
  render() {
    return (
      <View style={{
        height: 400,
        width: 400,
        color: 'black'
      }}>
        {this.props.children}
      </View>
    );
  }
}

const DragDropCheckerBoard = registerDragDropContext(CheckerBoard);

export default class App extends Component {
  onDrag({dragSources}) {
    console.log(`The following checkers are being dragged: ${dragSources}`)
  }

  render() {
    return (
      <DragDropCheckerBoard>
        <DraggableChecker />
        <DraggableChecker />
        <DraggableChecker />
      </DragDropCheckerBoard>
    )
  }
}
```

## API
Use higher order components implement drag and drop functionality

#### DragDropContext
Wrap a component with `registerDragDropContext()(MyComponent)` to access the `onDrag` and `onDrop` hooks.

`onDrag`
*Parameters:*
```
PropTypes.shape({
  dragSources: PropTypes.arrayOf(PropTypes.element),
  startLocation: PropTypes.shape({x: PropTypes.number, y: PropTypes.number}))
})
```

`onDrop`
*Parameters:*
```
PropTypes.shape({
  dragSources: PropTypes.arrayOf(PropTypes.element),
  dropTargets: PropTypes.arrayOf(PropTypes.element),
  startLocation: PropTypes.shape({x: PropTypes.number, y: PropTypes.number}),
  endLocation: PropTypes.shape({x: PropTypes.number, y: PropTypes.number})
})
```

*Usage:*
```
class MyParent extends Component {
  onDrag({dragSources, startLocation}) {
    console.log(`One or more dragSources is being dragged`)
  }
  onDrop({dragSources, dropTargets, startLocation, endLocation}) {
    console.log(`One or more dragSources was dropped onto a dropTarget`)
  }
  render() {
    return this.props.children;
  }
}
export default MyDragDropParent = registerDragDropContext()(MyParent);
```

#### DragSource
Wrap a component with `registerDragSource()(MyComponent) for a drag event starting on that component to trigger the `onDrag` method on a `DragDropContext` parent component.
*Usage:*
```
class MyChild extends Component {
  render() {
    return (
      <View />
    );
  }
}
const MyDraggableChild = registerDragSource()(MyChild);

class MyParent extends Component {
  onDrag() {
    console.log("An instance of the MyDraggableChild component was just dragged")
  }
  render() {
    return (
      <View>
        <View />
        <MyDraggableChild />
      </View>
    );
  }
}
export default MyDragDropParent = registerDragDropContext()(MyParent)
```

#### DropTarget
Wrap a component with `registerDropTarget()(MyChild)` to trigger the `onDrop` method on the `DragDropContext` parent whenever a `DragSource` is dropped onto a `DropTarget`
*Usage:*
```
class MyChild extends Component {
  render() {
    return (
      <View />
    );
  }
}
const MyDraggableChild = registerDragSource()(MyChild);
const MyDropTargetChild = registerDropTarget(MyChild);

class MyParent extends Component {
  onDrop() {
    console.log("An instance of the MyDraggableChild component was just dropped onto an instance of MyDropTargetChild")
  }
  render() {
    return (
      <View>
        <View />
        <MyDraggableChild />
        <MyDropTargetChild />
      </View>
    );
  }
}
```
