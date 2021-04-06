const Markov=require("./markov.js");
const Jimp = require("jimp");
const fs = require("fs");

//          PATH TO IMAGE
var filename = process.argv[2]
Jimp.read('./imagedata/inputImages/' + filename)
  .then(image => {
	  //Optional resize
	  // image.resize(256,256);
	  
	  
	  //New and improved generation
	  
	  //                 Only change this.
	  //                 this is the model save path
	  learnImage(image, "./imagedata/models/" + filename + ".json");
	  //                   and this is the image save path
	  generateImage(image, "./imagedata/models/" + filename + ".json", "./imagedata/outputImages/" + filename);
  
  
  //Old stripy generation
	  // learnImageFullColor(image, markovFull, "./imagedata/maeglin.json", 2);
	  // reproduceImageFullColor(image, markovFull, "marglinnew.png", 2);
	  
	  //Old stripy generation but treat channels individually
	  //Requires the markovR, G and B from above
	  // learnImageRGB(image, markovR, markovB, markovG, "./imagedata/rgbtest");
	  // reproduceRGB(image, markovR, markovB, markovB, "./imagedata/rgbtest.png");
	  
  
  
  })
  

function learnImage(image, filepath) {
	var model = new Markov();
	cols = [];
	for(var x = 1; x<image.bitmap.width; x++) {
		for(var y = 1; y<image.bitmap.height; y++) {
			var dColX = image.getPixelColor(x-1, y  );
			var dColY = image.getPixelColor(x  , y-1);
			var nCol  = image.getPixelColor(x  , y  );
			
			var dCol  = [dColX, dColY, nCol]
			// console.log(x,y,dCol);
			model.learn(dCol, 2);
			
			var failx = [dColY, nCol]
			var faily = [dColX, nCol]
			model.learn(failx, 1);
			model.learn(faily, 1);
			
		}
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(`Learning: ${x}/${image.bitmap.width}`);
		
	}
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	console.log("Done learning");
	model.save(filepath)
}

function generateImage(image, modelPath, imagePath) {
	var markovFull = new Markov();
	markovFull.load(modelPath);
	
	for(var x = 1; x<image.bitmap.width; x++) {
		for(var y = 1; y<image.bitmap.height; y++) {
			var dColX = image.getPixelColor(x-1, y  );
			var dColY = image.getPixelColor(x  , y-1);
			
			
			var dCol  = dColX.toString() + " " + dColY.toString();
			var newD  = markovFull.reproduce(3, 2, dCol)
			var nCol  = parseInt(newD[2])
			
			if(isNaN(nCol)) nCol = parseInt(markovFull.reproduce(2, 1, dColX.toString())[1]);
			if(isNaN(nCol)) nCol = parseInt(markovFull.reproduce(2, 1, dColY.toString())[1]);
			
			// console.log(x, y, dCol, newD, nCol)
			image.setPixelColor(nCol, x, y);
		}
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(`Generating: ${x}/${image.bitmap.width}`);
	}
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	console.log("Done generating. Check file")
	image.write(imagePath);
}
  
function reproduceRGB(image, modelRed, modelGreen, modelBlue, imagePath) {
	var colR = modelRed.reproduce(65535, 2);
	var colG = modelGreen.reproduce(65535, 2);
	var colB = modelBlue.reproduce(65535, 2);
	
	for(var x = 0; x < image.bitmap.width; x++){
		for(var y = 0; y < image.bitmap.height; y++) {
			var hex = Jimp.rgbaToInt(parseInt(colR[x*image.bitmap.width + y]||0), parseInt(colG[x*image.bitmap.width + y]||0), parseInt(colB[x*image.bitmap.width + y]||0),255);
			image.setPixelColor(hex, x, y);
		}
	}
	image.write(imagePath);
}

function learnImageRGB(image, filepath) {
	var markovR = new Markov();
	var markovG = new Markov();
	var markovB = new Markov();
	colR = [];
	colG = [];
	colB = [];
	for(var x = 0; x < image.bitmap.width; x+=2){
		for(var y = 0; y < image.bitmap.height; y++) {
			colR[x*image.bitmap.width + y] = (Jimp.intToRGBA(image.getPixelColor(x, y)).r)
			colG[x*image.bitmap.width + y] = (Jimp.intToRGBA(image.getPixelColor(x, y)).g)
			colB[x*image.bitmap.width + y] = (Jimp.intToRGBA(image.getPixelColor(x, y)).b)
			colR[x*image.bitmap.width + y + 65536] = (Jimp.intToRGBA(image.getPixelColor(y, x)).r)
			colG[x*image.bitmap.width + y + 65536] = (Jimp.intToRGBA(image.getPixelColor(y, x)).g)
			colB[x*image.bitmap.width + y + 65536] = (Jimp.intToRGBA(image.getPixelColor(y, x)).b)
		}
	}
	modelRed.learn(colR, 2);
	modelGreen.learn(colG, 2);
	modelBlue.learn(colB, 2);
	modelRed.save(filepath + "_r.json");
	modelGreen.save(filepath + "_g.json");
	modelBlue.save(filepath + "_b.json");
}	
  

function learnImageFullColor(image, markovModel, filepath, context) {
	col = []
	for(var x = 0; x < image.bitmap.width; x++){
		for(var y = 0; y < image.bitmap.height; y++) {
			var temp_color = image.getPixelColor(x, y);
			col[x*image.bitmap.width + y] = temp_color;
			col[x*image.bitmap.width + y + 65536] = image.getPixelColor(y, x)
		}
	}
	
	markovModel.learn(col, context);
	markovModel.save(filepath);
	
}

function reproduceImageFullColor(image, markovModel, imagePath, context) {
	
	var col = markovFull.reproduce(65535, context);
	
	
	for(var x = 0; x < image.bitmap.width; x++){
		for(var y = 0; y < image.bitmap.height; y++) {
			var hex = parseInt(col[x*image.bitmap.width + y]||0)
			image.setPixelColor(hex, x, y);
		}
	}
	
	image.write(imagePath);
	
}

function textToImage(image, textModel) {
	var text = textModel.reproduce(256*256*3, 6);
	fs.writeFile("ttitest.txt", text, function(){})
	for(var x = 0; x < image.bitmap.width; x++){
		for(var y = 0; y < image.bitmap.height; y++) {
			var colR = text.charCodeAt(text[(256*x + y)*3]);
			var colG = text.charCodeAt(text[(256*x + y)*3+1]);
			var colB = text.charCodeAt(text[(256*x + y)*3+2]);
			var hex = Jimp.rgbaToInt(colR, colG, colB, 255);
			image.setPixelColor(hex, x, y);
		}
	}
	image.write("./ttitest.png");
	
}












