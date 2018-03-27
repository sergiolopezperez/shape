import { observable, useStrict } from 'mobx'
import { Provider } from 'mobx-react'
import OrganizationMenu from '~/ui/organizations/OrganizationMenu'
import {
  fakeUser,
} from '#/mocks/data'

const apiStore = observable({
  currentUser: fakeUser,
})
const uiStore = observable({
  organizationMenuOpen: false,
  update: jest.fn()
})
const props = {
  uiStore,
  organization: {
    name: 'Space'
  },
  userGroups: []
}

let wrapper

describe('OrganizationMenu', () => {
  let component

  beforeEach(() => {
    useStrict(false)
    props.userGroups = observable([
      { id: 1, name: 'groupTest', handle: 'test', filestack_file_url: 'jpg' }
    ])
    wrapper = mount(
      <Provider apiStore={apiStore} uiStore={uiStore}>
        <OrganizationMenu.wrappedComponent {...props} />
      </Provider>
    )
    component = wrapper.find('OrganizationMenu')
  })

  it('only shows itself if the UI Store says it should be open', () => {
    expect(wrapper.find('Dialog').props().open).toBeFalsy()
    uiStore.organizationMenuOpen = true
    wrapper.update()
    expect(wrapper.find('Dialog').props().open).toBeTruthy()
  })

  it('closes the organization menu in the UI store when exited', () => {
    component.instance().handleClose()
    expect(props.uiStore.update).toHaveBeenCalledWith('organizationMenuOpen', false)
  })

  it('closes the edit menu when changes are save in the UI store', () => {
    component.instance().onOrganizationSave()
    expect(props.uiStore.update).toHaveBeenCalledWith('organizationMenuOpen', false)
  })

  it('opens the organization edit menu when you click on the org name', () => {
    wrapper.find('.orgEdit').simulate('click')
    expect(component.instance().editOrganizationOpen)
      .toBeTruthy()
  })

  it('opens the group edit menu when you click on any group name', () => {
    wrapper.find('.groupEdit').first().simulate('click')
    expect(component.instance().editGroup).toEqual(props.userGroups[0])
  })

  it('opens the group add menu when you click on the new group button', () => {
    component.instance().handleGroupAddClick()
    expect(component.instance().modifyGroupOpen).toBeTruthy()
    expect(component.instance().editGroup).toEqual({})
  })
})
