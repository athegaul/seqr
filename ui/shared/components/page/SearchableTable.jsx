import React from 'react'
import PropTypes from 'prop-types'
import { BaseSemanticInput, CheckboxTableGroup } from '../form/Inputs'
import { WORD_REPORT_EXCEL_GENERATION_QUERY_VARIABLES } from '../../utils/constants'
import { VerticalSpacer } from '../Spacers'

class SearchableTable extends React.PureComponent {
  static propTypes = {
    tableHeaders: PropTypes.array,
    // variable is used within getDerivedStateFromProps, but linter detects it as unused
    // eslint-disable-next-line react/no-unused-prop-types
    tableContent: PropTypes.array,
    rowsPerPage: PropTypes.number,
    getLinkData: PropTypes.func,
    displaySearch: PropTypes.bool,
    tableKey: PropTypes.string,
    clearData: PropTypes.bool,
    setSelectedAffectedPatient: PropTypes.func,
    handleAffectedPatientSelect: PropTypes.func,
  }

  constructor(props) {
    super(props)

    this.state = {
      tableDataHeaders: [],
      tableDataContent: [],
      filteredTableDataContent: props.clearData ? [] : this.getTableFilteredDataContent(),
      ascSortTableToggle: props.clearData ? false : this.getTableAscSortTableToggleValue(),
      selectedTablePage: props.clearData ? 0 : this.getTableSelectedDataPage(),
      numberOfTablePages: props.clearData ? 0 : this.getTableNumberOfPages(),
      tableSearchValue: props.clearData ? null : this.getTableDataSearchValue(),
      selectedTableHeader: props.clearData ? null : this.getTableSelectedHeaderValue(),
      checkedTableOptionKeys: props.clearData ? [] : this.getTableCheckedOptionKeys(),
      pageDataContent: props.clearData ? [] : this.getTablePageDataContent(),
    }

    this.handleRowOptionClick = this.handleRowOptionClick.bind(this)
    this.handleSort = this.handleSort.bind(this)
    this.handlePageSelect = this.handlePageSelect.bind(this)
    this.handleSearch = this.handleSearch.bind(this)

    this.removeTableLocalStorageData = this.removeTableLocalStorageData.bind(this)
    this.getTableLocalStorageData = this.getTableLocalStorageData.bind(this)
    this.setTableLocalStorageData = this.setTableLocalStorageData.bind(this)

    this.getTableDataSearchValue = this.getTableDataSearchValue.bind(this)
    this.getTablePageDataContent = this.getTablePageDataContent.bind(this)
    this.getTableDataPagesLength = this.getTableDataPagesLength.bind(this)
    this.getTableSelectedDataPage = this.getTableSelectedDataPage.bind(this)
    this.getTableNumberOfPages = this.getTableNumberOfPages.bind(this)
    this.getTableFilteredDataContent = this.getTableFilteredDataContent.bind(this)
    this.getTableAscSortTableToggleValue = this.getTableAscSortTableToggleValue.bind(this)
    this.getTableSelectedHeaderValue = this.getTableSelectedHeaderValue.bind(this)
    this.getTableCheckedOptionKeys = this.getTableCheckedOptionKeys.bind(this)
  }

  static getDerivedStateFromProps(props, currentState) {
    if (currentState.tableDataHeaders !== props.tableHeaders) {
      return {
        tableDataHeaders: props.tableHeaders,
      }
    }

    // eslint-disable-next-line prefer-destructuring
    let tableContent = props.tableContent
    if (currentState.selectedTableHeader !== null) {
      tableContent = SearchableTable.sortDataByHeader(currentState.selectedTableHeader, currentState.tableDataHeaders, props.tableContent, currentState.ascSortTableToggle, false)
    }
    if (currentState.tableDataContent !== tableContent && tableContent !== 0) {
      let dataToPaginate = tableContent
      if (currentState.tableSearchValue && currentState.tableSearchValue.length !== 0) {
        dataToPaginate = currentState.filteredTableDataContent
      }
      return {
        tableDataContent: tableContent,
        filteredTableDataContent: currentState.filteredTableDataContent,
        pageDataContent: SearchableTable.paginateData(currentState.selectedTablePage, dataToPaginate, props.rowsPerPage).paginatedData,
        numberOfTablePages: SearchableTable.getNumberOfPages(dataToPaginate, props.rowsPerPage),
      }
    }

    return null
  }

