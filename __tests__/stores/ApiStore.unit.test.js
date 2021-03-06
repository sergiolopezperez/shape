// import { runInAction } from 'mobx'
import undoStore from '#/mocks/fakeUndoStore'
import uiStore from '#/mocks/fakeUiStore'
import routingStore from '#/mocks/fakeRoutingStore'
import { fakeCollection, fakeThread } from '#/mocks/data'
import ApiStore from '~/stores/ApiStore'
import IdeoSSO from '~/utils/IdeoSSO'

// have to do this to mock the setup of the other stores
jest.mock('../../app/javascript/stores/index')
jest.mock('../../app/javascript/utils/IdeoSSO')

let collection = fakeCollection
const mockFind = (type, id) => {
  return { ...collection, id }
}

let apiStore
describe('ApiStore', () => {
  beforeEach(() => {
    // reset every time
    apiStore = new ApiStore({ routingStore, uiStore, undoStore })
    collection = fakeCollection
    apiStore.find = jest.fn(mockFind)
  })

  describe('#loadCurrentUser', () => {
    let onSuccess
    beforeEach(() => {
      onSuccess = jest.fn()
      apiStore.request = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { id: '11' } }))
    })

    it('requests users/me', async () => {
      await apiStore.loadCurrentUser({ onSuccess })
      expect(apiStore.request).toHaveBeenCalledWith('users/me')
      // calls this as long as there was a user id retrieved
      expect(onSuccess).toHaveBeenCalled()
    })

    it('checks IdeoSSO if option is requested', async () => {
      await apiStore.loadCurrentUser({ onSuccess, checkIdeoSSO: true })
      expect(IdeoSSO.getUserInfo).toHaveBeenCalled()
    })

    describe('with IdeoSSO session expired', () => {
      beforeEach(() => {
        IdeoSSO.getUserInfo = jest.fn().mockReturnValue(Promise.reject())
      })
      afterEach(() => {
        IdeoSSO.getUserInfo = jest.fn().mockReturnValue(Promise.resolve())
      })

      it('logs you out and does not call users/me', async () => {
        await apiStore.loadCurrentUser({ onSuccess, checkIdeoSSO: true })
        expect(IdeoSSO.getUserInfo).toHaveBeenCalled()
        expect(IdeoSSO.logout).toHaveBeenCalled()
        expect(apiStore.request).not.toHaveBeenCalled()
      })
    })
  })

  describe('#setupCommentThreadAndMenusForPage', () => {
    beforeEach(async () => {
      apiStore.request = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { id: '11' } }))
      // need to set up current user
      await apiStore.loadCurrentUser()
      apiStore.findOrBuildCommentThread = jest
        .fn()
        .mockReturnValue(Promise.resolve({ id: '123', key: 'threadkey' }))
    })

    it('does not proceed unless routingStore.query or activityLogOpen', () => {
      apiStore.setupCommentThreadAndMenusForPage(collection)
      expect(apiStore.findOrBuildCommentThread).not.toHaveBeenCalled()
    })

    it('continues if activityLogOpen', async () => {
      uiStore.activityLogOpen = true
      routingStore.query = null
      await apiStore.setupCommentThreadAndMenusForPage(collection)
      expect(apiStore.findOrBuildCommentThread).toHaveBeenCalledWith(collection)
      expect(uiStore.expandThread).toHaveBeenCalledWith('threadkey')
      expect(uiStore.openOptionalMenus).not.toHaveBeenCalled()

      routingStore.query = { open: 'comments' }
      await apiStore.setupCommentThreadAndMenusForPage(collection)
      expect(uiStore.expandThread).toHaveBeenCalledWith('threadkey')
      expect(uiStore.openOptionalMenus).toHaveBeenCalledWith(routingStore.query)
    })

    it('continues if routingStore.query and activityLog is not open', async () => {
      uiStore.activityLogOpen = false
      routingStore.query = { manage_group_id: 1 }
      await apiStore.setupCommentThreadAndMenusForPage(collection)
      expect(apiStore.findOrBuildCommentThread).not.toHaveBeenCalled()
      expect(uiStore.openOptionalMenus).toHaveBeenCalledWith(routingStore.query)
    })
  })

  describe('#expandAndOpenThreadForRecord', () => {
    beforeEach(() => {
      apiStore.request = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { ...fakeThread } }))
      uiStore.viewingRecord = { id: '123' }
      uiStore.expandAndOpenThread = jest.fn()
    })

    it('does shit', async () => {
      await apiStore.expandAndOpenThreadForRecord(collection)
      // this should have looked up the thread via request mocked above
      expect(uiStore.expandAndOpenThread).toHaveBeenCalledWith(fakeThread.key)
    })
  })

  describe('#moveCards', () => {
    let data
    const res = {
      data: [
        { id: '1', order: 0 },
        { id: '2', order: 1 },
        { id: '3', order: 2 },
      ],
    }
    beforeEach(() => {
      data = {
        to_id: '1',
        from_id: '2',
        collection_card_ids: ['1', '2', '3'],
      }
      // mock some functions
      apiStore.request = jest.fn().mockReturnValue(Promise.resolve(res))
    })

    it('should make collection_cards/move API call', async () => {
      await apiStore.moveCards(data)
      expect(apiStore.request).toHaveBeenCalledWith(
        'collection_cards/move',
        'PATCH',
        data
      )
      expect(collection.toJsonApiWithCards).toHaveBeenCalledWith([])
    })

    it('should merge the resulting cards', async () => {
      await apiStore.moveCards(data)
      expect(collection.mergeCards).toHaveBeenCalledWith(res.data)
    })

    it('should remove the moved cards from fromCollection', async () => {
      await apiStore.moveCards(data)
      // NOTE: because `collection` is the mock return value of apiStore.find
      // it is the stand-in for both from/toCollection
      expect(collection.removeCardIds).toHaveBeenCalledWith(
        data.collection_card_ids
      )
    })

    it('should call API_fetchCardOrders if not a board collection', async () => {
      await apiStore.moveCards(data)
      expect(collection.API_fetchCardOrders).toHaveBeenCalled()
    })

    it('should push the undo action', async () => {
      await apiStore.moveCards(data)
      expect(undoStore.pushUndoAction).toHaveBeenCalledWith({
        apiCall: expect.any(Function),
        message: 'Move undone',
        redirectPath: {
          id: data.from_id,
          type: 'collections',
        },
        redoAction: {
          actionType: 'snackbar',
          apiCall: expect.any(Function),
          message: 'Move redone',
        },
        redoRedirectPath: {
          id: data.to_id,
          type: 'collections',
        },
      })
    })

    describe('when undoing', () => {
      const undoSnapshot = { attributes: 'xyz' }
      it('should push the undo action and revert to the snapshot', async () => {
        await apiStore.moveCards(data, { undoing: true, undoSnapshot })
        expect(apiStore.request).toHaveBeenCalledWith(
          'collection_cards/move',
          'PATCH',
          data
        )
        expect(apiStore.request).toHaveBeenCalledWith(
          `collections/${data.to_id}`,
          'PATCH',
          { data: undoSnapshot }
        )
        expect(collection.revertToSnapshot).toHaveBeenCalledWith(
          undoSnapshot.attributes
        )
      })
    })

    describe('with a board collection', () => {
      beforeEach(() => {
        collection.isBoard = true
      })
      it('should only call toJsonApiWithCards with the indicated card ids', async () => {
        await apiStore.moveCards(data)
        expect(collection.toJsonApiWithCards).toHaveBeenCalledWith(
          data.collection_card_ids
        )
      })
    })
  })
})
