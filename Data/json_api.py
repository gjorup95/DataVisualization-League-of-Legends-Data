import json
from os import kill
from datahandler import DataHandler as DataHandler

"""
    -- DATA --
"""
dataHandler = DataHandler()
data = dataHandler.getFullData('FnatInflation')

summoner_name, puuid = dataHandler.getSummonerInformation(data)

timeline = dataHandler.getTimeline(0, data)
participant_no = dataHandler.getParticipantNumberOfUserForTimeline(
    timeline, puuid)

timeline_array = dataHandler.getTimelineAsArray(timeline)

summoner_info = dataHandler.getSummonerInformationInTimestampFromTimelineArray(
    participant_no, timeline_array, 5)

"""
    -- EVENTS --
"""
# events = dataHandler.getAllEventsInTimestampFromTimelineArray(
#     timeline_array, 5)

# kill_events = dataHandler.getKillsEventByTypeAndParticipantInFrame(
#     participant_no, timeline_array, 11)

# assists = dataHandler.getAssistEventByTypeAndParticipantInFrame(
#     participant_no, timeline_array, 14)

# killed_events = dataHandler.getKilledEventByTypeAndParticipantInFrame(
#     participant_no, timeline_array, 14)

# # THIS CAN BE USED TO GET INTERVAL FOR ABOVE METHODS (PARAMETER)
# kill_events_range = dataHandler.getChampionKillEventsInInterval(participant_no, timeline_array, 0, len(
#     timeline_array)-1, dataHandler.getKilledEventByTypeAndParticipantInFrame)

# kda_in_range = dataHandler.getKDAInTimelineFromInterval(
#     participant_no, timeline_array, 0, len(timeline_array)-1)


# def getAverageKDA():
#     temp_array = []
#     final_array = []
#     for i in range(0, 49):  # 49
#         timeline = dataHandler.getTimeline(i, data)
#         participant_no = dataHandler.getParticipantNumberOfUserForTimeline(
#             timeline, puuid)
#         timeline_array = dataHandler.getTimelineAsArray(timeline)

#         stat_array = dataHandler.getKDAArrayInTimelineFromInterval(
#             participant_no, timeline_array, 0, len(timeline_array)-1)

#         temp_array, stat_array = dataHandler.fillShortestArrayWithZeroes(
#             temp_array, stat_array)

#         for i in range(0, len(stat_array)):
#             temp_array[i][0] += stat_array[i]
#             temp_array[i][1] += 1

#     for i in range(0, len(temp_array)):
#         final_array.append(temp_array[i][0] / temp_array[i][1])

#     return final_array


def getAverageKAPerMinute():
    temp_array = []
    final_array = []
    for i in range(0, 49):  # 49
        timeline = dataHandler.getTimeline(i, data)
        participant_no = dataHandler.getParticipantNumberOfUserForTimeline(
            timeline, puuid)
        timeline_array = dataHandler.getTimelineAsArray(timeline)

        stat_array = dataHandler.getKAArrayInTimelineFromIntervalPerMinute(
            participant_no, timeline_array, 0, len(timeline_array)-1)

        temp_array, stat_array = dataHandler.fillTempArrayWithZeroesIfTooSmall(
            temp_array, stat_array)

        for i in range(0, len(stat_array)):
            temp_array[i][0] += stat_array[i]
            temp_array[i][1] += 1

    for i in range(0, len(temp_array)):
        final_array.append(temp_array[i][0] / temp_array[i][1])

    return final_array


# print(getAverageKAPerMinute())


def getAverageDeathsPerMinute():
    temp_array = []
    final_array = []
    for i in range(0, 49):  # 49
        timeline = dataHandler.getTimeline(i, data)
        participant_no = dataHandler.getParticipantNumberOfUserForTimeline(
            timeline, puuid)
        timeline_array = dataHandler.getTimelineAsArray(timeline)

        stat_array = dataHandler.getDeathsArrayInTimelineFromIntervalPerMinute(
            participant_no, timeline_array, 0, len(timeline_array)-1)

        temp_array, stat_array = dataHandler.fillTempArrayWithZeroesIfTooSmall(
            temp_array, stat_array)

        for i in range(0, len(stat_array)):
            temp_array[i][0] += stat_array[i]
            temp_array[i][1] += 1

    for i in range(0, len(temp_array)):
        final_array.append(temp_array[i][0] / temp_array[i][1])

    return final_array


# print(getAverageDeathsPerMinute())


"""
    -- STATS --
"""
# -- Regular stats --
# {
#   currentGold,
#   jungleMinionsKilled,
#   level,
#   minionsKilled,
#   timeEnemySpentControlled,
#   totalGold,
#   xp
# }


def getAverageStatPerMinute(stat):
    temp_array = []
    final_array = []
    for i in range(0, 49):  # 49
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

# print(getAverageStatPerMinute('totalGold'))


