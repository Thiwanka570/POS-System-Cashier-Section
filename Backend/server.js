const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');


const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

// Use the express-session middleware to create a session

const multer = require('multer');





const db = mysql.createConnection(
    {
        host: "localhost",
        user: 'root',
        password: '',
        database: "techo",
    }

)


app.get('/', (err, res) => {
    return res.json("from backend connection")
})


// Configure and use express-session
app.use(
    session({
        secret: 'your-secret-key', // Replace with a strong secret key
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false, // Set to true for HTTPS
            maxAge: 3600000, // Session timeout in milliseconds (e.g., 1 hour)
        },
    })
);

// Define your routes and other server setup



// ######################## ITEM Controling ###################################################################

app.get('/items', (req, res) => {
    const sql = "SELECT * FROM items";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);

    })
})

app.put('/updateItem/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    const {
        item_name,
        item_sell_price,
        quantity,
        purchase_price,
        cut_price,
        description,
        images,
        category,
    } = req.body;

    const updateSql = `
        UPDATE items
        SET
            item_name = ?,
            item_sell_price = ?,
            quentity = ?,
            purchase_price = ?,
            cut_price = ?,
            description = ?,
            images = ?,
            category = ?
        WHERE
            ID = ?
    `;

    db.query(
        updateSql,
        [item_name, item_sell_price, quantity, purchase_price, cut_price, description, images, category, id],
        (err, result) => {
            if (err) {
                console.error("Item Update Unsuccessful:", err);
                res.status(500).json({ error: "Item Update Unsuccessful" });
            } else {
                console.log("Item Updated Successfully");
                res.status(200).json({ message: "Item Updated Successfully" });
            }
        }
    );
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'D:/HND/WEB_PROJECTS/techoparadise/frontend/src/itemImages/'); // Replace 'uploads' with your desired folder path
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('images'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    const { filename } = req.file;
    res.json({ filename: filename });
});


app.post('/saveitem', (req, res) => {
    const {
        item_name,
        item_sell_price,
        quantity,
        purchase_price,
        cut_price,
        description,
        images,
        category,
    } = req.body;

    const itemAddSql = `INSERT INTO items (item_name, item_sell_price, quentity, purchase_price, cut_price, description, images, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
        itemAddSql,
        [item_name, item_sell_price, quantity, purchase_price, cut_price, description, images, category],
        (err, result) => {
            if (err) {
                console.error('Item Update Unsuccessful:', err);
                res.status(500).json({ error: 'Item Add Unsuccessful' });
            } else {
                console.log('Item Add Successfully');
                res.status(200).json({ message: 'Item Add Successfully' });
            }
        }
    );
});




app.delete('/deleteItem/:id', (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM items WHERE ID=${id}`;
    db.query(sql, (err, result) => {
        if (err) {
            console.log('Error Deleting Data : ', err);
        }

        console.log('Delete successfully');
    });
});

//get all category items

app.get('/categorys/:category', (req, res) => {
    const category = req.params.category;
    const lapsql = 'SELECT * FROM items WHERE category = ?'; // Use a placeholder

    db.query(lapsql, [category], (err, lapdata) => {
        if (err) {
            console.log('Error fetching laptops', err);
            return res.status(500).json({ error: 'An error occurred while processing your request.' });
        }
        return res.json(lapdata);
    });
});

app.get('/itemCat', (req, res) => {
    const catSql = 'SELECT cat_name FROM category';
    db.query(catSql, (err, category) => {
        if (err) {
            console.log('Error fetching laptops', err);
            return res.status(500).json({ error: 'An error occurred while processing your request.' });
        }
        return res.json(category);
    });
})

//#################################### Searching ########################################################

app.get('/search', (req, res) => {
    const { query } = req.query;

    const sql = 'SELECT * FROM items WHERE item_name LIKE ?';

    // Use a wildcard '%' for a case-insensitive search
    const searchTerm = query;

    db.query(sql, [searchTerm], (err, searchResults) => {
        if (err) {
            console.error('Error fetching search results:', err);
            res.status(500).json({ error: 'An error occurred while processing your request.' });
        } else {
            res.json({ items: searchResults });
        }
    });
});

//##################################### BIlling Control ###############################################################

