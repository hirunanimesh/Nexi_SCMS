DELIMITER $$
DROP PROCEDURE IF EXISTS `Quarterly_sales_from`$$
CREATE PROCEDURE `Quarterly_sales_from`(start_date DATE , storeID INT)
BEGIN
    SELECT DATE(Ordered_Date) AS Order_Date, COUNT(*) AS Total_Orders
    FROM Orders
    WHERE Ordered_Date BETWEEN start_date AND DATE_ADD(start_date, INTERVAL 3 MONTH)
      AND Order_state != 'Pending' AND Orders.Store_ID = storeID
    GROUP BY DATE(Ordered_Date)
    ORDER BY Order_Date;
END$$
DELIMITER ;


DELIMITER $$
DROP PROCEDURE IF EXISTS `DriverHoursByCity`$$
CREATE PROCEDURE `DriverHoursByCity`(storeID INT)
BEGIN
    SELECT 
        Week_number,
        d.Driver_id, 
        Driver_name,
        Hours_worked
    FROM Driver_work_hours dwh
    JOIN driver d ON d.Driver_ID = dwh.Driver_ID
    WHERE d.Store_ID = storeID;

END$$
DELIMITER ;



-- Assistant work hours
DELIMITER $$
DROP PROCEDURE IF EXISTS `AssistantHoursByCity`$$
CREATE PROCEDURE `AssistantHoursByCity`(storeID INT)
BEGIN
    SELECT 
        Week_number,
        a.Assistant_ID, 
        Assistant_Name, 
        Hours_worked
    FROM assistant_work_hours awh
    JOIN driver_assistant a ON a.Assistant_ID = awh.Assistant_ID
    WHERE a.Store_ID = storeID;
END$$
DELIMITER ;



DELIMITER $$
DROP PROCEDURE IF EXISTS `TruckHoursByCity`$$
CREATE PROCEDURE `TruckHoursByCity`(storeID INT)
BEGIN
    SELECT 
        Week_number,
        t.Truck_id, 
        Reg_Number,
        Hours_worked
    FROM Truck_hours th
    JOIN truck t ON t.Truck_ID = th.Truck_ID
    WHERE t.Store_ID = storeID;

END$$
DELIMITER ;



DELIMITER $$
DROP PROCEDURE IF EXISTS `CreateTruckDelivery`$$
CREATE PROCEDURE CreateTruckDelivery(
    storeID INT,
    deliveryID INT
)
BEGIN
    DECLARE selected_driver_id INT;
    DECLARE selected_assistant_id INT;
    DECLARE selected_truck_id INT;
    DECLARE schedule_exists INT;

    -- Start the transaction
    START TRANSACTION;

    -- Select a random available truck
    SELECT t.truck_id INTO selected_truck_id
    FROM truck t
    WHERE t.Availability = '1' AND t.Store_ID = storeID
    ORDER BY RAND() 
    LIMIT 1;

    -- Check if the Truck_Delivery table has any records
    SELECT COUNT(ID) 
    INTO schedule_exists
    FROM Truck_Delivery;

    IF schedule_exists > 0 THEN
        -- Select a random driver who is available and not in the last schedule
        SELECT d.driver_id 
        INTO selected_driver_id
        FROM driver d
        WHERE 
            d.driver_id != (
                SELECT td.driver_id
                FROM Truck_Delivery td
                ORDER BY td.ID DESC
                LIMIT 1
            ) 
            AND d.work_hours < 40
            AND d.Availability = 'Rest' 
            AND d.Store_ID = storeID
        ORDER BY RAND()
        LIMIT 1;

        -- Select a random assistant who is available and not in the last schedule
        SELECT a.assistant_id 
        INTO selected_assistant_id
        FROM driver_assistant a
        WHERE a.Assistant_ID != (
                SELECT td.assistant_id
                FROM Truck_Delivery td
                ORDER BY td.ID DESC
                LIMIT 1
            ) 
            AND a.work_hours < 60
            AND a.Availability = 'Rest' 
            AND a.Store_ID = storeID
        ORDER BY RAND() 
        LIMIT 1;

    ELSE
        -- If Truck_Delivery is empty, randomly select a driver based on availability
        SELECT d.driver_id INTO selected_driver_id
        FROM driver d
        WHERE d.work_hours < 40
            AND d.Availability = 'Rest'
            AND d.Store_ID = storeID
        ORDER BY RAND() 
        LIMIT 1;

        -- Randomly select an assistant based on availability
        SELECT a.assistant_id 
        INTO selected_assistant_id
        FROM driver_assistant a
        WHERE a.work_hours < 60
            AND a.Availability = 'Rest'
            AND a.Store_ID = storeID
        ORDER BY RAND() 
        LIMIT 1;
    END IF;

    -- Insert the new delivery schedule into the table if IDs are valid
    IF (selected_truck_id IS NOT NULL AND selected_driver_id IS NOT NULL AND selected_assistant_id IS NOT NULL) THEN
        BEGIN
            -- Insert into Truck_Delivery
            INSERT INTO Truck_Delivery (Truck_Del_ID, truck_id, driver_id, assistant_id)
            VALUES (deliveryID, selected_truck_id, selected_driver_id, selected_assistant_id);

            -- Update delivery_schedule
            UPDATE delivery_schedule ds
            SET Shipment_Date = CURDATE(),
                Vehicle_departure_time = CURTIME(),
                Delivery_status = 'In_Truck'
            WHERE Delivery_id = deliveryID;

            -- Commit the transaction if everything is successful
            COMMIT;
        END;
    ELSE
        -- Rollback if any IDs are NULL and throw an error
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'One or more required IDs (truck, driver, assistant) is NULL. Unable to proceed with delivery insertion.';
    END IF;
