const connection = require('../helpers/dbConfig');
const moment = require("moment");

const {
    transformPhoneNumber,
    appendToLogFile
} = require('../helpers/General');

//Customers
exports.newCustomer = (req, res) => {
    const {
        firstname,
        lastname,
        phone_number,
        email
    } = req.body;
    if(!email ||!firstname ||!phone_number){
        const resObject = {
            errorDesc:"Email, First Name and Phone are required",
            success:"0"
        };
        return res.status(200).send(resObject)
    }

    //  check if customer already exist
    checkuserQuery = 'SELECT * FROM tb_customers WHERE email = ?'
    connection.query(checkuserQuery,  [email], function(err, rows){
      if(err) {
        return res.send("Error in getting "+email);
      }else{
        if (!rows.length){
            const insertQuery = `INSERT INTO tb_customers (firstname, lastname, phone_number, email) VALUES (?, ?, ?, ?)`;
            const insertValues = [firstname, lastname, phone_number, email];
            connection.query(insertQuery , insertValues, function(err, results){
                const resObject = {
                    errorDesc: "Record has been created",
                    success:"1"
                };
                appendToLogFile( email+" has been registered");
                return res.status(200).send(resObject)
            });
        }else{
            const resObject = {
                errorDesc: email+" is already registered",
                success:"0"
            };
            return res.status(200).send(resObject);
        }
       }
    });
};

exports.getCustomerspagination = (req, res) => {
    const { page = 1, limit = 20, searchTerm = "" } = req.query;
    const offset = (page - 1) * limit;

    var sql = "SELECT * FROM tb_customers ORDER BY id ASC LIMIT ?, ?"
    if (searchTerm) {
        sql = `SELECT * FROM tb_customers WHERE email LIKE '%${searchTerm}%' OR phone_number LIKE '%${transformPhoneNumber(searchTerm)}%' OR firstname LIKE '%${searchTerm}%' OR lastname LIKE '%${searchTerm}%' ORDER BY id ASC LIMIT ?, ?`;
    }

    connection.query(sql, [offset, Number(limit)], function(error,rows){
        if(error) {
            return res.send("Error in getting the users");
        }else { 
            const resObject = {
                data: rows,
                success:"1"
            };
            return res.status(200).send(resObject);
        }
    });
};

exports.updateCustomer = (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, phone, email } = req.body;

    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    if (!firstname && !lastname && !phone && !email) {
        const resObject = {
            errorDesc: "At least one field (First Name, Last Name, Phone, or Email) is required to update",
            success: "0"
        };
        return res.status(400).send(resObject); // Changed status code to 400 for a bad request
    }

    // Check if the customer already exists with a different ID
    const checkUserQuery = 'SELECT * FROM tb_customers WHERE email = ? AND id != ?';
    connection.query(checkUserQuery, [email, id], function(err, rows) {
        if (err) {
            return res.status(500).send("Error in checking the customer's email: " + email);
        } else {
            if (email && rows.length) {
                const resObject = {
                    errorDesc: email + " is already registered",
                    success: "0"
                };
                return res.status(409).send(resObject); // Changed status code to 409 for conflict
            } else {
                // Dynamically build the UPDATE query based on the provided fields
                let updateFields = [];
                let updateValues = [];

                if (firstname) {
                    updateFields.push("firstname = ?");
                    updateValues.push(firstname);
                }
                if (lastname) {
                    updateFields.push("lastname = ?");
                    updateValues.push(lastname);
                }
                if (phone) {
                    updateFields.push("phone_number = ?");
                    updateValues.push(phone);
                }
                if (email) {
                    updateFields.push("email = ?");
                    updateValues.push(email);
                }

                updateFields.push("update_at = ?");
                updateValues.push(currentTime);
                // Add the ID to the end of the updateValues array
                updateValues.push(id);

                // Combine the fields into an SQL statement
                const updateQuery = `UPDATE tb_customers SET ${updateFields.join(', ')} WHERE id = ?`;

                connection.query(updateQuery, updateValues, function(err, results) {
                    if (err) {
                        return res.status(500).send("Error in updating the customer");
                    }
                    const resObject = {
                        errorDesc: "Record has been updated",
                        success: "1"
                    };
                    appendToLogFile(`Customer with ID ${id} has been updated with changes to the following fields: ${updateFields.map(field => field.split('=')[0]).join(', ')}`);
                    return res.status(200).send(resObject);
                });
            }
        }
    });
};