  static getDataLink(rowContent) {
    const linkData = WORD_REPORT_EXCEL_GENERATION_QUERY_VARIABLES.map((k, i) => `${k}=${rowContent[i]}`)
    return linkData.join('&').trim().replace(/\s/g, '%20')
  }

  static getNumberOfPages(dataContent, rowsPerPage) {
    if (dataContent.length === 0) {
      return 0
    }
    return Math.ceil(dataContent.length / rowsPerPage)
  }

  getTableCheckedOptionKeys() {
    return this.getTableLocalStorageData('checkedTableOptionKeys', [])
  }

  getTableDataSearchValue() {
    return this.getTableLocalStorageData('searchValue', null)
  }

  getTableAscSortTableToggleValue() {
    const ascToggleValueString = this.getTableLocalStorageData('ascSortTableToggle', '0')
    return ascToggleValueString === 'true'
  }

  getTableSelectedHeaderValue() {
    return this.getTableLocalStorageData('selectedTableHeader', null)
  }

  getTableFilteredDataContent() {
    const tableSearchValue = this.getTableDataSearchValue()
    const selectedTableHeader = this.getTableSelectedHeaderValue()
    const selectedAscSortTableToggle = this.getTableAscSortTableToggleValue()

    let dataToPaginate = this.props.tableContent
    if (tableSearchValue !== null) {
      dataToPaginate = SearchableTable.doSearch(tableSearchValue, this.props.tableContent, this.props.tableHeaders, selectedTableHeader, selectedAscSortTableToggle).filteredAndSortedTableDataContent
    }
    return dataToPaginate
  }

  getTablePageDataContent() {
    const tableDataContent = this.getTableFilteredDataContent()
    const selectedTableDataPage = this.getTableSelectedDataPage()
    return SearchableTable.paginateData(selectedTableDataPage, tableDataContent, this.props.rowsPerPage).paginatedData
  }

  getTableDataPagesLength(dataContent) {
    const dataToPaginate = this.getTablePageDataContent(dataContent, this.props.rowsPerPage)
    return SearchableTable.getNumberOfPages(dataToPaginate, this.props.rowsPerPage)
  }

  getTableNumberOfPages() {
    return SearchableTable.getNumberOfPages(this.getTableFilteredDataContent(), this.props.rowsPerPage)
  }

  getTableSelectedDataPage() {
    return Number.parseInt(this.getTableLocalStorageData('selectedTablePage', 0), 10)
  }

  getTableLocalStorageData(dataKey, substituteValue) {
    const tableLocalStorageData = JSON.parse(localStorage.getItem(`${this.props.tableKey}_${dataKey}`))
    if (tableLocalStorageData === null) {
      return substituteValue
    }
    return tableLocalStorageData.storageData
  }

  removeTableLocalStorageData(key) {
    localStorage.removeItem(`${this.props.tableKey}_${key}`)
  }

  setTableLocalStorageData(dataKey, value) {
    const data = {
      storageData: value,
    }
    localStorage.setItem(`${this.props.tableKey}_${dataKey}`, JSON.stringify(data))

  }

