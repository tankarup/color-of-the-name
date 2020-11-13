

let palettes = [];

let color_list = [];

function sort_color_list(key){
  console.log(key);
  color_list.sort(function(a,b){
    if( a[key] < b[key] ) return -1;
    if( a[key] > b[key] ) return 1;
    //keyが同じ値だったら、次に色相で並べ替え
    if (a['hue'] < b['hue']) return -1;
    if (a['hue'] > b['hue']) return 1;
    return 0;
  });
  refresh_color_list();
}

function init_menu(){
  let menu_html = '';

  menus = [
    ['label', 'アイドル名'],
    ['title', '事務所'],
    ['wa_name', '和名'],
    ['you_name', '洋名'],
    ['hue', '色相']
  ];
  for (let menu of menus){
    const label = menu[1];
    const id = menu[0];
    menu_html += `<span class="dropdown-item" onclick="sort_color_list(\'${id}\');">${label}</span>`;
    
  }
  document.getElementById('dropdown-menu-sort').innerHTML = menu_html;
}

function refresh_color_list(){

  let colors_html = '';
  colors_html += '<table class="table">';
  
  for (let item of color_list){



    colors_html += `
    <tr style="color: ${item.font_color}; text-align: center;">
      <td style="background-color: ${item.color}; font-family: serif;">${item.label}</td>
      <td style="background-color: ${item.color}; font-family: serif;" ><span class="note" onclick="show_note('${item.wa_name}', '${color_names[0][item.wa_color]["よみ"]}');">${item.wa_name}</span></span></td>
      <td style="background-color: ${item.color}; font-family: serif;">${item.you_name}</td>
    </tr>
    `;
  }
  colors_html += '</table>';
  document.getElementById('colors').innerHTML = colors_html;
}

function init(){


  init_menu();

  color_list  = [];

  const colorClassifiers = [];
  for (let i = 0; i < palettes.length; i++){
    colorClassifiers[i] = new ColorClassifier(palettes[i]);
  }


  for (let idol of idols){

    const color = idol[2];
    const label = idol[0];
    const title = idol[1];

    //765ASと1st visionが被るのでスキップ
    if (title == '1st Vision'){
      continue;
    }

    const lightness = chroma(color).get('hsl.l');
    let hue = chroma(color).get('hsl.h');
    if (isNaN(hue)) hue = 0; //
    const font_color = chroma.contrast(color, 'white') > chroma.contrast(color, 'black') ? 'white' : 'black';


    const nearest_wa_color = colorClassifiers[0].classify(color, 'hex');
    const nearest_wa_name = color_names[0][nearest_wa_color]['名前'];
    const nearest_you_color = colorClassifiers[1].classify(color, 'hex');
    const nearest_you_name = color_names[1][nearest_you_color]['名前'];




    color_list.push({
      color: color,
      label: label,
      title: title,
      wa_color: nearest_wa_color,
      wa_name: nearest_wa_name,
      you_color: nearest_you_color,
      you_name: nearest_you_name,
      hue: hue,
      font_color: font_color,
    });
  }
  

  //ランダムに並び替えてみる
  color_list.sort(function(a, b) { return Math.random() > 0.5 ? 1 : -1; });
  refresh_color_list();


}

function show_img(title){
  const encoded_query = encodeURI(title);
  const url = `http://ja.wikipedia.org/w/api.php?origin=*&action=query&generator=images&gimlimit=10&prop=imageinfo&iiprop=url|dimensions|mime&format=json&titles=${title}`;	
  const request = new XMLHttpRequest();
  request.open('GET', url , true);
  request.onload = function () {
    data = this.response;
    json = JSON.parse(data);
    console.log(json);

    const pages = json.query.pages;
    const keys = Object.keys(pages);
    for (let key of keys){
      const img_url = pages[key].imageinfo[0].url;
      const ext = img_url.slice(-3);
      if (ext.toUpperCase() === 'jpg'.toUpperCase()){
        document.getElementById('note_img').innerHTML = `<img src="${img_url}" style="max-height: 100px;">`;
        break;
      }
    }
    

  }
  request.send();
}

let generating_note = false;

$("#colors").click(function(){
  if (generating_note){
    generating_note = false;
    return;
  }
  document.getElementById('descriptions').innerHTML = '';
  console.log("color click");
});



function show_note(wa_name, yomi){
  console.log("note click");
  generating_note = true;
  let note_html = '';
  note_html += `<p class="text-light">${wa_name}(${yomi})</p>
  <div id="note_title"></div>
  <table><tr>
  <td><span id="note_img"></span></td>
  <td><span id="note_desc" class="text-light"></span></td>
  </tr></table>`;

  document.getElementById('descriptions').innerHTML = note_html;

  const encoded_query = encodeURI(wa_name); //検索ワードに'色'を追加すると、刈安などは改善するが、勿忘草などは悪化する
  const url = `http://ja.wikipedia.org/w/api.php?origin=*&format=json&action=query&list=search&srlimit=5&srsearch=${encoded_query}`;	
  const request = new XMLHttpRequest();
  request.open('GET', url , true);
  request.onload = function () {
    data = this.response;
    json = JSON.parse(data);
    console.log(json);
    const title = json.query.search;
    for (let page of title){
      const title = page.title;
      if (title[0] == '色'){
        continue;
      }
      const snippet = page.snippet;
      document.getElementById('note_title').innerHTML = `<a class="text-light" href="https://ja.wikipedia.org/wiki/${title}"><u>${title} (Wikipediaより)</u></a>`;
      document.getElementById('note_desc').innerHTML = `${snippet}...`;
      show_img(title);
      break;
    }


  }
  request.send();
  


  
  
  
}


