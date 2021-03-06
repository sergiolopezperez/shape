import PropTypes from 'prop-types'

const position = {
  xPos: PropTypes.number.isRequired,
  yPos: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
}

const xy = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
}

const muiBackdrop = {
  invisible: PropTypes.bool.isRequired,
  classes: PropTypes.object,
}

const collaborator = {
  color: PropTypes.string.isRequired,
  name: PropTypes.string,
}

export default {
  position,
  xy,
  muiBackdrop,
  collaborator,
}
