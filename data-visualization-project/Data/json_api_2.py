import json
from os import kill
from datahandler import DataHandler as DataHandler

"""
    -- DATA --
"""
dataHandler = DataHandler()
data = dataHandler.getFullData('kattt')
rank = 'I2'

summoner_name, puuid = dataHandler.getSummonerInformation(data)

# timeline, match = dataHandler.getTimelineAndMatch(0, data)
# participant_no = dataHandler.getParticipantNumberOfUserForTimeline(
#     timeline, puuid)

# timeline_array = dataHandler.getTimelineAsArray(timeline)

# summoner_info = dataHandler.getSummonerInformationInTimestampFromTimelineArray(
#     participant_no, timeline_array, 5)

# TOTAL GOLD, D%, GAME-LENGTH totalDamageDealt


def getAverageStatPerMinuteHelper(data, puuid, stat):
    temp_array = []
    final_array = []
    for i in range(0, len(data)-1):  # 49
        timeline = dataHandler.getTimeline(i, data)
        participant_no = dataHandler.getParticipantNumberOfUserForTimeline(
            timeline, puuid)
        timeline_array = dataHandler.getTimelineAsArray(timeline)

        stat_array = dataHandler.getStatInIntervalFromTimelineArrayPerMinute(
            participant_no, timeline_array, 0, len(timeline_array)-1, stat)

        temp_array, stat_array = dataHandler.fillTempArrayWithZeroesIfTooSmall(
            temp_array, stat_array)

        for i in range(0, len(stat_array)):
            temp_array[i][0] += stat_array[i]
            temp_array[i][1] += 1

    for i in range(0, len(temp_array)):
        final_array.append(temp_array[i][0] / temp_array[i][1])

    return final_array


def getAverageKillEventsPerMinute(method):
    temp_array = []
    final_array = []
    for i in range(0, len(data)-1):  # 49
        timeline = dataHandler.getTimeline(i, data)
        participant_no = dataHandler.getParticipantNumberOfUserForTimeline(
            timeline, puuid)
        timeline_array = dataHandler.getTimelineAsArray(timeline)

        stat_array = method(
            participant_no, timeline_array, 0, len(timeline_array)-1)

        temp_array, stat_array = dataHandler.fillTempArrayWithZeroesIfTooSmall(
            temp_array, stat_array)

        for i in range(0, len(stat_array)):
            temp_array[i][0] += stat_array[i]
            temp_array[i][1] += 1

    for i in range(0, len(temp_array)):
        final_array.append(temp_array[i][0] / temp_array[i][1])

    return final_array


def getAverageTimelineStatsPerMinute(data, puuid):
    #
    average_gold_array = getAverageStatPerMinuteHelper(
        data, puuid, 'totalGold')

    # minion_array = getAverageStatPerMinuteHelper(data, puuid, 'minionsKilled')
    # jungle_minion_array = getAverageStatPerMinuteHelper(
    #     data, puuid, 'jungleMinionsKilled')

    # KILL EVENTS TODO: LAV DET HER OM TIL BOUNTY REWARD PR. MINUTE
    average_kills_array = getAverageKillEventsPerMinute(
        dataHandler.getKillsArrayInTimelineFromIntervalPerMinute)

    average_assists_array = getAverageKillEventsPerMinute(
        dataHandler.getAssistArrayInTimelineFromIntervalPerMinute)

    final_kill_array = []
    for i in range(0, len(average_kills_array)):
        final_kill_array.append(
            average_kills_array[i] + average_assists_array[i])

    # BUILDINGS
    average_tower_kills_array = getAverageKillEventsPerMinute(
        dataHandler.getTowerKillsArrayInTimelineFromIntervalPerMinute)

    average_tower_assists_array = getAverageKillEventsPerMinute(
        dataHandler.getTowerAssistsArrayInTimelineFromIntervalPerMinute)

    average_inhibitor_kills_array = getAverageKillEventsPerMinute(
        dataHandler.getInhibitorKillsArrayInTimelineFromIntervalPerMinute)

    average_tower_plate_kills_array = getAverageKillEventsPerMinute(
        dataHandler.getTowerPlateKillsArrayInTimelineFromIntervalPerMinute)

    final_building_array = []
    for i in range(0, len(average_tower_kills_array)):
        final_building_array.append(
            average_tower_kills_array[i]*150 + average_tower_assists_array[i]*75 + average_inhibitor_kills_array[i]*50 + average_tower_plate_kills_array[i]*160)

    # PASSIVE GOLD
    passive_gold_array = []
    passive_gold_array.append(0)
    passive_gold_array.append(0)

    for i in range(2, len(average_inhibitor_kills_array)):
        passive_gold_array.append(122.4)

    final_array = []

    for i in range(0, len(final_kill_array)):
        temp_total_gold_without_minions = passive_gold_array[i] + \
            final_building_array[i] + final_kill_array[i]

        if(average_gold_array[i] - temp_total_gold_without_minions > 0):
            temp_minion_gold = average_gold_array[i] - \
                temp_total_gold_without_minions
        else:
            temp_minion_gold = 0

        temp_total_gold_with_minions = temp_minion_gold + temp_total_gold_without_minions

        temp_object = {
            "Passive": passive_gold_array[i],
            "Buildings": final_building_array[i],
            "Kills": final_kill_array[i],
            "Minions": temp_minion_gold
        }

        final_array.append(temp_object)

    return final_array


