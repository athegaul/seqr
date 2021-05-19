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
    multiSelectEnabled: PropTypes.bool,
    clearData: PropTypes.bool,
  }

  constructor(props) {
    super(props)

    this.state = {
      tableDataHeaders: [],
      tableDataContent: [],
      filteredTableDataContent: props.clearData ? [] : SearchableTable.paginateData(0, props.tableContent, props.rowsPerPage).paginatedData,
      ascSortTableToggle: false,
      selectedTablePage: 0,
      numberOfTablePages: props.clearData ? 0 : SearchableTable.getNumberOfPages(props.tableContent, props.rowsPerPage),
      tableSearchValue: null,
      selectedTableHeader: null,
      checkedTableOptionKeys: [],
      checkedTableOptionIndexes: [],
      pageDataContent: [],
      multiSelectEnabled: (props.multiSelectEnabled === undefined) ? false : props.multiSelectEnabled,
      dataRenderToggle: false,
    }

    this.handleRowOptionClick = this.handleRowOptionClick.bind(this)
    this.handleSort = this.handleSort.bind(this)
    this.handlePageSelect = this.handlePageSelect.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
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

  handleRowOptionClick(rowContent, checkedState, index) {
    if (this.state.multiSelectEnabled !== true) {
      if (this.state.checkedTableOptionKeys.length === 0) {
        if (checkedState) {
          this.setState({
            checkedTableOptionKeys: [rowContent.join('')],
          })
          this.props.getLinkData(`&${SearchableTable.getDataLink(rowContent)}`)
        } else {
          this.setState({
            checkedTableOptionKeys: [],
          })
          this.props.getLinkData(null)
        }
      } else {
        this.setState({
          checkedTableOptionKeys: [rowContent.join('')],
        })
        this.props.getLinkData(`&${SearchableTable.getDataLink(rowContent)}`)
      }
    } else if (checkedState) {
      const checkedOptionIndexes = this.state.checkedTableOptionIndexes
      const arrayIndex = checkedOptionIndexes.indexOf((this.state.selectedTablePage * this.props.rowsPerPage) + index)
      if (arrayIndex === -1) {
        checkedOptionIndexes.push((this.state.selectedTablePage * this.props.rowsPerPage) + index)
      }
      const checkedOptionKeys = this.state.checkedTableOptionKeys
      const keysIndex = checkedOptionIndexes.indexOf(rowContent.join(''))
      if (keysIndex === -1) {
        checkedOptionKeys.push(rowContent.join(''))
      }
      this.setState({
        checkedTableOptionIndexes: checkedOptionIndexes,
        checkedTableOptionKeys: checkedOptionKeys,
        dataRenderToggle: !this.state.dataRenderToggle,
      })
      this.props.getLinkData(checkedOptionIndexes)
    } else {
      const checkedOptionIndexes = this.state.checkedTableOptionIndexes
      const arrayIndex = checkedOptionIndexes.indexOf((this.state.selectedTablePage * this.props.rowsPerPage) + index)
      if (arrayIndex !== -1) {
        checkedOptionIndexes.slice((this.state.selectedTablePage + this.props.rowsPerPage) + index, 1)
      }
      const checkedOptionKeys = this.state.checkedTableOptionKeys
      const keyIndex = checkedOptionKeys.indexOf(rowContent.join(''))
      if (keyIndex !== -1) {
        checkedOptionKeys.slice(keyIndex, 1)
      }
      this.setState({
        checkedTableOptionIndexes: checkedOptionIndexes,
        checkedTableOptionKeys: checkedOptionKeys,
        dataRenderToggle: !this.state.dataRenderToggle,
      })
      this.props.getLinkData(checkedOptionIndexes)
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

    this.setState({
      numberOfTablePages: SearchableTable.getNumberOfPages(searchResult.filteredTableDataContent, this.props.rowsPerPage),
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
            dataRenderToggle={this.state.dataRenderToggle}
          />
        </div>
        <VerticalSpacer height={5} />
      </div>
    )
  }
}

export default SearchableTable
