CREATE OR REPLACE VIEW `sales_by_city` AS
SELECT 
	store.City,
    SUM(Total_Price)
FROM orders
JOIN store ON store.Store_ID = orders.Store_ID
JOIN truck_route ON truck_route.Route_ID = orders.Route_ID
GROUP BY store.City;


CREATE OR REPLACE VIEW `sales_by_route` AS
SELECT 
    truck_route.Store_ID,  
    truck_route.Route,
    SUM(Total_Price) AS Total_Sales  -- Alias for the SUM column
FROM orders
JOIN store ON store.Store_ID = orders.Store_ID
JOIN truck_route ON truck_route.Route_ID = orders.Route_ID
GROUP BY truck_route.Store_ID, truck_route.Route;  





CREATE OR REPLACE VIEW `product_orders` AS
SELECT
	product.Product_ID,
    product.Product_Name,
    SUM(Quantity) AS 'Total_sales'
FROM order_item
JOIN product ON product.Product_ID=order_item.Product_ID

GROUP BY Product_ID, Product_Name
ORDER BY SUM(QUANTITY) DESC;





CREATE OR REPLACE VIEW `Driver_work_hours` AS
SELECT 
    WEEK(shipment_date) AS 'Week_number',
    td.Driver_id,
    SUM(ROUND(((TIME_TO_SEC(Vehicle_arrival_time)-TIME_TO_SEC(Vehicle_departure_time))/3600),1)) AS "Hours_worked"
FROM truck_delivery td
JOIN delivery_schedule ds ON ds.Delivery_id = td.Truck_Del_ID
GROUP BY WEEK(shipment_date), td.Driver_id;




CREATE OR REPLACE VIEW `Assistant_work_hours` AS
SELECT 
    WEEK(ds.shipment_date) AS 'Week_number',
    td.Assistant_id,
    SUM(ROUND(((TIME_TO_SEC(Vehicle_arrival_time)-TIME_TO_SEC(Vehicle_departure_time))/3600),1)) AS "Hours_worked"
FROM truck_delivery td
JOIN delivery_schedule ds ON ds.Delivery_id = td.Truck_Del_ID
GROUP BY WEEK(ds.shipment_date), td.Assistant_id;




CREATE OR REPLACE VIEW `Truck_hours` AS
SELECT 
    WEEK(ds.shipment_date) AS 'Week_number',
    td.Truck_id,
    SUM(ROUND(((TIME_TO_SEC(Vehicle_arrival_time)-TIME_TO_SEC(Vehicle_departure_time))/3600),1)) AS "Hours_worked"
FROM truck_delivery td
JOIN delivery_schedule ds ON ds.Delivery_id = td.Truck_Del_ID
GROUP BY WEEK(ds.shipment_date), td.Truck_id;



CREATE OR REPLACE VIEW `Delivery_times` AS
SELECT 
	DISTINCT ds.Delivery_ID,
    Time_taken AS 'hours'
FROM Delivery_Schedule ds
JOIN ORDER_DELIVERY od ON ds.Delivery_id = od.Delivery_id
JOIN orders o on o.Order_ID = od.Order_ID
JOIN truck_route tr ON o.Route_ID = tr.Route_ID;


CREATE OR REPLACE VIEW store_manager_view AS
SELECT 
    sm.Manager_ID,
    sm.Name,
    sm.Username,
    sm.Email,
    sm.PhoneNumber,
    s.Store_ID,
    s.City
FROM 
    store_manager sm
JOIN 
    store s ON sm.Store_id = s.Store_Id;
    
    
CREATE OR REPLACE VIEW get_total_store_stats AS
SELECT
    S.Store_ID,
    S.City,
    COUNT(DISTINCT T.Truck_ID) AS Truck,
    COUNT(DISTINCT D.Driver_ID) AS Driver,
    COUNT(DISTINCT A.Assistant_ID) AS Assistant
FROM Store S
LEFT JOIN Truck T ON T.Store_ID = S.Store_ID
LEFT JOIN Driver D ON D.Store_ID = S.Store_ID
LEFT JOIN Driver_Assistant A ON A.Store_ID = S.Store_ID
GROUP BY S.Store_ID, S.City;
