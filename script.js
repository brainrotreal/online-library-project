const apiurl = "https://openlibrary.org/"

const containerDiv = document.querySelector(".container")

function fetchData(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      data.docs.forEach(book => {
        let newDiv = document.createElement("div")
        newDiv.classList.add("book")
        containerDiv.appendChild(newDiv)
        newDiv.innerHTML = `
        <h4>${book.title}</h4>
        <p>${book.author_name ? book.author_name[0] : "Unknown Author"}</p>
        <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="${book.cover_i}">
        <button>Add to List</button>
        `
        const btn = newDiv.querySelector("button")

        btn.addEventListener("click", () => {
          btn.textContent = "✔"
          btn.classList.add("pressed")

          const list = JSON.parse(localStorage.getItem("list")) || []
          const isOnList = list.some(item => item.key === book.key)
          if (isOnList) {
            alert("This book is already on your list!")
          } else {
            list.push(book)
            localStorage.setItem("list", JSON.stringify(list))
          }

          setTimeout(() => {
            btn.textContent = "Add to List"
            btn.classList.remove("pressed")
          }, 300)
        })
      })
    })
}

let randomPage = Math.floor(Math.random() * 1000)
const searchInput = document.querySelector("#search")
const searchTypeSelect = document.querySelector("#search-type")
function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const debouncedFetchData = debounce(fetchData, 300);
// a
function updateBooks() {
  containerDiv.innerHTML = ""
  const query = searchInput.value.trim();
  if (query) {
    debouncedFetchData(`${apiurl}search.json?${searchTypeSelect.value}=${query}&limit=50`)
  } else {
    fetchData(apiurl+"search.json?q=subject:Science+Fiction&limit=50&page="+randomPage)
  }
}

searchInput.addEventListener("input", updateBooks)
searchTypeSelect.addEventListener("change", updateBooks)

const openBookListButton = document.querySelector("#obl")
openBookListButton.addEventListener("click", () => {
  containerDiv.innerHTML = ""
  const list = JSON.parse(localStorage.getItem("list")) || []
  const ratings = JSON.parse(localStorage.getItem("ratings")) || {}

  list.forEach(book => {
    let newDiv = document.createElement("div")
    newDiv.classList.add("book")
    containerDiv.appendChild(newDiv)

    const bookRating = ratings[book.key] || 0

    newDiv.innerHTML = `
    <h4>${book.title}</h4>
    <p>${book.author_name ? book.author_name[0] : "Unknown Author"}</p>
    <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="${book.cover_i}">
    <div class="rating">
      <i class="fa-solid fa-star${bookRating > 0 ? " active" : ""}"></i>
      <i class="fa-solid fa-star${bookRating > 1 ? " active" : ""}"></i>
      <i class="fa-solid fa-star${bookRating > 2 ? " active" : ""}"></i>
      <i class="fa-solid fa-star${bookRating > 3 ? " active" : ""}"></i>
      <i class="fa-solid fa-star${bookRating > 4 ? " active" : ""}"></i>
    </div>
    <button>Remove from List</button>
    `
    const btn = newDiv.querySelector("button")
    const stars = newDiv.querySelectorAll(".rating i")

    btn.addEventListener("click", () => {
      const list = JSON.parse(localStorage.getItem("list")) || []
      const newList = list.filter(item => item.key !== book.key)
      localStorage.setItem("list", JSON.stringify(newList))
      newDiv.remove()
    })

    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        ratings[book.key] = index + 1
        localStorage.setItem("ratings", JSON.stringify(ratings))
        stars.forEach((star, index2) => {
          index >= index2 ? star.classList.add("active") : star.classList.remove("active");
        });
      });
    });
  })
})

fetchData(apiurl+"search.json?q=subject:Science+Fiction&limit=50&page="+randomPage)