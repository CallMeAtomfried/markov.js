module.exports = class Markov {
  /*Read:
    Not finished yet. Needs testing. Also, model loading will be improved. 
    Right now a usable model needs to be passed. Format: {"w":{}} for empty models
    Previously trained models can be passed as they are. Empty JSONs will likely crash as of now
    
    NOTE: only letter based models can be used as of now. Word based markov can theoretically be trained but not reproduced properly
   */

  //this.fs = require("fs");
  //this.model = {};

  const fs = require("fs");
  var model = {};

  constructor(mk){
    this.model = mk;
  } 
	
	
  learn(arr, l_context){
		
    //x in arr: Either loop through for every character in string or every word in array of words
    for(var x in arr){
      //get next character/word
      var w2 = arr[parseInt(x)+1];
			
      var str = "";
      //get the previous characters/words depending on specified context size
      for(var y=l_context-1;y>=0; y--){
        str = str + (arr[parseInt(x)-y]==undefined?"":arr[parseInt(x)-y]);
      }
			
			 
      if(this.model.w[str]==undefined){
        //if context doesnt exist add datapoint
        if(x<arr.length-1){
          this.model.w[str]={};
          this.model.w[str]["t"] = 1;
          this.model.w[str]["f"]={};
          this.model.w[str]["f"][w2]=1;
          // console.log(x, parseInt(x)+1, w2);
        }
      } else {
        //add new data to word
        if(x<arr.length-1){
          this.model.w[str].t++;
          if(this.model.w[str].f[w2]==undefined) this.model.w[str].f[w2]=0;
          this.model.w[str].f[w2]++;
        }
      } 
    }
  }
	
  save(filepath) {
    this.fs.writeFile(filepath, JSON.stringify(this.model), function(){});
  }

  load(filepath) {
    
  } 
	
  reproduce(length, l_context){
	
    //get random word to start generating
    var start = this.randomProperty(this.model.w);
    var output = start;
		
    //unused, can be used to define a bail condition. 
    var flag = "\r\n";

    for(var i = start.length; i<length; i++){

      //Get next character to add onto the output depending on the last l_context characters/words
      var add = this.getRandom(this.getRanges(output.substr(-l_context), this.model));

      if(add==undefined) {
        // if no data exist for word, stop generating
        return output;
      } else {
        // else add new character to output
        output = output + add;
      }
    }
  return output;
  }
	
  getRanges(word, words){

    //failsave: if no data exist for the last i characters, reduce the context size by 1 until it works.
    //changes behaviour drastically and isnt pretty in these cases, but it gives longer results
    for(var i = 0; i < 6; i++){
      if(words.w[word]==undefined){
        word = word.substring(1);
      }
    }
		
    if(word.length==0){
      //return null if nothing is found
      return null;
    } else {
      //Get the total amount of characters following the word. (Sum of all probabilities for each valid character)
      var total = words.w[word]["t"];

      //failsave
      if(total==undefined) total = 1;
      
      //get the map of all characters following a word and the amount of occurences
      var followup = words.w[word].f;
      var nw = word;

      //another failsave that tries to get a random word to continue checking. again, unfavorable but it saves the whole thing with smaller models
      while(followup==undefined){
        nw = nw.substr(1);
        followup = words.w[nw].f;
        if(nw="") followup = this.randomProperty(words.w);
      }

      //get the characters that follow the word
      var ranges = [];
      var keys = Object.keys(words.w[word].f);
      var totalrange = 0;

      //calculate the probabilities
      for(var x in keys){
        ranges[x]=[keys[x], totalrange+(parseFloat(followup[keys[x]])/parseFloat(total))];
        totalrange+=(parseFloat(followup[keys[x]])/parseFloat(total));
      }
      return ranges;
    }
  }
	
  randomInt(max) {
    return Math.floor(Math.random()*max)
  } 
	
  randomProperty(object) {
    //returns a random key
    var keys = Object.keys(object);
    return keys[this.randomInt(keys.length)];
  }

  getRandom(ranges){

    if(ranges==null){
      //stop if getRanges returns null
      return null;
    }

    //get a weighted random entry from the ranges generated in getRanges
    var rand = Math.random();
    for(var x in ranges){
      if(rand<ranges[x][1]) return ranges[x][0];
    }
  }
}



