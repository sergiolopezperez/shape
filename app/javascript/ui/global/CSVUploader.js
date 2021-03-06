// some inspiration taken from https://github.com/nzambello/react-csv-reader
import PropTypes from 'prop-types'
import Papa from 'papaparse'
import styled from 'styled-components'
import UploadIcon from '~/ui/icons/UploadIcon'
import InlineLoader from '~/ui/layout/InlineLoader'
import v from '~/utils/variables'

const StyledUploader = styled.div`
  height: 20px;
  font-size: 0.8rem;
  color: ${v.colors.commonMedium};
  font-family: ${v.fonts.sans};
  .icon {
    width: 20px;
    margin-right: 8px;
  }
  label {
    cursor: pointer;
    display: flex;
    align-items: flex-start;
  }
  input {
    display: none;
  }
`

class CSVUploader extends React.Component {
  state = {
    fileInputValue: '',
    loading: false,
  }

  handleFileUpload = e => {
    if (!e.target.files) return
    const { onFileLoaded } = this.props
    const reader = new FileReader()
    const filename = e.target.files[0].name

    reader.onload = event => {
      const csvData = Papa.parse(event.target.result, {
        error: err => console.warn('csv parse error', err),
      })
      onFileLoaded(csvData.data, filename)
      this.setState({ loading: false })
    }
    reader.readAsText(e.target.files[0])
    // clear out input
    this.setState({ fileInputValue: '', loading: true })
  }

  render() {
    return (
      <StyledUploader>
        {this.state.loading && <InlineLoader />}
        <label htmlFor="csv-upload">
          <UploadIcon />
          <span>Upload .CSV</span>
        </label>
        <input
          disabled={this.state.loading}
          type="file"
          id="csv-upload"
          accept="text/csv"
          value={this.state.fileInputValue}
          onChange={this.handleFileUpload}
        />
      </StyledUploader>
    )
  }
}

CSVUploader.propTypes = {
  onFileLoaded: PropTypes.func.isRequired,
}

export default CSVUploader
