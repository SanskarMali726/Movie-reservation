async function getTotalMovies() {
    try {
        const res = await fetch("http://localhost:8080/api/totalmovies");
        const data = await res.json();
        return data.total_movies || 0;
    } catch (err) {
        console.error("Movie fetch error:", err);
        return 0;
    }
}

async function getTotalUsers() {
    try {
        const res = await fetch("http://localhost:8080/api/totalusers");
        const data = await res.json();
        return data.total_users || 0;
    } catch (err) {
        console.error("User fetch error:", err);
        return 0;
    }
}

// async function getTotalReservations() {
//     try {
//         const res = await fetch("http://localhost:8080/api/total-reservations");
//         const data = await res.json();
//         return data.total_reservations || 0;
//     } catch (err) {
//         console.error("Reservations fetch error:", err);
//         return 0;
//     }
// }

// async function getTotalRevenue() {
//     try {
//         const res = await fetch("http://localhost:8080/api/total-revenue");
//         const data = await res.json();
//         return data.total_revenue || 0;
//     } catch (err) {
//         console.error("Revenue fetch error:", err);
//         return 0;
//     }
// }

async function loadDashboardStats() {
    const movies = await getTotalMovies();
    const users = await getTotalUsers();
    // const reservations = await getTotalReservations();
    // const revenue = await getTotalRevenue();

    document.getElementById("totalMovies").textContent = movies;
    document.getElementById("totalUsers").textContent = users.toLocaleString();
    // document.getElementById("totalReservations").textContent = reservations.toLocaleString();
    // document.getElementById("totalRevenue").textContent = "₹" + Number(revenue).toLocaleString();
}
