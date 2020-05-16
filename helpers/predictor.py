import requests
from random import random
import math 
from statsmodels.tsa.vector_ar.var_model import VAR
from statsmodels.tsa.statespace.sarimax import SARIMAX
import sys
def validTest(t):
    if isinstance(t,list) and len(t)>2 and t[2]!="" and t[2]!=None:
        return True
    return False
r = requests.get(url = 'https://api.covid19india.org/data.json')
dailycases=r.json()
dailycases=dailycases['cases_time_series']
dailycases=dailycases[30:]
dailyConf=list(map(lambda a: int(a['dailyconfirmed']), dailycases))
dailyDead=list(map(lambda a: int(a['dailydeceased']), dailycases))
dailyRec=list(map(lambda a: int(a['dailyrecovered']), dailycases))
Cumlucative=list(map(lambda a: math.log(int(a['totalconfirmed'])), dailycases))
data = list()
r = requests.get(url = 'https://files.indiasmile.xyz/cache/api.json')
tests=r.json()
tests['testing']['values']=tests['testing']['values'][2:]
tests=tests['testing']['values']
l=len(tests)
tests=list(filter(validTest,tests))
data = [x*15 + random()*5 for x in range(1, 23)]
tests=list(map(lambda a: int(a[2].replace(',', '')), tests))
data.extend(tests)
model = SARIMAX(data, order=(1, 1, 1), seasonal_order=(0, 0, 0, 0))
model_fit = model.fit(disp=False)
# make prediction
tests = model_fit.predict(1, len(dailyRec)+1)
tests=list(map(lambda a: int(a), tests))
data = list()
for i in range(len(dailycases)):
    row = [dailyConf[i], dailyDead[i],dailyRec[i],math.sqrt(tests[i])]
    data.append(row)
if(data[len(data)-1][0]==0):
    data.pop()
    tests.pop()
# fit model
arg=sys.argv[1:]
for i in range(len(arg)):
    arg[i]=int(arg[i])
arg.append(math.sqrt(tests[-1]))
data.append(arg)
model = VAR(data)
model_fit = model.fit(2)
yhat = model_fit.forecast(model_fit.endog, steps=1)
print(yhat[0][0])
print(yhat[0][1])
print(yhat[0][2])