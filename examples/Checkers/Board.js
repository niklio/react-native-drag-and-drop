import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import styled from 'styled-components/native';

const BoardStyle = {
  Root: styled.View`
    height: ${props => props.boardSize};
    width: ${props => props.boardSize};
  `,
  Row: styled.View`
    display: flex;
    flex: 1;
    flex-direction: row;
  `
}

class Board extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const { height, width } = Dimensions.get('window');
    const boardSize = Math.min([height, width]);
    return (
      <BoardStyle.Root boardSize={boardSize}>
        <BoardStyle.Row />
        <BoardStyle.Row />
      </BoardStyle.Root>
    );
  }
}

export default Board;
