import React, { useEffect } from 'react';

/*
game: {
  walls: [],
  rooms: [
    room: {
      location: {x:0, y:0},
      size: {h:0, w:0},
      color: 'brown',
      revealedTreasure: false,
      revealedTraps: false,
      revealedDoors: false,
      furniture: [
        {location: {x:0, y:0}, imageSrc: 'src/string'}
      ],
      traps: [
        {location: {x:0, y:0}, imageSrc: 'src/string'}
      ],
      hiddenDoors: [
        {location: {x:0, y:0}, imageSrc: 'src/string'}
      ],
      treasureSearchResults: {
        location: {x:0, y:0}, imageSrc: 'src/string'
      },
      monsters: [
        {
          location: {x:0, y:0},
          imageSrc: 'src/string',
          name: 'goblin',
          stats: {
            health: 0,
            movement: 0,
            attack: 0,
            defense: 0,
            mind: 0,
          },
          effects: {},
        },
      ],
    },
  ],
  hallways: [
    hallway: {
      traps: [],
      monsters: [],
    }
  ],
  characters: [
    {
      location: {x:0, y:0},
      imageSrc: 'src/string',
      name: 'Joe',
      gold: 0,
      stats: {
        attack: 0,
        defense: 0,
        health: 0,
        mind: 0,
        movement: 0,
      },
      equipment: {
        weapon: {
          name: 'sword',
          range: 'adjacent' | 'adjacentWithDiagonals' | 'crossbow',
        },
        armor: {
          name: 'chainmail',
          movementModifier: 0,
          defenseModifier: 0,
        },
      },
      spells: {
        used: [],
        available: [],
      },
      effects: {},
    },
  ],
  npcs: [],
  doors: [],
  secretDoors: [],
  currentTurn: 'characterKey',
  activeMonsters: monsters[],
  currentQuest: {
    introduction: 'text',
    initialBoardState: Board{},
    questCompletionCriteria: [],
    rewards: [],
  },
}

turn order derived by: [...game.characters, ...game.activeMonsters],
*/

function Board() {

  const canvasRef: React.Ref<HTMLCanvasElement> = React.createRef();

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }
    const context = canvasRef.current.getContext('2d');
    context.fillStyle = 'red';
    context.fillRect(0, 0, 200, 100);
  });


  return (
    <div className="Board">
      { /* GAME AREA */ }
      { /* floor graphics - canvas */ }
      { /* highlighting layer - canvas */ }
      { /* z sorted characters, furniture, walls, effects - divs? canvas? */ }
      { /* HUD AREA */ }
      { /* stat details - div */ }
      { /* cards - div */ }
      { /* action menu - div */ }
      { /* messages - div */ }
      <canvas ref={canvasRef} width="800" height="600" />
    </div>
  );
}

export default Board;
