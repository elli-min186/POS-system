fetch("/api/sales")
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("list");
    list.innerHTML = "";
    data.forEach(s => {
      list.innerHTML += `<li>${s.item} - $${s.price}</li>`;
    });
  });