END $$
DELIMITER ;





DELIMITER $$
DROP procedure IF EXISTS `showTrainsTo`$$
CREATE PROCEDURE showTrainsTo(
	storeID INT)
BEGIN
	SELECT 
		ts.Day AS 'Date',
        ts.Start_time AS 'Time',
        t.Train_Name AS 'Train name',
        t.capacity AS 'Train capacity'
    FROM train_schedule ts
    JOIN destination d ON ts.Trip_ID = d.Trip_ID
    JOIN train t ON t.Train_ID = ts.Train_ID
    WHERE d.Store_ID = storeID;

END$$
DELIMITER ;



DROP PROCEDURE IF EXISTS `products_in_order`;
DELIMITER $$
CREATE PROCEDURE `products_in_order`(id INT)
BEGIN
	SELECT 
		product.Product_ID,
        Product_name,
        SUM(Quantity) AS 'Quantity',
        SUM(Order_item_price) AS 'Price'
    FROM order_item
    JOIN product ON order_item.Product_ID = product.Product_ID
    WHERE Order_ID = id
    GROUP BY Product_ID;
END$$
DELIMITER ;



DROP PROCEDURE IF EXISTS `Add_product`;
DELIMITER $$

CREATE PROCEDURE `Add_product`(
    Product_Name VARCHAR(100), 
    Category VARCHAR(20), 
    Price DECIMAL(8,2), 
    Capacity INT, 
    Stock INT, 
    Description VARCHAR(500), 
    Img_Link VARCHAR(50)
)
BEGIN
    -- Error handling declaration
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Rollback the transaction if any error occurs
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error occurred during product insertion. Transaction rolled back.';
    END;

    -- Start the transaction
    START TRANSACTION;

    -- Insert the product data into the Product table
    INSERT INTO Product (Product_Name, Category, Price, Capacity, Stock_Quantity, Description, Image_Link) 
    VALUES (Product_Name, Category, Price, Capacity, Stock, Description, Img_Link);

    -- Commit the transaction if the insert is successful
    COMMIT;

END$$
DELIMITER ;





DROP EVENT IF EXISTS yearly_delete_order_details;
DELIMITER $$

CREATE EVENT yearly_delete_order_details
ON SCHEDULE
    EVERY 1 YEAR STARTS '2025-01-01'
