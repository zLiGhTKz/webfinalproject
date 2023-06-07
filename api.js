const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000;

// 解析请求体中的 JSON 数据
app.use(bodyParser.json());
app.use(cors());

// 创建 SQLite 数据库连接
const db = new sqlite3.Database('db2.sqlite');

// db.run(`INSERT INTO books (B_name, Author_name, B_stock, B_detail, B_price, B_pub, B_type, B_img)
// VALUES ('屁屁偵探讀本10：屁屁偵探戀愛了?!', 'Troll', 10, '精裝 / 96頁 / 14.8 x 21 x 1.34 cm / 普通級 / 全彩印刷 / 初版', 19.99, '遠流',1,'https://im2.book.com.tw/image/getImage?i=https://www.books.com.tw/img/001/090/42/0010904295.jpg&v=614c573ek&w=348&h=348')`);
//
// db.run(`INSERT INTO books (B_name, Author_name, B_stock, B_detail, B_price, B_pub, B_type, B_img)
// VALUES ('屁屁偵探讀本番外篇 咖哩香料事件', 'Troll', 10, '精裝 / 68頁 / 14.8 x 21 x 1.2 cm / 普通級 / 全彩印刷 / 初版', 19.99, '遠流',1,'https://im2.book.com.tw/image/getImage?i=https://www.books.com.tw/img/001/085/26/0010852635.jpg&v=5e6b60b3k&w=348&h=348')`);
//
// db.run(`INSERT INTO books (B_name, Author_name, B_stock, B_detail, B_price, B_pub, B_type, B_img)
// VALUES ('屁屁偵探讀本 被怪盜盯上的新娘', 'Troll', 10, '精裝 / 96頁 / 14.8 x 21 x 1.5 cm / 普通級 / 全彩印刷 / 初版', 19.99, '遠流',1,'https://im1.book.com.tw/image/getImage?i=https://www.books.com.tw/img/001/086/32/0010863254.jpg&v=5efc65c7k&w=348&h=348')`);
//db.run(`INSERT INTO customers (C_name, C_phone, C_address)
//  VALUES ('陳大文', '123456798', 'tw')`);

