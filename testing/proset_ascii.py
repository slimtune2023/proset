import random

NUM_CARDS_IN_DECK = 63
MAX_CARDS_IN_PLAY = 7

cards_left = list(range(1, NUM_CARDS_IN_DECK + 1))
random.shuffle(cards_left)

cards_in_play = [-1] * MAX_CARDS_IN_PLAY

def valid_set(cards_in_play, inds):
    if len(inds) == 0:
        return False
    
    result = 0
    for ind in inds:
        result = result ^ cards_in_play[ind]
    
    return result == 0

def card_to_str(card):
    if card == -1:
        return '-' * 6
    return '{0:06b}'.format(card)

while len(cards_left) > 0:
    for i in range(MAX_CARDS_IN_PLAY):
        if len(cards_left) == 0:
            break
        
        if cards_in_play[i] == -1:
            cards_in_play[i] = cards_left.pop()
    
    for i in range(MAX_CARDS_IN_PLAY):
        print(f"{cards_in_play[i]}: " + card_to_str(cards_in_play[i]))
    
    print()
    while True:
        x = input("choose set: ")
        inds = [int(n) for n in x.split(" ")]

        if (valid_set(cards_in_play, inds)):
            break
    
    print("correct!\n")

    for ind in inds:
        cards_in_play[ind] = -1