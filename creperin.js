var scene,ctx,canvas;

var settings = {
	startCountdown : 3, // 開始カウントダウン（秒）
	crepCountTotal : 1, // 総問題数
	crepNumbersCount : 700, // 1回の問題数
	crepLineCountdown : 10, // 1回の問題の制限時間（秒）
	takeHalftime : false, // ハーフ・タイムを取るかどうか
	crepCountHalf : 1, // ハーフ・タイムを取る問題の位置（ < 総問題数）
	crepHalftime : 10, // ハーフタイムの時間（秒）
	questionnaireUrl : 'https://yahoo.co.jp' // アンケート画面のURL
};

// var settings = {
// 	startCountdown : 3, // 開始カウントダウン（秒）
// 	crepCountTotal : 1, // 総問題数
// 	crepNumbersCount : 700, // 1回の問題数
// 	crepLineCountdown : 2, // 1回の問題の制限時間（秒）
// 	takeHalftime : false, // ハーフ・タイムを取るかどうか
// 	crepCountHalf : 1, // ハーフ・タイムを取る問題の位置（ < 総問題数）
// 	crepHalftime : 10, // ハーフタイムの時間（秒）
// 	questionnaireUrl : 'https://yahoo.co.jp' // アンケート画面のURL
// };

//////////////////////////////////////////////////////////////////////////////////
//
// Crep Class
//


/**
 * テスト1行分の
 */
function Crep(){
	
	this.data = []; // 問題になる数字
	this.insert_data = []; // 解答した数字
	this.answer_num = 0; // 解答数
	this.correct_num = 0;　// 正答数
	this.wrong_num = 0; // 誤答数
	this.order = 0; // 現在の問題

	// 問題になる数字を初期化する
	for(var i = 0; i <= settings.crepNumbersCount + 2; i++){
		this.data[i] = Math.floor(Math.random() * 7) + 3;
	}

	//
	this.no_longer_push = false;
}

/**
 * 
 * @param {*} answer 
 */
Crep.prototype.insert_button = function(answer){

	// ガード条件：フラグがONの場合は、なにもしない
	if (this.no_longer_push === true) {
		return;
	}

	// 現在の問題が問題数に達したら、入力を受付ないようにするフラグをON
	if (this.order === settings.crepNumbersCount) {
		this.no_longer_push = true;
	}
	
	// 解答した数字を保存
	this.insert_data[this.order] = answer;

	// 正答を取得
  var correct_answer = (this.data[this.order] + this.data[this.order + 1]) % 10;

	// 解答数、正答数、誤答数をカウント
	this.answer_num ++; // 解答数
	if(correct_answer === answer){
		this.correct_num ++; // 正答数
	}else{
		this.wrong_num ++; // 誤答数
	}

	// 次の問題へ...
	this.order ++;
	
};

/**
 * 問題データから、Canvasに表示する文字列を生成
 * @param {*} order 
 */
Crep.prototype.get_html = function(){

	var str = '';
	var str_1 = '';
	var str_2 = '';
	
	var disp_numbers = ['０','１','２','３','４','５','６','７','８','９'];

	for (var i = 0; i < 20; i++) {
		//6_7
		if (i % 2 === 0) { // 偶数

			var s = this.order - 3 + i / 2;
			str_2 = str_2 + '  ';

			if (s < 0 || s > settings.crepNumbersCount) {
				str_1 = str_1 + '  ';
			}else{
				str_1 = str_1 + disp_numbers[this.data[s]];
			}
			
		} else {

			var s = this.order - 3 + (i - 1) / 2;
			str_1 = str_1 + '　';

			if (s >= 0 && i <= 7) {
				if (i === 7) {
					str_2 = str_2 + '□';
				} else if (s < 0 || s > settings.crepNumbersCount) {
					str_2 = str_2 + '  ';
				} else {
					str_2 = str_2 + disp_numbers[this.insert_data[s]];
				}
			} else {
				str_2 = str_2 + '　';
			}
		}
	}
	str = str + str_1 + '\r\n' + str_2;
	return str;
};


//////////////////////////////////////////////////////////////////////////////////
//
// Main Class
//

/**
 * 
 */
