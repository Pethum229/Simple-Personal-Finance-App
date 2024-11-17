class DB{
    constructor(dbName, version, stores){
        this.dbName = dbName;
        this.version = version;
        this.stores = stores;

        this.connection = indexedDB.open(this.dbName, this.version);

        this.connection.onerror = function(event){
            console.log("Database error");
            console.error(this.error);
        }

        this.connection.onsuccess = function(event){
            this.database= event.target.result;
            console.log("Database connected successfully");
        }

        this.connection.onupgradeneeded = function(event){
            this.database = event.target.result;
            stores.forEach((store) => {
                var objectStore = this.database.createObjectStore(store.name,{
                    keyPath : store.keyPath,
                    autoIncrement: store.autoIncrement
                });
                store.indexes.forEach((index) => {
                    objectStore.createIndex(index.name,index.key,{
                        unique : index.unique
                    })
                })
            })
            console.log("DB created successfully");
        }
    }

    async addData(store,data){
        return new Promise((resolve, reject) => {
            let transaction = this.connection.database.transaction(
                [store],'readwrite'
            );
            let objectStore = transaction.objectStore(store);
            let request = objectStore.add(data);
            request.onsuccess = function(event){
                resolve(event);
            }
            request.onerror = function(event){
                reject(event);
            }
        })
    }

    async readData(store,key){
        return new Promise((resolve, reject) => {
            let transaction = this.connection.database.transaction(
                [store],'readonly'
            );
            let objectStore = transaction.objectStore(store);
            let request = objectStore.get(key);
            request.onsuccess = function(event){
                resolve(event.target.result);
            }
            request.onerror = function(event){
                reject(event);
            }
        })
    }

    async getAllData(store){
        return new Promise((resolve, reject) => {
            let transaction = this.connection.database.transaction(
                [store],'readonly'
            );
            let objectStore = transaction.objectStore(store);
            let request = objectStore.getAll();
            request.onsuccess = function(event){
                resolve(event.target.result);
            }
            request.onerror = function(event){
                reject(event);
            }
        })
    }

    async searchData(store,column,value){
        return new Promise((resolve, reject) => {
            let transaction = this.connection.database.transaction(
                [store],'readonly'
            );
            let objectStore = transaction.objectStore(store);
            let request = objectStore.index(column).openCursor();
            let results = [];
            request.onsuccess = function(event){
                let cursor = event.target.result;
                if(cursor){
                    if(cursor.value[column].toLowerCase().includes(value.toLowerCase())){
                        results.push(cursor.value);
                    }
                    cursor.continue();
                }else{
                    resolve(results);
                }
            }
            request.onerror = function(event){
                reject(event);
            }
        })
    }

    async updateData(store,data){
        return new Promise((resolve, reject) => {
            let transaction = this.connection.database.transaction(
                [store],'readwrite'
            );
            let objectStore = transaction.objectStore(store);
            let request = objectStore.put(data);
            request.onsuccess = function(event){
                resolve(event);
            }
            request.onerror = function(event){
                reject(event);
            }
        })
    }

    async deleteData(store,key){
        return new Promise((resolve, reject) => {
            let transaction = this.connection.database.transaction(
                [store],'readwrite'
            );
            let objectStore = transaction.objectStore(store);
            let request = objectStore.delete(key);
            request.onsuccess = function(event){
                resolve(event);
            }
            request.onerror = function(event){
                reject(event);
            }
        })
    }

    async getRangeData(store,index,lower,upper){
        return new Promise((resolve, reject) => {
            let transaction = this.connection.database.transaction(
                [store],'readonly'
            );
            let objectStore = transaction.objectStore(store);
            let request = objectStore.index(index).openCursor(IDBKeyRange.bound(lower,upper));
            let results = [];
            request.onsuccess = function(event){
                let cursor = event.target.result;
                if(cursor){
                    results.push(cursor.value);
                    cursor.continue();
                }else{
                    resolve(results);
                }
            }
            request.onerror = function(event){
                reject(event);
            }
        })
    }
}