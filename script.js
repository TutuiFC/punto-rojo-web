const tarde=[[960,1380]];
const H={0:[[540,1380]],2:[[540,1380]],3:tarde,4:tarde,5:tarde,6:[[540,1440]]};
const n=new Date(),d=n.getDay(),m=n.getHours()*60+n.getMinutes();
const ab=(H[d]||[]).some(([a,b])=>m>=a&&m<b);
const e=document.getElementById('estado');e.textContent=ab?'Abierto ahora':'Cerrado ahora';e.classList.toggle('on',ab);
const f=document.querySelector('tr[data-d="'+d+'"]');if(f)f.classList.add('hoy');

// Carta: pestañas por categoría
(function(){
const botones=[...document.querySelectorAll('.tabs .tab')];
if(!botones.length)return;
const paneles=botones.map(b=>document.getElementById(b.getAttribute('aria-controls')));
function activar(n,enfocar){
  botones.forEach((b,i)=>{
    const on=i===n;
    b.setAttribute('aria-selected',on?'true':'false');
    b.tabIndex=on?0:-1;
    paneles[i].hidden=!on;
  });
  if(enfocar)botones[n].focus();
  else botones[n].scrollIntoView({block:'nearest',inline:'center'});
}
botones.forEach((b,i)=>{
  b.addEventListener('click',()=>activar(i,false));
  b.addEventListener('keydown',e=>{
    const d={ArrowRight:1,ArrowLeft:-1}[e.key];
    if(d){e.preventDefault();activar((i+d+botones.length)%botones.length,true);}
    if(e.key==='Home'){e.preventDefault();activar(0,true);}
    if(e.key==='End'){e.preventDefault();activar(botones.length-1,true);}
  });
});
const m=/^#carta-(.+)$/.exec(location.hash);
const ini=m?botones.findIndex(b=>b.id==='tab-'+m[1]):0;
if(ini>0)activar(ini,false);
})();

// Cabecera: aparece al pasar el hero
(function(){
const cab=document.querySelector('header');
const hero=document.querySelector('.hero');
if(!cab||!hero)return;
if(!('IntersectionObserver' in window)){cab.classList.remove('oculto');return;}
new IntersectionObserver(([e])=>{
  const pasado=!e.isIntersecting&&e.boundingClientRect.top<0;
  cab.classList.toggle('oculto',!pasado);
  if(pasado)cab.removeAttribute('inert');else cab.setAttribute('inert','');
},{rootMargin:'-64px 0px 0px 0px'}).observe(hero);
})();

// Fotos de la carta: al tocar el icono se amplía desde su sitio
(function(){
const botones=document.querySelectorAll('[data-grande]');
if(!botones.length)return;
const reducido=matchMedia('(prefers-reduced-motion: reduce)').matches;
let abierto=false;

function destino(img){
  const r=img.naturalWidth/img.naturalHeight;
  let w=Math.min(innerWidth*0.92,900),h=w/r;
  const maxH=innerHeight*0.86;
  if(h>maxH){h=maxH;w=h*r;}
  return {left:(innerWidth-w)/2,top:(innerHeight-h)/2,width:w,height:h};
}
function colocar(el,d,radio){
  el.style.left=d.left+'px';el.style.top=d.top+'px';
  el.style.width=d.width+'px';el.style.height=d.height+'px';
  el.style.borderRadius=radio;
}

function abrir(boton){
  if(abierto)return;
  const mini=boton.querySelector('img');
  const grande=new Image();
  grande.src=boton.dataset.grande;
  grande.decode().catch(()=>{}).then(()=>{
    if(abierto)return;
    abierto=true;
    const o=mini.getBoundingClientRect();
    const visor=document.createElement('div');
    visor.className='visor';
    visor.setAttribute('role','dialog');
    visor.setAttribute('aria-modal','true');
    visor.setAttribute('aria-label',boton.getAttribute('aria-label')||'Foto ampliada');
    const img=document.createElement('img');
    img.className='visor-img';
    img.src=boton.dataset.grande;
    img.alt='';
    const x=document.createElement('button');
    x.className='visor-x';x.type='button';x.setAttribute('aria-label','Cerrar');x.textContent='×';
    visor.appendChild(img);visor.appendChild(x);
    colocar(img,{left:o.left,top:o.top,width:o.width,height:o.height},'50%');
    document.body.appendChild(visor);
    document.body.classList.add('visor-abierto');
    mini.style.visibility='hidden';
    img.getBoundingClientRect();
    requestAnimationFrame(()=>{
      visor.classList.add('abierto');
      colocar(img,destino(grande),'12px');
    });
    x.focus();

    function cerrar(){
      if(!abierto)return;
      abierto=false;
      removeEventListener('keydown',tecla);
      removeEventListener('resize',ajustar);
      const o2=mini.getBoundingClientRect();
      visor.classList.remove('abierto');
      colocar(img,{left:o2.left,top:o2.top,width:o2.width,height:o2.height},'50%');
      let fin=false;
      const limpiar=()=>{
        if(fin)return;fin=true;
        visor.remove();
        document.body.classList.remove('visor-abierto');
        mini.style.visibility='';
        boton.focus();
      };
      if(reducido)limpiar();else{img.addEventListener('transitionend',e=>{if(e.propertyName==='width')limpiar();});setTimeout(limpiar,600);}
    }
    function tecla(e){
      if(e.key==='Escape')cerrar();
      if(e.key==='Tab'){e.preventDefault();x.focus();}
    }
    function ajustar(){
      img.style.transition='none';
      colocar(img,destino(grande),'12px');
      img.getBoundingClientRect();
      img.style.transition='';
    }
    visor.addEventListener('click',cerrar);
    addEventListener('keydown',tecla);
    addEventListener('resize',ajustar);
  });
}
botones.forEach(b=>b.addEventListener('click',()=>abrir(b)));
})();

// Barra "Llamar" (móvil): solo al llegar al final de la página
(function(){
const barra=document.querySelector('.barra-llamar');
const pie=document.querySelector('footer');
if(!barra||!pie||!('IntersectionObserver' in window)){if(barra)barra.classList.add('visible');return;}
barra.setAttribute('tabindex','-1');
new IntersectionObserver(([e])=>{
  barra.classList.toggle('visible',e.isIntersecting);
  barra.setAttribute('tabindex',e.isIntersecting?'0':'-1');
}).observe(pie);
})();

// Mapa: solo se carga (y Google puede poner cookies) cuando la persona lo pide
(function(){
const caja=document.getElementById('mapa');
const boton=document.getElementById('cargar-mapa');
if(!caja||!boton)return;
boton.addEventListener('click',()=>{
  const f=document.createElement('iframe');
  f.className='mapa';
  f.title='Mapa de Punto Rojo';
  f.referrerPolicy='no-referrer-when-downgrade';
  f.src=caja.dataset.src;
  caja.replaceWith(f);
});
})();