// app.post('/checkout', (req, res) => {
//     const {
//         total,
//         discount,
//         cost,
//         payment,
//         balance,
//         cusname,
//         cusphone,
//         cusaddress,

//     } = req.body;

//     const itemAddSql = `INSERT INTO billing (total, discount, cost,payment, balance, cusname, cusphone, cusaddress) VALUES (?, ?, ?,?, ?, ?, ?, ?)`;

//     db.query(
//         itemAddSql,
//         [total, discount, cost,payment, balance, cusname, cusphone, cusaddress],
//         (err, result) => {
//             if (err) {
//                 console.error('Billing Unsuccessful:', err);
//                 res.status(500).json({ error: 'Item Add Unsuccessful' });
//             } else {
//                 console.log('Billing Successfully');
//                 res.status(200).json({ message: 'Item Add Successfully' });
//             }
//         }
//     );
// })

// Assuming your 'billing' table has a 'date' column

app.get('/checkouts', (req, res) => {
    const { startDate, endDate } = req.query;

    // Modify the SQL query to include date range filtering
    let CheckSql = 'SELECT * FROM billing';
    const dateConditions = [];

    if (startDate) {
        const startDateFormatted = new Date(startDate).toISOString().split('T')[0];
        dateConditions.push(`date >= '${startDateFormatted}'`);
    }

    if (endDate) {
        const endDateFormatted = new Date(endDate).toISOString().split('T')[0];
        dateConditions.push(`date <= '${endDateFormatted}'`);
    }

    if (dateConditions.length > 0) {
        CheckSql += ` WHERE ${dateConditions.join(' AND ')}`;
    }

    db.query(CheckSql, (err, checkData) => {
        if (err) {
            console.log('Error fetching checkouts', err);
            return res.status(500).json({ error: 'An error occurred while processing your request.' });
        }
        return res.json(checkData);
    });
});



app.get('/invoiceItemdata/:invoiceId', (req, res) => {
    const invoiceId = req.params.invoiceId;

    const CheckSql = `SELECT itemid FROM item_selling WHERE invoiceid=${invoiceId}`;
    db.query(CheckSql, (err, itemidsResult) => {
        if (err) {
            console.log('Error fetching invoiceItemdata', err);
            return res.status(500).json({ error: 'An error occurred while processing your request.invoiceItemdata' });
        }

        const itemids = itemidsResult.map(item => item.itemid).join(',');

        const sql = `SELECT * FROM items WHERE ID IN (${itemids})`;
        db.query(sql, (err, data) => {
            if (err) {
                console.log('Error fetching item data', err);
                return res.status(500).json({ error: 'An error occurred while processing your request to fetch item data.' });
            }
            console.log(data);
            return res.json(data);
        });
    });
});


app.get('/selectCheckout/:invoiceId', (req, res) => {
    const invoiceId = req.params.invoiceId;
    const CheckSql = `SELECT * FROM billing WHERE invoiceNo=${invoiceId}`;
    db.query(CheckSql, (err, invoicedata) => {
        if (err) {
            console.log('Error fetching selectCheckout', err);
            return res.status(500).json({ error: 'An error occurred while processing your request.selectCheckout' });
        }
        console.log(invoicedata);
        return res.json(invoicedata);
    });
});

app.delete('/deleteCheckout/:invoiceId', (req, res) => {
    const invoiceId = req.params.invoiceId;
    const deleteSql = `DELETE FROM billing WHERE invoiceNo=${invoiceId}`;
    
    db.query(deleteSql, (err, result) => {
        if (err) {
            console.log('Error deleting checkout', err);
            return res.status(500).json({ error: 'An error occurred while processing your request.' });
        }

        // Check if any rows were affected to determine if the deletion was successful
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Checkout not found.' });
        }

        return res.json({ message: 'Checkout deleted successfully.' });
    });
});





