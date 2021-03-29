markov.js is the node module, mknew.js is the standalone console version. 

mknew also has a few non functional experimental stuff in it like image markov. dont touch

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

