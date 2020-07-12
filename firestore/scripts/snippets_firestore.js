// Get random product selection, for user welcome page
Slug.prototype.getRandomItem = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

Slug.prototype.addNewProduct = function(data) {
    const collection = firebase.firestore().collection('products');
    return collection.add({
        data: {
            "uniqueID": "string",
            "carDealer": "string",
            "manufacturer": "string",
            "photoUpload": `bytes`,
            "quantity": 0,
            "material": "string",
            "location": "geocode"
        }
    });
    // data would have to be an unknown, with photo.
    // Trigger custom email to User, new Product Upload Attempt
};

Slug.prototype.getAllproducts = function(render) {
    const query = firebase.firestore()
        .collection('products')
        .orderBy('numberInType', 'desc')
        .limit(12);
    this.getDocumentsInQuery(query, render);
};

// Search for uniqueID
Slug.prototype.getProductbyID = function(id) {
    return firebase.firestore().collection('products').doc(id).get();
};

Slug.prototype.getDocumentsInQuery = function(query, render) {
    query.onSnapshot((snapshot) => {
        if (!snapshot.size) {
            return render();
        }
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
                render(change.doc);
            }
        });
    });
};

Slug.prototype.data = {
    carDealer: ['Aston_Martin', 'BMW', '...'],
    manufacturer: ['AssGases', 'Bosal', '...'],
    uniqueID: ['<product_code>', '<product_code>', '...'],
    productItem: [
            [uniqueID, carDealer, manufacturer,
                imageUrl, grade, valueTier
            ]
        ]
        //Missing values will be null || blank
};

Slug.prototype.getFirebaseConfig = function() {
    return firebase.app().options;
};

// Filter by Group
Slug.prototype.getFilteredProducts = function(filters, render) {

    let query = firebase.firestore().collection('productGroup');

    if (filters.carDealer !== 'Any') {
        query = query.where('carDealer', '==', filters.carDealer);
    }

    if (filters.manufacturer !== 'Any') {
        query = query.where('category', '==', filters.manufacturer);
    }

    if (filters.value !== 'Any') {
        query = query.where('value', '==', filters.value.length);
    }

    // Sort filtered products
    if (filters.sort === 'Grade') {
        query = query.orderBy('avgGrade', 'desc');
    } else if (filters.sort === 'value') {
        query = query.orderBy('value', 'desc');
    }

    this.getDocumentsInQuery(query, render);
};

/**
 * Initializes the router for the Slug app.
 */
Slug.prototype.initRouter = function() {
    this.router = new Navigo();

    var that = this;
    this.router
        .on({
            '/': function() {
                that.updateQuery(that.filters);
            }
        })
        .on({
            '/setup': function() {
                that.viewSetup();
            }
        })
        .on({
            '/products/*': function() {
                var path = that.getCleanPath(document.location.pathname);
                var id = path.split('/')[2];
                that.viewProduct(id);
            }
        })
        .resolve();

    firebase
        .firestore()
        .collection('products')
        .limit(1)
        .onSnapshot(function(snapshot) {
            if (snapshot.empty) {
                that.router.navigate('/setup');
            }
        });
};

Slug.prototype.getCleanPath = function(dirtyPath) {
    if (dirtyPath.startsWith('/index.html')) {
        return dirtyPath.split('/').slice(1).join('/');
    } else {
        return dirtyPath;
    }
};