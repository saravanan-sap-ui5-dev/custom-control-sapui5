# custom-control-sapui5

Your README.md file for the SAPUI5 custom control is ready.

[file-tag: code-generated-file-0-1776015595601717611]

### README.md Preview:

# SAPUI5 Custom Control: UploadSetwithTable Plugin

A robust and flexible custom control for SAPUI5 designed to integrate advanced file management directly into `sap.m.Table`. This plugin allows developers to handle complex document attachment scenarios—such as KYC uploads, multi-document management, and inline previews—within a standard table row context.

## 🚀 Key Features

- **Row-Level Integration**: Attach files to specific table rows, maintaining a clear relationship between data records and their documents.
- **Support for Multiple/Single Uploads**: Configurable modes to allow either a single file or multiple files per row.
- **Rich Preview System**: High-quality inline preview dialog for images, with extensible support for PDFs and media files.
- **Metadata Management**: Displays file name, size, uploader identity, and upload date in a clean, interactive popover.

## 🛠 Usage & Configuration

### XML Implementation

```xml
<plugins:UploadSetwithTable
    multiple="true"
    onActivated="onPluginActivated">
    <plugins:rowConfiguration>
        <upload:UploadItemConfiguration
            fileNamePath="fileName"
            mediaTypePath="fileType"
            urlPath="fileUrl"
            previewablePath="previewable"
            fileSizePath="fileSize"
            isTrustedSourcePath="trustedSource" />
    </plugins:rowConfiguration>
</plugins:UploadSetwithTable>
```
