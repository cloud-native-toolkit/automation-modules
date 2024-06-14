import React from 'react';
import {connect} from 'react-redux';

import {RootState} from '../../app/store';
import './BomCatalog.scss';

import {
  filterBomCatalogAsync,
  selectBomCatalog,
  selectBomCatalogFilters,
  selectBomCatalogStatus
} from '../../features/bomCatalog/bomCatalogSlice';

import {BomCategory} from '../bom-category';
import {Loading} from '../loading';
import {ModeToggle} from '../mode-toggle';

import {BomModel, BomCatalogModel, BomCatalogFiltersModel} from '../../models';

import {Status} from '../../features/status';
import {Button, Column, Grid, Row} from 'carbon-components-react';
import {BomCatalogCounts} from '../bom-counts';

interface BomCatalogValues {
  bomCatalog?: BomCatalogModel
  filters?: BomCatalogFiltersModel
  status?: Status
}

interface BomCatalogDispatch {
  fetchBomCatalog: (filters?: BomCatalogFiltersModel) => void
}

export interface BomProps extends BomCatalogValues, BomCatalogDispatch {
}

class BomCatalogInternal extends React.Component<BomProps, any> {

  render() {
    return (
      <div className="BomCatalog">
        <Grid style={{paddingTop: '10px', paddingBottom: '10px', paddingLeft: 0, paddingRight: 0}}>
          <Row>
            <Column>
              <a
                href="https://github.com/cloud-native-toolkit/software-everywhere/issues/new?labels=new_bom&title=Request+new+bom%3A+%7Bname%7D"
                target="_blank"><Button size="field">Request new bom</Button></a>
            </Column>
            <Column>
              <BomCatalogCounts />
            </Column>
            <Column>
              <div style={{float: 'right'}}>
                <ModeToggle />
              </div>
            </Column>
          </Row>
        </Grid>
        <Loading status={this.props.status} />
        {this.renderBomCatalog()}
      </div>
    )
  }

  renderStatus() {
    if (this.props.status === Status.loading) {
      return (<div>Loading...</div>)
    }

    return (<div></div>)
  }

  renderBomCatalog() {
    const bomCatalog: BomCatalogModel | undefined = this.props.bomCatalog

    if (!bomCatalog) {
      return
    }
    return bomCatalog.categories.map(c => <BomCategory key={c.name} bomCategory={c} />)
  }

  componentDidMount() {
    this.props.fetchBomCatalog()
  }
}

const mapStateToProps = (state: RootState): BomCatalogValues => {

  const props: BomCatalogValues = {
    bomCatalog: selectBomCatalog(state),
    filters: selectBomCatalogFilters(state),
    status: selectBomCatalogStatus(state)
  }

  console.log('Refreshing props: ', props)

  return props
}

const mapDispatchToProps = (dispatch: any): BomCatalogDispatch => {
  return {
    fetchBomCatalog: (filters?: BomCatalogFiltersModel) => dispatch(filterBomCatalogAsync(filters))
  }
}

export const BomCatalog = connect(mapStateToProps, mapDispatchToProps)(BomCatalogInternal)
