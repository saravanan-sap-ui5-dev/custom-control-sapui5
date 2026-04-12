// control/AttachmentHelper.js
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/Fragment",
    "sap/m/plugins/UploadSetwithTable",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageBox",
    "sap/base/security/URLListValidator"
], function (Control, Fragment, UploadSetwithTable, DateFormat, MessageBox, URLListValidator) {
    "use strict";

    // Force-load illustration asset
    //IllustrationPool.loadAsset("sapIllus-EmptyFolder");

    let oUploadPluginInstance = null;
    let base = {};
    const imageMimeTypes = new Set([
        "image/jpg", "image/jpeg", "image/png", "image/gif", "image/bmp",
        "image/webp", "image/svg+xml", "image/tiff", "image/x-icon",
        "image/heif", "image/heic", "image/avif"
    ]);

    // Allow blob protocol
    URLListValidator.add(undefined, "blob");

    return Control.extend("app.customcontrol.control.AttachmentHelper", {
        metadata: {
            properties: {
                sourceId: { type: "string" },
                sourceFor: { type: "string" },
                attachments: { type: "object" }, // this will be the data to bind to the table,
                documentData: { type: "object" },
                editable: { type: "boolean" },
                sourceData: { type: "object" },
                controller: { type: "object" },
            },
            events: {
                change: {},
                init: {},
                fetchRequested: {
                    parameters: {
                        sourceId: { type: "string" },
                        sourceFor: { type: "string" }
                    }
                }
            }
        },

        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                console.log("Rendering AttachmentHelper...");
                oRm.openStart("div", oControl);
                oRm.style("width", "100%");
                oRm.openEnd();

                if (oControl._oFragment) {
                    oRm.renderControl(oControl._oFragment);
                }

                oRm.close("div");
            }
        },

        init: function () {
            this._oFragment = null;
            this.loadFragment();
        },

        async loadFragment() {
            const oControl = this;

            if (!this._oFragment) {
                this._oFragment = await Fragment.load({
                    name: "app.customcontrol.control.AttachmentSetWithTable",
                    controller: this
                });

                const oModel = new sap.ui.model.json.JSONModel({
                    attachments: oControl.getAttachments(),
                    edit: this.getEditable(),
                    displayFormat: "dd-MM-yyyy"
                });
                this._oFragment.setModel(oModel, "attachmentModel");

                oControl.invalidate();

                // ✅ Trigger fetchRequested event
                oControl.fireFetchRequested({
                    sourceId: oControl.getSourceId(),
                    sourceFor: oControl.getSourceFor()
                });
            } else {
                this._oFragment.getModel("attachmentModel").setData({
                    attachments: this.getAttachments(),
                    edit: this.getEditable(),
                    displayFormat: "dd-MM-yyyy"
                });
            }

            this.setIsOutputVisible();
            this.fireChange();
        },
        setAttachments: function (aItems) {
            this.setProperty("attachments", aItems, true);
            if (this._oFragment) {
                this._oFragment.getModel("attachmentModel").setProperty("/attachments", aItems);
                this._oFragment.invalidate();
                console.log("Current attachments:", aItems);
                console.log("Bound model data:", this._oFragment.getModel("attachmentModel").getData());

                this.setIsOutputVisible();
            }
            return this;
        },

        setController(oController) {
            if (oController) {
                base.control = oController
            }
            return this;
        },

        formatDate(date, pattern = "yyyy-MM-dd") {
            return date ? DateFormat.getInstance({ pattern }).format(new Date(date)) : null
        },

        convertFileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result?.toString().replace(`data:${file.type};base64,`, '');
                    resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        },
        onPluginActivated(oEvent) {
            oUploadPluginInstance = oEvent.getParameter("oPlugin");
        },
        base64ToObjectURL(base64Data = "", mimeType) {
            if (!base64Data.trim()) return;
            // Remove any whitespace
            base64Data = base64Data.replace(/\s/g, '');
            // Decode
            const byteChars = atob(base64Data);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            return URL.createObjectURL(blob);
        },
        openPreview(oEvent) {
            const oSource = oEvent.getSource();
            const oBindingContext = oSource.getBindingContext("attachmentModel");
            if (!oBindingContext) {
                return;
            }
            const oDocument = oBindingContext.getObject();
            let sContent = oDocument?.content || "";
            if (oDocument.id) {
                sContent = btoa(oDocument?.content)
            }
            const oMockUploadItem = {
                getFileName: () => oDocument.fileName,
                getMediaType: () => oDocument.fileType,
                getUrl: () => this.base64ToObjectURL(sContent, oDocument?.fileType),
                getPreviewable: () => true,
                getFileSize: () => oDocument.fileSize,
                getId: () => "mockVideoItem",
                getIsTrustedSource: () => true,
                isA: (sType) => sType === "sap.m.upload.UploadItem",
                download: function (forceDownload) {
                    const link = document.createElement("a");
                    link.href = this.getUrl();
                    link.download = this.getFileName();
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };

            const oFilePreviewDialog = new sap.m.upload.FilePreviewDialog();
            oFilePreviewDialog._previewItem = oMockUploadItem;
            oFilePreviewDialog._items = [oMockUploadItem];

            oFilePreviewDialog._open().then(() => {
                oFilePreviewDialog._oDialog.setContentWidth("80%");
                oFilePreviewDialog._oDialog.setContentHeight("80vh");

                // Stop busy state for TXT
                oFilePreviewDialog._oCarousel.getPages().forEach(oPage => {
                    oPage.findElements(true).forEach(ctrl => {
                        if (ctrl.isA("sap.ui.richtexteditor.RichTextEditor")) {
                            ctrl.setBusy(false);
                        }
                    });
                });
            });
        },

        setIsOutputVisible() {
            const moduleData = this.getDocumentData();
            const attachmentMdl = this._oFragment.getModel("attachmentModel")
            const attachmentData = attachmentMdl.getData();
            if (moduleData?.attachments) {
                const attachmentModule = moduleData?.attachments;
                const sourceFor = parseInt(this.getSourceFor());
                const bMatch = [attachmentModule.Project, attachmentModule.PropertyAttachement].includes(sourceFor);//attachmentModule.PropertyImage,
                attachmentData.isOutputVisible = bMatch || false;
                attachmentMdl.refresh();
            }

        },

        buildFileMeta(params) {
            return {
                id: params.id || null,
                oneDriveId: params.oneDriveId || null,
                content: params.content,
                sourceId: params.sourceId,
                sourceFor: params.sourceFor,
                sourceForName: params.sourceForName || null,
                parentSourceForName: params.parentSourceForName || null,
                isImageFile: params.isImageFile,
                fileUrl: params.fileUrl,
                fileName: params.fileName,
                fileType: params.fileType,
                fileSize: params.fileSize || null,
                filePath: null,
                primary: params.primary || false,
                storageType: params.storageType,
                accessLevel: params.accessLevel || "private",
                createdBy: params.createdBy,
                createdOn: new Date().toISOString(),
                // uploadedBy: params.createdBy,
                // uploadedOn: new Date().toLocaleDateString(),
                status: 1
            }
        },
        getFileSizeWithUnits(iFileSize) {
            return UploadSetwithTable.getFileSizeWithUnits(iFileSize);
        },
        getIconSrc(mediaType, thumbnailUrl) {
            return UploadSetwithTable.getIconForFileType(mediaType, thumbnailUrl);
        },
        async onSelectIsOutput(oEvent) {
            const oSource = oEvent.getSource();
            const bSelected = oEvent.getParameter("selected");
            const oBindingContext = oSource.getBindingContext("attachmentModel");
            const oRowObject = oBindingContext.getObject();
            const sourceId = this.getSourceId();
            const sourceFor = this.getSourceFor();
            const documentData = this.getDocumentData();
            const model = this._oFragment.getModel("attachmentModel");
            const setBusy = (flag) => model.setProperty("/attachmentBusy", flag);

            try {
                setBusy(true);
                if (bSelected) {
                    oRowObject.accessLevel = "public";
                } else {
                    oRowObject.accessLevel = "private";
                }
                if (sourceId) {
                    // if (sourceFor == documentData?.attachments?.PropertyImage || sourceFor == documentData?.attachments?.PropertyAttachement) {
                    const sourceForObj = documentData.modules.find(e => e.id == sourceFor);
                    const parentObj = documentData.modules.find(e => e.id === sourceForObj?.parent);
                    const original = oRowObject.original || {};

                    original.sourceId = sourceId;
                    original.sourceFor = sourceFor;
                    original.sourceForName = sourceForObj?.name;
                    original.parentSourceForName = parentObj?.name;
                    original.accessLevel = oRowObject.accessLevel;
                    original.content = btoa(original.content);

                    const filePayload = this.buildFileMeta(oRowObject.original);

                    await base.restMethodPost(AppConstants.URL.upload_image, [filePayload]);
                    await this.fireFetchRequested({
                        sourceId: sourceId,
                        sourceFor: sourceFor
                    });
                    sap.m.MessageToast.show("Updated Successfully!");
                    // }
                }
                this.fireChange();
            } catch (ex) {
                console.log(ex);
            } finally {
                //setBusy(false);
            }
        },
        async fetchAttachments(oController) {
            const reqBody = {
                sourceId: this.getSourceId(),
                sourceFor: this.getSourceFor()
            }

            const sourceFor = this.getSourceFor();
            const documentData = this.getDocumentData();

            if (!this._oFragment) {
                await this.loadFragment();
            }

            this.fireChange();

            const model = this._oFragment.getModel("attachmentModel");

            model.setProperty("/edit", this.getEditable())

            if (sourceFor == documentData?.attachments?.PropertyImage) {
                model.setProperty("/visibleBtnAddLink", false)
            } else {
                model.setProperty("/visibleBtnAddLink", true)
            }

            if (!model) return;

            const setBusy = (flag) => model.setProperty("/attachmentBusy", flag);

            try {
                setBusy(true);
                const response = await base.restMethodPost(AppConstants.URL.get_image, reqBody);
                setBusy(false);
                if (!response) return;

                const newAttachments = response.map(e => {
                    const isImageFile = imageMimeTypes.has(e.fileType);
                    const createdOn = this.formatDate(e.createdOn);
                    return {
                        id: e.id,
                        fileName: e.fileName,
                        fileType: e.fileType,
                        isImageFile,
                        fileUrl: `data:${e.fileType};base64,${btoa(e.content)}`,
                        createdBy: e.createdBy,
                        createdOn: createdOn,
                        fileSize: e.fileSize,
                        sourceFor: e.sourceFor,
                        selected: false,
                        previewable: true, // for preview
                        trustedSource: true,
                        accessLevel: e.accessLevel,
                        isOutput: e.accessLevel == "public",
                        content: e.content || "",
                        original: e || null
                    };
                });

                const aSortedAttachments = newAttachments.sort((a, b) => a.id - b.id); // sorting by id

                this.setAttachments(aSortedAttachments);
                this.fireChange();

            } catch (ex) {
                console.log(ex);
                setBusy(false);
            }
        },
        async handleUploadAttachment(oEvent) {
            const files = oEvent.getParameter("files") || [];
            const model = this._oFragment.getModel("attachmentModel");
            // const user = base.getStorage("userContext");
            const sourceId = this.getSourceId();
            const sourceFor = this.getSourceFor();
            // const documentData = this.getDocumentData();

            if (!files.length) return;

            try {
                model.setProperty("/attachmentBusy", true);
                let attachments = model.getProperty("/attachments") || [];

                for (const file of files) {
                    const base64 = await this.convertFileToBase64(file);
                    // const sourceForObj = documentData.modules.find(e => e.id == sourceFor);
                    // const parentObj = documentData.modules.find(e => e.id === sourceForObj?.parent);
                    const isImageFile = imageMimeTypes.has(file.type);

                    const filePayload = this.buildFileMeta({
                        content: base64,
                        sourceId: sourceId,
                        sourceFor: sourceFor,
                        sourceForName: "",
                        parentSourceForName: "",
                        rootName: "Attachments", // root name for identify attachments or documents
                        isImageFile,
                        fileUrl: `data:${file.type};base64,${base64}`,
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                        primary: false,
                        storageType: "oneDrive",
                        // createdBy: `${user.firstName} ${user.lastName}`,
                        previewable: true, // for preview
                        trustedSource: true,
                        accessLevel: "private",
                    });

                    attachments.push(filePayload);
                    this.setAttachments(attachments);
                }

                this.fireChange();

            } catch (error) {
                console.error("Error uploading files:", error);
            } finally {
                model.setProperty("/attachmentBusy", false);
            }
        },
        async postAttachments(sourceData, existing = false) {
            const oAttachmentMdl = this._oFragment.getModel("attachmentModel");
            try {
                let filePayload = JSON.parse(JSON.stringify(oAttachmentMdl.getData().attachments || []));
                filePayload.forEach(e => {
                    e.sourceId = sourceData.sourceId;
                    e.sourceForName = sourceData.sourceForName;
                    e.status = 1;
                    e.rootName = "Attachments";
                });
                if (existing) {
                    filePayload = filePayload.map(item => this.transferDataPosting(item));
                }
                filePayload = filePayload.filter(e => !e.id);

                await base.restMethodPost(AppConstants.URL.upload_image, filePayload);
            } catch (error) {
                console.log(error);
            }
            // sap.m.MessageToast.show("Uploaded Successfully!");
        },
        transferDataPosting(item) {
            if (item) {
                const documentData = this.getDocumentData();
                const original = item.original || {};
                const sourceForObj = documentData.modules.find(e => e.id == item.sourceFor);
                const parentObj = documentData.modules.find(e => e.id === sourceForObj?.parent);

                original.id = null;
                original.sourceId = item.sourceId;
                original.sourceFor = item.sourceFor;
                original.sourceForName = sourceForObj?.name;
                original.parentSourceForName = parentObj?.name;
                original.accessLevel = item.accessLevel;
                original.content = btoa(original.content);

                return this.buildFileMeta(original);
            }
        },
        async handleDeleteAttachment(oEvent) {
            const oControl = this;
            const listItem = oEvent.getParameter("listItem");
            if (!listItem) return;

            const oCtx = listItem.getBindingContext("attachmentModel");
            const model = this._oFragment.getModel("attachmentModel");
            const docId = oCtx.getObject().id;
            const path = oCtx?.sPath;
            const index = path?.split("/").pop();
            const attachments = model.getProperty("/attachments");

            MessageBox.warning("Are you sure you want to remove the attachment ?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: async function (sAction) {
                    if (sAction == "OK") {
                        if (!docId) {
                            attachments.splice(index, 1);
                            oControl.setAttachments(attachments);
                            oControl.fireChange();
                            return;
                        }

                        try {
                            model.setProperty("/attachmentBusy", true);
                            await base.restMethodDelete(`${AppConstants.URL.manage_documents}/${docId}`);

                            attachments.splice(index, 1);
                            sap.m.MessageToast.show("Updated Successfully");

                            oControl.fireFetchRequested({
                                sourceId: oControl.getSourceId(),
                                sourceFor: oControl.getSourceFor()
                            });
                        } catch (error) {
                            console.error("Error deleting document:", error);
                        } finally {
                            model.setProperty("/attachmentBusy", false);
                        }
                    }
                }
            });
        },

        async onAddLink(oEvent) {

            if (!this._oLinkDialog) {
                this._oLinkDialog = await Fragment.load({
                    name: "app.customcontrol.control.AddLinkWithTable",
                    controller: this
                });
            }

            const oModel = new sap.ui.model.json.JSONModel({
                url: null,
                name: null,
                nameValueState: "None",
                urlValueState: "None"
            });

            this._oLinkDialog.setModel(oModel, "newLinkModel");
            this._oLinkDialog.open();

        },
        handleCloseLinkDialog() {
            if (this._oLinkDialog) {
                this._oLinkDialog.close();
                this._oLinkDialog.destroy();
                delete this._oLinkDialog;
            }
        },
        async handleSubmitLink() {
            const model = this._oLinkDialog.getModel("newLinkModel");
            const oAttachmentMdl = this._oFragment.getModel("attachmentModel");
            // const user = base.getStorage("userContext");
            const data = model.getData()
            const newLink = {
                url: data.url,
                name: data.name
            };
            const sourceId = this.getSourceId();
            const sourceFor = this.getSourceFor();
            const documentData = this.getDocumentData();

            const isEmpty = (val) => !val?.trim();
            const updateValueState = () => {
                model.setProperty("/nameValueState", isEmpty(newLink.name) ? "Error" : "None");
                model.setProperty("/urlValueState", isEmpty(newLink.name) ? "Error" : "None");
            };

            if (isEmpty(newLink.name) || isEmpty(newLink.url)) {
                updateValueState();
                return;
            }

            try {
                model.setProperty("/linkDialogBusy", true);
                const attachments = oAttachmentMdl.getProperty("/attachments") || [];

                const linkPayload = this.buildFileMeta({
                    content: newLink.url,
                    sourceId,
                    sourceFor,
                    sourceForName: "",
                    parentSourceForName: "",
                    isImageFile: false,
                    fileName: newLink.name,
                    fileType: "link",
                    storageType: "URL",
                    createdBy: `Admin`
                });


                attachments.push(linkPayload);
                this.setAttachments(attachments);
                this.fireChange();

                this.handleCloseLinkDialog();
            } catch (error) {
                console.error("Error submitting link:", error);
            } finally {
                model.setProperty("/linkDialogBusy", false);
            }
        }
    });
});
