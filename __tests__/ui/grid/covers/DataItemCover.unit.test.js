import DataItemCover from '~/ui/grid/covers/DataItemCover'
import { fakeItem } from '#/mocks/data'
import fakeUiStore from '#/mocks/fakeUiStore'

import EditableButton from '~/ui/reporting/EditableButton'

const props = {}
let wrapper
xdescribe('DataItemCover', () => {
  beforeEach(() => {
    props.uiStore = fakeUiStore
    props.card = { id: 1 }
    props.item = {
      ...fakeItem,
      data: {
        value: 5,
      },
      data_settings: {
        d_measure: 'participants',
      },
    }
    wrapper = shallow(<DataItemCover.wrappedComponent {...props} />)
  })

  // TODO: replace with more meaningful test once the component is set up more properly
  it('renders the data values', () => {
    expect(
      wrapper
        .find('.count')
        .children()
        .text()
    ).toContain(props.item.data.value)
    expect(
      wrapper
        .find('.measure')
        .children()
        .text()
    ).toContain(props.item.data_settings.d_measure)
  })

  describe('clicking measure', () => {
    describe('when editor', () => {
      beforeEach(() => {
        props.item.can_edit_content = true
        wrapper.setProps(props)
        wrapper
          .find(EditableButton)
          .at(1)
          .simulate('click')
      })

      it('should set the editing to true', () => {
        expect(fakeUiStore.toggleEditingCardId).toHaveBeenCalledWith(
          props.card.id
        )
      })
    })

    describe('when not editor', () => {
      beforeEach(() => {
        props.item.can_edit_content = false
        wrapper.setProps(props)
        wrapper
          .find(EditableButton)
          .at(1)
          .simulate('click')
      })

      it('should not set the editing to true', () => {
        expect(fakeUiStore.toggleEditingCardId).toHaveBeenCalledWith(
          props.card.id
        )
      })
    })
  })
})