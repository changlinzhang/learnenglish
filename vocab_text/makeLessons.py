import json

text = open('datastructure.txt')
lessonIndex = 0
categoryIndex = 0
sectionIndex = -1
sectionNow = ""
for line in text:
    if len(line)>=2 and line[-2] == '-':
        print(line.split()[1])
        if(sectionNow != line.split()[1][:-1]):
            sectionNow = line.split()[1][:-1]
            sectionIndex += 1
        for title in line.split()[1:]:
            if(title == "-"):
                break
            writeTitle = title
            if(writeTitle[-1] == ","):
                writeTitle = writeTitle[:-1]
            output = open(str(lessonIndex)+".json","w")
            output.writelines(json.dumps([{"lessonIndex":lessonIndex, "categoryIndex":categoryIndex, "sectionIndex":sectionIndex, "title":writeTitle}], sort_keys=True, indent=4, separators=(',', ': ')))
            print("File written")
            output.close()
            lessonIndex += 1
text.close()