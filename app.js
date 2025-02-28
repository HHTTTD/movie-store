const apiKey = '6a18e1223e80714a4de8b1ddc79fb525';  //ที่ไม่ใส่เป็น .env เพราะไม่อยากติดตั้งnode_modulesนะครับ
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const randomMovieButton = document.getElementById('randomMovieButton');
const movieList = document.getElementById('movieList');
const cartItems = document.getElementById('cartItems');
const clearCartButton = document.getElementById('clearCart');
const checkoutButton = document.getElementById('checkout');
const recommendationList = document.getElementById('recommendationList');
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let randomMovie = {};

// ค้นหาภาพยนตร์
function searchMovies(query) {
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`)
        .then(response => response.json())
        .then(data => {
            movieList.innerHTML = '';
            data.results.forEach(movie => {
                const movieElement = document.createElement('div');
                movieElement.classList.add('movie');
                movieElement.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
                    <h3>${movie.title}</h3>
                    <p>วันที่ออกฉาย: ${movie.release_date}</p>
                    <input type="number" id="price-${movie.id}" placeholder="ใส่ราคา">
                    <button onclick="addToCart(${movie.id}, '${movie.title}')">เพิ่มลงตะกร้า</button>
                `;
                movieList.appendChild(movieElement);
            });
        });
}

// ดึงภาพยนตร์แบบสุ่ม
function getRandomMovie() {
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            randomMovie = data.results[randomIndex];
            displayRandomMovie(randomMovie);
        });
}

// แสดงภาพยนตร์แบบสุ่ม
function displayRandomMovie(movie) {
    const randomMovieSection = document.getElementById('randomMovieRecommendation');
    
    document.getElementById('randomMovieImage').src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
    document.getElementById('randomMovieTitle').textContent = movie.title;
    document.getElementById('randomMovieOverview').textContent = movie.overview;
    document.getElementById('randomMovieReleaseDate').textContent = `วันที่ออกฉาย: ${movie.release_date}`;
    
    randomMovieSection.style.display = 'block';
}

// เพิ่มภาพยนตร์ลงตะกร้า
function addToCart(movieId, title) {
    const priceInput = document.getElementById(`price-${movieId}`);
    const price = parseFloat(priceInput.value);

    if (isNaN(price) || price <= 0) {
        alert('กรุณาใส่ราคาที่ถูกต้อง');
        return;
    }

    const movie = { id: movieId, title: title, price: price };
    cart.push(movie);
    updateCart();
}

// อัปเดตตะกร้าสินค้า
function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;
    let discountMessage = '';
    let discountedTotal = 0;

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.title} - ฿${item.price.toFixed(2)}</span>
            <button onclick="removeFromCart(${index})">ลบ</button>
        `;
        cartItems.appendChild(li);
        total += item.price;
    });

    // ส่วนลดตามจำนวนสินค้า
    if (cart.length > 5) {
        discountedTotal = total * 0.8;
        discountMessage = 'ส่วนลด: -20%';
    } else if (cart.length > 3) {
        discountedTotal = total * 0.9;
        discountMessage = 'ส่วนลด: -10%';
    } else {
        discountedTotal = total;
    }

    // แสดงข้อความส่วนลด
    if (discountMessage) {
        const discountLi = document.createElement('li');
        discountLi.innerHTML = `<strong>${discountMessage}</strong>`;
        cartItems.appendChild(discountLi);
    }

    // แสดงราคารวมหลังหักส่วนลด
    const totalLi = document.createElement('li');
    totalLi.innerHTML = `<strong>รวม: ฿${discountedTotal.toFixed(2)}</strong>`;
    cartItems.appendChild(totalLi);

    localStorage.setItem('cart', JSON.stringify(cart));
}

// ลบสินค้าจากตะกร้า
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// ล้างตะกร้าสินค้า
function clearCart() {
    cart = [];
    updateCart();
}

// ชำระเงิน
function checkout() {
    if (cart.length === 0) {
        alert('ตะกร้าของคุณว่าง');
        return;
    }

    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <h2>ชำระเงิน</h2>
        <p>กรุณาชำระเงินไปยังบัญชีต่อไปนี้ภายใน 1 นาที:</p>
        <p>ธนาคาร: XYZ Bank</p>
        <p>เลขบัญชี: 1234567890</p>
        <p>QR Code</p>
        <p>เวลาที่เหลือ: <span id="countdown">60</span> วินาที</p>
        <button onclick="closePopup()">ปิด</button>
    `;
    document.body.appendChild(popup);

    let timeLeft = 60;
    const countdown = setInterval(() => {
        timeLeft--;
        document.getElementById('countdown').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            closePopup();
        }
    }, 1000);
}

// ปิดป๊อปอัพ
function closePopup() {
    const popup = document.querySelector('.popup');
    if (popup) {
        popup.remove();
    }
}

// แสดงภาพยนตร์แนะนำ
function displayRecommendedMovies() {
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            recommendationList.innerHTML = '';
            data.results.forEach(movie => {
                const movieElement = document.createElement('div');
                movieElement.classList.add('movie');
                movieElement.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
                    <h3>${movie.title}</h3>
                    <p>วันที่ออกฉาย: ${movie.release_date}</p>
                    <input type="number" id="price-${movie.id}" placeholder="ใส่ราคา">
                    <button onclick="addToCart(${movie.id}, '${movie.title}')">เพิ่มลงตะกร้า</button>
                `;
                recommendationList.appendChild(movieElement);
            });
        });
}

// เปิด/ปิดตะกร้าสินค้า
function toggleCart() {
    const cart = document.getElementById('cart');
    cart.classList.toggle('collapsed');
}

// ตั้งค่าการทำงานของปุ่ม
document.getElementById('toggleCartBtn').addEventListener('click', toggleCart);
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchMovies(query);
    }
});
randomMovieButton.addEventListener('click', getRandomMovie);
clearCartButton.addEventListener('click', clearCart);
checkoutButton.addEventListener('click', checkout);

// โหลดตะกร้าสินค้าจาก localStorage
updateCart();

// แสดงภาพยนตร์แนะนำเมื่อโหลดหน้าเว็บ
displayRecommendedMovies();
