const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Function to calculate details for a specific month
function calculateMonthlyDetails({
    propertyPrice,
    deposit,
    annualInterestRate,
    mortgageTermYears,
    monthlyRent,
    annualServiceCharge,
}, month) {
    const mortgage = propertyPrice - deposit;
    const monthlyInterestRate = annualInterestRate / 100 / 12;
    const numberOfPayments = mortgageTermYears * 12;
    const monthlyPayment = mortgage * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    // Calculate balance after specific month
    let balance = mortgage;
    for (let i = 0; i < month; i++) {
        const interestPayment = balance * monthlyInterestRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
    }

    const salePrice = propertyPrice;
    const totalPaid = monthlyPayment * month;
    const remainingBalance = balance;
    const estateAgentFeePercentage = 0.024;
    const estateAgentFee = salePrice * estateAgentFeePercentage;
    const legalFees = 1500;
    const ercPercentage = 0.02;
    const erc = remainingBalance * ercPercentage;
    const totalSellingCosts = estateAgentFee + legalFees + erc;

    const netProceeds = salePrice - remainingBalance - totalSellingCosts;
    const totalServiceCharges = annualServiceCharge * (month / 12);
    const totalOutlay = deposit + totalPaid + totalServiceCharges;
    const netDifference = netProceeds - totalOutlay;
    const totalRentSaved = monthlyRent * month;
    const adjustedNetDifference = netDifference + totalRentSaved;

    return {
        propertyPrice,
        deposit,
        mortgage,
        annualInterestRate,
        monthlyPayment,
        totalPaid,
        remainingBalance,
        salePrice,
        totalSellingCosts,
        netProceeds,
        totalServiceCharges,
        totalOutlay,
        netDifference,
        totalRentSaved,
        adjustedNetDifference
    };
}

// Function to get data for all months
function getAllMonthlyData({
    propertyPrice,
    deposit,
    annualInterestRate,
    mortgageTermYears,
    monthlyRent,
    annualServiceCharge,
}) {
    const numberOfPayments = mortgageTermYears * 12;
    const monthlyData = [];

    for (let month = 1; month <= numberOfPayments; month++) {
        monthlyData.push(calculateMonthlyDetails({
            propertyPrice,
            deposit,
            annualInterestRate,
            mortgageTermYears,
            monthlyRent,
            annualServiceCharge,
        }, month));
    }

    return monthlyData;
}

// API endpoint to calculate data
app.post('/calculate', (req, res) => {
    const data = getAllMonthlyData(req.body);
    res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
