import React from "react"

import {
  PtItem,
  PtUser,
  PtTask,
  PtComment
} from "../../../../core/models/domain"
import { DetailScreenType } from "../../../../shared/models/ui/types/detail-screens"
import { Store } from "../../../../core/state/app-store"
import { BacklogRepository } from "../../repositories/backlog.repository"
import { BacklogService } from "../../services/backlog.service"
import { PtItemDetailsComponent } from "../../components/item-details/pt-item-details"
import { PtItemTasksComponent } from "../../components/item-tasks/pt-item-tasks"
// import { debug } from "util";
import { PtUserService } from "../../../../core/services/pt-user-service"
import { Observable, BehaviorSubject } from "rxjs"
import { PtNewTask } from "../../../../shared/models/dto/pt-new-task"
import { PtTaskUpdate } from "../../../../shared/models/dto/pt-task-update"
import { PtItemChitchatComponent } from "../../components/item-chitchat/pt-item-chitchat"
import { PtNewComment } from "../../../../shared/models/dto/pt-new-comment"

interface DetailPageState {
  item: PtItem | undefined
  selectedDetailsScreen: DetailScreenType
}

export class DetailPage extends React.Component<any, DetailPageState> {
  private store: Store = new Store()
  private backlogRepo: BacklogRepository = new BacklogRepository()
  private backlogService: BacklogService = new BacklogService(
    this.backlogRepo,
    this.store
  )
  private ptUserService: PtUserService = new PtUserService(this.store)

  private itemId = 0
  private users$: Observable<PtUser[]> = this.store.select<PtUser[]>("users")
  public tasks$: BehaviorSubject<PtTask[]> = new BehaviorSubject<PtTask[]>([])
  public comments$: BehaviorSubject<PtComment[]> = new BehaviorSubject<
    PtComment[]
  >([])
  public currentUser: PtUser | undefined

  private screenPositionMap: {
    [key in DetailScreenType | number]: number | DetailScreenType
  } = {
    0: "details",
    1: "tasks",
    2: "chitchat",
    details: 0,
    tasks: 1,
    chitchat: 2
  }

  constructor(props: any) {
    super(props)

    const { id, screen } = this.props.match.params
    this.itemId = id
    this.currentUser = this.store.value.currentUser

    this.state = {
      item: undefined,
      selectedDetailsScreen: screen ? screen : "details"
    }
  }

  public componentDidMount() {
    this.refresh()
  }

  public componentDidUpdate(prevsProps: any, prevState: DetailPageState) {}

  private refresh() {
    this.backlogService.getPtItem(this.itemId).then((item) => {
      this.setState({
        item: item
      })
      this.tasks$.next(item.tasks)
      this.comments$.next(item.comments)
    })
  }

  public onScreenSelected(screen: DetailScreenType) {
    this.setState({
      selectedDetailsScreen: screen
    })
    this.props.history.push(`/detail/${this.itemId}/${screen}`)
  }

  public onItemSaved(item: PtItem) {
    this.backlogService.updatePtItem(item).then((updateItem: PtItem) => {
      this.setState({
        item: updateItem
      })
    })
  }

  public onAddNewTask(newTask: PtNewTask) {
    if (this.state.item) {
      this.backlogService
        .addNewPtTask(newTask, this.state.item)
        .then((nextTask) => {
          this.tasks$.next([nextTask].concat(this.tasks$.value))
        })
    }
  }

  public onUpdateTask(taskUpdate: PtTaskUpdate) {
    if (this.state.item) {
      if (taskUpdate.delete) {
        this.backlogService
          .deletePtTask(this.state.item, taskUpdate.task)
          .then((ok) => {
            if (ok) {
              const newTasks = this.tasks$.value.filter((task) => {
                if (task.id !== taskUpdate.task.id) {
                  return task
                }
              })
              this.tasks$.next(newTasks)
            }
          })
      } else {
        this.backlogService
          .updatePtTask(
            this.state.item,
            taskUpdate.task,
            taskUpdate.toggle,
            taskUpdate.newTitle
          )
          .then((updatedTask) => {
            const newTasks = this.tasks$.value.map((task) => {
              if (task.id === updatedTask.id) {
                return updatedTask
              } else {
                return task
              }
            })
            this.tasks$.next(newTasks)
          })
      }
    }
  }

  public onAddNewComment(newComment: PtNewComment) {
    if (this.state.item) {
      this.backlogService
        .addNewPtComment(newComment, this.state.item)
        .then((nextComment) => {
          this.comments$.next([nextComment].concat(this.comments$.value))
        })
    }
  }

  public onUsersRequested() {
    this.ptUserService.fetchUsers()
  }

  private screenRender(screen: DetailScreenType, item: PtItem) {
    switch (screen) {
      case "details":
        return (
          <PtItemDetailsComponent
            item={item}
            users$={this.users$}
            usersRequested={() => this.onUsersRequested()}
            itemSaved={(item) => this.onItemSaved(item)}
          />
        )
      case "tasks":
        return (
          <PtItemTasksComponent
            tasks$={this.tasks$}
            addNewTask={(newTask) => this.onAddNewTask(newTask)}
            updateTask={(taskUpdate) => this.onUpdateTask(taskUpdate)}
          />
        )
      case "chitchat":
        return (
          <PtItemChitchatComponent
            comments$={this.comments$}
            currentUser={this.currentUser!}
            addNewComment={(newComment) => this.onAddNewComment(newComment)}
          />
        )

      default:
        return (
          <PtItemDetailsComponent
            item={item}
            users$={this.users$}
            usersRequested={() => this.onUsersRequested()}
            itemSaved={(item) => this.onItemSaved(item)}
          />
        )
    }
  }

  public render() {
    const item = this.state.item

    if (!item) {
      return null
    }
    return (
      <div>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
          <h1 className="h2">{item.title}</h1>
          <div className="btn-toolbar mb-2 mb-md-0">
            <div className="btn-group mr-2">
              <button
                type="button"
                onClick={(e) => this.onScreenSelected("details")}
                className={
                  "btn btn-sm btn-outline-secondary " +
                    this.state.selectedDetailsScreen ===
                  "details"
                    ? "active"
                    : ""
                }
              >
                Details
              </button>

              <button
                type="button"
                onClick={(e) => this.onScreenSelected("tasks")}
                className={
                  "btn btn-sm btn-outline-secondary " +
                    this.state.selectedDetailsScreen ===
                  "tasks"
                    ? "active"
                    : ""
                }
              >
                Tasks
              </button>

              <button
                type="button"
                onClick={(e) => this.onScreenSelected("chitchat")}
                className={
                  "btn btn-sm btn-outline-secondary " +
                    this.state.selectedDetailsScreen ===
                  "chitchat"
                    ? "active"
                    : ""
                }
              >
                Chitchat
              </button>
            </div>
          </div>
        </div>

        {this.screenRender(this.state.selectedDetailsScreen, item)}
      </div>
    )
  }
}
