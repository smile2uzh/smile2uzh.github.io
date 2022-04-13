const url = new URL(window.location.href);
const search_params = url.searchParams;

let stufa = search_params.get('stufe');
if (stufa == null || (stufa < 1 || stufa > 4) || !(/^\d+$/.test(stufa))){
	search_params.set("stufe", 1);
	location.href = location.protocol + '//' + location.host + location.pathname+"?"+search_params.toString();
}
let exercise = search_params.get('aufgabe');
if (exercise == null || (exercise < 1 || exercise > 6) || !(/^\d+$/.test(stufa))){
	search_params.set("aufgabe", 1);
	location.href = location.protocol + '//' + location.host + location.pathname+"?"+search_params.toString();
}
$('#button_ex_'+exercise).css('color', '#f97434')

const path_descr = 'data/descriptions/';
const path_ex = 'data/stufe_'+stufa+'/'

$(document).ready(function(){
	$('.exercise-button').on("click", function(){
		let exercise_num = $(this).text().substr(8);
		search_params.set("aufgabe", exercise_num);

		location.href = location.protocol + '//' + location.host + location.pathname+"?"+search_params.toString();
	});
	let modal = document.querySelector('#carouselExampleIndicators');
	let style = window.getComputedStyle(modal);
	let height = parseInt(style.height, 10)/1.3;
	$('#modal-body-record').css('height', height)
});


function reload_carousel() {
	(function modal_loading(){
		$('#modal-loading').modal('show');
	})();
	function append_description(data){
		$('.carousel-inner').append(data);
	}
	function append_exercises(data){
		let to_append = ''
		$.each(data, function(index, el) {
			let content = ''
			if('video' in el){
				console.log('video')
				content = `
						<div class="row mt-2 mb-1 justify-content-md-center align-self-start">
							<div class="col col-lg-6 text-center">
								<h3>`+ el.text +`</h3>
							</div>
						</div>
						<div class="row mb-3 justify-content-md-center align-self-center">
							<div class="col col-lg-6">
								<video oncontextmenu="return false;" width="100%" height='100%' class="input_video_lession" controls controlsList="nodownload"  muted>
									<source src="` + el.video + `" type="video/mp4">
									Your browser does not support the video tag.
								</video>
							</div>
						</div>
				`;
			} else {
				console.log('img')
				content = `
						<div class="row justify-content-md-center align-self-start">
							<div class="col col-12 col-md-3 text-center">
								<h3>` + el.text + `</h3>
							</div>
							<div class="col mb-3 col-12 col-md-6 text-center">
								<img src="` + el.img + `" class="img-fluid rounded mx-auto d-block" alt="...">
							</div>
							<div class="col col-lg-3 text-center"></div>
						</div>
				`;
			}
			let to_append = `
				<div class="carousel-item">
					<div class="container">
						`+content+`
						<div class="row mt-2 justify-content-md-center align-self-end">
							<div class="col col-lg-6 text-center">
								<button type="button" class="btn record-button btn-lg" data-toggle="modal" data-target="#recordModal">Record</button>
							</div>
						</div>
						<div class="row mt-1 justify-content-md-center align-self-end">
							<div class="col col-lg-6 text-center slide-counter">
								?/?
							</div>
						</div>
					</div>
				</div>
			`
			$('.carousel-inner').append(to_append);
		});
	}
	// Load exercise description
	const load_exercise_description = new Promise(function(resolve, reject) {
		$.ajax({
			url: path_descr+"description_"+exercise+".html",
			success: function (data) {
				resolve(data);
			},
			dataType: 'html'
		});
	});
	// Load exercise videos
	const load_exercises = new Promise(function(resolve, reject) {
		$.ajax({
				type: 'GET', 
				url: path_ex+'exercise_'+exercise+'.json', 
				data: { get_param: 'value' }, 
				dataType: 'json',
				success: function (data) {
					resolve(data);
				}
			});
	});

	Promise.all([load_exercise_description, load_exercises]).then((values) => {
		append_description(values[0]);
		append_exercises(values[1]);

		// values.forEach(d => console.log(d))

		options = {
			'interval': false,
			'wrap': false,
			'pause': false,
			'ride': false
		}
		$('.carousel').carousel(options);
		const num_slide = $('.carousel-item').length

		$('.slide-counter').each(function(index,el){
			$(this).text(String(index+2)+'/'+String(num_slide));
		});
		setTimeout(function () {
			$('#modal-loading').modal('hide');
		}, 1000);
	});
}
reload_carousel();
