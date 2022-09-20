import json
from os import kill, stat
from itertools import repeat


class DataHandler:
    def getFullData(self, name):
        with open('{}.json'.format(name)) as json_file:
            data = json.load(json_file)
        return data

    def getMatch(self, match_number, data):
        match = data[match_number + 1][0]
        return match

    def getTimeline(self, match_number, data):
        timeline = data[match_number + 1][1]
        return timeline

    def getTimelineAndMatch(self, match_number, data):
        return self.getTimeline(match_number, data), self.getMatch(match_number, data)

    def getParticipantNumberOfUserForTimeline(self, timeline, puuid):
        return timeline['metadata']['participants'].index(puuid)

    def getTimelineAsArray(self, timeline):
        return timeline['info']['frames']

    def getSummonerInformation(self, data):
        return data[0]['Name'], data[0]['puuid']

    def getSummonerInformationInTimestampFromTimelineArray(self, participant_no, timeline_array, frame):
        return timeline_array[frame]['participantFrames'][str(participant_no)]

    def getAllSummonerInformationInTimestampFromTimelineArray(self, timeline_array, frame):
        return timeline_array[frame]['participantFrames']

    def getStatInTimestampFromTimelineArray(self, participant_no, timeline_array, frame, stat):
        info = self.getSummonerInformationInTimestampFromTimelineArray(
            participant_no, timeline_array, frame)
        return info[stat]

    def getStatFromMatch(self, puuid, match, stat):
        participants = match['info']['participants']
        for participant in participants:
            if(participant['puuid'] == puuid):
                return participant[stat]

    def getMatchResultFromMatch(self, puuid, match):
        participants = match['info']['participants']
        for participant in participants:
            if(participant['puuid'] == puuid):
                return participant['win']

    def getStatInIntervalFromTimelineArrayPerMinute(self, participant_no, timeline_array, frame_start, frame_end, stat):
        info = []
        prior_stat = 0
        for i in range(frame_start, frame_end):
            temp_stat = self.getStatInTimestampFromTimelineArray(
                participant_no, timeline_array, i, stat)
            info.append(temp_stat-prior_stat)
            prior_stat = temp_stat

        return info

    def getStatInIntervalFromTimelineArray(self, participant_no, timeline_array, frame_start, frame_end, stat):
        info = []

        for i in range(frame_start, frame_end):
            temp_stat = self.getStatInTimestampFromTimelineArray(
                participant_no, timeline_array, i, stat)
            info.append(temp_stat)

        return info

    def getChampionStatInTimestampFromTimelineArray(self, participant_no, timeline_array, frame, stat):
        info = self.getSummonerInformationInTimestampFromTimelineArray(
            participant_no, timeline_array, frame)
        return info['championStats'][stat]

    def getChampionStatInIntervalFromTimelineArray(self, participant_no, timeline_array, frame_start, frame_end, stat):
        info = []
        for i in range(frame_start, frame_end):
            temp_stat = self.getChampionStatInTimestampFromTimelineArray(
                participant_no, timeline_array, i, stat)
            info.append(temp_stat)

        return info

    def getDamageStatInTimestampFromTimelineArray(self, participant_no, timeline_array, frame, stat):
        info = self.getSummonerInformationInTimestampFromTimelineArray(
            participant_no, timeline_array, frame)
        return info['damageStats'][stat]

    def getDamageStatInIntervalFromTimelineArray(self, participant_no, timeline_array, frame_start, frame_end, stat):
        info = []
        for i in range(frame_start, frame_end):
            temp_stat = self.getDamageStatInTimestampFromTimelineArray(
                participant_no, timeline_array, i, stat)
            info.append(temp_stat)

        return info

    def getDamageStatInIntervalFromTimelineArrayPerMinute(self, participant_no, timeline_array, frame_start, frame_end, stat):
        info = []
        temp_dmg = 0

        for i in range(frame_start, frame_end):
            temp_stat = self.getDamageStatInTimestampFromTimelineArray(
                participant_no, timeline_array, i, stat)
            info.append(temp_stat - temp_dmg)
            temp_dmg = temp_stat

        return info

    def getAllEventsInTimestampFromTimelineArray(self, timeline_array, frame):
        return timeline_array[frame]['events']

    def getKillsEventByTypeAndParticipantInFrame(self, participant_no, timeline_array, frame):
        events = self.getAllEventsInTimestampFromTimelineArray(
            timeline_array, frame)
        kill_events = []

        for event in events:
            if(event['type'] == 'CHAMPION_KILL' and event['killerId'] == participant_no):
                kill_events.append(event)

        return kill_events

    def getKilledEventByTypeAndParticipantInFrame(self, participant_no, timeline_array, frame):
        events = self.getAllEventsInTimestampFromTimelineArray(
            timeline_array, frame)
        kill_events = []

        for event in events:
            if(event['type'] == 'CHAMPION_KILL' and event['victimId'] == participant_no):
                kill_events.append(event)

        return kill_events

    def getAssistEventByTypeAndParticipantInFrame(self, participant_no, timeline_array, frame):
        events = self.getAllEventsInTimestampFromTimelineArray(
            timeline_array, frame)
        kill_events = []

        for event in events:
            try:
                event['assistingParticipantIds']
            except KeyError:
                continue

            if(event['type'] == 'CHAMPION_KILL' and participant_no in event['assistingParticipantIds']):
                kill_events.append(event)

        return kill_events

    def getTowerKillsEventByTypeAndParticipantInFrame(self, participant_no, timeline_array, frame):
        events = self.getAllEventsInTimestampFromTimelineArray(
            timeline_array, frame)
        kill_events = []

        for event in events:
            if(event['type'] == 'BUILDING_KILL' and event['buildingType'] == 'TOWER_BUILDING' and event['killerId'] == participant_no):
                kill_events.append(event)

        return kill_events

    def getTowerAssistsEventByTypeAndParticipantInFrame(self, participant_no, timeline_array, frame):
        events = self.getAllEventsInTimestampFromTimelineArray(
            timeline_array, frame)
        kill_events = []

        for event in events:
            try:
                event['assistingParticipantIds']
            except KeyError:
                continue

            if(event['type'] == 'BUILDING_KILL' and event['buildingType'] == 'TOWER_BUILDING' and participant_no in event['assistingParticipantIds']):
                kill_events.append(event)

        return kill_events

    def getInhibitorKillsEventByTypeAndParticipantInFrame(self, participant_no, timeline_array, frame):
        events = self.getAllEventsInTimestampFromTimelineArray(
            timeline_array, frame)
        kill_events = []

        for event in events:
            if(event['type'] == 'BUILDING_KILL' and event['buildingType'] == 'INHIBITOR_BUILDING' and event['killerId'] == participant_no):
                kill_events.append(event)

        return kill_events

    def getTowerPlateKillsEventByTypeAndParticipantInFrame(self, participant_no, timeline_array, frame):
        events = self.getAllEventsInTimestampFromTimelineArray(
            timeline_array, frame)
        kill_events = []

        for event in events:
            if(event['type'] == 'TURRET_PLATE_DESTROYED' and event['killerId'] == participant_no):
                kill_events.append(event)

        return kill_events

    def getChampionKillEventsInInterval(self, participant_no, timeline_array, frame_start, frame_end, method):
        kill_events = []
        for i in range(frame_start, frame_end):
            events = method(participant_no, timeline_array, i)
            if(events is not None):
                kill_events = kill_events + events
        return kill_events

    def getKDAInTimelineFromInterval(self, participant_no, timeline_array, frame_start, frame_end):
        kills = self.getChampionKillEventsInInterval(
            participant_no, timeline_array, frame_start, frame_end, self.getKillsEventByTypeAndParticipantInFrame)

        deaths = self.getChampionKillEventsInInterval(
            participant_no, timeline_array, frame_start, frame_end, self.getKilledEventByTypeAndParticipantInFrame)

        assists = self.getChampionKillEventsInInterval(
            participant_no, timeline_array, frame_start, frame_end, self.getAssistEventByTypeAndParticipantInFrame)

        if(len(deaths) == 0):
            return len(kills) + len(assists)
        else:
            return (len(kills) + len(assists)) / len(deaths)

    def getKAInTimelineFromInterval(self, participant_no, timeline_array, frame_start, frame_end):
        kills = self.getChampionKillEventsInInterval(
            participant_no, timeline_array, frame_start, frame_end, self.getKillsEventByTypeAndParticipantInFrame)

        assists = self.getChampionKillEventsInInterval(
            participant_no, timeline_array, frame_start, frame_end, self.getAssistEventByTypeAndParticipantInFrame)

        return len(kills) + len(assists)

    def getKDAArrayInTimelineFromInterval(self, participant_no, timeline_array, frame_start, frame_end):
        temp_array = []
        for i in range(frame_start, frame_end):
            temp_kda = self.getKDAInTimelineFromInterval(
                participant_no, timeline_array, 0, i)
            temp_array.append(temp_kda)
        return temp_array

    def getKAArrayInTimelineFromInterval(self, participant_no, timeline_array, frame_start, frame_end):
        temp_array = []
        for i in range(frame_start, frame_end):
            temp_kda = self.getKAInTimelineFromInterval(
                participant_no, timeline_array, 0, i)
            temp_array.append(temp_kda)
        return temp_array

    def getKAArrayInTimelineFromIntervalPerMinute(self, participant_no, timeline_array, frame_start, frame_end):
        temp_array = []
        for i in range(frame_start, frame_end):
            temp_kda = self.getKAInTimelineFromInterval(
                participant_no, timeline_array, i, i+1)
            temp_array.append(temp_kda)
        return temp_array

    def getDeathsArrayInTimelineFromIntervalPerMinute(self, participant_no, timeline_array, frame_start, frame_end):
        temp_array = []
        for i in range(frame_start, frame_end):
            temp_deaths = len(self.getChampionKillEventsInInterval(
                participant_no, timeline_array, i, i+1, self.getKilledEventByTypeAndParticipantInFrame))
            temp_array.append(temp_deaths)
        return temp_array

    def getKillsArrayInTimelineFromIntervalPerMinute(self, participant_no, timeline_array, frame_start, frame_end):
        temp_array = []
        for i in range(frame_start, frame_end):
            temp_deaths = self.getChampionKillEventsInInterval(
                participant_no, timeline_array, i, i+1, self.getKillsEventByTypeAndParticipantInFrame)
            gold = 0
            for i in range(0, len(temp_deaths)):
                gold += temp_deaths[i]['bounty']

            temp_array.append(gold)

        return temp_array

    # TODO: REFACTOR THIS TO SAVE
    def getAssistArrayInTimelineFromIntervalPerMinute(self, participant_no, timeline_array, frame_start, frame_end):
        temp_array = []
        for i in range(frame_start, frame_end):
            temp_deaths = self.getChampionKillEventsInInterval(
                participant_no, timeline_array, i, i+1, self.getAssistEventByTypeAndParticipantInFrame)
            gold = 0

            for i in range(0, len(temp_deaths)):
                gold += (temp_deaths[i]['bounty'] / 2) / \
                    len(temp_deaths[i]['assistingParticipantIds'])

            temp_array.append(gold)
        return temp_array

    def getTowerKillsArrayInTimelineFromIntervalPerMinute(self, participant_no, timeline_array, frame_start, frame_end):
        temp_array = []
        for i in range(frame_start, frame_end):
            temp_deaths = len(self.getChampionKillEventsInInterval(
                participant_no, timeline_array, i, i+1, self.getTowerKillsEventByTypeAndParticipantInFrame))
            temp_array.append(temp_deaths)
        return temp_array

    def getTowerAssistsArrayInTimelineFromIntervalPerMinute(self, participant_no, timeline_array, frame_start, frame_end):
        temp_array = []
        for i in range(frame_start, frame_end):
            temp_deaths = len(self.getChampionKillEventsInInterval(
                participant_no, timeline_array, i, i+1, self.getTowerAssistsEventByTypeAndParticipantInFrame))
            temp_array.append(temp_deaths)
        return temp_array

    def getInhibitorKillsArrayInTimelineFromIntervalPerMinute(self, participant_no, timeline_array, frame_start, frame_end):
        temp_array = []
        for i in range(frame_start, frame_end):
            temp_deaths = len(self.getChampionKillEventsInInterval(
                participant_no, timeline_array, i, i+1, self.getInhibitorKillsEventByTypeAndParticipantInFrame))
            temp_array.append(temp_deaths)
        return temp_array

    def getTowerPlateKillsArrayInTimelineFromIntervalPerMinute(self, participant_no, timeline_array, frame_start, frame_end):
        temp_array = []
        for i in range(frame_start, frame_end):
            temp_deaths = len(self.getChampionKillEventsInInterval(
                participant_no, timeline_array, i, i+1, self.getTowerPlateKillsEventByTypeAndParticipantInFrame))
            temp_array.append(temp_deaths)
        return temp_array

    # Helpers
    def fillTempArrayWithZeroesIfTooSmall(self, temp_array, stat_array):
        if(len(temp_array) == len(stat_array) or len(temp_array) > len(stat_array)):
            return temp_array, stat_array

        for i in range(len(temp_array), len(stat_array)):
            temp_array.append([0, 0])

        return temp_array, stat_array

    def getAverageOfList(self, list):
        return sum(list)/len(list)
