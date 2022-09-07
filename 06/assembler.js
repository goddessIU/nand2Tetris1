const fs = require('fs');
const path = require('path');

class Utils {
    static toBinary(num) {
        let res = [];
        let t = +num;
        while (t) {
            res.push(t % 2);
            t = Math.floor(t / 2);
        }
        return res.reverse().join('');
    }
}

class Parser {
    lines = '';
    linesWithoutSpace = [];
    fileName = '';
    relativePath = '';
    programs = '';
    filePath = '';

    main(fileName) {
        this.filePath = fileName;
        this.read(fileName);
        this.whiteSpace();
        this.linesWithoutSpace = this.translate();
        this.code();
        this.write();
    }

    read(fileName) {
        this.fileName = path.basename(fileName).split('.')[0];
        const filePath = path.resolve(__dirname, fileName);
        const data = fs.readFileSync(filePath, 'utf-8');
        this.lines = data.split(/\r?\n/);
    }

    // deal with white space
    whiteSpace() {
        this.lines.forEach((line) => {
            if (line !== '' && line.slice(0, 2) !== '//') {
                line = line.split('//')[0].trim();
                this.linesWithoutSpace.push(line);
            }
        });
    }

    // translator to assembly language
    translate() {
        const translator = new Translator();
        return translator.main(this.linesWithoutSpace);
    }

    // translate to binary code
    code() {
        const code = new Code();
        const instructions =  code.translateInstruction(this.linesWithoutSpace);
        this.programs = instructions.join('\n');
    }

    write() {
        const filePath = path.dirname(this.filePath) + '/' + this.fileName + '.hack';
        fs.writeFileSync(filePath, this.programs);
    }

    
}

class Translator {
    constructor() {
        this.SymbolMap = new Map([
            ['R0', '0'],
            ['R1', '1'],
            ['R2', '2'],
            ['R3', '3'],
            ['R4', '4'],
            ['R5', '5'],
            ['R6', '6'],
            ['R7', '7'],
            ['R8', '8'],
            ['R9', '9'],
            ['R10', '10'],
            ['R11', '11'],
            ['R12', '12'],
            ['R13', '13'],
            ['R14', '14'],
            ['R15', '15'],
            ['SCREEN', '16384'],
            ['KBD', '24576'],
            ['SP', '0'],
            ['LCL', '1'],
            ['ARG', '2'],
            ['THIS', '3'],
            ['THAT', '4']
        ]);
        this.VarMap = new Map();
        this.LabelMap = new Map();
    }

    main(lines) {
        this.firstPass(lines);
        this.secondPass(lines);
        return this.translate(lines);
    }

    translate(lines) {
        const res = [];
        for (const line of lines) {
            if (line.startsWith('@')) {
                const label = line.slice(1);
                if (this.LabelMap.has(label)) {
                    res.push('@' + this.LabelMap.get(label));
                } else if (this.VarMap.has(label)) {    
                    res.push('@' + this.VarMap.get(label));
                } else if (this.SymbolMap.has(label)) {
                    res.push('@' + this.SymbolMap.get(label));
                } else {
                    res.push(line);
                }
            } else if (line.startsWith('(') && line.endsWith(')')) {
                continue;
            } else {
                res.push(line);
            }
        }

        return res;
    }

    firstPass(lines) {
        let num = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('(') && line.endsWith(')')) {
                const label = line.slice(1, line.length - 1);
                if (!this.LabelMap.has(label)) {
                    this.LabelMap.set(label, '' + num);
                }
            } else {
                num++;
            }
        }
    }

    secondPass(lines) {
        let storage = 16;
        for (const line of lines) {
            if (line.startsWith('@') && isNaN(line.slice(1)) && !this.SymbolMap.has(line.slice(1)) && !this.VarMap.has(line.slice(1)) && !this.LabelMap.has(line.slice(1))) {
                this.VarMap.set(line.slice(1), '' + storage);
                storage++;
            }
        }
    }
}

