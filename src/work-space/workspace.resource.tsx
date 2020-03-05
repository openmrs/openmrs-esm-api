import { Subject, Observable } from "rxjs";

const workspaceItem = new Subject<WorkSpaceItem>();

export function newWorkspaceItem(item: WorkSpaceItem) {
  workspaceItem.next(item);
}

export function getNewWorkspaceItem(): Observable<WorkSpaceItem> {
  return workspaceItem.asObservable();
}

export type WorkSpaceItem = {
  component: any;
  name: string;
  props: any;
  validations?: Function;
  inProgress: boolean;
  componentClosed?: Function;
};
