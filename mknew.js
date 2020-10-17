const fs = require("fs");
const Jimp = require('jimp');
const util = require("util")
var myArgs = process.argv.slice(2);
output_arg = false;

var settings = getSettings(myArgs);
// console.log(settings);
var file = myArgs[0];
var context = 4;
var timings = [];
if(settings["reset"]){
	resetModel();
}
if(settings["imagetotext"]){
	(async ()=>{
		// var txt = await learnimage(settings["file"]);
		// fs.writeFile(settings["file"] + ".txt", txt, function (err) {
			// if (err) {
				// console.log("Fuck no");
			// } else {
				// ;
			// }
		// })
		await learnimagenew(settings["file"]);
	})()
	
	
	
	
}
if(settings["fix"]){
	console.log("Reading JSON...");
	timings[0] = Date.now();
	var words = JSON.parse(fs.readFileSync(settings["file"] + ".json").toString());
	timings[1] = Date.now();
	console.log("Done! (" + (parseInt(timings[1]) - parseInt(timings[0])) + "ms)\nReading Text...");
	timings[2]=Date.now();
	var txt = fs.readFileSync(settings["file"] + ".txt").toString();
	timings[3] = Date.now();
	console.log("Done! (" + (parseInt(timings[3]) - parseInt(timings[2])) + "ms)");
	fixText(txt);
}
if(settings["learn"]){
	console.log("Reading JSON...");
	timings[0] = Date.now();
	try{
		var words = JSON.parse(fs.readFileSync(settings["file"] + ".json").toString());
	} catch(e) {
		console.log("JSON file not found. Generating new one");
		var words = {"t":{}, "w":{}};
		fs.appendFile(settings["file"] + ".json", words.toString(), function (err) {
		if (err) {
			console.log("Fuck no");
		} else {
			;
		}
	})
	}
	timings[1] = Date.now();
	console.log("Done! (" + (parseInt(timings[1]) - parseInt(timings[0])) + "ms)\nReading Text...");
	timings[2]=Date.now();
	var txt = fs.readFileSync(settings["file"] + ".txt").toString();
	timings[3] = Date.now();
	console.log("Done! (" + (parseInt(timings[3]) - parseInt(timings[2])) + "ms)");
	learn(txt);
	
}
if(settings["reproducenew"]){
	reproducenew();
}
if(settings["reproduce"]){
	console.log("Reading JSON...");
	timings[0] = Date.now();
	var words = JSON.parse(fs.readFileSync(settings["file"] + ".json").toString());
	timings[1] = Date.now();
	console.log("Done! (" + (parseInt(timings[1]) - parseInt(timings[0])) + "ms)\nReading Text...");
	reproduce(settings["length"]);
}
if(settings["convert"]){
	var txt = 
	convertToImage(txt);
}

// if(output_arg){
	// var output = file + "_out.txt";
// }
// var t = "text.txt";
var t = "seinfeld ep1-15";








// resetModel();
// 

	// 


// setInterval(function(){reproduce(400)}, 1000);

function getSettings(arglist){
	var s = {
		"learn" : false,
		"reproduce": false,
		"reset": false,
		"fix": false,
		"file": "",
		"save": false,
		"length":1000,
		"overfitting": false,
		"startflag": "",
		"endflag": "",
		"context": 4,
		"usewords": false
	};
	var bools = ["reproduce", "reset", "fix", "learn", "save", "overfitting"];
	for(i in arglist){
		
		s[arglist[i].split("=")[0]]=bools.includes(arglist[i])?arglist[i].split("=")[1]=="true":arglist[i].split("=")[1];
		
		//arglist[i].split("=")[1]=="true";
		
		// if(arglist[i].startsWith("f=")) s["file"]=arglist[i].split("=")[1];
		// if(arglist[i].startsWith("l=")) s["length"]=arglist[i].split("=")[1];
		// if(arglist[i].startsWith("learn=")) s["learn"]=(arglist[i].split("=")[1])=="true";
		// if(arglist[i].startsWith("reset=")) s["reset"]=(arglist[i].split("=")[1])=="true";
		// if(arglist[i].startsWith("r=")) s["reproduce"]=(arglist[i].split("=")[1])=="true";
		// if(arglist[i].startsWith("fix=")) s["fix"]=(arglist[i].split("=")[1])=="true";
		// if(arglist[i].startsWith("o=")) s["overfitting"]=(arglist[i].split("=")[1])=="true";
		// if(arglist[i].startsWith("save=")) s["save"]=(arglist[i].split("=")[1])=="true";
		
	}
	if(s["startflag"]=="\\n") s["startflag"] = "\n";
	if(s["endflag"]=="\\n") s["endflag"] = "\n";
	// console.log(s);
	return s;
	}