def getAverageStats(data, puuid):
    win_array = []
    gold_array = []
    damage_array = []
    gamelength_array = []

    for i in range(0, len(data)-1):  # TODO: SKIFT DETTE!!!!
        timeline, match = dataHandler.getTimelineAndMatch(i, data)
        win_array.append(dataHandler.getMatchResultFromMatch(puuid, match))
        gold_array.append(dataHandler.getStatFromMatch(
            puuid, match, 'goldEarned'))
        damage_array.append(dataHandler.getStatFromMatch(
            puuid, match, 'totalDamageDealt'))
        timeline_array = dataHandler.getTimelineAsArray(timeline)
        gamelength_array.append(len(timeline_array))

    win_avg = dataHandler.getAverageOfList(win_array)*100
    gold_avg = dataHandler.getAverageOfList(gold_array)
    damage_avg = dataHandler.getAverageOfList(damage_array)
    gamelength_avg = dataHandler.getAverageOfList(gamelength_array)
    percentage_array = getAverageTimelineStatsPerMinute(data, puuid)

    json_array = {}

    try:
        with open('stats.json', 'r') as fp:
            jsondata = json.load(fp)
            jsondata['ParticipantList'].append({summoner_name: rank})
            jsondata[summoner_name] = {"Information": {"Name": summoner_name, "puuid": puuid}, "Stats": {"Winrate": win_avg,
                                                                                                         "Gold": gold_avg, "Damage": damage_avg, "Gamelength": gamelength_avg}, "IntervalStats": percentage_array}

            with open('stats.json', 'w') as fp2:
                json.dump(jsondata, fp2)

    except FileNotFoundError:
        with open('stats.json', 'w') as fp:
            json_array = {}
            json_array['ParticipantList'] = [{summoner_name: rank}]
            json_array[summoner_name] = {"Information": {"Name": summoner_name, "puuid": puuid}, "Stats": {"Winrate": win_avg,
                                                                                                           "Gold": gold_avg, "Damage": damage_avg, "Gamelength": gamelength_avg}, "IntervalStats": percentage_array}
            json.dump(json_array, fp)


getAverageStats(data, puuid)


def getAverageGoldEarnedStatsOverall(data, puuid):
    for i in range(0, len(data)-2):
        timeline, match = dataHandler.getTimelineAndMatch(i, data)
        # TODO: FORSKEL I GULD VED TAKEDOWN/KILL?

        # BUILDINGS
        dataHandler.getStatFromMatch(puuid, match, 'inhibitorTakedowns')
        dataHandler.getStatFromMatch(puuid, match, 'inhibitorKills')
        dataHandler.getStatFromMatch(puuid, match, 'turretKills')
        dataHandler.getStatFromMatch(puuid, match, 'turretTakedowns')

        # MINIONS
        dataHandler.getStatFromMatch(puuid, match, 'baronKills')
        dataHandler.getStatFromMatch(puuid, match, 'dragonKills')
        dataHandler.getStatFromMatch(puuid, match, 'neutralMinionsKilled')
        dataHandler.getStatFromMatch(puuid, match, 'totalMinionsKilled')

    return 0