class Code {
    translateInstruction(instructions) {
        const finalRes = [];
        for (const instruction of instructions) {
            let res = [];
            if (instruction.startsWith('@')) {
                const c = Utils.toBinary(instruction.slice(1));
                finalRes.push('0'.repeat(16 - c.length) + c);
            } else {
                const equalIndex = instruction.indexOf('=');
                const simicolon = instruction.indexOf(';');
                let dest, comp, jump;
                if (equalIndex >= 0 && simicolon >= 0) {
                    dest = instruction.slice(0, equalIndex);
                    comp = instruction.slice(equalIndex + 1, simicolon);
                    jump = instruction.slice(simicolon + 1, instruction.length);
                } else if (equalIndex >= 0) {
                    dest = instruction.slice(0, equalIndex);
                    comp = instruction.slice(equalIndex + 1, instruction.length);
                } else if (simicolon >= 0) {
                    comp = instruction.slice(0, simicolon);
                    jump = instruction.slice(simicolon + 1, instruction.length);
                }
                res = ['111'];
                if (comp === '0') {
                    res.push('0101010');
                } else if (comp === '1') {
                    res.push('0111111');
                } else if (comp === '-1') {
                    res.push('0111010');
                } else if (comp === 'D') {
                    res.push('0001100');
                } else if (comp === 'A') {
                    res.push('0110000');
                } else if (comp === '!D') {
                    res.push('0001101');
                } else if (comp === '!A') {
                    res.push('0110001');
                } else if (comp === '-D') {
                    res.push('0001111');
                } else if (comp === '-A') {
                    res.push('0110011');
                } else if (comp === 'D+1') {
                    res.push('0011111');
                } else if (comp === 'A+1') {
                    res.push('0110111');
                } else if (comp === 'D-1') {
                    res.push('0001110');
                } else if (comp === 'A-1') {
                    res.push('0110010');
                } else if (comp === 'D+A') {
                    res.push('0000010');
                } else if (comp === 'D-A') {
                    res.push('0010011');
                } else if (comp === 'A-D') {
                    res.push('0000111');
                } else if (comp === 'D&A') {
                    res.push('0000000');
                } else if (comp === 'D|A') {
                    res.push('0010101');
                } else if (comp === 'M') {
                    res.push('1110000');
                } else if (comp === '!M') {
                    res.push('1110001');
                } else if (comp === '-M') {
                    res.push('1110011');
                } else if (comp === 'M+1') {
                    res.push('1110111');
                } else if (comp === 'M-1') {
                    res.push('1110010');
                } else if (comp === 'D+M') {
                    res.push('1000010');
                } else if (comp === 'D-M') {
                    res.push('1010011');
                } else if (comp === 'M-D') {
                    res.push('1000111');
                } else if (comp === 'D&M') {
                    res.push('1000000');
                } else if (comp === 'D|M') {
                    res.push('1010101');
                }

                if (dest === '' || dest === undefined) {
                    res.push('000');
                } else if (dest === 'M') {
                    res.push('001');
                } else if (dest === 'D') {
                    res.push('010');
                } else if (dest === 'MD') {
                    res.push('011');
                } else if (dest === 'A') {
                    res.push('100');
                } else if (dest === 'AM') {
                    res.push('101');
                } else if (dest === 'AD') {
                    res.push('110');
                } else if (dest === 'AMD') {
                    res.push('111');
                }

                if (jump === '' || jump === undefined) {
                    res.push('000');
                } else if (jump === 'JGT') {
                    res.push('001');
                } else if (jump === 'JEQ') {
                    res.push('010');
                } else if (jump === 'JGE') {
                    res.push('011');
                } else if (jump === 'JLT') {
                    res.push('100');
                } else if (jump === 'JNE') {
                    res.push('101');
                } else if (jump === 'JLE') {
                    res.push('110');
                } else if (jump === 'JMP') {
                    res.push('111');
                }
                finalRes.push(res.join(''));
            }
        }
        return finalRes;
    }
}

const filePathName = process.argv[2];
const parser = new Parser();
parser.main(filePathName);