async function loadImage(img){
	var img;
	return await Jimp.read(img + '.png')
		.then(lenna => {
			console.log("Loaded");
			var cols = [];
			
			return lenna.resize(256, 256) // resize
		})
		.catch(err => {
			console.error(err);
		});
	
}

async function learnimagenew(input){
	var img = await loadImage(input);
	var colors = Array.from(Array(257), () => new Array(257))
	var tmp = {"t":{},"w":{}, "s":[]}
	// console.log(colors);
	for(var x = 1; x<img.bitmap.height-1; x++){
		for(var y = 1; y<img.bitmap.width-1; y++){
			
			//A|B|C|D
			//E|F|G|H
			//I|J|K|L
			//M|N|O|P
			
			//get seed
			//               adding zeroes...                                  ...and cutting off 
			//                                                                 to get fixed length
			colors[x][y-1] = ("00000000" + (img.getPixelColor(x, y-1)).toString(16)).slice(-8);	//B
			colors[x-1][y] = ("00000000" + (img.getPixelColor(x-1, y)).toString(16)).slice(-8);	//E
			colors[x][y] = ("00000000" + (img.getPixelColor(x, y)).toString(16)).slice(-8);		//F
			colors[x+1][y] = ("00000000" + (img.getPixelColor(x+1, y)).toString(16)).slice(-8);	//G
			colors[x][y+1] = ("00000000" + (img.getPixelColor(x, y+1)).toString(16)).slice(-8);	//J
			
			//get dependent value solution for learning
			colors[x-1][y-1] = ("00000000" + (img.getPixelColor(x-1, y-1)).toString(16)).slice(-8);	//A=B+E+F
			colors[x+1][y-1] = ("00000000" + (img.getPixelColor(x+1, y-1)).toString(16)).slice(-8);	//C=B+F+G
			colors[x+1][y+1] = ("00000000" + (img.getPixelColor(x+1, y+1)).toString(16)).slice(-8);	//K=F+G+J
			colors[x-1][y+1] = ("00000000" + (img.getPixelColor(x-1, y+1)).toString(16)).slice(-8);	//I=E+F+J
			colors[x+2][y] = ("00000000" + (img.getPixelColor(x+2, y)).toString(16)).slice(-8);	//H=C+G+K
			colors[x][y+2] = ("00000000" + (img.getPixelColor(x, y+2)).toString(16)).slice(-8);	//N=I+J+K
			
			//save seeds
			tmp["s"][(x-1)*256+(y-1)] = (colors[x][y-1]+colors[x-1][y]+colors[x][y]+colors[x+1][y]+colors[x][y+1]);
			
			//get keys for dependent color learning
			var a = colors[x][y-1] + colors[x-1][y] + colors[x][y];
			var c = colors[x][y-1] + colors[x][y] + colors[x+1][y];
			var k = colors[x][y] + colors[x+1][y] + colors[x][y+1];
			var i = colors[x-1][y] + colors[x][y] + colors[x][y+1];
			var h = colors[x+1][y-1] + colors[x+1][y] + colors[x+1][y+1];
			var n = colors[x-1][y+1] + colors[x][y+1] + colors[x+1][y+1];
			
			//Get Totals
			if(tmp["t"][a]==undefined) tmp["t"][a] = 0;
			tmp["t"][a]++;
			if(tmp["t"][c]==undefined) tmp["t"][c] = 0;
			tmp["t"][c]++;
			if(tmp["t"][k]==undefined) tmp["t"][k] = 0;
			tmp["t"][k]++;
			if(tmp["t"][i]==undefined) tmp["t"][i] = 0;
			tmp["t"][i]++;
			if(tmp["t"][h]==undefined) tmp["t"][h] = 0;
			tmp["t"][h]++;
			if(tmp["t"][n]==undefined) tmp["t"][n] = 0;
			tmp["t"][n]++;
			
			//define maps for color keys if they dont exist
			if(tmp["w"][a]==undefined) tmp["w"][a]={};
			if(tmp["w"][c]==undefined) tmp["w"][c]={};
			if(tmp["w"][k]==undefined) tmp["w"][k]={};
			if(tmp["w"][i]==undefined) tmp["w"][i]={};
			if(tmp["w"][h]==undefined) tmp["w"][h]={};
			if(tmp["w"][n]==undefined) tmp["w"][n]={};
			
			//this is agony
			tmp["w"][a][colors[x-1][y-1]]=tmp["w"][a][colors[x-1][y-1]]==undefined?1:tmp["w"][a][colors[x-1][y-1]]+=1;
			tmp["w"][c][colors[x-1][y-1]]=tmp["w"][c][colors[x-1][y-1]]==undefined?1:tmp["w"][c][colors[x-1][y-1]]+=1;
			tmp["w"][k][colors[x-1][y-1]]=tmp["w"][k][colors[x-1][y-1]]==undefined?1:tmp["w"][k][colors[x-1][y-1]]+=1;
			tmp["w"][i][colors[x-1][y-1]]=tmp["w"][i][colors[x-1][y-1]]==undefined?1:tmp["w"][i][colors[x-1][y-1]]+=1;
			tmp["w"][h][colors[x-1][y-1]]=tmp["w"][h][colors[x-1][y-1]]==undefined?1:tmp["w"][h][colors[x-1][y-1]]+=1;
			tmp["w"][n][colors[x-1][y-1]]=tmp["w"][n][colors[x-1][y-1]]==undefined?1:tmp["w"][n][colors[x-1][y-1]]+=1;
		}
	}
	
	fs.writeFile(settings["file"] + "new.json", JSON.stringify(tmp), { flag: 'w' }, function (err) {
    if (err) throw err;
    console.log("It's saved!");
});
}

