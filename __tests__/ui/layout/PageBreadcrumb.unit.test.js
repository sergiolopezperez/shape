import axios from 'axios'

import PageBreadcrumb from '~/ui/layout/PageBreadcrumb'
import { fakeCollection } from '#/mocks/data'
import { apiStore } from '~/stores'

jest.mock('axios')
jest.mock('../../../app/javascript/stores')

apiStore.currentUserCollectionId = '123'
const props = {
  record: {
    ...fakeCollection,
    in_my_collection: false,
  },
  isHomepage: false,
}
let wrapper, component

describe('PageBreadcrumb', () => {
  let rerender
  let breadcrumbComponent

  beforeEach(() => {
    props.record.breadcrumb = [
      {
        type: 'collections',
        id: '1',
        name: 'My Workspace',
        collection_type: 'Collection',
      },
      {
        type: 'collections',
        id: '99',
        name: 'Use Cases',
        collection_type: 'Collection::Board',
      },
    ]

    rerender = () => {
      wrapper = shallow(<PageBreadcrumb {...props} />)
      component = wrapper.instance()
      breadcrumbComponent = wrapper.find('Breadcrumb')
    }
    rerender()
  })

  describe('render()', () => {
    it('should render an icon for different collection types', () => {
      expect(breadcrumbComponent.props().items[0].icon).toBeTruthy()
      expect(breadcrumbComponent.props().items[1].icon).toBeTruthy()
    })
  })

  describe('fetchBreadcrumbRecords()', () => {
    let data

    beforeEach(() => {
      data = [{ id: 1, name: 'b1' }, { id: 2, name: 'b2' }]
      axios.get.mockImplementationOnce(() => Promise.resolve(data))
    })

    it('should use axios to get the breadcrumb record', async () => {
      component.fetchBreadcrumbRecords(1)
      expect(axios.get).toHaveBeenCalled()
    })
  })

  describe('In My Collection', () => {
    beforeEach(() => {
      props.record.in_my_collection = true
      rerender()
    })

    it('has My Collection, then all titles', () => {
      const titles = component.items.map(i => i.name)
      expect(titles).toEqual(['My Collection', 'My Workspace', 'Use Cases'])
    })
  })
})