//Vendors
exports.newVendor = (req, res) => {
    const {
        firstname,
        lastname,
        phone,
        email
    } = req.body;
    if(!email ||!firstname ||!phone){
        const resObject = {
            errorDesc:"Email, First Name and Phone are required",
            success:"0"
        };
        return res.status(200).send(resObject)
    }

    //  check if customer already exist
    checkuserQuery = 'SELECT * FROM tb_vendors WHERE email = ?'
    connection.query(checkuserQuery,  [email], function(err, rows){
      if(err) {
        return res.send("Error in getting "+email);
      }else{
        if (!rows.length){
            const insertQuery = `INSERT INTO tb_vendors (firstname, lastname, phone_number, email) VALUES (?, ?, ?, ?)`;
            const insertValues = [firstname, lastname, phone, email];
            connection.query(insertQuery , insertValues, function(err, results){
                const resObject = {
                    errorDesc: "Record has been created",
                    success:"1"
                };
                appendToLogFile( email+" has been registered");
                return res.status(200).send(resObject)
            });
        }else{
            const resObject = {
                errorDesc: email+" is already registered",
                success:"0"
            };
            return res.status(200).send(resObject);
        }
       }
    });
};

exports.getVendorspagination = (req, res) => {
    const { page = 1, limit = 20, searchTerm = "" } = req.query;
    const offset = (page - 1) * limit;

    var sql = "SELECT * FROM tb_vendors ORDER BY id ASC LIMIT ?, ?"
    if (searchTerm) {
        sql = `SELECT * FROM tb_vendors WHERE email LIKE '%${searchTerm}%' OR phone_number LIKE '%${transformPhoneNumber(searchTerm)}%' OR firstname LIKE '%${searchTerm}%' OR lastname LIKE '%${searchTerm}%' ORDER BY id ASC LIMIT ?, ?`;
    }

    connection.query(sql, [offset, Number(limit)], function(error,rows){
        if(error) {
            return res.send("Error in getting the users");
        }else { 
            const resObject = {
                data: rows,
                success:"1"
            };
            return res.status(200).send(resObject);
        }
    });
};

exports.updateVendor = (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, phone, email } = req.body;

    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    if (!firstname && !lastname && !phone && !email) {
        const resObject = {
            errorDesc: "At least one field (First Name, Last Name, Phone, or Email) is required to update",
            success: "0"
        };
        return res.status(200).send(resObject);
    }

    // Check if the vendor already exists with a different ID
    const checkUserQuery = 'SELECT * FROM tb_vendors WHERE email = ? AND id != ?';
    connection.query(checkUserQuery, [email, id], function(err, rows) {
        if (err) {
            return res.status(500).send("Error in checking the vendor's email: " + email);
        } else {
            if (email && rows.length) {
                const resObject = {
                    errorDesc: email + " is already registered",
                    success: "0"
                };
                return res.status(200).send(resObject);
            } else {
                // Dynamically build the UPDATE query based on the provided fields
                let updateFields = [];
                let updateValues = [];

                if (firstname) {
                    updateFields.push("firstname = ?");
                    updateValues.push(firstname);
                }
                if (lastname) {
                    updateFields.push("lastname = ?");
                    updateValues.push(lastname);
                }
                if (phone) {
                    updateFields.push("phone_number = ?");
                    updateValues.push(phone);
                }
                if (email) {
                    updateFields.push("email = ?");
                    updateValues.push(email);
                }

                updateFields.push("update_at = ?");
                updateValues.push(currentTime);
                // Add the ID to the end of the updateValues array
                updateValues.push(id);

                // Combine the fields into an SQL statement
                const updateQuery = `UPDATE tb_vendors SET ${updateFields.join(', ')} WHERE id = ?`;

                connection.query(updateQuery, updateValues, function(err, results) {
                    if (err) {
                        return res.status(500).send("Error in updating the vendor");
                    }
                    const resObject = {
                        errorDesc: "Record has been updated",
                        success: "1"
                    };
                    appendToLogFile(`Vendor with ID ${id} has been updated`);
                    return res.status(200).send(resObject);
                });
            }
        }
    });
};

