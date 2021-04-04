markov.js is the node module. mkney.js is obsolete experimental stuff and does not work properly. 
Markov.py is WIP, will be an interconpatible port of markov.js, as in data trained with one will be possible to read with the other. 

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

An empty model is automatically created when creating the markov object. It can be reset using 
```js
markov.reset();
```

## Saving a Model

To save the model, use the save() method. The filepath is strictly necessary and requires a full path to the file you want to save it as. 
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

Optional start and end flags can now be provided. 

```js
markov.reproduce(1000, 4, "Start")
```
or
```js
markov.reproduce(1000, 4, "Start", "End");
```

To define an end flag but not a start flag, set the start flag to `null`

## Corpus moderation

Due to the way the data is stored, direct manipulation is not easy. It is not advised to manually edit the trained data as it can and likely will lead to problems, potentially destroying the entire set. It is therefore advised to handle moderation BEFORE the data is fed. For instances where undesirable data does make it into the dataset, the `forget()` method is available.

```js
markov.forget(string, int, <int>);
```
It works by reversing the learning process on the text you give it. The first two arguments are mandatory and take the string you want the model to "forget" and the context size respectively. The optional second integer is the number of instances you want it to forget at most. It defaults to 1 meaning it removes one instance of the provided text. Setting it to an arbitrary number will be the equivalent of removing that number of instances at once. Setting it to a sufficiently high number, or simply `Infinity` will delete the given word-letter combinations entirely.

## Upcoming features

Ability to train the model based on words instead of characters. Everything will stay the same, but it will take an array of words instead of a string, yet still return a string.
Word based markov will use significantly more RAM and storage but the results are even more coherent. It requires an even larger dataset for interesting results.


Other more direct moderation tools will be available soon, like full replacement, which is useful for word based models where certain words slip in that you want to avoid, these can be removed or replaced altogether.
Direct access to data is also in the works for potential debugging purposes, as the models can get quite large. A search function, if you will. 