const color_names = [];
color_names[0] = 
{'#EF454A': {'名前': '朱', 'よみ': 'しゅ'},
 '#94474B': {'名前': '蘇芳', 'よみ': 'すおう'},
 '#E38089': {'名前': '桃', 'よみ': 'もも'},
 '#DF828A': {'名前': '紅梅', 'よみ': 'こうばい'},
 '#AD3140': {'名前': '臙脂', 'よみ': 'えんじ'},
 '#FF7F8F': {'名前': '珊瑚', 'よみ': 'さんご'},
 '#FBDADE': {'名前': '桜', 'よみ': 'さくら'},
 '#9E2236': {'名前': '茜', 'よみ': 'あかね'},
 '#E64B6B': {'名前': '韓紅', 'よみ': 'からくれない'},
 '#B81A3E': {'名前': '紅赤', 'よみ': 'べにあか'},
 '#D53E62': {'名前': '薔薇', 'よみ': 'ばら'},
 '#BE0032': {'名前': '赤', 'よみ': 'あか'},
 '#FA9CB8': {'名前': '鴇', 'よみ': 'とき'},
 '#BE003F': {'名前': '紅', 'よみ': 'べに'},
 '#CF4078': {'名前': '躑躅', 'よみ': 'つつじ'},
 '#DA508F': {'名前': '赤紫', 'よみ': 'あかむらさき'},
 '#C94093': {'名前': '牡丹', 'よみ': 'ぼたん'},
 '#C573B2': {'名前': '菖蒲', 'よみ': 'あやめ'},
 '#473946': {'名前': '茄子紺', 'よみ': 'なすこん'},
 '#422C41': {'名前': '紫紺', 'よみ': 'しこん'},
 '#765276': {'名前': '古代紫', 'よみ': 'こだいむらさき'},
 '#A757A8': {'名前': '紫', 'よみ': 'むらさき'},
 '#614876': {'名前': '江戸紫', 'よみ': 'えどむらさき'},
 '#665971': {'名前': '鳩羽', 'よみ': 'はとば'},
 '#744B98': {'名前': '菖蒲', 'よみ': 'しょうぶ'},
 '#714C99': {'名前': '菫', 'よみ': 'すみれ'},
 '#7445AA': {'名前': '青紫', 'よみ': 'あおむらさき'},
 '#9883C9': {'名前': '藤紫', 'よみ': 'ふじむらさき'},
 '#A294C8': {'名前': '藤', 'よみ': 'ふじ'},
 '#69639A': {'名前': '藤納戸', 'よみ': 'ふじなんど'},
 '#353573': {'名前': '紺藍', 'よみ': 'こんあい'},
 '#292934': {'名前': '鉄紺', 'よみ': 'てつこん'},
 '#4347A2': {'名前': '桔梗', 'よみ': 'ききょう'},
 '#3A3C4F': {'名前': '勝', 'よみ': 'かち'},
 '#384D98': {'名前': '群青', 'よみ': 'ぐんじょう'},
 '#435AA0': {'名前': '杜若', 'よみ': 'かきつばた'},
 '#343D55': {'名前': '紺', 'よみ': 'こん'},
 '#3A4861': {'名前': '紺青', 'よみ': 'こんじょう'},
 '#27477A': {'名前': '瑠璃紺', 'よみ': 'るりこん'},
 '#89ACD7': {'名前': '勿忘草', 'よみ': 'わすれなぐさ'},
 '#72777D': {'名前': '鉛', 'よみ': 'なまり'},
 '#00519A': {'名前': '瑠璃', 'よみ': 'るり'},
 '#223546': {'名前': '濃藍', 'よみ': 'こいあい'},
 '#2B618F': {'名前': '縹', 'よみ': 'はなだ'},
 '#2B4B65': {'名前': '藍', 'よみ': 'あい'},
 '#006AB6': {'名前': '青', 'よみ': 'あお'},
 '#89BDDE': {'名前': '空', 'よみ': 'そら'},
 '#007BC3': {'名前': '露草', 'よみ': 'つゆくさ'},
 '#576D79': {'名前': '藍鼠', 'よみ': 'あいねず'},
 '#9DCCE0': {'名前': '水', 'よみ': 'みず'},
 '#7EB1C1': {'名前': '甕覗き', 'よみ': 'かめのぞき'},
 '#73B3C1': {'名前': '白群', 'よみ': 'びゃくぐん'},
 '#00687C': {'名前': '納戸', 'よみ': 'なんど'},
 '#00859B': {'名前': '浅葱', 'よみ': 'あさぎ'},
 '#53A8B7': {'名前': '新橋', 'よみ': 'しんばし'},
 '#6D969C': {'名前': '水浅葱', 'よみ': 'みずあさぎ'},
 '#608A8E': {'名前': '錆浅葱', 'よみ': 'さびあさぎ'},
 '#008E94': {'名前': '青緑', 'よみ': 'あおみどり'},
 '#24433E': {'名前': '鉄', 'よみ': 'てつ'},
 '#6AA89D': {'名前': '青竹', 'よみ': 'あおたけ'},
 '#00A37E': {'名前': '若竹', 'よみ': 'わかたけ'},
 '#00533E': {'名前': '萌葱', 'よみ': 'もえぎ'},
 '#6DA895': {'名前': '青磁', 'よみ': 'せいじ'},
 '#007B50': {'名前': '常磐', 'よみ': 'ときわ'},
 '#005638': {'名前': '深緑', 'よみ': 'ふかみどり'},
 '#00B66E': {'名前': '緑', 'よみ': 'みどり'},
 '#3C6754': {'名前': '千歳緑', 'よみ': 'ちとせみどり'},
 '#4D8169': {'名前': '緑青', 'よみ': 'ろくしょう'},
 '#BADBC7': {'名前': '白緑', 'よみ': 'びゃくろく'},
 '#6E7972': {'名前': '利休鼠', 'よみ': 'りきゅうねずみ'},
 '#687E52': {'名前': '松葉', 'よみ': 'まつば'},
 '#A9C087': {'名前': '若葉', 'よみ': 'わかば'},
 '#737C3E': {'名前': '草', 'よみ': 'くさ'},
 '#97A61E': {'名前': '萌黄', 'よみ': 'もえぎ'},
 '#AAB300': {'名前': '若草', 'よみ': 'わかくさ'},
 '#BBC000': {'名前': '黄緑', 'よみ': 'きみどり'},
 '#7C7A37': {'名前': '苔', 'よみ': 'こけ'},
 '#C2BD3D': {'名前': '鶸', 'よみ': 'ひわ'},
 '#706C3E': {'名前': '鶯', 'よみ': 'うぐいす'},
 '#D6C949': {'名前': '黄檗', 'よみ': 'きはだ'},
 '#C0BA7F': {'名前': '抹茶', 'よみ': 'まっちゃ'},
 '#EDD60E': {'名前': '中黄', 'よみ': 'ちゅうき'},
 '#E3C700': {'名前': '黄', 'よみ': 'き'},
 '#EAD56B': {'名前': '刈安', 'よみ': 'かりやす'},
 '#716B4A': {'名前': '海松', 'よみ': 'みる'},
 '#6A5F37': {'名前': '鶯茶', 'よみ': 'うぐいすちゃ'},
 '#EDAE00': {'名前': '鬱金', 'よみ': 'うこん'},
 '#FFBB00': {'名前': '向日葵', 'よみ': 'ひまわり'},
 '#F8A900': {'名前': '山吹', 'よみ': 'やまぶき'},
 '#C8A65D': {'名前': '芥子', 'よみ': 'からし'},
 '#B47700': {'名前': '金茶', 'よみ': 'きんちゃ'},
 '#B8883B': {'名前': '黄土', 'よみ': 'おうど'},
 '#C5B69E': {'名前': '砂', 'よみ': 'すな'},
 '#DED2BF': {'名前': '象牙', 'よみ': 'ぞうげ'},
 '#EBE7E1': {'名前': '胡粉', 'よみ': 'ごふん'},
 '#F4BD6B': {'名前': '卵', 'よみ': 'たまご'},
 '#EB8400': {'名前': '蜜柑', 'よみ': 'みかん'},
 '#6B3E08': {'名前': '褐', 'よみ': 'かっしょく'},
 '#9F6C31': {'名前': '土', 'よみ': 'つち'},
 '#AA7A40': {'名前': '琥珀', 'よみ': 'こはく'},
 '#847461': {'名前': '朽葉', 'よみ': 'くちば'},
 '#5D5245': {'名前': '煤竹', 'よみ': 'すすたけ'},
 '#D4A168': {'名前': '小麦', 'よみ': 'こむぎ'},
 '#EAE0D5': {'名前': '生成り', 'よみ': 'きなり'},
 '#EF810F': {'名前': '橙', 'よみ': 'だいだい'},
 '#D89F6D': {'名前': '杏', 'よみ': 'あんず'},
 '#FAA55C': {'名前': '柑子', 'よみ': 'こうじ'},
 '#B1632A': {'名前': '黄茶', 'よみ': 'きちゃ'},
 '#6D4C33': {'名前': '茶', 'よみ': 'ちゃ'},
 '#F1BB93': {'名前': '肌', 'よみ': 'はだ'},
 '#B0764F': {'名前': '駱駝', 'よみ': 'らくだ'},
 '#816551': {'名前': '灰茶', 'よみ': 'はいちゃ'},
 '#564539': {'名前': '焦茶', 'よみ': 'こげちゃ'},
 '#D86011': {'名前': '黄赤', 'よみ': 'きあか'},
 '#998D86': {'名前': '茶鼠', 'よみ': 'ちゃねずみ'},
 '#B26235': {'名前': '代赭', 'よみ': 'たいしゃ'},
 '#704B38': {'名前': '栗', 'よみ': 'くり'},
 '#3E312B': {'名前': '黒茶', 'よみ': 'くろちゃ'},
 '#865C4B': {'名前': '桧皮', 'よみ': 'ひわだ'},
 '#B64826': {'名前': '樺', 'よみ': 'かば'},
 '#DB5C35': {'名前': '柿', 'よみ': 'かき'},
 '#EB6940': {'名前': '黄丹', 'よみ': 'おうに'},
 '#914C35': {'名前': '煉瓦', 'よみ': 'れんが'},
 '#B5725C': {'名前': '肉桂', 'よみ': 'にっけい'},
 '#624035': {'名前': '錆', 'よみ': 'さび'},
 '#E65226': {'名前': '赤橙', 'よみ': 'あかだいだい'},
 '#8D3927': {'名前': '赤錆', 'よみ': 'あかさび'},
 '#AD4E39': {'名前': '赤茶', 'よみ': 'あかちゃ'},
 '#EA4E31': {'名前': '金赤', 'よみ': 'きんあか'},
 '#693C34': {'名前': '海老茶', 'よみ': 'えびちゃ'},
 '#905D54': {'名前': '小豆', 'よみ': 'あずき'},
 '#863E33': {'名前': '弁柄', 'よみ': 'べんがら'},
 '#6D3A33': {'名前': '紅海老茶', 'よみ': 'べにえびちゃ'},
 '#7A453D': {'名前': '鳶', 'よみ': 'とび'},
 '#D1483E': {'名前': '鉛丹', 'よみ': 'えんたん'},
 '#9E413F': {'名前': '紅樺', 'よみ': 'べにかば'},
 '#EF4644': {'名前': '紅緋', 'よみ': 'べにひ'},
 '#F0F0F0': {'名前': '白', 'よみ': 'しろ'},
 '#9C9C9C': {'名前': '銀鼠', 'よみ': 'ぎんねず'},
 '#838383': {'名前': '鼠', 'よみ': 'ねずみ'},
 '#767676': {'名前': '灰', 'よみ': 'はい'},
 '#343434': {'名前': '墨', 'よみ': 'すみ'},
 '#2A2A2A': {'名前': '黒', 'よみ': 'くろ'}};

 //---------------------------------------------------------------------------------------------------------------------

