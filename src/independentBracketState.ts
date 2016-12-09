'use strict';
import BracketState from './bracketState';
import Settings from "./settings";
import BracketPair from "./bracketPair";
import * as assert from 'assert';

export default class IndependentBracketState implements BracketState {
    private readonly settings: Settings;
    private bracketColorIndexes: { [character: string]: number[]; } = {};
    private previousOpenBracketIndexes: { [character: string]: number; } = {};
    private previousBracketColor = "";

    constructor(
        settings: Settings,
        bracketColorIndexes?: { [character: string]: number[]; },
        previousOpenBracketIndexes?: { [character: string]: number; },
        previousBracketColor?: string) {

        // TODO Optional values are tightly coupled, should be all or nothing. Find a better way of doing this.
        assert((
            bracketColorIndexes !== undefined &&
            previousOpenBracketIndexes !== undefined &&
            previousBracketColor !== undefined)
            ||
            (
                bracketColorIndexes === undefined &&
                previousOpenBracketIndexes === undefined &&
                previousBracketColor === undefined));

        this.settings = settings;

        if (bracketColorIndexes !== undefined) {
            this.bracketColorIndexes = bracketColorIndexes;
        }
        else {
            this.settings.bracketPairs.forEach(bracketPair => {
                this.bracketColorIndexes[bracketPair.openCharacter] = [];
            });
        }

        if (previousOpenBracketIndexes !== undefined) {
            this.previousOpenBracketIndexes = previousOpenBracketIndexes;
        }
        else {
            this.settings.bracketPairs.forEach(bracketPair => {
                this.previousOpenBracketIndexes[bracketPair.openCharacter] = -1;
            });
        }

        if (previousBracketColor !== undefined) {
            this.previousBracketColor = previousBracketColor;
        }
    }

    deepCopy(): BracketState {
        let bracketColorIndexesCopy: { [character: string]: number[]; } = {};

        Object.keys(this.bracketColorIndexes).forEach(key => {
            bracketColorIndexesCopy[key] = this.bracketColorIndexes[key].slice();
        });

        let previousOpenBracketIndexesCopy: { [character: string]: number; } = {};

        Object.keys(this.previousOpenBracketIndexes).forEach(key => {
            previousOpenBracketIndexesCopy[key] = this.previousOpenBracketIndexes[key];
        });

        return new IndependentBracketState(
            this.settings,
            bracketColorIndexesCopy,
            previousOpenBracketIndexesCopy,
            this.previousBracketColor);
    }

    getColor(bracketPair: BracketPair): string {
        let colorIndex: number;
        if (this.settings.forceIterationColorCycle) {
            colorIndex = (this.previousOpenBracketIndexes[bracketPair.openCharacter] + 1) % bracketPair.colors.length;
        }
        else {
            colorIndex = this.bracketColorIndexes[bracketPair.openCharacter].length % bracketPair.colors.length;
        }

        let color = bracketPair.colors[colorIndex];

        if (this.settings.forceUniqueOpeningColor && color === this.previousBracketColor) {
            colorIndex = (colorIndex + 1) % bracketPair.colors.length;
            color = bracketPair.colors[colorIndex];
        }
        this.previousBracketColor = color;

        this.bracketColorIndexes[bracketPair.openCharacter].push(colorIndex);
        this.previousOpenBracketIndexes[bracketPair.orphanColor] = colorIndex;

        return color;
    };

    popColor(bracketPair: BracketPair): string {
        let colorIndex = this.bracketColorIndexes[bracketPair.openCharacter].pop();
        let color: string;
        if (colorIndex !== undefined) {
            color = bracketPair.colors[colorIndex];
        }
        else {
            color = bracketPair.orphanColor;
        }

        this.previousBracketColor = color;
        return color;
    }
}