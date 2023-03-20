export class BigNum {
    value: string;
    accuracy: number = 0;
    negative: boolean = false;

    constructor(value?: string | number);
    // constructor(integer: number[], fractional: number[], negative: boolean);
    constructor(v1: string | number | undefined ) {
        // console.log('value', value);
        if (typeof v1 === 'undefined') this.value = '0';
        else if (typeof v1 === 'number') this.value = String(v1);
        else if (/^[+-]?([0-9]*[.])?[0-9]+$/.test(v1)) this.value = v1;
        else throw new Error(`Bad input value! ${v1}`);

        if (this.value.includes('.')) this.accuracy = this.value.length - this.value.indexOf('.') - 1;
        if (this.value.includes('-')) this.negative = true;
    }

    invert(): this {
        this.negative = !this.negative;
        return this;
    }
}