  handleRowOptionClick(rowContent, checkedState) {
    const displayNameIndex = this.props.tableHeaders.indexOf('Display Name')
    if (this.props.setSelectedAffectedPatient !== undefined) {
      this.props.setSelectedAffectedPatient(rowContent[displayNameIndex])
      this.props.handleAffectedPatientSelect(rowContent[displayNameIndex])
    }
    if (this.state.checkedTableOptionKeys.length === 0) {
      if (checkedState) {
        this.setTableLocalStorageData('checkedTableOptionKeys', [rowContent.join('')])
        this.setState({
          checkedTableOptionKeys: [rowContent.join('')],
        })
        this.props.getLinkData(`&${SearchableTable.getDataLink(rowContent)}`)
      } else {
        this.setTableLocalStorageData('checkedTableOptionKeys', [])
        this.setState({
          checkedTableOptionKeys: [],
        })
        this.props.getLinkData(null)
      }
    } else {
      this.setTableLocalStorageData('checkedTableOptionKeys', [rowContent.join('')])
      this.setState({
        checkedTableOptionKeys: [rowContent.join('')],
      })
      this.props.getLinkData(`&${SearchableTable.getDataLink(rowContent)}`)
    }
  }

  static sortDataByHeader(header, headers, dataContent, ascSortXLSTableToggle, shouldChangeToggle = true) {
    let ascToggle = ascSortXLSTableToggle
    if (shouldChangeToggle) {
      ascToggle = !ascSortXLSTableToggle
    }

    const headerValueIndex = headers.indexOf(header)

    if (headerValueIndex !== -1) {
      const mappedContentArray = dataContent.map((tableContentDataArray, index) => {
        return {
          arrayValue: tableContentDataArray[headerValueIndex],
          arrayPositionIndex: index,
        }
      })

      mappedContentArray.sort((a, b) => {
        if (Number.isNaN(Number.parseInt(a.arrayValue, 10)) && Number.isNaN(Number.parseInt(b.arrayValue, 10))) {
          if (ascToggle) {
            return a.arrayValue.localeCompare(b.arrayValue)
          }
          return b.arrayValue.localeCompare(a.arrayValue)
        }
        else if (!Number.isNaN(Number.parseInt(a.arrayValue, 10)) && !Number.isNaN(Number.parseInt(b.arrayValue, 10))) {
          if (ascToggle) {
            return parseInt(a.arrayValue, 10) - parseInt(b.arrayValue, 10)
          }
          return parseInt(b.arrayValue, 10) - parseInt(a.arrayValue, 10)
        }
        return 0
      })
      return mappedContentArray.map((mappedContent) => {
        return dataContent[mappedContent.arrayPositionIndex]
      })
    }
    return dataContent
  }

  static paginateData(newPage, dataToPaginate, rowsPerPage) {
    const startIndex = (newPage * rowsPerPage)
    let endIndex = (newPage * rowsPerPage) + (rowsPerPage - 1)

    if (endIndex > dataToPaginate.length) {
      endIndex = dataToPaginate.length - 1
    }
    return {
      paginatedData: dataToPaginate.slice(startIndex, endIndex + 1),
    }
  }

  handleSort(header) {
    const sortedContentArray = SearchableTable.sortDataByHeader(header, this.state.tableDataHeaders, this.state.tableDataContent, this.state.ascSortTableToggle)
    const sortedFilteredContentArray = SearchableTable.sortDataByHeader(header, this.state.tableDataHeaders, this.state.filteredTableDataContent, this.state.ascSortTableToggle)
    let dataToPaginate = sortedContentArray

    if (this.state.tableSearchValue && this.state.tableSearchValue.length > 0) {
      dataToPaginate = sortedFilteredContentArray
    }

    this.setTableLocalStorageData('selectedTableHeader', header)
    this.setTableLocalStorageData('ascSortTableToggle', !this.state.ascSortTableToggle)
    this.setState({
      tableDataContent: sortedContentArray,
      filteredTableDataContent: sortedFilteredContentArray,
      pageDataContent: SearchableTable.paginateData(this.state.selectedTablePage, dataToPaginate, this.props.rowsPerPage).paginatedData,
      ascSortTableToggle: !this.state.ascSortTableToggle,
      selectedTableHeader: header,
    })
  }

