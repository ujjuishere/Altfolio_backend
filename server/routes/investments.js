const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const authMiddleware = require('../middleware/auth'); // ✅ ensure correct import
const { createObjectCsvStringifier } = require('csv-writer');

// GET all investments
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate, minROI, assetType } = req.query;
        const filter = {};

        if (startDate || endDate) {
            filter.investmentDate = {};
            if (startDate) filter.investmentDate.$gte = new Date(startDate);
            if (endDate) filter.investmentDate.$lte = new Date(endDate);
        }

        if (assetType) {
            filter.assetType = assetType;
        }

        const investments = await Investment.find(filter).populate('owners', 'username role');

        // Compute ROI filtering
        let filteredInvestments = investments;
        if (minROI) {
            filteredInvestments = investments.filter(inv => {
                const roi = ((inv.currentValue - inv.investedAmount) / inv.investedAmount) * 100;
                return roi >= parseFloat(minROI);
            });
        }

        // Add ROI to each investment for consistent frontend
        const investmentsWithROI = filteredInvestments.map(inv => {
            const roi = ((inv.currentValue - inv.investedAmount) / inv.investedAmount) * 100;
            return {
                ...inv.toObject(),
                roi: roi.toFixed(2)
            };
        });

        res.json(investmentsWithROI);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// CSV Export Route
router.get('/export', authMiddleware, async (req, res) => {
    try {
        const investments = await Investment.find().populate('owners', 'username role');

        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'assetName', title: 'Asset Name' },
                { id: 'assetType', title: 'Asset Type' },
                { id: 'investedAmount', title: 'Invested Amount' },
                { id: 'currentValue', title: 'Current Value' },
                { id: 'roi', title: 'ROI (%)' },
                { id: 'owners', title: 'Owners' },
                { id: 'investmentDate', title: 'Investment Date' },
            ]
        });

        const records = investments.map(inv => ({
            assetName: inv.assetName,
            assetType: inv.assetType,
            investedAmount: inv.investedAmount,
            currentValue: inv.currentValue,
            roi: (((inv.currentValue - inv.investedAmount) / inv.investedAmount) * 100).toFixed(2),
            owners: inv.owners.map(owner => owner.username).join('; '),
            investmentDate: inv.investmentDate.toISOString().split('T')[0],
        }));

        const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=investments.csv');
        res.send(csv);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});


// Other routes...
module.exports = router;
