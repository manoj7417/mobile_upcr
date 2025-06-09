import{k as H,a as E,w as W,r,j as e,y as J,A as F,B as I}from"./client2.js";function q(){const{selectedCategory:o,setSelectedCategory:h}=H(),N=E(),[M,j]=W.useState(null);r.useEffect(()=>{(async()=>{try{const c=await J();c.success&&c.user&&(j(c.user),c.user.primaryResource?.[0]&&h(c.user.primaryResource[0]))}catch(c){console.error("Error validating token:",c)}})()},[]);const a=[{title:"PROJECT & CONSTRUCTION RESOURCES",startAngle:180,endAngle:360,background:"#aed581",segments:[{name:"Land",color:"#F44336",icon:"🗺"},{name:"Machines",color:"#0D47A1",icon:"🏗"},{name:"Material",color:"#29B6F6",icon:"🛠"},{name:"Equipment",color:"#29B6F6",icon:"⚙️"},{name:"Tools",color:"#29B6F6",icon:"🔧"},{name:"Manpower",color:"#29B6F6",icon:"👥"}]},{title:"BUSINESS RESOURCES",startAngle:0,endAngle:120,background:"#ffd180",segments:[{name:"Finance",color:"#9C27B0",icon:"💰"},{name:"Tenders",color:"#FFC107",icon:"📋"},{name:"Showcase",color:"#FF9800",icon:"🎯"},{name:"Auction",color:"#4CAF50",icon:"🔨"}]},{title:"STUDENT RESOURCES",startAngle:120,endAngle:180,background:"#64b5f6",segments:[{name:"Jobs",color:"#009688",icon:"💼"},{name:"E-Stores",color:"#009688",icon:"🛍"}]}],g=n=>{h(n);const c=new CustomEvent("categorySelected",{detail:{category:n}});window.dispatchEvent(c),["Land","Machines","Material","Equipment","Tools","Manpower"].includes(n)?N({to:"/projectandconstruction",search:{category:n}}):console.log(`Category ${n} is coming soon!`)};return e.jsxs("div",{className:"scale-[0.5] min-[375px]:scale-[0.6] md:scale-[0.6] lg:scale-[0.7] 2xl:scale-100",children:[e.jsxs("div",{className:"circle-menu",children:[e.jsx("div",{className:"outer-ring",children:a.map((n,c)=>{const l=n.startAngle*Math.PI/180,m=n.endAngle*Math.PI/180,i=240,d=280,f=`M ${300+i*Math.cos(l)} ${300+i*Math.sin(l)}
                L ${300+d*Math.cos(l)} ${300+d*Math.sin(l)}
                A ${d} ${d} 0 0 1 ${300+d*Math.cos(m)} ${300+d*Math.sin(m)}
                L ${300+i*Math.cos(m)} ${300+i*Math.sin(m)}
                A ${i} ${i} 0 0 0 ${300+i*Math.cos(l)} ${300+i*Math.sin(l)}`;let t=260;n.startAngle>=0&&n.startAngle<180&&(t=268);const x=`textPath-${c}`,b=n.startAngle>=0&&n.startAngle<180;let v;return b?v=`M ${300+t*Math.cos(m)} ${300+t*Math.sin(m)} 
                         A ${t} ${t} 0 0 0 
                         ${300+t*Math.cos(l)} ${300+t*Math.sin(l)}`:v=`M ${300+t*Math.cos(l)} ${300+t*Math.sin(l)} 
                         A ${t} ${t} 0 0 1 
                         ${300+t*Math.cos(m)} ${300+t*Math.sin(m)}`,e.jsx("div",{className:"section-title",children:e.jsxs("svg",{width:"600",height:"600",style:{position:"absolute",left:0,top:0},children:[e.jsx("path",{d:f,fill:n.background,className:"title-background"}),e.jsx("defs",{children:e.jsx("path",{id:x,d:v,fill:"none"})}),e.jsx("text",{className:"curved-text",children:e.jsx("textPath",{href:`#${x}`,startOffset:"50%",textAnchor:"middle",style:{fontSize:"13px",fontWeight:600,letterSpacing:"1.2px",fill:"#333"},children:n.title})})]})},`title-${c}`)})}),e.jsx("div",{className:"segments",children:a.map((n,c)=>e.jsx("div",{className:"section",children:n.segments.map((l,m)=>{const i=(n.endAngle-n.startAngle)/n.segments.length,d=n.startAngle+m*i,f=d+i,t=(d+f)/2,x=.5,b=d+x,v=f-x,S=180,C=295+S*Math.cos(t*Math.PI/180),k=295+S*Math.sin(t*Math.PI/180);let A=0;l.name==="Land"||l.name==="Machines"||l.name==="Material"||l.name==="Auction"||l.name==="Jobs"||l.name==="E-Stores"?A=0:t>=180&&t<=360?A=t<=270?180:0:A=t<=90?0:180;const $=o===l.name||M?.primaryResource?.[0]===l.name&&!o;return e.jsx("button",{className:`segment-button ${$?"selected":""}`,onClick:()=>g(l.name),style:{background:l.color,clipPath:`path('M 295 295 L ${295+245*Math.cos(b*Math.PI/180)} ${295+245*Math.sin(b*Math.PI/180)} A 245 245 0 0 1 ${295+245*Math.cos(v*Math.PI/180)} ${295+245*Math.sin(v*Math.PI/180)} Z')`},children:e.jsxs("div",{className:"segment-content",style:{position:"absolute",left:`${C}px`,top:`${k}px`,transform:`translate(-50%, -50%) rotate(${A}deg)`,display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"},children:[e.jsx("span",{className:"segment-icon",children:l.icon}),e.jsx("span",{className:"segment-name",children:l.name})]})},`segment-${c}-${m}`)})},`section-${c}`))}),e.jsx("div",{className:"center-circle",children:e.jsx("img",{src:"/upcr-logo.png",alt:"UPC Resources Logo",className:"center-logo"})})]}),e.jsx("style",{children:`
        .circle-menu {
          position: relative;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: transparent;
          margin: 0 auto;
        }

        .outer-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          border-radius: 50%;
          z-index: 2;
          pointer-events: none;
        }

        .section-title {
          position: absolute;
          width: 600px;
          height: 600px;
          top: 0;
          left: 0;
          pointer-events: none;
        }

        .curved-text {
          fill: #333;
          text-transform: uppercase;
        }

        .segments {
          position: absolute;
          width: 540px;
          height: 540px;
          top: 46%;
          left: 46%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 3; /* Ensure segments are above the outer ring */
        }

        .section {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .segment-button {
          position: absolute;
          width: 100%;
          height: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          margin: 0;
          outline: none;
          transform-origin: center;
          pointer-events: auto;
          z-index: 3;
        }

        .segment-button:hover {
          filter: brightness(1.2);
          transform: scale(1.05);
          z-index: 4;
          box-shadow: 0 0 15px rgba(0,0,0,0.2);
        }

        .segment-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          transition: all 0.3s ease;
          pointer-events: none;
          z-index: inherit;
        }

        .segment-button:hover .segment-content {
          transform: scale(1.1);
        }

        .segment-icon {
          font-size: 24px;
          color: white;
          transition: all 0.3s ease;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        }

        .segment-name {
          color: white;
          font-size: 14px;
          font-weight: 500;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          white-space: nowrap;
          transition: all 0.3s ease;
        }

        .segment-button:hover .segment-icon {
          transform: scale(1.2);
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .segment-button:hover .segment-name {
          font-weight: 600;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
        }

        .center-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 5;
          padding: 12px;
        }

        .center-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .title-background {
          filter: brightness(0.98);
        }

        .segment-button.selected {
          filter: brightness(1.2);
          transform: scale(1.05);
          z-index: 4;
          box-shadow: 0 0 15px rgba(0,0,0,0.2);
        }

        .segment-button.selected .segment-content {
          transform: scale(1.1);
        }

        .segment-button.selected .segment-icon {
          transform: scale(1.2);
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .segment-button.selected .segment-name {
          font-weight: 600;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
        }
      `})]})}function Y(){const o=E(),[h,N]=r.useState(0),[M,j]=r.useState(!1),[a,g]=r.useState([]),[n,c]=r.useState(!0),[l,m]=r.useState(null),i=[{text:"UPC Resources has transformed our business operations with their innovative solutions.",author:"John Smith",role:"CEO, TechCorp",stars:5},{text:"The team's expertise and dedication have been instrumental in our success.",author:"Sarah Johnson",role:"Operations Director",stars:5},{text:"Outstanding service and support from start to finish.",author:"Michael Brown",role:"Project Manager",stars:5}],d=async()=>{try{c(!0),m(null);const t=await F({data:{ad_type:"flip"}});t.success&&t.announcements?g(t.announcements):(m(t.error||"Failed to fetch announcements"),g([]))}catch(t){console.error("Error fetching flip announcements:",t),m("An unexpected error occurred"),g([])}finally{c(!1)}};r.useEffect(()=>{d()},[]),r.useEffect(()=>{const t=setInterval(()=>{N(x=>(x+1)%i.length)},4e3);return()=>{clearInterval(t)}},[]);const f=t=>{t&&o({to:"/seller/$sellerId",params:{sellerId:t.seller_id.toString()}})};return n?e.jsx("div",{children:"Loading advertisements..."}):l?(console.error("Error loading flip announcements:",l),null):e.jsxs("div",{className:"flex flex-col justify-between w-full md:max-w-[240px] mx-auto",children:[a[0]&&e.jsx("div",{className:"relative h-[200px] rounded-lg overflow-hidden shadow-md z-10",children:a[0].icon.startsWith("http")?e.jsx("img",{src:a[0].icon,alt:"Advertisement 1",className:"w-full h-full object-cover transition-opacity duration-1000 cursor-pointer",onClick:()=>f(a[0]),onError:t=>{console.error("Error loading image:",a[0]?.icon),t.currentTarget.style.display="none"},onLoad:()=>console.log("Image loaded successfully:",a[0]?.icon)}):e.jsx("div",{className:"w-full h-full flex items-center justify-center bg-slate-100 text-6xl cursor-pointer",onClick:()=>f(a[0]),children:a[0].icon||"📢"})}),e.jsxs("div",{className:"flex flex-col items-center py-2 relative",children:[e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 blur-md"}),e.jsx("img",{src:"/ads_award.png",alt:"UPC Resources Logo",className:"w-20 h-20 object-contain relative z-10"})]}),e.jsxs("div",{onMouseEnter:()=>j(!0),onMouseLeave:()=>j(!1),className:"relative bg-white rounded-lg p-2 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(234,179,8,0.5)] transition-all duration-200 w-full cursor-pointer transform hover:-translate-y-0.5 z-20",children:[e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("div",{className:"text-slate-800 text-xs font-semibold",children:"Testimonial"}),e.jsxs("div",{className:"text-slate-600 text-xs italic line-clamp-2",children:['"',i[h]?.text||"",'"']}),e.jsx("div",{className:"flex items-center gap-1",children:[...Array(5)].map((t,x)=>e.jsx("svg",{className:"w-3 h-3 text-yellow-400",fill:"currentColor",viewBox:"0 0 20 20",children:e.jsx("path",{d:"M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"})},x))}),e.jsxs("div",{className:"text-slate-800 text-xs font-semibold truncate",children:[i[h]?.author||""," •"," ",i[h]?.role||""]})]}),M&&e.jsxs("div",{className:"absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-[280px] bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.2)] p-4 z-[99999999]",children:[e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx("div",{className:"text-slate-800 text-sm font-semibold",children:"Testimonial"}),e.jsxs("div",{className:"text-slate-700 text-sm italic",children:['"',i[h]?.text||"",'"']}),e.jsx("div",{className:"flex items-center gap-1",children:[...Array(5)].map((t,x)=>e.jsx("svg",{className:"w-4 h-4 text-yellow-400",fill:"currentColor",viewBox:"0 0 20 20",children:e.jsx("path",{d:"M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"})},x))}),e.jsxs("div",{className:"text-slate-800 text-sm font-semibold truncate",children:[i[h]?.author||""," •"," ",i[h]?.role||""]})]}),e.jsx("div",{className:"absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45"})]})]})]}),a[1]&&e.jsx("div",{className:"relative h-[200px] rounded-lg overflow-hidden shadow-md z-10",children:a[1].icon.startsWith("http")?e.jsx("img",{src:a[1].icon,alt:"Advertisement 2",className:"w-full h-full object-cover transition-opacity duration-1000 cursor-pointer",onClick:()=>f(a[1]),onError:t=>{console.error("Error loading image:",a[1]?.icon),t.currentTarget.style.display="none"},onLoad:()=>console.log("Image loaded successfully:",a[1]?.icon)}):e.jsx("div",{className:"w-full h-full flex items-center justify-center bg-slate-100 text-6xl cursor-pointer",onClick:()=>f(a[1]),children:a[1].icon||"📢"})})]})}function Z(){const[o,h]=r.useState(null),[N,M]=r.useState({x:0,y:0}),j=r.useRef(null),a=r.useRef(null),[g,n]=r.useState([]),[c,l]=r.useState(!0),[m,i]=r.useState("translateX(0)"),d=r.useRef(null);r.useRef(0),r.useRef("translateX(0)");const[f,t]=r.useState(!0),[x,b]=r.useState(null),v=E(),[S,C]=r.useState(!1),[k,A]=r.useState("0s"),[$,_]=r.useState(!1),B=async()=>{try{t(!0),b(null);const s=await F({data:{ad_type:"scroll"}});if(s.success&&s.announcements){const u=await Promise.all(s.announcements.map(async y=>{try{const p=await I({data:{sellerId:y.seller_id}});return p.success&&p.seller?{...y,seller_info:{company_name:p.seller.company_name,address:p.seller.address,phone:p.seller.phone,description:p.seller.description||""}}:y}catch(p){return console.error(`Error fetching seller ${y.seller_id}:`,p),y}}));n(u)}else b(s.error||"Failed to fetch announcements"),n([])}catch{b("An unexpected error occurred"),n([])}finally{t(!1)}};r.useEffect(()=>{B()},[]),r.useEffect(()=>{const s=u=>{a.current&&!a.current.contains(u.target)&&!j.current?.contains(u.target)&&R()};return o&&document.addEventListener("mousedown",s),()=>{document.removeEventListener("mousedown",s),d.current&&clearTimeout(d.current)}},[o]);const T=async(s,u)=>{const p=u.currentTarget.getBoundingClientRect();if(M({x:p.left+p.width/2,y:p.top}),h(s),C(!0),!s.seller_info&&!$)try{_(!0);const w=await I({data:{sellerId:s.seller_id}});if(w.success&&w.seller){const z={...s,seller_info:{company_name:w.seller.company_name,address:w.seller.address,phone:w.seller.phone,description:w.seller.description||""}};h(z),n(X=>X.map(L=>L.id===s.id?z:L))}}catch(w){console.error("Error fetching seller information:",w)}finally{_(!1)}},P=()=>{d.current=setTimeout(()=>{a.current?.matches(":hover")||R()},100)},U=()=>{d.current&&clearTimeout(d.current)},O=()=>{R()},R=()=>{h(null),C(!1)},D=(s,u)=>{s.stopPropagation(),v({to:"/seller/$sellerId",params:{sellerId:u.toString()}})};return f?e.jsx("div",{className:"fixed bottom-0 left-0 right-0 flex items-center bg-slate-50 border-t-2 border-blue-400 p-4 z-50 shadow-lg",children:e.jsx("div",{className:"w-full text-center text-slate-600",children:"Loading announcements..."})}):x?e.jsx("div",{className:"fixed bottom-0 left-0 right-0 flex items-center bg-slate-50 border-t-2 border-red-400 p-4 z-50 shadow-lg",children:e.jsx("div",{className:"w-full text-center text-red-600",children:x})}):g.length===0?null:e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"fixed bottom-0 left-0 right-0 flex items-center bg-slate-50 border-t-2 border-blue-400 p-4 z-50 shadow-lg",children:[e.jsx("div",{className:"bg-blue-400 text-white px-6 py-2.5 rounded-lg font-bold text-base whitespace-nowrap flex-shrink-0 shadow-md",children:"UPCR Resources"}),e.jsx("div",{className:"flex-1 overflow-hidden ml-6 group",children:e.jsxs("div",{ref:j,className:"flex gap-2 animate-ticker",style:{width:"fit-content",animationPlayState:S?"paused":"running",animationDelay:k,position:"relative",left:"0"},children:[g.map(s=>e.jsxs("div",{onMouseEnter:u=>T(s,u),onMouseLeave:P,className:"group flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-2.5 w-[240px] h-[80px] flex-shrink-0 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-400 hover:bg-slate-50 transition-all duration-200 cursor-pointer relative",children:[e.jsx("div",{className:"w-12 h-12 bg-slate-100 rounded-md mr-3 flex-shrink-0 overflow-hidden flex items-center justify-center",children:e.jsx("img",{src:s.icon,alt:s.title,className:"w-auto h-auto max-w-full max-h-full object-contain"})}),e.jsx("div",{className:"flex flex-col justify-center flex-1 min-w-0",children:e.jsx("span",{className:"text-sm font-semibold text-slate-800 line-clamp-2 text-center",children:s.seller_info?.company_name||s.title})})]},s.id)),g.map(s=>e.jsxs("div",{onMouseEnter:u=>T(s,u),onMouseLeave:P,className:"group flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-2.5 w-[240px] h-[80px] flex-shrink-0 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-400 hover:bg-slate-50 transition-all duration-200 cursor-pointer relative",children:[e.jsx("div",{className:"w-12 h-12 bg-slate-100 rounded-md mr-3 flex-shrink-0 overflow-hidden flex items-center justify-center",children:e.jsx("img",{src:s.icon,alt:s.title,className:"w-auto h-auto max-w-full max-h-full object-contain"})}),e.jsx("div",{className:"flex flex-col justify-center flex-1 min-w-0",children:e.jsx("span",{className:"text-sm font-semibold text-slate-800 line-clamp-2 text-center",children:s.seller_info?.company_name||s.title})})]},`dup-${s.id}`))]})}),e.jsx("style",{children:`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); } /* Changed from translateX(calc(-100% - 100vw)) to -50% */
          }
          .animate-ticker {
            animation: ticker 60s linear infinite;
            animation-fill-mode: forwards;
            transform-origin: left center;
          }
          .line-clamp-4 {
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `})]}),o&&e.jsxs("div",{ref:a,onMouseEnter:U,onMouseLeave:O,className:"fixed bg-white rounded-xl shadow-xl p-0 z-[99999] transition-all duration-200 overflow-hidden border border-blue-100",style:{left:`${N.x}px`,bottom:"120px",transform:"translateX(-50%)",minWidth:"320px",maxWidth:"400px",boxShadow:"0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"},children:[e.jsx("div",{className:"bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100",children:e.jsxs("div",{className:"flex gap-4",children:[e.jsx("div",{className:"w-16 h-16 bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-sm border border-blue-100",children:e.jsx("img",{src:o.icon,alt:o.title,className:"w-auto h-auto max-w-full max-h-full object-contain"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("h3",{className:"text-sm font-bold text-blue-800 mb-1 line-clamp-2",children:o.title}),e.jsx("p",{className:"text-sm text-blue-600 line-clamp-2",children:o.description})]})]})}),e.jsxs("div",{className:"p-4 bg-white",children:[o.seller_info&&e.jsxs("div",{className:"space-y-3",children:[e.jsxs("h4",{className:"text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5 mr-1",viewBox:"0 0 20 20",fill:"currentColor",children:e.jsx("path",{fillRule:"evenodd",d:"M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z",clipRule:"evenodd"})}),"Company Information"]}),e.jsxs("div",{className:"grid grid-cols-1 gap-2 bg-blue-50 p-3 rounded-lg",children:[o.seller_info.company_name&&e.jsxs("div",{className:"flex items-start",children:[e.jsx("span",{className:"text-xs text-indigo-600 font-medium w-16",children:"Name:"}),e.jsx("span",{className:"text-xs text-gray-800 font-semibold",children:o.seller_info.company_name})]}),o.seller_info.address&&e.jsxs("div",{className:"flex items-start",children:[e.jsx("span",{className:"text-xs text-indigo-600 font-medium w-16",children:"Address:"}),e.jsx("span",{className:"text-xs text-gray-700 line-clamp-2",children:o.seller_info.address})]}),o.seller_info.phone&&e.jsxs("div",{className:"flex items-start",children:[e.jsx("span",{className:"text-xs text-indigo-600 font-medium w-16",children:"Contact:"}),e.jsx("span",{className:"text-xs text-gray-700",children:o.seller_info.phone})]})]}),o.seller_info.description&&e.jsxs("div",{className:"mt-3",children:[e.jsxs("span",{className:"text-xs text-indigo-700 font-bold uppercase tracking-wider flex items-center",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5 mr-1",viewBox:"0 0 20 20",fill:"currentColor",children:e.jsx("path",{fillRule:"evenodd",d:"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",clipRule:"evenodd"})}),"About"]}),e.jsx("p",{className:"text-xs text-gray-700 line-clamp-3 mt-2 bg-blue-50 p-3 rounded-lg italic",children:o.seller_info.description})]})]}),$&&!o.seller_info&&e.jsxs("div",{className:"flex items-center justify-center py-4",children:[e.jsxs("div",{className:"animate-pulse flex space-x-2",children:[e.jsx("div",{className:"h-2 w-2 bg-blue-400 rounded-full"}),e.jsx("div",{className:"h-2 w-2 bg-blue-400 rounded-full"}),e.jsx("div",{className:"h-2 w-2 bg-blue-400 rounded-full"})]}),e.jsx("span",{className:"ml-2 text-xs text-blue-500 font-medium",children:"Loading company information..."})]}),e.jsx("div",{className:"mt-4 flex justify-end",children:e.jsxs("button",{onClick:s=>D(s,o.seller_id),className:"text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-md font-medium hover:from-blue-600 hover:to-indigo-700 transition-colors duration-200 flex items-center",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5 mr-1",viewBox:"0 0 20 20",fill:"currentColor",children:[e.jsx("path",{d:"M10 12a2 2 0 100-4 2 2 0 000 4z"}),e.jsx("path",{fillRule:"evenodd",d:"M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z",clipRule:"evenodd"})]}),"View Profile"]})})]}),e.jsx("div",{className:"absolute -bottom-2 left-1/2 transform -translate-x-1/2",style:{borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderTop:"8px solid white"}})]})]})}export{Z as A,q as C,Y as H};
