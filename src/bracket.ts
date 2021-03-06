import { Range } from "vscode";

export default class Bracket {
    public readonly range: Range;
    public readonly colorIndex: number;

    constructor(range: Range, colorIndex: number, pair?: Bracket) {
        this.range = range;
        this.colorIndex = colorIndex;
    }
}
