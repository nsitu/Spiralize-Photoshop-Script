#target photoshop
app.preferences.rulerUnits = Units.PIXELS;


layerFromBackground();

var docRef = app.activeDocument;      // document
var largestSegmentLength = 0;
var pixelOffset = 3;

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



 var startX = 0;
 var baseSegmentLength = docRef.height / 2;
 var SegmentLengthIncrement = docRef.height / 2.75;
  // 3 gives a slight overlap.
  // 2.5 gives a slight gap

  var shapeRef = [ [0,0], [0,docRef.height], [baseSegmentLength,docRef.height], [baseSegmentLength,0] ];
  docRef.selection.select(shapeRef);
  docRef.selection.copy();
  pasteInPlace();
  docRef.crop([-baseSegmentLength, 0, docRef.width, docRef.height]);
  docRef.activeLayer.resize(-100);
  docRef.activeLayer.translate(-baseSegmentLength);

  try{
     activeDocument.mergeVisibleLayers();
   }catch(e){}

   var backgroundLayerRef = docRef.activeLayer;    // layer

/*

  backgroundLayerRef.duplicate();


*/




// each segment is positioned with reference to the previous.
var refX = 0;
var refY = 0;
var position = 'first'; // could also be 'top' 'right' 'bottom' or 'left'

// if you have more than 50 segments, wow!

for (segment = 0; segment<50; segment+=1)
{


    docRef.activeLayer = backgroundLayerRef;  //activate the original layer

    if (startX > docRef.width){
      break;
    }
    var segWidth = (segment *  SegmentLengthIncrement ) +  baseSegmentLength;
    if (segWidth > largestSegmentLength){ largestSegmentLength = segWidth; }
    var endX = startX + segWidth;
    if (endX > docRef.width){
      endX = docRef.width;
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

  docRef.activeLayer = docRef.artLayers[layer-1];

  /*
  if (docRef.activeLayer == backgroundLayerRef){
    alert(docRef.activeLayer.name);
  }
  */
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
    // =======================================================

    //rotate current layer
    docRef.activeLayer.rotate(90*segment);


    // Math.PI

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


//alert(outerArcPosition+' '+outerArcBounds[0].value+', '+outerArcBounds[1].value+', '+outerArcBounds[2].value+', '+outerArcBounds[3].value);


/* calculate outer curcle */
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


var finalInnerCircleBounds = [0,0,0,0];
// bounds order: left top right bottom
finalInnerCircleBounds[0] = innerCircleBounds[0] - finalDocBounds[0] - pixelOffset;
finalInnerCircleBounds[1] = innerCircleBounds[1] - finalDocBounds[1] - pixelOffset;
finalInnerCircleBounds[2] = innerCircleBounds[2] - finalDocBounds[0] + pixelOffset;
finalInnerCircleBounds[3] = innerCircleBounds[3] - finalDocBounds[1] + pixelOffset;

var finalOuterCircleBounds = [0,0,0,0];
finalOuterCircleBounds[0] = outerCircleBounds[0] - finalDocBounds[0] - pixelOffset;
finalOuterCircleBounds[1] = outerCircleBounds[1] - finalDocBounds[1] - pixelOffset;
finalOuterCircleBounds[2] = outerCircleBounds[2] - finalDocBounds[0] + pixelOffset;
finalOuterCircleBounds[3] = outerCircleBounds[3] - finalDocBounds[1] + pixelOffset;

 docRef.crop(finalDocBounds);




// combine segments
 try{
    activeDocument.mergeVisibleLayers();
  }catch(e){}


    //makeCircle(innerCircleBounds[0],innerCircleBounds[1],innerCircleBounds[2],innerCircleBounds[3],1);


  //makeCircle(finalDocBounds[0],finalDocBounds[1],finalDocBounds[2],finalDocBounds[3],1);


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
/*
docRef.selection.cut();
pasteInPlace();
*/
