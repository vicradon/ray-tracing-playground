// Start-up
load('Single a) converging lens');pre.value='Single a) converging lens';
if(matchMedia('(min-width:701px)').matches)document.querySelectorAll('details.help').forEach(d=>d.open=true); // help text starts open on wide screens, folded on phones
document.querySelectorAll('.tb').forEach(t=>{const f=()=>t.classList.toggle('more',t.scrollLeft+t.clientWidth<t.scrollWidth-2);t.addEventListener('scroll',f,{passive:true});addEventListener('resize',f);new ResizeObserver(f).observe(t);f()}); // scroll cue on narrow toolbars
