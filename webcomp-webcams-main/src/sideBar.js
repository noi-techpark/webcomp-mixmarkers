
function toggleSidebar() {
  var sidebar = document.getElementById("sidebar");
  if (sidebar.style.right === "0px") {
    sidebar.style.right = "-250px"; // Nascondi la sidebar
  } else {
    sidebar.style.right = "0px"; // Mostra la sidebar
  }
}

document.getElementById("sidebar-toggle").addEventListener("click", toggleSidebar);
