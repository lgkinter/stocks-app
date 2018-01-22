import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel
} from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import Tooltip from 'material-ui/Tooltip';

const columnData = [
  { id: 'rank', numeric: false, disablePadding: true, label: 'Rank' },
  { id: 'symbol', numeric: false, disablePadding: false, label: 'Symbol' },
  {
    id: 'earnings_yield',
    numeric: true,
    disablePadding: false,
    label: 'Earnings Yield'
  },
  { id: 'roic', numeric: true, disablePadding: false, label: 'ROIC' },
  { id: 'value_calc', numeric: true, disablePadding: false, label: 'Score' },
  {
    id: 'value_weight',
    numeric: true,
    disablePadding: false,
    label: 'Weight'
  },
  {
    id: 'sale_price',
    numeric: true,
    disablePadding: false,
    label: 'Sale Price'
  },
  {
    id: 'shares_to_buy',
    numeric: true,
    disablePadding: false,
    label: 'Number of Shares'
  },
  {
    id: 'total_cost',
    numeric: true,
    disablePadding: false,
    label: 'Total Cost'
  }
];

class EnhancedTableHead extends Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { order, orderBy } = this.props;

    return (
      <TableHead>
        <TableRow>
          {columnData.map(column => {
            return (
              <TableCell
                key={column.id}
                numeric={column.numeric}
                padding={column.disablePadding ? 'none' : 'dense'}
                sortDirection={orderBy === column.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={order}
                    onClick={this.createSortHandler(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
};

const styles = theme => ({
  root: {
    //width: '100%',
    marginTop: theme.spacing.unit * 3
  },
  table: {
    minWidth: 590
  },
  tableWrapper: {
    overflowX: 'auto'
  }
});

class EnhancedTable extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      order: 'asc',
      orderBy: 'rank',
      page: 0,
      rowsPerPage: 10
    };
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    let data;
    if (order === 'desc' && property === 'symbol') {
      data = this.props.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1));
    } else if (order === 'asc' && property === 'symbol') {
      data = this.props.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));
    } else if (order === 'desc') {
      data = this.props.data.sort(
        (a, b) => (parseFloat(b[orderBy]) < parseFloat(a[orderBy]) ? -1 : 1)
      );
    } else {
      data = this.props.data.sort(
        (a, b) => (parseFloat(a[orderBy]) < parseFloat(b[orderBy]) ? -1 : 1)
      );
    }

    this.setState({ data, order, orderBy });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes, data } = this.props;
    const { order, orderBy, rowsPerPage, page } = this.state;
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  return (
                    <TableRow hover tabIndex={-1} key={n.rank}>
                      <TableCell>{n.rank}</TableCell>
                      <TableCell>{n.symbol}</TableCell>
                      <TableCell numeric>{n.earnings_yield}</TableCell>
                      <TableCell numeric>{n.roic}</TableCell>
                      <TableCell numeric>{n.value_calc}</TableCell>
                      <TableCell numeric>{`${Math.round(
                        n.value_weight * 100
                      )}%`}</TableCell>
                      <TableCell numeric>{`$${n.sale_price}`}</TableCell>
                      <TableCell numeric>{n.shares_to_buy}</TableCell>
                      <TableCell numeric>
                        {`$${parseFloat(n.total_cost).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2
                          }
                        )}`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={12} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={12}
                  count={data.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  backIconButtonProps={{
                    'aria-label': 'Previous Page'
                  }}
                  nextIconButtonProps={{
                    'aria-label': 'Next Page'
                  }}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Paper>
    );
  }
}

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EnhancedTable);
