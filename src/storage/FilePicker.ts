import { FileSystemFileHandle, showOpenFilePicker, showSaveFilePicker } from "native-file-system-adapter";

export interface FiletypeInfo {
  description: string;
  extensions: string[];
  mimetype: string;
  suggestedName: string;
}

function getAcceptTypes(filetypeInfo: FiletypeInfo) {
  return [
    {
      description: filetypeInfo.description,
      accept: { [filetypeInfo.mimetype]: filetypeInfo.extensions.map((extension) => "." + extension) },
    },
  ];
}

export class FilePicker {
  static async loadPicker(filetypeInfo: FiletypeInfo): Promise<FileSystemFileHandle[]> {
    return showOpenFilePicker({
      multiple: false,
      // @ts-expect-error Need to specify types for native open dialog
      types: getAcceptTypes(filetypeInfo),
      accepts: [
        {
          extensions: filetypeInfo.extensions,
        },
      ],
    });
  }

  static async savePicker(filetypeInfo: FiletypeInfo): Promise<FileSystemFileHandle> {
    return showSaveFilePicker({ suggestedName: filetypeInfo.suggestedName, types: getAcceptTypes(filetypeInfo) });
  }
}
