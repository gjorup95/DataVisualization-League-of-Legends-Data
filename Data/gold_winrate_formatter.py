from io import StringIO
import json
import re
from os import name
from typing import KeysView

file = open("Data/stats.json",)

data = json.load(file)
formatted_data = json

def filterDigits(strData):
    tempString = "null"
    tempString = " ".join(re.findall("[a-zA-Z]+", strData))
    #print(tempString)
    return tempString

def filterLetters(strData):
    tempStr = "null"
    print(strData)
    if strData.isalpha() == True:
        print("ingen tal")
        # Return 0 if data does not contain a rank division (1,2,3,4)
        return 0

    tempStr = ''.join(filter(lambda i: i.isdigit(), strData))
    return int(tempStr)

data_set_list = []


# 1 = stats data entry
for participant in data['ParticipantList']:
    data_set = {
    "Name": "null",
    "Winrate": 0,
    "Gold": 0,
    "Tier": "null",
    "Division": 0,
    "Damage": 0
}
    key, value = participant.popitem()
    data_set['Name'] = key
    data_set['Division'] = filterLetters(value)
    data_set['Gold'] = data[key]['Stats']['Gold']
    data_set['Winrate'] = data[key]['Stats']['Winrate']
    data_set['Damage'] = data[key]['Stats']['Damage']
    data_set['Tier'] = filterDigits(value)
    data_set_list.append(data_set)
    
    
    
    
    #data_set['Name'] = data['participant']['Information']['Name']
    #print(data_set['Name'])
    #data_set['Winrate'] = data[list_of_players[i]]['Stats']['Winrate']
    #data_set['Gold'] = data[list_of_players[i]]['Stats']['Gold']
    #data_set['Rank'] = data['ParticipantList']
    #list.append(data_set)
    #print(data[list_of_players[i]]['Information']['Name'])
    #print(data[list_of_players[i]]['Stats']['Winrate'])
    #print(data[list_of_players[i]]['Stats']['Gold'])
    
    



    


with open('formattedScatterStats.json', 'w') as outfile:
    json.dump(data_set_list, outfile)

file.close
   


#print(data[1].Winrate)