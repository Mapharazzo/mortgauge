import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

function App() {
    const [formValues, setFormValues] = useState({
        propertyPrice: 600000,
        deposit: 100000,
        annualInterestRate: 5.5,
        mortgageTermYears: 25,
        analysisYears: 15,
        monthlyRent: 2500,
        annualServiceCharge: 5000
    });

    const [plotData, setPlotData] = useState(null);
    const [yearDetails, setYearDetails] = useState(null);

    const handleChange = (e) => {
        setFormValues({
            ...formValues,
            [e.target.name]: parseFloat(e.target.value) || 0  // Ensure numeric values
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Request detailed data for all months
            const response = await axios.post('http://localhost:5000/calculate', formValues);
            const monthlyData = response.data;

            // Prepare data for plotting
            const years = monthlyData.map((_, index) => (index + 1) / 12);  // Convert months to years
            const remainingBalances = monthlyData.map(data => data.remainingBalance / 1000);  // Convert to thousands
            const totalPayments = monthlyData.map(data => data.totalPaid / 1000);  // Convert to thousands
            const netProceeds = monthlyData.map(data => data.netProceeds / 1000);  // Convert to thousands
            const totalServiceCharges = monthlyData.map(data => data.totalServiceCharges / 1000);  // Convert to thousands
            const totalOutlay = monthlyData.map(data => data.totalOutlay / 1000);  // Convert to thousands
            const netDifference = monthlyData.map(data => data.netDifference / 1000);  // Convert to thousands
            const totalRentSaved = monthlyData.map(data => data.totalRentSaved / 1000);  // Convert to thousands
            const adjustedNetDifference = monthlyData.map(data => data.adjustedNetDifference / 1000);  // Convert to thousands

            // Get details for the specific analysis year
            const analysisMonthIndex = (formValues.analysisYears - 1) * 12;
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
                propertyPrice: formValues.propertyPrice / 1000  // Convert to thousands
            });

            setYearDetails(yearDetails);
        } catch (error) {
            console.error("There was an error calculating the financials!", error);
        }
    };

    const renderForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                {Object.keys(formValues).map((key) => (
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
                            step="0.01"
                        />
                    </div>
                ))}
                <button type="submit" className="btn btn-success btn-lg btn-block">
                    Calculate Financials
                </button>
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
                            visible: 'legendonly'
                        }
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
                </ul>
            </div>
        );
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">Property Financial Analysis</h1>
            {renderForm()}
            {renderYearDetails()}
            {renderPlot()}
        </div>
    );
}

export default App;
