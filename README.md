# DataLens

A modern web application built with React and TypeScript to upload, analyze, and visualize CSV data. DataLens provides an interactive interface for exploring datasets through dynamic tables, charts, and statistical insights, making data analysis accessible and intuitive.

## Table of Contents

- Overview
- Features
- Screenshots
- Technologies Used


## Overview
DataLens is a React-based application designed to help users upload CSV files, visualize data through charts, and gain insights through statistical analysis. The app features a clean, responsive UI with interactive components, making it easy to explore and manipulate datasets. Key functionalities include data table editing, chart generation, outlier detection, and data cleaning.

## Features

- **CSV File Upload**: Upload CSV files with validation and error handling.
- **Interactive Data Table**:
  - Paginated table with sorting and column resizing.
  - Toggle column visibility.
  - Inline editing of table cells.
  - Highlight rows with outliers.
- **Dynamic Charts**:
  - Bar Chart, Pie Chart,Box Plot and Scatter Chart based on user-selected X and Y axes.
  - Trend Analysis chart for time-series data (if a `Date` column is present).
- **Statistical Insights**:
  - Total rows, columns, numeric, and categorical columns.
  - Numeric column statistics (mean, median, min, max, etc.).
  - Correlation matrix for numeric columns.
  - Outlier detection using the Interquartile Range (IQR) method.
- **Data Cleaning**:
  - Remove outliers and handle missing values.
- **Advanced Filtering**:
  - Apply custom filters to the dataset.
- **Export Data**:
  - Export the processed dataset as a CSV file.
- **Responsive Design**:
  - Fully responsive UI for desktop and mobile devices.
- **Modern UI**:
  - Polished navbar with active link highlighting.
  - Card-based layouts for upload and dashboard pages.
  - Footer with copyright information.

## Screenshots
Here are some screenshots of DataLens in action:

### Home Page
![Screenshot 2025-03-25 164716](https://github.com/user-attachments/assets/2ce7a848-fb94-41c5-852e-7cfe03531bc1)

A welcoming page with an overview of the app’s features and a call-to-action to upload a CSV file.

### Upload Page

![Screenshot 2025-03-25 170453](https://github.com/user-attachments/assets/86427c41-c14a-4bf0-b776-2220390cb93b)

A clean interface for uploading CSV files with validation and feedback.

### Dashboard Page
![Screenshot 2025-03-25 170707](https://github.com/user-attachments/assets/86796748-0e74-4223-9807-d3bce41084b4)
![Screenshot 2025-03-25 170546](https://github.com/user-attachments/assets/36cbfb77-2be8-4fb4-aa92-3c93c06bac1b)
![image](https://github.com/user-attachments/assets/938d1dc2-d4c7-4b0d-93d1-061a4dea5eb8)
![Screenshot 2025-03-25 170749](https://github.com/user-attachments/assets/61b25872-e14e-4d84-b212-d7948ee8f225)
![Screenshot 2025-03-25 170619](https://github.com/user-attachments/assets/acf4466c-6566-421f-89c7-9b44d5035472)
![image](https://github.com/user-attachments/assets/12c95d67-750e-4c75-99cb-bf8fac30afec)
![image](https://github.com/user-attachments/assets/81b90bb0-8d3d-4f16-83bc-700648526c00)
![image](https://github.com/user-attachments/assets/0d30885b-bc65-412c-b963-d37370d1f08a)

The main dashboard with charts, statistical insights, and an interactive data table.
## Technologies Used

- [Node.js](https://nodejs.org/) (v16)
- [npm](https://www.npmjs.com/) (comes with Node.js)

