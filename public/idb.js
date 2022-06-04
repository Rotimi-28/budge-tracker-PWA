const { response } = require("express");

const indexedDB = window.indexedDB
Window.indexedDB ||
window.mozIndexedDB ||
window.webkitINdexedDB ||
window.msIndexedDB ||
window.shimIndexedDB;


let db;
 
//Connection to indexedDB database budget_tracker
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    //create an objection store in d table "transaction" 2 set increamenting pry key
    db.createObjectStore("new_transaction", { autoIncrement: true });
};

//upon  a success
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransactions();
    }
};

request.onerror = function(event) {
    //log error
    console.log(event.target.errorCode);
};

// THis function will be executed if atttempt to submit a new Transaction and when there's no internet connection.
function saveRecord(record) {
    // open a new transaction with database
    const transaction = db.transaction(["new_transaction"], "readwrite");
    //access the object store for new_transaction
    const transactionObjectStore =transaction.objectStore("new_transaction");

    //add record store with method
    transactionObjectStore.add(record);
}
function uploadTransactions() {
    //open a transtion on db
    const transaction = db.transaction(["new_transaction"], "readwrite");

    //access ur object store
    const transactionObjectStore = transaction.objectStore("new_transaction");


    //get all records from transactions, set variable
    const getAll = transactionObjectStore.getAll();

    //upon successful .getAll( execution, run this function)
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    accept: "application/json, text/plain, */*",
                    "content_type": "application/json"
                }
            }).then(response => response.json()).then(serverResponse => {
                if (serverResponse.message){
                    throw new error(serverResponse);
                }
                //open one more transaction
                const transaction = db.transaction(["new_transaction"], "readwrite");
                //access dnew transaction obj store
                const transactionObjectStore = transaction.objectStore("new_transaction");
                //clear all transaction store
                transactionObjectStore.clear();
                alert("All saved transaction have been submitted!");
            }).catch(err => {
                console.log(err);
            });
        }
    };

}

    //listen for app coming back online
    window.addEventListener("online", uploadTransactions);


