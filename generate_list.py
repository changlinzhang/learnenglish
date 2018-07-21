import json

text = open('/Users/genius/Documents/computer fields/computer network/Fundamentals.txt')
target = open('app/data/listLessons.json')
lessonIndex = 371
categoryIndex = 2
sectionIndex = 0
fileJson = json.load(target)
fileCategories = fileJson["categories"]
cn = fileCategories[2]
fileSections = cn["sections"]
fileLessons = fileSections[1]["lessons"]
print(fileLessons)

jsonArray=[]

for line in text:
    elements = line.split('\t')
    jsonArray.append({'lessonIndex':lessonIndex, 'title':elements[0]})
    lessonIndex += 1

print(jsonArray)

fileSections[1]["lessons"] = [jsonArray]
cn["sections"] = fileSections
fileCategories[2] = cn
fileJson["categories"] = fileCategories

output = open("temp.json","w")
output.writelines(json.dumps(jsonArray, sort_keys=False, indent=4, separators=(',', ': ')))
output.close()

target.close()
text.close()