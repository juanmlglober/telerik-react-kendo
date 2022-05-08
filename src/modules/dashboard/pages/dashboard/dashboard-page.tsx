import React from "react";
import { DashboardFilter, DashboardRepository } from "../../repositories/dashboard.repository";
import { formatDateEnUs } from "../../../../core/helpers/date-utils";
import { ActiveIssuesComponent } from "../../components/active-issues/active-issues";
import { DashboardService } from "../../services/dashboard.service";
import { StatusCounts } from "../../models";
import { Button } from '@progress/kendo-react-buttons';


interface DateRange {
    dateStart: Date;
    dateEnd: Date;
}

interface DashboardPageState {
    statusCounts: StatusCounts;
    filter: DashboardFilter;
}

export class DashboardPage extends React.Component<any, DashboardPageState> {

    private dashboardRepo: DashboardRepository = new DashboardRepository();
    private dashboardService: DashboardService = new DashboardService(this.dashboardRepo);
    public filter: DashboardFilter = {};

    constructor(props: any) {
        super(props);
        this.state = {
            statusCounts: {
                activeItemsCount: 0,
                closeRate: 0,
                closedItemsCount: 0,
                openItemsCount: 0
            },
            filter: {}
        };
    }

    public componentDidMount() {
        this.refresh();
    }

    private onMonthRangeTap(months: number) {
        const range = this.getDateRange(months);
        this.filter = {
            userId: this.filter.userId,
            dateEnd: range.dateEnd,
            dateStart: range.dateStart
        };
        this.setState({
            filter: {
                userId: this.state.filter.userId,
                dateEnd: range.dateEnd,
                dateStart: range.dateStart
            }
        });
        this.refresh();
    }

    private getDateRange(months: number): DateRange {
        const now = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - months);
        return {
            dateStart: start,
            dateEnd: now
        };
    }

    private refresh() {
        this.dashboardService.getStatusCounts(this.filter)
            .then(result => {
                this.setState({
                    statusCounts: result
                });
            });
    }

    public render() {
        return (
            <div className="dashboard">

                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">

                    <div className="col-md order-md-first text-center text-md-left">
                        <h2>
                            <span className="small text-uppercase text-muted d-block">Statistics</span>
                            {
                                (this.state.filter.dateStart && this.state.filter.dateEnd) && (
                                    <span>  {formatDateEnUs(this.state.filter.dateStart)} - {formatDateEnUs(this.state.filter.dateEnd)}</span>
                                )
                            }
                        </h2>
                    </div>

                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="btn-group mr-2">
                            <Button type="button" fillMode="flat" className="btn btn-sm btn-outline-secondary" onClick={(e) => this.onMonthRangeTap(3)}>3 Months</Button>
                            <Button type="button" className="btn btn-sm btn-outline-secondary" onClick={(e) => this.onMonthRangeTap(6)}>6 Months</Button>
                            <Button type="button" className="btn btn-sm btn-outline-secondary" onClick={(e) => this.onMonthRangeTap(12)}>1 Year</Button>
                        </div >

                    </div >
                </div >

                <div className="card">
                    <h3 className="card-header">Active Issues</h3>
                    <div className="card-block">

                        <ActiveIssuesComponent statusCounts={this.state.statusCounts} />

                        <div className="row">
                            <div className="col-sm-12">
                                <h3>All issues</h3>

                            </div>
                        </div>
                    </div>
                </div >

            </div >
        );
    }
}
