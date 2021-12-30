var db = window.openDatabase("mr_been", "1.0", "MR BEEN", 200000);

function fetch_transactions_success(name) {
    log(`INFO`, `Insert "${name}" successfully.`);
}

function log(type, message) {
    var current_time = new Date();
    console.log(`${current_time} [${type}] ${message}`);
}

function table_transaction_success(table) {
    log(`INFO`, `Create table "${table}" successfully.`);
}

function transaction_error(tx, error) {
    log(`ERROR`, `SQL Error ${error.code}: ${error.message}.`);
}


function initialize_database() {
    db.transaction(function(tx) {
        // thanh pho
        var query = `CREATE TABLE IF NOT EXISTS city (
         id INTEGER PRIMARY KEY,
         name TEXT UNIQUE NOT NULL
        )`;

        tx.executeSql(query, [], table_transaction_success(`city`), transaction_error);

        // quan
        query = `CREATE TABLE IF NOT EXISTS district (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          city_id INTEGER NOT NULL,
          FOREIGN KEY (city_id) REFERENCES city(id)
        )`;

        tx.executeSql(query, [], table_transaction_success(`district`), transaction_error);

        // phuong
        query = `CREATE TABLE IF NOT EXISTS ward (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          district_id INTEGER NOT NULL,
          FOREIGN KEY (district_id) REFERENCES district(id)
        )`;

        tx.executeSql(query, [], table_transaction_success(`ward`), transaction_error);

        // tai khoan
        query = `CREATE TABLE IF NOT EXISTS account (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         username TEXT UNIQUE NOT NULL,
         password TEXT NOT NULL,
         first_name TEXT NULL,
         last_name TEXT NULL,
         birthday REAL NULL,
         phone TEXT NULL,
         street TEXT NULL,
         ward_id INTEGER NULL,
         district_id INTEGER NULL,
         city_id INTEGER NULL,
         status INTEGER NOT NULL,
         FOREIGN KEY (city_id) REFERENCES city(id)
        )`;

        tx.executeSql(query, [], table_transaction_success(`account`), transaction_error);

        // the loai
        query = `CREATE TABLE IF NOT EXISTS category (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT NULL,
          parent_id INTEGER NULL,
          FOREIGN KEY (parent_id) REFERENCES category(id)
        )`;

        tx.executeSql(query, [], table_transaction_success(`category`), transaction_error);

        // san pham
        query = `CREATE TABLE IF NOT EXISTS product (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NULL,
          price REAL NOT NULL,
          category_id INTEGER NULL,
          FOREIGN KEY (category_id) REFERENCES category(id)
        )`;

        tx.executeSql(query, [], table_transaction_success(`product`), transaction_error);

        // gio hang
        query = `CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          account_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          FOREIGN KEY (account_id) REFERENCES account(id),
          FOREIGN KEY (product_id) REFERENCES product(id)
        )`;

        tx.executeSql(query, [], table_transaction_success(`cart`), transaction_error);
    });
}


function fetch_database() {

    db.transaction(function(tx) {

        var query = `INSERT INTO category(name, description) VALUES(?, ?)`;

        tx.executeSql(query, ['Category 01', 'Description 01'], fetch_transactions_success("Category 01"), transaction_error);
        tx.executeSql(query, ['Category 02', 'Description 02'], fetch_transactions_success("Category 02"), transaction_error);
        tx.executeSql(query, ['Category 03', 'Description 03'], fetch_transactions_success("Category 03"), transaction_error);

        query = `INSERT INTO account(username, password, status) VALUES(?, ?, 1)`;

        tx.executeSql(query, ['DuongPhi@gmail.com', '123456'], fetch_transactions_success("test@test.com"), transaction_error);
    });
}