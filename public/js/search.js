const btn = document.getElementsByClassName('btn')[0];
const input = document.getElementById('floatingInput');
const searchBy = document.getElementById('searchBy');
import { makeAPICall } from './make_api_call.js';

btn.addEventListener('click', () => {
    const searchValue = input.value;
    const searchByType = searchBy.value;

    console.log(searchValue, searchByType);

    // if(searchByType === 'user') {
        // fetch(`/search/?type=${searchByType}&searchQuery=${searchValue}`);
        // .then((data)=>{console.log(data)});

    let queryParams = new URLSearchParams(window.location.search);
    // Set new or modify existing parameter value. 
    queryParams.set("type", searchByType);
    queryParams.set("searchQuery", searchValue);
    
    // Replace current querystring with the new one
    history.replaceState(null, null, "?" + queryParams.toString());

    window.location.href = window.location.href;
    // } else {

    // }
})

let queryParams = new URLSearchParams(window.location.search);

const type = queryParams.get("type");

if(type === 'posts') {
    console.log("Hello posts");
    const swiper = new Swiper('.swiper', {
        autoHeight: true,
        pagination: {
          el: '.swiper-pagination',
          type: 'fraction'
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        scrollbar: {
          el: '.swiper-scrollbar',
        },
    });
    
    const formatDates = () => {
      dayjs.extend(window.dayjs_plugin_relativeTime);
    
      const postedAtDates = document.querySelectorAll('.postedAt');
      postedAtDates.forEach(el => {
        const date = el.innerHTML;
        const formatted = dayjs(date).fromNow();
        el.innerHTML = `Posted ${formatted}`;
      });
    };
    
    window.onload = () => {
    
      formatDates();
    
    //   const filterByPostedTimeBtn = document.querySelector('#sortBy_postedAt');
    //   const filterByLikes = document.querySelector('#sortBy_likes');
    //   const filterByComments = document.querySelector('#sortBy_comments');
    
    //   filterByPostedTimeBtn.onclick = e => {
    //     location.assign(`/posts?page=1&sort=${filterByPostedTimeBtn.dataset.by}`);
    //   };
    
    //   filterByLikes.onclick = e => {
    //     location.assign(`/posts?page=1&sort=${filterByLikes.dataset.by}`);
    //   };
    
    //   filterByComments.onclick = e => {
    //     location.assign(`/posts?page=1&sort=${filterByComments.dataset.by}`);
    //   };
    
    //   const prevBtn = document.querySelector('#prevPage');
    //   const nextBtn = document.querySelector('#nextPage');
    //   const pageIndicator = document.getElementById('pageIndicator');
    //   const currentPage = +pageIndicator.dataset.currentpage;
    //   const pagesCnt = +pageIndicator.dataset.pagescnt;
    //   if(currentPage == 1) prevBtn.disabled = true;
    //   if(currentPage == pagesCnt) nextBtn.disabled = true;
    
    //   prevBtn.onclick = () => {
    //       if(!prevBtn.disabled)
    //           location.assign(`/?page=${currentPage - 1}`);
    //   };
    
    //   nextBtn.onclick = () => {
    //       if(!nextBtn.disabled)
    //           location.assign(`/posts?page=${currentPage + 1}`);
    //   };
    
      const commentsBtn = document.getElementsByClassName('comments');
    
      for(let commentBtn of commentsBtn) {
        commentBtn.onclick = (e) => {
          const postid = commentBtn.dataset.postid;
          console.log("Hello");
          location.assign(`/posts/${postid}/comments?commentId=null&limit=5&page=1&filter=-commentedAt`);
        };  
      }
    
      // commentsBtn.onclick = (e) => {
      //   const postid = commentsBtn.dataset.postid;
      //   console.log("Hello");
      //   location.assign(`/posts/${postid}/comments?commentId=null&limit=5&page=1&filter=-commentedAt`);
      // };
    
    //   const addPostBtn = document.getElementById('addPostBtn');
    //   addPostBtn.onclick = (e) => {
    //     location.assign('/add-post');
    //   };
    
    };
}