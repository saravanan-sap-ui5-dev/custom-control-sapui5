sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/plugins/UploadSetwithTable",
    "sap/base/security/URLListValidator"
], function (Control, Fragment, DateFormat, MessageBox, JSONModel, UploadSetwithTable, URLListValidator) {
    "use strict";

    let oUploadPluginInstance = null;
    let base = {};
    const imageMimeTypes = new Set([
        "image/jpg", "image/jpeg", "image/png", "image/gif", "image/bmp",
        "image/webp", "image/svg+xml", "image/tiff", "image/x-icon",
        "image/heif", "image/heic", "image/avif"
    ]);

    // Allow blob protocol
    URLListValidator.add(undefined, "blob");

    return Control.extend("app.customcontrol.control.DocumentHelper", {
        metadata: {
            properties: {
                sourceId: { type: "string" },
                sourceFor: { type: "string" },
                type: { type: "string" },
                documentData: { type: "object" },
                sourceData: { type: "object" },
                documents: { type: "object" },
                masterData: { type: "object" },
                editable: { type: "boolean" },
                commentVisible: { type: "boolean" },
                optional: { type: "boolean" },
                optionalId: { type: "string" },
                controller: { type: "object" },
            },
            events: {
                fetchDocumentsRequested: {
                    parameters: {
                        sourceId: { type: "string" },
                        sourceFor: { type: "string" }
                    }
                },
                postChecklistDocsPayload: {},
                change: {},
                init: {}
            }
        },

        renderer: {
            apiVersion: 2,
            render(oRm, oControl) {
                oRm.openStart("div", oControl);
                oRm.style("width", "100%");
                oRm.openEnd();
                if (oControl._oFragment) {
                    oRm.renderControl(oControl._oFragment);
                }
                oRm.close("div");
            }
        },

        init() {
            this._oFragment = null;
            this.loadFragment();
        },

        async loadFragment() {
            const documents = this.getDocuments() || [];

            if (!this._oFragment) {
                this._oFragment = await Fragment.load({
                    name: "app.customcontrol.control.Documents",
                    controller: this
                });

                const oModel = new JSONModel({
                    documents: this.getDocuments(),
                    displayFormat: "dd-MM-yyyy",
                    optional: this.getOptional() || false,
                    attachmentOnly: true,
                    edit: true
                });
                oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
                this._oFragment.setModel(oModel, "documentModel");

                this.invalidate();  // Ensure this is called after model data update

            } else {
                this._oFragment.getModel("documentModel").setData({
                    documents: this.getDocuments(),
                    displayFormat: "dd-MM-yyyy",
                    optional: this.getOptional() || false,
                    attachmentOnly: true,
                    edit: true
                });
                this.invalidate();
            }

            this.fireChange();
        },

        setDocuments(aItems) {
            this.setProperty("documents", aItems, true);
            if (this._oFragment) {
                this._oFragment.getModel("documentModel").setProperty("/documents", aItems);
                this._oFragment.getModel("documentModel").refresh();
                this._oFragment.invalidate();

                console.log("Current documents:", aItems);
                console.log("Bound model data:", this._oFragment.getModel("documentModel").getData());
            }
            return this;
        },

        setController(oController) {
            if (oController) {
                base.control = oController
            }
            return this;
        },

        async fetchDocuments(oController) {
            const sourceId = this.getSourceId();
            const moduleId = this.getSourceFor();
            const optionalId = this.getOptionalId();
            const documents = this.getDocumentData()?.documents;
            const type = this.getType() || null;


            let conditions = [];

            if (!this._oFragment) {
                await this.loadFragment();
            }

            this.fireChange();

            const oModel = this._oFragment.getModel("documentModel");

            const setBusy = (flag) => oModel.setProperty("/documentBusy", flag);

            try {
                setBusy(true);
                // if (type) {
                //     conditions.push(`type eq ${type}`);
                // }

                // if (moduleId) {
                //     conditions.push(`module eq ${moduleId}`);
                // }

                // // Always add status = 1
                // conditions.push("status eq 1");

                // let query = conditions.join(" and ");
                // let templateReqBody = {
                //     "procedureName": base.getModelWithData("ProcedureMdl").getDocumentCheckList,
                //     "params": {
                //         "type": type,
                //         "status": 1,
                //         "owner_type": null,
                //         "module": moduleId
                //     }
                // }

                // let url = AppConstants.URL.procedure;//`${AppConstants.URL.document_master}?$filter=${query || ''}`;
                // const [response, docRes] = await Promise.all([
                //     base.restMethodPost(url, templateReqBody),
                //     base.restMethodPost(AppConstants.URL.get_checklist_documents, {
                //         sourceId: sourceId,
                //         sourceFor: moduleId,
                //         optionalId: optionalId
                //     })
                // ]);
                // setBusy(false);

                // const formatted = this._formatDocumentChecklist((response || []), (docRes || []));
                this.setDocuments([{
                    name: "Aadhar Card",
                    content: "",
                    sourceId: "",
                    sourceFor: "",
                    sourceForName: "",
                    parentSourceForName: null,
                    fileUrl: null,
                    isImageFile: false,
                    fileName: "",
                    fileType: "",
                    fileSize: "",
                    filePath: null,
                    primary: false,
                    previewable: true,
                    trustedSource: true,
                    storageType: "oneDrive",
                    accessLevel: "public",
                    numberOfDocuments: 1,
                    createdOn: new Date().toLocaleDateString().replaceAll("/", "-"),
                    status: 1
                },
                {
                    name: "Driving License",
                    content: "",
                    sourceId: "",
                    sourceFor: "",
                    sourceForName: "",
                    parentSourceForName: null,
                    fileUrl: null,
                    isImageFile: false,
                    fileName: "",
                    fileType: "",
                    fileSize: "",
                    filePath: null,
                    primary: false,
                    previewable: true,
                    trustedSource: true,
                    storageType: "oneDrive",
                    accessLevel: "public",
                    numberOfDocuments: 2,
                    createdOn: new Date().toLocaleDateString().replaceAll("/", "-"),
                    status: 1
                }]);
                this.fireChange();
            } catch (err) {
                setBusy(false);
                console.error("Document fetch failed:", err);
            } finally {
                setBusy(false);
            }
        },
        async fetchDocumentsWithReturn(optionalId = null) { // fetch documents for other none related with document model
            const sourceId = this.getSourceId();
            const moduleId = this.getSourceFor();
            const documents = this.getDocumentData()?.documents;
            const type = this.getType() || null;

            let conditions = [];

            try {
                if (type) {
                    conditions.push(`type eq ${type}`);
                }

                if (moduleId) {
                    conditions.push(`module eq ${moduleId}`);
                }

                // Always add status = 1
                conditions.push("status eq 1");

                let query = conditions.join(" and ");
                let templateReqBody = {
                    "procedureName": base.getModelWithData("ProcedureMdl").getDocumentCheckList,
                    "params": {
                        "type": type,
                        "status": 1,
                        "owner_type": null,
                        "module": moduleId
                    }
                }

                let url = AppConstants.URL.procedure;//`${AppConstants.URL.document_master}?$filter=${query || ''}`;
                const [response, docRes] = await Promise.all([
                    base.restMethodPost(url, templateReqBody),
                    base.restMethodPost(AppConstants.URL.get_checklist_documents, {
                        sourceId: sourceId,
                        sourceFor: this.getSourceFor(),
                        optionalId: optionalId || null
                    })
                ]);

                const formatted = this._formatDocumentChecklist((response || []), (docRes || []));

                return formatted;
            } catch (err) {
                console.error("Document fetch failed:", err);
            }
        },

        _formatDocumentChecklist(response, docRes) {
            return response.map(item => {
                const docs = docRes.filter(doc => doc.sourceChildId === item.id);
                item.isMandatory = item.isMandatory == 1 ? true : false;
                const attachments = docs.map(doc => ({
                    ...doc,
                    content: doc.content ? btoa(doc.content) : null,
                    fileUrl: doc.content ? `data:${doc.fileType};base64,${btoa(doc.content)}` : null,
                    isImageFile: imageMimeTypes.has(doc.fileType),
                    createdOn: this._formatDate(doc.createdOn, "dd-MM-yyyy"),
                    trustedSource: true,
                    previewable: true,
                    edit: this.getEditable()
                })).filter(Boolean);

                const mainRowObj = {
                    ...item,
                    edit: this.getEditable(),
                    optional: this.getOptional(),
                    view: this.getCommentVisible(),
                    sourceChildId: item.id,
                    optionalId: docs[0]?.optionalId,
                    documentNumber: docs[0]?.documentNumber,
                    institution: docs[0]?.institution,
                    validFrom: this._formatDate(docs[0]?.validFrom, "yyyy-MM-dd"),
                    validTo: this._formatDate(docs[0]?.validTo, "yyyy-MM-dd"),
                    attachments: attachments.filter(e => e.content !== null),
                };
                if (!item?.content) {
                    mainRowObj.id = docs[0]?.id || null
                }

                return mainRowObj;
            });
        },
        async transferDocuments(fromDocs, toDocs) {

            let buildUrl = ((type, moduleId, ownerType) => {
                let conditions = [];

                if (type) conditions.push(`type eq ${type}`);
                if (moduleId) conditions.push(`module eq ${moduleId}`);
                if (ownerType && type == 2) conditions.push(`ownerType eq ${ownerType}`);

                // Always add status = 1
                conditions.push("status eq 1");

                let query = conditions.join(" and ");
                let url = `${AppConstants.URL.document_master}?$filter=${query || ''}`;
                return url;
            });

            let buildReqBody = ((type, moduleId, ownerType) => {
                return {
                    "procedureName": base.getModelWithData("ProcedureMdl").getDocumentCheckList,
                    "params": {
                        "type": type,
                        "status": 1,
                        "owner_type": ownerType,
                        "module": moduleId
                    }
                }
            });

            if (!this._oFragment) {
                await this.loadFragment();
            }
            let url = AppConstants.URL.procedure;

            const oModel = this._oFragment.getModel("documentModel");

            const setBusy = (flag) => oModel.setProperty("/documentBusy", flag);

            try {
                setBusy(true);

                const fromDocChecklist = await base.restMethodPost(url, buildReqBody(fromDocs.type, fromDocs.sourceFor, fromDocs.ownerType));//base.restMethodGet(buildUrl(fromDocs.type, fromDocs.sourceFor, fromDocs.ownerType));
                const toDocChecklist = await base.restMethodPost(url, buildReqBody(toDocs.type, toDocs.sourceFor, toDocs.ownerType));//base.restMethodGet(buildUrl(toDocs.type, toDocs.sourceFor, toDocs.ownerType));

                const fromDocList = fromDocs.sourceId ? await base.restMethodPost(AppConstants.URL.get_checklist_documents, {
                    sourceId: fromDocs.sourceId,
                    sourceFor: fromDocs.sourceFor
                }) : [];

                // const toDocList = toDocs.sourceId ? await base.restMethodPost(AppConstants.URL.get_checklist_documents, {
                //     sourceId: toDocs.sourceId,
                //     sourceFor: toDocs.sourceFor
                // }) : [];

                const toDocChecklistIds = toDocChecklist.map(e => e.idType);
                const filterChecklist = fromDocChecklist.filter(e => toDocChecklistIds.includes(e.idType));
                const filterChecklistIds = filterChecklist.map(e => e.id);
                const filterDoclist = fromDocList.filter(e => {
                    if (filterChecklistIds.includes(e.sourceChildId)) {
                        const identificationType = filterChecklist.find(ele => ele.id == e.sourceChildId)?.idType;
                        e.idType = identificationType;
                        return e;
                    }
                });

                filterDoclist.forEach(e => {
                    e.sourceFor = toDocs.sourceFor;
                    e.sourceChildId = toDocChecklist.find(ele => ele.idType == e.idType)?.id;
                    e.sourceId = null;
                    delete e.id;
                })

                setBusy(false);

                const formatted = this._formatDocumentChecklist((toDocChecklist || []), (filterDoclist || []));

                formatted.forEach(e => e?.attachments?.forEach(a => a.storageType = "copy")); // type of storage is copy

                this.setDocuments(formatted);
                this.fireChange();
                return formatted;
            } catch (err) {
                setBusy(false);
                console.error("Document fetch failed:", err);
            }
        },
        async transferDocumentsWithReturn(fromDocs, toDocs) {

            let buildUrl = ((type, moduleId, ownerType) => {
                let conditions = [];

                if (type) conditions.push(`type eq ${type}`);
                if (moduleId) conditions.push(`module eq ${moduleId}`);
                if (ownerType && type == 2) conditions.push(`ownerType eq ${ownerType}`);

                // Always add status = 1
                conditions.push("status eq 1");

                let query = conditions.join(" and ");
                let url = AppConstants.URL.document_master;//`${AppConstants.URL.document_master}?$filter=${query || ''}`;
                return url;
            });

            let buildReqBody = ((type, moduleId, ownerType) => {
                return {
                    "procedureName": base.getModelWithData("ProcedureMdl").getDocumentCheckList,
                    "params": {
                        "type": type,
                        "status": 1,
                        "owner_type": ownerType,
                        "module": moduleId
                    }
                }
            });
            let url = AppConstants.URL.procedure;

            try {

                const fromDocChecklist = await base.restMethodPost(url, buildReqBody(fromDocs.type, fromDocs.sourceFor, fromDocs.ownerType));//base.restMethodGet(buildUrl(fromDocs.type, fromDocs.sourceFor, fromDocs.ownerType));
                const toDocChecklist = await base.restMethodPost(url, buildReqBody(toDocs.type, toDocs.sourceFor, toDocs.ownerType));//base.restMethodGet(buildUrl(toDocs.type, toDocs.sourceFor, toDocs.ownerType));

                const fromDocList = fromDocs.sourceId ? await base.restMethodPost(AppConstants.URL.get_checklist_documents, {
                    sourceId: fromDocs.sourceId,
                    sourceFor: fromDocs.sourceFor
                }) : [];

                // const toDocList = toDocs.sourceId ? await base.restMethodPost(AppConstants.URL.get_checklist_documents, {
                //     sourceId: toDocs.sourceId,
                //     sourceFor: toDocs.sourceFor
                // }) : [];

                const toDocChecklistIds = toDocChecklist.map(e => e.idType);
                const filterChecklist = fromDocChecklist.filter(e => toDocChecklistIds.includes(e.idType));
                const filterChecklistIds = filterChecklist.map(e => e.id);
                const filterDoclist = fromDocList.filter(e => {
                    if (filterChecklistIds.includes(e.sourceChildId)) {
                        const identificationType = filterChecklist.find(ele => ele.id == e.sourceChildId)?.idType;
                        e.idType = identificationType;
                        return e;
                    }
                });

                filterDoclist.forEach(e => {
                    e.sourceFor = toDocs.sourceFor;
                    e.sourceChildId = toDocChecklist.find(ele => ele.idType == e.idType)?.id;
                    e.sourceId = null;
                    delete e.id;
                })

                const formatted = this._formatDocumentChecklist((toDocChecklist || []), (filterDoclist || []));

                formatted.forEach(e => e?.attachments?.forEach(a => a.storageType = "copy")); // type of storage is copy

                return formatted;
            } catch (err) {
                console.error("Document transfer fetch failed:", err);
            }
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
        onLiveChangeDate(oEvent) {
            const oValue = oEvent.getParameter("value");
            oEvent.getSource().getBinding("value").setValue(oValue);
            //this.fireChange();
        },
        onLiveChangeInput(oEvent) {
            const oValue = oEvent.getParameter("value");
            oEvent.getSource().getBinding("value").setValue(oValue);
            //this.fireChange();
        },
        validateValidFromTo(oEvent) {
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("documentModel");
            const sPath = oSource.getBindingPath("value");

            const validFromStr = oContext.getProperty("validFrom");
            const validToStr = oContext.getProperty("validTo");
            const attachmentOnly = oContext.getProperty("attachmentOnly");

            if (attachmentOnly) return;

            const isValidTo = sPath.includes("validTo");

            // Case: "Valid To" entered but "Valid From" is missing
            if (isValidTo && !validFromStr && validToStr) {
                oSource.setValue("");
                sap.m.MessageBox.error("Valid From must be filled before setting Valid To!");
                return;
            }

            // Only validate if both values are present
            if (!validFromStr || !validToStr) {
                return;
            }

            const validFrom = new Date(validFromStr);
            const validTo = new Date(validToStr);

            // Check if date range is correct
            if (validFrom >= validTo) {
                oSource.setValue("");
                const errorMessage = isValidTo
                    ? "Valid To should be greater than Valid From!"
                    : "Valid From should be lesser than Valid To!";
                sap.m.MessageBox.error(errorMessage);
            }
        },
        handleUpdateFinished() {
            const oTable = this._oFragment;
            if (!oTable) return;

            oTable.getItems().forEach(function (oItem) {
                oItem.getCells().forEach(function (oCell) {
                    const oCtx = oCell.getBindingContext("documentModel");

                    if (oCell.isA("sap.m.DatePicker")) {
                        oCell.addDelegate({
                            onAfterRendering: function () {
                                const $input = oCell.$("inner");

                                // Disable typing
                                $input.off("keydown").on("keydown", function (e) {
                                    e.preventDefault();
                                });

                                // Disable paste
                                $input.off("paste").on("paste", function (e) {
                                    e.preventDefault();
                                });

                                // Open calendar popup on input click manually
                                $input.off("click").on("click", function (e) {
                                    if (!oCell) return;
                                    const attachmentOnly = oCtx.getProperty("attachmentOnly");
                                    const edit = oCtx.getProperty("edit");
                                    if (attachmentOnly || !edit) return;
                                    oCell.openBy()
                                });
                            }
                        }, true);
                    }
                });
            });
        },

        validateMandatoryDocuments(documents = [], button) {
            if (!Array.isArray(documents) || documents.length === 0) return [];

            const errors = [];

            documents.forEach(doc => {
                const isMandatory = doc.isMandatory === true || doc.isMandatory === 1;
                if (!isMandatory) return;

                const docLabel = doc.name || `Document ID ${doc.id}`;

                const optionalId = doc.optionalId || null;
                const customerName = doc.customerName || null;

                // Check attachments
                const hasAttachments = Array.isArray(doc.attachments) && doc.attachments.length > 0;
                if (!hasAttachments && button?.includes("submit")) {
                    if (optionalId) {
                        errors.push(`${docLabel} for ${customerName || optionalId}: Missing attachments`);
                    } else {
                        errors.push(`${docLabel}: Missing attachments`);
                    }

                    return; // Stop further checks if attachments are missing
                }

                // Check document number
                const hasDocNumber = doc.documentNumber?.trim();
                if (!hasDocNumber) {
                    if (optionalId) {
                        errors.push(`${docLabel} for ${customerName || optionalId}: Missing document number`);
                    } else {
                        errors.push(`${docLabel}: Missing document number`);
                    }
                }

                // Check validity
                if (doc.validity === true) {
                    const hasValidityDates = doc.validFrom && doc.validTo;//
                    if (!hasValidityDates) {
                        if (optionalId) {
                            errors.push(`${docLabel} for ${customerName || optionalId}: Missing validity dates`);
                        } else {
                            errors.push(`${docLabel}: Missing validity dates`);
                        }
                    }
                }
            });

            return errors;
        },


        _formatDate(date, pattern = "yyyy-MM-dd") {
            return date ? DateFormat.getInstance({ pattern }).format(new Date(date)) : null;
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
            const oBindingContext = oEvent.getSource().getBindingContext();
            if (!oBindingContext) {
                return;
            }
            const oDocument = oBindingContext.getObject();
            const oMockUploadItem = {
                getFileName: () => oDocument.fileName,
                getMediaType: () => oDocument.fileType,
                getUrl: () => this.base64ToObjectURL(oDocument.content, oDocument.fileType),
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

        getFileSizeWithUnits(iFileSize) {
            return UploadSetwithTable.getFileSizeWithUnits(iFileSize);
        },

        getIconSrc(mediaType, thumbnailUrl) {
            return UploadSetwithTable.getIconForFileType(mediaType, thumbnailUrl);
        },

        async handleDocumentListPress(oEvent) {
            const oButton = oEvent.getSource();
            const oCtx = oButton.getBindingContext("documentModel");
            const oData = { ...oCtx.getObject() }; // clone to avoid unintentional side effects

            // Apply edit flag to attachments
            oData.attachments?.forEach(item => {
                item.edit = this.getEditable();
                item.displayFormat = "dd-MM-yyyy"
            });

            // Lazy-load the fragment if not already
            if (!this.oDocumentUploadList) {
                this.oDocumentUploadList = await Fragment.load({
                    name: "app.customcontrol.control.DocumentChecklistSetWithTable",
                    controller: this
                });
                this.addDependent(this.oDocumentUploadList); // best practice
            }

            this.oDocumentUploadList.setModel(new JSONModel(oData));

            this.oDocumentUploadList.openBy(oButton);
        },

        async handleUploadDocument(oEvent) {
            const oFiles = oEvent.getParameter("files") || [];
            const oCtx = oEvent.getSource().getBindingContext("documentModel");
            const oRowObject = oCtx.getObject();
            oRowObject.attachments = oRowObject.attachments || [];
            // const loggedUser = base.getStorage("userContext");
            const oModel = this._oFragment.getModel("documentModel");

            const sourceId = this.getSourceId();
            const sourceFor = this.getSourceFor();
            const masterData = this.getMasterData();

            const attachments = await Promise.all([...oFiles].map(async (file) => {
                if (!file) return null;

                const isImageFile = imageMimeTypes.has(file.type);
                // const sourceInfo = masterData.document_checklist_module.find(e => e.value === sourceFor);
                const base64 = await this.convertFileToBase64(file);

                return {
                    content: base64,
                    sourceId: sourceId,
                    sourceFor: sourceFor,
                    sourceForName: "",
                    parentSourceForName: null,
                    fileUrl: base64 ? `data:${file.type};base64,${base64}` : null,
                    isImageFile: isImageFile,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    filePath: null,
                    primary: false,
                    previewable: true,
                    trustedSource: true,
                    storageType: "oneDrive",
                    accessLevel: "public",
                    createdBy: `Admin`,
                    createdOn: new Date().toLocaleDateString().replaceAll("/", "-"),
                    status: 1
                };
            }));

            oRowObject.attachments = [...oRowObject.attachments, ...attachments.filter(Boolean)];
            this.fireChange();
            oModel.refresh()
        },

        async postDocuments(sourceData, existing = false) {
            const oDocumentMdl = this?._oFragment?.getModel("documentModel");
            const documentData = oDocumentMdl.getData();
            const sourceFor = this.getSourceFor();
            const masterData = this.getMasterData();
            const sourceInfo = masterData.document_checklist_module.find(e => e.value === sourceFor);

            sourceData.sourceFor = sourceFor;
            sourceData.parentSourceForName = sourceInfo?.description ?? null;

            if (sourceData) {
                const oDocPayload = this.generateDocChecklistPayload(sourceData, documentData).filter(Boolean);
                if (existing) {
                    oDocPayload.forEach(e => e.id = null)
                }
                if (oDocPayload) {

                    oDocPayload.forEach(e => e.rootName = "Documents"); // root name for identify attachments or documents

                    const sPath = AppConstants.URL.upload_checklist_document;
                    await base.restMethodPost(sPath, oDocPayload);
                }
            }
        },
        async bulkPostDocuments(aSourceData = [], aDocumentData = [], existing = false) {
            Promise.all(
                aSourceData.map(async (e) => {
                    const sourceFor = this.getSourceFor();
                    const masterData = this.getMasterData();
                    const sourceInfo = masterData.document_checklist_module.find(e => e.value === sourceFor);
                    const documentData = aDocumentData.filter(ele => ele.optionalId == e.optionalId) || [];
                    if (!(documentData.length > 0)) return;
                    e.sourceFor = sourceFor;
                    e.parentSourceForName = sourceInfo?.description ?? null;
                    if (e) {
                        const oDocPayload = this.generateDocChecklistPayload(e, { documents: documentData }).filter(Boolean);

                        if (existing) {
                            oDocPayload.forEach(e => e.id = null)
                        }

                        if (oDocPayload) {
                            oDocPayload.forEach(e => e.rootName = "Documents"); // root name for identify attachments or documents
                            const sPath = AppConstants.URL.upload_checklist_document;
                            await base.restMethodPost(sPath, oDocPayload);
                        }
                    }
                })
            )
        },
        async handleDeleteDocument(oEvent) {
            const oSelItem = oEvent.getParameter("listItem");
            if (!oSelItem) return;

            const oModel = this._oFragment.getModel("documentModel");
            const oPopoverMdl = this.oDocumentUploadList.getModel();
            const oCtx = oSelItem.getBindingContext();
            const sPath = oCtx?.sPath;
            const index = sPath?.split("/").pop();
            const attachment = oCtx.getObject();
            const parent = oPopoverMdl.getData() || attachment;

            const oAttachments = oPopoverMdl.getData().attachments;
            const sourceData = this.getSourceData();

            const setBusy = (busy = false) => {
                oModel.setProperty("/attachmentTableBusy", busy);
            };

            if (!attachment?.id) {
                oAttachments.splice(index, 1);
                oPopoverMdl.setData({ attachments: oAttachments, edit: true });
                oModel.refresh(true);
                this.fireChange();
                return;
            }

            try {
                setBusy(true);
                const deleteUrl = AppConstants.URL.delete_checklist_document.replaceAll("{id}", attachment.id);
                await base.restMethodDelete(deleteUrl, attachment.id);

                if (oAttachments.length === 1 && sourceData) {
                    const docCopy = JSON.parse(JSON.stringify(attachment));
                    docCopy.storageType = "HANA";
                    const payload = {
                        /* ...docCopy,*/
                        id: null,
                        attachments: [docCopy],
                        sourceChildId: parent?.sourceChildId,
                        optionalId: parent?.optionalId,
                        documentNumber: parent?.documentNumber ?? null,
                        institution: parent?.institution ?? null,
                        validFrom: parent?.validFrom ?? null,
                        validTo: parent?.validTo ?? null
                    };

                    payload.content = null; // this scenorio no need conent
                    payload.attachments.forEach(e => e.content = null)// this scenorio no need conent

                    const docPayload = this.generateDocChecklistPayload(sourceData, { documents: [payload] });
                    if (docPayload) {

                        if (Array.isArray(docPayload)) {
                            docPayload.forEach(e => {
                                e.id = null;
                                e.sourceId = this.getSourceId();
                                e.sourceFor = this.getSourceFor();
                            });
                        }

                        await base.restMethodPost(AppConstants.URL.upload_checklist_document, docPayload);
                    }
                }

            } catch (error) {
                console.error("Error while deleting attachment:", error);
            } finally {
                setBusy(false);
                oAttachments.splice(index, 1);
                oPopoverMdl.setData({ attachments: oAttachments, edit: true });
                oModel.refresh(true);
                this.fireChange();
                this.oDocumentUploadList.close()
                if (!parent?.optionalId) {
                    await this.fetchDocuments();
                }
            }
        },
        generateDocChecklistPayload(sourceData, documentData) {
            const user = base.getStorage("userContext");
            return documentData.documents.flatMap(item => {
                if (item.documentNumber) {
                    if (!item.attachments || item.attachments.length === 0) return [{
                        id: item.id || null,
                        sourceId: sourceData.sourceId,
                        optionalId: item.optionalId,
                        sourceChildId: item.sourceChildId,
                        sourceFor: sourceData.sourceFor,
                        sourceForName: sourceData.sourceForName,
                        type: sourceData.type,
                        parentSourceForName: sourceData.parentSourceForName,
                        documentNumber: item.documentNumber,
                        validFrom: item.validFrom,
                        institution: item.institution,
                        validTo: item.validTo,
                        fileUrl: null,
                        fileName: null,
                        fileType: null,
                        fileSize: null,
                        filePath: null,
                        primary: false,
                        storageType: "HANA",
                        accessLevel: "public",
                        createdBy: `${user.firstName} ${user.lastName}`,
                        createdOn: new Date(),
                        updatedBy: `${user.firstName} ${user.lastName}`,
                        updatedOn: new Date(),
                        status: 1,
                        content: null
                    }];
                    return item.attachments.map(file => ({
                        id: file.id || null,//Array.isArray(file.id) ? file.id[0] : file.id ?? 
                        sourceId: sourceData.sourceId,
                        optionalId: item.optionalId,
                        sourceChildId: item.sourceChildId,
                        sourceFor: sourceData.sourceFor,
                        sourceForName: sourceData.sourceForName,
                        type: sourceData.type,
                        parentSourceForName: sourceData.parentSourceForName,
                        documentNumber: item.documentNumber,
                        validFrom: item.validFrom,
                        institution: item.institution,
                        validTo: item.validTo,
                        fileUrl: null,
                        fileName: file.fileName,
                        fileType: file.fileType,
                        fileSize: file.fileSize,
                        filePath: null,
                        primary: file.primary,
                        storageType: file.storageType,
                        oneDriveId: file.oneDriveId || null,
                        accessLevel: file.accessLevel,
                        createdBy: `${user.firstName} ${user.lastName}`,
                        createdOn: new Date(),
                        updatedBy: `${user.firstName} ${user.lastName}`,
                        updatedOn: new Date(),
                        status: 1,
                        content: file.content
                    }))
                }
            });
        }
    });
});