  handlePageSelect(newPage) {
    let dataToPaginate = this.state.tableDataContent
    if (this.state.tableSearchValue !== null && this.state.tableSearchValue.length > 0) {
      dataToPaginate = this.state.filteredTableDataContent
    }
    const { paginatedData } = SearchableTable.paginateData(newPage, dataToPaginate, this.props.rowsPerPage)
    this.setTableLocalStorageData('selectedTablePage', newPage)
    this.setState({
      pageDataContent: paginatedData,
      selectedTablePage: newPage,
    })
  }

  static tableDataContainsSearchData = (tableDataContentArray, searchValue) => {

    if (searchValue === undefined || searchValue === '') {
      return true
    }

    const filteredData = Object.values(tableDataContentArray).filter((tableDataContent) => {
      return tableDataContent.indexOf(searchValue) !== -1
    })
    return filteredData.length > 0
  }

  static doSearch(searchValue, content, headers, selectedHeader, ascTableToggle) {
    const tableDataContent = Object.values(content).map((tableDataContentRow) => {
      if (SearchableTable.tableDataContainsSearchData(tableDataContentRow, searchValue)) {
        return tableDataContentRow
      }
      return []
    })
    const filteredTableDataContent = Object.values(tableDataContent).filter((tableDataContentData) => {
      return tableDataContentData.length > 0
    })
    const filteredAndSortedTableDataContent = SearchableTable.sortDataByHeader(selectedHeader, headers, filteredTableDataContent, ascTableToggle, false)
    return {
      filteredAndSortedTableDataContent,
      filteredTableDataContent,
    }
  }

  handleSearch(searchValue) {
    const searchResult = SearchableTable.doSearch(searchValue, this.state.tableDataContent, this.state.tableDataHeaders, this.state.selectedTableHeader, this.state.ascSortTableToggle)
    const numberOfPages = SearchableTable.getNumberOfPages(searchResult.filteredTableDataContent, this.props.rowsPerPage)

    this.setTableLocalStorageData('searchValue', searchValue)
    this.setState({
      numberOfTablePages: numberOfPages,
      filteredTableDataContent: searchResult.filteredAndSortedTableDataContent,
      pageDataContent: SearchableTable.paginateData(0, searchResult.filteredAndSortedTableDataContent, this.props.rowsPerPage).paginatedData,
      selectedTablePage: 0,
      tableSearchValue: searchValue,
    })
  }

  render() {
    const checkboxTableStyle = {
      maxHeight: '180px',
      overflowY: 'auto',
    }
    const tableDataSearchStyle = {
      textAlign: 'center',
    }
    const searchInputStyle = {
      width: '250px',
    }

    return (
      <div>
        <VerticalSpacer height={45} />
        {this.props.displaySearch &&
        <div style={tableDataSearchStyle}>
          {/* eslint-disable-next-line jsx-a11y/label-has-for */}
          <label> Search uploaded data: </label>
          <BaseSemanticInput
            inputType="Input"
            onChange={(searchVal) => {
              this.handleSearch(searchVal)
            }}
            inputStyle={searchInputStyle}
            value={this.state.tableSearchValue === null ? '' : this.state.tableSearchValue}
          />
        </div>
        }
        <VerticalSpacer height={15} />
        <div style={checkboxTableStyle}>
          <CheckboxTableGroup
            tableHeaders={this.props.tableHeaders}
            tableDataContent={this.state.filteredTableDataContent}
            checkedOptionKeys={this.state.checkedTableOptionKeys}
            onRowOptionClick={this.handleRowOptionClick}
            tableKey={this.props.tableKey}
            handleSort={this.handleSort}
            selectedHeader={this.state.selectedTableHeader}
            handlePageSelect={this.handlePageSelect}
            numberOfPages={this.state.numberOfTablePages}
            selectedPage={this.state.selectedTablePage}
            pageDataContent={this.state.pageDataContent}
          />
        </div>
        <VerticalSpacer height={5} />
      </div>
    )
  }
}

export default SearchableTable
