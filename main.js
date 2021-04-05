const Markov=require("./markov.js");
const Jimp = require("jimp");
const fs = require("fs");
var markov = new Markov();
var markovFull = new Markov();
var markovR = new Markov();
var markovG = new Markov();
var markovB = new Markov();


markovFull.load("./color.json");

markov.load("./wordbaseddiscord.json");

console.log("\n\n");


for(var x = 0; x<10; x++){
	var date1 = Date.now()
	var newMSG = markov.reproduce(1000, 6, "\n", "\n");
	var date2 = Date.now()
	console.log((date2-date1 + "ms: "), newMSG.trim())
}
for(var x = 0; x<10; x++){
	var date1 = Date.now()
	var newMSG = markov.reproduce(1000, 6, "\n", "\n");
	var date2 = Date.now()
	console.log((date2-date1 + "ms: "), newMSG.trim())
}
console.log("\n\n");


// markovR.load("./red.json");
// markovG.load("./green.json");
// markovB.load("./blue.json");


// var colR = []
// var colG = []
// var colB = []



// var colR = markovR.reproduce(65535, 2);
// var colG = markovG.reproduce(65535, 2);
// var colB = markovB.reproduce(65535, 2);

Jimp.read('img.png')
  .then(image => {
	  image.resize(256,256);
	  // learnImageFullColor(image, markovFull, "./imgcolor.json");
	  reproduceImageFullColor(image, markovFull, "./imgcolor.json", "imgtest.png");
	// for(var x = 0; x < image.bitmap.width; x++){
		// for(var y = 0; y < image.bitmap.height; y++) {
			//reproducing
			
			// var hex = Jimp.rgbaToInt(parseInt(colR[x*image.bitmap.width + y]||0), parseInt(colG[x*image.bitmap.width + y]||0), parseInt(colB[x*image.bitmap.width + y]||0),255);
			// image.setPixelColor(hex, x, y);
			
			
			//learning
			
			
			
			
			
			
			// colR[x*image.bitmap.width + y] = (Jimp.intToRGBA(image.getPixelColor(x, y)).r)
			// colG[x*image.bitmap.width + y] = (Jimp.intToRGBA(image.getPixelColor(x, y)).g)
			// colB[x*image.bitmap.width + y] = (Jimp.intToRGBA(image.getPixelColor(x, y)).b)
			// colR[x*image.bitmap.width + y + 65536] = (Jimp.intToRGBA(image.getPixelColor(y, x)).r)
			// colG[x*image.bitmap.width + y + 65536] = (Jimp.intToRGBA(image.getPixelColor(y, x)).g)
			// colB[x*image.bitmap.width + y + 65536] = (Jimp.intToRGBA(image.getPixelColor(y, x)).b)
		// }
	// }
	// image.write("testfc.png");
	
	// markovFull.learn(col, 2);
	// markovFull.save("./color.json");
	
	// markovR.learn(colR, 2);
	// markovG.learn(colG, 2);
	// markovB.learn(colB, 2);
	
	// markovR.save("./red.json");
	// markovG.save("./green.json");
	// markovB.save("./blue.json");
	// console.log(markovR.reproduce(65000, 2));
	
  })
  
function learnImageFullColor(image, markovModel, filepath) {
	col = []
	for(var x = 0; x < image.bitmap.width; x++){
		for(var y = 0; y < image.bitmap.height; y++) {
			var temp_color = image.getPixelColor(x, y);
			col[x*image.bitmap.width + y] = temp_color;
			col[x*image.bitmap.width + y + 65536] = image.getPixelColor(y, x)
		}
	}
	
	markovModel.learn(col, 2);
	markovModel.save(filepath);
	
}

function reproduceImageFullColor(image, markovModel, modelPath, imagePath) {
	markovFull.load(modelPath);
	var col = markovFull.reproduce(65535, 2);
	
	
	for(var x = 0; x < image.bitmap.width; x++){
		for(var y = 0; y < image.bitmap.height; y++) {
			var hex = parseInt(col[x*image.bitmap.width + y]||0)
			image.setPixelColor(hex, x, y);
		}
	}
	
	image.write(imagePath);
	
}














