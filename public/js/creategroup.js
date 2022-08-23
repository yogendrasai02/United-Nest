const users = document.getElementsByClassName('users');
const form = document.getElementById('form');

console.log(form);

for(let user of users) {
    user.addEventListener('click', (e) => {
        console.log(e);
        if(e.target.classList.contains('selected')) {
            e.target.classList.remove('selected');
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.color = 'black';
        } else {
            e.target.classList.add('selected');
            e.target.style.backgroundColor = '#8ce99a';
            e.target.style.color = '#f8f9fa';
        }
        console.log("Hello");
    })
}

// form.addEventListener('submit', (e) => {
//     e.preventDeafault();

//     console.log("Hello");
// })