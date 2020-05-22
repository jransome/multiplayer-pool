const ENGINE_DELTA_TIME_MS = 1000 / 60;

const TABLE_LENGTH = 1000;
const TABLE_WIDTH = 500;

const CUSHION_WIDTH = 20;
const CUSHION_BOX_WIDTH = 50; // for correct chamfering
const CUSHION_BOUNDARY_OFFSET = (CUSHION_BOX_WIDTH / 2) - CUSHION_WIDTH;
const CUSHION_CORNER_RADIUS = 40;
const SIDE_CUSHION_LENGTH = TABLE_LENGTH * 0.45;
const TOP_CUSHION_LENGTH = TABLE_WIDTH * 0.88;

const FORCE_MULTIPLYER = 120;

const CUE = 'cue';
const BLACK = 'black';
const RED = 'red';
const YELLOW = 'yellow'

const BALL_PROPERTIES = {
  CONSTANT_FRICTION_MULTIPLYER: 1.5,
  DYNAMIC_FRICTION_MULTIPLYER: 0.85,
  MAX_ANGULAR_SPEED: 0.3,
  ENGINE: {
    label: 'ball',
    friction: 0.3,
    frictionStatic: 0.1,
    frictionAir: 0,
    restitution: 0.65,
    density: 100,
  },
  COLOUR_MAP: {
    [CUE]: [0, 0, 90, 100], // All colours are HSV+A
    [BLACK]: [0, 0, 10, 100],
    [RED]: [0, 100, 100, 100],
    [YELLOW]: [52, 100, 100, 100],
  },
  RADIUS: 15,
  SINK_DURATION_FRAMES: 30 // @60 fps = 1/2 second
};

const POCKET_PROPERTIES = {
  ENGINE: {
    label: 'pocket',
    isStatic: true,
    isSensor: true,
  },
  COLOUR: [0, 0, 0],
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
