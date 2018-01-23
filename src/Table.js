import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  IconButton,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from 'material-ui';
import {
  DataTypeProvider,
  EditingState,
  PagingState,
  IntegratedPaging,
  SortingState,
  IntegratedSorting,
  RowDetailState
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableColumnResizing,
  TableHeaderRow,
  TableRowDetail,
  TableEditColumn,
  PagingPanel
} from '@devexpress/dx-react-grid-material-ui';
import DeleteIcon from 'material-ui-icons/Delete';

// Delete button
const DeleteButton = ({ onExecute }) => (
  <IconButton onClick={onExecute} title="Delete row">
    <DeleteIcon />
  </IconButton>
);

DeleteButton.propTypes = {
  onExecute: PropTypes.func.isRequired
};

// Row details
const RowDetail = ({ row }) => {
  if (typeof row.details === 'undefined') {
    return <div className="details">Unavailable</div>;
  } else {
    return (
      <div className="details">
        <p>{row.details.description}</p>
        <p>Price at open: ${parseFloat(row.details.open).toFixed(2)}</p>
        <p>
          Highest trade price since open: ${parseFloat(
            row.details.high
          ).toFixed(2)}
        </p>
        <p>
          Lowest trade price since open: ${parseFloat(row.details.low).toFixed(
            2
          )}
        </p>
        <p>
          Volume:{' '}
          {parseFloat(row.details.volume).toLocaleString(undefined, {
            maximumFractionDigits: 0
          })}
        </p>
        <p>
          Average volume:{' '}
          {parseFloat(row.details.average_volume).toLocaleString(undefined, {
            maximumFractionDigits: 0
          })}
        </p>
        <p>
          Highest trade price in the last 52 weeks: ${parseFloat(
            row.details.high_52_weeks
          ).toFixed(2)}
        </p>
        <p>
          Lowest trade price in the last 52 weeks: ${parseFloat(
            row.details.low_52_weeks
          ).toFixed(2)}
        </p>
        <p>
          Market cap:{' '}
          {parseFloat(row.details.market_cap).toLocaleString(undefined, {
            maximumFractionDigits: 0
          })}
        </p>
        <p>Dividend yield: {parseFloat(row.details.dividend_yield)}</p>
        <p>P/E ratio: {parseFloat(row.details.pe_ratio)}</p>
      </div>
    );
  }
};

RowDetail.propTypes = {
  row: PropTypes.any.isRequired
};

// Currency formatting
const CurrencyFormatter = ({ value }) =>
  `$${parseFloat(value).toLocaleString(undefined, {
    minimumFractionDigits: 2
  })}`;

CurrencyFormatter.propTypes = {
  value: PropTypes.string.isRequired
};

const CurrencyTypeProvider = props => (
  <DataTypeProvider formatterComponent={CurrencyFormatter} {...props} />
);

// Percentage formatting
const PercentageFormatter = ({ value }) => Math.round(value * 100) + '%';

PercentageFormatter.propTypes = {
  value: PropTypes.string.isRequired
};

const PercentageTypeProvider = props => (
  <DataTypeProvider formatterComponent={PercentageFormatter} {...props} />
);

// Column headings
const columnData = [
  { name: 'rank', title: 'Rank' },
  { name: 'symbol', title: 'Symbol' },
  { name: 'earnings_yield', title: 'Earnings Yield' },
  { name: 'roic', title: 'ROIC' },
  { name: 'value_calc', title: 'Score' },
  { name: 'value_weight', title: 'Weight' },
  { name: 'sale_price', title: 'Sale Price' },
  { name: 'shares_to_buy', title: 'Number of Shares' },
  { name: 'total_cost', title: 'Total Cost' }
];

const compareFloat = (a, b) => (parseFloat(a) < parseFloat(b) ? -1 : 1);

class TableComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageSizes: [5, 10, 15, 0],
      integratedSortingColumnExtensions: [
        { columnName: 'rank', compare: compareFloat },
        { columnName: 'earnings_yield', compare: compareFloat },
        { columnName: 'roic', compare: compareFloat },
        { columnName: 'value_calc', compare: compareFloat },
        { columnName: 'sale_price', compare: compareFloat },
        { columnName: 'total_cost', compare: compareFloat }
      ],
      tableColumnExtensions: [
        { columnName: 'rank', align: 'right' },
        { columnName: 'symbol', align: 'right' },
        { columnName: 'earnings_yield', align: 'right' },
        { columnName: 'roic', align: 'right' },
        { columnName: 'value_calc', align: 'right' },
        { columnName: 'value_weight', align: 'right' },
        { columnName: 'sale_price', align: 'right' },
        { columnName: 'shares_to_buy', align: 'right' },
        { columnName: 'total_cost', align: 'right' }
      ],
      defaultColumnWidths: [
        { columnName: 'rank', width: this.props.width / 15 }, //70
        { columnName: 'symbol', width: this.props.width / 12 }, //90
        { columnName: 'earnings_yield', width: this.props.width / 9 }, //120
        { columnName: 'roic', width: this.props.width / 10 }, //105
        { columnName: 'value_calc', width: this.props.width / 10 }, //105
        { columnName: 'value_weight', width: this.props.width / 10 }, //105
        { columnName: 'sale_price', width: this.props.width / 10 }, //105
        { columnName: 'shares_to_buy', width: this.props.width / 8 }, //150
        { columnName: 'total_cost', width: this.props.width / 9 } //120
      ],
      currencyColumns: ['sale_price', 'total_cost'],
      percentageColumns: ['value_weight'],
      deletingRows: []
    };
    this.commitChanges = ({ deleted }) =>
      this.setState({ deletingRows: deleted || this.state.deletingRows });
    this.cancelDelete = () => this.setState({ deletingRows: [] });
    this.deleteRows = () => {
      const data = this.props.data;
      const deleteId = this.state.deletingRows[0];
      const deleteElem = data.filter(row => deleteId === row.id)[0];
      this.props.onDelete(deleteElem.symbol);
      this.setState({ deletingRows: [] });
    };
  }

  render() {
    const {
      pageSizes,
      integratedSortingColumnExtensions,
      tableColumnExtensions,
      defaultColumnWidths,
      currencyColumns,
      percentageColumns,
      deletingRows
    } = this.state;
    const { classes, data } = this.props;

    return (
      <Paper style={{ marginTop: '40px', maxWidth: '1100px' }}>
        <Grid rows={data} columns={columnData}>
          <SortingState
            defaultSorting={[{ columnName: 'rank', direction: 'asc' }]}
          />
          <IntegratedSorting
            columnExtensions={integratedSortingColumnExtensions}
          />
          <PagingState defaultCurrentPage={0} defaultPageSize={5} />
          <IntegratedPaging />
          <CurrencyTypeProvider for={currencyColumns} />
          <PercentageTypeProvider for={percentageColumns} />
          <RowDetailState />
          <EditingState onCommitChanges={this.commitChanges} />
          <Table columnExtensions={tableColumnExtensions} />
          <TableColumnResizing defaultColumnWidths={defaultColumnWidths} />
          <TableHeaderRow showSortingControls />
          <TableEditColumn
            width={20}
            showDeleteCommand
            commandComponent={DeleteButton}
          />
          <TableRowDetail className="detail-row" contentComponent={RowDetail} />
          <PagingPanel pageSizes={pageSizes} />
        </Grid>
        <Dialog
          open={!!deletingRows.length}
          onClose={this.cancelDelete}
          classes={{ paper: classes.dialog }}
        >
          <DialogTitle>Hide Row</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to hide the following row?
            </DialogContentText>
            <Paper>
              <Grid
                rows={data.filter(row => deletingRows.indexOf(row.id) > -1)}
                columns={columnData}
              >
                <Table columnExtensions={tableColumnExtensions} />
                <TableHeaderRow />
              </Grid>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.cancelDelete} color="primary">
              Cancel
            </Button>
            <Button onClick={this.deleteRows} color="accent">
              Hide Row
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    );
  }
}

export default TableComponent;
