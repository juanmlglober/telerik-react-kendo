import React from "react"

import { Input, TextArea } from "@progress/kendo-react-inputs"
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridPageChangeEvent,
  GridRowClickEvent,
  GridSortChangeEvent
} from "@progress/kendo-react-grid"

import { BacklogService } from "../../services/backlog.service"
import { BacklogRepository } from "../../repositories/backlog.repository"
import { Store } from "../../../../core/state/app-store"
import { PresetType } from "../../../../core/models/domain/types"
import { PtItem } from "../../../../core/models/domain"
import { ItemType } from "../../../../core/constants"

import "./backlog-page.css"

import { AppPresetFilter } from "../../../../shared/components/preset-filter/preset-filter"
import { Modal, ModalBody, ModalFooter, Button } from "reactstrap"
import { PtNewItem } from "../../../../shared/models/dto/pt-new-item"
import { EMPTY_STRING } from "../../../../core/helpers"
import { getIndicatorClass } from "../../../../shared/helpers/priority-styling"
import {
  SortDescriptor,
  orderBy,
  State,
  process
} from "@progress/kendo-data-query"

interface BacklogPageState {
  currentPreset: PresetType
  items: PtItem[]
  showAddModal: boolean
  newItem: PtNewItem
  gridState: State
}

export class BacklogPage extends React.Component<any, BacklogPageState> {
  private store: Store = new Store()
  private backlogRepo: BacklogRepository = new BacklogRepository()
  private backlogService: BacklogService = new BacklogService(
    this.backlogRepo,
    this.store
  )

  public items: PtItem[] = []
  public itemTypesProvider = ItemType.List.map((t) => t.PtItemType)

  constructor(props: any) {
    super(props)
    const { preset } = this.props.match.params
    this.state = {
      currentPreset: preset ? preset : "open",
      items: [],
      showAddModal: false,
      newItem: this.initModalNewItem(),
      gridState: {
        skip: 0,
        take: 10,
        sort: []
      }
    }
  }

  public componentDidMount() {
    this.refresh()
  }

  public componentDidUpdate(prevsProps: any, prevState: BacklogPageState) {
    if (this.state.currentPreset !== prevState.currentPreset) {
      this.refresh()
    }
  }

  public getIndicatorImage(item: PtItem) {
    return ItemType.imageResFromType(item.type)
  }

  public getPriorityClass(item: PtItem): string {
    const indicatorClass = getIndicatorClass(item.priority)
    return indicatorClass
  }

  private onSelectPresetTap(preset: PresetType) {
    this.setState({
      currentPreset: preset
    })
    this.props.history.push(`/backlog/${[preset]}`)
  }

  private refresh() {
    this.backlogService.getItems(this.state.currentPreset).then((ptItems) => {
      this.setState({
        items: ptItems
      })
    })
  }

  public listItemTap(item: PtItem) {
    // navigate to detail page
    this.props.history.push(`/detail/${item.id}`)
  }

  private onSelectionChange(event: GridRowClickEvent) {
    const selItem = event.dataItem as PtItem
    this.props.history.push(`/detail/${selItem.id}`)
  }
  
  private toggleModal() {
    this.setState({
      showAddModal: !this.state.showAddModal
    })
  }

  public onFieldChange(e: any, formFieldName: string) {
    if (!this.state.newItem) {
      return
    }

    this.setState({
      newItem: { ...this.state.newItem, [formFieldName]: e.target.value }
    })
  }

  public onAddSave() {
    if (this.store.value.currentUser) {
      this.backlogService
        .addNewPtItem(this.state.newItem, this.store.value.currentUser)
        .then((nextItem: PtItem) => {
          this.setState({
            showAddModal: false,
            newItem: this.initModalNewItem(),
            items: [nextItem, ...this.state.items]
          })
        })
    }
  }

  private initModalNewItem(): PtNewItem {
    return {
      title: EMPTY_STRING,
      description: EMPTY_STRING,
      typeStr: "PBI"
    }
  }

  private onDataStateChange(event: GridDataStateChangeEvent) {
    this.setState({
      gridState: event.dataState
    })
  }

