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

    // Function to reset the timer
    const resetTimer = () => {
        clearInterval(timerInterval);
        elapsedTime = 0;
        timeField.textContent = elapsedTime;
    };

    // Function to start the timer
    const startTimer = () => {
        resetTimer();
        timerInterval = setInterval(() => {
            elapsedTime++;
            timeField.textContent = elapsedTime;
        }, 1000);
    };

    // Function to send the elapsed time to the backend
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

    // Send click data to the backend
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

    // Event listener for "Start New Game"
    newGameButton.addEventListener("click", () => {
        clearTiles();
        // createTiles();
        startTimer();
        logList.innerHTML = ""; // Clear log
        revealAnswerButton.style.display = "inline-block"; // Show "Reveal Answer" button
        scoreDisplay.style.display = "inline-block"; // Show "Score" field
        timerDisplay.style.display = "inline-block"; // Show "Timer" field

        startNewGame();
    });

    // Event listener for "Reveal Answer"
    revealAnswerButton.addEventListener("click", () => {
        revealAnswer();
    });

    // Function to reveal the answer (mocked for now)
    const revealAnswer = () => {
        alert("Revealed answer (this functionality can be customized)");
        clearInterval(timerInterval);
        sendElapsedTime(); // Send elapsed time
    };

    // Function to clear all tiles
    const clearTiles = () => {
        board.innerHTML = "";
    };

    // Function to generate tiles dynamically
    const createTiles = () => {
        const tileIds = [1, 2, 3, 4, 5, 6, 7]; // Update IDs if needed

        const rows = [
            [tileIds[0], tileIds[1]],
            [tileIds[2], tileIds[3], tileIds[4]],
            [tileIds[5], tileIds[6]],
        ];

        rows.forEach((rowTiles) => {
            const rowDiv = document.createElement("div");
            rowDiv.classList.add("row");

            rowTiles.forEach((tileId) => {
                const tile = document.createElement("div");
                tile.classList.add("tile");
                tile.setAttribute("data-tile-id", tileId);

                // createDots(tile); // Add dots to the tile
                rowDiv.appendChild(tile);

                // Add click event listener to the tile
                tile.addEventListener("click", () => handleTileClick(tileId));
            });

            board.appendChild(rowDiv);
        });
    };

    // Function to generate dots in a 3x2 pattern
    const createDots = (tile) => {
        const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
        const gridPositions = 6; // 6 dots for a 3x2 pattern

        for (let i = 0; i < gridPositions; i++) {
            const dot = document.createElement("div");
            dot.classList.add("dot");

            // Randomize dot color
            if (Math.random() > 0.5) {
                dot.style.backgroundColor = colors[i % colors.length];
            } else {
                // Make it "missing"
                dot.style.backgroundColor = "transparent";
                dot.style.borderColor = "transparent";
            }

            tile.appendChild(dot);
        }
    };

    // Function to handle a tile click
    const handleTileClick = (tileId) => {
        const timestamp = new Date().toLocaleTimeString();

        // Log the click event
        const logItem = document.createElement("li");
        logItem.textContent = `Tile ${tileId} clicked at ${timestamp}`;
        logList.appendChild(logItem);

        // Send data to backend
        sendClickData(tileId);
    };

    // Send click data to the backend
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
            updateTiles(data.newTileData);
        } catch (error) {
            console.error("Error sending click data:", error);
        }
    };

    // Function to update the tiles based on the backend array
    const updateTiles = (tileData) => {
        clearTiles(); // Clear existing tiles

        tileData.forEach(([tileId, dotArray, tileSelected]) => {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.setAttribute("data-tile-id", tileId);

            if (tileSelected) {
                tile.style.backgroundColor = "gray";
            } else {
                tile.style.backgroundColor = "white";
            }

            const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
            const gridPositions = 6; // 6 dots for a 3x2 pattern
            
            console.log(tileId);
            for (let i = 0; i < gridPositions; i++) {
                const dot = document.createElement("div");
                dot.classList.add("dot");

                // Randomize dot color
                console.log(dotArray[i+1])
                if (dotArray[i]) {
                    dot.style.backgroundColor = colors[i % colors.length];
                } else {
                    // Make it "missing"
                    dot.style.backgroundColor = "transparent";
                    dot.style.borderColor = "transparent";
                }

                tile.appendChild(dot);
            }

            // Add click event listener to the new tile
            tile.addEventListener("click", () => handleTileClick(tileId));

            // Append tile to the board
            const row = getOrCreateRow(tileId); // Group tiles into rows dynamically
            row.appendChild(tile);
        });
    };

    // Utility to get or create a row for tiles
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

    // Function to update the score field
    const updateScore = (newScore) => {
        scoreField.textContent = newScore;
    };



    // Initial tile generation
    clearTiles();
    // createTiles();
});
