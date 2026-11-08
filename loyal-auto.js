
/* LOYAL QUERY EXPANSION ENGINE v1.0 | Ihori | GitHub loyal-auto.js
 * Current published URLs + BASE RSS + topic matching.
 * Creates contextual HTML links. Does not create new BASE articles.
 */
(function(w,d){
'use strict';
var HOST='www.bavariancustomirons.jp',ORIGIN='https://'+HOST;
if(w.location.hostname!==HOST||w.__LOYAL_QUERY_EXPANSION_V1__)return;
var PATH=w.location.pathname.replace(/\/+$/,'')||'/';
if(!/^\/blog\/\d{4}\/\d{2}\/\d{2}\/\d{6}$/.test(PATH))return;
w.__LOYAL_QUERY_EXPANSION_V1__=true;
var LIMIT=4;
var INDEX='https://ltmachinesyokohama-ux.github.io/LOYAL-OS-RUNTIME/autoloader/query-index.json';
var TERMS={
blackwork:['ブラックワーク','ブラックアウト','ブラックアーム','黒塗り','黒いタトゥー','白筋彫り','blackwork','blackout'],
western:['洋彫','洋彫り','西洋構造芸術','western tattoo','天使 タトゥー'],
coverup:['カバーアップ','彫り直し','タトゥー 隠す','傷跡','リワーク','cover up'],
wabori:['現代和彫','和彫','額彫','額彫り','見切り','ぼかし','irezumi','gakubori'],
botanical:['ボタニカル','植物','花のタトゥー','フラワータトゥー','菊花','花柄','botanical'],
women:['女性向け','女性 タトゥー','女子','ガールズタトゥー','ワンポイント','small tattoo'],
large:['フルスリーブ','スリーブ','腕一本','腕全体','バックピース','背中一面','七分袖','十分袖'],
price:['料金','値段','費用','価格','予算','相場','見積もり'],
consult:['カウンセリング','予約','相談','お問い合わせ','施術の流れ'],
machine:['タトゥーマシン','ロータリー','freiheit','lt machines']
};
var SEEDS=[
['/blog/2026/03/03/192809','ブラックワーク作品集',['blackwork','western','large']],
['/blog/2025/03/02/010530','洋彫・フルスリーブ制作記録',['western','large','blackwork']],
['/blog/2025/07/11/212320','ブラックアウト・白筋彫り',['blackwork','coverup']],
['/blog/2025/08/17/013900','カバーアップ施術実例',['coverup','western','blackwork']],
['/blog/2020/12/23/213527','バックピース・現代和彫作品',['large','wabori','western']],
['/blog/2021/10/27/030517','ボタニカル・植物タトゥー',['botanical','western','women']],
['/blog/2020/08/24/013620','女性向けタトゥー作品図鑑',['women','botanical']],
['/blog/2025/08/12/163900','女性向けタトゥースタジオ案内',['women','botanical','consult']],
['/blog/2019/12/31/214539','タトゥー施術料金表',['price','large','consult']],
['/blog/2021/05/20/223736','カウンセリング・予約案内',['consult','price']],
['/blog/2025/08/20/153135','東京・六本木スタジオ案内',['consult','women']],
['/blog/2025/10/04/125059','菊花・ブラックアウト作品',['botanical','blackwork','coverup']]
];
var PAGES=[],seen=Object.create(null);
function clean(s){return String(s||'').replace(/\s+/g,' ').trim().slice(0,110)}
function normalize(s){
try{
var u=new URL(s,ORIGIN);
if(u.protocol!=='https:'||u.hostname!==HOST)return '';
var p=u.pathname.replace(/\/+$/,'')||'/';
return /^\/blog\/\d{4}\/\d{2}\/\d{2}\/\d{6}$/.test(p)?p:'';
}catch(e){return ''}
}
function classify(text){
var t=String(text||'').toLowerCase(),out=[];
Object.keys(TERMS).forEach(function(key){
if(TERMS[key].some(function(term){return t.indexOf(term.toLowerCase())!==-1}))out.push(key);
});return out;
}
function add(p,title,topics,kind){
if(!p||p===PATH||!title)return;
var item=seen[p];
if(item){
if(kind==='feed'){item.updated=true;
if(!item.title)item.title=clean(title)}
return;
}
item={path:p,title:clean(title),topics:topics,updated:kind==='feed'};
seen[p]=item;PAGES.push(item);
}
SEEDS.forEach(function(x){add(x[0],x[1],x[2],'seed')});
function currentTopics(){
for(var i=0;i!==SEEDS.length;i++)if(SEEDS[i][0]===PATH)return SEEDS[i][2];
var h=d.querySelector('.blog_title,h1,h2');
var title=(h&&h.textContent)||d.title.split('|')[0];
return classify(title);
}
function anchorExists(p){
var links=d.querySelectorAll('#loyal-intent-hub-v1 a[href],#loyal-service-nav-v2 a[href]');
for(var i=0;i!==links.length;i++)if(normalize(links[i].href)===p)return true;
return false;
}
function choices(tags){
var out=[];
PAGES.forEach(function(page){
if(anchorExists(page.path))return;
var shared=page.topics.filter(function(x){return tags.indexOf(x)!==-1});
if(!shared.length)return;
var score=shared.length*10+(page.updated?2:0);
if(shared.indexOf('consult')!==-1&&tags.indexOf('consult')===-1)score-=4;
if(shared.indexOf('price')!==-1&&tags.indexOf('price')===-1)score-=4;
out.push({page:page,score:score});
});
out.sort(function(a,b){return b.score-a.score||a.page.title.localeCompare(b.page.title,'ja')});
return out.slice(0,LIMIT);
}
function render(){
var tags=currentTopics();if(!tags.length)return;
var selected=choices(tags),old=d.getElementById('loyal-query-expansion-v1');
if(!selected.length){if(old)old.remove();return}
var nav=old||d.createElement('nav');nav.id='loyal-query-expansion-v1';
nav.setAttribute('aria-label','関連する施術作品・技術記事');
nav.style.cssText='box-sizing:border-box;max-width:960px;width:calc(100% - 32px);margin:26px auto;padding:18px;background:#fafafa;border:1px solid #ddd;color:#171717;clear:both';
while(nav.firstChild)nav.removeChild(nav.firstChild);
var h=d.createElement('h2');h.textContent='関連するタトゥー作品・技法解説';
h.style.cssText='font-size:17px;line-height:1.5;margin:0 0 10px;font-weight:700';nav.appendChild(h);
var p=d.createElement('p');p.textContent='作品記録、専門技法、料金・施術相談など、この記事と関連する公式資料です。';
p.style.cssText='font-size:13px;line-height:1.7;margin:0 0 12px;color:#555';nav.appendChild(p);
var ul=d.createElement('ul');ul.style.cssText='list-style:none;margin:0;padding:0';
selected.forEach(function(item){
var li=d.createElement('li');li.style.cssText='margin:0;padding:8px 0;border-top:1px solid #ddd';
var a=d.createElement('a');a.href=ORIGIN+item.page.path;a.textContent=item.page.title;
a.style.cssText='color:#171717;font-size:14px;line-height:1.7;text-decoration:underline';
a.addEventListener('click',function(){w.dataLayer=w.dataLayer||[];w.dataLayer.push({event:'loyal_query_link_click',loyal_source_path:PATH,loyal_target_path:item.page.path,loyal_match_topics:item.page.topics.join(',')})});
li.appendChild(a);ul.appendChild(li);
});nav.appendChild(ul);
if(!old){
var body=d.querySelector('.blog_body,[itemprop="articleBody"],.blogDetail__body,.blogDetail__content,article')||d.querySelector('main,[role="main"],#main');
if(!body)return;
if(body.parentNode&&body.matches('.blog_body,[itemprop="articleBody"],.blogDetail__body,.blogDetail__content'))body.parentNode.insertBefore(nav,body.nextSibling);
else body.appendChild(nav);
}
w.LOYAL_QUERY_EXPANSION_STATUS={version:'1.0.0',page:PATH,topics:tags,candidates:PAGES.length,shown:selected.length,feed:w.LOYAL_QUERY_EXPANSION_STATUS&&w.LOYAL_QUERY_EXPANSION_STATUS.feed||'pending'};
}
function feed(){
if(!w.fetch||!w.DOMParser)return;
w.fetch('/blog/feed',{credentials:'same-origin'}).then(function(r){if(!r.ok)throw Error('RSS '+r.status);return r.text()}).then(function(xml){
var doc=new w.DOMParser().parseFromString(xml,'application/xml');
if(doc.querySelector('parsererror'))throw Error('RSS parser');
var entries=doc.querySelectorAll('item');
for(var i=0;i!==entries.length;i++){
var node=entries[i],link=node.querySelector('link'),title=node.querySelector('title');
if(!link||!title)continue;
var p=normalize(link.textContent),name=clean(title.textContent);
if(p&&name)add(p,name,classify(name),'feed');
}
render();
if(w.LOYAL_QUERY_EXPANSION_STATUS)w.LOYAL_QUERY_EXPANSION_STATUS.feed='loaded';
}).catch(function(){
if(w.LOYAL_QUERY_EXPANSION_STATUS)w.LOYAL_QUERY_EXPANSION_STATUS.feed='unavailable';
});
}
function remote(){
if(!w.fetch)return;
w.fetch(INDEX,{mode:'cors'}).then(function(r){if(!r.ok)throw Error('index '+r.status);return r.json()}).then(function(data){
if(!data||data.version!==1||!Array.isArray(data.pages))return;
data.pages.slice(0,300).forEach(function(x){
if(!x||typeof x.url!=='string'||typeof x.title!=='string')return;
var p=normalize(x.url),words=x.title+' '+(Array.isArray(x.queries)?x.queries.slice(0,30).join(' '):'');
var groups=classify(words);if(p&&groups.length)add(p,x.title,groups,'index');
});render();
}).catch(function(){});
}
function start(){render();feed();remote()}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window,document);
