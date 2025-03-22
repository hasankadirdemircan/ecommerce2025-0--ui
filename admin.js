const BASE_PATH = "http://localhost:8080/"
//const BASE_IMAGE_PATH = "/Users/hasankadirdemircan/Desktop/ecommerce2025-0/ecommerce/"
const BASE_IMAGE_PATH = "C:\\Users\\hasan.demircan\\Documents\\GitHub\\ecommerce2025-0\\ecommerce\\";
const jwt = localStorage.getItem("jwt");

var categories = [];
var currentId = 0;
async function getAllProduct() {
    try {
        const response = await fetch(BASE_PATH + "products/all", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            }
        });

        if (!response.ok) {
            throw new Error("failed to get products, response status : " + response.status)
        }

        const productList = await response.json();
        console.log("productList : ", productList);
        await renderProductTable(productList);
    } catch (error) {
        console.log("error:", error)
    }
}

async function renderProductTable(productList) {
    const productTableBody = document.getElementById('productTableBody');
    productTableBody.innerHTML = "";

    productList.forEach(product => {
        const row = productTableBody.insertRow();
        row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.unitsInStock}</td>
        <td>${product.categoryId}</td>
        <td><img src="${BASE_IMAGE_PATH}${product.image}" alt="${product.name}" width="100"></td>
        <td>${product.active ? "Yes" : "No"}</td>
        <td>
            <button class="btn btn-warning" onclick="updateProduct(${product.id})">Update</button>
            <button class="btn btn-danger" onclick="showDeleteProductModal(${product.id})">Delete</button>
        </td>
        `;
    });
}

async function updateProduct(productId) {
    fetch(BASE_PATH + "products/" + productId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("get Product failed for id : " + productId, " status : " + response.status);
        }
        return response.json();
    }).then(product => {
        document.getElementById('updateProductId').value = product.id;
        document.getElementById('updateProductName').value = product.name;
        document.getElementById('updateProductPrice').value = product.price;
        document.getElementById('updateProductUnitsInStock').value = product.unitsInStock;
        renderCategorySelectOption(categories, 'updateCategorySelect');
        document.getElementById('updateProductActive').checked = product.active;
        const updateProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("updateProductModal"));
        updateProductModal.show();
    }).catch(error => {
        console.error('Error', error)
    });

}
async function addProduct() {

    const fileInput = document.getElementById('productImage');
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productUnitsInStock = document.getElementById('productUnitsInStock').value;
    const productCategoryId = document.getElementById('categorySelect').value;
    const productActive = document.getElementById('productActive').checked;


    const productData = {
        name: productName,
        price: productPrice,
        unitsInStock: productUnitsInStock,
        categoryId: productCategoryId,
        active: productActive
    };

    const formData = new FormData();
    formData.append('file', fileInput.files[0])
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

    await fetch(BASE_PATH + "products/create", {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + jwt
        },
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error("failed to add product : " + response.status);
        }
        hideModal('addProductModal');
        clearModalValues();
        getAllProduct();
    })

}

async function getCategoryList() {
    const response = await fetch(BASE_PATH + "categories", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        }
    });

    if (!response.ok) {
        throw new Error("Failed to get categories, response status : " + response.status);
    }
    const categoryList = await response.json();
    categories = categoryList;

    renderCategorySelectOption(categoryList, "categorySelect")
}

async function deleteProduct() {
    if (currentId !== 0) {
        fetch(BASE_PATH + "products/" + currentId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error("failed product delete, " + response.status)
            }
            hideModal("deleteProductModal");
            getAllProduct();
        })
    }
}

function saveUpdateProduct() {
    const updateProductId = document.getElementById('updateProductId').value;
    const updateProductName = document.getElementById('updateProductName').value;
    const updateProductPrice = document.getElementById('updateProductPrice').value;
    const updateProductUnitsInStock = document.getElementById('updateProductUnitsInStock').value;
    const updateCategoryId = document.getElementById('updateCategorySelect').value;
    const updateProductActive = document.getElementById('updateProductActive').checked;
    const updateProductImage = document.getElementById('updateProductImage');

    const productData = {
        id: updateProductId,
        name: updateProductName,
        price: updateProductPrice,
        unitsInStock: updateProductUnitsInStock,
        categoryId: updateCategoryId,
        active: updateProductActive
    }

    const formData = new FormData();
    formData.append('file', feditedSelectImage = updateProductImage.files[0]);
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

    fetch(BASE_PATH + "products/update", {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + jwt
        },
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error("Product update failed for id : " + updateProductId + " status : " + response.status);
        }
        getAllProduct();
        const updateProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("updateProductModal"));
        updateProductModal.hide();
    })

}

function showDeleteProductModal(productId) {
    currentId = productId;
    const deleteProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("deleteProductModal"));
    deleteProductModal.show();
}
function renderCategorySelectOption(categoryList, elementId) {
    const categorySelect = document.getElementById(elementId);
    categorySelect.innerHTML = '';

    categoryList.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.text = category.name;
        categorySelect.appendChild(option);
    })
}

function clearModalValues() {
    document.getElementById('productImage').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productUnitsInStock').value = '';
    document.getElementById('categorySelect').value = '';
    document.getElementById('productActive').checked = '';
}

function hideModal(modalId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId));
    modal.hide();
}


document.addEventListener("DOMContentLoaded", async () => {
    await getAllProduct();
    await getCategoryList();
})