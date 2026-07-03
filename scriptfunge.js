const RunButtonS = document.getElementById("runS");
const RunButtonF = document.getElementById("runF");
let executionSpeed = 5;
const DebugMode = document.getElementById("DebugMode");
let out = document.getElementById("out");
let test = document.getElementById("test");
const SaveButton = document.getElementById("SaveButton");

let grid = document.getElementById('grid'); //grille de saisie du code
let Debug = 0;
let tim = 0;

function safePop(stack) { // evite d'avoir une pile vide voir "plus que vide", conformement au befunge 93
    if (stack.length === 0) {
        return 0;
    }
    return stack.pop();
}

for (let j = 0; j < 25; j++) { //création de la grille de 2000 case
    for (let i = 0; i < 80; i++) {
        let cell = document.createElement('input');
        cell.type = 'text';
        cell.maxLength = 1;
        cell.size = 1;
        cell.id = "cell" + i + '_' + j;
        grid.appendChild(cell);
    }
    let br = document.createElement('br');
    grid.appendChild(br);

}

let mgrid = []; //declaration globale de la grille (le tableau sur lequel on eeffectue les)


document.addEventListener('keydown', function (event) { //fonctio permetant de se deplacé sur la grille avec les fleche pour saisir le code plus simplement
    if (!document.activeElement.id.includes('cell')) return;
    const currentInput = document.activeElement;
    let split = document.activeElement.id.split('_');
    let i = parseInt(split[0].replace('cell', ''));
    let j = parseInt(split[1]);
    let dir;
    switch (event.key) {
        case "ArrowLeft":
            dir = '<';
            break;
        case "ArrowRight":
            dir = '>';
            break;
        case "ArrowUp":
            dir = '^';
            break;
        case "ArrowDown":
            dir = 'v';
            break;
        default:
            return;
    }
    let newco = moove(i, j, dir);
    i = newco.newI;
    j = newco.newJ;
    document.getElementById("cell" + i + "_" + j).focus();
})

function deb() { //fonction d'écoute de l'entrer pour le mode debug
    return new Promise(function (resolve) {
        function waitE(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                document.removeEventListener("keydown", waitE);
                resolve();
            }
        }
        document.addEventListener("keydown", waitE);
    });
}

DebugMode.addEventListener("click", function () {
    Debug = !Debug;
    if (Debug) {
        lancerInterpreteur();
    }
})

RunButtonS.addEventListener("click", function () {
    executionSpeed = 50;
    if (Debug) {
        DebugMode.click();
    }
    lancerInterpreteur();
});
RunButtonF.addEventListener("click", function () {
    executionSpeed = 1;
    if (Debug) {
        DebugMode.click();
    }
    lancerInterpreteur();
});

