import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

function calculateMonthlyDetails({
    propertyPrice,
    deposit,
    annualInterestRate,
    mortgageTermYears,
    monthlyRent,
    annualServiceCharge,
    investmentReturnRate,
    houseAppreciationRate
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

    const salePrice = propertyPrice * Math.pow(1 + houseAppreciationRate / 100, month / 12);
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

    // Calculate investment account value
    const monthlyInvestmentReturnRate = investmentReturnRate / 100 / 12;
    const investmentAccountValue = deposit * Math.pow(1 + monthlyInvestmentReturnRate, month) +
        monthlyPayment * ((Math.pow(1 + monthlyInvestmentReturnRate, month) - 1) / monthlyInvestmentReturnRate);

    // Calculate rent vs buy difference
    let rentVsBuyDifference = null;
    if (monthlyPayment > monthlyRent) {
        const extraInvestment = monthlyPayment - monthlyRent;
        const rentInvestmentValue = deposit * Math.pow(1 + monthlyInvestmentReturnRate, month) +
            extraInvestment * ((Math.pow(1 + monthlyInvestmentReturnRate, month) - 1) / monthlyInvestmentReturnRate);
        
        const totalRentPaid = monthlyRent * month;
        const buyScenarioValue = propertyPrice - balance - totalPaid - totalServiceCharges;
        
        rentVsBuyDifference = (rentInvestmentValue - totalRentPaid) - (buyScenarioValue - deposit);
    }

    const sellingNetDifference = adjustedNetDifference - totalSellingCosts;

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
        adjustedNetDifference,
        investmentAccountValue,
        rentVsBuyDifference,
        sellingNetDifference
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
    investmentReturnRate,
    houseAppreciationRate
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
            investmentReturnRate,
            houseAppreciationRate
        }, month));
    }

    return monthlyData;
}

