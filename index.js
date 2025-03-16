const jwt = localStorage.getItem("jwt");
const customerId = localStorage.getItem("customerId");
const BASE_PATH = "http://localhost:8080/"
const BASE_IMAGE_PATH = "/Users/hasankadirdemircan/Desktop/ecommerce2025-0/ecommerce/"
let cartItems = [];


//get category list from backend

async function fetchCategories() {
    try {
        const response = await fetch(BASE_PATH + "categories", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            }
        });

        if (!response.ok) {
            console.error("response status : " + response.status);
            throw new Error("Failed to get categories, response status : " + response.status);
        }

        const data = await response.json();
        displayCategories(data);
    } catch (error) {
        console.error("Error fetching categories : ", error)
        window.location.href = "login.html"
    }
}

async function fetchProductByCategory(categoryId) {
    try {
        const response = await fetch(BASE_PATH + "products/category/" + categoryId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            }
        });

        if (!response.ok) {
            console.error("response status : " + response.status);
            throw new Error("Failed to get products, response status : " + response.status);
        }

        const data = await response.json();
        displayProducts(data);
    } catch (error) {
        console.error("Error fetching products : ", error)
        //   window.location.href = "login.html"
    }
}

function displayProducts(products) {
    const productList = document.getElementById("productList");
    productList.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("col-md-2", "mb-4", "me-3");

        const productImage = document.createElement("img");
        productImage.src = BASE_IMAGE_PATH + product.image;
        productImage.alt = product.name;
        productImage.style.maxWidth = "150px";
        productImage.style.maxHeight = "150px";

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        cardBody.innerHTML = `
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.price}</p>
            <button class="btn btn-primary" onclick='addToCart(${JSON.stringify(product)})' ${product.unitsInStock === 0 ? 'disabled' : ''}>
            ${product.unitsInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        `;

        productCard.appendChild(productImage);
        productCard.appendChild(cardBody);

        productList.appendChild(productCard);
    })

}

function addToCart(product) {
    const productCountInCart = cartItems.filter(item => item.id === product.id).length;
    if (product.unitsInStock > 0 && productCountInCart < product.unitsInStock) {
        cartItems.push(product);
        updateCart();
        updateOrderButtonVisibility();
    }
}

function updateCart() {
    const cart = document.getElementById("cart");
    cart.innerHTML = '';

    cartItems.forEach((item, index) => {
        const cartItemElement = document.createElement("li");
        cartItemElement.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

        const itemNameElement = document.createElement("span");
        cartItemElement.textContent = item.name + " - " + item.price;
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger");
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>'

        deleteButton.onclick = function () {
            removeFromCart(index)
        };

        cartItemElement.appendChild(itemNameElement);
        cartItemElement.appendChild(deleteButton);
        cart.appendChild(cartItemElement);
    });
}

function orderNow() {
    console.log("orderNow : ", cartItems);
    const idCountMap = new Map();
    cartItems.forEach(item => {

        //Check if the id exists in the map
        const { id } = item;
        if (idCountMap.has(id)) {
            //if its exists, increment the count
            idCountMap.set(id, idCountMap.get(id) + 1)
        } else {
            //if it doesn't exists, add it to the map
            idCountMap.set(id, 1);
        }
    })

    console.log("idCountMap: ", idCountMap)

}
function removeFromCart(index) {
    cartItems.splice(index, 1)[0];
    updateCart();
    updateOrderButtonVisibility();
}

function displayCategories(categories) {
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.innerHTML = ''; //önceki kategorileri temizle

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.text = category.name;
        categorySelect.appendChild(option);
    })
}

function updateOrderButtonVisibility() {
    if (cartItems.length > 0) {
        document.getElementById("orderButton").style.display = "block"
    } else {
        document.getElementById("orderButton").style.display = "none"
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    updateOrderButtonVisibility();

    //get categories
    await fetchCategories();
    const categorySelect = document.getElementById("categorySelect");
    console.log("categoryid :" + categorySelect.value)
    await fetchProductByCategory(categorySelect.value);

    categorySelect.addEventListener("change", async function () {
        await fetchProductByCategory(categorySelect.value)

    })
})