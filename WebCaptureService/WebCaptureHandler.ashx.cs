using System.Web;
using Atalasoft.Imaging.WebControls.Capture;
using System.Collections.Generic;
using System.IO;

namespace WebCaptureService
{
    public class WebCaptureHandler : WebCaptureRequestHandler
    {
        protected override string HandleUpload(HttpContext context)
        {
            string uploadedFile = base.HandleUpload(context); //You can have the base method upload the file for you and return the filename. 
            string uploadedPath = System.IO.Path.Combine(WebCaptureRequestHandler.UploadPath, uploadedFile); //Full path on disk

            string newName = string.Format("{0}.tif", context.Request.Form["page"]); //The name is just page.tif
            string scanId = context.Request.Form["scanid"];

            string scanIdName = Path.Combine(scanId, newName); //Folder + Name to give to the client to open.



            if (!Directory.Exists (System.IO.Path.Combine(WebCaptureRequestHandler.UploadPath, scanId))) //If a folder with the name of scan id doesn't exist, make it.
                Directory.CreateDirectory(System.IO.Path.Combine(WebCaptureRequestHandler.UploadPath, scanId));


            string newPath = System.IO.Path.Combine(WebCaptureRequestHandler.UploadPath, scanIdName); //Our new filename path. 

            System.IO.File.Move(uploadedPath, newPath);

            context.Response.Clear(); //We need to clear the old content as the base.HandleUpload has already written the old path out. 
            context.Response.ClearContent();
            Dictionary<string, string> respDict = new Dictionary<string, string>();
            respDict["success"] = "true";
            respDict["filename"] = scanIdName;

            context.Response.Write(DictToJson(respDict)); //This writes our JSON response to the client. 

            return scanIdName; //Just be aware that this doesn't alter the filename written to the client. We have to do that with the DictToJson above. 
        }
    }
}