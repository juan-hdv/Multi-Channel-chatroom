var $attachedImage;

function handleFilesSelect(evt) {
    var files = evt.target.files; // FileList object
    f = files[0];
    if (!f.type.match('image.*')) return;
    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = ( (theFile) => {
        return function(e) {
            document.querySelector('#attachedImage').setAttribute("class",'visible');
            document.querySelector('#attachedImage').innerHTML = '';
            // Render thumbnail.
            var span = document.createElement('span');
            let imgClass="image-thumb";
            $attachedImage = ['<img class="',imgClass,'" src="', e.target.result,
                             '" title="', escape(theFile.name), '"/>'].join('');
            span.innerHTML = $attachedImage;
            document.getElementById('attachedImage').insertBefore(span, null);
            imgClass="image-post";
            $attachedImage = ['<img class="',imgClass,'" src="', e.target.result,
                            '" title="', escape(theFile.name), '"/>'].join('');
        };
    }) (f);
    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
} // handleFileSelect

function handleFilesClear() {
    $attachedImage = '';
    document.querySelector('#attachedImage').innerHTML = '';
    document.querySelector('#attachedImage').setAttribute("class",'hidden');
    // Clear files imput in case the next attachment will be the same previous image.
    document.querySelector('#files').value = null;
} // handleFileSelect


// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}        