//Sales
exports.newSale = (req, res) => {
    const {
        customername,
        phone_number,
        item_name,
        quantity,
        sale_amount,
        payment_mode
    } = req.body;
    if(!customername ||!phone_number ||!item_name ||!quantity ||!sale_amount ||!payment_mode){
        const resObject = {
            errorDesc:"Customer Name, and Phone are required",
            success:"0"
        };
        return res.status(200).send(resObject)
    }

    const insertQuery = `INSERT INTO tb_sales (customername, phone_number, item_name, quantity, sale_amount, payment_mode) VALUES (?, ?, ?, ?, ?, ?)`;
    const insertValues = [customername, phone_number, item_name, quantity, sale_amount, payment_mode];
    connection.query(insertQuery , insertValues, function(err, results){
        const resObject = {
            errorDesc: "Record has been created",
            success:"1"
        };
        appendToLogFile("Sale has been registered");
        return res.status(200).send(resObject)
    });
  
};

exports.getSalespagination = (req, res) => {
    const { page = 1, limit = 20, searchTerm = "" } = req.query;
    const offset = (page - 1) * limit;

    var sql = "SELECT * FROM tb_sales ORDER BY id ASC LIMIT ?, ?"
    if (searchTerm) {
        sql = `SELECT * FROM tb_sales WHERE customername LIKE '%${searchTerm}%' OR phone_number LIKE '%${transformPhoneNumber(searchTerm)}%' OR item_name LIKE '%${searchTerm}%' OR payment_mode LIKE '%${searchTerm}%' ORDER BY id ASC LIMIT ?, ?`;
    }

    connection.query(sql, [offset, Number(limit)], function(error,rows){
        if(error) {
            return res.send("Error in getting the sales");
        }else { 
            const resObject = {
                data: rows,
                success:"1"
            };
            return res.status(200).send(resObject);
        }
    });
};

exports.updateSale = (req, res) => {
    const { id } = req.params;
    const {
        customername,
        phone_number,
        item_name,
        quantity,
        sale_amount,
        payment_mode
    } = req.body;

    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    const checkSaleQuery = 'SELECT * FROM tb_sales WHERE id = ?';
    connection.query(checkSaleQuery, [id], function(err, rows) {
        if (err) {
            return res.status(500).send("Error in checking the sale's id: " + id);
        } else {
            if (!rows.length) {
                const resObject = {
                    errorDesc: "Record is not found",
                    success: "0"
                };
                return res.status(200).send(resObject);
            } else {
                let updateFields = [];
                let updateValues = [];

                if (customername) {
                    updateFields.push("customername = ?");
                    updateValues.push(customername);
                }
                if (phone_number) {
                    updateFields.push("phone_number = ?");
                    updateValues.push(phone_number);
                }
                if (item_name) {
                    updateFields.push("item_name = ?");
                    updateValues.push(item_name);
                }
                if (quantity) {
                    updateFields.push("quantity = ?");
                    updateValues.push(quantity);
                }
                if (sale_amount) {
                    updateFields.push("sale_amount = ?");
                    updateValues.push(sale_amount);
                }
                if (payment_mode) {
                    updateFields.push("payment_mode = ?");
                    updateValues.push(payment_mode);
                }

                updateFields.push("update_at = ?");
                updateValues.push(currentTime);

                updateValues.push(id);

                // Combine the fields into an SQL statement
                const updateQuery = `UPDATE tb_sales SET ${updateFields.join(', ')} WHERE id = ?`;

                connection.query(updateQuery, updateValues, function(err, results) {
                    if (err) {
                        return res.status(500).send("Error in updating the vendor");
                    }
                    const resObject = {
                        errorDesc: "Record has been updated",
                        success: "1"
                    };
                    appendToLogFile(`Sale with ID ${id} has been updated`);
                    return res.status(200).send(resObject);
                });
            }
        }
    });
};

