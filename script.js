document.addEventListener("DOMContentLoaded", () => {
    const board = document.querySelector(".board");
    const logList = document.getElementById("log-list");
    const scoreField = document.getElementById("score");
    const timeField = document.getElementById("time");
    const scoreDisplay = document.getElementById("score-header");
    const timerDisplay = document.getElementById("timer");
    const newGameButton = document.getElementById("new-game");
    const revealAnswerButton = document.getElementById("reveal-answer");

    let timerInterval;
    let elapsedTime = 0;

    // function to reset the timer
    const resetTimer = () => {
        clearInterval(timerInterval);
        elapsedTime = 0;
        timeField.textContent = elapsedTime;
    };

    // function to start the timer
    const startTimer = () => {
        resetTimer();
        timerInterval = setInterval(() => {
            elapsedTime++;
            timeField.textContent = elapsedTime;
        }, 1000);
    };

    // function to send the elapsed time to the backend
    const sendElapsedTime = async () => {
        try {
            await fetch("http://127.0.0.1:5000/submit-time", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ elapsedTime }),
            });
        } catch (error) {
            console.error("Error sending elapsed time:", error);
        }
    };

    document.addEventListener("keydown", (event) => {
        console.log(`Key pressed: ${event.key}, Code: ${event.code}`);
    });

    // send click data to the backend
    const startNewGame = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/new-game-click", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
            const data = await response.json();
            console.log(data)
            // pass the new tile data to a function to update the score and the tiles
            updateScore(data.newScore);
            updateTiles(data.newTileData);
        } catch (error) {
            console.error("Error sending click data:", error);
        }
    };

    // event listener for "Start New Game"
    newGameButton.addEventListener("click", () => {
        clearTiles();
        startTimer();

        logList.innerHTML = ""; // clear log
        revealAnswerButton.style.display = "inline-block"; // show "Reveal Answer" button
        scoreDisplay.style.display = "inline-block"; // show "Score" field
        timerDisplay.style.display = "inline-block"; // show "Timer" field

        startNewGame();
    });

    // event listener for "Reveal Answer"
    revealAnswerButton.addEventListener("click", () => {
        revealAnswer();
    });

    // function to reveal the answer (mocked for now)
    const revealAnswer = () => {
        alert("Revealed answer (this functionality can be customized)");
        clearInterval(timerInterval);
        sendElapsedTime(); // send elapsed time
    };

    // function to clear all tiles
    const clearTiles = () => {
        board.innerHTML = "";
    };

    // function to handle a tile click
    const handleTileClick = (tileId) => {
        const timestamp = new Date().toLocaleTimeString();

        // log the click event
        const logItem = document.createElement("li");
        logItem.textContent = `Tile ${tileId} clicked at ${timestamp}`;
        logList.appendChild(logItem);

        // send data to backend
        sendClickData(tileId);
    };

    // send click data to the backend
    const sendClickData = async (tileId) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/tile-click", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tileId }),
            });
            const data = await response.json();

            // pass the new tile data to a function to update the score and the tiles
            updateScore(data.newScore);
            updateTiles(data.newTileData, data.setFound);
        } catch (error) {
            console.error("Error sending click data:", error);
        }
    };

    // function to update the tiles based on the backend array
    const updateTiles = (tileData, setFound) => {
        clearTiles(); // clear existing tiles

        tileData.forEach(([tileId, dotArray, tileSelected]) => {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.setAttribute("data-tile-id", tileId);

            if (tileSelected) {
                tile.style.backgroundColor = "white";
                tile.style.outlineWidth = "3px";
            } else {
                tile.style.backgroundColor = "white";
                tile.style.outlineWidth = "1px";

                if (setFound) {
                    tile.style.backgroundColor = "gray";
                }
            }

            const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
            const gridPositions = 6; // 6 dots for a 3x2 pattern
            
            console.log(tileId);
            for (let i = 0; i < gridPositions; i++) {
                const dot = document.createElement("div");
                dot.classList.add("dot");

                // randomize dot color
                console.log(dotArray[i+1])
                if (dotArray[i]) {
                    dot.style.backgroundColor = colors[i % colors.length];
                } else {
                    // make it "missing"
                    dot.style.backgroundColor = "transparent";
                    dot.style.borderColor = "transparent";
                }

                tile.appendChild(dot);
            }

            // add click event listener to the new tile
            tile.addEventListener("click", () => handleTileClick(tileId));

            // append tile to the board
            const row = getOrCreateRow(tileId); // group tiles into rows dynamically
            row.appendChild(tile);
        });
    };

    // utility to get or create a row for tiles
    const getOrCreateRow = (tileId) => {
        const rows = Array.from(board.querySelectorAll(".row"));
        const tilesPerRow = [2, 3, 2]; // Adjust based on layout

        if (rows.length === 0 || rows[rows.length - 1].childElementCount >= tilesPerRow[rows.length - 1]) {
            const newRow = document.createElement("div");
            newRow.classList.add("row");
            board.appendChild(newRow);
            return newRow;
        }

        return rows[rows.length - 1];
    };

    // function to update the score field
    const updateScore = (newScore) => {
        scoreField.textContent = newScore;
    };
    
    // initially clear board
    clearTiles();
});