app.post('/checkout', (req, res) => {
    const { total, discount, cost, payment, balance, cusname, cusphone, cusaddress, items } = req.body;
    console.log(items);


    // Insert checkout details
    const checkoutSql = 'INSERT INTO billing (total, discount, cost, payment, balance, cusname, cusphone, cusaddress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const checkoutValues = [total, discount, cost, payment, balance, cusname, cusphone, cusaddress];

    db.query(checkoutSql, checkoutValues, (checkoutError, checkoutResults) => {
        if (checkoutError) {
            console.error('Error saving checkout to database:', checkoutError);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        } else {
            console.log("added to table");
            let checkoutid = checkoutResults.insertId;
            console.log(items);

            // Extract item IDs from the items array
            const itemIds = items.map((item) => item.ID);

            // Create an array of arrays for each item and checkout ID pair
            const itemValues = itemIds.map((itemId) => [checkoutid, itemId]);

            console.log(itemValues);

            // Insert item details for each item
            const itemSellingSql = 'INSERT INTO item_selling (invoiceid, itemid) VALUES ?';

            db.query(itemSellingSql, [itemValues], (itemSellingError, itemSellingResults) => {
                if (itemSellingError) {
                    console.error('Error saving itemSelling to database:', itemSellingError);
                    res.status(500).json({ error: 'Internal Server Error' });
                    return;
                }

                res.json({ message: 'Checkout details and item details added to the database', checkoutid });
            });


        }
    });
});


// ######################## client login & Register ###################################################################

app.post('/register', (req, res) => {
    // Extract form data from the request body
    const {
        ClientUserName,
        mobileNumber,
        email,
        ClientHome,
        street1,
        street2,
        district,
        province,
        password,
    } = req.body;

    const address = ClientHome + "," + street1 + "," + street2 + "," + district + "," + province;
    console.log(mobileNumber);
    const addClientQuery = `INSERT INTO clients_data (username, phonenumber, email, address, password) VALUES (?, ?, ?, ?, ?)`;
    db.query(
        addClientQuery,
        [ClientUserName, mobileNumber, email, address, password],
        (err, result) => {
            if (err) {
                console.log("User adding failed:", err);
                // Send an error resposnse to the client
                res.status(500).json({ message: 'User adding failed' });
            } else {
                console.log("User adding success");
                // Send a success response to the client
                res.status(200).json({ message: 'User added successfully' });
            }
        }
    );
});

app.get('/getuser', (req, res) => {

    const addClientQuery = `SELECT * FROM  clients_data ;`;
    db.query(
        addClientQuery,
        (err, result) => {
            if (err) {
                console.log("User adding failed:", err);
                // Send an error resposnse to the client
                res.status(500).json({ message: 'User adding failed' });
            } else {
                return res.json(result);
            }
        }
    );
});

app.post('/checkpassword', (req, res) => {
    const { password } = req.body;
    const query = 'SELECT * FROM clients_data WHERE password = ?';

    db.query(query, [password], (err, result) => {
        if (result.length === 0) {
            console.log('Password is not used');
            res.status(200).send({ message: 'Password is not used' });
        } else {
            console.log('Password is used');
            res.status(400).send({ message: 'Password is already used' });
        }
    });
});



//decript hash password and save it

app.post('/login', (req, res) => {

    const { logusername, logpassword } = req.body;

    if (!logusername || !logpassword) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const queryCheck = "SELECT * FROM clients_data WHERE (phonenumber = ? OR email = ?) AND password = ?";

    db.query(queryCheck, [logusername, logusername, logpassword], (err, results) => {
        if (err) {
            console.log("Database error:", err);
            return res.status(500).json({ error: "An error occurred while processing your request." });
        }

        if (results.length === 1) {
            console.log('Login successful');
            // if (!req.session) {
            //     req.session = {};
            // }
            // req.session.username = results[0].username;
            return res.status(200).json({ username: logusername });


            // Rest of your code
        } else {
            // Invalid credentials
            console.log("Login failed");
            return res.status(401).json({ error: "Invalid credentials" });
        }
    });
});


//###################### session Controller ################################################