DO 
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN

        ROLLBACK;
    END;

    START TRANSACTION;

    DELETE o, od, ds 
    FROM orders o
    JOIN order_delivery od ON od.Order_ID = o.Order_ID
    JOIN delivery_schedule ds ON ds.Delivery_id = od.Delivery_id
    WHERE ordered_date < DATE_SUB(NOW(), INTERVAL 2 YEAR);

    COMMIT;
    
END$$
DELIMITER ;




-- --------------------------------------------------------------

DELIMITER $$
DROP PROCEDURE IF EXISTS UpdateDailyWorkHours$$
CREATE PROCEDURE UpdateDailyWorkHours()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE dr_id INT;
    DECLARE ass_id INT;

    DECLARE cur_driver CURSOR FOR SELECT Driver_ID FROM driver;
    DECLARE cur_assistant CURSOR FOR SELECT Assistant_ID FROM driver_assistant;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN

        ROLLBACK;
    END;

    START TRANSACTION;

    OPEN cur_driver;
    SET done = 0;
    REPEAT
        FETCH cur_driver INTO dr_id;
        
        IF NOT done THEN
            UPDATE driver 
            SET work_hours = work_hours + driver_hours_worked(CURDATE(), dr_id)
            WHERE Driver_ID = dr_id;
        END IF;
    UNTIL done END REPEAT;
    CLOSE cur_driver;


    SET done = 0;
    OPEN cur_assistant;
    REPEAT
        FETCH cur_assistant INTO ass_id;
        
        IF NOT done THEN
            UPDATE driver_assistant 
            SET work_hours = work_hours + assistant_hours_worked(CURDATE(), ass_id)
            WHERE Assistant_ID = ass_id;
        END IF;
    UNTIL done END REPEAT;
    CLOSE cur_assistant;

    COMMIT;
END$$
DELIMITER ;




DELIMITER $$
DROP EVENT IF EXISTS daily_add_work_hours $$
CREATE EVENT daily_add_work_hours
ON SCHEDULE EVERY 1 DAY
STARTS '2024-10-26'
DO
    CALL UpdateDailyWorkHours();
$$
DELIMITER ;





DROP PROCEDURE IF EXISTS `cart_cap_price`;
DELIMITER $$
CREATE PROCEDURE `cart_cap_price`(setID INT)
BEGIN
	UPDATE order_item
    SET Order_item_capacity = calculate_capacity(setID)
    WHERE Set_ID = setID;
    
	UPDATE order_item    
    SET Order_item_Price = calculate_price(setID)
    WHERE Set_ID = setID;
END$$
DELIMITER ;




DELIMITER $$
DROP PROCEDURE IF EXISTS `Total_cap_price`$$
CREATE PROCEDURE `Total_cap_price`(orderID INT)
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

    UPDATE orders
    SET Total_Capacity = (
        SELECT SUM(order_item.Order_Item_Capacity)
        FROM order_item
        WHERE order_item.Order_ID = orderID
    )
    WHERE orders.Order_ID = orderID;

    -- Update the Total_Price in the orders table
    UPDATE orders
    SET Total_Price = (
        SELECT SUM(order_item.Order_Item_Price)
        FROM order_item
        WHERE order_item.Order_ID = orderID
    )
    WHERE orders.Order_ID = orderID;

    -- Commit the transaction if no errors occurred
    COMMIT;
END$$
DELIMITER ;



DELIMITER $$
DROP PROCEDURE IF EXISTS `Update_arrival_time`$$
CREATE PROCEDURE `Update_arrival_time`(delID INT)
BEGIN
    -- Declare variables and error handler at the beginning
    DECLARE time_taken DECIMAL(3,1);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    -- Start transaction
    START TRANSACTION;

    -- Fetch the hours for the given delivery ID
    SELECT hours
    INTO time_taken
    FROM delivery_times 
    WHERE Delivery_ID = delID;
    
    -- Update Vehicle_arrival_time in Delivery_schedule
    UPDATE Delivery_schedule ds
    SET Vehicle_arrival_time = SEC_TO_TIME(TIME_TO_SEC(Vehicle_departure_time) + time_taken * 3600)
    WHERE Delivery_ID = delID;

    -- Commit the transaction if no errors occur
    COMMIT;
