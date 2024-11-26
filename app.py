from flask import Flask, jsonify, request
from flask_cors import CORS
import random

# game-related constants
NUM_TILES_IN_DECK = 63
MAX_TILES_IN_PLAY = 7

NUM_DOTS = 6

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# global game-related data
score = 0
set_found = True
tiles_left = list(range(1, NUM_TILES_IN_DECK + 1))
random.shuffle(tiles_left)

tiles_in_play = [-1] * MAX_TILES_IN_PLAY
tiles_selected = [False] * MAX_TILES_IN_PLAY

# game logic functions
def reset_game():
    global score, set_found, tiles_left, tiles_in_play, tiles_selected

    score = 0
    set_found = True
    tiles_left = list(range(1, NUM_TILES_IN_DECK + 1))
    random.shuffle(tiles_left)

    tiles_in_play = [-1] * MAX_TILES_IN_PLAY
    tiles_selected = [False] * MAX_TILES_IN_PLAY

def valid_set(tiles_in_play, tile_inds):
    if len(tile_inds) == 0:
        return False
    
    result = 0
    for ind in tile_inds:
        result = result ^ tiles_in_play[ind]
    
    return result == 0

def update_tiles(tile_id):
    global score, set_found, tiles_left, tiles_in_play, tiles_selected

    if set_found:
        # get tile indices
        tile_inds = [ i for i in range(MAX_TILES_IN_PLAY) if tiles_selected[i] ]

        # update score
        score += len(tile_inds)

        # remove selected tiles from board
        for ind in tile_inds:
            tiles_in_play[ind] = -1
        
        for i in range(MAX_TILES_IN_PLAY):
            if len(tiles_left) == 0:
                break
            
            if tiles_in_play[i] == -1:
                tiles_in_play[i] = tiles_left.pop()
        
        tiles_selected = [False] * MAX_TILES_IN_PLAY
        set_found = False
    else:
        # update selected tiles and get tile indices
        tiles_selected[tile_id] = not tiles_selected[tile_id]
        tile_inds = [ i for i in range(MAX_TILES_IN_PLAY) if tiles_selected[i] ]
        
        # determine if a set was found
        set_found = valid_set(tiles_in_play, tile_inds)

def package_tile_data():
    global score, tiles_selected, tiles_in_play

    print(tiles_selected)
    print(tiles_in_play)

    tiles = []
    for tile_id in range(MAX_TILES_IN_PLAY):
        tiles.append([tile_id+1, [], tiles_selected[tile_id]])
    
    for tile_id in range(MAX_TILES_IN_PLAY):
        if tiles_in_play[tile_id] > 0:
            tile = tiles_in_play[tile_id]

            for dot in range(NUM_DOTS):
                tiles[tile_id][1].append(((tile >> dot) & 1) == 1)
        
        print(tiles[tile_id])
    
    return jsonify({"newScore": score, "newTileData": tiles})

@app.route("/new-game-click",  methods=["POST"])
def new_game_click():
    data = request.json
    reset_game()

    update_tiles(-1)
    score_tile_data = package_tile_data()

    return score_tile_data

@app.route("/tile-click", methods=["POST"])
def tile_click():
    data = request.json
    tile_id = int(data["tileId"]) - 1
    print(f"tile {tile_id} was clicked")

    update_tiles(tile_id)
    score_tile_data = package_tile_data()

    return score_tile_data

if __name__ == "__main__":
    app.run(debug=True)