function reproducenew(){
	var img = new Jimp(256, 256, (err, image) => {
		
	});
	
	var data = JSON.parse(fs.readFileSync(settings["file"] + "new.json").toString());
	var keys = Object.keys(data["s"]);
	var rand = Math.round(Math.random()*255*255);
	var seed = data["s"][keys[rand]].match(/.{1,8}/g);
	// console.log(seed);
	//  0 1 2 3
	//0   X 
	//1 X X X
	//2   X
	//3
	var colors = Array.from(Array(257), () => new Array(257))
	colors[1][0] = parseInt("0x" + seed[0]);
	colors[0][1] = parseInt("0x" + seed[0]);
	colors[1][1] = parseInt("0x" + seed[0]);
	colors[2][1] = parseInt("0x" + seed[0]);
	colors[1][2] = parseInt("0x" + seed[0]);
	img.setPixelColor(parseInt("0x" + seed[0]), 1, 0);
	img.setPixelColor(parseInt("0x" + seed[1]), 0, 1);
	img.setPixelColor(parseInt("0x" + seed[2]), 1, 1);
	img.setPixelColor(parseInt("0x" + seed[3]), 2, 1);
	img.setPixelColor(parseInt("0x" + seed[4]), 1, 2);
	
	//getting pixel values
	
	
	for(var x=1;x<10;x++){
		for(var y=1;y<10;y++){
			console.log(x, y);
			if(Jimp.intToRGBA(colors[x-1][y-1]||0)["a"]==0){
				var px00 = getRandom(getRanges(data, ("00000000" + img.getPixelColor(x, y-1).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x-1, y).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x, y).toString(16)).slice(-8), 3));
				colors[x-1][y-1]=parseInt("0x" + px00);
				// img.setPixelColor(parseInt("0x" + px00), x-1, y-1);
				
			}
			if(Jimp.intToRGBA(colors[x+1][y-1]||0)["a"]==0){
				var px20 = getRandom(getRanges(data, ("00000000" + img.getPixelColor(x, y-1).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x, y).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x+1, y).toString(16)).slice(-8), 3));
				colors[x+1][y-1]=parseInt("0x" + px20);
				// img.setPixelColor(parseInt("0x" + px20), x+1, y-1);
			}
			if(Jimp.intToRGBA(colors[x-1][y+1]||0)["a"]==0){
				var px02 = getRandom(getRanges(data, ("00000000" + img.getPixelColor(x-1, y).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x, y).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x, y+1).toString(16)).slice(-8), 3));
				colors[x-1][y+1]=parseInt("0x" + px02);
				// img.setPixelColor(parseInt("0x" + px02), x-1, y+1);
			}
			if(Jimp.intToRGBA(colors[x+1][y+1]||0)["a"]==0){
				var px22 = getRandom(getRanges(data, ("00000000" + img.getPixelColor(x, y).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x, y+1).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x+1, y).toString(16)).slice(-8), 3));
				colors[x+1][y+1]=parseInt("0x" + px22);
				// img.setPixelColor(parseInt("0x" + px22), x+1, y+1);
			}
			if(Jimp.intToRGBA(colors[x][y+2]||0)["a"]==0){
				var px13 = getRandom(getRanges(data, ("00000000" + img.getPixelColor(x-1, y+1).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x, y+1).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x+1, y+1).toString(16)).slice(-8), 3));
				colors[x][y+2]=parseInt("0x" + px13);
				// img.setPixelColor(parseInt("0x" + px13), x, y+2);
			}
			if(Jimp.intToRGBA(colors[x+2][y]||0)["a"]==0){
				var px31 = getRandom(getRanges(data, ("00000000" + img.getPixelColor(x+1, y-1).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x+1, y).toString(16)).slice(-8)
				+ ("00000000" + img.getPixelColor(x+1, y+1).toString(16)).slice(-8), 3));
				colors[x+2][y]=parseInt("0x" + px31);
				// img.setPixelColor(parseInt("0x" + px31), x+2, y);
			}
		}
	}
	
	for(var x=0;x<10;x++){
		for(var y=0;y<10;y++){
			
			img.setPixelColor(colors[x][y]==undefined?0:colors[x][y], x, y);
		}
	}
	// console.log("p", px00, px02, px20, px22, px13, px31);
	// var px00 = getRandom(getRanges(data, seed[0] + seed[1] + seed[2], 3));
	// img.setPixelColor(parseInt("0x" + px00), 0, 0);
	img.write("test2.png");
	
	
}


