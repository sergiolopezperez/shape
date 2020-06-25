import PropTypes from 'prop-types'
import Icon from '~/ui/icons/Icon'

const ClipboardIcon = ({ size }) => (
  <Icon fill>
    {size === 'lg' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path d="M23.348 5.303h-2.149a.64.64 0 00-.499-.247h-1.313c-.283-1.157-1.304-2.017-2.516-2.017h-1.844c-1.213 0-2.233.859-2.517 2.017h-1.312a.64.64 0 00-.499.248H8.652a1.993 1.993 0 00-1.991 1.991v18.19c0 1.098.894 1.991 1.991 1.991h14.695a1.993 1.993 0 001.991-1.991V7.294a1.992 1.992 0 00-1.99-1.991zm-12.15 3.971H20.7a.65.65 0 00.65-.65v-.095h.509v15.05h-11.82V8.529h.509v.095c0 .359.291.65.65.65zm1.885-2.919a.65.65 0 00.65-.65c0-.753.58-1.367 1.294-1.367h1.844c.713 0 1.293.613 1.293 1.367 0 .359.291.65.65.65h1.235v1.619h-8.201V6.355h1.235zm10.955 19.129c0 .381-.31.691-.69.691H8.652a.691.691 0 01-.69-.691V7.294c0-.381.31-.691.69-.691h1.896v.626H9.389a.65.65 0 00-.65.65v16.35c0 .359.291.65.65.65H22.51a.65.65 0 00.65-.65V7.879a.65.65 0 00-.65-.65h-1.159v-.626h1.997c.381 0 .69.31.69.691v18.19z" />
        <path d="M10.738 12.441l1.061 1.061a.65.65 0 00.92 0l1.88-1.88a.65.65 0 10-.92-.919l-1.42 1.42-.601-.601a.65.65 0 10-.92.919zM13.679 15.071l-1.42 1.42-.601-.601a.65.65 0 10-.92.919l1.061 1.061a.65.65 0 00.92 0l1.88-1.88a.65.65 0 10-.92-.919zM16.16 11.812h4.291a.65.65 0 100-1.3H16.16a.65.65 0 100 1.3zM16.16 13.692h2.594a.65.65 0 100-1.3H16.16a.65.65 0 100 1.3zM16.16 16.286h4.291a.65.65 0 100-1.3H16.16a.65.65 0 100 1.3zM16.16 18.166h2.594a.65.65 0 100-1.3H16.16a.65.65 0 100 1.3zM13.679 19.438l-1.42 1.42-.601-.601a.65.65 0 10-.92.919l1.061 1.061a.65.65 0 00.92 0l1.88-1.88a.65.65 0 10-.92-.919zM16.16 20.654h4.291a.65.65 0 100-1.3H16.16a.65.65 0 100 1.3zM16.16 22.534h2.594a.65.65 0 100-1.3H16.16a.65.65 0 100 1.3z" />
      </svg>
    )}
    {size === 'xxl' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360">
        <path d="M269 59.9h-27.2c-.7-1.8-2.5-3.1-4.6-3.1h-18.1c-2.3-13.8-14-24.3-28-24.3h-22.2c-14 0-25.7 10.5-28 24.3h-18.1c-2.1 0-3.9 1.3-4.6 3.1H92.1C80.5 59.9 71 69.4 71 81v219c0 11.6 9.5 21.1 21.1 21.1H269c5.7 0 11-2.2 15-6.3 4-4 6.1-9.3 6.1-14.8V81c0-11.6-9.5-21.1-21.1-21.1zM122.8 102h114.4c2.8 0 5-2.2 5-5v-4h11.7v186.8H106V93h11.8v4c0 2.8 2.2 5 5 5zm22.7-35.2c2.8 0 5-2.2 5-5 0-10.6 8.3-19.3 18.4-19.3h22.2c10.1 0 18.4 8.7 18.4 19.3 0 2.8 2.2 5 5 5h17.7V92H127.8V66.8h17.7zm134.6 233.3c0 2.9-1.1 5.6-3.2 7.7-2.1 2.1-4.9 3.3-7.9 3.3H92.1c-6.1 0-11.1-5-11.1-11.1V81c0-6.1 5-11.1 11.1-11.1h25.7V83H101c-2.8 0-5 2.2-5 5v196.8c0 2.8 2.2 5 5 5h157.9c2.8 0 5-2.2 5-5V88c0-2.8-2.2-5-5-5h-16.7V69.9H269c6.1 0 11.1 5 11.1 11.1v219.1z" />
        <path d="M132 153.7c.9.9 2.2 1.5 3.5 1.5 1.3 0 2.6-.5 3.5-1.5l22.7-22.7c2-2 2-5.1 0-7.1s-5.1-2-7.1 0l-19.2 19.2-9.2-9.2c-1.9-2-5.1-2-7.1 0-2 1.9-2 5.1 0 7.1l12.9 12.7zM119.3 193.5l12.7 12.7c1 1 2.3 1.5 3.5 1.5 1.3 0 2.6-.5 3.5-1.5l22.7-22.6c2-1.9 2-5.1 0-7.1-1.9-2-5.1-2-7.1 0l-19.2 19.1-9.2-9.2c-2-2-5.1-2-7.1 0-1.8 2-1.8 5.2.2 7.1zM182.5 132.5h51.7c2.8 0 5-2.2 5-5s-2.2-5-5-5h-51.7c-2.8 0-5 2.2-5 5s2.2 5 5 5zM182.5 155.2h31.2c2.8 0 5-2.2 5-5s-2.2-5-5-5h-31.2c-2.8 0-5 2.2-5 5s2.2 5 5 5zM182.5 186.4h51.7c2.8 0 5-2.2 5-5s-2.2-5-5-5h-51.7c-2.8 0-5 2.2-5 5s2.2 5 5 5zM182.5 209h31.2c2.8 0 5-2.2 5-5s-2.2-5-5-5h-31.2c-2.8 0-5 2.2-5 5s2.2 5 5 5zM154.7 229.2l-19.2 19.1-9.2-9.2c-1.9-2-5.1-2-7.1 0-2 1.9-2 5.1 0 7.1l12.7 12.8c.9.9 2.2 1.5 3.5 1.5 1.3 0 2.6-.5 3.5-1.5l22.7-22.6c2-1.9 2-5.1 0-7.1-1.8-2.1-5-2.1-6.9-.1zM182.5 239h51.7c2.8 0 5-2.2 5-5s-2.2-5-5-5h-51.7c-2.8 0-5 2.2-5 5s2.2 5 5 5zM182.5 261.6h31.2c2.8 0 5-2.2 5-5s-2.2-5-5-5h-31.2c-2.8 0-5 2.2-5 5s2.2 5 5 5z" />
      </svg>
    )}
  </Icon>
)

ClipboardIcon.propTypes = {
  size: PropTypes.bool,
}

ClipboardIcon.defaultProps = {
  size: 'lg',
}

export default ClipboardIcon