function Main(){
	
	this.mode = 0; // モード
	this.counter = 0;
	this.limit_time = (1000 * settings.startCountdown) - 1;
	
	this.crep_obj = [];
	for (var n = 0; n < settings.crepCountTotal; n++) {
		this.crep_obj.push(new Crep());
	}
	
	this.processing_crep_obj = null;
	this.processing = false;
	
	var contents = $('#templ_main').children().clone();
	this.former_num = -1;
	$('#contents_area').html(contents);

}

/**
 * 
 * @param {*} str 
 */
Main.prototype.writeCanvas = function(str){
	var strs = str.split('\r\n');
	var tmp_ctx = $('#crep_text').get(0).getContext('2d');
	tmp_ctx.fillStyle = '#ffffff';
	tmp_ctx.fillRect(0,0,380,80);
	tmp_ctx.fillStyle = '#555555';
	tmp_ctx.font = "22px 'ＭＳ Ｐゴシック'";
	if(strs.length === 0){
		tmp_ctx.textAlign = 'center';
		tmp_ctx.textBaseline = 'middle';
		tmp_ctx.fillText(strs[0],190,40);
	}else{
		tmp_ctx.textAlign = 'center';
		tmp_ctx.textBaseline = 'bottom';
		tmp_ctx.fillText(strs[0],190,35);
		tmp_ctx.textBaseline = 'top';
		tmp_ctx.fillText(strs[1],190,45);
	}
};

/**
 * ★★★　メインループ　★★★
 */
Main.prototype.loop = function() {

	// 20frame後に処理を行う。もし処理中なら3frame後
	// 補足：　ここについて、理解てきていません。業務システムの開発で見かけたことがないためです。
	if (scene.processing === true) {
		scene.limit_time = scene.limit_time - 2;
		setTimeout(scene.loop, 3);
	} else {
		scene.processing = true;
		setTimeout(scene.loop, 50);
	}
	
	var str = '';

	//描画メソッド
	if (scene.mode === 1 || scene.mode === 3) { // 問題の解答（前半=1, 後半=3)
		//8_7
		str = scene.processing_crep_obj.get_html();
		scene.writeCanvas(str);
		$('#crep_text_unit').html(str);
		
		//制限時間の描画
		// $('#limit_time').html(Math.max(0, Math.floor(1 + scene.limit_time / 1000)) + '  秒');
		
		// str = (scene.processing_crep_obj.order + 1) + ' 問め／' + settings.crepCountTotal + ' 問中';
		// if (scene.former_num !== -1) {
		// 	str += '前回: ' + scene.former_num + ' 問解答';
		// }
		// $('#status').html(str);
		$('#status').html('');

	} else if (scene.mode === 2) { // ハーフタイム

		$('#status').html('休憩してください');
		str = '休憩はあと  ' + Math.floor(1 + scene.limit_time / 1000) + '  秒\r\n任意キーでスキップ';
		scene.writeCanvas(str);
		$('#limit_time').html('　');

	} else if (scene.mode === 0) { // 開始のカウントダウン

		$('#status').html('準備してください');
		str = 'スタートまで\r\n' + Math.floor(1 + scene.limit_time / 1000) + '  秒';
		scene.writeCanvas(str);
		$('#limit_time').html('　');

	}

	// 
	// カウントダウン、シーン遷移
	// 
	scene.limit_time = scene.limit_time - 50;

	// 各シーンの制限時間が無くなったら、次のシーンに遷移
	if (scene.limit_time <= 0) {

		switch (scene.mode) {
			case 0: // 開始のカウントダウン
				if (settings.takeHalftime === true) {
					scene.mode = 1;
				} else {
					scene.mode = 3;
				}
				scene.limit_time = 1000 * settings.crepLineCountdown;
				scene.processing_crep_obj = scene.crep_obj[scene.counter];
				break;
			case 1: // 問題の解答
				scene.counter ++;
				if (scene.counter === settings.crepCountHalf) {
					scene.mode = 2;
					scene.limit_time = 1000 * settings.crepHalftime;
				} else {
					scene.limit_time = 1000 * settings.crepLineCountdown;					
				}
				scene.processing_crep_obj = scene.crep_obj[scene.counter];
				break;
			case 2: // ハーフ・タイム
				scene.limit_time = 1000 * settings.crepLineCountdown;
				scene.mode = 3;
				scene.processing_crep_obj = scene.crep_obj[scene.counter];
				break;			
			case 3: // 問題の解答
				scene.counter ++;
				if (scene.counter === settings.crepCountTotal) {
					scene.mode = 4;
					scene = new Finish_scene(scene.crep_obj);
					scene.processing = false;
					return;
				} else {
					scene.limit_time = 1000 * settings.crepLineCountdown;
				}
				scene.processing_crep_obj = scene.crep_obj[scene.counter];
				break;
		}

		// if (scene.mode === 0 || scene.mode === 2) {
		// 	scene.limit_time = 1000 * crepLineCountdown;
		// 	scene.mode ++;
		// 	scene.processing_crep_obj = scene.crep_obj[scene.counter];
		// } else if (scene.mode === 1 || scene.mode === 3) {
		// 	// scene.former_num = scene.processing_crep_obj.order;
		// 	scene.counter ++;
		// 	if (scene.counter === crepCountHalf || scene.counter === crepCountTotal) {
		// 		scene.mode ++;
		// 		scene.limit_time = 1000 * crepHalftime;
		// 		if (scene.mode === 4) {
		// 			scene = new Finish_scene(scene.crep_obj);
		// 			scene.processing = false;
		// 			return;
		// 		}
		// 	} else {
		// 		scene.limit_time = 1000 * crepLineCountdown;
		// 	}
		// 	scene.processing_crep_obj = scene.crep_obj[scene.counter];
		// }
	}

	scene.processing = false;

}

