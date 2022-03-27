import {Absolute, AbsoluteProps} from "../../layout/absolute/Absolute";
import {CellState} from "../../../types/sudoku/CellState";
import {Digit, digitSpaceCoeff} from "../digit/Digit";
import {blueColor, cellBackgroundColors} from "../../app/globals";
import {Position} from "../../../types/layout/Position";

const centerDigitCoeff = 0.35;

const cornerDigitCoeff = 0.3;
const corners: Position[] = [
    {left: -1, top: -1},
    {left: 1, top: -1},
    {left: -1, top: 1},
    {left: 1, top: 1},
    {left: 0, top: -1},
    {left: 0, top: 1},
    {left: -1, top: 0},
    {left: 1, top: 0},
    {left: 0, top: 0},
];

export interface CellContentProps extends Omit<AbsoluteProps, "width" | "height" | "angle"> {
    data: CellState;
    size: number;
    sudokuAngle?: number;
    mainColor?: boolean;
}

export const CellContent = ({data, size, sudokuAngle = 0, mainColor, style, ...containerProps}: CellContentProps) => {
    const rotatableDigitColor = mainColor ? undefined : "#00f";
    const stickyDigitColor = mainColor ? undefined : "#0c0";

    const {
        initialDigit,
        usersDigit,
        centerDigits = [],
        cornerDigits = [],
        colors = []
    } = data;

    const centerDigitsCoeff = centerDigitCoeff / Math.max(1, centerDigitCoeff * digitSpaceCoeff * (centerDigits.length + 1));

    return <Absolute
        width={size}
        height={size}
        style={{
            backgroundColor: colors.length ? cellBackgroundColors[colors[0]] : undefined,
            ...style,
        }}
        {...containerProps}
    >
        <Absolute left={size / 2} top={size / 2}>
            {initialDigit && <Digit
                key={"initial"}
                digit={initialDigit.digit}
                size={size * 0.7}
            />}

            {usersDigit && <Digit
                key={"users"}
                digit={usersDigit.digit}
                size={size * 0.7}
                color={usersDigit.sticky ? stickyDigitColor : rotatableDigitColor}
            />}

            {centerDigits.map(({digit, sticky}, index) => <Digit
                key={`center-${digit}-${sticky}`}
                digit={digit}
                size={size * centerDigitsCoeff}
                left={size * centerDigitsCoeff * digitSpaceCoeff * (index - (centerDigits.length - 1) / 2)}
                color={sticky ? stickyDigitColor : rotatableDigitColor}
            />)}

            {cornerDigits.map(({digit, sticky}, index) => corners[index] && <Digit
                key={`corner-${digit}-${sticky}`}
                digit={digit}
                size={size * cornerDigitCoeff}
                left={size * corners[index].left * (0.45 - cornerDigitCoeff * 0.5)}
                top={size * corners[index].top * (0.45 - cornerDigitCoeff * 0.5)}
                color={sticky ? stickyDigitColor : rotatableDigitColor}
            />)}
        </Absolute>

        {colors.length > 1 && <Absolute tagName={"svg"} width={size} height={size}>
            {colors.map((color, index) => !!index && <polygon
                key={index}
                points={
                    [
                        [0, index - 0.5],
                        [1, index - 0.5],
                        [1, index],
                        [1, index + 0.5]
                    ]
                        .map(([y, i]) => [y * size * 2, Math.PI * (2 * i / colors.length - 0.25)])
                        .map(([y, a]) => [
                            size / 2 + y * Math.cos(a),
                            size / 2 + y * Math.sin(a),
                        ])
                        .map(([x, y]) => `${x},${y}`)
                        .join(" ")
                }
                fill={cellBackgroundColors[color]}
            />)}
        </Absolute>}
    </Absolute>;
};