// 处理 GET 请求，获取书籍数据
app.get('/api/books', (req, res) => {
    db.all('SELECT * FROM books', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

// 处理 POST 请求，创建新书籍数据
app.post('/api/books', (req, res) => {
    const { B_name, Author_name, B_stock, B_detail, B_price, B_pub, B_type, B_img } = req.body;

    db.run(`INSERT INTO books (B_name, Author_name, B_stock, B_detail, B_price, B_pub, B_type, B_img)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [B_name, Author_name, B_stock, B_detail, B_price, B_pub, B_type, B_img],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.json({ success: true, B_ID: this.lastID });
            }
        });
});

app.get('/api/books/:bookId', (req, res) => {
    const bookId = req.params.bookId;

    // 在数据库中查询特定书籍
    const query = `SELECT * FROM books WHERE B_ID = ?`;
    db.get(query, [bookId], (err, book) => {
        if (err) {
            // 处理查询错误
            console.error('Error fetching book details:', err);
            res.status(500).json({ error: 'Failed to fetch book details' });
        } else {
            if (book) {
                // 查询成功，返回书籍详细信息
                res.json(book);
            } else {
                // 未找到书籍
                res.status(404).json({ error: 'Book not found' });
            }
        }
    });
});

// 处理 GET 请求，获取购物车数据
app.get('/api/cart', (req, res) => {
    db.all('SELECT * FROM cart', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

// 处理 POST 请求，将书籍添加到购物车
app.post('/api/cart', (req, res) => {
    const { B_ID, B_name, B_stock, B_price, B_img } = req.body;

    db.run(`INSERT INTO cart (B_ID, B_name, B_stock, B_price, B_img)
  VALUES (?, ?, ?, ?, ?)`,
        [B_ID, B_name, B_stock, B_price, B_img],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.json({ success: true, Car_ID: this.lastID });
            }
        });
});

app.delete('/api/cart/:id', (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM cart WHERE Car_ID = ?', [id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (this.changes > 0) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        }
    });
});


// 处理 GET 请求，获取顾客数据
app.get('/api/customers', (req, res) => {
    db.all('SELECT * FROM customers', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});
app.get('/api/customers/:customerId', (req, res) => {
    const customerId = req.params.customerId;

    // 查询特定用户
    const query = 'SELECT * FROM customers WHERE C_ID = ?';
    db.get(query, [customerId], (err, customer) => {
        if (err) {
            console.error('Error fetching customer details:', err);
            res.status(500).json({ error: 'Failed to fetch customer details' });
        } else {
            if (customer) {
                res.json(customer);
            } else {
                res.status(404).json({ error: 'Customer not found' });
            }
        }
    });
});

// 处理 POST 请求，创建新顾客数据
app.post('/api/customers', (req, res) => {
    const { C_name, C_phone, C_address , C_payment} = req.body;

    db.run(`INSERT INTO customers (C_name, C_phone, C_address, C_payment)
  VALUES (?, ?, ?,?)`,
        [C_name, C_phone, C_address, C_payment],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.json({ success: true, C_ID: this.lastID });
            }
        });
});

// 处理 GET 请求，获取订单数据
app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM orders', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

// 处理 POST 请求，创建新订单数据
app.post('/api/orders', (req, res) => {
    const { O_status, B_price, O_trip, O_payway, B_img, B_name} = req.body;

    db.run(`INSERT INTO orders (O_status, B_price, O_trip, O_payway, B_img, B_name)
  VALUES (?, ?, ?, ?, ?)`,
        [O_status, B_price, O_trip, O_payway, B_img, B_name],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.json({ success: true, O_ID: this.lastID });
            }
        });
});

// 处理 GET 请求，获取愿望清单数据
app.get('/api/wish', (req, res) => {
    db.all('SELECT * FROM wish', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

// 处理 POST 请求，将书籍添加到愿望清单
app.post('/api/wish', (req, res) => {
    const { B_ID, B_name, B_stock, B_price, B_img } = req.body;

    db.run(`INSERT INTO wish (B_ID, B_name, B_stock, B_price, B_img)
  VALUES (?, ?, ?, ?, ?)`,
        [B_ID, B_name, B_stock, B_price, B_img],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.json({ success: true, wishL_ID: this.lastID });
            }
        });
});
app.delete('/api/wish/:id', (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM wish WHERE wishL_ID = ?', [id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (this.changes > 0) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        }
    });
});
// 处理 GET 请求，获取历史记录数据
app.get('/api/history', (req, res) => {
    db.all('SELECT * FROM history', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

// 处理 POST 请求，将书籍添加到历史记录
app.post('/api/history', (req, res) => {
    const { B_ID, B_name, B_price } = req.body;

    db.run(`INSERT INTO history (B_ID, B_name, B_price)
  VALUES (?, ?, ?)`,
        [B_ID, B_name, B_price],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.json({ success: true, histL_ID: this.lastID });
            }
        });
});
// 处理 POST 请求，将购物车数据复制到订单和历史记录
app.post('/api/checkout', (req, res) => {
    // 获取购物车数据
    db.all('SELECT * FROM cart', (err, cartItems) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            // 复制购物车数据到订单表
            const ordersQuery = `INSERT INTO orders (O_status, B_price, O_trip, O_payway, B_img, B_name)
        SELECT 'Pending', B_price, 'Pending', 'PayPal', B_img, B_name FROM cart`;
            db.run(ordersQuery, function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    const orderId = this.lastID;

                    // 复制购物车数据到历史记录表
                    const historyQuery = `INSERT INTO history (B_ID, B_name, B_price, B_img)
            SELECT B_ID, B_name, B_price, B_img FROM cart`;
                    db.run(historyQuery, function (err) {
                        if (err) {
                            console.error(err);
                            res.status(500).send('Internal Server Error');
                        } else {
                            const historyIds = [];
                            cartItems.forEach((item) => {
                                historyIds.push(this.lastID);
                            });

                            // 清空购物车数据
                            db.run('DELETE FROM cart', function (err) {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send('Internal Server Error');
                                } else {
                                    res.json({ success: true, orderId, historyIds });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});
app.post('/api/add-to-cart', (req, res) => {
    // 获取愿望清单数据
    db.all('SELECT * FROM wish', (err, wishlistItems) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            // 复制愿望清单数据到购物车表
            const cartQuery = `INSERT INTO cart (B_ID, B_name, B_stock, B_price, B_img)
        SELECT B_ID, B_name, B_stock, B_price, B_img FROM wish`;
            db.run(cartQuery, function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    const cartItems = wishlistItems.map((item) => ({
                        Car_ID: this.lastID,
                        ...item
                    }));

                    // 清空愿望清单数据
                    db.run('DELETE FROM wish', function (err) {
                        if (err) {
                            console.error(err);
                            res.status(500).send('Internal Server Error');
                        } else {
                            res.json({ success: true, cartItems });
                        }
                    });
                }
            });
        }
    });
});
// 启动服务器
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

