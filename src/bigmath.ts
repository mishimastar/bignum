import { BigNum } from "./bignum";

export class BigMath {
    constructor(public divLimit = 1000) {}

    multiply(mult1: BigNum, mult2: BigNum): BigNum {
        let digitsAfterPoint = mult1.accuracy + mult2.accuracy;

        const multiplier: number[] = [];
        const base: number[] = [];
        mult1.value
            .replace('.', '')
            .replace('-', '')
            .split('')
            .map((val, i) => (base[i] = Number(val)));
        mult2.value
            .replace('.', '')
            .replace('-', '')
            .split('')
            .map((val, i) => (multiplier[i] = Number(val)));
        base.reverse();
        multiplier.reverse();

        const out: number[] = [];
        for (let j = 0; j < multiplier.length; j++) {
            const mult = multiplier[j]!;
            let vUme = 0;
            for (let i = 0; i < base.length; i++) {
                const razryad = base[i]!;
                const buf = razryad * mult + vUme + (out[i + j] || 0);

                vUme = Math.trunc(buf / 10);
                out[i + j] = buf % 10;
                if (vUme !== 0 && i === base.length - 1) out[i + j + 1] = vUme;
            }
        }

        if (!digitsAfterPoint) {
            while (out[out.length - 1] === 0) out.pop();
            const buf = mult1.negative !== mult2.negative ? `-${out.reverse().join('')}` : out.reverse().join('');
            return new BigNum(buf);
        } else {
            const outWithPointer: string[] = [];
            let cnt = 0;
            for (const digit of out) {
                if (cnt === digitsAfterPoint) outWithPointer.push('.');
                outWithPointer.push(String(digit));
                cnt++;
            }
            const buf =
                mult1.negative !== mult2.negative
                    ? `-${outWithPointer.reverse().join('')}`
                    : outWithPointer.reverse().join('');
            return new BigNum(buf);
        }
    }

    pow(basement: BigNum, exp: number): BigNum {
        if (exp < 0) throw new Error('exp must be natural');

        if (exp === 0) return new BigNum(1);
        if (exp === 1) return basement;
        let out = basement;
        for (let i = 2; i <= exp; i++) out = this.multiply(out, basement);
        return out;
    }

    compare(x: BigNum, y: BigNum): '=' | '<' | '>' {
        if (x.negative && !y.negative) return '<';
        if (!x.negative && y.negative) return '>';
        const xInt = x.value.indexOf('.') !== -1 ? x.value.slice(0, x.value.indexOf('.')) : x.value;
        const yInt = y.value.indexOf('.') !== -1 ? y.value.slice(0, y.value.indexOf('.')) : y.value;
        if (xInt.length > yInt.length) return '>';
        if (xInt.length < yInt.length) return '<';

        const xIntNum: number[] = [];
        const yIntNum: number[] = [];
        xInt.replace('.', '')
            .replace('-', '')
            .split('')
            .map((val, i) => (xIntNum[i] = Number(val)));
        yInt.replace('.', '')
            .replace('-', '')
            .split('')
            .map((val, i) => (yIntNum[i] = Number(val)));

        for (let i = 0; i < xIntNum.length; i++) {
            if (xIntNum[i]! > yIntNum[i]!) return '>';
            else if (xIntNum[i]! < yIntNum[i]!) return '<';
        }

        const xFract = x.value.indexOf('.') !== -1 ? x.value.slice(x.value.indexOf('.') + 1) : '0';
        const yFract = y.value.indexOf('.') !== -1 ? y.value.slice(y.value.indexOf('.') + 1) : '0';
        const xFractNum: number[] = [];
        const yFractNum: number[] = [];
        xFract
            .replace('.', '')
            .replace('-', '')
            .split('')
            .map((val, i) => (xFractNum[i] = Number(val)));
        yFract
            .replace('.', '')
            .replace('-', '')
            .split('')
            .map((val, i) => (yFractNum[i] = Number(val)));

        const maxFractLen = xFract.length >= yFract.length ? xFract.length : yFract.length;
        for (let i = 0; i < maxFractLen; i++) {
            if ((xFractNum[i] ?? 0) > (yFractNum[i] ?? 0)) return '>';
            else if ((xFractNum[i] ?? 0) < (yFractNum[i] ?? 0)) return '<';
        }

        return '=';
    }

