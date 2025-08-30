const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = 5001;
const CSV_FILE_PATH = './contracts.csv';

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/contracts', (req, res) => {
    const results = [];
    if (!fs.existsSync(CSV_FILE_PATH)) { 
        return res.json([]); 
    }
    fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => { 
            res.json(results); 
        });
});

app.post('/api/contracts', async (req, res) => {
    const contracts = req.body;
    if (!contracts || !Array.isArray(contracts)) { 
        return res.status(400).send('Invalid data format.'); 
    }
    
    if (contracts.length === 0) {
        fs.writeFileSync(CSV_FILE_PATH, 'id,contractNumber,accessCode,tenantName,tenantEmail,tenantPhone,landlordName,landlordEmail,propertyAddress,propertyType,rentAmount,startDate,endDate,deposit,status,signature,createdAt,lastModified,signedAt,terminatedAt,createdBy\n');
        return res.status(200).send('Contracts data cleared.');
    }
    
    const header = Object.keys(contracts[0]).map(key => ({id: key, title: key}));
    const csvWriter = createCsvWriter({ 
        path: CSV_FILE_PATH, 
        header: header 
    });
    
    try {
        await csvWriter.writeRecords(contracts);
        res.status(200).send('Contracts saved.');
    } catch (error) {
        console.error('Error writing to CSV file:', error);
        res.status(500).send('Failed to save contracts.');
    }
});

app.listen(PORT, () => { 
    console.log(`Server is running on http://localhost:${PORT}`); 
});