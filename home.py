#import nltk
#from nltk.stem.lancaster import LancasterStemmer
#stemmer = LancasterStemmer()

#import os
#os.environ['TF_CPP_MIN_LOG_LEVEL']='2'
#import numpy
#import tflearn
#import tensorflow
import random
import json
import pickle

with open("intents.json") as file:
    data = json.load(file)
    
with open("questions.json") as file:
    questions = json.load(file)
    

#try:
#    with open("data.pickle", "rb") as f:
#        words, labels, training, output = pickle.load(f)
#except:
#words = []
#labels = []
#docs_x = []
#docs_y = []
#
#for intent in data["intents"]:
#    for pattern in intent["patterns"]:
#        wrds = nltk.word_tokenize(pattern)
#        words.extend(wrds)
#        docs_x.append(wrds)
#        docs_y.append(intent["tag"])
#
#    if intent["tag"] not in labels:
#        labels.append(intent["tag"])
#
#words = [stemmer.stem(w.lower()) for w in words if w != "?"]
#words = sorted(list(set(words)))
#
#labels = sorted(labels)
#
#training = []
#output = []
#
#out_empty = [0 for _ in range(len(labels))]
#
#for x, doc in enumerate(docs_x):
#    bag = []
#
#    wrds = [stemmer.stem(w.lower()) for w in doc]
#
#    for w in words:
#        if w in wrds:
#            bag.append(1)
#        else:
#            bag.append(0)
#
#    output_row = out_empty[:]
#    output_row[labels.index(docs_y[x])] = 1
#
#    training.append(bag)
#    output.append(output_row)
#
#
#training = numpy.array(training)
#output = numpy.array(output)
#
#with open("data.pickle", "wb") as f:
#    pickle.dump((words, labels, training, output), f)
#
#tensorflow.reset_default_graph()
#
#net = tflearn.input_data(shape=[None, len(training[0])])
#net = tflearn.fully_connected(net, 8)
#net = tflearn.fully_connected(net, 8)
#net = tflearn.fully_connected(net, len(output[0]), activation="softmax")
#net = tflearn.regression(net)
#
#model = tflearn.DNN(net)

#try:
#    model.load("./model.tflearn")
#except:
#model.fit(training, output, n_epoch=10, batch_size=8, show_metric=True)
#    model.save("./model.tflearn")

def openPickle(filename):
    infile = open(filename,'rb')
    new_dict = pickle.load(infile)
    infile.close()
    return new_dict

def bag_of_words(s, words):
    bag = [0 for _ in range(len(words))]

    s_words = nltk.word_tokenize(s)
    s_words = [stemmer.stem(word.lower()) for word in s_words]

    for se in s_words:
        for i, w in enumerate(words):
            if w == se:
                bag[i] = 1
            
    return numpy.array(bag)


def chat():
    allResponses = openPickle("all_responses")
    response_dict = {}
    print("Hello, my name is Tracks. I will help you register your fleet by asking you some questions (type quit to stop)!")
    print("What is your full name?")
    fleetOwnerName = input()
    if fleetOwnerName.lower() == 'quit':
        break
    
    for question in questions["questions"]:
        print(random.choice(question["questions"]))
        answer = input(str(fleetOwnerName.split(' ')[0])+": ")
        response_dict[question["tag"]] = answer
        
    allResponses[fleetOwnerName] = response_dict
    filename = 'all_responses'
    outfile = open(filename,'wb')
    pickle.dump(allResponses,outfile)
    outfile.close()
        
#    while True:
#        inp = input(str(fleetOwnerName.split(' ')[0])+": ")
#        if inp.lower() == "quit":
#            break
#
#        
#        results = model.predict([bag_of_words(inp, words)])
#        results_index = numpy.argmax(results)
#        tag = labels[results_index]
#
#        for tg in data["intents"]:
#            if tg['tag'] == tag:
#                responses = tg['responses']
#
#        print(random.choice(responses))

chat()
pickleFile = openPickle("all_responses")
print(str(pickleFile))