    getNextInt(inp: BigNum): BigNum {
        if (inp.accuracy > 0) throw new Error('getNextInt works only with int');
        const base: number[] = [];
        String(inp.value)
            .split('')
            .map((val, i) => (base[i] = Number(val)));
        base.reverse();
        let targetIndex = 0;
        const lastDigit = base[0]! + 1;
        base[0] = lastDigit % 10;
        let vUme = Math.trunc(lastDigit / 10);
        while (vUme) {
            targetIndex++;
            const target = (base[targetIndex] || 0) + vUme;
            base[targetIndex] = target % 10;
            vUme = Math.trunc(target / 10);
        }

        return new BigNum(base.reverse().join(''));
    }

    factorial(inp: BigNum): BigNum {
        if (inp.value === '1') return inp;
        let out = new BigNum(1);
        let currentMul = new BigNum(1);
        while (this.compare(currentMul, inp) !== '=') {
            out = this.multiply(out, currentMul);
            currentMul = this.getNextInt(currentMul);
        }
        out = this.multiply(out, currentMul);
        return out;
    }

    sum(f: BigNum, s: BigNum): BigNum {
        let digitsAfterPoint = 0;
        if (f.value.includes('.')) digitsAfterPoint = Math.max(f.value.length - f.value.indexOf('.') - 1, digitsAfterPoint);
        if (s.value.includes('.')) digitsAfterPoint = Math.max(s.value.length - s.value.indexOf('.') - 1, digitsAfterPoint);

        let needMinus = false;
        if (f.negative && s.negative) needMinus = true;
        if (f.negative && !s.negative) return this.minus(f.invert(), s);
        if (!f.negative && s.negative) return this.minus(f, s.invert());

        const first: number[] = [];
        const second: number[] = [];
        String(f.value)
            .replace('.', '')
            .replace('-', '')
            .split('')
            .map((val, i) => (first[i] = Number(val)));
        String(s.value)
            .replace('.', '')
            .replace('-', '')
            .split('')
            .map((val, i) => (second[i] = Number(val)));

        for (let i = 0; i < digitsAfterPoint - (f.value.length - f.value.indexOf('.') - 1); i++) first.push(0);
        for (let i = 0; i < digitsAfterPoint - (s.value.length - s.value.indexOf('.') - 1); i++) second.push(0);

        first.reverse();
        second.reverse();

        const out: number[] = [];
        const maxBaseLen = second.length >= first.length ? second.length : first.length;

        let vUme = 0;
        for (let i = 0; i < maxBaseLen; i++) {
            const firstDigit = first[i] || 0;
            const secondDigit = second[i] || 0;
            const buf = secondDigit + firstDigit + vUme + (out[i] || 0);

            vUme = Math.trunc(buf / 10);
            out[i] = buf % 10;
            if (vUme !== 0 && i === maxBaseLen - 1) out[i + 1] = vUme;
        }

        if (!digitsAfterPoint) {
            const buf = needMinus ? '-' + out.reverse().join('') : out.reverse().join('');
            return new BigNum(buf);
        } else {
            const outWithPointer: string[] = [];
            let cnt = 0;
            for (const digit of out) {
                if (cnt === digitsAfterPoint) outWithPointer.push('.');
                outWithPointer.push(String(digit));
                cnt++;
            }
            const buf = needMinus ? '-' + outWithPointer.reverse().join('') : outWithPointer.reverse().join('');
            return new BigNum(buf);
        }
    }

