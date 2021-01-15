#target photoshop;

app.preferences.rulerUnits = Units.PIXELS;


var selectedFolder = Folder.selectDialog("Please select folder");
if(selectedFolder != null){
  var fileList= selectedFolder.getFiles("*.tiff");
  
  if(fileList.length>0){
    
    for(var a in fileList){
      
      var fileRef = File(fileList[a]);
      var docRef = app.open(fileRef);
      var baseName = docRef.name.match(/(.*)\.[^\.]+$/)[1];

      var destinationFolder = new Folder(selectedFolder+"/JPG/");
      if ( ! destinationFolder.exists ) {  destinationFolder.create() }
      
      makeSpiral();

      var destinationFile = destinationFolder +"/"+baseName+".jpg";

      jpgFile = new File( destinationFile );
      jpgSaveOptions = new JPEGSaveOptions();
      jpgSaveOptions.embedColorProfile = true;
      jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
      jpgSaveOptions.matte = MatteType.NONE;
      jpgSaveOptions.quality = 10;
      app.activeDocument.saveAs(jpgFile, jpgSaveOptions, true, Extension.LOWERCASE);

      app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
      
      
    } 
  }

}


function makeSpiral(){
  layerFromBackground();

  var docRef = app.activeDocument;      // document


  var largestSegmentLength = 0;
  var pixelOffset = 3;
  var growthMode = 'linear';  // linear growth gives you a more or less archimedean spiral.

  // exponential growth is also an option (more like a nautillus)
  //var growthMode = 'exponential';
  //var growthFactor = 1.5; // defines multiplier for exponential growth

  // we will calculate these later.
  var innerSegmentLength = 0;
  var innerCircleDiameter =0;
  var innerCircleRadius =0;
  var innerCircleBounds = [0,0,0,0];

  var outerSegmentLength = 0;
  var outerArcPosition = '';
  var outerArcBounds = [0,0,0,0];
  var outerCircleDiameter =0;
  var outerCircleRadius =0;
  var outerCircleBounds = [0,0,0,0];

  var finalDocBounds = [0,0,0,0];

  var startX = 0;
  var originalDocumentHeight = docRef.height;
  var baseSegmentLength = docRef.height  ;
  var mirroredSegmentLength = 2 * docRef.height  ;

    // Set Desired Pixel Gap
    // NOTE; a negative gap value implies an overlap.
    // var desiredPixelGap = 0;

    // if you ever want to go beyond a basic prompt,
    // see here for advice on building interfaces. https://forums.adobe.com/thread/2222913

    var desiredPixelGap=150;

    /*var desiredPixelGap=prompt(
      "Image dimensions: "+ docRef.height +" x "+ docRef.width +"\n"+
      "Please specify a rung offset. \n"+
      "NOTE: Positive values give a gap. Negative values, overlap. \n",
      150,
      "Spiralize"
    );*/

    // what are the upper and lower limits of this gap?
    if (!parseInt(desiredPixelGap)){
      alert(desiredPixelGap+' is not get a valid number. Defaulting to 100.');
      desiredPixelGap = 100;
    }

    // I don't fully understand this math, but it works pretty well. I used excel to sample a bunch of options and did a linear regression.
    var growthIncrement = ( ( ( ( desiredPixelGap / docRef.height ) + 1.0029 ) / 2.8389 ) * docRef.height );

    if (!Math.floor(growthIncrement) > 0 ){
      alert('Growth Increment '+growthIncrement+" seems funky.");
    }
    // NOTE i'm using 1.0029 because of excel's calculated regression.
    // I imagine however that the ratio is what counts here.
    // TODO: see if you get similar results with 1 / 2.830690996111277

    // I used to do this with a hard coded value without allowing for Gap customization:
    // var growthIncrement = docRef.height * 0.3532706329916517;


    // ======Mirrored Segment======
    // to make a tapered centre in our spiral, we end up cropping a lot away.
    // to compensate for this we begin the spiral with a mirrored segment
    // this lengthens the panorama's start by mirroredSegmentLength pixels
    // TODO: could we apply a similar approach at the end of the spiral?

    // Photoshop does not allow documents larger than 300000px.
    // So, only do this if the result will fit within those bounds.

    if (docRef.width + mirroredSegmentLength < 300000){
      var shapeRef = [ [0,0], [0,docRef.height], [mirroredSegmentLength,docRef.height], [mirroredSegmentLength,0] ];
      docRef.selection.select(shapeRef);
      docRef.selection.copy();
      pasteInPlace();
      docRef.crop([-mirroredSegmentLength, 0, docRef.width, docRef.height]);
      docRef.activeLayer.resize(-100);
      docRef.activeLayer.translate(-mirroredSegmentLength);
      try{ activeDocument.mergeVisibleLayers(); }catch(e){}
    }

    var backgroundLayerRef = docRef.activeLayer;    // layer

    // at the end of the spiral there may well be wasted pixels.
    // it's possible that we might easily add another segment
    // by extending the panorama slightly
    // via a little bit of stretch
    // or via a mirrored segment.
    // a stretch involves a  generally acceptable degrading of quality
    // (we are stretching the image anyway via the warps.)
    // a mirrored segment may also be fine,
    //  though it may comes with the arbitrary aesthetic cost of unsightlyness
    // (but sometimes the mirroring looks great)
    // in any case we need to know how much to stretch the image by
    // in order to arrive at the required threshold.
    // you should map this out via some experiments
    // that clarify the following relation:
    // a spiral with x rungs requires an image with a proportion of 1:y
    // #rungs   img proportion
    // 1        1:1
    // 2        1:3
    // 3        1:6
    // 4        1:10
    // 5        1:15
    // 6        1:21
    // 7        1:28
    // 8        1:36
    // 9        1:45
    // 10       1:55
    // 11       1:66
    // 12       1:78
    // 13       1:91
    // 14       1:105

  // Triangular numbers
  // this sequence has a name.
  // the sum of the first n positive integers is (n^2 + n) / 2
  // the nth triangular number tn is equal to

  //TODO: At the centre of the spiral, construct the pyramid
  // implicit in the triangle formed by stacking the segments
  //
  //           *
  //         *   *
  //       *   *   *
  //     *   *   *   *





  // each segment is positioned with reference to the previous.
  var refX = 0;
  var refY = 0;
  var position = 'first'; // could also be 'top' 'right' 'bottom' or 'left'

  // if you have more than 50 segments, wow!
  var segmentWidths = []; // in exponential mode we need a place to track the widths

  for (segment = 0; segment<50; segment+=1)
  {

      docRef.activeLayer = backgroundLayerRef;  //activate the original layer

      if (startX > docRef.width){  break;  }

      if (growthMode == 'exponential'){
        if (segment == 0){ var segWidth = baseSegmentLength; }
        else{ var segWidth = segmentWidths[segment-1]*growthFactor; }
        segmentWidths[segment]=segWidth;
      }
      else{
        var segWidth = (segment *  growthIncrement ) +  baseSegmentLength;
      }

      if (segWidth > largestSegmentLength){ largestSegmentLength = segWidth; }
      var endX = startX + segWidth;
      if (endX > docRef.width){
        endX = docRef.width;
        //if we have overshot the edge of the image, don't make any new layers.
      }else{
        docRef.selection.select(Array (Array(startX, 0), Array(startX, docRef.height), Array(endX,docRef.height), Array(endX,0)), SelectionType.REPLACE, 0, false);
        docRef.selection.copy();        //copy the selection
        docRef.artLayers.add();         //create and paste new layer
        docRef.paste();
        MoveLayerTo(docRef.activeLayer,0,0);
      }
      startX +=segWidth;
  }

  backgroundLayerRef.remove();

  //crop the image
  var docBounds = [0, 0, largestSegmentLength, docRef.height];
  docRef.crop(docBounds);



  segment = 0;



  var numLayers = docRef.artLayers.length;
  for (var layer = numLayers; layer > 0; layer-- )
  {

    // on the third last layer, record the arc position
    // to help calculate the a final outer circle crop.
    if (layer == 3){ outerArcPosition = position; }

    // warp and rotate current layer
    docRef.activeLayer = docRef.artLayers[layer-1];
    warpCurrentLayer();
    docRef.activeLayer.rotate(90*segment);

      var triSide = docRef.height.value / Math.sqrt(2);

      if (position == 'first'){
        MoveLayerTo(docRef.activeLayer,0,0);

        refX = docRef.activeLayer.bounds[2].value;
        refY = docRef.activeLayer.bounds[3].value;

        // bounds order: left top right bottom
        innerSegmentLength = docRef.activeLayer.bounds[2].value - docRef.activeLayer.bounds[0].value;
        //alert('zero:'+docRef.activeLayer.bounds[0].value+' one:'+docRef.activeLayer.bounds[1].value+' two:'+docRef.activeLayer.bounds[2].value+ 'three:'+docRef.activeLayer.bounds[3].value + +' first segment width: '+innerSegmentLength);
        //exit;
        innerCircleDiameter = Math.sqrt(Math.pow(innerSegmentLength,2)+Math.pow(innerSegmentLength,2));
        innerCircleRadius = innerCircleDiameter / 2;
        innerCircleBounds [0] = docRef.activeLayer.bounds[0].value - ( innerCircleRadius - ( innerSegmentLength / 2 ) ) ; // left
        innerCircleBounds [1] = docRef.activeLayer.bounds[1].value; // top
        innerCircleBounds [2] = innerCircleBounds [0] + innerCircleDiameter;
        innerCircleBounds [3] = innerCircleBounds [1] + innerCircleDiameter;

        position = 'right';
      }
      else if (position == 'right'){
        MoveLayerTo(docRef.activeLayer, refX - triSide -pixelOffset, refY - triSide -pixelOffset);
        refX = docRef.activeLayer.bounds[0].value;
        refY = docRef.activeLayer.bounds[3].value;
        position = 'bottom';
      }
      else if(position == 'bottom'){
        // calculate width of current layer based on bounds.
        var theWidth = docRef.activeLayer.bounds[2].value - docRef.activeLayer.bounds[0].value;
        MoveLayerTo(docRef.activeLayer, refX - theWidth + triSide + pixelOffset, refY - triSide -pixelOffset);
        refX = docRef.activeLayer.bounds[0].value;
        refY = docRef.activeLayer.bounds[1].value;
        position = 'left';

      }
      else if(position == 'left'){
        // calculate height of current layer based on bounds.
        var theHeight = docRef.activeLayer.bounds[3].value - docRef.activeLayer.bounds[1].value;
        var theWidth = docRef.activeLayer.bounds[2].value - docRef.activeLayer.bounds[0].value;

        MoveLayerTo(docRef.activeLayer, refX - theWidth + triSide + pixelOffset, refY - theHeight + triSide + pixelOffset);
        refX = docRef.activeLayer.bounds[2].value;
        refY = docRef.activeLayer.bounds[1].value;
        position = 'top';
      }
      else if(position == 'top'){
        // calculate height of current layer based on bounds.
        var theHeight = docRef.activeLayer.bounds[3].value - docRef.activeLayer.bounds[1].value;

        MoveLayerTo(docRef.activeLayer, refX - triSide - pixelOffset, refY - theHeight + triSide + pixelOffset);
        refX = docRef.activeLayer.bounds[2].value;
        refY = docRef.activeLayer.bounds[3].value;
        position = 'right';
      }

      // update final bounds  to include this segment
      if (finalDocBounds[0] > docRef.activeLayer.bounds[0].value ){ finalDocBounds[0] = docRef.activeLayer.bounds[0].value; }
      if (finalDocBounds[1] > docRef.activeLayer.bounds[1].value ){ finalDocBounds[1] = docRef.activeLayer.bounds[1].value; }
      if (finalDocBounds[2] < docRef.activeLayer.bounds[2].value ){ finalDocBounds[2] = docRef.activeLayer.bounds[2].value; }
      if (finalDocBounds[3] < docRef.activeLayer.bounds[3].value ){ finalDocBounds[3] = docRef.activeLayer.bounds[3].value; }

      // on the third last layer, measure the arc width
      // as the basis for a final outer circle crop.
      if (layer == 3){  outerArcBounds = docRef.activeLayer.bounds;   }
      //alert(' layer '+layer+', segment '+segment+', numlayers:'+numLayers);

      segment ++;

  }

  /* calculate outer circle */
  if (outerArcPosition == 'top' || outerArcPosition == 'bottom'){
    outerSegmentLength = outerArcBounds[2].value - outerArcBounds[0].value;
  }else{
    outerSegmentLength = outerArcBounds[3].value - outerArcBounds[1].value;
  }
  outerCircleDiameter = Math.sqrt(Math.pow(outerSegmentLength,2)+Math.pow(outerSegmentLength,2));
  outerCircleRadius = outerCircleDiameter / 2;

  if (outerArcPosition == 'top'){
    outerCircleBounds [0] = outerArcBounds[0].value - ( outerCircleRadius - ( outerSegmentLength / 2 ) ) ;
    outerCircleBounds [1] = outerArcBounds[1].value;
  }
  else if(outerArcPosition == 'right'){
    outerCircleBounds [0] = outerArcBounds[2].value - outerCircleDiameter;
    outerCircleBounds [1] = outerArcBounds[1].value - ( outerCircleRadius - ( outerSegmentLength / 2 ) ) ;
  }
  else if(outerArcPosition == 'bottom'){
    outerCircleBounds [0] = outerArcBounds[0].value - ( outerCircleRadius - ( outerSegmentLength / 2 ) ) ;
    outerCircleBounds [1] = outerArcBounds[3].value - outerCircleDiameter ;
  }
  else if(outerArcPosition == 'left'){
    outerCircleBounds [0] = outerArcBounds[0].value;
    outerCircleBounds [1] = outerArcBounds[1].value - ( outerCircleRadius - ( outerSegmentLength / 2 ) ) ;
  }
  outerCircleBounds [2] = outerCircleBounds [0] + outerCircleDiameter;
  outerCircleBounds [3] = outerCircleBounds [1] + outerCircleDiameter;

  //alert(outerCircleBounds[0]+', '+outerCircleBounds[1]+', '+outerCircleBounds[2]+', '+outerCircleBounds[3]);

  /* add some padding at the end*/
  finalDocBounds[0] = finalDocBounds[0] - 100;
  finalDocBounds[1] = finalDocBounds[1] - 100;
  finalDocBounds[2] = finalDocBounds[2] + 100;
  finalDocBounds[3] = finalDocBounds[3] + 100;

  // NOTE: the bounds are ordered as follows: left top right bottom
  var finalInnerCircleBounds = [0,0,0,0];

  // Here we calculate the bounds of a circle used to subtract a core from the centre
  // we begin with innerCircleBounds, (already calculated during assembly)
  // innerCircleBounds defines a circle aligning with the outer edge of the 1st arc
  // we expand this circle so as to partially contain surrounding spiral rungs.
  // We expand the circle by the desiredPixelGap, already defined.

  // TODO I do  like the currenteffect with its outer blunt edge
  // but you could also create a  a pretty nice balanced donut / wreath.
  // if you base the outer circle on the inner circle.
  // e.g. by expanding the circle to its breaking point.
  // it's of course an open question how to calculate that breaking point.
  // this is at least worth exploring / offering as an option
  // especially if you can develop a UI to turn it on or off.

  // use the desiredPixelGap as an offset to calculate the selection circle for inner trimming.
  finalInnerCircleBounds[0] = Math.abs(innerCircleBounds[0] - finalDocBounds[0] - desiredPixelGap);
  finalInnerCircleBounds[1] = Math.abs(innerCircleBounds[1] - finalDocBounds[1] - desiredPixelGap);
  finalInnerCircleBounds[2] = innerCircleBounds[2] - finalDocBounds[0] + desiredPixelGap;
  finalInnerCircleBounds[3] = innerCircleBounds[3] - finalDocBounds[1] + desiredPixelGap;

  var finalOuterCircleBounds = [0,0,0,0];
  finalOuterCircleBounds[0] = outerCircleBounds[0] - finalDocBounds[0] - pixelOffset;
  finalOuterCircleBounds[1] = outerCircleBounds[1] - finalDocBounds[1] - pixelOffset;
  finalOuterCircleBounds[2] = outerCircleBounds[2] - finalDocBounds[0] + pixelOffset;
  finalOuterCircleBounds[3] = outerCircleBounds[3] - finalDocBounds[1] + pixelOffset;

  docRef.crop(finalDocBounds);

  // Flatten layers together
  try{  activeDocument.mergeVisibleLayers(); }catch(e){}

  // TODO: the following is a kind of desctructive editing.
  // you could make a layer mask instead.
  makeCircle(
      finalInnerCircleBounds[0],
      finalInnerCircleBounds[1],
      finalInnerCircleBounds[2],
      finalInnerCircleBounds[3],
  1);
  docRef.selection.clear();
  makeCircle(
      finalOuterCircleBounds[0],
      finalOuterCircleBounds[1],
      finalOuterCircleBounds[2],
      finalOuterCircleBounds[3],
  1);
  docRef.selection.invert();
  docRef.selection.clear();

  //TRIM
  docRef.selection.deselect();
  docRef.trim(); // trim blank space

  docRef.resizeImage(docRef.width, null, docRef.width / 20); // resize to 20 inches; do not resample;
  docRef.resizeCanvas(UnitValue(24,"in"),UnitValue(24,"in"));

  //add white background
  var artworkLayer = docRef.activeLayer;
  var newLayer = docRef.artLayers.add();
  newLayer.move(artworkLayer, ElementPlacement.PLACEAFTER);
  var fillColor = new SolidColor();
          fillColor.rgb.red = 255;
          fillColor.rgb.green = 255;
          fillColor.rgb.blue = 255;
  docRef.selection.selectAll();
  docRef.selection.fill(fillColor);
  docRef.selection.deselect();
}

