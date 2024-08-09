const apiUrl = "https://psychic-pancake-qrxg9q6j5r7hx4rg-8000.app.github.dev/"; // Replace with your actual API URL

document.getElementById('apartment-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const apartmentData = {
        area: document.getElementById('area').value,
        water_source: document.getElementById('water_source').value,
        electricity_meter: document.getElementById('electricity_meter').value,
        apartment_type: document.getElementById('apartment_type').value,
        private_toilet: document.getElementById('private_toilet').checked,
        rent_per_month: parseFloat(document.getElementById('rent_per_month').value),
        yearly_payment: parseFloat(document.getElementById('yearly_payment').value),
        total_price: parseFloat(document.getElementById('total_price').value),
        agent_fee: parseFloat(document.getElementById('agent_fee').value),
        inspection_fee: parseFloat(document.getElementById('inspection_fee').value),
        electricity_included: document.getElementById('electricity_included').checked,
        pictures: [],
        videos: []
    };

    // Handle file uploads for images and videos
    const picturesInput = document.getElementById('pictures');
    const videosInput = document.getElementById('videos');

    const uploadFiles = async (files, fileType) => {
        const urls = [];
        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('file_type', fileType);

            const response = await fetch(apiUrl + "upload-file/", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                urls.push(result.url);
            } else {
                alert(`Failed to upload ${fileType}: ${file.name}`);
                return [];
            }
        }
        return urls;
    };

    // Upload pictures and videos and attach their URLs to the apartment data
    apartmentData.pictures = await uploadFiles(picturesInput.files, "image");
    apartmentData.videos = await uploadFiles(videosInput.files, "video");

    if (!apartmentData.pictures.length && picturesInput.files.length > 0) return;
    if (!apartmentData.videos.length && videosInput.files.length > 0) return;

    // Send apartment data to the backend
    const response = await fetch(apiUrl + "add-apartment/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(apartmentData)
    });

    if (response.ok) {
        alert("Apartment added successfully!");
        loadApartments();
        document.getElementById('apartment-form').reset();
    } else {
        const errorData = await response.json();
        alert(`Failed to add apartment: ${errorData.detail}`);
    }
});

async function loadApartments() {
    const response = await fetch(apiUrl + "apartments/");
    if (response.ok) {
        const apartments = await response.json();

        const apartmentList = document.getElementById('apartment-list');
        apartmentList.innerHTML = "";

        apartments.forEach(apartment => {
            const apartmentItem = document.createElement('div');
            apartmentItem.classList.add('apartment-item');

            apartmentItem.innerHTML = `
                <strong>Area:</strong> ${apartment.area}<br>
                <strong>Rent per Month:</strong> ${apartment.rent_per_month}<br>
                <strong>Yearly Payment:</strong> ${apartment.yearly_payment}<br>
                <button onclick="deleteApartment(${apartment.apartment_id})">Delete</button>
            `;

            apartmentList.appendChild(apartmentItem);
        });
    } else {
        alert("Failed to load apartments.");
    }
}

async function deleteApartment(apartmentId) {
    const response = await fetch(apiUrl + `apartments/${apartmentId}`, {
        method: "DELETE"
    });

    if (response.ok) {
        alert("Apartment deleted successfully!");
        loadApartments();
    } else {
        alert("Failed to delete apartment.");
    }
}

// Load apartments on page load
loadApartments();
