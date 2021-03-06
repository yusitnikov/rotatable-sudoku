import {RotatableDigit} from "./RotatableDigit";
import {isStartAngle, isUpsideDownAngle} from "../utils/rotation";
import {RotatableDigitCellDataComponentType} from "../components/RotatableDigitCellData";
import {Set} from "../../../types/struct/Set";
import {RotatableGameState, RotatableProcessedGameState} from "./RotatableGameState";
import {RotatableMainControls} from "../components/RotatableMainControls";
import {RotatableSecondaryControls} from "../components/RotatableSecondaryControls";
import {getCellDataSortIndexes} from "../../../components/sudoku/cell/CellDigits";
import {Position} from "../../../types/layout/Position";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {AnimationSpeed} from "../../../types/sudoku/AnimationSpeed";
import {CalculatorDigitComponentType} from "../../../components/sudoku/digit/CalculatorDigit";

const isRotatableDigit = (digit: number) => [6, 9].includes(digit);
const isRotatableCellData = ({digit, sticky}: RotatableDigit) => !sticky && isRotatableDigit(digit);

const toggleDigit = (data: RotatableDigit, upsideDown = true) =>
    upsideDown && isRotatableCellData(data) ? 15 - data.digit : data.digit;

export const RotatableDigitSudokuTypeManager: SudokuTypeManager<RotatableDigit, RotatableGameState, RotatableProcessedGameState> = {
    areSameCellData({digit, sticky = false}: RotatableDigit, {digit: digit2, sticky: sticky2 = false}: RotatableDigit) {
        return digit === digit2 && (sticky === sticky2 || !isRotatableDigit(digit));
    },

    compareCellData(data1: RotatableDigit, data2: RotatableDigit, upsideDown = false): number {
        return toggleDigit(data1, upsideDown) - toggleDigit(data2, upsideDown)
            || (data1.sticky ? 1 : 0) - (data2.sticky ? 1 : 0);
    },

    getCellDataHash(data: RotatableDigit): string {
        return `${data.digit}-${isRotatableCellData(data)}`;
    },

    cloneCellData(digit: RotatableDigit) {
        return {...digit};
    },

    createCellDataByDisplayDigit(digit: number, {isStickyMode}: RotatableGameState): RotatableDigit {
        return {
            digit,
            sticky: isStickyMode,
        };
    },

    createCellDataByTypedDigit(digit: number, {isStickyMode, angle}: RotatableGameState): RotatableDigit {
        const naiveResult: RotatableDigit = {
            digit,
            sticky: isStickyMode,
        };

        return {
            ...naiveResult,
            digit: toggleDigit(naiveResult, isUpsideDownAngle(angle))
        }
    },

    processCellDataPosition(
        basePosition: Position,
        dataSet: Set<RotatableDigit>,
        dataIndex: number,
        positionFunction: (index: number) => (Position | undefined),
        state?: RotatableProcessedGameState
    ): Position | undefined {
        const upsideDownIndexes = getCellDataSortIndexes<RotatableDigit>(
            dataSet,
            (a, b) =>
                toggleDigit(a) - toggleDigit(b) || (a.sticky ? 1 : 0) - (b.sticky ? 1 : 0),
            "sortUpsideDownIndexes"
        );

        const upsideDownPosition = positionFunction(upsideDownIndexes[dataIndex]);
        if (!upsideDownPosition) {
            return undefined;
        }

        const angleCoeff = Math.abs(((state?.animatedAngle || 0) % 360) / 180 - 1);
        const getAnimatedValue = (straight: number, upsideDown: number) =>
            straight * angleCoeff + upsideDown * (1 - angleCoeff);

        return {
            left: getAnimatedValue(basePosition.left, -upsideDownPosition.left),
            top: getAnimatedValue(basePosition.top, -upsideDownPosition.top),
        }
    },

    digitComponentType: CalculatorDigitComponentType,

    cellDataComponentType: RotatableDigitCellDataComponentType,

    initialGameStateExtension: {
        angle: -90,
        isStickyMode: false,
        animationSpeed: AnimationSpeed.regular,
    },

    isReady({angle}: RotatableGameState): boolean {
        return !isStartAngle(angle);
    },

    useProcessedGameStateExtension({angle, animationSpeed}: RotatableGameState): Omit<RotatableProcessedGameState, keyof RotatableGameState> {
        const animatedAngle = useAnimatedValue(angle, animationSpeed);

        return {animatedAngle};
    },

    getFieldAngle({animatedAngle}: RotatableProcessedGameState): number {
        return animatedAngle;
    },

    processArrowDirection(xDirection: number, yDirection: number, gameState?: RotatableGameState): [number, number] {
        const coeff = isUpsideDownAngle(gameState?.angle || 0) ? -1 : 1;

        return [coeff * xDirection, coeff * yDirection];
    },

    mainControlsCount: 2,

    mainControlsComponent: RotatableMainControls,

    secondaryControlsCount: 1,

    secondaryControlsComponent: RotatableSecondaryControls,
};
