// scripts.js

// Handle form submission
document
  .getElementById("search-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form from submitting

    var searchText = document.querySelector('input[name="search"]').value;
    var searchType = document.querySelector('select[name="search-type"]').value;

    // Perform the search based on searchText and searchType
    // You can use AJAX or other techniques here to fetch search results

    console.log("Search Text:", searchText);
    console.log("Search Type:", searchType);
  });
