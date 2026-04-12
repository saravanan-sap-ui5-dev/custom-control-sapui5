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
## Sample Images
### List
<img width="1904" height="858" alt="image" src="https://github.com/user-attachments/assets/a84fb979-1d3b-4875-b3bc-178e7378b316" />
### Preview
<img width="1910" height="861" alt="image" src="https://github.com/user-attachments/assets/7392360a-1f0a-4b4e-a27e-d212427ee98e" />