//===========Functions=======================

function warpCurrentLayer(){
  var idTrnf = charIDToTypeID( "Trnf" );
      var desc11 = new ActionDescriptor();
      var idnull = charIDToTypeID( "null" );
          var ref3 = new ActionReference();
          var idLyr = charIDToTypeID( "Lyr " );
          var idOrdn = charIDToTypeID( "Ordn" );
          var idTrgt = charIDToTypeID( "Trgt" );
          ref3.putEnumerated( idLyr, idOrdn, idTrgt );
      desc11.putReference( idnull, ref3 );
      var idFTcs = charIDToTypeID( "FTcs" );
      var idQCSt = charIDToTypeID( "QCSt" );
      var idQcsa = charIDToTypeID( "Qcsa" );
      desc11.putEnumerated( idFTcs, idQCSt, idQcsa );
      var idOfst = charIDToTypeID( "Ofst" );
          var desc12 = new ActionDescriptor();
          var idHrzn = charIDToTypeID( "Hrzn" );
          var idPxl = charIDToTypeID( "#Pxl" );
          desc12.putUnitDouble( idHrzn, idPxl, 0.000000 );
          var idVrtc = charIDToTypeID( "Vrtc" );
          var idPxl = charIDToTypeID( "#Pxl" );
          desc12.putUnitDouble( idVrtc, idPxl, -0.009065 );
      var idOfst = charIDToTypeID( "Ofst" );
      desc11.putObject( idOfst, idOfst, desc12 );
      var idWdth = charIDToTypeID( "Wdth" );
      var idPrc = charIDToTypeID( "#Prc" );
      desc11.putUnitDouble( idWdth, idPrc, 100.002108 );
      var idHght = charIDToTypeID( "Hght" );
      var idPrc = charIDToTypeID( "#Prc" );
      desc11.putUnitDouble( idHght, idPrc, 100.000545 );
      var idwarp = stringIDToTypeID( "warp" );
          var desc13 = new ActionDescriptor();
          var idwarpStyle = stringIDToTypeID( "warpStyle" );
          var idwarpStyle = stringIDToTypeID( "warpStyle" );
          var idwarpArc = stringIDToTypeID( "warpArc" );
          desc13.putEnumerated( idwarpStyle, idwarpStyle, idwarpArc );
          var idwarpValue = stringIDToTypeID( "warpValue" );
          desc13.putDouble( idwarpValue, 50.000000 );
          var idwarpPerspective = stringIDToTypeID( "warpPerspective" );
          desc13.putDouble( idwarpPerspective, 0.000000 );
          var idwarpPerspectiveOther = stringIDToTypeID( "warpPerspectiveOther" );
          desc13.putDouble( idwarpPerspectiveOther, 0.000000 );
          var idwarpRotate = stringIDToTypeID( "warpRotate" );
          var idOrnt = charIDToTypeID( "Ornt" );
          var idHrzn = charIDToTypeID( "Hrzn" );
          desc13.putEnumerated( idwarpRotate, idOrnt, idHrzn );
          var iduOrder = stringIDToTypeID( "uOrder" );
          desc13.putInteger( iduOrder, 4 );
          var idvOrder = stringIDToTypeID( "vOrder" );
          desc13.putInteger( idvOrder, 2 );
      var idwarp = stringIDToTypeID( "warp" );
      desc11.putObject( idwarp, idwarp, desc13 );
      var idIntr = charIDToTypeID( "Intr" );
      var idIntp = charIDToTypeID( "Intp" );
      var idBcbc = charIDToTypeID( "Bcbc" );
      desc11.putEnumerated( idIntr, idIntp, idBcbc );
  executeAction( idTrnf, desc11, DialogModes.NO );

}
function MoveLayerTo(fLayer,fX,fY) {
  var Position = fLayer.bounds;
  Position[0] = fX - Position[0];
  Position[1] = fY - Position[1];
  fLayer.translate(-Position[0],-Position[1]);
}