/**
 * 画面にある 0 - 9 ボタンのイベント・ハンドラー
 * @param {*} num 
 */
Main.prototype.insert_button = function(answer){
	if　(this.mode === 2) {
		this.limit_time = -1;
	}else{
		this.processing_crep_obj.insert_button(answer);
	}
};


//////////////////////////////////////////////////////////////////////////////////
//
// Finish_scene Class
//

/**
 * 
 * @param {*} send_data 
 */
function Finish_scene(send_data){
	let crep_obj = send_data;
	
	/*
	var formar_right_data = [];
	var later_right_data = [];
	var formar_wrong_data = [];
	var later_wrong_data = [];
	for (var i = 0; i < crepCountHalf; i++) {
		formar_right_data[i] = crep_obj[i].correct_num;
		formar_wrong_data[i] = crep_obj[i].wrong_num;
		later_right_data[i] = crep_obj[i+crepCountHalf].correct_num;
		later_wrong_data[i] = crep_obj[i+crepCountHalf].wrong_num;
	}
	*/
	// console.log(send_data);
	// console.log(later_wrong_data);
	
	let result_answer_total = 0;  // 解答数
	let result_correct_total = 0; // 正答数
	let result_correct_rate = 0;  // 正答率

	for (var n = 0; n < settings.crepCountTotal; n++) {
		result_answer_total = result_answer_total + crep_obj[n].answer_num;
		result_correct_total = result_correct_total + crep_obj[n].correct_num;
	}

	if (result_answer_total > 0) {
		// result_correct_rate = Math.floor(result_correct_total / result_answer_total);
		result_correct_rate = Math.floor((result_correct_total / result_answer_total) * 100);

	}
	// 
	let contents = $('#templ_result').children().clone();
	$('#contents_area').html(contents);
	//let result_answer_total_str = '1' + zeroPadding(result_answer_total, 3) + zeroPadding(result_correct_total, 3) + zeroPadding(result_correct_rate, 3);
	//var result = '解答数=' + result_answer_total + ', 正答数=' + result_correct_total + ', 正答率(%)=' + result_correct_rate;
	
	let result_cd = creEncrypt(result_answer_total, result_correct_total, result_correct_rate); //doConvert(result_answer_total) + ':' + doConvert(result_correct_total) + ':' + doConvert(result_correct_rate);

	// let test = '';
	// //test = test + '@解答数=' + result_answer_total + ', 正答数=' + result_correct_total + ', 正答率(%)=' + result_correct_rate;
	// test = test + '@' + creDecrypt(result_cd);
	// result_cd = result_cd + test;
	// let test = '';
	// test = test + '@' + creEncrypt(999,999,100);
	// result_cd = result_cd + test;
	// let test = '';
	// test = test + '@' + creTest('cre:nqvunyct');
	// test = test + '@' + creDecrypt('cre:nqvunyct');
	// result_cd = result_cd + test;
	/*
	var result_cd = 'R:' + JSON.stringify({ 
		at : result_answer_total,
		ct : result_correct_total,
		cr : result_correct_rate
	});
  */
	
	$('#result_code').val(result_cd);

	/*
	$('#result_answer_total').text(result_answer_total);
	$('#result_correct_total').text(result_correct_total);
	$('#result_correct_rate').text(result_correct_rate + '%');
	$('#result_questionnaire_url').attr('href', settings.questionnaireUrl);
	*/

	setTimeout(() => {
		$('#result_buttons').css('display', '');
	}, 2000);

	//calcu_result(formar_right_data,later_right_data,formar_wrong_data,later_wrong_data);
}

