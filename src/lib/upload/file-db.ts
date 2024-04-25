const DBVersion = 1;
export const FileDBName = "file-db";
export const FileDBStoreName = "fileStore";

const initIndexedDb = (dbName: string, stores: { name: string }[]) => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(dbName, DBVersion);
    request.onerror = () => {
      reject(request.error);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onupgradeneeded = () => {
      stores.forEach((store) => {
        request.result.createObjectStore(store.name);
      });
    };
  });
};

export const initFileDb = async () =>
  await initIndexedDb(FileDBName, [{ name: FileDBStoreName }]);