app.get('/getCookieValue/:userValue', (req, res) => {
    const userVal = req.params.userValue;
    const getuserdataquery = `SELECT * FROM clients_data WHERE phonenumber=${userVal}`;

    db.query(getuserdataquery, (err, userData) => {
        if (err) {
            console.log("Data fetch Error");
            return res.status(500).json({ error: "Data fetch Error" });
        } else {
            console.log("Data fetch success");
            const user = userData[0]; // Assuming there is only one user with a given phone number

            const address = userData[0].address;
            const phn = userData[0].phonenumber;
            const name = userData[0].name;
            const item = userData[0].address;


            // Insert data into the "buyers" table
            // const buyerUpquery = 'INSERT INTO buers (name, address, item, qty, phn) VALUES (?,?,?,?,?)';
            // const { name, address, item, qty, phn } = userData[0]; // Replace with your actual data
            // db.query(buyerUpquery, [name, address, item, qty, phn], (err, data) => {
            //     if (err) {
            //         console.log("Data insert Error");
            //         return res.status(500).json({ error: "Data insert Error" });
            //     } else {
            //         console.log("Data insert success");
            //         return res.status(200).json({
            //             message: "Data inserted successfully",
            //             userData: user,
            //         });
            //     }
            // });
        }
    });
});




// ######################## reviews control ###################################################################
app.get('/reviews/:item_id', (req, res) => {
    const id = req.params.item_id;
    const sql = `SELECT * FROM reviews WHERE item_id=${id}`;
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);

    })
})


//###################### mycart ####################################################3##################################

app.post('/cart/:itemid', (req, res) => {
    const itemid = req.params.itemid;
    const data = req.body;
    const cookiesusername = data.sessionToken;// Access data sent in the request body

    // You can access data sent in the request body using credentials
    console.log(cookiesusername);// Assuming sessionToken is sent in the request body

    if (!cookiesusername) {
        console.log("Username is undefined");
    }

    const cartquery = 'INSERT INTO cart (username, itemid) VALUES (?, ?)';
    db.query(cartquery, [cookiesusername, itemid], (err, data) => {
        if (err) {
            console.log("Data insert Error");
            return res.status(500).json({ error: "Data insert Error" });
        } else {
            console.log("Data insert success");
            return res.status(200).json({ message: "Data inserted successfully" });
        }
    });
});


app.get('/getCart/:userid', (req, res) => {
    const sessUserId = req.params.userid;
    const cartgetquery = 'SELECT itemid FROM cart WHERE username = ?';

    db.query(cartgetquery, [sessUserId], (err, cartData) => {
        if (err) {
            console.log('Error getting items from the cart', err);
            return res.status(500).json({ error: "Error getting items from the cart" });
        }
        const itemIds = cartData.map((item) => item.itemid);

        if (itemIds.length !== 0) {
            const sqlforcart = 'SELECT * FROM items WHERE id IN (?)'; // Change IN (?) to IN (?)

            db.query(sqlforcart, [itemIds], (err, itemData) => {
                if (err) {
                    console.log('Error fetching items from the items table', err);
                    return res.status(500).json({ error: "Error fetching items from the items table" });
                } else {
                    return res.json(itemData);
                }
            });
        } else {
            return res.json([]);
        }
    });
});

app.delete('/cartitemDelete/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM cart WHERE itemid = ?'; // Use a parameterized query

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log('Error Deleting Data: ', err);
            return res.status(500).json({ error: "Error deleting cart item" });
        }

        console.log('Cart item deleted successfully');
        return res.status(200).json({ message: "Cart item deleted successfully" });
    });
});
app.listen(8081, () => {
    console.log("Listening");
});


app.post('/cart/:itemid', (req, res) => {
    const itemid = req.params.itemid;
    const data = req.body;
    const cookiesusername = data.sessionToken;// Access data sent in the request body

    // You can access data sent in the request body using credentials
    console.log(cookiesusername);// Assuming sessionToken is sent in the request body

    if (!cookiesusername) {
        console.log("Username is undefined");
    }

    const cartquery = 'INSERT INTO cart (username, itemid) VALUES (?, ?)';
    db.query(cartquery, [cookiesusername, itemid], (err, data) => {
        if (err) {
            console.log("Data insert Error");
            return res.status(500).json({ error: "Data insert Error" });
        } else {
            console.log("Data insert success");
            return res.status(200).json({ message: "Data inserted successfully" });
        }
    });
});

let marketItems = [];

app.post('/api/market/items', (req, res) => {
    const newItem = req.body; 
  
    marketItems.push(newItem);
    res.status(201).json({ message: 'Item added successfully', item: newItem });
  });