  public render() {
    const rows = this.state.items.map((i) => {
      return (
        <tr
          key={i.id}
          className="pt-table-row"
          onClick={(e) => this.listItemTap(i)}
        >
          <td>
            <img
              src={this.getIndicatorImage(i)}
              className="backlog-icon"
              alt="img"
            />
          </td>
          <td>
            <img
              src={i.assignee.avatar}
              className="li-avatar rounded mx-auto d-block"
              alt="img"
            />
          </td>
          <td>
            <span className="li-title">{i.title}</span>
          </td>

          <td>
            <span>{i.status}</span>
          </td>

          <td>
            <span className={"badge " + this.getPriorityClass(i)}>
              {i.priority}
            </span>
          </td>
          <td>
            <span className="li-estimate">{i.estimate}</span>
          </td>
          <td>
            <span className="li-date">{i.dateCreated.toDateString()}</span>
          </td>
        </tr>
      )
    })

    const gridData = process(this.state.items, this.state.gridState)

    return (
      <React.Fragment>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
          <h1 className="h2">Backlog</h1>
          <div className="btn-toolbar mb-2 mb-md-0">
            <AppPresetFilter
              selectedPreset={this.state.currentPreset}
              onSelectPresetTap={(p) => this.onSelectPresetTap(p)}
            />

            <div className="btn-group mr-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => this.toggleModal()}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <Grid
          data={gridData}
          style={{ height: 400 }}
          take={this.state.gridState.take}
          skip={this.state.gridState.skip}
          total={this.state.items.length}
          pageable={true}
          sort={this.state.gridState.sort}
          sortable={true}
          onDataStateChange={(e) => this.onDataStateChange(e)}
          onRowClick={(e) => this.onSelectionChange(e)}
        >
          <GridColumn
            field="type"
            title=" "
            width={45}
            cell={(props) => {
              return (
                <td>
                  <img
                    src={this.getIndicatorImage(props.dataItem)}
                    alt="data-item"
                    className="backlog-icon"
                  />
                </td>
              )
            }}
          />
          <GridColumn
            field="assignee"
            title="assignee"
            width={200}
            cell={(props) => {
              return (
                <td>
                  <div>
                    <img
                      src={props.dataItem.assignee.avatar}
                      alt="avatar"
                      className="li-avatar rounded mx-auto"
                    />
                    <span style={{ marginLeft: 10 }}>
                      {props.dataItem.assignee.fullName}
                    </span>
                  </div>
                </td>
              )
            }}
          />
          <GridColumn field="title" title="title" />
          <GridColumn
            field="priority"
            title="priority"
            width={100}
            cell={(props) => {
              return (
                <td>
                  <span
                    className={"badge " + this.getPriorityClass(props.dataItem)}
                  >
                    {props.dataItem.priority}
                  </span>
                </td>
              )
            }}
          />
          <GridColumn field="estimate" title="estimate" width={100} />
          <GridColumn
            field="dateCreated"
            title="Created"
            width={160}
            cell={(props) => {
              return (
                <td>
                  <span className="li-date">
                    {props.dataItem.dateCreated.toDateString()}
                  </span>
                </td>
              )
            }}
          />
        </Grid>

        <Modal
          isOpen={this.state.showAddModal}
          toggle={() => this.toggleModal()}
          className={this.props.className}
        >
          <div className="modal-header">
            <h4 className="modal-title" id="modal-basic-title">
              Add New Item
            </h4>
            <button
              type="button"
              className="close"
              onClick={() => this.toggleModal()}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <ModalBody>
            <form>
              <div className="form-group row">
                <div className="col-sm-10">
                  <Input
                    label="Title"
                    defaultValue={this.state.newItem.title}
                    onChange={(e) => this.onFieldChange(e, "title")}
                    name="title"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div className="form-group row">
                <label className="col-sm-2 col-form-label">Description</label>
                <div className="col-sm-12">
                  <TextArea
                    defaultValue={this.state.newItem.description}
                    onChange={(e) => this.onFieldChange(e, "description")}
                    name="description"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div className="form-group row">
                <label className="col-sm-2 col-form-label">Item Type</label>
                <div className="col-sm-12">
                  <select
                    className="form-control"
                    defaultValue={this.state.newItem.typeStr}
                    onChange={(e) => this.onFieldChange(e, "typeStr")}
                    name="itemType"
                  >
                    {this.itemTypesProvider.map((t) => {
                      return (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => this.toggleModal()}>
              Cancel
            </Button>
            <Button color="primary" onClick={() => this.onAddSave()}>
              Save
            </Button>{" "}
          </ModalFooter>
        </Modal>
      </React.Fragment>
    )
  }
}
