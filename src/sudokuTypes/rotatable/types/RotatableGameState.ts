import {AnimationSpeed} from "../../../types/sudoku/AnimationSpeed";

export interface RotatableGameState {
    angle: number;
    isStickyMode: boolean;
    animationSpeed: AnimationSpeed;
}

export interface RotatableProcessedGameState extends RotatableGameState {
    animatedAngle: number;
}
