from enum import Enum

# returns (accessKeyId, secretKey)
# currently only accepts valid input
# TO-DO handle other forms of input
def getCredentials(): 
    accessKeyId = input('Enter your AWS access key id: ')
    secretKey = input('Enter your AWS secret key: ')
    return accessKeyId, secretKey

def createClients(): 
    return

def startCapture(): 
    print('capturing')
    return

def startReplay(): 
    print('replaying')
    return

def analyze(): 
    print('analyzing')
    return

def stop(): 
    return

options = {1 : startCapture, 
           2 : startReplay, 
           3 : analyze, 
           4 : stop
}

def chooseOption(): 
    option = int(input("""Please choose one of the following operations: 
    1 - Capture
    2 - Replay
    3 - Analyze 
    4 - Exit\n"""))
    return option

getCredentials()
x = 0

while (x != 4): 
    x = chooseOption()
    options[x]()
    
print('Goodbye')
