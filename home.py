from flask import Flask, request, render_template
import random
import json
import pickle


app = Flask(__name__)

with open("jsonFiles/questions.json") as file:
    questions = json.load(file)
    
with open("jsonFiles/truckQuestions.json") as file:
    truckQuestions = json.load(file)
    
def openPickle(filename):
    infile = open(filename,'rb')
    new_dict = pickle.load(infile)
    infile.close()
    return new_dict

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/start')
def start():
    return "Hello, my name is Tracks. I will help you register your fleet by asking you some questions (type quit to stop)!"
    
@app.route('/all/truck/questions')
def getTruckQuestions():
    questions = [];
    for i in range(3):
        questions.append(random.choice(list(truckQuestions[str(i)]["questions"])))
    return str(questions)


@app.route('/ask/<questionNumber>')
def ask(questionNumber):
    if int(questionNumber) < 5:
        return random.choice(list(questions[questionNumber]["questions"]))
    elif questionNumber == "5":
            return str(["Okay* now I will ask you some questions about the specifications of your trucks.",
                   "If you have any group of trucks with the exact same specifications* group them and tell me the number of groups.",
                   "Let me explain more.",
                   "If you have 9 trucks* 4 are exactly the same* and 5 are the same* then you have 2 groups. If all trucks are exactly the same then you have 1 group.",
                   "Now tell me how many groups of trucks do you have?"])
#    else:
#        questionNumber = str(int(questionNumber)-1)
#        return random.choice(list(questions[questionNumber]["questions"]))
            

@app.route("/ask/trucks/<questionNumber>")
def askTrucks(questionNumber):
    return random.choice(list(truckQuestions[questionNumber]["questions"]))


@app.route("/answer/trucks", methods=['POST'])
def answerTrucks():
    req_data = request.get_json()
    answer = req_data["1"]
    return str(answer)
        
#@app.route("/answer/<questionNumber>/<ownerId>/", defaults={"groupsNumber": None})
@app.route('/answer/<questionNumber>/<fleetId>')
def answer(questionNumber, fleetId):
    if int(questionNumber) >= 5:
        questionNumber = str(int(questionNumber) - 1)
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
    outfile = open(filename,'wb')
    pickle.dump(allResponses,outfile)
    outfile.close()
    
    return newFleetId

#    pickleFile = openPickle("pickleFiles/all_responses.pickle")
#    return str(pickleFile)


if __name__ == '__main__':
    app.run(debug=True)