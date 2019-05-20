import fakeApiStore from '#/mocks/fakeApiStore'
import AdminFeedback from '~/ui/admin/AdminFeedback'
import {
  fakeTestCollection,
  fakeAudience,
  fakeTestAudience,
} from '#/mocks/data'

const waitForAsync = () => new Promise(resolve => setImmediate(resolve))

describe('AdminFeedback', () => {
  let wrapper
  beforeEach(async () => {
    const props = {
      apiStore: fakeApiStore({
        requestResult: {
          data: [fakeTestCollection],
          totalPages: 2,
        },
      }),
    }

    wrapper = shallow(<AdminFeedback.wrappedComponent {...props} />)
    await waitForAsync()
    wrapper.update()
  })

  it('shows the list of tests', () => {
    expect(wrapper.find('FeedbackRow').length).toEqual(1)
  })

  it('shows audience data for each test', () => {
    const audienceRowItems = wrapper.find('AudienceRowItem')
    expect(audienceRowItems.length).toEqual(3)

    const audienceName = audienceRowItems.at(0)
    expect(audienceName.html()).toContain(fakeAudience.name)

    const audienceSampleSize = audienceRowItems.at(2)
    expect(audienceSampleSize.html()).toContain(fakeTestAudience.sample_size)
  })

  describe('pagination', () => {
    it('shows current page and total pages', () => {
      const pagination = wrapper.find('PaginationWrapper')
      expect(pagination.exists()).toBeTruthy()
      expect(pagination.html()).toContain('1/2')
    })

    it('loads previous and next pages of tests', async () => {
      let previousPageButton = wrapper.find('PaginationButton')
      expect(previousPageButton.props().disabled).toBeTruthy()

      let nextPageButton = wrapper.find('NextPageButton')
      nextPageButton.simulate('click')

      await waitForAsync()
      wrapper.update()

      let pagination = wrapper.find('PaginationWrapper')
      expect(pagination.html()).toContain('2/2')

      nextPageButton = wrapper.find('NextPageButton')
      expect(nextPageButton.props().disabled).toBeTruthy()

      previousPageButton = wrapper.find('PaginationButton')
      previousPageButton.simulate('click')

      await waitForAsync()
      wrapper.update()

      pagination = wrapper.find('PaginationWrapper')
      expect(pagination.html()).toContain('1/2')
    })
  })
})
