sap.ui.define([
    "sap/ui/core/UIComponent",
    "app/customcontrol/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/IconPool",
    'sap/m/IllustrationPool'
], (UIComponent, models, JSONModel, IconPool, IllustrationPool) => {
    "use strict";

    return UIComponent.extend("app.customcontrol.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            var oRouter = this.getRouter();
            oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
            oRouter.initialize();

            // Register icons and illustrations
            this.iconPoolRegister();
        },
        _onBeforeRouteMatched: function (oEvent) {
            this.setModel(new JSONModel([]), "errors");
            this.setModel(new JSONModel([]), "attachmentsMdl");
        },

        iconPoolRegister: function () {
            // Icon font registration (already correct)
            IconPool.registerFont({
                fontFamily: "SAP-icons-TNT",
                fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/")
            });
            IconPool.registerFont({
                fontFamily: "BusinessSuiteInAppSymbols",
                fontURI: sap.ui.require.toUrl("sap/ushell/themes/base/fonts/")
            });

            // Illustration set: Fiori (required for sapIllus-* types)
            IllustrationPool.registerIllustrationSet({
                setFamily: "fiori",
                setURI: sap.ui.require.toUrl("sap/f/themes/base/illustrations")
            }, false);

            // Optional: TNT set, for specific TNT illustrations
            IllustrationPool.registerIllustrationSet({
                setFamily: "tnt",
                setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
            }, false);
        },
        getContentDensityClass: function () {
            if (!this._sContentDensityClass) {
                if (!Device.support.touch) {
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        },
    });
});