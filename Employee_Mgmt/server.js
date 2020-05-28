var inquirer = require("inquirer");
var mysql = require("mysql");
// var table = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "rootpass",
    database: "employee_Mgmt"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start();
});

//function which prompts the user for what action they should take
function start() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Would you like to do?",
            choices: [
                "list all Employees",
                "list all Employees by Department",
                "list all Employees by Manager",
                "Add an Employee",
                "Remove an Employee",
                "Update Employee Info",
                "list All Roles",
                "Department's budget",
                "Exit"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "list all Employees":
                    view("employees");
                    break;

                case "list all Employees by Department":
                    list("department");
                    break;

                case "list all Employees by Manager":
                    list("manager");
                    break;

                case "Add an Employee":
                    add("employees");
                    break;

                case "Remove an Employee":
                    remove("employee");
                    break;

                case "Update Employee Info":
                    update("employee");
                    break;

                case "list All Roles":
                    list("roles");
                    break;

                case "Department's budget":
                    total();
                    break;

                case "Exit":
                    console.log(" ");
                    console.log("Thank you for using employee tracker. Have a great day ahead.");
                    console.log(" ");
                    connection.end();
                    break;
            }
        });
}

function view(){
    sqlQuery = "SELECT * FROM employee";
    connection.query(sqlQuery, function (err, res) {
        if (err) throw err;
        console.table(res);
        end();
    })
}

function list(choice) {
    switch (choice) {
        case "employees":
            sqlQuery = "SELECT e.id, CONCAT(e.first_name, ' ' ,e.last_name) AS Name, r.title As Title, d.name As Department FROM employee e INNER JOIN roles r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id ORDER BY e.first_name";
            break;

        case "department":
            sqlQuery = "SELECT e.id, CONCAT(e.first_name, ' ' ,e.last_name) AS Name, r.title As Title, d.name As Department FROM employee e INNER JOIN roles r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id ORDER BY d.name";
            break;

        case "manager":
            sqlQuery = "SELECT e.id, CONCAT(e.first_name, ' ' ,e.last_name) AS Name, CONCAT(m.first_name, ' ' ,m.last_name) AS Manager_Name FROM employee e LEFT OUTER JOIN employee m ON e.manager_id = m.id ORDER BY m.first_name";
            break;

        case "roles":
            sqlQuery = "SELECT r.id, r.title, r.salary, d.name FROM roles r INNER JOIN department d ON r.department_id = d.id";
            break;
    }
    connection.query(sqlQuery, function (err, res) {
        if (err) throw err;
        console.table(res);
        end();
    })
}

function add(choice) {
    switch (choice) {
        case "employees":
            inquirer
                .prompt([
                    {
                        name: "first",
                        type: "input",
                        message: "Enter employee's first name to be added: "
                    },
                    {
                        name: "last",
                        type: "input",
                        message: "Enter employee's last name to be added: "
                    },
                    {
                        name: "role",
                        type: "input",
                        message: "Enter employee's role id to be added: "
                    },
                    {
                        name: "manager",
                        type: "input",
                        message: "Enter employee's manager id to be added: "
                    },
                ]).then(function (answer) {
                    var query = `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ("${answer.first}", "${answer.last}", ${answer.role}, ${answer.manager})`;
                    connection.query(query, function (err, res) {
                        if (err) throw err;
                        console.log("The employee with name " + answer.first + " has been added to the system.");
                        console.log(" ");
                        console.log(" ");
                        end();
                    })
                })
            break;
    }
}

function remove(choice) {
    connection.query("SELECT * FROM " + choice, function (err, res) {
        if (err) throw err;
        inquirer
            .prompt([{
                name: "choice",
                type: "rawlist",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].first_name);
                    }
                    return choiceArray;
                },
                message: "Remove employee"
            }]).then(function (answer) {
                var query = `DELETE FROM employee WHERE first_name = "${answer.choice}"`;
                connection.query(query, function (err, res) {
                    if (err) throw err;
                    console.log("The employee with name " + answer.choice + " has been deleted from the system.");
                    console.log(" ");
                    console.log(" ");
                    end();
                })
            });
    });
}


function update(choice) {
    connection.query("SELECT * FROM " + choice, function (err, res) {
        if (err) throw err;
        inquirer
            .prompt([{
                name: "choice",
                type: "rawlist",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].first_name);
                    }
                    return choiceArray;
                },
                message: "Update employee"
            }]).then(function (answer1) {
                inquirer
                    .prompt([{
                        name: "column_name",
                        type: "list",
                        message: "Which column would you like to update? ",
                        choices: [
                            "first_name",
                            "last_name",
                            "role_id",
                            "manager_id"],
                    },
                    {
                        name: "new_value",
                        type: "input",
                        message: "Whats the new value? "
                    }]).then(function (answer) {
                        var query = `UPDATE employee SET ${answer.column_name} = "${answer.new_value}" WHERE first_name = "${answer1.choice}"`;
                        connection.query(query, function (err, res) {
                            if (err) throw err;
                            console.log("The employee with name " + answer1.choice + " has been updated in the system.");
                            console.log(" ");
                            console.log(" ");
                            end();
                        })
                    })
            })
    })
}

function end() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Would you like to continue? ",
            choices: [
                "Yes",
                "No",
            ]
        }).then(function (answer) {
            if (answer.action === "Yes") {
                console.log(" ");
                console.log(" ");
                start();
            } else {
                console.log(" ");
                console.log("Thank you for using employee tracker. Have a great day ahead.");
                console.log(" ");
                connection.end();
            }

        })
}

function total() {
    query = "SELECT d.name, sum(r.salary) AS Total_Budget, count(r.salary) AS Total_Employees FROM employee e, roles r, department d WHERE e.role_id = r.id AND r.department_id = d.id GROUP BY r.department_id";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        console.log(" ");
        console.log(" ");
        end();
    })
}