color_names[1] = 
{'#EF454A': {'名前': 'Vermilion', 'よみ': 'バーミリオン'},
 '#662B2C': {'名前': 'Maroon', 'よみ': 'マルーン'},
 '#EA9198': {'名前': 'Pink', 'よみ': 'ピンク'},
 '#533638': {'名前': 'Bordeaux', 'よみ': 'ボルドー'},
 '#DF3447': {'名前': 'Red', 'よみ': 'レッド'},
 '#FF7F8F': {'名前': 'Coral Red', 'よみ': 'コーラルレッド'},
 '#C67A85': {'名前': 'Old Rose', 'よみ': 'オールドローズ'},
 '#442E31': {'名前': 'Burgundy', 'よみ': 'バーガンディー'},
 '#DF334E': {'名前': 'Poppy Red', 'よみ': 'ポピーレッド'},
 '#CE2143': {'名前': 'Signal red', 'よみ': 'シグナルレッド'},
 '#EE8EA0': {'名前': 'Rose Pink', 'よみ': 'ローズピンク'},
 '#DB3561': {'名前': 'Rose', 'よみ': 'ローズ'},
 '#80273F': {'名前': 'Wine Red', 'よみ': 'ワインレッド'},
 '#BE0039': {'名前': 'Carmine', 'よみ': 'カーマイン'},
 '#AE2B52': {'名前': 'Cochineal Red', 'よみ': 'コチニールレッド'},
 '#CA4775': {'名前': 'Rose Red', 'よみ': 'ローズレッド'},
 '#B90B50': {'名前': 'Ruby Red', 'よみ': 'ルビーレッド'},
 '#D35889': {'名前': 'Cherry Pink', 'よみ': 'チェリーピンク'},
 '#BB004B': {'名前': 'Strawberry', 'よみ': 'ストロベリー'},
 '#D13A84': {'名前': 'Magenta', 'よみ': 'マゼンタ'},
 '#C69CC5': {'名前': 'Orchid', 'よみ': 'オーキッド'},
 '#A757A8': {'名前': 'Purple', 'よみ': 'パープル'},
 '#C29DC8': {'名前': 'Lilac', 'よみ': 'ライラック'},
 '#9A8A9F': {'名前': 'Lavender', 'よみ': 'ラベンダー'},
 '#855896': {'名前': 'Mauve', 'よみ': 'モーブ'},
 '#4B474D': {'名前': 'Charcoal Grey', 'よみ': 'チャコールグレイ'},
 '#6D696F': {'名前': 'Steel Grey', 'よみ': 'スチールグレイ'},
 '#714C99': {'名前': 'Violet', 'よみ': 'バイオレット'},
 '#8865B2': {'名前': 'Heliotrope', 'よみ': 'ヘリオトロープ'},
 '#433171': {'名前': 'Pansy', 'よみ': 'パンジー'},
 '#7967C3': {'名前': 'Wistaria', 'よみ': 'ウイスタリア'},
 '#304285': {'名前': 'Oriental Blue', 'よみ': 'オリエンタルブルー'},
 '#384D98': {'名前': 'Ultramarine Blue', 'よみ': 'ウルトラマリンブルー'},
 '#343D55': {'名前': 'Navy Blue', 'よみ': 'ネービーブルー'},
 '#252A35': {'名前': 'Midnight Blue', 'よみ': 'ミッドナイトブルー'},
 '#6E82AD': {'名前': 'Hyacinth', 'よみ': 'ヒヤシンス'},
 '#3A4861': {'名前': 'Iron Blue', 'よみ': 'アイアンブルー'},
 '#515356': {'名前': 'Slate Grey', 'よみ': 'スレートグレイ'},
 '#5A7993': {'名前': 'Sax Blue', 'よみ': 'サックスブルー'},
 '#A3BACD': {'名前': 'Baby Blue', 'よみ': 'ベビーブルー'},
 '#0062A0': {'名前': 'Cobalt Blue', 'よみ': 'コバルトブルー'},
 '#89BDDE': {'名前': 'Sky Blue', 'よみ': 'スカイブルー'},
 '#B3B8BB': {'名前': 'Sky Grey', 'よみ': 'スカイグレイ'},
 '#006FAB': {'名前': 'Blue', 'よみ': 'ブルー'},
 '#87AFC5': {'名前': 'Horizon Blue', 'よみ': 'ホリゾンブルー'},
 '#0073A2': {'名前': 'Cerulean Blue', 'よみ': 'セルリアンブルー'},
 '#009CD1': {'名前': 'Cyan', 'よみ': 'シアン'},
 '#00526B': {'名前': 'Marine Blue', 'よみ': 'マリンブルー'},
 '#009DBF': {'名前': 'Turquoise Blue', 'よみ': 'ターコイズブルー'},
 '#006E7B': {'名前': 'Peacock Blue', 'よみ': 'ピーコックブルー'},
 '#3D8E95': {'名前': 'Nile Blue', 'よみ': 'ナイルブルー'},
 '#007D7F': {'名前': 'Peacock Green', 'よみ': 'ピーコックグリーン'},
 '#00483A': {'名前': 'Billiard Green', 'よみ': 'ビリヤードグリーン'},
 '#006D56': {'名前': 'Viridian', 'よみ': 'ビリジアン'},
 '#2A7762': {'名前': 'Forest Green', 'よみ': 'フォレストグリーン'},
 '#00A474': {'名前': 'Emerald Green', 'よみ': 'エメラルドグリーン'},
 '#09C289': {'名前': 'Cobalt Green', 'よみ': 'コバルトグリーン'},
 '#007E4E': {'名前': 'Malachite Green', 'よみ': 'マラカイトグリーン'},
 '#204537': {'名前': 'Bottle Green', 'よみ': 'ボトルグリーン'},
 '#009A57': {'名前': 'Green', 'よみ': 'グリーン'},
 '#58CE91': {'名前': 'Mint Green', 'よみ': 'ミントグリーン'},
 '#A2D29E': {'名前': 'Apple Green', 'よみ': 'アップルグリーン'},
 '#4C6733': {'名前': 'Ivy Green', 'よみ': 'アイビーグリーン'},
 '#97B64D': {'名前': 'Sea Green', 'よみ': 'シーグリーン'},
 '#89983B': {'名前': 'Leaf Green', 'よみ': 'リーフグリーン'},
 '#737C3E': {'名前': 'Grass Green', 'よみ': 'グラスグリーン'},
 '#C0D136': {'名前': 'Chartreuse Green', 'よみ': 'シャトルーズグリーン'},
 '#575531': {'名前': 'Olive Green', 'よみ': 'オリーブグリーン'},
 '#D9CA00': {'名前': 'Lemon Yellow', 'よみ': 'レモンイエロー'},
 '#F4D500': {'名前': 'Yellow', 'よみ': 'イエロー'},
 '#EDD634': {'名前': 'Canary Yellow', 'よみ': 'カナリヤ'},
 '#5C5424': {'名前': 'Olive', 'よみ': 'オリーブ'},
 '#655F47': {'名前': 'Olive Drab', 'よみ': 'オリーブドラブ'},
 '#F6BF00': {'名前': 'Chrome Yellow', 'よみ': 'クロムイエロー'},
 '#E4D3A2': {'名前': 'Cream Yellow', 'よみ': 'クリームイエロー'},
 '#765B1B': {'名前': 'Raw umber', 'よみ': 'ローアンバー'},
 '#EEC063': {'名前': 'Naples Yellow', 'よみ': 'ネープルスイエロー'},
 '#FFA400': {'名前': 'Marigold', 'よみ': 'マリーゴールド'},
 '#DFC291': {'名前': 'Leghorn', 'よみ': 'レグホーン'},
 '#B8883B': {'名前': 'Yellow Ocher', 'よみ': 'イエローオーカー'},
 '#DED2BF': {'名前': 'Ivory', 'よみ': 'アイボリー'},
 '#57462D': {'名前': 'Burnt Umber', 'よみ': 'バーントアンバー'},
 '#483C2C': {'名前': 'Sepia', 'よみ': 'セピア'},
 '#7A592F': {'名前': 'Bronze', 'よみ': 'ブロンズ'},
 '#BCA78D': {'名前': 'Beige', 'よみ': 'ベージュ'},
 '#F09629': {'名前': 'Mandarin Orange', 'よみ': 'マンダリンオレンジ'},
 '#E89A3C': {'名前': 'Golden Yellow', 'よみ': 'ゴールデンイエロー'},
 '#AA7A40': {'名前': 'Amber', 'よみ': 'アンバー'},
 '#C09567': {'名前': 'Buff', 'よみ': 'バフ'},
 '#EF810F': {'名前': 'Orange', 'よみ': 'オレンジ'},
 '#F5CDA6': {'名前': 'Ecru Beige', 'よみ': 'エクルベイジュ'},
 '#9E6C3F': {'名前': 'Tan', 'よみ': 'タン'},
 '#D89F6D': {'名前': 'Apricot', 'よみ': 'アプリコット'},
 '#9F7C5C': {'名前': 'Cork', 'よみ': 'コルク'},
 '#B1632A': {'名前': 'Raw Sienna', 'よみ': 'ローシェンナ'},
 '#6D4C33': {'名前': 'Brown', 'よみ': 'ブラウン'},
 '#E8BDA5': {'名前': 'Peach', 'よみ': 'ピーチ'},
 '#704B38': {'名前': 'Cocoa Brown', 'よみ': 'ココアブラウン'},
 '#F6A57D': {'名前': 'Blond', 'よみ': 'ブロンド'},
 '#A36851': {'名前': 'Khaki', 'よみ': 'カーキー'},
 '#EFBAA8': {'名前': 'Nail Pink', 'よみ': 'ネールピンク'},
 '#C55431': {'名前': 'Carrot Orange', 'よみ': 'キャロットオレンジ'},
 '#A2553C': {'名前': 'Burnt Sienna', 'よみ': 'バーントシェンナ'},
 '#503830': {'名前': 'Chocolate', 'よみ': 'チョコレート'},
 '#F9C9B9': {'名前': 'Shell Pink', 'よみ': 'シェルピンク'},
 '#FD5A2A': {'名前': 'Chinese Red', 'よみ': 'チャイニーズレッド'},
 '#FF9E8C': {'名前': 'Salmon pink', 'よみ': 'サーモンピンク'},
 '#A95045': {'名前': 'Terracotta', 'よみ': 'テラコッタ'},
 '#FEC6C5': {'名前': 'Baby Pink', 'よみ': 'ベビーピンク'},
 '#DE3838': {'名前': 'Scarlet', 'よみ': 'スカーレット'},
 '#8C8080': {'名前': 'Rose Grey', 'よみ': 'ローズグレイ'},
 '#F0F0F0': {'名前': 'White', 'よみ': 'ホワイト'},
 '#AAAAAA': {'名前': 'Pearl Grey', 'よみ': 'パールグレイ'},
 '#9C9C9C': {'名前': 'Silver Grey', 'よみ': 'シルバーグレイ'},
 '#8F8F8F': {'名前': 'Ash Grey', 'よみ': 'アッシュグレイ'},
 '#767676': {'名前': 'Grey', 'よみ': 'グレイ'},
 '#212121': {'名前': 'Lamp Black', 'よみ': 'ランプブラック'}};

 //-------------------------------------------------------------------------------------------------------------


