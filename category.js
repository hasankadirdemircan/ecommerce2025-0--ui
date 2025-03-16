const BASE_PATH = "http://localhost:8080/"
const jwt = localStorage.getItem("jwt");
const authToken = 'Bearer ' + jwt;
var currentCaregoryId = 0;

function getAllCategory() {
    fetch(BASE_PATH + "categories", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("failed to get all categories, status : " + response.status);
        }
        return response.json();
    }).then(categories => {
        displayCategories(categories);
    }).catch(error => {
        console.error("Error: ", error)
    })
}

async function deleteCategory() {

    if (currentCaregoryId !== 0) {
        try {
            const response = await fetch(BASE_PATH + "categories/" + currentCaregoryId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                }
            });

            if (!response.ok) {
                const data = await response.json();
                if (data && data.message) {
                    showFailAlert(data.message);
                }
            } else {
                showSuccessAlert('Category deleted successfully');
                getAllCategory();
            }
        } catch (error) {
            console.error('error:', error)
        } finally {
            hideModal('deleteCategoryModal')
        }
    }
}

function showSuccessAlert(message) {
    let alert = document.getElementById("success-alert")
    alert.style.display = 'block'
    alert.style.opacity = 1;

    let alertMessage = document.getElementById("successAlertMessage");
    alertMessage.textContent = message;
    setTimeout(() => {
        let opacity = 1;
        let timer = setInterval(() => {
            if (opacity <= 0.1) {
                clearInterval(timer);
                alert.style.display = 'none'
            }
            alert.style.opacity = opacity;
            opacity -= opacity * 0.1;
        }, 50)
    }, 3000);
}

function showFailAlert(message) {
    let alert = document.getElementById("fail-alert")
    alert.style.display = 'block'
    alert.style.opacity = 1;

    let alertMessage = document.getElementById("failAlertMessage");
    alertMessage.textContent = message;
    setTimeout(() => {
        let opacity = 1;
        let timer = setInterval(() => {
            if (opacity <= 0.1) {
                clearInterval(timer);
                alert.style.display = 'none'
            }
            alert.style.opacity = opacity;
            opacity -= opacity * 0.1;
        }, 50)
    }, 3000);
}

function hideModal(modalId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId));
    modal.hide();
}

function showModal(modalId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId));
    modal.show();
}

function displayCategories(categories) {
    const categoryTableBody = document.getElementById("categoryTableBody");
    categoryTableBody.innerHTML = '';
    categories.forEach(category => {
        const row = categoryTableBody.insertRow();
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>
                <button class="btn btn-warning" onclick="getCategoryAndShowModal(${category.id})">Update</button>
                <button class="btn btn-danger" onclick="showDeleteCategoryModal(${category.id})">Delete</button>
            </td>
        `;
    });
}


function getCategoryAndShowModal(categoryId) {
    fetch(BASE_PATH + "categories/" + categoryId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("failed while getting category information for id : " + categoryId)
        }
        return response.json();
    }).then(category => {
        document.getElementById("updateCategoryName").value = category.name;
        document.getElementById("updateCategoryId").value = category.id;
        showModal("updateCategoryModal")
    }).catch(error => {
        console.error('error: ', error)
    })
}

function updateCategory() {
    const categoryId = document.getElementById("updateCategoryId").value;
    const categoryName = document.getElementById("updateCategoryName").value;
    const bodyData = JSON.stringify({
        id: categoryId,
        name: categoryName
    });

    fetch(BASE_PATH + "categories", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
        },
        body: bodyData
    }).then(response => {
        if (!response.ok) {
            throw new Error("Category PUT failed for id :" + categoryId + " status : " + response.status);
        }
        hideModal('updateCategoryModal');
        showSuccessAlert("Category updated successfully");
        getAllCategory();
    })
}

function showDeleteCategoryModal(categoryId) {
    currentCaregoryId = categoryId;
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("deleteCategoryModal"));
    modal.show();
}

document.addEventListener("DOMContentLoaded", async () => {
    await getAllCategory();

    //category add form listener 
    //you can use onclick() attribute on html as well
    document.getElementById("addCategoryBtn").addEventListener("click", function () {
        const categoryName = document.getElementById('categoryName').value;
        if ((categoryName == null || categoryName == "")) {
            showFailAlert("category name should not be empty!")
            return;
        }
        const body = JSON.stringify({
            name: categoryName
        });
        fetch(BASE_PATH + "categories/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: body
        }).then(response => {
            if (!response.ok) {
                throw new Error("failed category creation, status : " + response.status);
            }
            getAllCategory();
        }).catch(error => {
            console.error("error: ", error)
        })
    })
})