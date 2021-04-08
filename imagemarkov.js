const Markov=require("./markov.js");
const Jimp = require("jimp");
const fs = require("fs");



var filename = process.argv[2]
Jimp.read('./imagedata/inputImages/' + filename)

  .then(image => {
	  
	  // image.resize(256,256);
	  if(process.argv.includes("-l")) learnImage(image, filename + ".json");
	  if(process.argv.includes("-g")) generateImage(image, filename + ".json", "out_" + filename);
  })
  

function learnImage(image, filepath) {
	var model = new Markov();
	cols = [];
	for(var x = 1; x<image.bitmap.width; x++) {
		for(var y = 1; y<image.bitmap.height; y++) {
			var dColXY= image.getPixelColor(x-1, y-1);
			var dColX = image.getPixelColor(x-1, y  );
			var dColY = image.getPixelColor(x  , y-1);
			var nCol  = image.getPixelColor(x  , y  );
			
			var dCol  = [dColXY, dColX, dColY, nCol]
			// console.log(x,y,dCol);
			model.learn(dCol, 3);
			
			var fail  = [dColX, dColY, nCol]
			model.learn(fail, 2);
			var failx = [dColY, nCol]
			var faily = [dColX, nCol]
			model.learn(failx, 1);
			model.learn(faily, 1);
			
		}
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
			var dColXY= image.getPixelColor(x-1, y-1);
			var dColX = image.getPixelColor(x-1, y  );
			var dColY = image.getPixelColor(x  , y-1);
			
			
			var dCol  = dColXY.toString() + " " + dColX.toString() + " " + dColY.toString();
			var newD  = markovFull.reproduce(4, 3, dCol)
			var nCol  = parseInt(newD[3])
			
			if(isNaN(nCol)) nCol = parseInt(markovFull.reproduce(2, 1, dColX.toString() + " " + dColY.toString())[2]);
			if(isNaN(nCol)) nCol = parseInt(markovFull.reproduce(2, 1, dColX.toString())[1]);
			if(isNaN(nCol)) nCol = parseInt(markovFull.reproduce(2, 1, dColY.toString())[1]);
			
			image.setPixelColor(nCol, x, y);
			
		}
		// process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(`Generating: ${x}/${image.bitmap.width}`);
	}
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	console.log("Done generating. Check file")
	image.write(imagePath);
	
	var exec = require('child_process').exec;

	exec(getCommandLine() + ' ' + imagePath);
}

function getCommandLine() {
   switch (process.platform) { 
      case 'darwin' : return 'open';
      case 'win32' : return 'start';
      case 'win64' : return 'start';
      default : return 'xdg-open';
   }
}