END$$
DELIMITER ;



DELIMITER $$
DROP PROCEDURE IF EXISTS `release_workers`$$
CREATE PROCEDURE `release_workers`(delID INT)
BEGIN
    -- Error handler for rolling back the transaction if an error occurs
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    -- Start transaction
    START TRANSACTION;
    
    UPDATE driver d
    RIGHT JOIN truck_delivery td ON td.Driver_ID = d.Driver_ID
    SET d.Availability = 'Rest'
    WHERE td.Truck_Del_ID = delID;
    
    UPDATE truck t
    RIGHT JOIN truck_delivery td ON td.Truck_ID = t.Truck_ID
    SET t.Availability = 1
    WHERE td.Truck_Del_ID = delID;
    
    UPDATE driver_assistant da
    RIGHT JOIN truck_delivery td ON td.Assistant_ID = da.Assistant_ID
    SET da.Availability = 'Rest'
    WHERE td.Truck_Del_ID = delID;

    COMMIT;
END $$
DELIMITER ;




DELIMITER $$
DROP PROCEDURE IF EXISTS GetCartOf $$
CREATE PROCEDURE GetCartOf (IN customer_id INT)
BEGIN
	SELECT 
		product.product_id as product_id,
		product_name, 
		image_link, 
		Price AS unit_price, 
		SUM(Order_item.Quantity) AS total_quantity
	FROM Order_item
	JOIN Orders 
		ON Order_item.Order_ID = Orders.Order_ID
	JOIN Product
		ON Order_item.Product_ID = Product.Product_ID
	WHERE Orders.Customer_ID = customer_id
	AND Orders.order_state = 'Pending'
	GROUP BY Product.Product_ID, Product.Product_name, Product.Image_Link, Product.Price;
END $$
DELIMITER ;



DELIMITER $$
DROP PROCEDURE IF EXISTS GetCurrentOrder$$
CREATE PROCEDURE GetCurrentOrder(IN customer_id_ INT)
BEGIN
	SELECT 
		Order_ID,
		DATE(Ordered_Date) AS Ordered_Date,
		DATE(Expected_Date) AS Expected_Date,
		Total_Price
	FROM Orders
	WHERE 
		Customer_ID = customer_id_ 
		AND Order_state = 'Paid'
	ORDER BY Ordered_Date DESC;
END$$
DELIMITER ;



DELIMITER $$
DROP PROCEDURE IF EXISTS GetCurrentOrderItem$$
CREATE PROCEDURE GetCurrentOrderItem(IN Order_id INT)
BEGIN
	SELECT 
		p.Product_Name,
        p.Image_Link,
		oi.Quantity,
		oi.Order_item_Price
	FROM Order_Item oi
	Join Product p 
    ON p.product_id = oi.product_id
    WHERE oi.Order_ID = Order_id
	ORDER BY oi.Order_item_price DESC;
END$$
DELIMITER ;




DELIMITER $$

DROP PROCEDURE IF EXISTS GetPreviousOrder$$
CREATE PROCEDURE GetPreviousOrder(IN customer_id INT)
BEGIN
	SELECT 
		Order_ID,
		DATE(Ordered_Date) AS Ordered_Date,
		Total_Price
	FROM Orders
	WHERE 
		Customer_ID = customer_id 
		AND Order_state = 'Completed'
	ORDER BY Ordered_Date DESC
	LIMIT 1;
END$$
DELIMITER ;




DELIMITER //
DROP PROCEDURE IF EXISTS getTrainsByStoreID//
CREATE PROCEDURE getTrainsByStoreID(IN storeID INT)
BEGIN
    SELECT 
        t.Train_ID,
        t.Train_Name,
        ts.Day,
        ts.Start_Time,
        t.Available_space
    FROM 
        Train t
    JOIN 
        Train_Schedule ts ON t.Train_ID = ts.Train_ID
    JOIN 
        Destination d ON ts.Trip_ID = d.Trip_ID
    JOIN 
        Store s ON d.Store_ID = s.Store_ID
    JOIN 
        Store_Manager sm ON sm.Store_ID = s.Store_ID
    WHERE 
        s.Store_ID = storeID;
