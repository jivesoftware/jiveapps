package flashupload.src
{

public class flashupload extends Sprite
	{
		public var uploadId:String;
		
		public function flashupload()
		{
			// make everything scale with the stage
			stage.scaleMode = "exactFit";
			
			// fill up the screen with something that Flash can click on
			var shape:Sprite = new Sprite();
			shape.graphics.beginFill(0, 0);
			shape.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
			addChild(shape);
			
			// get any parameters to pass into the external call, passed from flashvars
			uploadId = LoaderInfo(root.loaderInfo).parameters.uploadId;
			
			// handle file selection and 
			addEventListener("click", browseAndUpload);
		}
		
		public function browseAndUpload(event:Event):void
		{
			var files:FileReferenceList = new FileReferenceList();
			var filters:Array = [
				new FileFilter("Images", "*.jpg;*.gif;*.png")
			];
			
			files.addEventListener("select", function(event:Event):void {
				var map:Object = {}, i:int = files.fileList.length;
				
				files.fileList.forEach(function(file:FileReference, index:int, array:Array):void {
					file.load();
					file.addEventListener("complete", function(event:Event):void {
						ExternalInterface.call("processBase64Encodings", file.name, Base64.encode(file.data), uploadId);
//                        // Issue with external interface, having trouble converting an object of this size, but was fine with strings
//                        map[file.name] = Base64.encode(file.data);
//                        if (--i == 0) {
//                            ExternalInterface.call("processBase64Encodings", map, uploadId);
//                        }
					});
				});
			});
			
			files.browse(filters);
		}
	}
}