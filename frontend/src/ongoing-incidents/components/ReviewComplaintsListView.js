import React, { useState, useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { useSelector, useDispatch } from "react-redux";
import {
  loadAllIncidents,
  loadAllIncidentsRequest,
  updateIncidentSearchFilter,
} from "../../incident/state/incidentActions";
import * as incidentsApi from "../../api/incident";

import SearchForm from "./SearchForm";
import { Grid, Button } from "@material-ui/core";
import Chip from '@material-ui/core/Chip';

import IncidentListReview from "./IncidentListReview";
import { useIntl } from "react-intl";


const styles = (theme) => ({
  root: {
    width: "100%",
    overflowX: "auto",
    marginTop: theme.spacing.unit * 3,
    display: "flex",
    flexWrap: "wrap",
    padding: "24px 31px",
  },
  exportContainer: {
    marginTop: "20px",
    marginLeft: "auto",
  },
  exportButton: {
    marginLeft: "10px",
  },
  chip:{
    padding: theme.spacing.unit,
    fontSize: '1.1rem',
    fontWeight: 400,
  }
});

function ReviewComplaintsListView({ classes, ...props }) {
  const [filters, setFilters] = useState({});
  filters["incidentType"] = "COMPLAINT";
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(updateIncidentSearchFilter(filters));
  });
  const categories = useSelector((state) => state.shared.categories);
  const incidentSearchFilter = useSelector(
    (state) => state.incident.incidents.searchFilter
  );
  let incidents = useSelector((state) => state.incident.incidents);
  const { formatMessage: f } = useIntl();

  const handlePageChange = (event, newPage) =>
    dispatch(loadAllIncidents(incidentSearchFilter, newPage + 1));

  const handleSearchClick = (filters, page) => {
    if (filters) {
      setFilters(filters);
    } else {
      setFilters({});
    }
    dispatch(loadAllIncidents(filters, page));
  };

  const handleExportClick = async (exportType) => {
    filters["export"] = exportType;

    try {
      const response = await incidentsApi.getIncidents(filters);
      if (exportType === "csv") {
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "incidents." + exportType);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        var w = window.open("about:blank");
        w.document.open();
        w.document.write(response);
        w.document.close();
      }
    } catch {}
  };

  return (
    <Paper className={classes.root}>
      <h3>
        {f({ id: "request.management.incident.review.review_complaints" })}
      </h3>
      <Grid container direction={"row"} className={classes.exportContainer}>
        <Grid item xs={12} sm={12}>
          <SearchForm
            incidentType="COMPLAINT"
            listType="review"
            categories={categories}
            handleSearchClick={handleSearchClick}
            filters={filters}
            showClosed={false}
            {...props}
          />
        </Grid>
      </Grid>
      <Grid container className={classes.exportContainer}>
        <Grid item xs={6}>
          <Button
            variant={"contained"}
            onClick={() => handleExportClick("csv")}
            className={classes.exportButton}
          >
            {f({ id: "request.management.incident.review.export_csv" })}
          </Button>
          <Button
            variant={"contained"}
            onClick={() => handleExportClick("html")}
            className={classes.exportButton}
          >
            {f({ id: "request.management.incident.review.export_pdf" })}
          </Button>
        </Grid>

        <Grid item xs={6} style={{ textAlign:"right"}}>
          <Chip label={"Total: "+incidents.paging.count} className={classes.chip} color="primary" />
        </Grid>
      </Grid>
      <Grid container direction={"row"} className={classes.exportContainer}>
        <Grid item xs={12} sm={12}>
          <IncidentListReview
            incidentType="COMPLAINT"
            incidents={incidents}
            pageNumber={incidents.paging.pageNumber - 1}
            count={incidents.paging.count}
            handleRowClick={(incidentId) =>
              props.history.push(`/app/review/${incidentId}`)
            }
            handlePageChange={handlePageChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default withStyles(styles)(ReviewComplaintsListView);