async function lancerInterpreteur() { // fonction d'éxecution du programmme Befunge (l'interpreteur en lui meme et quelques fiuritures)
    mgrid = [];
    out.textContent += '\n';
    out.scrollTop = out.scrollHeight;
    for (let j = 0; j < 25; j++) { //lecgture de la grille
        let currentLine = [];
        for (let i = 0; i < 80; i++) {
            let targetId = "cell" + i + "_" + j;
            let inputElement = document.getElementById(targetId);
            let char = inputElement.value;
            if (char == "") {
                char = " ";
            }
            currentLine.push(char);
        }
        mgrid.push(currentLine);
    }
    var stack = new Array(); // la pile, BeFunge étant un langage à pile
    var output = new Array();
    let dir = '>';
    let i = 0; let j = 0;
    while (mgrid[j][i] !== '@') { //boucle d'éxécution
        let cellId = "cell" + i + "_" + j;
        document.getElementById(cellId).style.backgroundColor = "red";
        if (Debug) {
            await deb();
        } else {
            await sleep(executionSpeed);
        }
        document.getElementById(cellId).style.backgroundColor = "white";
        let actcase = mgrid[j][i];
        let newco;
        if (Debug) { out.textContent += actcase; }
        out.scrollTop = out.scrollHeight;
        if (mgrid[j][i] == ">" || mgrid[j][i] == "<" || mgrid[j][i] == "v" || mgrid[j][i] == "^") {
            dir = mgrid[j][i];
        } else if (actcase.charCodeAt(0) > 47 && actcase.charCodeAt(0) < 58) {
            stack.push(parseInt(actcase));
        }
        switch (actcase) {
            case '+':
                stack.push(add(safePop(stack), safePop(stack)));
                break;
            case '-':
                stack.push(sub(safePop(stack), safePop(stack)));
                break;
            case '*':
                stack.push(mul(safePop(stack), safePop(stack)));
                break;
            case '/':
                stack.push(div(safePop(stack), safePop(stack)));
                break;
            case '%':
                stack.push(mod(safePop(stack), safePop(stack)));
                break;
            case '!':
                stack.push(not(safePop(stack)));
                break;
            case '`':
                stack.push(GreaterThan(safePop(stack), safePop(stack)));
                break;
            case '?':
                dir = RandDir();
                break;
            case '_':
                dir = HorIf(safePop(stack));
                break;
            case '|':
                dir = VerIf(safePop(stack));
                break;
            case '"':
                newco = moove(i, j, dir);
                i = newco.newI;
                j = newco.newJ;
                actcase = mgrid[j][i];
                do {
                    let cellId = "cell" + i + "_" + j;
                    document.getElementById(cellId).style.backgroundColor = "red";
                    if (Debug) {
                        await deb();
                    } else {
                        await sleep(executionSpeed);
                    }
                    document.getElementById(cellId).style.backgroundColor = "white";
                    stack.push(actcase.charCodeAt(0))
                    newco = moove(i, j, dir);
                    if (Debug) { out.textContent += actcase; }
                    out.scrollTop = out.scrollHeight;
                    i = newco.newI;
                    j = newco.newJ;
                    actcase = mgrid[j][i];
                } while (actcase != '"')
                break;
            case ':': {
                let a = safePop(stack);
                stack.push(a); stack.push(a);
                break;
            }
            case '\\': {
                let a = safePop(stack);
                let b = safePop(stack);
                stack.push(a); stack.push(b);
                break;
            }
            case '$':
                safePop(stack);
                break;
            case '.':
                output.push(safePop(stack));
                break;
            case ',':
                output.push(String.fromCharCode(safePop(stack)));
                break;
            case '#':
                newco = moove(i, j, dir);
                i = newco.newI;
                j = newco.newJ;
                break;
            case 'g': {
                let y = safePop(stack);
                let x = safePop(stack);
                if (x >= 0 && x < 80 && y >= 0 && y < 25) {
                    stack.push(mgrid[y][x].charCodeAt(0));
                } else {
                    stack.push(0);
                }
                break;
            }
            case 'p': {
                let v = safePop(stack);
                let y = safePop(stack);
                let x = safePop(stack);
                if (x >= 0 && x < 80 && y >= 0 && y < 25) {
                    mgrid[y][x] = String.fromCharCode(v);
                    let cellId = "cell" + x + "_" + y;
                    let cellTarget = document.getElementById(cellId);
                    if (cellTarget) {
                        cellTarget.value = mgrid[y][x];
                    }
                }
                break;
            }
            case '&': {
                let res = prompt("type an integer to push in the stack:");
                let n = parseInt(res);
                if (isNaN(n)) {
                    n = 0;
                }
                stack.push(n);
                break;
            }
            case '~': {
                let res = prompt("type a character to push in the stack:");
                stack.push(res);
                break;
            }
        }
        newco = moove(i, j, dir);
        i = newco.newI;
        j = newco.newJ;
    }
    if (Debug) {
        out.textContent += '\n' + "output :" + output.join("") + '\n' + "stack  :" + stack.join("");
    } else {
        out.textContent += '\n' + "output :" + output.join("");
    }
    out.scrollTop = out.scrollHeight;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function moove(i, j, dir) { //fonction de déplacement de l'éxécuteur
    switch (dir) {
        case ">":
            i = i + 1;
            break;
        case "<":
            i = i - 1;
            break;
        case "v":
            j = j + 1;
            break;
        case "^":
            j = j - 1;
            break;
    }
    if (i > 79) {
        i = i % 80;
    } else if (i < 0) {
        i = i + 80;
    } else if (j > 24) {
        j = j % 24;
    } else if (j < 0) {
        j = j + 24;
    }
    return { newI: i, newJ: j };
}

function add(n1, n2) {
    return n1 + n2;
}
function sub(n1, n2) {
    return n2 - n1;
}
function mul(n1, n2) {
    return n1 * n2;
}
function div(n1, n2) {
    if (n1 === 0) { } return 0;
    return Math.trunc(n2 / n1);
}
function mod(n1, n2) {
    if (n1 === 0) return 0;
    return n2 % n1;
}
function not(n) {
    if (n) {
        return 0;
    } else {
        return 1;
    }
}
function GreaterThan(n1, n2) {
    if (n2 > n1) {
        return 1;
    } else {
        return 0;
    }
}
function RandDir() {
    let r = parseInt(Math.random() * 4)
    switch (r) {
        case 0:
            return '>';
            break;
        case 1:
            return '<';
            break;
        case 2:
            return 'v';
            break;
        case 3:
            return '^';
            break;
    }
}
function HorIf(n) {
    if (n) {
        return '<';
    } else {
        return '>';
    }
}
function VerIf(n) {
    if (n) {
        return '^';
    } else {
        return 'v';
    }
}

SaveButton.addEventListener("click", function () { //fonction de sauvegarde du code BeFunge(similaire à celle de mon traitement de texte (premier projet de lundi/mardi))
    let gridText = "";
    for (let j = 0; j < 25; j++) {
        for (let i = 0; i < 80; i++) {
            let targetId = "cell" + i + "_" + j;
            let char = document.getElementById(targetId).value;
            if (char === "") char = " ";
            gridText += char;
        }
        gridText += "\n";
    }
    const File = new Blob([gridText], { type: "text/plain" });
    const InvisibleLink = document.createElement("a");
    InvisibleLink.href = URL.createObjectURL(File);
    InvisibleLink.download = "BefungeCode.txt";
    document.body.appendChild(InvisibleLink);
    InvisibleLink.click();
    document.body.removeChild(InvisibleLink);
});

const OpenButton = document.getElementById("OpenButton");
const FakeOpenButton = document.getElementById("FakeOpenButton");

FakeOpenButton.addEventListener("click", function () { // on cache l'ouverture de dock classique et le nom du fichier pour l'estethique uniquement
    OpenButton.click();
});

OpenButton.addEventListener("change", function (event) { // ouverture d'un fichier de code befunge
    const ChoosedFile = event.target.files[0];
    if (!ChoosedFile) return;
    const lecteur = new FileReader();
    lecteur.onload = function (e) {
        const textLines = e.target.result.split('\n');
        for (let j = 0; j < 25; j++) {
            let currentLine = textLines[j] || "";
            for (let i = 0; i < 80; i++) {
                let targetId = "cell" + i + "_" + j;
                let char = currentLine[i] || "";
                if (char === " ") char = "";

                document.getElementById(targetId).value = char;
            }
        }
    };
    lecteur.readAsText(ChoosedFile);
    event.target.value = "";
});