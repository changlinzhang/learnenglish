# f=open("/Users/genius/Documents/computer fields/computer network/Fundamentals.txt")
# s=f.read()
# lines=s.split('\n')

# f.close

import json

text = open('/Users/genius/Documents/computer fields/computer network/Fundamentals.txt')
lessonIndex = 371
categoryIndex = 2
sectionIndex = 0
for line in text:
    elements = line.split('\t')
    output = open("./app/data/lessons/"+str(lessonIndex)+".json","w")
    if len(elements) > 1:
    	body = "\r\n<h1>\r\n"+elements[0]+"\r\n</h1>\r\n"+elements[1]
    else:
    	body = "No resource available. Would you like to help us add?"
    print("******"+body+"******")
    output.writelines(json.dumps({"lessonIndex":lessonIndex, "categoryIndex":categoryIndex, "sectionIndex":sectionIndex, "title":elements[0], "html":body}, sort_keys=True, indent=4, separators=(',', ': ')))
    print("File written")
    output.close()
    lessonIndex += 1
text.close()