document.addEventListener("DOMContentLoaded", () => {
    const tiles = document.querySelectorAll(".tile");
    const logList = document.getElementById("log-list");

    // Helper function to generate random dots on a tile
    const createDots = (tile) => {
        const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
        const positions = [
            { top: "10%", left: "10%" },
            { top: "10%", left: "50%" },
            { top: "10%", left: "90%" },
            { top: "50%", left: "10%" },
            { top: "50%", left: "50%" },
            { top: "50%", left: "90%" },
        ];

        const selectedDots = Math.floor(Math.random() * 6) + 1; // Random number of dots (1-6)

        for (let i = 0; i < selectedDots; i++) {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            dot.style.backgroundColor = colors[i];
            dot.style.position = "absolute";
            dot.style.top = positions[i].top;
            dot.style.left = positions[i].left;
            tile.appendChild(dot);
        }
    };

    // Generate dots on all tiles
    tiles.forEach((tile) => createDots(tile));

    // Add click event listener to each tile
    tiles.forEach((tile) => {
        tile.addEventListener("click", () => {
            const tileId = tile.getAttribute("data-tile-id");
            const timestamp = new Date().toLocaleTimeString();

            // Log the click event
            const logItem = document.createElement("li");
            logItem.textContent = `Tile ${tileId} clicked at ${timestamp}`;
            logList.appendChild(logItem);
        });
    });
});