    minus(f: BigNum, s: BigNum): BigNum {
        if (f.negative || s.negative) throw new Error('Cant minus with minus');
        let digitsAfterPoint = 0;
        let needMinus = false;
        if (f.value.includes('.')) digitsAfterPoint = Math.max(f.value.length - f.value.indexOf('.') - 1, digitsAfterPoint);
        if (s.value.includes('.')) digitsAfterPoint = Math.max(s.value.length - s.value.indexOf('.') - 1, digitsAfterPoint);
        const first: number[] = [];
        const second: number[] = [];

        switch (this.compare(f, s)) {
            case '<':
                needMinus = true;
                String(f.value)
                    .replace('.', '')
                    .replace('-', '')
                    .split('')
                    .map((val, i) => (second[i] = Number(val)));
                String(s.value)
                    .replace('.', '')
                    .replace('-', '')
                    .split('')
                    .map((val, i) => (first[i] = Number(val)));

                for (
                    let i = 0;
                    i <
                    digitsAfterPoint -
                        (f.value.length - (f.value.includes('.') ? f.value.indexOf('.') : f.value.length + 1) - 1);
                    i++
                )
                    second.push(0);
                for (
                    let i = 0;
                    i <
                    digitsAfterPoint -
                        (s.value.length - (s.value.includes('.') ? s.value.indexOf('.') : s.value.length + 1) - 1);
                    i++
                )
                    first.push(0);
                break;
            case '>':
                needMinus = false;
                String(f.value)
                    .replace('.', '')
                    .replace('-', '')
                    .split('')
                    .map((val, i) => (first[i] = Number(val)));
                String(s.value)
                    .replace('.', '')
                    .replace('-', '')
                    .split('')
                    .map((val, i) => (second[i] = Number(val)));

                // console.log(first);
                // console.log(second);
                if (f.value.includes('.'))
                    for (let i = 0; i < digitsAfterPoint - (f.value.length - f.value.indexOf('.') - 1); i++) first.push(0);
                else for (let i = 0; i < digitsAfterPoint; i++) first.push(0);
                if (s.value.includes('.'))
                    for (let i = 0; i < digitsAfterPoint - (s.value.length - s.value.indexOf('.') - 1); i++) second.push(0);
                else for (let i = 0; i < digitsAfterPoint; i++) second.push(0);
                // console.log(first);
                // console.log(second);
                break;
            case '=':
                return new BigNum();
        }

        first.reverse();
        second.reverse();

        const out: (number | string)[] = [];
        const maxBaseLen = second.length >= first.length ? second.length : first.length;

        let vUme = 0;
        for (let i = 0; i < maxBaseLen; i++) {
            const firstDigit = first[i] ?? 0;
            const secondDigit = second[i] ?? 0;
            let buf = 0;
            if (firstDigit - secondDigit - vUme < 0) {
                buf = firstDigit - secondDigit - vUme + 10;
                vUme = 1;
            } else {
                buf = firstDigit - secondDigit - vUme;
                vUme = 0;
            }
            out[i] = buf;
            if (vUme !== 0 && i === maxBaseLen - 1) {
                out[i + 1] = vUme;
                out[i + 2] = '-';
            }
        }

        if (!digitsAfterPoint) {
            const buf = needMinus ? '-' + out.reverse().join('') : out.reverse().join('');
            return new BigNum(buf);
        } else {
            const outWithPointer: string[] = [];
            let cnt = 0;
            for (const digit of out) {
                if (cnt === digitsAfterPoint) outWithPointer.push('.');
                outWithPointer.push(String(digit));
                cnt++;
            }
            const buf = needMinus ? '-' + outWithPointer.reverse().join('') : outWithPointer.reverse().join('');
            return new BigNum(buf);
        }
    }

