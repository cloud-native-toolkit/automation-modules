import {BomModel} from '../../models';
import React from 'react';
import {RootState} from '../../app/store';
import {selectBomCatalog, selectBomCatalogCount, selectBomCatalogTotalCount} from '../../features/bomCatalog/bomCatalogSlice';
import {connect} from 'react-redux';

export interface BomCatalogCountProps {
  count?: number,
  totalCount?: number
}

class BomCatalogCountsInternal extends React.Component<BomCatalogCountProps, any> {

  render() {
    if (this.props.count === undefined || this.props.totalCount === undefined) {
      return (
        <>&nbsp;</>
      )
    }

    const bomCount = (): string => {
      if (this.props.count === this.props.totalCount) {
        return `${this.props.totalCount}`
      }

      return `${this.props.count} / ${this.props.totalCount}`
    }

    return (
      <div style={{paddingTop: '10px', margin: 'auto', width: '225px'}}>
        <div style={{fontWeight: 'bold', width: '125px', float: 'left', paddingRight: '5px', fontSize: 'x-large', textAlign: 'right'}}>{bomCount()}</div>
        <div style={{float: 'left', fontSize: 'x-large'}}>boms</div>
      </div>
    )
  }
}


const mapStateToProps = (state: RootState): BomCatalogCountProps => {

  const props: BomCatalogCountProps = {
    count: selectBomCatalogCount(state),
    totalCount: selectBomCatalogTotalCount(state)
  }

  return props
}

export const BomCatalogCounts = connect(mapStateToProps)(BomCatalogCountsInternal)
