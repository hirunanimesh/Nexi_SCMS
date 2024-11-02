
# Supply Chain Management System

## Project Overview

The **Supply Chain Management System** is designed for **Company A**, a production company located in Kandy, Sri Lanka. The system manages the entire supply chain for distributing products to customers islandwide, including wholesalers, retailers, and end customers. The system leverages the railway network for transporting goods to major cities, followed by truck deliveries from regional storage facilities to final destinations, ensuring efficient logistics and order fulfillment.

## Project Features

- **Order Management**  
  Customers place orders at least 7 days in advance, specifying their delivery route. Orders are processed and scheduled for delivery by rail to main cities and then by truck to the specified addresses.

- **Transportation Management**  
  - **Railway**: Orders are shipped via railway to major cities (Colombo, Negombo, Galle, Matara, Jaffna, Trinco). Each train trip has a reserved capacity, and excess orders are scheduled for the next trip.
  - **Truck**: Trucks deliver orders from city stores to final destinations. Each truck follows a predefined route covering specific areas. Driver and driver assistant assignments are managed according to roster constraints.

- **Scheduling Constraints**  
  - A driver cannot be assigned to consecutive truck schedules, while a driver assistant can have a maximum of two consecutive shifts.
  - Weekly work hours are limited to 40 hours for drivers and 60 hours for driver assistants.

- **Reporting System**  
  A comprehensive report system provides management with insights and analytics, including:
  - Quarterly sales report
  - Items with most orders
  - Sales reports by cities and routes
  - Working hours of drivers, driver assistants, and truck usage
  - Customer order report

## Database Design

The database is designed to store detailed records of products, customers, orders, schedules, and logistics. Key features of the database include:

- **Entities**: Products, customers, orders, train schedules, stores, trucks, routes, drivers, and assistants.
- **Relationships**: Orders are associated with routes, products, customers, and transportation entities (trains and trucks).
- **Constraints**: Foreign keys, primary keys, and indexing ensure data integrity and optimal performance.
- **Stored Procedures, Functions, and Triggers**: Implemented to enforce business rules and maintain ACID compliance.

### Sample Data

The database includes:
- At least 40 sample orders across 10 different routes
- Sample train schedules with defined capacities
- Driver and assistant rosters and assignments

## Technology Stack

- **Frontend**: React.js (Client and Admin interfaces)
- **Backend**: Node.js with Express
- **Database**: MySQL 
- **Reporting and Visualization**: jsPDF, html2canvas, and Chart.js for generating and visualizing reports

## Dependencies

### Admin Application Dependencies

- `@babel/plugin-proposal-private-property-in-object`
- `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`
- `axios`
- `bootstrap`
- `chart.js`
- `cors`
- `html2canvas`
- `jspdf`, `jspdf-autotable`
- `react`, `react-calendar`, `react-chartjs-2`, `react-dom`, `react-icons`, `react-router-dom`, `react-scripts`, `react-toastify`
- Development dependencies: `daisyui`, `postcss`, `tailwindcss`

### Client Application Dependencies

- `@fortawesome/fontawesome-free`, `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-brands-svg-icons`, `@fortawesome/react-fontawesome`
- `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`
- `axios`
- `bootstrap`
- `classnames`
- `jspdf`, `jspdf-autotable`
- `react`, `react-bootstrap`, `react-dom`, `react-icons`, `react-router-dom`, `react-scripts`, `react-slick`, `react-toastify`, `slick-carousel`

### Backend Application Dependencies

- `axios`
- `bcrypt`
- `cookie-parser`
- `cors`
- `dotenv`
- `express`
- `jsonwebtoken`
- `mysql`, `mysql2`
- Development dependency: `nodemon`

## Installation and Setup

To run this project locally, you need to set up three applications (Client, Admin, and Backend) and run each of them. Follow these steps:

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/supply-chain-management-system.git
cd supply-chain-management-system
```

### Step 2: Install Dependencies for Each Application

Navigate to each application folder (client, admin, backend) and install dependencies:

#### Install Dependencies for Admin

```bash
cd admin
npm install
```

#### Install Dependencies for Client

```bash
cd ../client
npm install
```

#### Install Dependencies for Backend

```bash
cd ../backend
npm install
```

### Step 3: Database Setup

1. Set up a MySQL or PostgreSQL database.
2. Use the provided SQL scripts in the `/database` folder to create the necessary tables, procedures, and triggers.
3. Populate the database with sample data (at least 40 orders across 10 routes, including delivery and train schedule data).

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend` folder with the following settings:

```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Step 5: Start Each Application

#### Start Admin Application

```bash
cd ../admin
npm start
```

This will start the admin app on [http://localhost:3002](http://localhost:3002).

#### Start Client Application

```bash
cd ../client
npm start
```

This will start the client app on [http://localhost:3000](http://localhost:3000).

#### Start Backend Application

```bash
cd ../backend
npm start
```

This will start the backend server on [http://localhost:5000](http://localhost:5000).

## Usage

1. **Admin Interface**: Accessed at [http://localhost:3002](http://localhost:3002), where administrators can view reports, manage orders, and oversee logistics.
2. **Client Interface**: Accessed at [http://localhost:3000](http://localhost:3000), where customers can place orders, select delivery routes, and view order history.
3. **Backend API**: API endpoints available at [http://localhost:5000](http://localhost:5000) for handling data operations and processing requests from the admin and client applications.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

