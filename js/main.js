const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);const b=e.target.querySelector('b[data-n]');if(b)cnt(b)}}),{threshold:.2});
document.querySelectorAll('[data-w]').forEach(h=>{let i=0;const s=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t.trim()){f.append(t);return}const w=document.createElement('span');w.className='wd';w.innerHTML='<i style="--i:'+i++ +'">'+t+'</i>';f.append(w)});c.replaceWith(f)}else s(c)})};s(h);h.classList.add('rv');h.style.transform='none'});
document.querySelectorAll('.rv').forEach(e=>io.observe(e));
function cnt(el){const n=+el.dataset.n,t0=performance.now();(function f(t){const p=Math.min((t-t0)/1500,1);el.textContent='+'+Math.round(n*(1-Math.pow(1-p,4)));if(p<1)requestAnimationFrame(f)})(t0)}

(async function(){const P=document.getElementById('cp'),T=document.getElementById('tp');let d='';
for(let x=-400;x<=1840;x+=8){const y=108+34*Math.sin(x/640*6.2832-.6)-.022*(x-720);d+=(d?'L':'M')+x+' '+y.toFixed(1)}
P.setAttribute('d',d);
const seq=['UI','UX','WIREFRAMES','PROTOTIPOS','LOOK&amp;FEEL','MAQUETACIÓN'].map((w,i)=>'<tspan dx="28" fill="'+(i%2?'#d9ff43':'#fff')+'">'+w+'</tspan><tspan dx="28" fill="#ff5a1f">•</tspan>').join('');
T.innerHTML=seq;if(document.fonts)await document.fonts.ready;
const L=T.getComputedTextLength(),k=Math.ceil(P.getTotalLength()/L)+2;T.innerHTML=seq.repeat(k);
if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
let o=0,last=performance.now();(function f(t){o=(o+(t-last)*.06)%L;last=t;T.setAttribute('startOffset',-o);requestAnimationFrame(f)})(last)})();
document.querySelectorAll('.pc').forEach(c=>c.addEventListener('touchstart',()=>c.classList.toggle('on'),{passive:true}));

(function(){const h=document.querySelector('.hero'),p=document.querySelector('.hp'),cv=p.querySelector('canvas'),x=cv.getContext('2d');
setTimeout(()=>h.classList.add('ready'),1300);
const img=new Image();img.src=getComputedStyle(p).getPropertyValue('--im').trim().replace(/^url\(["']?|["']?\)$/g,'');
const m=document.createElement('canvas'),mx=m.getContext('2d',{willReadFrequently:true}),t=document.createElement('canvas'),tx=t.getContext('2d');
function fit(){const d=Math.min(devicePixelRatio||1,2),w=p.offsetWidth,q=p.offsetHeight;cv.width=Math.min(Math.round(w*d),1000);cv.height=Math.round(cv.width*q/w);m.width=t.width=Math.round(w*.4);m.height=t.height=Math.round(q*.4)}
fit();addEventListener('resize',fit);
const auto=matchMedia('(hover:none)').matches,calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
let px=0,py=0,lx=-1,ly=0,inside=false,idle=999;
h.addEventListener('pointermove',e=>{const b=p.getBoundingClientRect();px=(e.clientX-b.left)/b.width*m.width;py=(e.clientY-b.top)/b.height*m.height;inside=e.clientX>=b.left&&e.clientX<=b.right&&e.clientY>=b.top&&e.clientY<=b.bottom});
h.addEventListener('pointerleave',()=>inside=false);
(function f(n){
 if(auto&&!calm){inside=true;px=m.width*(.5+.22*Math.sin(n/1100));py=m.height*(.42+.18*Math.sin(n/830+1))}
 idle=inside?0:idle+1;
 if(idle<260&&img.complete){
  mx.globalCompositeOperation='destination-out';mx.fillStyle='rgba(0,0,0,.05)';mx.fillRect(0,0,m.width,m.height);
  if(inside){if(lx<0){lx=px;ly=py}
   const R=Math.max(34,m.width*.14)*(1+.12*Math.sin(n/260)),dd=Math.hypot(px-lx,py-ly),k=Math.max(1,Math.ceil(dd/(R*.35)));
   mx.globalCompositeOperation='lighter';
   for(let i=1;i<=k;i++){const sx=lx+(px-lx)*i/k,sy=ly+(py-ly)*i/k,g=mx.createRadialGradient(sx,sy,0,sx,sy,R);g.addColorStop(0,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');mx.fillStyle=g;mx.beginPath();mx.arc(sx,sy,R,0,6.2832);mx.fill()}
   lx=px;ly=py}else lx=-1;
  const d=mx.getImageData(0,0,m.width,m.height),a=d.data;
  for(let i=3;i<a.length;i+=4){const v=(a[i]/255-.32)/.12;a[i]=v<=0?0:v>=1?255:v*v*(3-2*v)*255}
  tx.putImageData(d,0,0);
  x.globalCompositeOperation='source-over';x.clearRect(0,0,cv.width,cv.height);x.drawImage(t,0,0,cv.width,cv.height);
  x.globalCompositeOperation='source-in';x.drawImage(img,0,0,cv.width,cv.height);x.globalCompositeOperation='source-over'
 }else if(idle===260){mx.clearRect(0,0,m.width,m.height);x.clearRect(0,0,cv.width,cv.height)}
 requestAnimationFrame(f)})(0)})();
