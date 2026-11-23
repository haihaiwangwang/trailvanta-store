-- Safe to run after 0001: only add demo products whose names are not already present.
UPDATE products SET description='A roomy, easy-pitch shelter for weekends outside.' WHERE name='Trailblazer 2-Person Tent' AND COALESCE(description,'')='';
UPDATE products SET description='A versatile daypack with space for the essentials.' WHERE name='All-Terrain Hiking Backpack' AND COALESCE(description,'')='';
UPDATE products SET description='A simple, portable set for full-body workouts.' WHERE name='Resistance Band Training Set' AND COALESCE(description,'')='';
UPDATE products SET description='Flexible strength training for home sessions.' WHERE name='Adjustable Fitness Dumbbell' AND COALESCE(description,'')='';
UPDATE products SET description='Everyday cycling protection with a clean profile.' WHERE name='Urban Ride Helmet' AND COALESCE(description,'')='';
UPDATE products SET description='Handy tools for common roadside adjustments.' WHERE name='Compact Bike Repair Kit' AND COALESCE(description,'')='';
UPDATE products SET description='A versatile board kit for calm-water exploring.' WHERE name='Inflatable Paddle Board Kit' AND COALESCE(description,'')='';
UPDATE products SET description='A comfortable fit for pool and open-water sessions.' WHERE name='Quick-Dry Swim Goggles' AND COALESCE(description,'')='';

INSERT INTO products(name,description,category,price,stock,sort_order)
SELECT 'Compact Camping Lantern','Warm light for camp nights and early starts.','Camping',28,30,3
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Compact Camping Lantern');
INSERT INTO products(name,description,category,price,stock,sort_order)
SELECT 'Insulated Outdoor Bottle','A durable bottle for long days on the move.','Camping',22,45,4
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Insulated Outdoor Bottle');
INSERT INTO products(name,description,category,price,stock,sort_order)
SELECT 'Performance Yoga Mat','A comfortable base for stretching and flow.','Fitness',35,28,7
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Performance Yoga Mat');
INSERT INTO products(name,description,category,price,stock,sort_order)
SELECT 'Agility Training Cones','Set up drills and quick-footwork sessions.','Fitness',18,60,8
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Agility Training Cones');
INSERT INTO products(name,description,category,price,stock,sort_order)
SELECT 'Cycling Gloves','Comfort-focused grip for daily rides.','Cycling',16,50,11
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Cycling Gloves');
INSERT INTO products(name,description,category,price,stock,sort_order)
SELECT 'LED Bike Light Set','A front and rear light set for added visibility.','Cycling',25,32,12
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='LED Bike Light Set');
INSERT INTO products(name,description,category,price,stock,sort_order)
SELECT 'Waterproof Dry Bag','Keep everyday essentials together near the water.','Water Sports',21,40,15
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Waterproof Dry Bag');
INSERT INTO products(name,description,category,price,stock,sort_order)
SELECT 'Floating Swim Buoy','A bright visibility aid for open-water practice.','Water Sports',29,22,16
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Floating Swim Buoy');
