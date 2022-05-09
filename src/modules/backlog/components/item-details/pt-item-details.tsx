import React from "react"

import { DropDownList, ListItemProps } from "@progress/kendo-react-dropdowns"

import { PtItem, PtUser } from "../../../../core/models/domain"
import {
  PtItemDetailsEditFormModel,
  ptItemToFormModel
} from "../../../../shared/models/forms/pt-item-details-edit-form"
import {
  ItemType,
  PT_ITEM_STATUSES,
  PT_ITEM_PRIORITIES
} from "../../../../core/constants"
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  ListGroupItemProps
} from "reactstrap"
import { Observable } from "rxjs"
import { getIndicatorClass } from "../../../../shared/helpers/priority-styling"

interface PtItemDetailsComponentProps {
  item: PtItem
  itemSaved: (item: PtItem) => void
  usersRequested: () => void
  users$: Observable<PtUser[]>
}

interface PtItemDetailsComponentState {
  showAddModal: boolean
  users: PtUser[]
}

export class PtItemDetailsComponent extends React.Component<
  PtItemDetailsComponentProps,
  PtItemDetailsComponentState
> {
  private itemForm: PtItemDetailsEditFormModel | undefined
  public itemTypesProvider = ItemType.List.map((t) => t.PtItemType)
  public statusesProvider = PT_ITEM_STATUSES
  public prioritiesProvider = PT_ITEM_PRIORITIES
  private selectedAssignee: PtUser | undefined

  constructor(props: any) {
    super(props)

    this.itemForm = ptItemToFormModel(this.props.item)
    this.state = {
      showAddModal: false,
      users: []
    }
    this.selectedAssignee = this.props.item.assignee
  }

  public onFieldChange(e: any, formFieldName: string) {
    if (!this.itemForm) {
      return
    }
    ;(this.itemForm as any)[formFieldName] = e.target.value
  }

  public onNonTextFieldChange(e: any, formFieldName: string) {
    this.onFieldChange(e, formFieldName)
    this.notifyUpdateItem()
  }

  public onBlurTextField() {
    this.notifyUpdateItem()
  }

  private notifyUpdateItem() {
    if (!this.itemForm) {
      return
    }
    const updatedItem = this.getUpdatedItem(
      this.props.item,
      this.itemForm,
      this.selectedAssignee!
    )
    this.props.itemSaved(updatedItem)
  }

  private getUpdatedItem(
    item: PtItem,
    itemForm: PtItemDetailsEditFormModel,
    assignee: PtUser
  ): PtItem {
    const updatedItem = Object.assign({}, item, {
      title: itemForm.title,
      description: itemForm.description,
      type: itemForm.typeStr,
      status: itemForm.statusStr,
      priority: itemForm.priorityStr,
      estimate: itemForm.estimate,
      assignee: assignee
    })
    return updatedItem
  }

  public assigneePickerOpen() {
    this.props.users$.subscribe((users: PtUser[]) => {
      if (users.length > 0) {
        this.setState({
          users: users,
          showAddModal: true
        })
      }
    })

    this.props.usersRequested()
  }

  private toggleModal() {
    this.setState({
      showAddModal: !this.state.showAddModal
    })
    return false
  }

  private selectAssignee(u: PtUser) {
    this.selectedAssignee = u
    this.itemForm!.assigneeName = u.fullName
    this.setState({
      showAddModal: false
    })
    this.notifyUpdateItem()
  }

  private itemTypeRender(li: any, itemProps: any) {
    const dataItem = itemProps.dataItem
    const itemTypeRow = (
      <>
        <img
          src={ItemType.imageResFromType(dataItem)}
          className="backlog-icon"
          alt="asd"
        />
        <span>{dataItem}</span>
      </>
    )
    return React.cloneElement(li, li.props, itemTypeRow)
  }

  private priorityRender(li: any, itemProps: ListItemProps) {
    const priority = itemProps.dataItem

    const priorityRow = (
      <span className={"badge " + getIndicatorClass(priority)}>{priority}</span>
    )

    return React.cloneElement(li, li.props, priorityRow)
  }

  public render() {
    if (!this.itemForm) {
      return null
    }
    const itemForm = this.itemForm
    return (
      <React.Fragment>
        <form>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Title</label>
            <div className="col-sm-10">
              <input
                className="form-control"
                defaultValue={itemForm.title}
                onBlur={() => this.onBlurTextField()}
                onChange={(e) => this.onFieldChange(e, "title")}
                name="title"
              />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Description</label>
            <div className="col-sm-10">
              <textarea
                className="form-control"
                defaultValue={itemForm.description}
                onBlur={() => this.onBlurTextField()}
                onChange={(e) => this.onFieldChange(e, "description")}
                name="description"
              ></textarea>
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Item Type</label>
            <div className="col-sm-10">
              <DropDownList
                data={this.itemTypesProvider}
                itemRender={this.itemTypeRender}
                defaultValue={itemForm.typeStr}
                onChange={(e) => this.onNonTextFieldChange(e, "typeStr")}
                name="itemType"
              />

              <select
                className="form-control"
                defaultValue={itemForm.typeStr}
                onChange={(e) => this.onNonTextFieldChange(e, "typeStr")}
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

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Status</label>
            <div className="col-sm-10">
              <DropDownList
                data={this.statusesProvider}
                defaultValue={itemForm.statusStr}
                onChange={(e) => this.onNonTextFieldChange(e, "statusStr")}
                name="status"
              />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Priority</label>
            <div className="col-sm-10">
              <DropDownList
                data={this.prioritiesProvider}
                itemRender={this.priorityRender}
                defaultValue={itemForm.priorityStr}
                onChange={(e) => this.onNonTextFieldChange(e, "priorityStr")}
                name="priority"
              />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Assignee</label>

            <div className="col-sm-10">
              <img
                src={this.selectedAssignee!.avatar}
                className="li-avatar rounded"
              />
              <span>{itemForm.assigneeName}</span>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => this.assigneePickerOpen()}
              >
                Pick assignee
              </button>
            </div>
          </div>
        </form>

        <Modal
          isOpen={this.state.showAddModal}
          toggle={() => this.toggleModal()}
        >
          <div className="modal-header">
            <h4 className="modal-title" id="modal-basic-title">
              Select Assignee
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
            <ul className="list-group list-group-flush">
              {this.state.users.map((u: PtUser) => {
                return (
                  <li
                    key={u.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                    onClick={() => this.selectAssignee(u)}
                  >
                    <span>{u.fullName}</span>
                    <span className="badge ">
                      <img
                        src={u.avatar}
                        className="li-avatar rounded mx-auto d-block"
                      />
                    </span>
                  </li>
                )
              })}
            </ul>
          </ModalBody>
          <ModalFooter />
        </Modal>
      </React.Fragment>
    )
  }
}
