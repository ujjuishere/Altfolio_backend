const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
    assetName: { type: String, required: true },
    assetType: { type: String, enum: ['Startup', 'Crypto Fund', 'Farmland', 'Collectible', 'Other'], required: true },
    investedAmount: { type: Number, required: true },
    investmentDate: { type: Date, required: true },
    currentValue: { type: Number, required: true },
    owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Virtual for ROI calculation
InvestmentSchema.virtual('roi').get(function () {
    return (((this.currentValue - this.investedAmount) / this.investedAmount) * 100).toFixed(2);
});

InvestmentSchema.set('toObject', { virtuals: true });
InvestmentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Investment', InvestmentSchema);