function pasteInPlace(){
  var idpast = charIDToTypeID( "past" );
    var desc557 = new ActionDescriptor();
    var idinPlace = stringIDToTypeID( "inPlace" );
    desc557.putBoolean( idinPlace, true );
    var idAntA = charIDToTypeID( "AntA" );
    var idAnnt = charIDToTypeID( "Annt" );
    var idAnno = charIDToTypeID( "Anno" );
    desc557.putEnumerated( idAntA, idAnnt, idAnno );
    executeAction( idpast, desc557, DialogModes.NO );
}

  function makeCircle(Left,Top,Right,Bottom,Feather) {
  if(Feather == undefined) Feather = 0;
  var desc3 = new ActionDescriptor();
          var ref1 = new ActionReference();
          ref1.putProperty( charIDToTypeID('Chnl'), charIDToTypeID('fsel') );
      desc3.putReference( charIDToTypeID('null'), ref1 );
          var desc4 = new ActionDescriptor();
          desc4.putUnitDouble( charIDToTypeID('Top '), charIDToTypeID('#Pxl'), Top );
          desc4.putUnitDouble( charIDToTypeID('Left'), charIDToTypeID('#Pxl'), Left );
          desc4.putUnitDouble( charIDToTypeID('Btom'), charIDToTypeID('#Pxl'), Bottom );
          desc4.putUnitDouble( charIDToTypeID('Rght'), charIDToTypeID('#Pxl'), Right );
      desc3.putObject( charIDToTypeID('T   '), charIDToTypeID('Elps'), desc4 );
      desc3.putUnitDouble( charIDToTypeID('Fthr'), charIDToTypeID('#Pxl'), Feather );
      desc3.putBoolean( charIDToTypeID('AntA'), true );
      executeAction( charIDToTypeID('setd'), desc3, DialogModes.NO );
  };


function layerFromBackground() {
  var desc2 = new ActionDescriptor();
  var ref2 = new ActionReference();
  ref2.putProperty( charIDToTypeID('Lyr '), charIDToTypeID('Bckg') );
  desc2.putReference( charIDToTypeID('null'), ref2 );
  var desc3 = new ActionDescriptor();
  desc3.putUnitDouble( charIDToTypeID('Opct'), charIDToTypeID('#Prc'), 100.000000 );
  desc3.putEnumerated( charIDToTypeID('Md  '), charIDToTypeID('BlnM'), charIDToTypeID('Nrml') );
  desc2.putObject( charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc3 );
  try{ executeAction( charIDToTypeID('setd'), desc2, DialogModes.NO ); }catch(e){}
};
