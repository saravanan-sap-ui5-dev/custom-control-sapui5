sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "app/customcontrol/control/DocumentHelper",
], (Controller, DocumentHelper) => {
    "use strict";

    return Controller.extend("app.customcontrol.controller.CustomControl", {
        onInit() {
            this.oOwnerComponent = this.getOwnerComponent();
            this.oRouter = this.oOwnerComponent.getRouter();
            this.oModel = this.oOwnerComponent.getModel();

            this.oDocumentHelper = this.byId("controlDocumentHelper");
            this.oAttachmentHelper = this.byId("controlAttachmentHelpler")

            this.documentInitiation();
        },
        documentInitiation() {
            this.oAttachmentHelper.fireInit();
            this.oDocumentHelper.setType(1);

            this.oDocumentHelper.fireFetchDocumentsRequested();
        },
        async onAttachmentChange(oEvent) {
            const oSource = oEvent.getSource();
            oSource.setController(this);
            oSource.invalidate();
        },
        async onInitAttachment(oEvent) {
            const oSource = oEvent.getSource();
            // oSource.setEditable(true);
            oSource.setAttachments([]);

            if (!oSource._oFragment) return;
            oSource.setController(this);
            const oModel = oSource._oFragment.getModel("attachmentModel");
            if (oModel) {
                oModel.setProperty("/attachments", []);
            }
            oSource.invalidate();
        },
        onDocumentChange(oEvent) {
            const oSource = oEvent.getSource();
            oSource.setController(this);
            oSource.invalidate();
        },
        async onInitDocument(oEvent) {
            const oSource = oEvent.getSource();
            if (!oSource._oFragment) return;
            oSource.setController(this);
            const oModel = oSource._oFragment.getModel("documentModel");
            if (oModel) {
                oModel.setProperty("/documents", []);
                oSource.setDocuments([]);
            }
            oSource.invalidate();
        },
        async onFetchDocumentsRequested(oEvent) { // fetch and refresh documents
            const oSource = oEvent.getSource();
            oSource.setEditable(true)

            await oSource.fetchDocuments(this);
        },
    });
});