async function learnimage(input){
	var img = await loadImage(input);
	console.log(img.bitmap.width);
	
	
	var cols = [];
	for(var x = 0; x<img.bitmap.height; x++){
		for(var y = 0; y<img.bitmap.width; y++){
			var col = img.getPixelColor(x, y).toString(16);
			while(col.length<8) col = "0" + col;
			
			cols.push(col);
		}
	}
	var txt="";
	for(i in cols){
		txt+=cols[i];
	}
	// console.log(txt);
	return txt;
	// reproduce:
	// img.write("test.png");
}

function convertToImage(txt){
	var img = new Jimp(256, 256, (err, image) => {
		
	});
	txt = fs.readFileSync(settings["file"] + ".txt").toString().match(/.{1,8}/g);
	// console.log(txt);
	console.log(txt);
	for(var x = 0; x<img.bitmap.height; x++){
		for(var y = 0; y<img.bitmap.width; y++){
			img.setPixelColor(parseInt("0x" + txt[x*256+y]), x, y);
			// console.log(x, y);
		}
	}
	// img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
		// var channels = txt[x*256+y].match(/.{1,2}/g);
		// console.log(x, y, channels);
		// img.setPixelColor(Jimp.rgbaToInt(123, 34, 0, 255), x, y)
	// });
	img.write("test.png");
}