/*
const base = "NOPQRSTUVWXYZABCDEFGHIJKLM";

function doConvert(indata) {
	const nn = base.length;
	let data = indata;
	let indexes = [];
	while (true) {
		var data2 = Math.floor(data / nn);
		var index = data % nn
		indexes.push(index);
		if (data2 == 0) {
			break;
		}
		data = data2;
	}
	var ret='';
	for (var n = indexes.length ; n >= 0; n--) {
		ret = ret + base.charAt(indexes[n]);
	}
	return ret;
}
function doConvert10(indata) {
	const nn = base.length;
	let data1 = indata;
	let ret = 0;
	for (var n = 0; n < data1.length; n++) {
		var data2 = base.indexOf(data1.charAt(n));
		ret = data2 + (ret * nn);
	}
	return ret;
}
*/

// 見えないように暗号化 ////////////////////////////////////////////////////////////
let base = "NOPQRSTUVWXYZABCDEFGHIJKLM";
function creTest(str) {
	str = String(str).toUpperCase();
  //console.log(str);
	let reg = new RegExp('^CRE:[' + base + ']+$');
	return reg.test(str);
}
function creGetCode(str) {
	//let reg = new RegExp('^CRE:[' + base + ']+$');
	let ret = '';
	str = str.toUpperCase();
	if (creTest(str) === true) {
		var prefix = str.substring(0, 4).toUpperCase();
		var code = str.substring(5,str.length).toUpperCase();
		ret = code;
	}
	return ret;
}
function creEncrypt(at,ct,cr) {
	indata = '1' + zeroPadding(at, 3) + zeroPadding(ct, 3) + zeroPadding(cr, 3);
	//console.log('***' + indata);
	const nn = base.length;
	let data = indata;
	let indexes = [];
	while (true) {
		var data2 = Math.floor(data / nn);
		var index = data % nn
		indexes.push(index);
		if (data2 === 0) {
			break;
		}
		data = data2;
	}
	var ret='';
	for (var n = indexes.length ; n >= 0; n--) {
		ret = ret + base.charAt(indexes[n]);
	}
	return 'CRE:' + ret;
}
function creDecrypt(indata) {
	//console.log('***' + indata);
	const nn = base.length;
	let data1 = indata;
	let cal = 0;
	let ret = ''
	data1 = creGetCode(data1);
	if (data1.length === 0) {
		return ret;
	}
	for (var n = 0; n < data1.length; n++) {
		var data2 = base.indexOf(data1.charAt(n));
		cal = data2 + (cal * nn);
	}
	let at = parseInt(cal.toString().substr(1, 3), 10);
	let ct = parseInt(cal.toString().substr(4, 3), 10);
	let cr = parseInt(cal.toString().substr(7, 3), 10);
	// console.log('***at' + at);
	// console.log('***ct' + ct);
	// console.log('***cr' + cr);
	ret = '解答数=' + at + ', 正答数=' + ct + ', 正答率(%)=' + cr;
	//console.log('***' + ret);
	return ret;
}
function zeroPadding(num, len){
	return ( Array(len).join('0') + num ).slice( -len );
}
// 見えないように暗号化 ////////////////////////////////////////////////////////////

/**
 * 
 */
Finish_scene.prototype.click = function(){
	scene = new Title();
};

/**
 * 
 */
Finish_scene.prototype.loop = function(){
	//もう何もしません
};


//////////////////////////////////////////////////////////////////////////////////
//
// Title Class
//

/**
 * 
 */
function Title(){
	var contents = $('#templ_title').children().clone();
	$('#contents_area').html(contents);
}

/**
 * 
 * @param {*} hash 
 */
Title.prototype.gohash = function(hash){
	location.hash = hash;
};

/**
 * 
 */
Title.prototype.next = function(){
	scene = new Main();
	scene.loop();
}


//////////////////////////////////////////////////////////////////////////////////
//
// Title Instance
//

scene = new Title();
