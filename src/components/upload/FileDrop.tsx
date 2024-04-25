import { DragEvent as ReactDragEvent, useEffect, useState } from "react";

import { Download } from "lucide-react";

type FileDropProps = {
  onReceiveFiles: (file: File) => void;
};

enum DropZoneState {
  NoFile,
  Valid,
  Invalid,
  Dropped,
}

export default function FileDrop(props: FileDropProps) {
  const [dropZoneState, setDropZoneState] = useState(DropZoneState.NoFile);

  useEffect(() => {
    const drop = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener("drop", drop);
    window.addEventListener("dragover", drop);

    return () => {
      window.removeEventListener("drop", drop);
      window.removeEventListener("dragover", drop);
    };
  }, []);

  const isValidDrop = (dataTransfer: DataTransfer): boolean => {
    return isValidFileList(getFiles(dataTransfer));
  };

  const isValidFileList = (files: File[]): boolean => {
    return files.every(isValidFile) && files.length === 1;
  };

  const isValidFile = (file: File): boolean => {
    return file.size > 0 && file.type === "application/pdf";
  };

  const showInvalidFile = () => {
    setDropZoneState(DropZoneState.Invalid);
    setTimeout(() => {
      setDropZoneState(DropZoneState.NoFile);
    }, 500);
  };

  const onDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!isValidDrop(event.dataTransfer)) {
      showInvalidFile();
      return;
    }

    setDropZoneState(DropZoneState.NoFile);
    const files = getFiles(event.dataTransfer);
    props.onReceiveFiles(files[0]);
  };

  const getFiles = (dataTransfer: DataTransfer): File[] => {
    const files: File[] = [];

    if (dataTransfer.items) {
      [...dataTransfer.items].forEach((item) => {
        if (item.kind === "file") {
          const file = item.getAsFile();

          if (file) {
            files.push(file);
          }
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...dataTransfer.files].forEach((file) => {
        files.push(file);
      });
    }

    return files;
  };

  const openFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.addEventListener("change", () => {
      if (input.files && input.files.length > 0) {
        const filesArray = Array.from(input.files);

        if (isValidFileList(filesArray)) {
          props.onReceiveFiles(filesArray[0]);
          setDropZoneState(DropZoneState.NoFile);
        } else {
          showInvalidFile();
        }
      }
    });
    input.click();
  };

  return (
    <div
      className={
        "grow relative overflow-hidden flex items-center justify-center rounded-md group p-8 dark:text-white" +
        (dropZoneState === DropZoneState.NoFile ? " hover:cursor-pointer" : "")
      }
      onDrop={onDrop}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setDropZoneState(DropZoneState.Valid);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDropZoneState(DropZoneState.NoFile);
      }}
      onClick={() => {
        if (dropZoneState === DropZoneState.NoFile) {
          openFilePicker();
        }
      }}
    >
      <div className="flex flex-col gap-6 m-auto text-center">
        <Download size={72} className="mx-auto mb-2" />
        <span>
          <strong>Choose a file</strong> or drag it here.
        </span>
      </div>
      <div
        className={
          "w-full h-full absolute left-0 top-0 transition-all bg-black bg-opacity-0 z-10" +
          (dropZoneState === DropZoneState.NoFile
            ? " group-active:bg-opacity-50"
            : "")
        }
      ></div>
      <div
        className={
          "w-full h-full absolute left-0 top-0 bg-green-400 z-10 transition-all" +
          (dropZoneState === DropZoneState.Valid
            ? " bg-opacity-50"
            : " bg-opacity-0")
        }
      ></div>
      <div
        className={
          "w-full h-full absolute left-0 top-0 bg-red-600 z-10 transition-all" +
          (dropZoneState === DropZoneState.Invalid
            ? " bg-opacity-50"
            : " bg-opacity-0")
        }
      ></div>
    </div>
  );
}