def getAverageDamageSharePerMinute(puuid, timeline):
    participant_no = dataHandler.getParticipantNumberOfUserForTimeline(
        timeline, puuid)
    timeline_array = dataHandler.getTimelineAsArray(timeline)

    participant_array = []
    temp_array = []

    for i in range(1, 11):
        stat_array = dataHandler.getDamageStatInIntervalFromTimelineArrayPerMinute(
            i, timeline_array, 0, len(timeline_array)-1, 'totalDamageDone')
        participant_array.append(stat_array)

    stat_array[0], stat_array[participant_no] = stat_array[participant_no], stat_array[0]

    temp_array, stat_array = dataHandler.fillTempArrayWithZeroesIfTooSmall(
        temp_array, stat_array)

    sum_array = []
    for i in range(0, 10):
        return 0
        # for i in range(0, len(stat_array)):
        #     temp_array[i][0] += stat_array[i]
        #     temp_array[i][1] += 1

        # for i in range(0, len(temp_array)):
        #     final_array.append(temp_array[i][0] / temp_array[i][1])

    return stat_array


def test():
    # RUN THROUGH ALL GAMES, FIRST FIND DAMAGESHARE FOR PARTICIPANT AND THEN FIND FOR THE REST.
    timeline = dataHandler.getTimeline(0, data)


# def getAverageDamageSharePerMinute():
#     participant_array = []

#     for i in range(0, 49):
#         temp_array = []
#         final_array = []  # 49
#         timeline = dataHandler.getTimeline(i, data)
#         timeline_array = dataHandler.getTimelineAsArray(timeline)
#         participant_no = dataHandler.getParticipantNumberOfUserForTimeline(
#             timeline, puuid)

#         for y in range(1, 11):
# stat_array = dataHandler.getDamageStatInIntervalFromTimelineArrayPerMinute(
#     y, timeline_array, 0, len(timeline_array)-1, 'totalDamageDone')

#             temp_array, stat_array = dataHandler.fillTempArrayWithZeroesIfTooSmall(
#                 temp_array, stat_array)

#             for i in range(0, len(stat_array)):
#                 temp_array[i][0] += stat_array[i]
#                 temp_array[i][1] += 1

#             for i in range(0, len(temp_array)):
#                 final_array.append(temp_array[i][0] / temp_array[i][1])

#             participant_array.append(final_array)

#     dmg_share = []
#     for i in range(0, len(participant_array[0])):
#         test = []
#         for y in range(0, 10):
#             test.append(participant_array[y][i])

#         if(sum(test) == 0):
#             dmg_share.append(0)
#         else:
#             dmg_share.append((test[0]/sum(test))*100)

#     return dmg_share


getAverageDamageSharePerMinute(puuid, timeline)


def getAverageStat(stat):
    temp_array = []
    final_array = []
    for i in range(0, 49):  # 49
        timeline = dataHandler.getTimeline(i, data)
        participant_no = dataHandler.getParticipantNumberOfUserForTimeline(
            timeline, puuid)
        timeline_array = dataHandler.getTimelineAsArray(timeline)

        stat_array = dataHandler.getStatInIntervalFromTimelineArray(
            participant_no, timeline_array, 0, len(timeline_array)-1, stat)

        temp_array, stat_array = dataHandler.fillTempArrayWithZeroesIfTooSmall(
            temp_array, stat_array)

        for i in range(0, len(stat_array)):
            temp_array[i][0] += stat_array[i]
            temp_array[i][1] += 1

    for i in range(0, len(temp_array)):
        final_array.append(temp_array[i][0] / temp_array[i][1])

    return final_array


# print(getAverageStat('level'))

# -- Champion stats --
# {
#   "abilityHaste": 0,
#   "abilityPower": 0,
#   "armor": 59,
#   "armorPen": 0,
#   "armorPenPercent": 0,
#   "attackDamage": 89,
#   "attackSpeed": 112,
#   "bonusArmorPenPercent": 0,
#   "bonusMagicPenPercent": 0,
#   "ccReduction": 0,
#   "cooldownReduction": 0,
#   "health": 831,
#   "healthMax": 831,
#   "healthRegen": 18,
#   "lifesteal": 0,
#   "magicPen": 0,
#   "magicPenPercent": 0,
#   "magicResist": 34,
#   "movementSpeed": 345,
#   "omnivamp": 0,
#   "physicalVamp": 0,
#   "power": 475,
#   "powerMax": 475,
#   "powerRegen": 18,
#   "spellVamp": 0
# }
champion_stat_in_frame = dataHandler.getChampionStatInTimestampFromTimelineArray(
    participant_no, timeline_array, 5, 'armor')

champion_stat_interval = dataHandler.getChampionStatInIntervalFromTimelineArray(
    participant_no, timeline_array, 0, len(timeline_array)-1, 'armor')

# -- Damage stats --
# {
# "magicDamageDone": 539,
# "magicDamageDoneToChampions": 145,
# "magicDamageTaken": 0,
# "physicalDamageDone": 4198,
# "physicalDamageDoneToChampions": 813,
# "physicalDamageTaken": 744,
# "totalDamageDone": 4738,
# "totalDamageDoneToChampions": 958,
# "totalDamageTaken": 744,
# "trueDamageDone": 0,
# "trueDamageDoneToChampions": 0,
# "trueDamageTaken": 0
# }
champion_damage_stat_in_frame = dataHandler.getDamageStatInTimestampFromTimelineArray(
    participant_no, timeline_array, 5, 'totalDamageDone')

champion_damage_stat_interval = dataHandler.getDamageStatInIntervalFromTimelineArray(
    participant_no, timeline_array, 0, len(timeline_array)-1, 'totalDamageDone')
