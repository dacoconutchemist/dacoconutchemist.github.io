// https://stackoverflow.com/a/17130415

function  getMousePosNoTransform(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }
}

function getMouse(canvas, evt) {
	/*var ctx = canv.getContext("2d");
	var pos = getMousePosNoTransform(canvas, evt);          // get adjusted coordinates as above
	var matrix = ctx.currentTransform;         // W3C (future)
	var imatrix = matrix.invertSelf();         // invert

	// apply to point:
	var x = pos.x * imatrix.a + pos.y * imatrix.c + imatrix.e;
	var y = pos.x * imatrix.b + pos.y * imatrix.d + imatrix.f;*/
	var pos = getMousePosNoTransform(canvas, evt); 
	return {
	    x: pos.x - canvas.width/2,
	    y: pos.y - canvas.height/2
	};
}
