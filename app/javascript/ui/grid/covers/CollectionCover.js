import PropTypes from 'prop-types'
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'
import styled from 'styled-components'
import Dotdotdot from 'react-dotdotdot'

import v from '~/utils/variables'
import hexToRgba from '~/utils/hexToRgba'

const StyledCollectionCover = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => (props.isSpecialCollection ? v.colors.sirocco : v.colors.gray)};
  color: white;
  position: relative;
  overflow: hidden;
  ${props => (props.url && `
    background-image: url(${props.url});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    color: white;
  `
  )}
`
StyledCollectionCover.displayName = 'StyledCollectionCover'

const pad = 16
const calcSectionWidth = (props) => {
  if (props.width === 4) {
    return `${props.gridW * 2}px`
  } else if (props.width > 1) {
    return `${props.gridW - props.gutter}px`
  }
  return `calc(100% - ${props.gutter * 2}px)`
}

const calcSectionHeight = (props) => {
  if (props.height > 1) {
    return `calc(50% - ${pad + (props.gutter / 2)}px)`
  }
  return `calc(50% - ${pad}px)`
}

const StyledCardContent = styled.div`
  .overlay {
    position: absolute;
    right: 0;
    top: 0;
    background: ${hexToRgba(v.colors.blackLava, 0.4)};
    width: 100%;
    height: 100%;
  }
  .top, .bottom {
    position: absolute;
    right: 1rem;
    width: ${props => calcSectionWidth(props)};
    height: ${props => calcSectionHeight(props)};
  }
  .top {
    top: ${pad}px;
    h3 {
      position: absolute;
      bottom: 0;
    }
  }
  .bottom {
    bottom: ${props => (props.height === 1 ? `${pad / 2}` : pad)}px;
  }
  ${props => (props.width > 1 && `
    top: 33%;
    left: 40%;
    padding-right: 2rem;
  `
  )}
  h3 {
    text-transform: uppercase;
    font-size: 2rem;
    margin-bottom: 0.25rem;
    line-height: 1.2;
    /* transition size change, with 0.25s delay */
    transition: all 0.33s 0.25s;
    @media only screen
      and (min-width: ${v.responsive.medBreakpoint}px)
      and (max-width: ${v.responsive.largeBreakpoint}px) {
      font-size: 1.6rem;
    }
  }
`
StyledCardContent.displayName = 'StyledCardContent'

@inject('uiStore')
@observer
class CollectionCover extends React.Component {
  render() {
    const { height, width, collection, uiStore } = this.props
    const { cover } = collection
    const { gridW, gutter } = uiStore.gridSettings

    return (
      <StyledCollectionCover
        url={cover.image_url}
        isSpecialCollection={collection.isSpecialCollection}
      >
        <StyledCardContent
          height={height}
          width={width}
          gutter={gutter}
          gridW={gridW}
        >
          <div className="overlay" />
          <div className="top">
            <h3>
              <Dotdotdot clamp={height > 1 ? 6 : 3}>
                {collection.name}
              </Dotdotdot>
            </h3>
          </div>
          <div className="bottom">
            <Dotdotdot clamp="auto">
              {cover.text}
            </Dotdotdot>
          </div>
        </StyledCardContent>
      </StyledCollectionCover>
    )
  }
}

CollectionCover.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  collection: MobxPropTypes.objectOrObservableObject.isRequired,
}
CollectionCover.wrappedComponent.propTypes = {
  uiStore: MobxPropTypes.objectOrObservableObject.isRequired,
}

CollectionCover.displayName = 'CollectionCover'

export default CollectionCover
