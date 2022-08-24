import { makeAPICall } from './make_api_call.js';


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

  const filterByPostedTimeBtn = document.querySelector('#sortBy_postedAt');
  const filterByLikes = document.querySelector('#sortBy_likes');
  const filterByComments = document.querySelector('#sortBy_comments');

  filterByPostedTimeBtn.onclick = e => {
    location.assign(`/posts?page=1&sort=${filterByPostedTimeBtn.dataset.by}`);
  };

  filterByLikes.onclick = e => {
    location.assign(`/posts?page=1&sort=${filterByLikes.dataset.by}`);
  };

  filterByComments.onclick = e => {
    location.assign(`/posts?page=1&sort=${filterByComments.dataset.by}`);
  };

  const prevBtn = document.querySelector('#prevPage');
  const nextBtn = document.querySelector('#nextPage');
  const pageIndicator = document.getElementById('pageIndicator');
  const currentPage = +pageIndicator.dataset.currentpage;
  const pagesCnt = +pageIndicator.dataset.pagescnt;
  if(currentPage == 1) prevBtn.disabled = true;
  if(currentPage == pagesCnt) nextBtn.disabled = true;

  prevBtn.onclick = () => {
      if(!prevBtn.disabled)
          location.assign(`/posts?page=${currentPage - 1}`);
  };

  nextBtn.onclick = () => {
      if(!nextBtn.disabled)
          location.assign(`/posts?page=${currentPage + 1}`);
  };

  const commentsBtn = document.getElementById('comments');
  commentsBtn.onclick = (e) => {
    const postid = commentsBtn.dataset.postid;
    location.assign(`/comments/${postid}`);
  };

  const addPostBtn = document.getElementById('addPostBtn');
  addPostBtn.onclick = (e) => {
    location.assign('/add-post');
  };

};