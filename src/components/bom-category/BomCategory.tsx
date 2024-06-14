import React from 'react';
import {connect} from 'react-redux';

import {BomGroup, BomGroupTable} from '../bom-group';
import {RootState} from '../../app/store';
import {Mode, selectMode} from '../../features/mode/modeSlice';
import {BomCategoryModel, BomGroupModel} from '../../models';

import './BomCategory.scss';

interface BomCategoryValues {
  mode: Mode
}

export interface BomCategoryProps extends BomCategoryValues {
  bomCategory: BomCategoryModel
}

export interface BomCategoryState {
}

class BomCategoryInternal<S extends BomCategoryState> extends React.Component<BomCategoryProps, S> {

  render() {
    if (this.bomCount(this.props.bomCategory.boms) === 0) {
      return (<></>)
    }

    return (
      <>
      <h3>{this.props.bomCategory.name}</h3>
      {this.renderBomGroups()}
      </>
    );
  }

  bomCount(boms: BomGroupModel[] = []): number {
    return boms.reduce((count: number, bom: BomGroupModel) => {
      return count + bom.boms.length;
    }, 0)
  }

  renderBomGroups() {
    if (this.props.bomCategory.boms.length === 0) {
      return (<div>No Boms</div>)
    }

    return this.props.mode === Mode.table ? this.renderBomGroupTables() : this.renderBomGroupTiles()
  }

  renderBomGroupTables() {
    return (
      <BomGroupTable boms={this.props.bomCategory.boms} category={this.props.bomCategory.name}></BomGroupTable>
    )
  }

  renderBomGroupTiles() {
    return this.props.bomCategory.boms.map(b => <BomGroup key={b.name} bomGroup={b}></BomGroup>)
  }

}

const mapStateToProps = (state: RootState): BomCategoryValues => {

  const props = {
    mode: selectMode(state),
  }

  return props
}

export const BomCategory = connect(mapStateToProps)(BomCategoryInternal)
