import GridCard from '~/ui/grid/GridCard'

import {
  fakeItemCard,
  fakeCollectionCard,
  fakeCollection,
  fakeTextItem,
} from '#/mocks/data'



const props = {
  card: fakeItemCard,
  cardType: 'items',
  record: fakeTextItem,
  handleClick: jest.fn(),
  onMoveStart: jest.fn(),
  dragging: false,
  height: 100,
  menuOpen: false,
  canEditCollection: false,
  isSharedCollection: false,
}

let wrapper, rerender
describe('GridCard', () => {
  describe('with item', () => {
    beforeEach(() => {
      props.record.can_edit = false
      rerender = function() {
        wrapper = shallow(
          <GridCard {...props} />
        )
        return wrapper
      }
      rerender()
    })

    it('renders a StyledGridCard with passed in dragging prop', () => {
      expect(wrapper.find('StyledGridCard').props().dragging).toBe(props.dragging)
    })

    it('renders a StyledGridCardInner with passed in onClick prop', () => {
      expect(wrapper.find('StyledGridCardInner').props().onClick).toEqual(wrapper.instance().handleClick)
    })

    it('does not render link icon if card is primary', () => {
      expect(wrapper.find('StyledGridCard').find('LinkIcon').exists()).toBe(false)
    })

    it('renders menu', () => {
      expect(wrapper.find('CardMenu').exists()).toBe(true)
    })

    it('does not render selection circle or hotspot', () => {
      expect(wrapper.find('SelectionCircle').exists()).toBe(false)
      expect(wrapper.find('GridCardHotspot').exists()).toBe(false)
    })

    describe('as editor', () => {
      beforeEach(() => {
        props.record.can_edit = true
        props.canEditCollection = true
        wrapper.setProps(props)
        rerender()
      })

      it('passes canEdit to menu', () => {
        expect(wrapper.find('CardMenu').props().canEdit).toBe(true)
      })

      it('renders selection circle and hotspot', () => {
        expect(wrapper.find('SelectionCircle').exists()).toBe(true)
        expect(wrapper.find('GridCardHotspot').exists()).toBe(true)
      })
    })

    describe('as first item in the row', () => {
      beforeEach(() => {
        props.record.can_edit = true
        props.canEditCollection = true
        props.card.position = { x: 0 }
        rerender()
      })

      it('renders hotspot to the left and right', () => {
        expect(wrapper.find('GridCardHotspot').at(0).props().position).toBe('right')
        expect(wrapper.find('GridCardHotspot').at(1).props().position).toBe('left')
      })
    })

    describe('as link', () => {
      beforeEach(() => {
        props.card.link = true
        rerender()
      })

      it('renders the link icon', () => {
        expect(wrapper.find('StyledGridCard').find('LinkIcon').exists()).toBe(true)
      })
    })
  })

  describe('with collection', () => {
    beforeEach(() => {
      props.cardType = 'collections'
      props.card = fakeCollectionCard
      props.canEditCollection = false
      props.record = fakeCollection
      props.record.can_edit = false
      rerender()
    })

    it('renders the collection cover', () => {
      expect(wrapper.find('CollectionCover').props().collection).toEqual(fakeCollection)
    })

    it('renders the collection icon', () => {
      expect(wrapper.find('StyledGridCard').find('CollectionIcon').exists()).toBe(true)
    })

    it('renders menu and selection circle', () => {
      expect(wrapper.find('CardMenu').exists()).toBe(true)
    })

    it('does not render selection circle or hotspot', () => {
      expect(wrapper.find('SelectionCircle').exists()).toBe(false)
      expect(wrapper.find('GridCardHotspot').exists()).toBe(false)
    })

    describe('as editor', () => {
      beforeEach(() => {
        props.record.can_edit = true
        props.canEditCollection = true
        rerender()
      })

      it('passes canEdit to menu', () => {
        expect(wrapper.find('CardMenu').props().canEdit).toBe(true)
      })

      it('renders selection circle and hotspot', () => {
        expect(wrapper.find('SelectionCircle').exists()).toBe(true)
        expect(wrapper.find('GridCardHotspot').exists()).toBe(true)
      })
    })

    describe('with SharedCollection', () => {
      beforeEach(() => {
        props.isSharedCollection = true
        props.canEditCollection = false
        rerender()
      })

      it('renders selection circle and card menu, but no hotspot', () => {
        expect(wrapper.find('SelectionCircle').exists()).toBe(true)
        expect(wrapper.find('CardMenu').exists()).toBe(true)
        expect(wrapper.find('GridCardHotspot').exists()).toBe(false)
      })
    })

    describe('with SharedCollection card (menuDisabled = true)', () => {
      beforeEach(() => {
        props.isSharedCollection = false
        props.canEditCollection = true
        props.record.menuDisabled = true
        rerender()
      })

      it('does not render CardMenu', () => {
        expect(wrapper.find('CardMenu').exists()).toBe(false)
      })
    })

    describe('as reference', () => {
      beforeEach(() => {
        props.card.link = true
        rerender()
      })

      it('has linked collection icon', () => {
        expect(wrapper.find('StyledGridCard').find('LinkedCollectionIcon').exists()).toBe(true)
      })
    })
  })
})
