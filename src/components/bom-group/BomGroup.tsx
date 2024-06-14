import React from 'react';
import {connect} from 'react-redux';
import {Column, Grid, Row} from 'carbon-components-react';

import {Bom} from '../bom';
import {RootState} from '../../app/store';
import {Mode, selectMode} from '../../features/mode/modeSlice';
import {BomGroupModel} from '../../models';

interface BomGroupValues {
  mode: Mode
}

export interface BomGroupProps extends BomGroupValues {
  bomGroup: BomGroupModel
}

export interface BomGroupState {

}

class BomGroupInternal<S extends BomGroupState = any> extends React.Component<BomGroupProps, S> {

  render() {
    if (this.props.bomGroup.boms.length === 0) {
      return (<></>)
    }

    return (
      <div>
        <h4>{this.props.bomGroup.name}</h4>
        {this.renderTileModules()}
      </div>
    );
  }

  renderTileModules() {
    if (this.props.bomGroup.boms.length === 0) {
      return (<div>No Boms</div>)
    }

    const bomTiles = this.props.bomGroup.boms.map(b => <Bom key={b.name} bom={b}></Bom>)

    return (
      <Grid>
        <Row>
          {bomTiles.map(b => <Column lg={{span: 4}} md={{span: 2}} sm={{span: 2}}>{b}</Column>)}
        </Row>
      </Grid>
    )
  }
}

const mapStateToProps = (state: RootState): BomGroupValues => {

  const props = {
    mode: selectMode(state),
  }

  return props
}

export const BomGroup = connect(mapStateToProps)(BomGroupInternal)