END //
DELIMITER ;





DELIMITER //
DROP PROCEDURE IF EXISTS getDriversByCity//
CREATE PROCEDURE getDriversByCity(IN cityName VARCHAR(255))
BEGIN
    SELECT 
        d.Driver_ID,
        d.Work_Hours,
        d.Availability,
        s.City
    FROM 
        Driver d
    JOIN 
        Store s ON d.Store_ID = s.Store_ID
    WHERE 
        s.City = cityName;
END //
DELIMITER ;




DELIMITER //
DROP PROCEDURE IF EXISTS getAssistantsByCity//
CREATE PROCEDURE getAssistantsByCity(IN cityName VARCHAR(255))
BEGIN
    SELECT 
        da.Assistant_ID,
        da.Work_Hours,
        da.Availability,
        s.City
    FROM 
        Driver_Assistant da
    JOIN 
        Store s ON da.Store_ID = s.Store_ID
    WHERE 
        s.City = cityName;
END //
DELIMITER ;





DELIMITER //
DROP PROCEDURE IF EXISTS getVehiclesByCity//
CREATE PROCEDURE getVehiclesByCity(IN cityName VARCHAR(255))
BEGIN
    SELECT 
        t.Truck_ID,
        t.Reg_Number,
        t.Used_Hours,
        t.Availability,
        s.City
    FROM 
        Truck t
    JOIN 
        Store s ON t.Store_ID = s.Store_ID
    WHERE 
        s.City = cityName;
END //
DELIMITER ;



DROP procedure IF EXISTS `GetAdminDetails`;
DELIMITER //
CREATE PROCEDURE GetAdminDetails(IN adminID INT)
BEGIN
    SELECT sm.Name, sm.Email,sm.Store_ID, s.City
    FROM store_manager sm
    JOIN store s ON sm.Store_ID = s.Store_ID
    WHERE sm.Manager_ID = adminID;
END //
DELIMITER ;




DROP PROCEDURE IF EXISTS `GetOrderCountByCustomer`;
DELIMITER $$

CREATE PROCEDURE GetOrderCountByCustomer(Store_ID INT)
BEGIN
    SELECT 
        Customer_ID,
        COUNT(Order_ID) AS Total_Orders
    FROM 
        Orders
    WHERE 
        Order_state != 'Pending' and orders.Store_ID = Store_ID
    GROUP BY 
        Customer_ID;
END$$

DELIMITER ;



DROP procedure IF EXISTS getManagerByStore;
DELIMITER //

CREATE PROCEDURE getManagerByStore(IN cityName VARCHAR(255))
BEGIN
    SELECT * 
    FROM store_manager_view
    WHERE City = cityName;
END //

DELIMITER ;



DROP PROCEDURE IF EXISTS InsertManager;
DELIMITER //

CREATE PROCEDURE InsertManager(
    IN managerName VARCHAR(255),
    IN managerUsername VARCHAR(255),
    IN managerPassword VARCHAR(255),
    IN managerEmail VARCHAR(255),
    IN managerPhoneNumber VARCHAR(20),
    IN cityName VARCHAR(255)
)
BEGIN
    DECLARE storeId INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    SELECT Store_Id INTO storeId 
    FROM store
    WHERE City = cityName;
    
    INSERT INTO store_manager (Name, Username, Password, Email, PhoneNumber, Store_id)
    VALUES (managerName, managerUsername, managerPassword, managerEmail, managerPhoneNumber, storeId);
    
    COMMIT;
END //

DELIMITER ;




