const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 8000;

const caseData = './db/caseData.json';

app.use(bodyParser.json());

app.post('/api/case', (req, res) => {
    const { customerName, startDate, isFinished } = req.body;

    const cases = readCasesFromFile();

    const fxFileId = generateFxFileId(cases, customerName);

    cases.push({ customerName, startDate, isFinished, fxFileId });

    writeCasesToFile(cases);

    res.json({ customerName, startDate, isFinished, fxFileId });
});

app.get('/api/allcases', (req, res) => {
    const cases = readCasesFromFile();
    if (cases.length) {
        res.json(cases);
    } else {
        res.send('no cases yet. please use POST /api/case to add new case');
    }
});

function readCasesFromFile() {
    try {
        const data = fs.readFileSync(caseData);
        return JSON.parse(data);
    } catch (err) {
        console.log('error reading cases from file:', err);
        return [];
    }
}

function writeCasesToFile(cases) {
    try {
        fs.writeFileSync(caseData, JSON.stringify(cases));
    } catch (err) {
        console.log('error writing cases to file:', err);
    }
}

function generateFxFileId(cases, customerName) {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const existingCasesCurrentYear = cases.filter(c => c.fxFileId.includes(`-${currentYear}-`));
    let highestCount = 0;

    if (existingCasesCurrentYear.length > 0) {
        existingCasesCurrentYear.forEach(c => {
            const counter = parseInt(c.fxFileId.split("-")[2]);
            if (counter > highestCount) {
                highestCount = counter;
            }
        });
    }

    const twoDigitCounter = (highestCount + 1).toString().padStart(2, "0");

    return `${customerName}-${currentYear}-${twoDigitCounter}`;
}

app.listen(port, () => console.log(`server listening on port ${port}!`));
