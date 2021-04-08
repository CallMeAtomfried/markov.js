markov.js is the node module. mkney.js is obsolete experimental stuff and does not work properly. 
Markov.py is WIP, will be an intercompatible port of markov.js, as in data trained with one will be possible to read with the other. 
main.js is a console implementation of image markov using markov.js. Its run from the commandline. Details [HERE](https://github.com/CallMeAtomfried/notmarkov/blob/main/README.md#image-markov)

# Node module

The markov.js can be put anywhere. In the examples, it will be located in the main folder. 

```js
const Markov = require("./markov.js");
```

It consists of a class called `Markov`, which contains all the required functionality. 

```js
var markov = new Markov();
```

## How does it work?

The "learner" loops through every element, keeping track of the current element as well as the previous n-1 elements, where n is the total state size (henceforth called "context"), as well as the next element. It then combines the total context into one datapoint and keeps track of all the different elements that follow this combination of characters throughout the input. 

For example, let the input be "Hello world!" and the context size be 1. It will loop through the characters because it is a string. 
At first it finds a "H".

`There is nothing preceeding this "H", but since the context size is 1 anyway, it makes no difference. If the context size was bigger, it will adjust the context size for data at the beginning automatically. `

For the "H" that it found, the next character would be "e". It now generates a datapoint in the model like this:
`{"H": {t: 1, f:{"e": 1}}}`
"H" is the character it found, t would be the total times it has found a "H" while the object f:{} contains a list of all characters that it found that follow any "H" character in the input along with the respective occurences of that character.

There are two occurences of "o" in "Hello world!", meaning the datapoint for "o" would look like this:
```json
{
  "o": {
    t: 2,
    f: {
      " ": 1,
      "r": 1
    }
  }
}
```

The generator will first analyse the start flag provided, or if none is found, will choose a starting point randomly.
It will then look at the last n elements in the already generated output and look up the according datapoint, receiving a list of weights for all the possibilities for how to continue. For this, the generator will first define cumulative boundaries for each element based on its weight, clamped between 0 and 1. Example:

```json
{
  "a": {
    t: 20,
    f: {
      "b": 3,
      "c": 6,
      "d": 8,
      "e": 2,
      "f": 1
    }
  }
}
```
The weights defined in the model itself are the raw occurences. The cumulative weights in this case would look like this:

```json
{
  "a": {
    t: 20,
    f: {
      "b": 3,
      "c": "b" + 6,
      "d": "c" + 8,
      "e": "d" + 2,
      "f": "e" + 1
    }
  }
}
```
... resulting in ...

```json
{
  "a": {
    t: 20,
    f: {
      "b": 3,
      "c": 9,
      "d": 17,
      "e": 19,
      "f": 20
    }
  }
}
```
These weights are divided by the total and used as boundaries for the random number generation. Meaning a random number between 0.95 and 1 would result in an "f" being appended to the output. This cycle continues until the desired output length is reached or the output ends in the provided endflag. The result is being returned as a string.

The process for word based markov is similar, but instead of a string, the learner takes an array of words as input, while the generator will likewise return an array of words as output. If this is not desired, the method `Markov.stringify(array)` will convert this array of words into readable text.


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

To learn based on characters, pass a string as the first argument. The module will return a string. To learn based on words or other types, simply pass an array. The result will also be an array. Note that word based markov models take up more RAM and storage, should you save the model. Do NOT mix character and word based learning in the same model. It does not yet differenciate between these two and thus it can lead to problems.

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

Depending on what you have trained, you will receive either a string or an array.

## Corpus moderation

Due to the way the data is stored, direct manipulation is not easy. It is not advised to manually edit the trained data as it can and likely will lead to problems, potentially destroying the entire set. It is therefore advised to handle moderation BEFORE the data is fed. For instances where undesirable data does make it into the dataset, the `forget()` method is available.

```js
markov.forget(string, int, <int>);
```
It works by reversing the learning process on the text you give it. The first two arguments are mandatory and take the string you want the model to "forget" and the context size respectively. The optional second integer is the number of instances you want it to forget at most. It defaults to 1 meaning it removes one instance of the provided text. Setting it to an arbitrary number will be the equivalent of removing that number of instances at once. Setting it to a sufficiently high number, or simply `Infinity` will delete the given word-letter combinations entirely.

## Merging models

Merging models can only be done if both models are of the same type. To prevent unwanted behaviour, merge() will throw an error when attempting to do so. 
To merge models, simply pass another model to the function. If they are the same type, context size, just like with learning, is irrelevant, and multiple context sizes are supported for both letter and word based models.

```js
const Markov = require("./markov.js");
var markov = new Markov();
var anotherMarkov = new Markov();

markov.learn("some arbitrary string", 4);
anotherMarkov.learn("another arbitrary string", 4);

markov.merge(anotherMarkov.model);
```


## Upcoming features

Ability to train the model based on words instead of characters. Everything will stay the same, but it will take an array of words instead of a string, yet still return a string.
Word based markov will use significantly more RAM and storage but the results are even more coherent. It requires an even larger dataset for interesting results.


Other more direct moderation tools will be available soon, like full replacement, which is useful for word based models where certain words slip in that you want to avoid, these can be removed or replaced altogether.
Direct access to data is also in the works for potential debugging purposes, as the models can get quite large. A search function, if you will. 

# Image Markov

main.js requires markov.js to run, but is a quick console implementation. You will also need the folders. Put your input images in the inputImages folder, your output gets put in outputImages. 

It uses Jimp to read and write the images. More information on [JIMP!](https://www.npmjs.com/package/jimp)

```
npm install --save jimp
```


To use imagemarkov.js, just run
```
node imagemarkov.js "filename.png" -l -g
```
Where -l will learn the image and -g will generate it. Trying to generate an image without learning first doesnt work for obvious reasons. 
