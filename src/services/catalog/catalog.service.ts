import yaml from 'yaml';
import {
  CatalogFiltersModel,
  CatalogModel,
  CatalogResultModel,
  CategoryModel,
  ModuleGroupModel,
  ModuleModel,
  moduleStatus,
  moduleType
} from '../../models';
import first from '../../util/first';
import {
  addSoftwareProvider,
  buildCatalogList,
  CatalogListModel,
  ListValue,
  withCategories
} from '../../models/catalog-list.model';

let _catalog: CatalogModel;

interface BackendCatalog {
  categories: BackendCategory[]
}

interface BackendCategory {
  category: string;
  categoryName: string;
  selection: string;
  modules: ModuleModel[]
}

export class CatalogService {

  async fetchListValues(): Promise<CatalogListModel> {
    const result: CatalogResultModel = await this.fetch();
    const catalog = result.payload;

    const modules: ModuleModel[] = catalog.categories.reduce((modules: ModuleModel[], current: CategoryModel) => {
      const m: ModuleModel[] = current.groups.reduce((result: ModuleModel[], current: ModuleGroupModel) => {
        result.push(...current.modules);

        return result;
      }, []);

      modules.push(...m);

      return modules;
    }, [])

    const catalogList: CatalogListModel = modules.reduce((result: CatalogListModel, current: ModuleModel) => {
      if (current.softwareProvider) {
        addSoftwareProvider(result, current.softwareProvider);
      }

      return result;
    }, buildCatalogList())

    return withCategories(catalogList, catalog.categories)
  }

  async fetch(catalogFilters?: CatalogFiltersModel): Promise<CatalogResultModel> {

    console.log('I am in fetch');


    if (!_catalog) {
      _catalog = await this.loadYaml();
    }

    const payload = filterCatalog(_catalog, catalogFilters)

    return {
      payload,
      filters: catalogFilters || {},
      count: this.count(payload),
      totalCount: this.count(_catalog)
    }
  }

  count(catalog: CatalogModel): number {
    return catalog.categories.reduce((total: number, category: CategoryModel) => {

      const categoryTotal: number = category.groups.reduce((groupTotal: number, group: ModuleGroupModel) => {
        return groupTotal + group.modules.length
      }, 0)

      return total + categoryTotal
    }, 0)
  }

  async loadYaml(): Promise<CatalogModel> {
    const result = await fetch('./summary.yaml');
    const text = await result.text();

    try {
      const catalog: BackendCatalog = yaml.parse(text);

      return backendCatalogToCatalogModel(catalog);
    } catch (error) {
      console.log('Error parsing catalog: ', error)
      throw error
    }
  }
}

const backendCatalogToCatalogModel = (catalog: BackendCatalog): CatalogModel => {
  return {
    categories: catalog.categories.map(backendCategoriesToCategoryModel)
  }
}

const backendCategoriesToCategoryModel = (category: BackendCategory): CategoryModel => {
  const modules = category.modules || []
  return {
    name: category.categoryName,
    groups: modules.reduce(modulesToModuleGroups, [])
  }
}

const modulesToModuleGroups = (groups: ModuleGroupModel[], current: ModuleModel): ModuleGroupModel[] => {
  const groupName = current.group || current.name;
  const currentGroup: ModuleGroupModel = first(groups.filter(g => g.name === groupName))
    .orElseGet(() => {
      const newCurrentGroup = {
        name: groupName,
        modules: []
      };
      groups.push(newCurrentGroup);

      return newCurrentGroup;
    });

  currentGroup.modules.push(current)

  return groups;
}

const isPopulatedFilter = (filters?: CatalogFiltersModel): filters is CatalogFiltersModel => {
  if (!filters) {
    return false
  }

  // @ts-ignore
  return Object.keys(filters).some(key => !!filters[key])
}

const filterCatalog = (catalog: CatalogModel, filters?: CatalogFiltersModel): CatalogModel => {
  console.log('Filtering catalog: ', filters)
  if (!isPopulatedFilter(filters)) {
    console.log('Filter is empty', filters)
    return catalog
  }

  const result = {
    categories: filterCategories(filters, catalog.categories)
  }

  console.log('Filtered result: ', result)

  return result
}

const filterCategories = (filters: CatalogFiltersModel, categories: CategoryModel[]): CategoryModel[] => {
  return categories
    .filter(c => {
      return !filters.category || filters.category === c.name
    })
    .map(c => {
      return {
        name: c.name,
        groups: filterModuleGroups(filters, c.groups)
      }
    })
}

const filterModuleGroups = (filters: CatalogFiltersModel, groups: ModuleGroupModel[]): ModuleGroupModel[] => {
  return groups.map(g => {
    return {
      name: g.name,
      modules: filterModules(filters, g.modules)
    }
  })
}

const filterModules = (filters: CatalogFiltersModel, modules: ModuleModel[]): ModuleModel[] => {
  return modules.filter(filterModule(filters))
}

type FilterFunction = (filter: string, module: ModuleModel) => boolean

const filterFunctions = {
  cloudProvider: (filter: string, module: ModuleModel) => module.cloudProvider === filter || module.type === 'gitops',
  softwareProvider: (filter: string, module: ModuleModel) => module.softwareProvider === filter,
  moduleType: (filter: string, module: ModuleModel) => moduleType(module) === filter,
  status: (filter: string, module: ModuleModel) => moduleStatus(module) === filter,
  searchText: (filter: string, module: ModuleModel) => {
    const search = new RegExp(filter, 'ig')

    return search.test(module.name)
      || search.test(module.displayName || '')
      || search.test(module.description || '')
      || search.test(module.group || '')
  },
}

const filterModule = (filters: CatalogFiltersModel) => {
  return (module: ModuleModel): boolean => {
    return Object.keys(filters).every(key => {
      // @ts-ignore
      const filter = filters[key]
      // @ts-ignore
      const filterFunction = filterFunctions[key]
      console.log('filterFunction', typeof filterFunction)

      if (!filter || !filterFunction) {
        return true
      }

      // @ts-ignore
      return filterFunction(filter, module)
    })
  }
}