function App() {
    const [formValues, setFormValues] = useState({
        propertyPrice: 600000,
        deposit: 100000,
        annualInterestRate: 5.5,
        mortgageTermYears: 25,
        analysisYears: 15,
        annualServiceCharge: 5000,
        monthlyRent: 2500,
        investmentReturnRate: 7,
        houseAppreciationRate: 0.5
    });

    const [plotData, setPlotData] = useState(null);
    const [yearDetails, setYearDetails] = useState(null);
    const [monthlyPayment, setMonthlyPayment] = useState(null);

    useEffect(() => {
        handleSubmit(formValues);
    }, []);

    const handleChange = (e) => {
        const newFormValues = {
            ...formValues,
            [e.target.name]: parseFloat(e.target.value) || 0  // Ensure numeric values
        };
        setFormValues(newFormValues);
        handleSubmit(newFormValues);
    };

    const handleSubmit = (values = formValues) => {
        try {
            const monthlyData = getAllMonthlyData(values);
            
            // Set the monthly payment
            setMonthlyPayment(monthlyData[0].monthlyPayment);
    
            // Prepare data for plotting
            const years = monthlyData.map((_, index) => (index + 1) / 12);
            const remainingBalances = monthlyData.map(data => data.remainingBalance / 1000);
            const totalPayments = monthlyData.map(data => data.totalPaid / 1000);
            const netProceeds = monthlyData.map(data => data.netProceeds / 1000);
            const totalServiceCharges = monthlyData.map(data => data.totalServiceCharges / 1000);
            const totalOutlay = monthlyData.map(data => data.totalOutlay / 1000);
            const netDifference = monthlyData.map(data => data.netDifference / 1000);
            const totalRentSaved = monthlyData.map(data => data.totalRentSaved / 1000);
            const adjustedNetDifference = monthlyData.map(data => data.adjustedNetDifference / 1000);
            const investmentAccountValues = monthlyData.map(data => data.investmentAccountValue / 1000);
            const rentVsBuyDifferences = monthlyData.map(data => data.rentVsBuyDifference ? data.rentVsBuyDifference / 1000 : null);
            const sellingNetDifferences = monthlyData.map(data => data.sellingNetDifference ? data.sellingNetDifference / 1000 : null);
            const appreciatedPropertyPrices = monthlyData.map(data => data.salePrice / 1000);
    
            // Get details for the specific analysis year
            const analysisMonthIndex = (values.analysisYears - 1) * 12;
            const yearDetails = monthlyData[analysisMonthIndex];
    
            setPlotData({
                years,
                remainingBalances,
                totalPayments,
                netProceeds,
                totalServiceCharges,
                totalOutlay,
                netDifference,
                totalRentSaved,
                adjustedNetDifference,
                propertyPrice: values.propertyPrice / 1000,
                investmentAccountValues,
                rentVsBuyDifferences,
                sellingNetDifferences,
                appreciatedPropertyPrices
            });
            setYearDetails(yearDetails);
        } catch (error) {
            console.error("There was an error calculating the financials!", error);
        }
    };

    const renderForm = () => {
        const formFields = Object.keys(formValues);
        const columnSize = Math.ceil(formFields.length / 3);
    
        return (
            <form>
                <div className="row">
                    {[0, 1, 2].map(columnIndex => (
                        <div key={columnIndex} className="col-md-4">
                            {formFields.slice(columnIndex * columnSize, (columnIndex + 1) * columnSize).map((key) => (
                                <div className="form-group" key={key}>
                                    <label htmlFor={key}>
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                    </label>
                                    <input
                                        type="number"
                                        id={key}
                                        name={key}
                                        value={formValues[key]}
                                        onChange={handleChange}
                                        className="form-control"
                                        step="1"
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                {monthlyPayment && (
                    <div className="h4 mt-3">
                        Monthly Payment: £{monthlyPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                )}
            </form>
        );
    };

    const renderYearDetails = () => {
        if (!yearDetails) return null;

        return (
            <div className="mt-4">
                <h3>Year {formValues.analysisYears} Details:</h3>
                <p><strong>Property Price:</strong> £{yearDetails.propertyPrice.toLocaleString()}</p>
                <p><strong>Deposit:</strong> £{yearDetails.deposit.toLocaleString()}</p>
                <p><strong>Mortgage Amount:</strong> £{yearDetails.mortgage.toLocaleString()}</p>
                <p><strong>Annual Interest Rate:</strong> {yearDetails.annualInterestRate}%</p>
                <p><strong>Monthly Payment:</strong> £{yearDetails.monthlyPayment.toLocaleString()}</p>
                <p><strong>Total Paid (up to Year {formValues.analysisYears}):</strong> £{yearDetails.totalPaid.toLocaleString()}</p>
                <p><strong>Remaining Balance (at Year {formValues.analysisYears}):</strong> £{yearDetails.remainingBalance.toLocaleString()}</p>
                <p><strong>Sale Price:</strong> £{yearDetails.salePrice.toLocaleString()}</p>
                <p><strong>Total Selling Costs:</strong> £{yearDetails.totalSellingCosts.toLocaleString()}</p>
                <p><strong>Net Proceeds:</strong> £{yearDetails.netProceeds.toLocaleString()}</p>
                <p><strong>Total Service Charges:</strong> £{yearDetails.totalServiceCharges.toLocaleString()}</p>
                <p><strong>Total Outlay:</strong> £{yearDetails.totalOutlay.toLocaleString()}</p>
                <p><strong>Net Difference:</strong> £{yearDetails.netDifference.toLocaleString()}</p>
                <p><strong>Total Rent Saved:</strong> £{yearDetails.totalRentSaved.toLocaleString()}</p>
                <p><strong>Adjusted Net Difference:</strong> £{yearDetails.adjustedNetDifference.toLocaleString()}</p>
            </div>
        );
    };

    const renderPlot = () => {
        if (!plotData) return null;

        return (
            <>
                <Plot
                    data={[
                        {
                            x: plotData.years,
                            y: plotData.remainingBalances,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'red' },
                            name: 'Remaining Balance (Thousands)'
                        },
                        {
                            x: plotData.years,
                            y: plotData.totalPayments,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'blue' },
                            name: 'Total Payments (Thousands)'
                        },
                        {
                            x: plotData.years,
                            y: Array(plotData.years.length).fill(plotData.propertyPrice),
                            type: 'scatter',
                            mode: 'lines',
                            line: { dash: 'dash', color: 'green' },
                            name: 'Original Property Price (Thousands)'
                        },
                        {
                            x: plotData.years,
                            y: plotData.netProceeds,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'purple' },
                            name: 'Net Proceeds (Thousands)',
                            visible: 'legendonly'
                        },
                        {
                            x: plotData.years,
                            y: plotData.totalServiceCharges,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'orange' },
                            name: 'Total Service Charges (Thousands)',
                            visible: 'legendonly'
                        },
                        {
                            x: plotData.years,
                            y: plotData.totalOutlay,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'brown' },
                            name: 'Total Outlay (Thousands)',
                            visible: 'legendonly'
                        },
                        {
                            x: plotData.years,
                            y: plotData.netDifference,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'pink' },
                            name: 'Net Difference (Thousands)',
                            visible: 'legendonly'
                        },
                        {
                            x: plotData.years,
                            y: plotData.totalRentSaved,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'teal' },
                            name: 'Total Rent Saved (Thousands)',
                            visible: 'legendonly'
                        },
                        {
                            x: plotData.years,
                            y: plotData.adjustedNetDifference,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'cyan' },
                            name: 'Adjusted Net Difference (Thousands)',
                        },
                        {
                            x: plotData.years,
                            y: plotData.investmentAccountValues,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'gold' },
                            name: 'Investment Account (Thousands)',
                            visible: 'legendonly'
                        },
                        {
                            x: plotData.years,
                            y: plotData.rentVsBuyDifferences,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'magenta' },
                            name: 'Rent vs Buy Difference (Thousands)',
                        },
                        {
                            x: plotData.years,
                            y: plotData.sellingNetDifferences,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'lime' },
                            name: 'Selling Net Difference (Thousands)',
                            visible: 'legendonly'
                        },
                        {
                            x: plotData.years,
                            y: plotData.appreciatedPropertyPrices,
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'darkgreen' },
                            name: 'Appreciated Property Price (Thousands)',
                        },
                    ]}
                    layout={{
                        title: 'Mortgage Analysis Over Time',
                        xaxis: {
                            title: 'Time (Years)',
                        },
                        yaxis: {
                            title: 'Value (Thousands of £)',
                        }
                    }}
                    style={{ width: "100%", height: "100%" }}
                />
                {renderPlotExplanation()}
            </>
        );
    };

    const renderPlotExplanation = () => {
        return (
            <div className="mt-4">
                <h4>Plot Explanation:</h4>
                <ul>
                    <li><strong>Remaining Balance:</strong> The remaining amount of the mortgage that is yet to be paid.</li>
                    <li><strong>Total Payments:</strong> The cumulative sum of all payments made toward the mortgage.</li>
                    <li><strong>Original Property Price:</strong> The initial price of the property when purchased.</li>
                    <li><strong>Net Proceeds:</strong> The amount of money you'd receive if the property were sold, after deducting remaining mortgage balance and selling costs.</li>
                    <li><strong>Total Service Charges:</strong> The cumulative sum of all service charges paid over the years.</li>
                    <li><strong>Total Outlay:</strong> The total financial outlay, including the deposit, mortgage payments, and service charges.</li>
                    <li><strong>Net Difference:</strong> The difference between the net proceeds from selling the property and the total outlay.</li>
                    <li><strong>Total Rent Saved:</strong> The amount of money saved by not paying rent over the mortgage period.</li>
                    <li><strong>Adjusted Net Difference:</strong> The net difference adjusted by the total rent saved, reflecting the true financial impact.</li>
                    <li><strong>Investment Account:</strong> The value of an account starting with the deposit amount and growing monthly with the mortgage payment, invested at the specified return rate.</li>
                    <li><strong>Rent vs Buy Difference:</strong> The financial difference between renting and buying. A positive value indicates that renting and investing the difference is more beneficial, while a negative value suggests that buying is more advantageous.</li>
                    <li><strong>Selling Net Difference:</strong> The adjusted net difference minus the total selling costs, providing a comprehensive view of the financial impact including all costs associated with buying, owning, and selling the property.</li>
                    <li><strong>Appreciated Property Price:</strong> The property price adjusted for appreciation based on the specified rate.</li>
                </ul>
            </div>
        );
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">
                🏡 Mortgauge
            </h1>
            <hr/>
            {renderForm()}
            {renderPlot()}
            <details>
                <summary>Year Details</summary>
                {renderYearDetails()}
            </details>
        </div>
    );
}

export default App;
