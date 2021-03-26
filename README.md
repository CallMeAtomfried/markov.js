markov.js is the node module, mknew.js is the standalone console version. 

mknew also has a few non functional experimental stuff in it like image markov. dont touch

# Node module

Follow the usual procedure for loading modules in node. Pretty straightforward.

Example:


const markovModule = require("./markov.js");
var markovModel = new Markov({"w":{}});

//trains the model with the given string for a context size of 6.
markovModel.learn("Arbitrary string from arbitrary source", 6);

//This saves the model to disk.
markovModel.save("./arbitraryFilePathAndName.json");

//This would generate a text with a maximum length of 100 and a context size of 6
var generatedText = markovModel.reproduce(100, 6);
console.log(generatedText);


Context size can be set arbitrarily.
However, ideally you want a big training set for larger contexts for more interesting results, else it will tend to just repeat whats has already been said too much.
Too small of a context and it generates gibberish.

If you pass it a string, it will learn based on individual characters. pass it an array and it will learn based on individual entries in said array.
