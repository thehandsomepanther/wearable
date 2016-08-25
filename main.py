import requests
import json
import csv
import sklearn
import datetime
from secrets import *

def forecast(city_id, days):
	if not 1 <= days <= 16:
		return "days out of range"

	params = {
		'id': city_id,
		'cnt': days,
		'appId': API_KEY
	}
	return requests.get(
		"http://api.openweathermap.org/data/2.5/forecast/daily?id=%(id)s&units=metric&cnt=%(cnt)s&appId=%(appId)s" % params
	)

def current(city_id):
	params = {
		'id': city_id,
		'appId': API_KEY
	}
	return requests.get(
		"http://api.openweathermap.org/data/2.5/weather?id=%(id)s&units=metric&appId=%(appId)s" % params
	)

with open("history.csv", 'a+') as f:
	fields = [
		'year','month','date','day',
		'lat','lon','weather',
		'temp_max','temp_min','temp_morn','temp_day','temp_eve',
		'humidity','wind_spd','wind_deg', 'clouds'
	]

	reader = csv.DictReader(f)
	writer = csv.DictWriter(f, delimiter=',', fieldnames=fields)
	headers = reader.fieldnames

	days = 16
	forecasts = forecast(ESTES_PARK_ID, days).json()

	lat = forecasts['city']['coord']['lat']
	lon = forecasts['city']['coord']['lon']

	today = datetime.date.today()

	for forecast in forecasts['list']:
		row = {
			'year': 	today.year,
			'month': 	today.month,
			'date': 	today.day,
			'day': 		today.strftime("%w"),
			'lat':		lat,
			'lon':		lon,
			'weather':	forecast['weather'][0]['main'],
			'temp_max':	forecast['temp']['max'],
			'temp_min':	forecast['temp']['min'],
			'temp_morn':forecast['temp']['morn'],
			'temp_day':	forecast['temp']['day'],
			'temp_eve':	forecast['temp']['eve'],
			'humidity':	forecast['humidity'],
			'wind_spd':	forecast['speed'],
			'wind_deg':	forecast['deg'],
			'clouds':	forecast['clouds']
		}
		writer.writerow(row)
		today += datetime.timedelta(days=1)
