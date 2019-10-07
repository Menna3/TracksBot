from flask import Flask, request, render_template
import random
import json
import pickle
import numpy

app = Flask(__name__)

#----------------------------------------------------FUNCTIONS----------------------------------------------------#
with open("jsonFiles/questions.json") as file:
    questions = json.load(file)
    
with open("jsonFiles/truckQuestions.json") as file:
    truckQuestions = json.load(file)
    
def openPickle(filename):
    infile = open(filename,'rb')
    new_dict = pickle.load(infile)
    infile.close()
    return new_dict

def writeInPickle(filename, dictonary):
    outfile = open(filename,'wb')
    pickle.dump(dictonary,outfile)
    outfile.close()

#------------------------------------------------------ROUTES------------------------------------------------------#
@app.route('/')
def home():
    return render_template("index.html")


@app.route('/start')
def start():
    return "Hello, my name is Tracks. I will help you register your fleet by asking you some questions (type quit to stop)!"


@app.route('/ask/<questionNumber>')
def ask(questionNumber):
    if questionNumber == "5":
            return str(["Okay* now I will ask you some questions about the specifications of your trucks.",
                   "If you have any group of trucks with the exact same specifications* group them and tell me the number of groups.",
                   "Let me explain more.",
                   "If you have 9 trucks* 4 are exactly the same* and 5 are the same* then you have 2 groups. If all trucks are exactly the same then you have 1 group.",
                   "Now tell me how many groups of trucks do you have?"])
    elif int(questionNumber) < 5:
        return random.choice(list(questions[questionNumber]["questions"]))


@app.route("/truck/questions/<groupNumber>")
def allTrucksQuestionInGroup(groupNumber):
    allQuestions = []
    for i in range(int(groupNumber)):
        for j in range(4):
            question = random.choice(list(truckQuestions[str(j)]["questions"]));
            if question == "How many trucks in group number ":
                question = question + str(i+1); 
            allQuestions.append(question)
    return str(allQuestions)


@app.route('/answer/<questionNumber>/<fleetId>')
def answer(questionNumber, fleetId):
    response_dict = {}
    try: #if file is not empty (first owner to insert)
        allResponses = openPickle("pickleFiles/all_responses.pickle")
        currentIds = list(allResponses.keys())
        
        if fleetId in currentIds:
            newFleetId = fleetId
            answer = request.args.get('msg')
            response_dict[questions[questionNumber]["tag"]] = answer
            allResponses[newFleetId].update(response_dict)
        else:
            newFleetId = str(int(list(allResponses.keys())[-1]) + 1)
            answer = request.args.get('msg')
            response_dict[questions[questionNumber]["tag"]] = answer
            allResponses[newFleetId] = response_dict
    
    except: #pickle file is empty
        newFleetId = "1"
        allResponses = {}
        answer = request.args.get('msg')
        response_dict[questions[questionNumber]["tag"]] = answer
        allResponses[newFleetId] = response_dict
            
    
    filename = 'pickleFiles/all_responses.pickle'
    writeInPickle(filename, allResponses)
    
    return newFleetId


@app.route('/answer/trucks/<fleetId>/<groupsNumber>', methods=['POST'])
def answerTrucks(fleetId, groupsNumber):
    replies = request.get_json()
    
    numpyArray = numpy.array(replies)
    newLists = numpy.split(numpyArray, int(groupsNumber))
    
    allTrucksResponses = {}
    truckNumber = 0
    for l in newLists:
        i = 0
        frequencyOfTrucksInGroup = 0
        truckResponse = {}
        for answer in l:
            if i == 0:
                frequencyOfTrucksInGroup = int(answer)
                i+=1
            else:
                truckResponse[truckQuestions[str(i)]["tag"]] = answer
                i+=1
        
        for f in range(frequencyOfTrucksInGroup):
            allTrucksResponses[str(truckNumber+1)] = truckResponse
            truckNumber+=1
            
        
    response_dict = {}
    allResponses = openPickle("pickleFiles/all_responses.pickle")
    currentIds = list(allResponses.keys())

    if fleetId in currentIds:
        response_dict["trucks"] = allTrucksResponses
        allResponses[fleetId].update(response_dict)
    
    filename = 'pickleFiles/all_responses.pickle'
    writeInPickle(filename, allResponses)
    
    def getFleet(fleetId):
        allResponses = openPickle("pickleFiles/all_responses.pickle")

        trucksList = ["Thank you for registering your fleet in Tracks.", "Your Fleet ID is: "+fleetId,
                    "And here is the full list of your trucks"]
        keyss = []
        trucks = allResponses[fleetId]["trucks"]
        truckSpecs = ''
        for key in trucks:
            truckSpecs = ''
            truckSpecs += "Truck " + key + ": " 
            for key2 in trucks[key]:
                truckSpecs += key2.replace("_", " ").title() + ": " + trucks[key][key2] + " "

            trucksList.append(truckSpecs)
        return str(trucksList)

    fleetData = getFleet(fleetId)
        
    return json.dumps(fleetData)
#    return str(allResponses)

@app.route('/fleet/trucks/<fleetId>')
def getFleetdd(fleetId):
    allResponses = openPickle("pickleFiles/all_responses.pickle")
    
    trucksList = ["Thank you for registering your fleet in Tracks.", "Your Fleet ID is: "+fleetId,
                "And here is the full list of your trucks"]
    keyss = []
    trucks = allResponses[fleetId]["trucks"]
    truckSpecs = ''
    for key in trucks:
        truckSpecs = ''
        truckSpecs += "Truck " + key + ": " 
        for key2 in trucks[key]:
            truckSpecs += key2.replace("_", " ").title() + ": " + trucks[key][key2] + " "

        trucksList.append(truckSpecs)
    return str(trucksList)
    
@app.route('/conversation', methods=['POST'])
def saveConversation():
    conversation = request.get_json()
    conversation_dict = {}
    allConversations_dict = {}
    
    i, j = 0, 0 
    for i in range(0, len(conversation), 2):
        conversation_dict[str(j)] = [conversation[i], conversation[i+1]]
        i += 1
        j += 1
    
    try: #if file is not empty (first owner to insert)
        allConversations = openPickle("pickleFiles/all_conversations.pickle")
        conversationId = str(int(list(allConversations.keys())[-1]) + 1)
        allConversations_dict[conversationId] = conversation_dict
    except:
        conversationId = "1"
        allConversations_dict[conversationId] = conversation_dict
        
    filename = 'pickleFiles/all_conversations.pickle'
    writeInPickle(filename, allConversations_dict)
        
    return conversationId
#    pickleFile = openPickle("pickleFiles/all_conversations.pickle")
#    return str(pickleFile)


if __name__ == '__main__':
    app.run(debug=True)