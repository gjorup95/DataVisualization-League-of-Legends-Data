from requests.models import Response
import enum
import http
import json
from os import stat
import sys
import requests
import time
from http import HTTPStatus
from requests import status_codes
from requests.exceptions import HTTPError
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
from enum import Enum


class GameVariables(str, Enum):
    BOTTOM = 'BOTTOM'
    JUNGLE = 'JUNGLE'
    TOP = 'TOP'
    MIDDLE = 'MIDDLE'
    UTILITY = 'UTILITY'
    MATCHED_GAME = 'MATCHED_GAME'


api_key = 'RGAPI-cb1093e8-734c-4188-bce3-bd66b3937c1e'
base_summoner_url = 'https://euw1.api.riotgames.com'
base_match_url = 'https://europe.api.riotgames.com'
summoner_name = 'kattt'
amount_of_matches = 50
games_requested = 0


def requests_retry_session(
    retries=3,
    backoff_factor=15,
    status_forcelist=(500, 502, 504, 429, 403),
    session=None,
):
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session


def get_summoner_url(name, api):
    return '/lol/summoner/v4/summoners/by-name/{}?api_key={}'.format(name, api)


def get_matches_url(puuid, count, api):
    return '/lol/match/v5/matches/by-puuid/{}/ids?count={}&api_key={}'.format(puuid, count, api)


def get_matches_url_with_start(puuid, count, start, api):
    return '/lol/match/v5/matches/by-puuid/{}/ids?count={}&start={}&api_key={}'.format(puuid, count, start, api)


def get_single_match_url(matchid, api):
    return '/lol/match/v5/matches/{}?api_key={}'.format(matchid, api)


def get_single_match_timeline_url(matchid, api):
    return '/lol/match/v5/matches/{}/timeline?api_key={}'.format(matchid, api)


def request(base_url, url):
    t0 = time.time()

    try:

        r = requests_retry_session().get('{}{}'.format(base_url, url))
        r.raise_for_status()

    except requests.HTTPError as exception:
        status_code = exception.response.status_code
        if status_code == 403:
            print("Refresh API Key to proceed, exiting")
            sys.exit()

    else:

        return r.json()
    finally:
        t1 = time.time()
        print('Duration: ', t1-t0, 's')

# Filter for role and position if a singular match does not match
# return -1 else return the data


def filterRequests(searchTeamPosition, searchGametype, data):
    for participant in data['info']['participants'][:]:
        if data['info']['queueId'] != 420 and data['info']['queueId'] != 440:
            print("filtered nonranked game: " + data['metadata']['matchId'])
            return -1
        if participant['puuid'] == summoner_puuid:
            temp_user = participant
            if temp_user['teamPosition'] != searchTeamPosition:
                print("searched position did not match user position, gameId: " +
                      data['metadata']['matchId'])
                return -1
            print(data['metadata']['matchId'])
            return data


# Get values for a summoner.
summoner_url = get_summoner_url(summoner_name, api_key)
summoner = request(base_summoner_url, summoner_url)
summoner_puuid = summoner['puuid']


# Get 100 matches for summoner.
matches_url = get_matches_url(summoner_puuid, 100, api_key)
matches_url2 = get_matches_url_with_start(summoner_puuid, 100, 100, api_key)
matches_url3 = get_matches_url_with_start(summoner_puuid, 100, 200, api_key)
matches = request(base_match_url, matches_url)
matches.extend(request(base_match_url, matches_url2))
matches.extend(request(base_match_url, matches_url3))
print(len(matches))
print(matches)

match_array = []
# append additional role
match_array.append({"Name": summoner_name, "puuid": summoner_puuid})

# Retrieve match stats and timeline stats for the matche urls retrieved.


for match in matches[:]:
    temp_array = []

    # Get match stats
    individual_match_url = get_single_match_url(match, api_key)
    temp_match = request(base_match_url, individual_match_url)

    # filtering game based on parameters teamPosition & GameType
    # If they do not match, continue to the next game in the requests.
    # Effectively discarding the nonmatching game.

    if filterRequests(GameVariables.UTILITY, GameVariables.MATCHED_GAME, temp_match) == -1:
        continue

    # Get timeline stats
    games_requested += 1
    individual_timeline_url = get_single_match_timeline_url(match, api_key)
    temp_timeline = request(base_match_url, individual_timeline_url)
    # Filter match depending on role and append to array

    # Append matche and timeline into array, and then into full match array for ease of access
    temp_array.append(temp_match)
    temp_array.append(temp_timeline)
    match_array.append(temp_array)
    print("Games requested: " + str(games_requested))

    if amount_of_matches == games_requested:
        print('All ' + str(games_requested) + ' games found')
        break

with open('{}.json'.format(summoner['name']), 'w') as fp:
    json.dump(match_array, fp)

# print()
# print("====================================================")
# print("====================== USER ========================")
# print("====================================================")
# print(summoner)

# print()
# print("====================================================")
# print("==================== MATCHES =======================")
# print("====================================================")
# print(matches)
