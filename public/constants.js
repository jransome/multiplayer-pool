const ENGINE_DELTA_TIME_MS = 1000 / 60;

const TABLE_LENGTH = 1000;
const TABLE_WIDTH = 500;

const CUSHION_WIDTH = 20;
const CUSHION_BOX_WIDTH = 50; // for correct chamfering
const CUSHION_BOUNDARY_OFFSET = (CUSHION_BOX_WIDTH / 2) - CUSHION_WIDTH;
const CUSHION_CORNER_RADIUS = 40;
const SIDE_CUSHION_LENGTH = TABLE_LENGTH * 0.45;
const TOP_CUSHION_LENGTH = TABLE_WIDTH * 0.88;

const FORCE_MULTIPLYER = 150;

const CUE = 'cue';
const BLACK = 'black';
const RED = 'red';
const YELLOW = 'yellow'

const BALL_PROPERTIES = {
  PHYSICS: {
    label: 'ball',
    friction: 0.3,
    frictionStatic: 0.1,
    frictionAir: 0,
    restitution: 0.7,
    density: 100,
  },
  COLOUR_MAP: {
    [CUE]: [250, 255, 225],
    [BLACK]: [15, 15, 15],
    [RED]: [255, 0, 0],
    [YELLOW]: [255, 220, 0],
  },
  RADIUS: 15,
  MAX_ANGULAR_SPEED: 0.3,
};

const POCKET_PROPERTIES = {
  PHYSICS: {
    label: 'pocket',
    isStatic: true,
    isSensor: true,
  },
  COLOUR: [30, 30, 30],
  VISIBLE_RADIUS: 30,
  COLLISION_RADIUS: 30 - (BALL_PROPERTIES.RADIUS * 0.9), // visible radius - ball radius
  POSITIONS: [
    { x: 8, y: 8 },
    { x: TABLE_LENGTH / 2, y: -8 },
    { x: TABLE_LENGTH - 8, y: 8 },
    { x: 8, y: TABLE_WIDTH - 8 },
    { x: TABLE_LENGTH / 2, y: TABLE_WIDTH + 8 },
    { x: TABLE_LENGTH - 8, y: TABLE_WIDTH - 8 },
  ],
};