//Products
exports.newProduct = (req, res) => {
    const {
        productname,
        unit_price,
        total_quantity
    } = req.body;
    if(!productname ||!unit_price ||!total_quantity){
        const resObject = {
            errorDesc:"All fields are required",
            success:"0"
        };
        return res.status(200).send(resObject)
    }

    const insertQuery = `INSERT INTO tb_products (productname, unit_price, total_quantity) VALUES (?, ?, ?)`;
    const insertValues = [productname, unit_price, total_quantity];
    connection.query(insertQuery , insertValues, function(err, results){
        const resObject = {
            errorDesc: "Record has been created",
            success:"1"
        };
        appendToLogFile("Product has been registered");
        return res.status(200).send(resObject)
    });
  
};

exports.getProductspagination = (req, res) => {
    const { page = 1, limit = 20, searchTerm = "" } = req.query;
    const offset = (page - 1) * limit;

    var sql = "SELECT * FROM tb_products ORDER BY id ASC LIMIT ?, ?"
    if (searchTerm) {
        sql = `SELECT * FROM tb_products WHERE productname LIKE '%${searchTerm}%' ORDER BY id ASC LIMIT ?, ?`;
    }

    connection.query(sql, [offset, Number(limit)], function(error,rows){
        if(error) {
            return res.send("Error in getting the products");
        }else { 
            const resObject = {
                data: rows,
                success:"1"
            };
            return res.status(200).send(resObject);
        }
    });
};

exports.updateProduct = (req, res) => {
    const { id } = req.params;
    const {
        productname,
        unit_price,
        total_quantity
    } = req.body;

    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    const checkSaleQuery = 'SELECT * FROM tb_products WHERE id = ?';
    connection.query(checkSaleQuery, [id], function(err, rows) {
        if (err) {
            return res.status(500).send("Error in checking the sale's id: " + id);
        } else {
            if (!rows.length) {
                const resObject = {
                    errorDesc: "Record is not found",
                    success: "0"
                };
                return res.status(200).send(resObject);
            } else {
                let updateFields = [];
                let updateValues = [];

                if (productname) {
                    updateFields.push("productname = ?");
                    updateValues.push(productname);
                }
                if (unit_price) {
                    updateFields.push("unit_price = ?");
                    updateValues.push(unit_price);
                }
                if (total_quantity) {
                    updateFields.push("total_quantity = ?");
                    updateValues.push(total_quantity);
                }

                updateFields.push("update_at = ?");
                updateValues.push(currentTime);

                updateValues.push(id);

                // Combine the fields into an SQL statement
                const updateQuery = `UPDATE tb_products SET ${updateFields.join(', ')} WHERE id = ?`;

                connection.query(updateQuery, updateValues, function(err, results) {
                    if (err) {
                        return res.status(500).send("Error in updating the vendor");
                    }
                    const resObject = {
                        errorDesc: "Record has been updated",
                        success: "1"
                    };
                    appendToLogFile(`Product with ID ${id} has been updated`);
                    return res.status(200).send(resObject);
                });
            }
        }
    });
};

exports.getDashboardData = (req, res) => {
    var sql = "SELECT (SELECT COUNT(*) FROM tb_customers) as customers, (SELECT COUNT(*) FROM tb_sales) as sales, (SELECT COUNT(*) FROM tb_products) as products, (SELECT COUNT(*) FROM tb_vendors) as vendors"
     connection.query(sql, function(error, rows){
        if(error) {
            return res.send("Error in getting the dashboard data");
        }else { 
            const resObject = {
                data: rows,
                success:"1"
            };
            return res.status(200).send(resObject);
        }
    });
};