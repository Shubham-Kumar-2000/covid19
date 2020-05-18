text="get all data where there is a Covid-19 case in Bihar to the west of West Bengal"
# get all data where there is a Covid-19 case in Bihar to the west of West Bengal
import sys
import os
import nltk
from nltk.tokenize import word_tokenize
import enchant
import re
from nltk.corpus import stopwords
import difflib
arg=sys.argv[1:]
text=arg[0]
if(len(arg)>1 and arg[1]=='download'):
    nltk.download('punkt')
    nltk.download('averaged_perceptron_tagger')
    nltk.download('stopwords')
d = enchant.DictWithPWL("en_IN",os.path.join(os.path.abspath(os.path.dirname(__file__)),"names.txt"))

def getWord(word):
    if is_number(word) or d.check(word.upper()):
        return word
    word=reduce_lengthening(word)
    best_words =word
    best_ratio = 0
    suggestions=d.suggest(best_words)
    for s in suggestions:
        tmp =difflib.SequenceMatcher(None, word, s).ratio()
        if tmp > best_ratio:
            best_words = s
            best_ratio = tmp
    return best_words

def is_number(s):
    try:
        return float(s)
        return True
    except ValueError:
        return False

def reduce_lengthening(text):
    pattern = re.compile(r"(.)\1{2,}")
    return pattern.sub(r"\1\1", text);


def checkAlphaNum(word):
    for i in range(0, len(word)):
        if word[i].isalnum():
            return True
    return False


tokens=word_tokenize(text)

tokens=list(filter(lambda x: not x.lower() in stopwords.words('english') and  checkAlphaNum(x) , tokens))
tokens=list(map(lambda x: getWord(x),tokens))
tags=nltk.pos_tag(tokens)


ext=[]
for x,y in tags:
    if y in ['NNP','NN','CD'] :
        ext.append(x)

print(" ".join(ext),end="")