DELIMITER //
DROP PROCEDURE IF EXISTS GetAvailabilityCounts//
CREATE PROCEDURE GetAvailabilityCounts(IN input_store_id INT)
BEGIN
    SELECT 
        (SELECT COUNT(Driver_ID) FROM Driver WHERE Store_ID = input_store_id) AS Total_Drivers,
        (SELECT COUNT(Driver_ID) FROM Driver WHERE Availability = 'Rest' AND Store_ID = input_store_id) AS Available_Drivers,
        
        (SELECT COUNT(Assistant_ID) FROM Driver_Assistant WHERE Store_ID = input_store_id) AS Total_Assistants,
        (SELECT COUNT(Assistant_ID) FROM Driver_Assistant WHERE Availability = 'Rest' AND Store_ID = input_store_id) AS Available_Assistants,
        
        (SELECT COUNT(Truck_ID) FROM Truck WHERE Store_ID = input_store_id) AS Total_Trucks,
        (SELECT COUNT(Truck_ID) FROM Truck WHERE Availability = TRUE AND Store_ID = input_store_id) AS Available_Trucks
    FROM DUAL;
END //

DELIMITER ;



DELIMITER //
DROP PROCEDURE IF EXISTS GetIncompleteOrders//
CREATE PROCEDURE `GetIncompleteOrders`(IN store_id_ INT)
BEGIN
	SELECT COUNT(*) AS Total_Order_Count
    FROM Orders
    WHERE Order_state != 'Pending' and Store_ID = store_id_;

    SELECT COUNT(*) AS Incomplete_Order_Count
    FROM Orders
    WHERE Order_state != 'Complete' AND Order_state != 'Pending' and Store_ID = store_id_;

    SELECT Order_ID, Customer_ID, Route_ID, Order_state
    FROM Orders
    WHERE Order_state != 'Complete' AND Order_state != 'Pending' and Store_ID = store_id_;

END //

DELIMITER ;




DELIMITER //
DROP PROCEDURE IF EXISTS CheckoutOrder//
CREATE PROCEDURE CheckoutOrder(
    IN p_Customer_ID INT,
    IN p_Store_ID INT,
    IN p_Route_ID INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK; 
    END;

    START TRANSACTION;

    UPDATE Orders 
    SET order_state = 'Paid',
        ordered_date = CURRENT_DATE,
        expected_date = DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY),
        Store_ID = p_Store_ID,
        Route_ID = p_Route_ID
    WHERE Customer_ID = p_Customer_ID AND order_state = 'Pending';

    -- Check if any rows were affected
    IF ROW_COUNT() = 0 THEN
        ROLLBACK;
        SELECT 'No pending order found for checkout.' AS message, 0 AS success;
    ELSE
        COMMIT;
        SELECT 'Checkout successful.' AS message, 1 AS success;
    END IF;
END //

DELIMITER ;


DELIMITER //
DROP PROCEDURE IF EXISTS createTrainSchedule//
CREATE PROCEDURE `createTrainSchedule`(IN delID INT, IN trainID INT)
BEGIN
    -- Declare variables
    DECLARE capacity_ INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Rollback transaction on error
        ROLLBACK;
        -- Optionally, you can signal an error here if needed
    END;

    -- Start the transaction
    START TRANSACTION;

    -- Insert into Train_Delivery table
    INSERT INTO Train_Delivery (Train_Del_ID, Train_ID) VALUES (delID, trainID);
    
    -- Update Delivery_Schedule to set departure time and status
    UPDATE Delivery_Schedule
    SET Vehicle_departure_time = CURTIME(), Delivery_status = 'On_Train'
    WHERE Delivery_ID = delID;

    -- Get the total capacity from Orders related to the specific Delivery ID
    SELECT SUM(o.Total_Capacity)
    INTO capacity_
    FROM Orders o
    JOIN Order_Delivery od ON od.Order_ID = o.Order_ID
    JOIN Delivery_Schedule ds ON ds.Delivery_ID = od.Delivery_ID
    WHERE ds.Delivery_ID = delID;

    -- Update the Train table to decrease the available space
    UPDATE Train t
    SET Available_space = Available_space - capacity_
    WHERE t.Train_ID = trainID;

    -- Commit the transaction if all statements succeed
    COMMIT;

END//
DELIMITER ;

