export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 10,
            height: 10
        },
    };

    const observers = [];

    function subscribe(observerFunction) {
        observers.push(observerFunction)
    }

    function notifyAll(command) {
        console.log(`Notifying ${observers.length} observers`);
        for(const observerFunction of observers) {
            observerFunction(command);
        };
    }

    function setState(newState) {
        Object.assign(state, newState);
    }

    function addPlayer(command) {
        const playerId = command.playerId;
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width);
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height);

        state.players[playerId] = {
            x: playerX,
            y: playerY,
        };

        notifyAll({
            type: 'add-player',
            playerId,
            playerX,
            playerY,
        });
    }

    function removePlayer(command) {
        const playerId = command.playerId;

        delete state.players[playerId];

        notifyAll({
            type: 'remove-player',
            playerId,
        });
    }

    function start() {
        const frequency = 2000;

        setInterval(addFruit, frequency);
    }
    
    function addFruit(command) {
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 1000000);
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width);
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height);

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY,
        };

        notifyAll({
            type: 'add-fruit',
            fruitId,
            fruitX,
            fruitY,
        });
    }

    function removeFruit(command) {
        const fruitId = command.fruitId;

        delete state.fruits[fruitId];

        notifyAll({
            type: 'remove-fruit',
            fruitId,
        });
    }
    
    function movePlayer(command) {
        console.log(`game.movePlayer() -> Trying to move ${command.playerId} with ${command.keyPressed}`);
        notifyAll(command);
        
        const acceptedMoves = {
            ArrowUp(player) {
                console.log('Moving player Up');
                player.y = Math.max(player.y-1, 0);
            },
            ArrowDown(player) {
                console.log('Moving player Down');
                player.y = Math.min(player.y+1, state.screen.height-1);
            },
            ArrowRight(player) {
                console.log('Moving player Right');
                player.x = Math.min(player.x+1, state.screen.width-1);
            },
            ArrowLeft(player) {
                console.log('Moving player Left');
                player.x = Math.max(player.x-1, 0);
            }
        }

        const keyPressed = command.keyPressed;
        const playerId = command.playerId;
        const player = state.players[playerId];
        const moveFunction = acceptedMoves[keyPressed];

        if(player && moveFunction) {
            moveFunction(player);
            checkForFruitCollision(playerId);
        }
    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId];

        for(const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId];
            console.log(`Checking ${playerId} and ${fruitId}`)

            if(player.x === fruit.x && player.y === fruit.y) {
                removeFruit({ fruitId: fruitId });
                console.log(`COLLISION between ${playerId} and ${fruitId}`)
            }
        }
    }

    return {
        movePlayer,
        state,
        setState,
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        subscribe,
        start,
    };
}