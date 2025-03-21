function submitForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch("http://localhost:8080/customers/login", {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("Login isteği başarısız durum kodu : " + response.status);
        }
        return response.json();
    }).then(data => {

        console.log("successs login ");
        localStorage.setItem("jwt", data.token);
        localStorage.setItem("customerId", data.customerId);

        const role = parseJwt(data.token);
        if (role === "ROLE_ADMIN") {
            window.location.href = "admin.html";
        } else if (role === "ROLE_USER") {
            window.location.href = "index.html"
        }

    }).catch(error => {
        alert(error.message)
    })
}

function parseJwt(token) {
    if (!token) {
        return;
    }

    const base64url = token.split(".")[1];
    const base64 = base64url.replace("-", "+").replace("_", "/");

    const decodeData = JSON.parse(window.atob(base64));
    return decodeData.authorities[0].authority
}