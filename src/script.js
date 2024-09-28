const cursor = document.querySelector(".cursor");
let timeout;

function updateCursor(x, y) {
    cursor.style.top = `${y}px`;
    cursor.style.left = `${x}px`;
    cursor.style.display = "block";
}

document.addEventListener("mousemove", (e) => {
    const x = e.clientX + window.pageXOffset;
    const y = e.clientY;

    requestAnimationFrame(() => {
        updateCursor(x, y);
    });

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        cursor.style.display = "none";
    }, 2000);
});

document.addEventListener("mouseout", () => {
    cursor.style.display = "none";
});

const apiKey = "bUkTzCL1G7LmOR4eMVJe1phovYAKLgd6";
const blogContainer = document.getElementById("blog-container");
const searchField = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const categoryFilterButton = document.getElementById("category-filter-button");
const categoryFilterList = document.getElementById("category-filter-list");
const categoryButtons = categoryFilterList.querySelectorAll("button");

categoryFilterButton.addEventListener("click", () => {
    if (categoryFilterList.style.display === "block") {
        categoryFilterList.style.display = "none";
    } else {
        categoryFilterList.style.display = "block";
    }
});

categoryButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        const category = button.getAttribute("data-category");
        try {
            const articles = await fetchNewsByCategory(category);
            displayBlogs(articles, false);
        } catch (error) {
            console.error("Error fetching news by category", error);
        }
        categoryFilterList.style.display = "none";
    });
});

searchButton.addEventListener("click", async () => {
    const searchQuery = searchField.value.trim();
    if (searchQuery) {
        try {
            const articles = await fetchNewsQuery(searchQuery);
            displayBlogs(articles, false, true); 
        } catch (error) {
            console.error("Error searching news", error);
        }
    }
});

async function fetchRandomNews() {
    try {
        const response = await fetch(`https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${apiKey}`);
        const data = await response.json();
        console.log(data);
        return data.results;
    } catch (error) {
        console.error("Error fetching random news", error);
        return [];
    }
}

async function fetchNewsQuery(searchQuery) {
    try {
        const response = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${searchQuery}&api-key=${apiKey}`);
        const data = await response.json();
        console.log(data);
        return data.response.docs;
    } catch (error) {
        console.error("Error fetching news query", error);
        return [];
    }
}

async function fetchNewsByCategory(category) {
    try {
        const response = await fetch(`https://api.nytimes.com/svc/topstories/v2/${category}.json?api-key=${apiKey}`);
        const data = await response.json();
        console.log(data);
        return data.results;
    } catch (error) {
        console.error("Error fetching news by category", error);
        return [];
    }
}

function displayBlogs(articles, isHomeJson = true, isSearchQuery = false) {
    blogContainer.innerHTML = "";

    if (!Array.isArray(articles)) {
        console.error("Invalid articles data");
        return;
    }

    const defaultImage = "https://res.cloudinary.com/dnkistviz/image/upload/v1727101632/nytimes-logo_farzry.png";

    articles.forEach((article) => {
        const blogCard = document.createElement("div");
        blogCard.classList.add("blog-card");

        let imageUrl;
        if (isHomeJson) {
            imageUrl = article.multimedia && article.multimedia.length > 0 
                ? article.multimedia[0].url 
                : defaultImage;
        } else if (isSearchQuery) {
            imageUrl = article.multimedia && article.multimedia[0] && article.multimedia[0].url 
                ? `https://www.nytimes.com/${article.multimedia[0].url}` 
                : defaultImage;
        } else {
            imageUrl = article.multimedia && article.multimedia[0] && article.multimedia[0].url 
                ? article.multimedia[0].url 
                : defaultImage;
        }

        console.log('Image URL:', imageUrl);

        const img = document.createElement("img");
        img.src = imageUrl;
        img.onerror = () => { img.src = defaultImage; };
        img.alt = article.headline?.main || article.title || "No Title";

        const titleText = article.headline?.main || article.title || "No Title";
        const title = document.createElement ("h2");
        title.textContent = titleText.length > 40 ? `${titleText.slice(0, 40)}...` : titleText;

        const description = document.createElement("p");
        description.textContent = article.abstract 
            ? (article.abstract.length > 120 
                ? `${article.abstract.slice(0, 120)}...` 
                : article.abstract) 
            : "No Description";

        blogCard.appendChild(img);
        blogCard.appendChild(title);
        blogCard.appendChild(description);

        blogCard.addEventListener("click", () => {
            window.open(article.web_url || article.url, "_blank");
        });

        blogContainer.appendChild(blogCard);
    });
}

// 
(async () => {
    try {
        const articles = await fetchRandomNews();
        displayBlogs(articles, true);
    } catch (error) {
        console.error("Error fetching random news", error);
    }
})();