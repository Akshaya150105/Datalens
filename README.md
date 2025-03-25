
# DataLens

A modern web application built with React and TypeScript to upload, analyze, and visualize CSV data. DataLens provides an interactive interface for exploring datasets through dynamic tables, charts, and statistical insights, making data analysis accessible and intuitive.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

DataLens is a React-based application designed to help users upload CSV files, visualize data through charts, and gain insights through statistical analysis. The app features a clean, responsive UI with interactive components, making it easy to explore and manipulate datasets. Key functionalities include data table editing, chart generation, outlier detection, and data cleaning.

This project was developed as a personal project to demonstrate skills in React, TypeScript, and data visualization.

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

![Home Page](https://via.placeholder.com/800x400.png?text=Home+Page)  
A welcoming page with an overview of the app’s features and a call-to-action to upload a CSV file.

### Upload Page

![Upload Page](https://via.placeholder.com/800x400.png?text=Upload+Page)  
A clean interface for uploading CSV files with validation and feedback.

### Dashboard Page

![Dashboard Page](https://via.placeholder.com/800x400.png?text=Dashboard+Page)  
The main dashboard with charts, statistical insights, and an interactive data table.

## Installation

Follow these steps to set up and run DataLens locally:

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

### Steps

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Akshaya150105/datalens.git
   cd datalens
