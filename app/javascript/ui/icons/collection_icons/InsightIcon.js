import PropTypes from 'prop-types'
import Icon from '~/ui/icons/Icon'

const InsightIcon = ({ size }) => (
  <Icon fill>
    {size === 'lg' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path d="M10.455 20.732a.65.65 0 00-.714.579c-.014.131-.038.26-.073.384a.65.65 0 101.253.347c.053-.192.091-.392.113-.597a.65.65 0 00-.579-.713zM20.748 14.783h-.5a.65.65 0 100 1.3h.5a.65.65 0 100-1.3zM10.478 17.513a.65.65 0 00.887-.242 2.31 2.31 0 01.222-.323.648.648 0 10-1.006-.822 3.618 3.618 0 00-.345.501.648.648 0 00.242.886zM15.248 16.084h.5a.65.65 0 100-1.3h-.5a.65.65 0 100 1.3zM6.806 23.42h-.5a.65.65 0 100 1.3h.5a.65.65 0 100-1.3zM8.793 22.962a2.404 2.404 0 01-.333.206.65.65 0 10.591 1.158c.181-.093.354-.199.516-.319a.65.65 0 10-.774-1.045zM15.632 21.93a2.154 2.154 0 01-.37-.127.65.65 0 00-.522 1.191c.185.08.376.146.575.196a.65.65 0 00.317-1.26zM17.966 22.001h-.5a.65.65 0 100 1.3h.5a.65.65 0 100-1.3zM13.976 20.399a.65.65 0 00-1.232.416c.065.193.146.38.242.559a.651.651 0 001.146-.615 2.4 2.4 0 01-.156-.36zM20.466 22.001h-.5a.65.65 0 100 1.3h.5a.65.65 0 100-1.3zM12.393 13.387c.047.122.084.248.112.378a.65.65 0 101.272-.268c-.042-.2-.1-.395-.172-.581a.651.651 0 00-1.212.471zM13.203 16.775a.65.65 0 00.65-.65v-.454a.642.642 0 00.045-.267c-.018-.358-.309-.604-.683-.616a3.529 3.529 0 00-.604.084.65.65 0 00-.058 1.25v.003c0 .359.291.65.65.65zM8.806 11.883h.5a.65.65 0 100-1.3h-.5a.65.65 0 100 1.3zM11.046 12.041c.122.047.239.104.351.171a.648.648 0 00.891-.225.65.65 0 00-.226-.892 3.68 3.68 0 00-.546-.267.652.652 0 00-.47 1.213zM6.306 11.883h.5a.65.65 0 100-1.3h-.5a.65.65 0 100 1.3z" />
        <path d="M20.566 10.265h1.443c.241.574.809.979 1.47.979.879 0 1.595-.716 1.595-1.595s-.715-1.595-1.595-1.595c-.633 0-1.176.374-1.433.909h-1.48a3.663 3.663 0 00-3.658 3.658v2.823a2.36 2.36 0 01-2.358 2.357h-.794c-.113-.193-.313-.328-.552-.328s-.439.135-.552.328H6.306a.65.65 0 100 1.3h3.448v.275a.65.65 0 101.3 0v-.275h1.717c.115.104.265.172.432.172s.317-.068.432-.172h.915a3.657 3.657 0 003.593-3.02h.105a.65.65 0 100-1.3h-.041V12.62a2.36 2.36 0 012.359-2.355zm2.913-.91a.295.295 0 110 .59.295.295 0 010-.59zM25.135 8.476a.643.643 0 00.459-.19l.518-.518a.65.65 0 00-.919-.92l-.518.518a.65.65 0 00.46 1.11z" />
        <path d="M22.155 10.98a.648.648 0 00-.919-.001l-.518.518a.65.65 0 10.919.92l.518-.518a.65.65 0 000-.919zM23.353 7.77a.65.65 0 00.65-.65v-.732a.65.65 0 10-1.3 0v.732c0 .359.291.65.65.65zM26.571 9.006h-.732a.65.65 0 100 1.3h.732a.65.65 0 100-1.3zM24.127 12.84v-.732a.65.65 0 10-1.3 0v.732a.65.65 0 101.3 0zM25.66 10.883a.651.651 0 00-.919.92l.518.518a.647.647 0 00.919-.001.651.651 0 000-.919l-.518-.518zM21.128 8.363a.647.647 0 00.919-.001.651.651 0 000-.919l-.518-.518a.651.651 0 00-.919.92l.518.518zM22.117 17.055a.651.651 0 00.919-.013l1.155-1.19a.65.65 0 000-.906l-1.155-1.189a.65.65 0 10-.933.906l.716.736-.716.737a.65.65 0 00.014.919zM23.036 21.008a.651.651 0 00-.933.906l.131.135a.636.636 0 00-.384.603c0 .26.172.48.402.584l-.149.153a.65.65 0 00.933.907l1.155-1.19a.65.65 0 000-.906l-1.155-1.192z" />
      </svg>
    )}
    {size === 'xxl' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360">
        <path d="M75.1 286.9c-2 1.2-4.1 2.2-6.3 3-2.6.9-4 3.8-3 6.4.7 2 2.7 3.3 4.7 3.3.6 0 1.1-.1 1.7-.3 2.8-1 5.5-2.3 8.1-3.8 2.4-1.4 3.1-4.5 1.7-6.9-1.5-2.3-4.5-3.1-6.9-1.7zM227.7 173.7h-8c-2.8 0-5 2.2-5 5s2.2 5 5 5h8c2.8 0 5-2.2 5-5s-2.2-5-5-5zM104.1 189.6c-1.8 2.1-1.6 5.2.5 7.1.9.8 2.1 1.2 3.3 1.2 1.4 0 2.8-.6 3.8-1.7 1.5-1.8 3.2-3.4 5.1-4.8 2.2-1.7 2.6-4.8.9-7a4.96 4.96 0 00-7-.9c-2.4 1.8-4.6 3.9-6.6 6.1zM97.8 235.4c-2.8 0-5 2.2-5 5v8c0 2.8 2.2 5 5 5s5-2.2 5-5v-8c0-2.7-2.2-5-5-5zM97.2 264.5c-2.6-.9-5.5.5-6.4 3.1-.8 2.2-1.7 4.4-2.9 6.4-1.4 2.4-.6 5.4 1.8 6.8.8.5 1.7.7 2.5.7 1.7 0 3.4-.9 4.3-2.5 1.5-2.6 2.8-5.3 3.7-8.1 1-2.7-.4-5.5-3-6.4zM261.7 178.7c0-2.8-2.2-5-5-5h-8c-2.8 0-5 2.2-5 5s2.2 5 5 5h8c2.8 0 5-2.2 5-5zM49.7 292h-8c-2.8 0-5 2.2-5 5s2.2 5 5 5h8c2.8 0 5-2.2 5-5s-2.2-5-5-5zM139 173.7c-2.3 0-4.7.2-7 .5-2.7.4-4.6 3-4.2 5.7.4 2.5 2.5 4.2 4.9 4.2.3 0 .5 0 .8-.1 1.8-.3 3.7-.4 5.5-.4h1.7c2.8 0 5-2.2 5-5s-2.2-5-5-5H139zM161.7 183.7h8c2.8 0 5-2.2 5-5s-2.2-5-5-5h-8c-2.8 0-5 2.2-5 5s2.3 5 5 5zM142.1 217c-.6-2.7-3.3-4.4-6-3.8-2.7.6-4.4 3.3-3.8 6 .7 2.9 1.6 5.8 2.8 8.5.8 1.9 2.7 3 4.6 3 .7 0 1.4-.1 2-.4 2.5-1.1 3.7-4.1 2.5-6.6-.8-2.2-1.6-4.5-2.1-6.7zM41.7 126h8c2.8 0 5-2.2 5-5s-2.2-5-5-5h-8c-2.8 0-5 2.2-5 5s2.2 5 5 5zM99.1 126.2c2.3.3 4.6.8 6.9 1.5.5.2 1 .2 1.5.2 2.1 0 4.1-1.4 4.8-3.5.8-2.6-.6-5.4-3.2-6.3-2.8-.9-5.8-1.5-8.8-1.9-2.7-.3-5.2 1.7-5.5 4.4-.4 2.8 1.6 5.3 4.3 5.6zM70.7 126h8c2.8 0 5-2.2 5-5s-2.2-5-5-5h-8c-2.8 0-5 2.2-5 5s2.2 5 5 5zM125.7 143c.9 1.5 2.6 2.3 4.2 2.3.9 0 1.8-.2 2.7-.8 2.3-1.5 3-4.6 1.6-6.9-1.6-2.5-3.4-4.9-5.5-7.1-1.9-2-5.1-2.1-7.1-.2-2 1.9-2.1 5.1-.2 7.1 1.6 1.8 3.1 3.6 4.3 5.6zM245.9 245.1h-8c-2.8 0-5 2.2-5 5s2.2 5 5 5h8c2.8 0 5-2.2 5-5s-2.2-5-5-5zM161.7 241.5c-2.1-1-4.1-2.2-6-3.6-2.2-1.7-5.3-1.2-7 1-1.7 2.2-1.2 5.3 1 7 2.4 1.8 5 3.4 7.7 4.7.7.3 1.4.5 2.2.5 1.9 0 3.6-1 4.5-2.8 1.1-2.6.1-5.6-2.4-6.8zM216.9 245.1h-8c-2.8 0-5 2.2-5 5s2.2 5 5 5h8c2.8 0 5-2.2 5-5s-2.2-5-5-5zM131.2 160.4v7.8c0 2.8 2.2 5 5 5s5-2.2 5-5v-6c0-.8 0-1.5-.1-2.3-.1-2.8-2.5-4.9-5.2-4.7-2.8.1-4.9 2.4-4.7 5.2zM187.9 245.1h-8c-2.8 0-5 2.2-5 5s2.2 5 5 5h8c2.8 0 5-2.2 5-5s-2.2-5-5-5z" />
        <path d="M277.2 81.3c-8 0-14.9 5.3-17.2 12.6h-22.9c-25.5 0-46.2 20.7-46.2 46.2v25c0 3-.4 5.9-1.1 8.7-2.3.4-4.1 2.5-4.1 4.9 0 1.2.4 2.2 1.1 3.1-6 11.6-18.2 19.5-32.1 19.5H139c1.3-.9 2.2-2.4 2.2-4.1v-8c0-2.8-2.2-5-5-5s-5 2.2-5 5v8c0 1.7.9 3.2 2.2 4.1H41.7c-2.8 0-5 2.2-5 5s2.2 5 5 5h51.9c-.5 2.7-.8 5.4-.8 8.1 0 2.8 2.2 5 4.9 5.1h.1c2.7 0 5-2.2 5-4.9 0-2.4.3-4.7.8-7 .1-.4.1-.8.1-1.2h51.1c18.9 0 35.1-11.4 42.3-27.6h1.7c2.8 0 5-2.2 5-5 0-2.3-1.6-4.2-3.7-4.8.6-2.9.9-5.8.9-8.8v-25c0-20 16.2-36.2 36.2-36.2h22.7c2 7.7 9 13.4 17.4 13.4 9.9 0 18-8.1 18-18s-8.2-18.1-18.1-18.1zm0 26c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zM297.1 83.1c1.3 0 2.6-.5 3.6-1.5l5.9-6c1.9-2 1.9-5.1-.1-7.1-2-1.9-5.1-1.9-7.1.1l-5.9 6c-1.9 2-1.9 5.1.1 7.1 1 .9 2.2 1.4 3.5 1.4z" />
        <path d="M254.8 129.4l6-5.9c2-1.9 2-5.1.1-7.1s-5.1-2-7.1-.1l-6 5.9c-2 1.9-2 5.1-.1 7.1 1 1 2.3 1.5 3.6 1.5 1.3 0 2.5-.5 3.5-1.4zM276.5 75c2.8 0 5-2.2 5-5v-8.5c0-2.8-2.2-5-5-5s-5 2.2-5 5V70c0 2.8 2.2 5 5 5zM313.7 94.3h-8.5c-2.8 0-5 2.2-5 5s2.2 5 5 5h8.5c2.8 0 5-2.2 5-5s-2.2-5-5-5zM282.9 136v-8.4c0-2.8-2.2-5-5-5s-5 2.2-5 5v8.4c0 2.8 2.2 5 5 5s5-2.2 5-5zM301.3 115.2c-2-2-5.1-2-7.1 0s-2 5.1 0 7.1l6 6c1 1 2.3 1.5 3.5 1.5s2.6-.5 3.5-1.5c2-2 2-5.1 0-7.1l-5.9-6zM252.6 82.5c1 1 2.3 1.5 3.5 1.5s2.6-.5 3.5-1.5c2-2 2-5.1 0-7.1l-6-6c-2-2-5.1-2-7.1 0s-2 5.1 0 7.1l6.1 6zM268.3 158.3c-1.9-2-5.1-2-7.1-.1s-2 5.1-.1 7.1l12.5 12.8-12.5 12.8c-1.9 2-1.9 5.1.1 7.1 1 .9 2.2 1.4 3.5 1.4 1.3 0 2.6-.5 3.6-1.5l15.9-16.3c1.9-1.9 1.9-5 0-7l-15.9-16.3zM268.3 230.3c-1.9-2-5.1-2-7.1-.1s-2 5.1-.1 7.1l12.5 12.8-12.5 12.8c-1.9 2-1.9 5.1.1 7.1 1 .9 2.2 1.4 3.5 1.4 1.3 0 2.6-.5 3.6-1.5l15.9-16.3c1.9-1.9 1.9-5 0-7l-15.9-16.3z" />
      </svg>
    )}
  </Icon>
)

InsightIcon.propTypes = {
  size: PropTypes.bool,
}

InsightIcon.defaultProps = {
  size: 'lg',
}

export default InsightIcon
