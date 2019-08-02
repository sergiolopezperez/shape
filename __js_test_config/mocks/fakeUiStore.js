const fakeUiStore = {
  gridSettings: {
    cols: 4,
    gutter: 20,
    gridW: 312,
    gridH: 250,
  },
  defaultGridSettings: {
    cols: 4,
    gutter: 20,
    gridW: 312,
    gridH: 250,
  },
  blankContentToolState: {
    order: null,
    width: null,
    height: null,
    replacingId: null,
  },
  dialogConfig: {
    open: null,
    prompt: null,
    onConfirm: null,
    onCancel: null,
    iconName: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    onClose: jest.fn(),
  },
  activityLogOpen: false,
  activityLogPosition: {
    x: 0,
    y: 0,
    h: 1,
    w: 1,
  },
  activityLogMoving: false,
  cardMenuOpen: {
    id: false,
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0
  },
  openBlankContentTool: jest.fn(),
  closeBlankContentTool: jest.fn(),
  closeCardMenu: jest.fn(),
  openCardMenu: jest.fn(),
  closeMoveMenu: jest.fn(),
  resetSelectionAndBCT: jest.fn(),
  rolesMenuOpen: false,
  isLoading: false,
  dismissedMoveHelper: false,
  selectedAreaEnabled: false,
  setSelectedArea: jest.fn(),
  selectedCardIds: [],
  selectCardId: jest.fn(),
  deselectCards: jest.fn(),
  setViewingRecord: jest.fn(),
  viewingCollection: null,
  isViewingHomepage: false,
  viewingItem: null,
  movingFromCollectionId: null,
  movingCardIds: [],
  openMoveMenu: jest.fn(),
  update: jest.fn(),
  alert: jest.fn(),
  alertOk: jest.fn(),
  defaultAlertError: jest.fn(),
  confirm: jest.fn(),
  closeDialog: jest.fn(),
  cardAction: 'move',
  blurContent: false,
  organizationMenuPage: 'organizationMenuPage',
  organizationMenuGroupId: null,
  organizationMenuOpen: false,
  expandedThreadKey: null,
  expandThread: jest.fn(),
  openGroup: jest.fn(),
  openOptionalMenus: jest.fn(),
  trackEvent: jest.fn(),
  trackedRecords: {},
  editingName: false,
  activityLogPage: 'comments',
  pageMenuOpen: false,
  searchText: '',
  collectionCardSortOrder: '',
  addNewCard: jest.fn(),
  removeNewCard: jest.fn(),
  isNewCard: jest.fn(),
  editingCardId: 0,
  toggleEditingCardId: jest.fn(),
  autocompleteMenuClosed: jest.fn(),
  captureKeyboardGridClick: jest.fn(),
  popupAlert: jest.fn(),
  stopDragging: jest.fn(),
  multiMoveCardIds: [],
  setSnoozeChecked: jest.fn(),
  scrollToTop: jest.fn(),
  scrollToBottom: jest.fn(),
  scrollToBottomOfModal: jest.fn(),
  popupSnackbar: jest.fn(),
  showPermissionsAlert: jest.fn(),
  gridHeightFor: jest.fn().mockReturnValue(250),
  performActionAfterRoute: jest.fn(),
  linkedBreadcrumbTrailForRecord: jest.fn().mockImplementation(x => x.breadcrumb),
  addEmptySpaceClickHandler: jest.fn(),
  removeEmptySpaceClickHandler: jest.fn(),
  adminAudienceMenuOpen: false,
}

export default fakeUiStore
