import React from "react"
import { Chart, ChartTitle } from "@progress/kendo-react-charts"
import "hammerjs"
import { FilteredIssues } from "../../repositories/dashboard.repository"

interface DashBoardChartProps {
  issuesAll: FilteredIssues
}

interface DashBoardChartState {
  categories: Date[]
  itemsOpenByMonth: number[]
  itemsClosedByMonth: number[]
}

export class DashBoardChart extends React.Component<any, any> {
  constructor(props: DashBoardChartProps) {
    super(props)
    this.state = {
      categories: [],
      itemsOpenByMonth: [],
      itemsClosedByMonth: []
    }
  }

  public componentDidUpdate(
    prevsProps: DashBoardChartProps,
    prevState: DashBoardChartState
  ) {
    const cats = this.props.issuesAll.categories.map()
    const itemsOpenByMonth: number[] = []
    const itemsClosedByMonth: number[] = []

    this.props.issuesAll.items.forEach(item, (index) => {
      itemsOpenByMonth.push(item.open.length)
      itemsClosedByMonth.push(item.closed.length)
    })

    if (
      prevState.categories.length !== cats.length ||
      prevState.itemsOpenByMonth.length !== itemsOpenByMonth.length ||
      prevState.itemsClosedByMonth.length !== itemsClosedByMonth.length
    ) {
      this.setState({
        categories: cats,
        itemsOpenByMonth: itemsOpenByMonth,
        itemsClosedByMonth: itemsClosedByMonth
      })
    }
  }

  public render() {
    return (
      <Chart>
        <ChartTitle text="Active Issues" />
      </Chart>
    )
  }
}
