"use client";

import { Upload, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";

export const title = "Compact File List";

type FileUploadComponentProps = {
  files?: File[];
  onFilesChange?: (files: File[]) => void;
};

const FileUploadComponent = ({ files, onFilesChange }: FileUploadComponentProps) => {
  const [internalFiles, setInternalFiles] = React.useState<File[]>([]);
  const controlledFiles = files ?? internalFiles;

  const handleValueChange = (nextFiles: File[]) => {
    if (onFilesChange) {
      onFilesChange(nextFiles);
      return;
    }

    setInternalFiles(nextFiles);
  };

  return (
    <FileUpload
      maxFiles={5}
      maxSize={5 * 1024 * 1024}
      className="w-full max-w-md"
      value={controlledFiles}
      onValueChange={handleValueChange}
      multiple
      accept="image/*"
    >
      <FileUploadDropzone className="py-3 border-solid border-foreground">
        <div className="flex items-center gap-2">
          <Upload className="size-4 text-muted-foreground" />
          <span className="text-sm">Drop files or</span>
          <FileUploadTrigger asChild>
            <Button variant="link" size="sm" className="h-auto p-0">
              browse
            </Button>
          </FileUploadTrigger>
        </div>
      </FileUploadDropzone>
      <FileUploadList className="gap-1">
        {controlledFiles.map((file, index) => (
          <FileUploadItem key={index} value={file} className="p-2">
            <FileUploadItemPreview className="size-8" />
            <FileUploadItemMetadata size="sm" />
            <FileUploadItemDelete asChild>
              <Button variant="ghost" size="icon" className="size-6">
                <X className="size-3" />
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );
};

export default FileUploadComponent;