function rgbhexToInt(rgb){
	var pow=0;
	var hextobin = {"0":"0000",
	"1":"0001",
	"2":"0010",
	"3":"0011",
	"4":"0100",
	"5":"0101",
	"6":"0110",
	"7":"0111",
	"8":"1000",
	"9":"1001",
	"a":"1010",
	"b":"1011",
	"c":"1100",
	"d":"1101",
	"e":"1110",
	"f":"1111"}
	var colint = ""
	for(x in rgb){
		colint+=(hextobin[rgb[x]]);
	}
	return parseInt(colint, 2);
	
}

function learn(input){
	console.log("Analysing");
	timings[4] = Date.now();
	
	context=settings["context"];
	var arr = settings["usewords"]?input.replace("\r\n", " ").split(" "):input;
	if(settings["imagelearn"]) arr=arr.match(/.{1,8}/g);
	// console.log(arr);
	for(x in arr){
		
		
		var wa = arr[parseInt(x)-3];
		var wb = arr[parseInt(x)-2];
		var wc = arr[parseInt(x)-1];
		var w1 = arr[parseInt(x)];
		var w2 = arr[parseInt(x)+1];
		// console.log((wa==undefined?"":wa));
		
		var str = "";
		for(var y=context-1;y>=0; y--){
			if(settings["usewords"]){
				str += (arr[parseInt(x)-y]==undefined?"":arr[parseInt(x)-y] + " ")
			} else {
				str += (arr[parseInt(x)-y]==undefined?"":arr[parseInt(x)-y])
			}
		}
		
		
		 // console.log(str);
		if(words.w[str]==undefined){
			// console.log("undefined");
			if(x<arr.length-1){
				
				
				words.t[str] = 1;
				words.w[str]={};
				words.w[str][w2]=1;
				// console.log(x, w1, parseInt(x)+1, w2);
			}
		} else {
			if(x<arr.length-1){
				
				words.t[str]++;
				if(words.w[str][w2]==undefined) words.w[str][w2]=0;
				words.w[str][w2]++;
			}
		}
		
		
	}
	 // console.log(words);
	 timings[5] = Date.now();
	 console.log("Data analyzed (" + (parseInt(timings[5]) - parseInt(timings[4])) + "ms)\nSaving data...");
	 timings[6] = Date.now();
	 fs.writeFile(settings["file"] + ".json", JSON.stringify(words), function(){console.log('done')});
	 timings[7] = Date.now();
	 console.log("Saved! (" + (parseInt(timings[7]) - parseInt(timings[6])) + "ms)");
}

function reproduce(length){
	console.log("Generating...");
	timings[8] = Date.now();
	context = settings["context"]*(settings["imagelearn"]?8:1);
	var start = "";
	var end = settings["endflag"];
	if(settings["startflag"]==""){
		start = randomProperty(words.w);
	} else {
		start = settings["startflag"];
	}
	var newWord = start;
	var output = newWord;
	// console.log("\""+newWord+"\"");
	var flag = end;
	
	if(end==""){
		var percent=0;
		var val = 0;
		for(var i = start.length; i<length; i++){
		// 
			// console.log(output.substr(-4), getRanges(output.substr(-4)));
			
			var add = getRandom(getRanges(output.substr(-context)));
			output = output + add;
			 // if(add=="\n") output += randomProperty(words.w);
			
			
			// output = output + " " + getRandom(getRanges( 
			// (output.split(" ")[output.split(" ").length-2]==undefined?"":output.split(" ")[output.split(" ").length-2]+" ") +
			// (output.split(" ")[output.split(" ").length-1]==undefined?"":output.split(" ")[output.split(" ").length-1]+" ") ));
			// console.log(output);
		};
	} else {
		
		while(output.toLowerCase().slice(output.length - flag.length)!=flag.toLowerCase()){
			
			var add = getRandom(getRanges(output.substr(-context), context));
			output = output + add;

			if(Date.now() - timings[8]>=10000){
				console.log("Timeout!");
				break;
			}
		} 
	}
	
	if(settings["overfitting"]) output = overfitting(output);
	// output = shitpost(output);
	timings[9]=Date.now();
	console.log("Generated (" + (parseInt(timings[9]) - parseInt(timings[8])) + ")")
	if(settings["save"]) save(output);
	if(settings["saveraw"]) save_raw(output);
	if(settings["overfitting"]) {
		print(output);
	} else {
		console.log(output);
	}
	// console.log(output.length);
	
}

