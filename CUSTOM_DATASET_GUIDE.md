# Custom Dataset Analytics Guide

## Overview
The Custom Dataset Analytics feature allows you to upload your own CSV or Excel files and visualize them with Chart.js interactive charts.

## How to Use

1. **Navigate to Admin Dashboard**
   - Log in as an admin
   - Click on the "Custom Dataset" button in the dashboard

2. **Upload Your Dataset**
   - Click "Choose File (CSV or Excel)"
   - Select a CSV (.csv) or Excel (.xlsx, .xls) file from your computer
   - The system will automatically parse and analyze your data

3. **View Analytics**
   - Once uploaded, you'll see:
     - **Dataset Summary**: Total records, columns, and data types
     - **Data Preview**: First 5 rows of your dataset
     - **Interactive Charts**: Automatically generated based on your data

## Supported File Formats

- **CSV** (.csv) - Comma-separated values
- **Excel** (.xlsx, .xls) - Microsoft Excel files

## Chart Types Generated

The system automatically generates charts based on your data structure:

1. **Doughnut Chart**: Distribution of categorical data (first text column)
2. **Bar Chart**: Top 10 values for numeric columns
3. **Bar Chart**: Average aggregations (categorical vs numeric)
4. **Line Chart**: Trend analysis between two numeric columns

## Sample Dataset

A sample textile dataset is provided at:
```
e:\Consultancy\textile\sample_textile_data.csv
```

This sample includes:
- Product names
- Categories
- Prices
- Quantities
- Ratings
- Sales data

## Data Requirements

### For Best Results:
- Include column headers in the first row
- Mix of text (categorical) and numeric columns
- At least 5-10 rows of data
- Clean data without excessive empty cells

### Column Types Recognized:
- **Numeric**: Price, Quantity, Rating, Age, Count, etc.
- **Categorical**: Category, Type, Name, Status, etc.

## Features

✓ Automatic data type detection
✓ Dynamic chart generation
✓ Interactive tooltips and legends
✓ Responsive design
✓ Support for large datasets
✓ Data preview table
✓ Summary statistics

## Example Use Cases

1. **Sales Analysis**: Upload sales data to visualize revenue by product/region
2. **Inventory Management**: Analyze stock levels across categories
3. **Customer Analytics**: Visualize customer demographics and behavior
4. **Performance Metrics**: Track KPIs and performance indicators
5. **Market Research**: Analyze survey data and market trends

## Tips

- **Use meaningful column names**: They appear in chart titles
- **Keep first column descriptive**: Often used as labels in charts
- **Include multiple metrics**: More columns = more chart options
- **Clean your data**: Remove unnecessary rows/columns before upload
- **Test with sample data**: Use the provided sample file to test the feature

## Troubleshooting

**File won't upload?**
- Check file format (must be .csv, .xlsx, or .xls)
- Ensure file size is reasonable (< 5MB recommended)
- Verify file isn't corrupted

**Charts not showing?**
- Ensure you have at least one numeric column
- Check that data contains valid numbers (not text in numeric columns)
- Verify at least a few rows of data exist

**Data looks wrong?**
- Check your CSV delimiter (should be comma)
- Ensure headers are in the first row
- Look for special characters that might cause parsing issues

## Next Steps

1. Try uploading the sample dataset
2. Explore the generated charts
3. Upload your own data files
4. Use insights to make data-driven decisions

## Support

For issues or questions:
- Check the console for error messages
- Verify your file format and structure
- Try with the sample dataset first