const idols = 
[['佐久間まゆ', 'CinderellaGirls', '#D1197B'],
 ['村上巴', 'CinderellaGirls', '#D42E38'],
 ['島原エレナ', 'MillionStars', '#9BCE92'],
 ['向井拓海', 'CinderellaGirls', '#A90582'],
 ['七尾百合子', 'MillionStars', '#C7B83C'],
 ['速水奏', 'CinderellaGirls', '#0D386D'],
 ['依田芳乃', 'CinderellaGirls', '#C7BAB4'],
 ['天海春香', '1st Vision', '#E22B30'],
 ['姫川友紀', 'CinderellaGirls', '#E9870C'],
 ['桜庭薫', '315ProIdols', '#1945BA'],
 ['百瀬莉緒', 'MillionStars', '#F19591'],
 ['ピエール', '315ProIdols', '#8BDC63'],
 ['水本ゆかり', 'CinderellaGirls', '#E8BAD6'],
 ['四条貴音', '1st Vision', '#A6126A'],
 ['葛之葉雨彦', '315ProIdols', '#111721'],
 ['神崎蘭子', 'CinderellaGirls', '#7E3188'],
 ['若里春名', '315ProIdols', '#71D448'],
 ['水瀬伊織', '765AS', '#FD99E1'],
 ['松永涼', 'CinderellaGirls', '#202449'],
 ['鷹富士茄子', 'CinderellaGirls', '#5C068F'],
 ['喜多見柚', 'CinderellaGirls', '#EADC62'],
 ['宮尾美也', 'MillionStars', '#D7A96B'],
 ['周防桃子', 'MillionStars', '#EFB864'],
 ['月岡恋鐘', '283Pro', '#F94CAD'],
 ['龍崎薫', 'CinderellaGirls', '#F4D956'],
 ['箱崎星梨花', 'MillionStars', '#ED90BA'],
 ['硲道夫', '315ProIdols', '#436CA9'],
 ['南条光', 'CinderellaGirls', '#ED0829'],
 ['双海亜美', '765AS', '#FFE43F'],
 ['高坂海美', 'MillionStars', '#E9739B'],
 ['市川雛菜', '283Pro', '#FFC639'],
 ['大和亜季', 'CinderellaGirls', '#276E4E'],
 ['園田智代子', '283Pro', '#F93B90'],
 ['島村卯月', 'CinderellaGirls', '#EC7092'],
 ['天空橋朋花', 'MillionStars', '#BEE3E3'],
 ['伊集院北斗', '315ProIdols', '#1C23AA'],
 ['難波笑美', 'CinderellaGirls', '#E9463D'],
 ['堀裕子', 'CinderellaGirls', '#E89B55'],
 ['福丸小糸', '283Pro', '#7967C3'],
 ['樋口円香', '283Pro', '#BE1E3E'],
 ['鷹城恭二', '315ProIdols', '#6AC4E9'],
 ['徳川まつり', 'MillionStars', '#5ABFB7'],
 ['三船美優', 'CinderellaGirls', '#01AAA5'],
 ['緒方智絵里', 'CinderellaGirls', '#69B64C'],
 ['市原仁奈', 'CinderellaGirls', '#F7DE8C'],
 ['菊地真', '1st Vision', '#515558'],
 ['椎名法子', 'CinderellaGirls', '#EA495B'],
 ['大槻唯', 'CinderellaGirls', '#EFB817'],
 ['白坂小梅', 'CinderellaGirls', '#AAC5E2'],
 ['舞田類', '315ProIdols', '#F5D24B'],
 ['九十九一希', '315ProIdols', '#CF9E51'],
 ['望月杏奈', 'MillionStars', '#7E6CA8'],
 ['日野茜', 'CinderellaGirls', '#EA4F21'],
 ['双葉杏', 'CinderellaGirls', '#F19DB4'],
 ['東雲荘一郎', '315ProIdols', '#02946C'],
 ['永吉昴', 'MillionStars', '#AEB49C'],
 ['如月千早', '765AS', '#2743D2'],
 ['三浦あずさ', '1st Vision', '#9238BE'],
 ['舞浜歩', 'MillionStars', '#E25A9B'],
 ['蒼井享介', '315ProIdols', '#23CD7A'],
 ['久川颯', 'CinderellaGirls', '#7ADAD6'],
 ['小早川紗枝', 'CinderellaGirls', '#D967A3'],
 ['田中摩美々', '283Pro', '#A846FB'],
 ['我那覇響', '1st Vision', '#01ADB9'],
 ['黒野玄武', '315ProIdols', '#0F0C9F'],
 ['城ヶ崎莉嘉', 'CinderellaGirls', '#F7D30D'],
 ['乙倉悠貴', 'CinderellaGirls', '#F2C0C1'],
 ['福田のり子', 'MillionStars', '#ECEB70'],
 ['横山奈緒', 'MillionStars', '#788BC5'],
 ['本田未央', 'CinderellaGirls', '#F6B128'],
 ['十時愛梨', 'CinderellaGirls', '#E9425C'],
 ['幽谷霧子', '283Pro', '#D9F2DD'],
 ['大河タケル', '315ProIdols', '#0E0C9F'],
 ['日高愛', 'DearlyStars', '#E85786'],
 ['秋月涼', '315ProIdols', '#70B449'],
 ['菊地真', '765AS', '#515558'],
 ['黛冬優子', '283Pro', '#5CE626'],
 ['蒼井悠介', '315ProIdols', '#FEE806'],
 ['四条貴音', '765AS', '#A6126A'],
 ['柏木翼', '315ProIdols', '#3BAF29'],
 ['一ノ瀬志希', 'CinderellaGirls', '#A01B50'],
 ['芹沢あさひ', '283Pro', '#F30100'],
 ['棟方愛海', 'CinderellaGirls', '#C82F7F'],
 ['桜守歌織', 'MillionStars', '#274079'],
 ['所恵美', 'MillionStars', '#454341'],
 ['最上静香', 'MillionStars', '#6495CF'],
 ['萩原雪歩', '1st Vision', '#D3DDE9'],
 ['双海真美', '1st Vision', '#FFE43F'],
 ['渡辺みのり', '315ProIdols', '#FA90A2'],
 ['兜大吾', '315ProIdols', '#E41C1A'],
 ['浜口あやめ', 'CinderellaGirls', '#471C87'],
 ['御手洗翔太', '315ProIdols', '#94D509'],
 ['冬美旬', '315ProIdols', '#1845B9'],
 ['木村龍', '315ProIdols', '#EE7220'],
 ['小日向美穂', 'CinderellaGirls', '#C64796'],
 ['上条春菜', 'CinderellaGirls', '#59B7DB'],
 ['ジュリア', 'MillionStars', '#D7385F'],
 ['相葉夕美', 'CinderellaGirls', '#EAE28D'],
 ['萩原雪歩', '765AS', '#D3DDE9'],
 ['及川雫', 'CinderellaGirls', '#FFFFFF'],
 ['道明寺歌鈴', 'CinderellaGirls', '#CC252D'],
 ['有栖川夏葉', '283Pro', '#90E667'],
 ['真壁瑞希', 'MillionStars', '#99B7DC'],
 ['高山紗代子', 'MillionStars', '#7F6575'],
 ['脇山珠美', 'CinderellaGirls', '#3A75BB'],
 ['松田亜利沙', 'MillionStars', '#B54461'],
 ['春日未来', 'MillionStars', '#EA5B76'],
 ['神谷幸広', '315ProIdols', '#F09079'],
 ['双海真美', '765AS', '#FFE43F'],
 ['城ヶ崎美嘉', 'CinderellaGirls', '#F4982B'],
 ['片桐早苗', 'CinderellaGirls', '#E94D1A'],
 ['関裕美', 'CinderellaGirls', '#F8C5C1'],
 ['高森藍子', 'CinderellaGirls', '#C5DD7F'],
 ['櫻木真乃', '283Pro', '#FFBAD6'],
 ['川島瑞樹', 'CinderellaGirls', '#3F59A6'],
 ['西城樹里', '283Pro', '#FFCB13'],
 ['浅倉透', '283Pro', '#50D0D0'],
 ['安部菜々', 'CinderellaGirls', '#E64A79'],
 ['小宮果穂', '283Pro', '#E75029'],
 ['古論クリス', '315ProIdols', '#1FC1DD'],
 ['前川みく', 'CinderellaGirls', '#CA113A'],
 ['野々原茜', 'MillionStars', '#EB613F'],
 ['櫻井桃華', 'CinderellaGirls', '#EF93BC'],
 ['森久保乃々', 'CinderellaGirls', '#97D3D3'],
 ['天道輝', '315ProIdols', '#E31C1A'],
 ['アナスタシア', 'CinderellaGirls', '#B0C5E4'],
 ['三峰結華', '283Pro', '#3B91C4'],
 ['大崎甘奈', '283Pro', '#F54275'],
 ['藤原肇', 'CinderellaGirls', '#7271B3'],
 ['猫柳キリオ', '315ProIdols', '#F7BD05'],
 ['白石紬', 'MillionStars', '#EBE1FF'],
 ['輿水幸子', 'CinderellaGirls', '#CCAACF'],
 ['三浦あずさ', '765AS', '#9238BE'],
 ['高槻やよい', '765AS', '#F39939'],
 ['上田鈴帆', 'CinderellaGirls', '#C9870F'],
 ['双海亜美', '1st Vision', '#FFE43F'],
 ['北村想楽', '315ProIdols', '#477525'],
 ['佐藤心', 'CinderellaGirls', '#E44E8E'],
 ['山下次郎', '315ProIdols', '#EE7602'],
 ['秋月涼', 'DearlyStars', '#B2D468'],
 ['アスラン=BBⅡ世', '315ProIdols', '#606CB2'],
 ['北条加蓮', 'CinderellaGirls', '#38BAB8'],
 ['伊吹翼', 'MillionStars', '#FED552'],
 ['水瀬伊織', '1st Vision', '#FD99E1'],
 ['佐竹美奈子', 'MillionStars', '#58A6DC'],
 ['白菊ほたる', 'CinderellaGirls', '#D162CB'],
 ['早坂美玲', 'CinderellaGirls', '#B72089'],
 ['エミリー', 'MillionStars', '#554171'],
 ['大崎甜花', '283Pro', '#E75BEC'],
 ['馬場このみ', 'MillionStars', '#F1BECB'],
 ['久川凪', 'CinderellaGirls', '#F7A1BA'],
 ['新田美波', 'CinderellaGirls', '#6DBCDB'],
 ['高槻やよい', '1st Vision', '#F39939'],
 ['木下ひなた', 'MillionStars', '#D1342C'],
 ['宮本フレデリカ', 'CinderellaGirls', '#9E1861'],
 ['藤本里奈', 'CinderellaGirls', '#653A2A'],
 ['八宮めぐる', '283Pro', '#FFE012'],
 ['佐々木千枝', 'CinderellaGirls', '#006AB6'],
 ['諸星きらり', 'CinderellaGirls', '#F8CA02'],
 ['五十嵐響子', 'CinderellaGirls', '#F567C6'],
 ['神谷奈緒', 'CinderellaGirls', '#8D75B3'],
 ['秋月律子', '765AS', '#01A860'],
 ['豊川風花', 'MillionStars', '#7278A8'],
 ['北上麗花', 'MillionStars', '#6BB6B0'],
 ['荒木比奈', 'CinderellaGirls', '#80C260'],
 ['大神環', 'MillionStars', '#EE762E'],
 ['結城晴', 'CinderellaGirls', '#45BDB4'],
 ['紅井朱雀', '315ProIdols', '#E63C2E'],
 ['和泉愛依', '283Pro', '#FF00FF'],
 ['握野英雄', '315ProIdols', '#57B3E5'],
 ['二宮飛鳥', 'CinderellaGirls', '#552A7C'],
 ['円城寺道流', '315ProIdols', '#CA9111'],
 ['田中琴葉', 'MillionStars', '#92CFBB'],
 ['岡村直央', '315ProIdols', '#1F1451'],
 ['神楽麗', '315ProIdols', '#3D5AC8'],
 ['水谷絵理', 'DearlyStars', '#00ADB9'],
 ['北沢志保', 'MillionStars', '#AFA690'],
 ['塩見周子', 'CinderellaGirls', '#DEE2EB'],
 ['姫野かのん', '315ProIdols', '#F7B5C4'],
 ['信玄誠司', '315ProIdols', '#78853A'],
 ['如月千早', '1st Vision', '#2743D2'],
 ['二階堂千鶴', 'MillionStars', '#F19557'],
 ['水嶋咲', '315ProIdols', '#FA7EB4'],
 ['多田李衣菜', 'CinderellaGirls', '#006DB2'],
 ['喜多日菜子', 'CinderellaGirls', '#F4D059'],
 ['我那覇響', '765AS', '#01ADB9'],
 ['木村夏樹', 'CinderellaGirls', '#55565A'],
 ['清澄九郎', '315ProIdols', '#79A5DF'],
 ['風野灯織', '283Pro', '#144384'],
 ['秋月律子', '1st Vision', '#01A860'],
 ['渋谷凛', 'CinderellaGirls', '#1C90CD'],
 ['華村翔真', '315ProIdols', '#7664A0'],
 ['篠宮可憐', 'MillionStars', '#B63B40'],
 ['星輝子', 'CinderellaGirls', '#A21D3C'],
 ['星井美希', '765AS', '#B4E04B'],
 ['高垣楓', 'CinderellaGirls', '#33D5AC'],
 ['秋山隼人', '315ProIdols', '#FE6B02'],
 ['卯月巻緒', '315ProIdols', '#F8C559'],
 ['牙崎漣', '315ProIdols', '#AC162A'],
 ['天ヶ瀬冬馬', '315ProIdols', '#F32333'],
 ['橘志狼', '315ProIdols', '#D13037'],
 ['天海春香', '765AS', '#E22B30'],
 ['杜野凛世', '283Pro', '#84C0EA'],
 ['都築圭', '315ProIdols', '#C5A6E2'],
 ['矢吹可奈', 'MillionStars', '#F5AD3B'],
 ['白瀬咲耶', '283Pro', '#006047'],
 ['赤城みりあ', 'CinderellaGirls', '#F8C715'],
 ['桑山千雪', '283Pro', '#FBFBFB'],
 ['三村かな子', 'CinderellaGirls', '#F4ABB4'],
 ['榊夏来', '315ProIdols', '#24CAD2'],
 ['星井美希', '1st Vision', '#B4E04B'],
 ['橘ありす', 'CinderellaGirls', '#5881C1'],
 ['中谷育', 'MillionStars', '#F7E78E'],
 ['伊瀬谷四季', '315ProIdols', '#F125C1'],
 ['中野有香', 'CinderellaGirls', '#CB78B0'],
 ['ロコ', 'MillionStars', '#FFF03C']];

for (let i = 0; i < color_names.length; i++){
  palettes[i] = Object.keys(color_names[i]);
}