function save(list){
	// list=list.split("\r\n");
	
	
	var o = fs.readFileSync(settings["file"] + "_out.txt").toString()
	var out = "";
	for(x in list){
		if(!o.includes(list[x])){
				out = out + list[x] + "\n";
		}
	}
	fs.appendFile(settings["file"] + "_out.txt", out, function (err) {
		if (err) {
			console.log("Fuck no");
		} else {
			;
		}
	})

}

function save_raw(txt){
	fs.writeFile(settings["file"] + "_out.txt", txt, { flag: 'w' }, function (err) {
    if (err) throw err;
    console.log("It's saved!");
});
}

function fixText(ttxt){
	var newTxt = ttxt;
	while(newTxt.match(/(\r\n\r\n|\n\n|\r\r)/gm)){
		newTxt = newTxt.replace(/(\r\n\r\n|\n\n|\r\r)/gm, "\r\n");
	}
	
	newTxt = newTxt.replace(/(\r\n|\n|\r)/gm,"\r\n ");
	while(newTxt.includes("  ")){
		newTxt = newTxt.replace("  ", " ");
	}
	fs.writeFile(t, newTxt, function(){console.log('done')});
	txt = newTxt;
}

function randomProperty(object) {
  var keys = Object.keys(object);
  return keys[Math.floor(keys.length * Math.random())];
}

function resetModel(){
	words = {"t":{},"w":{}};
	fs.writeFile(settings["file"] + ".json", JSON.stringify(words), function(){console.log('done')});
}

function getRandom(ranges){
	var rand = Math.random();
	for(x in ranges){
		if(rand<ranges[x][1]) return ranges[x][0];
	}
	
}

function shitpost(input){
	var x = "";
	for(i in input){
		x += input[i];
		x += " ";
	}
	return x;
}

function overfitting(word){
	try{
		var real = fs.readFileSync(settings["file"] + ".txt").toString();
	} catch(e){
		console.log("Check for overfitting requires the raw dataset " + settings["file"] + ".txt");
	}
	var list = word.split("\r\n");
	var out = [];
	for(x in list){
		if(!real.includes(list[x])){
			out.push(list[x]);
		}
	}
	return out;
}

function getRanges(words, word, context){
	// console.log(words.w);
	// console.log(word);
	var total = words.t[word];
	if(total==undefined) total = 1;
	// console.log("total", total);
	var followup = words.w[word];
	// console.log("followup", followup);
	if(followup==undefined||followup instanceof String){
		followup =  words["w"][randomProperty(words.w)];
		// console.log("OMANOMAN");
	}
	// console.log("followup", followup);
	var ranges = [];
	
	// console.log("followup", followup);
	var keys = Object.keys(followup);
	// console.log("get keys for", word, words.w[word]);
	
	// console.log("keys", keys);
	var totalrange = 0;
	for(x in keys){
		ranges[x]=[keys[x], totalrange+(parseFloat(followup[keys[x]])/parseFloat(total))];
		totalrange+=(parseFloat(followup[keys[x]])/parseFloat(total));
	}
	// console.log("ranges", ranges);
	return ranges;
}

function print(n){
	for(x in n){
		console.log(n[x]);
	}
}