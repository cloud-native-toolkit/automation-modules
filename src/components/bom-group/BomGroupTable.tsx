import React from 'react';
import yaml from 'yaml';

import {DataTable, HeaderData} from '../../ui-patterns/data-table/DataTable';
import {
  BomGroupModel,
  BomModel,
  bomPath,
  bomCloudProvider,
  bomName,
  moduleDisplayName,
  ModuleGroupModel, moduleLatestVersion,
  ModuleModel,
  moduleProvider,
  moduleStatus,
  moduleType,
  moduleUrl
} from '../../models';
import {ModuleLink} from '../module-link';

const headers: HeaderData<EnhancedBomModel>[] = [{
  header: 'Bom',
  key: 'name'
}, {
  header: 'Path',
  key: 'path'
}, {
  header: 'Cloud Provider',
  key: 'cloudProvider'
}];

interface BomTableProps {
  boms: BomGroupModel[];
  category: string;
}

interface EnhancedBomModel extends BomModel {
  id: string;
}

export class BomGroupTable extends React.Component<BomTableProps, any> {

  get boms(): EnhancedBomModel[] {
    return this.props.boms.reduce(
      (boms: EnhancedBomModel[], bom: BomGroupModel) => {
        boms.push(...bom.boms
          .map(b => Object.assign(
            {},
            b,
            {
              id: bomPath(b),
              modules: this.bomModules(b),
              name: bomName(b)+" on "+bomCloudProvider(b),
              path: bomPath(b),
              cloudProvider: bomCloudProvider(b)
            }
          ))
        )
        return boms;
      },
      []
    );
  }

  get title(): string {
    return this.props.category
  }

  async loadYaml(bom: BomModel) {
    const result = await fetch(bomPath(bom));
    const text = await result.text();

    try {
      var bomModules = yaml.parse(text);
      var moduleArray=[];
      for (var key in bomModules.spec.modules) {
          var obj = bomModules.spec.modules[key].name;
          moduleArray.push(obj)
      }
      return moduleArray
    } catch (error) {
      console.log('Error parsing catalog: ', error)
      throw error
    }
  }

  async bomModules(bom: BomModel){
    const res = await this.loadYaml(bom)
    const final_data = await res
    return final_data
  }

  render() {
    return (
      <DataTable headers={headers} data={this.boms} title=""></DataTable>
    )
  }

}
