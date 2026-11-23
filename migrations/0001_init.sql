CREATE TABLE products(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,description TEXT DEFAULT '',category TEXT NOT NULL,price REAL NOT NULL CHECK(price>=0),currency TEXT DEFAULT 'USD',image_url TEXT DEFAULT '',stock INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1,sort_order INTEGER DEFAULT 0,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE orders(id INTEGER PRIMARY KEY AUTOINCREMENT,order_number TEXT UNIQUE NOT NULL,customer_name TEXT NOT NULL,email TEXT NOT NULL,address TEXT NOT NULL,city TEXT NOT NULL,country TEXT NOT NULL,postal_code TEXT NOT NULL,total REAL NOT NULL,currency TEXT DEFAULT 'USD',status TEXT DEFAULT 'pending_payment',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE order_items(id INTEGER PRIMARY KEY AUTOINCREMENT,order_number TEXT NOT NULL,product_id INTEGER NOT NULL,product_name TEXT NOT NULL,unit_price REAL NOT NULL,quantity INTEGER NOT NULL);
CREATE TABLE messages(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT NOT NULL,message TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);

INSERT INTO products(name,description,category,price,stock,sort_order) VALUES
('Trailblazer 2-Person Tent','A roomy, easy-pitch shelter for weekends outside.','Camping',89,20,1),
('All-Terrain Hiking Backpack','A versatile daypack with space for the essentials.','Camping',54,25,2),
('Compact Camping Lantern','Warm light for camp nights and early starts.','Camping',28,30,3),
('Insulated Outdoor Bottle','A durable bottle for long days on the move.','Camping',22,45,4),
('Resistance Band Training Set','A simple, portable set for full-body workouts.','Fitness',24,40,5),
('Adjustable Fitness Dumbbell','Flexible strength training for home sessions.','Fitness',69,12,6),
('Performance Yoga Mat','A comfortable base for stretching and flow.','Fitness',35,28,7),
('Agility Training Cones','Set up drills and quick-footwork sessions.','Fitness',18,60,8),
('Urban Ride Helmet','Everyday cycling protection with a clean profile.','Cycling',42,18,9),
('Compact Bike Repair Kit','Handy tools for common roadside adjustments.','Cycling',19,35,10),
('Cycling Gloves','Comfort-focused grip for daily rides.','Cycling',16,50,11),
('LED Bike Light Set','A front and rear light set for added visibility.','Cycling',25,32,12),
('Inflatable Paddle Board Kit','A versatile board kit for calm-water exploring.','Water Sports',249,6,13),
('Quick-Dry Swim Goggles','A comfortable fit for pool and open-water sessions.','Water Sports',16,50,14),
('Waterproof Dry Bag','Keep everyday essentials together near the water.','Water Sports',21,40,15),
('Floating Swim Buoy','A bright visibility aid for open-water practice.','Water Sports',29,22,16);
