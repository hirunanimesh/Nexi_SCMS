DELIMITER $$
DROP TRIGGER IF EXISTS driver_status_after_assign$$
CREATE TRIGGER driver_status_after_assign
	AFTER INSERT ON Truck_Delivery
    FOR EACH ROW
BEGIN
	UPDATE driver d
    SET Availability = 'On_Trip'
    WHERE NEW.Driver_ID = d.Driver_ID;
	
    UPDATE truck t
    SET Availability = 0
    WHERE NEW.truck_ID = t.truck_ID;
    
    UPDATE driver_assistant da
    SET Availability = 'On_Trip'
    WHERE NEW.Assistant_ID = da.Assistant_ID;
END $$
DELIMITER ;


										 
DROP TRIGGER IF EXISTS driver_status_after_release;
DELIMITER $$
CREATE TRIGGER driver_status_after_release
	AFTER DELETE ON Truck_Delivery
    FOR EACH ROW
BEGIN
	UPDATE driver d
    SET Availability = 'Rest'
    WHERE OLD.Driver_ID = d.Driver_ID;
	
    UPDATE truck t
    SET Availability = 1
    WHERE OLD.truck_ID = t.truck_ID;
    
    UPDATE driver_assistant da
    SET Availability = 'Rest'
    WHERE OLD.Assistant_ID = da.Assistant_ID;
END $$
DELIMITER ;



DELIMITER $$
DROP TRIGGER IF EXISTS capacity_decrease_after_placement$$
CREATE TRIGGER capacity_decrease_after_placement
	AFTER INSERT ON order_delivery -- train_delivery
    FOR EACH ROW
BEGIN
	DECLARE capacity_ INT;
    DECLARE TrainID INT;
    
    SELECT o.Total_capacity
    INTO capacity_
    FROM orders o
    WHERE NEW.Order_ID = o.Order_ID;

    UPDATE train t
    JOIN train_delivery td ON t.Train_ID = td.Train_ID
    SET Available_space = Available_space-capacity_
    WHERE NEW.Delivery_ID = td.Train_Del_ID;
END$$
DELIMITER ;

DELIMITER $$
DROP TRIGGER IF EXISTS capacity_decrease_after_placement$$
CREATE TRIGGER capacity_decrease_after_placement
    AFTER INSERT ON ORDER_DELIVERY
    FOR EACH ROW
BEGIN
    DECLARE capacity_ INT;
    DECLARE TrainID TINYINT;

    -- Get the total capacity from the Orders table
    SELECT o.Total_Capacity
    INTO capacity_
    FROM Orders o
    WHERE NEW.Order_ID = o.Order_ID;

    -- Get the Train ID from the Train_Delivery table related to the new Delivery ID
    SELECT td.Train_ID
    INTO TrainID
    FROM Train_Delivery td
    WHERE NEW.Delivery_ID = td.Train_Del_ID;

    -- Update the Train table to decrease the available space
    UPDATE Train t
    SET Available_space = Available_space - capacity_
    WHERE t.Train_ID = TrainID;
END$$
DELIMITER ;





DROP TRIGGER IF EXISTS reduce_stock_after_order;
DELIMITER $$
CREATE TRIGGER reduce_stock_after_order
	AFTER INSERT ON order_item
    FOR EACH ROW
BEGIN
	UPDATE product
    SET Stock_Quantity=Stock_Quantity-NEW.Quantity
    WHERE NEW.Product_ID = product.Product_ID;
END$$
DELIMITER ;




DROP TRIGGER IF EXISTS increase_stock_after_delete;
DELIMITER $$
CREATE TRIGGER increase_stock_after_delete
	AFTER DELETE ON order_item
    FOR EACH ROW
BEGIN
	UPDATE product
    SET Stock_Quantity=Stock_Quantity+OLD.Quantity
    WHERE OLD.Product_ID = product.Product_ID;
END$$
DELIMITER ;



DELIMITER $$
DROP TRIGGER IF EXISTS update_order_totals $$
CREATE TRIGGER update_order_totals
AFTER INSERT ON Order_item
FOR EACH ROW
BEGIN
    DECLARE total_capacity INT;
    DECLARE total_price DECIMAL(10, 2);

    -- Calculate the total capacity and total price for the corresponding order
    SELECT SUM(order_item_capacity), SUM(order_item_price)
    INTO total_capacity, total_price
    FROM Order_item
    WHERE Order_item.Order_ID = NEW.Order_ID;

    -- Update the Orders table with the new totals (without changing dates)
    UPDATE Orders
    SET Total_Capacity = total_capacity,
        Total_Price = total_price
    WHERE Order_ID = NEW.Order_ID;
END $$

DELIMITER ;


DELIMITER $$
DROP TRIGGER IF EXISTS update_order_totals_after_delete $$
CREATE TRIGGER update_order_totals_after_delete
AFTER DELETE ON Order_item
FOR EACH ROW
BEGIN
    DECLARE total_capacity INT;
    DECLARE total_price DECIMAL(10, 2);

    -- Recalculate the total capacity and total price after a row is deleted
    SELECT IFNULL(SUM(order_item_capacity), 0), IFNULL(SUM(order_item_price), 0)
    INTO total_capacity, total_price
    FROM Order_item
    WHERE Order_ID = OLD.Order_ID;

    -- Update the Orders table with the recalculated totals
    UPDATE Orders
    SET Total_Capacity = total_capacity,
        Total_Price = total_price
    WHERE Order_ID = OLD.Order_ID;
END $$

DELIMITER ;


DELIMITER $$
CREATE  TRIGGER calculate_order_item_totals
BEFORE INSERT ON order_item
FOR EACH ROW
BEGIN
    -- Declare variables to store product capacity and price
    DECLARE product_capacity INT;
    DECLARE product_price DECIMAL(10, 2);
    
    -- Retrieve the capacity and price from the product table
    SELECT capacity, price INTO product_capacity, product_price
    FROM product WHERE Product_ID = NEW.product_id;
    
    -- Set the calculated total capacity and price for the new order item
    SET NEW.order_item_capacity = NEW.quantity * product_capacity;
    SET NEW.order_item_price = NEW.quantity * product_price;
END$$

DELIMITER ;


DELIMITER $$
CREATE TRIGGER check_available_space_before_update
BEFORE UPDATE ON Train
FOR EACH ROW
BEGIN
	IF NEW.Available_space < 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Available space must be greater than 0';
        
    END IF;
END$$
DELIMITER ;


SHOW TRIGGERS;