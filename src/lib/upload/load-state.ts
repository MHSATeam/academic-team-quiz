import { FileDBStoreName } from "@/src/lib/upload/file-db";
import {
  getFileDb,
  uploadSetMachine,
} from "@/src/lib/upload/upload-state-machine";
import { Snapshot, StateFrom } from "xstate";

export async function saveMachineSnapshot(
  machine: StateFrom<typeof uploadSetMachine>,
) {
  const snapshot = uploadSetMachine.getPersistedSnapshot(machine);
  const db = await getFileDb();
  const store = db
    .transaction(FileDBStoreName, "readwrite")
    .objectStore(FileDBStoreName);
  store.put(snapshot, machine.context.stateId);
}

export async function getSnapshotNames() {
  const db = await getFileDb();
  const store = db
    .transaction(FileDBStoreName, "readwrite")
    .objectStore(FileDBStoreName);
  return new Promise<string[]>((resolve, reject) => {
    const request = store.getAllKeys();
    request.onsuccess = () => {
      resolve(request.result as string[]);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function loadMachineSnapshot(
  stateId: string,
): Promise<Snapshot<unknown>> {
  const db = await getFileDb();
  const store = db
    .transaction(FileDBStoreName, "readwrite")
    .objectStore(FileDBStoreName);
  return new Promise((resolve, reject) => {
    const request = store.get(stateId);
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteMachineSnapshot(stateId: string) {
  const db = await getFileDb();
  const store = db
    .transaction(FileDBStoreName, "readwrite")
    .objectStore(FileDBStoreName);
  return new Promise<void>((resolve, reject) => {
    const request = store.delete(stateId);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}
