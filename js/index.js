// load databases moi lan mo trang wed
function on_load() {
    update_cart_quantity();

    //kiem tra dang nhap hay chua
    var account_id = localStorage.getItem("account_id");

    //check thu xem neu account_id khac rong thi mình sẽ gọi function login_success nó co san con so 1 thì nó show ra, neu kh co = "" thì login_fail
    if (account_id != "") {
        login_success();
    } else {
        logout();
    }
}

// show ra cai san pham
// lay du lieu tu database ra cho nen phai goi db.transaction ra
function get_product() {
    db.transaction(function(tx) {
        var query = `
         SELECT p.id, p.name, p.price, c.name AS category_name
         FROM product p, category c
         WHERE p.category_id = c.id
         `;

        tx.executeSql(
            query, [],
            function(tx,
                result) {
                show_product(result.rows);
            },
            transaction_error);
    });
}

function show_product(products) {
    var product_list = document.getElementById("product-list");

    for (var product of products) {
        product_list.innerHTML += `
      <div class="col-6 col-sm-4 col-lg-3 mt-3 p-3 product">
        <div class="product-img">
         <img src="img/product.jpeg" alt="${product.name}">
        </div>
      
        <div class="product-name">${product.name}</div>
        <div class="product-category">${product.category_name} VNĐ</div>
        <div class="product-price">${product.price} VNĐ</div>
      
        <div class="text-end">
         <button onclick="add_to_cart(this.id)" id="${product.id}" class="btn btn-success btn-sm">Add to Cart</button>
        </div>
      </div>
  `;
    }
}

//chay cai envent cua cai nut btn cart. sau khi no chay xong no se xem xet cap nhat hay chay moi.
function add_to_cart(product_id) {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function(tx) {
        var query = "SELECT quantity FROM cart WHERE account_id = ? AND product_id = ?";

        tx.executeSql(
            query, [account_id, product_id],
            function(tx, result) {
                if (result.rows[0]) {
                    update_cart_database(product_id, result.rows[0].quantity + 1);
                } else {
                    add_cart_database(product_id);
                }
            },
            transaction_error
        );
    });
}

//cap nhat
function update_cart_database(product_id, quantity) {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function(tx) {
        var query = "UPDATE cart SET quantity = ? WHERE account_id = ? AND product_id = ?";

        tx.executeSql(
            query, [quantity, account_id, product_id],
            function(tx, result) {
                log(`INFO`, `UPDATE cart successfully.`);
                update_cart_quantity();
            },
            transaction_error
        );
    });
}

//them san pham vao database
function add_cart_database(product_id) {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function(tx) {
        var query = `INSERT INTO cart (account_id, product_id, quantity) VALUES (?,?,?)`;

        tx.executeSql(
            query, [account_id, product_id, 1],
            function(tx, result) {
                log(`INFO`, `Insert cart successfully.`);
                update_cart_quantity();
            },
            transaction_error
        );
    });
}

// cap nhat so tren nut cart(...), ve mat f-e.
// chay 3 cho. 1/reset cai page. 2/neu insert thanh cong or cap nhat thanh cong.
function update_cart_quantity() {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function(tx) {
        var query = "SELECT SUM(quantity) AS total_quantity FROM cart WHERE account_id = ?";

        tx.executeSql(query, [account_id], function(tx, result) {
            if (result.rows[0].total_quantity) {
                document.getElementById("cart-quantity").innerText = result.rows[0].total_quantity;
            } else {
                document.getElementById("cart-quantity").innerText = 0;
            }
        }, transaction_error);
    });
}

// var frm_login= document.getElementById("frm-login");
// frm_login.onsubmit = login;
document.getElementById("frm-login").onsubmit = login;

function login(e) {
    e.preventDefault();

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Get value from <input>.
    db.transaction(function(tx) {
        var query = `SELECT * FROM account WHERE username = ? AND password = ?`;

        tx.executeSql(query, [username, password], function(tx, result) {
                if (result.rows[0]) {
                    $("#frm_login").modal("hide");

                    //key,ket qua.id lay id
                    localStorage.setItem("account_id", result.rows[0].id);
                    localStorage.setItem("account_username", result.rows[0].username);

                    // dang nhap thanh cong
                    login_success();
                } else {
                    alert("Login failed.");

                    //neu login kh thanh cong
                    logout();
                }
            },
            transaction_error);
    });
}

// muốn điền tên lúc đăng nhập vô, no se tim trong localStorage tìm username
function login_success() {
    var username = localStorage.getItem("account_username");

    document.getElementById("account-info").innerHTML = `
     <button class="btn ms-3 disable text-light">Hello ${username} !</button>
     <button onclick="logout()" class="btn btn-outline-light ms-3">Logout</button>
    `;
}

// khi user logout thì nó sẽ show nút login này lên
function logout() {
    localStorage.setItem("account_id", "");
    localStorage.setItem("account_username", "");

    document.getElementById("account-info").innerHTML = `
    <button type="submit" class="btn btn-outline-light ms-3" data-bs-toggle="modal" data-bs-target="#frm-login">Login</button> 
    `;
}

//Cart
function get_cart_list() {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function(tx) {
        var query = `
        SELECT p.id, p.name, p.price, c.quantity
        FROM cart c, product p
        WHERE p.id = c.product_id AND c.account_id = ?
        ORDER BY (p.name)
        `;

        tx.executeSql(query, [account_id], function(tx, result) {
            log(`INFO`, `Get a list of products in cart successfully.`);
            show_cart_list(result.rows);
        }, transaction_error);
    });
}

//show cart list
function show_cart_list(products) {
    var total = 0;
    var cart_list = document.getElementById("cart-list");

    for (var product of products) {
        //thanh tien
        var amount = product.price * product.quantity;
        total += amount;

        cart_list.innerHTML += `
        <tr id="cart-list-item-${product.id}">
         <td class="text-start" id="cart-list-name-${product.id}">${product.name}</td>
         <td>${product.quantity}</td>
         <td>${product.price}</td>
         <td>${amount}</td>
         <td>
          <button onclick="delete_cart_item(this.id)" id="${product.id}" class="btn btn-danger btn-sm">Delete</button>
         </td>
        </tr>
        `;
    }
    // thanh toan tong don hang, them nut btn neu lm
    cart_list.innerHTML += `
    <tr >
     <th></th>
     <th></th>
     <th>Total</th>
     <th>${total}</th>
     <th></th>
    </tr>
    `;
}


//xoa san pham delete_cart_item
function delete_cart_item(product_id) {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function(tx) {
        var query = "DELETE FROM cart WHERE account_id = ? AND product_id = ?";

        tx.executeSql(query, [account_id, product_id],
            function(tx, result) {
                var product_name = document.getElementById(`cart-list-name-${product_id}`);
                var message = `Delete "${product_name.innerText}" successfully.`;

                document.getElementById(`cart-list-item-${product_id}`).outerHTML = "";

                log(`INFO`, message);
                alert(message);

                //xoa xong cap nhat so luong tren nut bam cua gio hang
                update_cart_quantity();
            }, transaction_error);
    });
}