    #foundClosestMultiplier(up: BigNum, down: BigNum) {
        let bufPrev = new BigNum();
        for (let j = 1; j <= 1000; j++) {
            const buf = this.multiply(down, new BigNum(j));
            const compareRes = this.compare(up, buf);
            // console.log('++++++', up, compareRes, buf, `(${down} * ${j})`);
            if (compareRes === '<') return { mult: j - 1, toMinus: bufPrev };
            if (compareRes === '=') return { mult: j, toMinus: buf };
            bufPrev = buf;
        }
        throw new Error('WHAT&&&');
    }

    #addZeroesAtStart = (str: string, out_len: number) => `${'0'.repeat(out_len - str.length)}${str}`;

    div(up: BigNum, down: BigNum): BigNum {
        // console.log('div', up, down);
        let digitsAfterPointUP = 0;
        let digitsAfterPointDOWN = 0;
        if (down.value.includes('.')) digitsAfterPointDOWN += down.value.length - down.value.indexOf('.') - 1;
        if (up.value.includes('.')) digitsAfterPointUP += up.value.length - up.value.indexOf('.') - 1;

        // console.log('digits after point in up:', digitsAfterPointUP);
        // console.log('digits after point in down:', digitsAfterPointDOWN);
        const dividend: number[] = [];
        const divider: number[] = [];
        String(up.value)
            .replace('.', '')
            .replace('-', '')
            .split('')
            .map((val, i) => (dividend[i] = Number(val)));
        String(down.value)
            .replace('.', '')
            .replace('-', '')
            .split('')
            .map((val, i) => (divider[i] = Number(val)));

        // console.log(dividend);
        // console.log(divider);

        for (let i = 0; i < digitsAfterPointDOWN; i++) dividend.push(0);
        for (let i = 0; i < digitsAfterPointUP; i++) divider.push(0);

        // console.log(dividend);
        // console.log(divider);

        const out: string[] = [];
        let inProcStart = 0;
        let inProcEnd = 1;

        let cnt = 0;
        while (cnt < this.divLimit && dividend.length) {
            if (inProcStart !== 0) throw new Error('inProcStart not 0');

            let inProc = dividend.slice(inProcStart, inProcEnd);
            // console.log('start and end', inProcStart, inProcEnd);
            // console.log('out in while:', out);
            // console.log('inProc', inProc);
            while (dividend[0] === 0) {
                // console.log('zero at divident start:', dividend);
                out.push('0');
                dividend.shift();
                // console.log('out firstZeroCheck:', out);
                // console.log('div firstZeroCheck:', dividend);
            }
            if (!dividend.length) break;
            // console.log('end and len', inProcEnd, dividend.length);
            if (inProcEnd > dividend.length) {
                // console.log('needComma');
                dividend.push(0);
                if (!out.includes('.')) out.push('.');
            }
            inProc = dividend.slice(inProcStart, inProcEnd);
            cnt++;
            const res = this.compare(new BigNum(inProc.join('')), new BigNum(divider.join('')));
            // console.log('=====', inProc, res, divider);
            switch (res) {
                case '<':
                    // console.log('needs to add razryad to dividend');
                    inProcEnd++;
                    out.push('0');
                    break;
                case '=':
                    // console.log(inProc, 'equals to', divider);
                    // console.log('dividend at first', dividend);
                    out.push('1');
                    for (let j = 0; j < divider.length; j++) dividend.shift();
                    // console.log('dividend at last', dividend, inProcStart, inProcEnd);
                    inProcEnd = 1;
                    break;
                case '>':
                    const inProcStr = inProc.join('');
                    const dividerStr = divider.join('');
                    const res = this.#foundClosestMultiplier(new BigNum(inProcStr), new BigNum(dividerStr));
                    // console.log(res);
                    out.push(String(res.mult));
                    let newInProcStr = this.minus(new BigNum(inProcStr), res.toMinus).value;
                    newInProcStr = this.#addZeroesAtStart(newInProcStr, inProcStr.length);
                    // console.log(newInProcStr, '=', inProcStr, '-', res.toMinus);
                    // console.log('before removeZeroes:', dividend, inProcStart, newInProcStr);
                    let cntr = inProcStart;
                    for (const digit of newInProcStr) {
                        dividend[cntr] = Number(digit);
                        cntr++;
                    }

                    // console.log('in the middle of removeZeroes:', dividend, newInProcStr);
                    let cntr2 = 0;
                    while (dividend[0] === 0 && cntr2 < inProcStr.length) {
                        dividend.shift();
                        cntr2++;
                    }

                    // console.log('cntr2', cntr2);

                    // console.log('after removeZeroes:', dividend, inProcStart);
                    if (cntr2 === inProcStr.length) inProcEnd = 1;
                    else inProcEnd = inProcStr.length - cntr2 + 1;
                    break;
                default:
                    break;
            }
        }
        while (out[0] === '0') out.shift();
        // if (out.includes('.')) {
        //     const lastSymbol = out[out.length - 1]!;
        //     let countLastSimillarSymbols = 1;
        //     let index = out.length - 1;
        //     while (true) {
        //         index--;
        //         if (out[index] !== lastSymbol) break;
        //         countLastSimillarSymbols++;
        //     }
        //     // console.log('repeated digits in easy period:', countLastSimillarSymbols);
        //     if (countLastSimillarSymbols > 50) for (let i = 0; i <= Math.trunc(countLastSimillarSymbols / 2); i++) out.pop();
        // }
        // console.log(dividend, '/', divider, 'result:', out[0] === '.' ? '0' + out.join('') : out.join(''), out.length);
        // console.log('div res', out[0] === '.' ? '0' + out.join('') : out.join(''));
        return new BigNum(out[0] === '.' ? '0' + out.join('') : out.join(''));
    }
}
