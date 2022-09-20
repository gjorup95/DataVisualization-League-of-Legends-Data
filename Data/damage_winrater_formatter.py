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
    "Damage": 0,
    "Tier": "null",
    "Division": 0
}
    key, value = participant.popitem()
    data_set['Name'] = key
    data_set['Division'] = filterLetters(value)
    data_set['Damage'] = data[key]['Stats']['Damage']
    data_set['Winrate'] = data[key]['Stats']['Winrate']
    data_set['Tier'] = filterDigits(value)
    data_set_list.append(data_set)
    
    
    
    
    
    
    



    


with open('formattedDamageWinrateScatterStats.json', 'w') as outfile:
    json.dump(data_set_list, outfile)

file.close
   


