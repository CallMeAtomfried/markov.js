markov.js is the node module, mknew.js is the standalone console version. 

mknew also has a few non functional experimental stuff in it like image markov. dont touch

Update: mknew.js ironically is obsolete. The focus of the experimental features was image markov, which however will not be necessary once word based markov is properly implemented. Its not working anyway so theres that. 

IMPORTANT: Neither are finished and tested. The node module should be in a usable state, but as things stand i cannot test it myself. 

# Node module

The markov.js can be put anywhere. In this example its just in the main folder. 

```js
const mk = require("./markov.js");
```

It consists of a class called `Markov`, which contains all the required functionality. 

```js
var markov = new mk();
```

## Creating a New Model

After creating the object, the model needs to be initialised using the create method. This will give you an empty set into which all the information will be dumped in the future. 

```js
markov.create();
```

## Saving a Model

To save the model, use the save() method. The filepath is strictly necessary ajd requires a full path to the file you want to save it as. 
It can be saved as any arbitrary format, however it is advised to save it as a JSON or TXT file. 

```js
markov.save("./models/markov.json");
```

## Loading a model

Loading a model works just the same. Note that the load method will overwrite the current model in the markov object. 

```js
markov.load("./models/markov.json");
```

## Learning

To teach your model, pass any string you want to teach it through the learn method. 
The method itself needs a String with the input data and an Int as the context size. 
The same Markov object can hold multiple context sizes. It is advised to train it with all context sizes up to your desired size for better results, however this increases RAM and storage usage. 
The bigger the context size is, the more RAM and storage it uses. The smaller the dataset is, the smaller the context should be, as a large context with a small dataset leads to less interesting results. However, if the context is too small, the results can be incoherent 


```js
markov.learn("Your Text", 4);
```

You can continuously feed the object more and more data and it will simply "append" the new data instead of retraining the model. However this can not be undone as of now due to the nature of the saved data. A solution is being worked on. 

## Reproducing

To generate new text, call the reproduce method. It takes two integers, the first being the maximum length of the text that is to be generated, the second one is the context size it should use to generate text. 
It is capable of automatically detecting if the desired context size is too big for the dataset and adjust automatically. It will however not detect if the dataset supports a bigger context size (yet). 
Reproduction of text will start at a random point and only end if the specified character limit is reached or if nothing is being found with which the text can be continued. This can especially happen with smaller datasets. 

```js
markov.reproduce(1000, 4);
```

Start and end flags are planned which will allow you to specify what series of characters to start with as well as define a custom bail condition. This can be useful if you have text of a specific format, like a transcript of a TV episode or a HTML file. ETA unknown

## Upcoming features

Ability to train the model based on words instead of characters. Everything will stay the same, but it will take an array of words instead of a string, yet still return a string.
Word based markov will use significantly more RAM and storage but the results are even more coherent. It requires an even larger dataset for interesting results.

Ability to "undo" certain learned strings and direct manipulation of the dataset. Simply pass the string you want to unlearn along with the context size just you would do with learning. Example:

```js
//It takes the string, the context size and the maximum amounts of occurrences that should be removed
markov.forget("The big brown fox jumps over the lazy dog", 4, 2);
```

How to use it: If there is a phrase that has been trained particularly often and you want to get rid of said phrase from the dataset, use `Infinity` to get rid of it entirely.
Note however that due to the nature of the trained data, if the phrase to be removed is, say, "This is a string", everything that is learned from this will be removed with `Infinity`,
meaning if the training set included, say, "This is an elephant", the "This is a" part will be removed entirely.

If you pass it a regular integer n, it will remove the phrase from the data set up to n times. This way you get some control over what is being available. This however can lead to problems like the generator aborting prematurely due to missing data.
It will also only remove the occurences with the context size given, meaning if you trained it on multiple context sizes, you will need to forget all of them to remove it entirely.
This is useful for moderation purposes, if there are some particular phrases you want it to not generate but they are already in the dataset, this would be the way to do it. 

Other more direct moderation tools will be available soon, like full replacement, which is useful for word based models where certain words slip in that you want to avoid, these can be removed or replaced altogether.
Direct access to data is also in the works for potential debugging purposes, as the models can get quite large. A search function, if you will. 
