// Initialize Web Scanning and Web Viewing
$(function () {
    try {
        // Initialize Web Document Viewer
        var viewer = new Atalasoft.Controls.WebDocumentViewer({
            parent: $('.atala-document-container'),
            toolbarparent: $('.atala-document-toolbar'),
            allowannotations: false,
            serverurl: 'WebDocViewerHandler.ashx'
        });

        // Initialize Web Scanning
        Atalasoft.Controls.Capture.WebScanning.initialize({
            handlerUrl: 'WebCaptureHandler.ashx',
            onScanClientReady: function (eventName, eventObj) {
                console.log("Scan Client Ready");
                //Set encryption key for scan/import results located in persistent store in the UserProfile folder
                Atalasoft.Controls.Capture.WebScanning.LocalFile.setEncryptionKey("foobar");
            },
            onScanStarted: function (eventName, eventObj) {
                $('#scanid').prop('disabled', true);
                console.log('Scan Started');
            },
            onScanCompleted: function (eventName, eventObj) {
                console.log('Scan Completed: ' + eventObj.success);
                
                $('#scanid').prop('disabled', false).val(makeId(7)); //Renable the scan id... and make a random one.
            },
            onImportCompleted: function (eventName, eventObj) { console.log('Import Completed: ' + eventObj.success); },
            onImageAcquired: function (eventName, eventObj) {
                console.log("Image Acquired");
                // Remove image as temporary result
                eventObj.discard = true;
                // Use LocalFile API for upload scan result to server with specified settings
                Atalasoft.Controls.Capture.WebScanning.LocalFile.asBase64String(eventObj.localFile,
                    "jpg",
                    {
                        quality: 5
                    },
                    function (data) { Atalasoft.Controls.Capture.UploadToCaptureServer.uploadToServer(data, { formData: { scanid: $('#scanid').val(), page: eventObj.sheetNo } }); });
            },
            onUploadError: function (msg, params) { console.log(msg); },
            onUploadStarted: function (eventName, eventObj) { console.log('Upload Started'); },
            onUploadCompleted: function (eventName, eventObj) {
                console.log('Upload Completed: ' + eventObj.success);
                if (eventObj.success) {
                    console.log("atala-capture-upload/" + eventObj.documentFilename);
                    viewer.OpenUrl("atala-capture-upload/" + eventObj.documentFilename);
                    Atalasoft.Controls.Capture.CaptureService.documentFilename = eventObj.documentFilename;
                }
            },

            // Default scanning options used for Import operation.
            scanningOptions: { resultPixelType: 2, deliverables: { localFile: { format: "tif" } } }
        });
    } catch (error) {
        console.log("Thrown error: " + error.description);
    }

    $('#scanid').val(makeId(7)); //Make a random ID on load.
});

function scanWithSettings() {
    Atalasoft.Controls.Capture.WebScanning.scanningOptions = collectScanSettings();
    console.log("scanningOptions: ");
    console.log(Atalasoft.Controls.Capture.WebScanning.scanningOptions);
    Atalasoft.Controls.Capture.WebScanning.scan();
}

function collectScanSettings() {
    var scanningOptions = { resultPixelType: 2 };
    var options = {
        pixelType: 1,
        showScannerUI: 0,
        dpi: 1,
        paperSize: 1
    };
    var value;
    for (param in options) {
        value = $('#' + param).val();
        if (value != "" && value != "(blank)") {
            if (!isNaN(parseInt(value))) {
                value = parseInt(value);
            }
            param = param.replace('_', '.');
            if (value == "true") value = true;
            if (value == "false") value = false;
            scanningOptions[param] = value;
        }
    }

    return scanningOptions;
}

var makeId = function (len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}